import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ReviewSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    batchInstances: any[];
    currentId?: string;
    userId?: string;
    onNavigate: (id: string) => void;
}

export const ReviewSidebar: React.FC<ReviewSidebarProps> = ({ isOpen, onClose, batchInstances, currentId, userId, onNavigate }) => {

    // Group instances by caseId
    const cases = React.useMemo(() => {
        const groups: Record<string, any[]> = {};
        batchInstances.forEach(inst => {
            const key = inst.caseId || inst.id; // Fallback if caseId missing, though it shouldn't be
            if (!groups[key]) groups[key] = [];
            groups[key].push(inst);
        });
        return Object.values(groups);
    }, [batchInstances]);

    // Find current case ID for highlighting
    const currentInstance = batchInstances.find(i => i.id === currentId);
    const currentCaseId = currentInstance?.caseId;

    const completedCasesCount = cases.filter(group =>
        group.every(inst => inst.reviews?.some((r: any) => r.reviewerId === userId))
    ).length;

    return (
        <>
            <div
                className={`absolute top-0 left-0 h-full bg-gray-900 border-r border-gray-800 shadow-2xl z-30 transition-all duration-300 ease-in-out transform flex flex-col
                        ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'}
                    `}
            >
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">
                        Case List ({completedCasesCount} / {cases.length})
                    </span>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                    {cases.map(group => {
                        const firstInst = group[0];
                        const isFullyReviewed = group.every(inst => inst.reviews?.some((r: any) => r.reviewerId === userId));
                        const isCurrent = firstInst.caseId === currentCaseId;

                        return (
                            <div
                                key={firstInst.caseId || firstInst.id}
                                onClick={() => {
                                    // Navigate to the first instance of this case (or the first unreviewed one if we wanted to be fancy)
                                    onNavigate(firstInst.id);
                                    onClose();
                                }}
                                className={`p-3 border-b border-gray-800 cursor-pointer flex items-center justify-between hover:bg-gray-800 transition
                                        ${isCurrent ? 'bg-gray-800 border-l-4 border-l-teal-500' : 'border-l-4 border-l-transparent'}
                                    `}
                            >
                                <div className="flex flex-col gap-1">
                                    <span className={`text-sm font-medium ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                                        {firstInst.originalImageId}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        {group.length} instance{group.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                {isFullyReviewed && <span className="text-green-500 text-sm">✓</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {isOpen && (
                <div
                    className="absolute inset-0 bg-black/50 z-20 backdrop-blur-sm"
                    onClick={onClose}
                ></div>
            )}
        </>
    );
};
