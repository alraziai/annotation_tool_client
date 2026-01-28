import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: string;
    name: string;
    role: string;
}

interface Batch {
    id: string;
    name: string;
    createdAt: string;
}

export const AdminAssignments: React.FC = () => {
    const [doctors, setDoctors] = useState<User[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
    const [assignMsg, setAssignMsg] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const [dRes, bRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/users`),
                    axios.get(`${import.meta.env.VITE_API_URL}/cases/batches`)
                ]);
                setDoctors(dRes.data.filter((u: User) => u.role === 'DOCTOR'));
                setBatches(bRes.data);
            } catch (e) { console.error(e); }
        };
        fetch();
    }, []);

    const toggleDoctorSelect = (id: string) => {
        setSelectedDoctors(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        setAssignMsg('');
        if (!selectedBatch || selectedDoctors.length === 0) return;

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/cases/assign`, {
                batchId: selectedBatch,
                doctorIds: selectedDoctors
            });
            setAssignMsg('Assignment successful!');
            setSelectedDoctors([]);
            setSelectedBatch('');
        } catch (err) {
            setAssignMsg('Assignment failed.');
        }
    };

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-white border-b border-gray-600 pb-4">Assign Batches</h2>
            <form onSubmit={handleAssign} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Batches Column */}
                    <div>
                        <h3 className="text-lg font-bold text-teal-400 mb-4 uppercase tracking-wider">1. Select Batch</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-teal-700">
                            {batches.map(b => (
                                <div
                                    key={b.id}
                                    onClick={() => setSelectedBatch(b.id)}
                                    className={`p-4 rounded-lg border cursor-pointer transition flex flex-col gap-1
                                        ${selectedBatch === b.id
                                            ? 'border-teal-500 bg-teal-900/30 ring-1 ring-teal-500'
                                            : 'border-gray-600 bg-gray-700/30 hover:bg-gray-700 hover:border-gray-500'}`}
                                >
                                    <div className="font-bold text-white">{b.name}</div>
                                    <div className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</div>
                                </div>
                            ))}
                            {batches.length === 0 && <p className="text-gray-500 italic">No batches uploaded yet.</p>}
                        </div>
                    </div>

                    {/* Doctors Column */}
                    <div>
                        <h3 className="text-lg font-bold text-blue-400 mb-4 uppercase tracking-wider">2. Select Doctors</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-700">
                            {doctors.map(d => (
                                <div
                                    key={d.id}
                                    onClick={() => toggleDoctorSelect(d.id)}
                                    className={`p-4 rounded-lg border cursor-pointer transition flex justify-between items-center
                                        ${selectedDoctors.includes(d.id)
                                            ? 'border-blue-500 bg-blue-900/30 ring-1 ring-blue-500'
                                            : 'border-gray-600 bg-gray-700/30 hover:bg-gray-700 hover:border-gray-500'}`}
                                >
                                    <span className="font-medium text-white">{d.name}</span>
                                    {selectedDoctors.includes(d.id) && <span className="text-blue-400 font-bold">✓</span>}
                                </div>
                            ))}
                            {doctors.length === 0 && <p className="text-gray-500 italic">No doctors available.</p>}
                        </div>
                    </div>
                </div>

                <button
                    disabled={!selectedBatch || selectedDoctors.length === 0}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-bold text-white text-xl transition-all shadow-lg active:scale-[0.98]"
                >
                    Confirm Assignment
                </button>
            </form>
            {assignMsg && (
                <div className={`mt-6 p-4 rounded-lg text-center font-bold animate-fade-in ${assignMsg.includes('successful') ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                    {assignMsg}
                </div>
            )}
        </div>
    );
};
