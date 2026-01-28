import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MagnifyingGlassIcon, XMarkIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import toast, { Toaster } from 'react-hot-toast';

interface AdminStat {
    id: string;
    doctorName: string;
    batchName: string;
    total: number;
    reviewed: number;
    progress: number;
    assignedAt: string;
    completedAt?: string | null;
    isLocked?: boolean;
}

interface DetailedReview {
    caseId: string;
    originalImageId: string;
    instanceNumber: string;
    condition: string;
    location: string | null;
    area: number | null;
    detected: boolean;
    status: boolean | null;
    comment: string;
    reviewedAt: string;
}

export const AdminProgress: React.FC = () => {
    const [stats, setStats] = useState<AdminStat[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState<AdminStat | null>(null);
    const [detailedReviews, setDetailedReviews] = useState<DetailedReview[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/cases/admin/stats`);
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleViewDetails = async (stat: AdminStat) => {
        setSelectedAssignment(stat);
        setLoadingDetails(true);
        try {
            // Fetch detailed reviews for this assignment
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/cases/admin/assignment/${stat.id}/reviews`);
            setDetailedReviews(res.data);
        } catch (err) {
            console.error('Failed to fetch review details:', err);
            setDetailedReviews([]);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setSelectedAssignment(null);
        setDetailedReviews([]);
    };

    const handleDownloadExcel = async (stat: AdminStat) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/cases/admin/assignment/${stat.id}/export`,
                { responseType: 'blob' }
            );
            
            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${stat.doctorName}-${stat.batchName}-reviews.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download Excel:', err);
            toast.error('Failed to download Excel file');
        }
    };

    const filteredStats = stats.filter(s =>
        s.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.batchName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
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
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold text-white">Progress Overview</h2>

                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search doctor or batch..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 rounded-lg text-white border border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500 animate-pulse">Loading statistics...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-700 text-gray-400 text-sm uppercase tracking-wider">
                                <th className="p-4 font-bold">Doctor</th>
                                <th className="p-4 font-bold">Batch</th>
                                <th className="p-4 font-bold">Progress</th>
                                <th className="p-4 font-bold text-center">Completion</th>
                                <th className="p-4 font-bold text-center">Status</th>
                                <th className="p-4 font-bold text-right">Assigned Date</th>
                                <th className="p-4 font-bold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredStats.map(stat => (
                                <tr key={stat.id} className="hover:bg-gray-700/50 transition">
                                    <td className="p-4 font-bold text-white">{stat.doctorName}</td>
                                    <td className="p-4 text-gray-300">
                                        <span className="bg-gray-700 px-2 py-1 rounded text-xs border border-gray-600 whitespace-nowrap inline-block">
                                            {stat.batchName}
                                        </span>
                                    </td>
                                    <td className="p-4 w-1/3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                                                <div
                                                    className={`h-full transition-all duration-500 ${stat.progress === 100 ? 'bg-green-500' : 'bg-linear-to-r from-teal-500 to-blue-500'}`}
                                                    style={{ width: `${stat.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold w-12 text-right">{stat.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap inline-block ${stat.reviewed === stat.total ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-blue-900/50 text-blue-400 border border-blue-800'}`}>
                                            {stat.reviewed} / {stat.total}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {stat.isLocked ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-900/50 text-purple-400 border border-purple-800 inline-flex items-center gap-1 whitespace-nowrap">
                                                🔒 Locked
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-900/50 text-yellow-400 border border-yellow-800 whitespace-nowrap inline-block">
                                                In Progress
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right text-gray-500 text-sm font-mono">
                                        {new Date(stat.assignedAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center gap-2 justify-center">
                                            <button
                                                onClick={() => handleViewDetails(stat)}
                                                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDownloadExcel(stat)}
                                                disabled={!stat.isLocked}
                                                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                                    stat.isLocked 
                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                }`}
                                                title={!stat.isLocked ? 'Doctor must mark assignment as complete to download' : 'Download Excel report'}
                                            >
                                                <ArrowDownTrayIcon className="w-4 h-4" />
                                                Download
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredStats.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                                        No matching records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for Detailed Reviews */}
            {selectedAssignment && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-6xl w-full max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Review Details</h3>
                                <p className="text-gray-400 mt-1">
                                    <span className="font-semibold text-teal-400">{selectedAssignment.doctorName}</span> - {selectedAssignment.batchName}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-white"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingDetails ? (
                                <div className="text-center py-12 text-gray-500 animate-pulse">Loading review details...</div>
                            ) : detailedReviews.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">No reviews found for this assignment.</div>
                            ) : (
                                <div className="space-y-4">
                                    {detailedReviews.map((review) => (
                                        <div key={`${review.caseId}-${review.instanceNumber}`} className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                                        {review.originalImageId}
                                                        <span className="text-xs text-gray-500 font-normal">
                                                            Instance #{review.instanceNumber}
                                                        </span>
                                                    </h4>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        Reviewed on {new Date(review.reviewedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${review.detected ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-green-900/50 text-green-400 border border-green-800'}`}>
                                                        AI: {review.detected ? 'POSITIVE' : 'NEGATIVE'}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${review.status === true ? 'bg-green-900/50 text-green-400 border border-green-800' : review.status === false ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-gray-700 text-gray-400 border border-gray-600'}`}>
                                                        Doctor: {review.status === true ? 'CORRECT' : review.status === false ? 'INCORRECT' : 'NOT REVIEWED'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Condition</label>
                                                    <div className="text-white font-medium">{review.condition}</div>
                                                </div>
                                                {review.location && (
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                                                        <div className="text-white font-medium">{review.location}</div>
                                                    </div>
                                                )}
                                                {review.area !== null && review.area !== 0 && (
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase">Area</label>
                                                        <div className="text-white font-medium">{review.area}</div>
                                                    </div>
                                                )}
                                            </div>

                                            {review.comment && (
                                                <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
                                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Doctor's Comment</label>
                                                    <p className="text-white text-sm">{review.comment}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-700 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
