import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChartBarIcon, UserGroupIcon, CloudArrowUpIcon, ClipboardDocumentCheckIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

export const AdminLayout: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
            <nav className="bg-gray-800 p-4 shadow-lg border-b border-gray-700">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <h1 className="text-xl font-bold bg-linear-to-r from-teal-400 to-blue-500 text-transparent bg-clip-text">
                            Admin Dashboard
                        </h1>
                        <div className="flex gap-4">
                            <NavLink
                                to="/admin/upload"
                                className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded transition ${isActive ? 'bg-gray-700 text-teal-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                            >
                                <CloudArrowUpIcon className="w-5 h-5" /> Upload
                            </NavLink>
                            <NavLink
                                to="/admin/doctors"
                                className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded transition ${isActive ? 'bg-gray-700 text-teal-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                            >
                                <UserGroupIcon className="w-5 h-5" /> Doctors
                            </NavLink>
                            <NavLink
                                to="/admin/assignments"
                                className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded transition ${isActive ? 'bg-gray-700 text-teal-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                            >
                                <ClipboardDocumentCheckIcon className="w-5 h-5" /> Assignments
                            </NavLink>
                            <NavLink
                                to="/admin/progress"
                                className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded transition ${isActive ? 'bg-gray-700 text-teal-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                            >
                                <ChartBarIcon className="w-5 h-5" /> Progress
                            </NavLink>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded transition border border-red-600/50"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
                    </button>
                </div>
            </nav>

            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
