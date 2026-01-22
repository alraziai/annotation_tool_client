import React, { useState } from 'react';
import axios from 'axios';

export const AdminUpload: React.FC = () => {
    const [fileLocal, setFileLocal] = useState({ excel: null as File | null, zip: null as File | null });
    const [batchName, setBatchName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'excel' | 'zip') => {
        if (e.target.files && e.target.files[0]) {
            setFileLocal(prev => ({ ...prev, [type]: e.target.files![0] }));
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        if (!fileLocal.excel || !fileLocal.zip || !batchName) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('batchName', batchName);
        formData.append('excel', fileLocal.excel);
        formData.append('images', fileLocal.zip);

        try {
            await axios.post('http://localhost:3000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('Upload successful!');
            setBatchName('');
            setFileLocal({ excel: null, zip: null });
        } catch (err: any) {
            setMessage('Upload failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
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
            {message && (
                <div className={`mt-6 p-4 rounded-lg text-center font-bold animate-fade-in ${message.includes('success') ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                    {message}
                </div>
            )}
        </div >
    );
};
