import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
            login(res.data.access_token, res.data.user);
            if (res.data.user.role === 'ADMIN') {
                navigate('/admin/progress');
            } else {
                navigate('/doctor/dashboard');
            }
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-teal-400 mb-6">Annotation Tool</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="text-red-500 text-center">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-linear-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 rounded font-bold transition-transform transform active:scale-95"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};
