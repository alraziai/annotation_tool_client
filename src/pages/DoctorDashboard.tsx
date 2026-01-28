import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

interface Review {
    reviewerId: string;
}
interface CaseInstance {
    id: string;
    reviews: Review[];
}
interface Case {
    instances: CaseInstance[];
}
interface Batch {
    id: string;
    name: string;
    createdAt: string;
    cases: Case[];
}

export const DoctorDashboard: React.FC = () => {
    const { logout, user } = useAuth();
    const [batches, setBatches] = useState<Batch[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/cases/assigned`).then(res => setBatches(res.data));
    }, []);

    const startReview = (batch: Batch) => {
        // First, check for any unreviewed instances
        for (const c of batch.cases) {
            for (const inst of c.instances) {
                console.log(`Checking instance ${inst.id}`, inst.reviews, user?.id);
                const isReviewed = inst.reviews?.some((r: any) => r.reviewerId === user?.id);
                if (!isReviewed) {
                    console.log(`Found unreviewed instance: ${inst.id}`);
                    navigate(`/doctor/review/${inst.id}`);
                    return;
                }
            }
        }
        
        // If all cases are reviewed, navigate to the first case for editing
        if (batch.cases.length > 0 && batch.cases[0].instances.length > 0) {
            navigate(`/doctor/review/${batch.cases[0].instances[0].id}`);
        }
    };

    const markAsComplete = async (batchId: string) => {
        setSelectedBatchId(batchId);
        setShowModal(true);
    };

    const confirmMarkAsComplete = async () => {
        if (!selectedBatchId) return;
        
        setIsCompleting(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/cases/assignment/${selectedBatchId}/complete`);
            toast.success('Assignment marked as complete and locked!');
            setShowModal(false);
            setSelectedBatchId(null);
            // Refresh the batch list
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/cases/assigned`);
            setBatches(res.data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to mark assignment as complete');
        } finally {
            setIsCompleting(false);
        }
    };

    const cancelMarkAsComplete = () => {
        setShowModal(false);
        setSelectedBatchId(null);
    };

    const getStats = (batch: Batch) => {
        let total = 0;
        let reviewed = 0;
        batch.cases.forEach(c => {
            c.instances.forEach(inst => {
                total++;
                if (inst.reviews?.some((r: any) => r.reviewerId === user?.id)) {
                    reviewed++;
                }
            });
        });
        return { total, reviewed, pending: total - reviewed };
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 5000,
                    style: {
                        background: '#1f2937',
                        color: '#f3f4f6',
                        border: '1px solid #374151',
                    },
                    success: {
                        duration: 5000,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#f3f4f6',
                        },
                    },
                    error: {
                        duration: 6000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#f3f4f6',
                        },
                    },
                }}
            />
            <nav className="bg-gray-800 p-4 flex justify-between items-center shadow-lg border-b border-gray-700">
                <h1 className="text-xl font-bold bg-linear-to-r from-teal-400 to-blue-500 text-transparent bg-clip-text">Doctor Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-300">Hello {user?.name}!</span>
                    <button onClick={logout} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition">Logout</button>
                </div>
            </nav>
            <div className="p-8 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-white border-l-4 border-teal-500 pl-4">Your Assigned Batches</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {batches.map(batch => {
                        const stats = getStats(batch);
                        const isComplete = stats.pending === 0;
                        return (
                            <div key={batch.id} className="bg-gray-800 rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow border border-gray-700">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-teal-300">{batch.name}</h3>
                                            <p className="text-sm text-gray-400">{new Date(batch.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${isComplete ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                            {isComplete ? 'Completed' : 'In Progress'}
                                        </span>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm mb-1 text-gray-400">
                                            <span>Progress</span>
                                            <span>{stats.reviewed} / {stats.total}</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                                            <div className="bg-teal-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(stats.reviewed / (stats.total || 1)) * 100}%` }}></div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => startReview(batch)}
                                        className="w-full py-3 rounded-lg font-bold text-white transition-all transform active:scale-95 flex items-center justify-center gap-2 bg-linear-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-lg"
                                    >
                                        {isComplete ? 'Review / Edit Cases' : 'Start / Continue Review'}
                                        <span>&rarr;</span>
                                    </button>
                                    
                                    {isComplete && (
                                        <button
                                            onClick={() => markAsComplete(batch.id)}
                                            className="w-full py-3 rounded-lg font-bold text-white transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-2 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                                        >
                                            Mark as Complete & Lock
                                            <span>🔒</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {batches.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-gray-800 rounded-lg border border-gray-700 border-dashed">
                            <p className="text-gray-400 text-lg">No tasks assigned yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700 transform transition-all">
                        <div className="p-6">
                            {/* Icon */}
                            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-yellow-900/30 rounded-full mb-4">
                                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-white text-center mb-2">
                                Mark Assignment as Complete?
                            </h3>

                            {/* Description */}
                            <p className="text-gray-400 text-center mb-6">
                                Once you mark this assignment as complete, you will <strong className="text-red-400">no longer be able to review or modify</strong> any cases in this batch. This action cannot be undone.
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={cancelMarkAsComplete}
                                    disabled={isCompleting}
                                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmMarkAsComplete}
                                    disabled={isCompleting}
                                    className="flex-1 px-4 py-3 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isCompleting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Confirm & Lock
                                            <span>🔒</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
