
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ImageMagnifier from '../components/ImageMagnifier';
import { ReviewSidebar } from '../components/ReviewSidebar';
import { ReviewDetailsPanel } from '../components/ReviewDetailsPanel';
import { Bars3Icon } from '@heroicons/react/24/solid';

export const ReviewCase: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Data State
    const [instance, setInstance] = useState<any>(null); // The one from URL, prevents 404
    const [batchInstances, setBatchInstances] = useState<any[]>([]);

    // Derived State
    const [siblings, setSiblings] = useState<any[]>([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Form State: Map instanceId -> Review Data
    const [reviews, setReviews] = useState<Record<string, { status: boolean | null, comment: string }>>({});

    // Image Path (from the primary instance)
    const imgUrl = (instance && instance.case?.imagePath) ? `http://localhost:3000/uploads/${instance.case.imagePath}` : null;

    // 1. Load Primary Instance & Batch Data
    useEffect(() => {
        const loadInstanceAndBatch = async () => {
            setLoading(true);
            try {
                // A. Load specific instance from URL to get context
                const res = await axios.get(`http://localhost:3000/cases/instance/${id}`);
                setInstance(res.data);
                const currentCaseId = res.data.case.id;

                // B. Ensure we have the full batch loaded to find siblings
                let currentBatchInstances = batchInstances;
                if (batchInstances.length === 0 || (batchInstances[0] && batchInstances[0].case?.batchId !== res.data.case.batchId)) {
                    const resBatches = await axios.get('http://localhost:3000/cases/assigned');
                    const myBatch = resBatches.data.find((b: any) => b.id === res.data.case.batchId);
                    if (myBatch) {
                        const all: any[] = [];
                        myBatch.cases.forEach((c: any) => {
                            c.instances.forEach((inst: any) => {
                                // Flatten, but preserve caseId for grouping
                                all.push({ ...inst, originalImageId: c.originalImageId, caseId: c.id });
                            });
                        });
                        setBatchInstances(all);
                        currentBatchInstances = all;
                    }
                }

                // C. Find Siblings (All instances in this case)
                const caseSiblings = currentBatchInstances.filter((inst: any) => inst.caseId === currentCaseId);
                // Sort by instance number to be tidy
                caseSiblings.sort((a, b) => (a.instanceNumber || 0) - (b.instanceNumber || 0));
                setSiblings(caseSiblings);

                // D. Initialize Reviews State for ALL siblings
                const initReviews: Record<string, any> = {};
                caseSiblings.forEach(inst => {
                    // Check existing reviews in the loaded data
                    // Note: 'inst' from batchInstances might have stale reviews if we didn't just fetch it,
                    // but 'res.data' has fresh reviews for at least the current ID.
                    // The safest usage is to trust batch data but maybe overlay current instance data if needed.
                    // For now, we trust batch data which comes from /cases/assigned.
                    // Ideally, we'd merge, but let's stick to the batch data for consistency.

                    const myReview = inst.reviews?.find((r: any) => r.reviewerId === user?.id);
                    initReviews[inst.id] = myReview
                        ? { status: myReview.status, comment: myReview.comment || '' }
                        : { status: null, comment: '' };
                });
                setReviews(initReviews);

            } catch (error) {
                console.error("Failed to load instance", error);
            } finally {
                setLoading(false);
            }
        };

        if (id && user) loadInstanceAndBatch();
    }, [id, user]);


    // Update local batch list visuals
    const updateLocalReviewStatus = (instanceId: string, status: boolean) => {
        setBatchInstances(prev => prev.map(inst => {
            if (inst.id === instanceId) {
                const newReview = { reviewerId: user?.id, status };
                const cleanReviews = inst.reviews?.filter((r: any) => r.reviewerId !== user?.id) || [];
                return { ...inst, reviews: [...cleanReviews, newReview] };
            }
            return inst;
        }));
    };

    const handleSetReview = (instanceId: string, data: { status: boolean | null, comment: string }) => {
        setReviews(prev => ({ ...prev, [instanceId]: data }));
    };

    const submit = async () => {
        setSubmitting(true);
        try {
            // 1. Submit all reviews in parallel
            await Promise.all(siblings.map(inst => {
                const r = reviews[inst.id];
                if (r && r.status !== null) {
                    // Update visual state locally
                    updateLocalReviewStatus(inst.id, r.status);
                    // Send to API
                    return axios.post(`http://localhost:3000/cases/instance/${inst.id}/review`, r);
                }
                return Promise.resolve();
            }));

            // 2. Determine Next Case
            // We want the first instance of a Case that has NOT been fully reviewed.
            // "Fully reviewed" = all instances in that case have a review by me.
            // We need to re-evaluate based on the JUST UPDATED reviews.
            // Since setBatchInstances is async, we calculate based on current batchInstances + our local updates.

            // Get IDs we just reviewed
            const justReviewedIds = new Set(siblings.map(s => s.id));

            // Find candidates in batch (excluding what we just finished if it's done)
            // Actually, simplest is to just scan the array for the first grouped case that has a missing review.

            let nextInstanceId = null;
            const distinctCaseIds = Array.from(new Set(batchInstances.map(b => b.caseId)));

            for (const cId of distinctCaseIds) {
                const caseInsts = batchInstances.filter(b => b.caseId === cId);
                const needsReview = caseInsts.some(inst => {
                    // If it's one we just submitted, assume it's done (status comes from 'reviews' state)
                    if (justReviewedIds.has(inst.id)) return false; // We just did it
                    // Otherwise check existing reviews
                    return !inst.reviews?.some((r: any) => r.reviewerId === user?.id);
                });

                if (needsReview) {
                    // This case needs review. Use its first unreviewed instance (or just first instance) as key
                    const firstUnreviewed = caseInsts.find(inst => !inst.reviews?.some((r: any) => r.reviewerId === user?.id));
                    if (firstUnreviewed) {
                        nextInstanceId = firstUnreviewed.id;
                        break;
                    }
                }
            }

            if (nextInstanceId) {
                navigate(`/doctor/review/${nextInstanceId}`);
            } else {
                alert("Batch Completed!");
                navigate('/doctor/dashboard');
            }

        } catch (error) {
            console.error(error);
            alert("Failed to submit reviews.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!instance && loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
            <div className="text-2xl animate-pulse">Loading Case...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col h-screen font-sans overflow-hidden">
            {/* Header */}
            <header className="bg-gray-800 p-2 shadow-lg flex justify-between items-center z-20 border-b border-gray-700 shrink-0 h-14">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 hover:bg-gray-700 rounded text-gray-400 focus:outline-none"
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <button onClick={() => navigate('/doctor/dashboard')} className="text-gray-400 hover:text-white transition text-sm">
                        &larr; Dashboard
                    </button>
                </div>

                <div className="text-center absolute left-1/2 transform -translate-x-1/2">
                    {instance && (
                        <h1 className="text-lg font-bold text-teal-400">{instance.case.originalImageId}</h1>
                    )}
                </div>
                <div className="w-32"></div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">

                {/* Sidebar Component */}
                <ReviewSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    batchInstances={batchInstances}
                    currentId={id}
                    userId={user?.id}
                    onNavigate={(newId) => navigate(`/doctor/review/${newId}`)}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col md:flex-row min-w-0 bg-black">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80 text-teal-500">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <span>Loading Image...</span>
                            </div>
                        </div>
                    ) : null}

                    {/* Image Area - Centered and Maximized */}
                    <div className="flex-1 relative flex items-center justify-center overflow-y-scroll overflow-x-hidden cursor-zoom-in bg-black">
                        {imgUrl ? (
                            <ImageMagnifier
                                src={imgUrl}
                                alt="X-Ray"
                                className="max-h-full max-w-full object-contain shadow-2xl"
                                zoomLevel={4}
                                magnifierHeight={300}
                                magnifierWidth={300}
                            />
                        ) : (
                            !loading && <div className="text-gray-600">No Image</div>
                        )}
                    </div>

                    {/* Details Panel Component */}
                    <ReviewDetailsPanel
                        instances={siblings}
                        reviews={reviews}
                        setReview={handleSetReview}
                        submit={submit}
                        submitting={submitting}
                    />
                </div>
            </div>
        </div>
    );
};
