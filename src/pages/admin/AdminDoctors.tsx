import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlusIcon } from '@heroicons/react/24/solid';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export const AdminDoctors: React.FC = () => {
    const [doctors, setDoctors] = useState<User[]>([]);
    const [newDoctor, setNewDoctor] = useState({ name: '', email: '', password: '' });
    const [createMsg, setCreateMsg] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
            setDoctors(res.data.filter((u: User) => u.role === 'DOCTOR'));
        } catch (error) { console.error(error); }
    };

    const handleCreateDoctor = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateMsg('');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/users`, newDoctor);
            setCreateMsg('Doctor created successfully!');
            setNewDoctor({ name: '', email: '', password: '' });
            fetchDoctors();
        } catch (err: any) {
            setCreateMsg('Error creating doctor.');
        }
    };

    return (
        <div className="grid md:grid-cols-3 gap-8">
            {/* List */}
            <div className="md:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    <UserPlusIcon className="w-6 h-6 text-blue-500" /> Existing Doctors
                </h2>
                <div className="grid gap-4">
                    {doctors.map(d => (
                        <div key={d.id} className="p-4 bg-gray-700/50 rounded-lg flex justify-between items-center border border-gray-600 hover:border-gray-500 transition">
                            <div>
                                <div className="font-bold text-white text-lg">{d.name}</div>
                                <div className="text-gray-400 text-sm">{d.email}</div>
                            </div>
                            <span className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded text-xs font-bold uppercase border border-blue-800">
                                {d.role}
                            </span>
                        </div>
                    ))}
                    {doctors.length === 0 && <div className="text-gray-500 text-center py-8">No doctors found.</div>}
                </div>
            </div>

            {/* Create Form */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 h-fit">
                <h2 className="text-xl font-bold mb-6 text-white border-b border-gray-600 pb-2">Create New Account</h2>
                <form onSubmit={handleCreateDoctor} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm text-gray-400">Name</label>
                        <input type="text" value={newDoctor.name} onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })} className="w-full px-3 py-2 bg-gray-700 rounded text-white focus:ring-2 focus:ring-blue-500 border border-gray-600 outline-none" required />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm text-gray-400">Email</label>
                        <input type="email" value={newDoctor.email} onChange={e => setNewDoctor({ ...newDoctor, email: e.target.value })} className="w-full px-3 py-2 bg-gray-700 rounded text-white focus:ring-2 focus:ring-blue-500 border border-gray-600 outline-none" required />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm text-gray-400">Password</label>
                        <input type="password" value={newDoctor.password} onChange={e => setNewDoctor({ ...newDoctor, password: e.target.value })} className="w-full px-3 py-2 bg-gray-700 rounded text-white focus:ring-2 focus:ring-blue-500 border border-gray-600 outline-none" required />
                    </div>
                    <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-bold text-white transition-all transform active:scale-95 shadow-lg">
                        Create Account
                    </button>
                </form>
                {createMsg && <div className={`mt-4 text-center font-bold ${createMsg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{createMsg}</div>}
            </div>
        </div>
    );
};
