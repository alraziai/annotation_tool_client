import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:3000/cases/assigned').then(res => setBatches(res.data));
    }, []);

    const startReview = (batch: Batch) => {
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
        alert("All cases in this batch are reviewed!");
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
                                        disabled={isComplete}
                                        className={`w-full py-3 rounded-lg font-bold text-white transition-all transform active:scale-95 flex items-center justify-center gap-2
                                            ${isComplete ? 'bg-gray-700 cursor-not-allowed text-gray-500' : 'bg-linear-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-lg'}`}
                                    >
                                        {isComplete ? 'Review Completed' : 'Start / Continue Review'}
                                        {!isComplete && <span>&rarr;</span>}
                                    </button>
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
        </div>
    );
};
