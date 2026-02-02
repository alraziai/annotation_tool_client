import React, { useState } from 'react';
import axios from 'axios';

interface ProgressData {
    percentage: number;
    message: string;
    current: number;
    total: number;
}

export const AdminUpload: React.FC = () => {
    const [fileLocal, setFileLocal] = useState({ excel: null as File | null, zip: null as File | null });
    const [batchName, setBatchName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [progress, setProgress] = useState<ProgressData | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'excel' | 'zip') => {
        if (e.target.files && e.target.files[0]) {
            setFileLocal(prev => ({ ...prev, [type]: e.target.files![0] }));
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setProgress(null);
        if (!fileLocal.excel || !fileLocal.zip || !batchName) return;

        setUploading(true);
        
        // Generate a unique session ID for this upload
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Connect to SSE for progress updates
        const eventSource = new EventSource(
            `${import.meta.env.VITE_API_URL}/upload/progress/${sessionId}`
        );

        eventSource.onmessage = (event) => {
            try {
                const data: ProgressData = JSON.parse(event.data);
                console.log('Progress update:', data);
                setProgress(data);
            } catch (err) {
                console.error('Error parsing progress data:', err);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE error:', error);
            eventSource.close();
        };

        const formData = new FormData();
        formData.append('batchName', batchName);
        formData.append('sessionId', sessionId);
        formData.append('excel', fileLocal.excel);
        formData.append('images', fileLocal.zip);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setMessage('Upload successful!');
            setBatchName('');
            setFileLocal({ excel: null, zip: null });
            setProgress(null);
        } catch (err: any) {
            setMessage('Upload failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
            eventSource.close();
        }
    };

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-white border-b border-gray-600 pb-4">Upload Context Batch</h2>
            <form onSubmit={handleUpload} className="space-y-6">
                <div>
                    <label className="block mb-2 text-sm font-bold text-gray-400">Batch Name</label>
                    <input
                        type="text" value={batchName} onChange={e => setBatchName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white focus:ring-2 focus:ring-teal-500 border border-gray-600 outline-none transition"
                        placeholder="e.g. Batch 1"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 border-dashed">
                        <label className="block mb-2 text-sm font-bold text-gray-400">Excel Metadata</label>
                        <input type="file" onChange={e => handleFileChange(e, 'excel')} accept=".xlsx,.xls,.csv" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer" />
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 border-dashed">
                        <label className="block mb-2 text-sm font-bold text-gray-400">Images Zip</label>
                        <input type="file" onChange={e => handleFileChange(e, 'zip')} accept=".zip" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                    </div>
                </div>
                <button disabled={uploading} className="w-full py-4 bg-linear-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 rounded-lg font-bold text-white shadow-lg transition-transform active:scale-95 text-lg">
                    {uploading ? 'Uploading...' : 'Start Upload'}
                </button>
            </form>
            
            {/* Progress Bar */}
            {uploading && progress && (
                <div className="mt-6 bg-gray-900 p-6 rounded-lg border border-gray-700">
                    <div className="mb-2 flex justify-between text-sm">
                        <span className="text-gray-400">{progress.message}</span>
                        <span className="text-teal-400 font-bold">{progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div 
                            className="bg-linear-to-r from-teal-500 to-blue-500 h-4 rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-2"
                            style={{ width: `${progress.percentage}%` }}
                        >
                            {progress.percentage > 10 && (
                                <span className="text-white text-xs font-bold">{progress.percentage}%</span>
                            )}
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 text-center">
                        {progress.current} of {progress.total} items processed
                    </div>
                </div>
            )}
            
            {message && (
                <div className={`mt-6 p-4 rounded-lg text-center font-bold animate-fade-in ${message.includes('success') ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                    {message}
                </div>
            )}
        </div >
    );
};
