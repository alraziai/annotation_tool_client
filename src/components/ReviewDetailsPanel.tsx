import React, { useEffect, useRef } from 'react';

interface ReviewDetailsPanelProps {
    instances: any[];
    reviews: Record<string, { status: boolean | null, comment: string }>;
    setReview: (instanceId: string, review: { status: boolean | null, comment: string }) => void;
    submit: () => void;
    submitting: boolean;
}

export const ReviewDetailsPanel: React.FC<ReviewDetailsPanelProps> = ({ instances, reviews, setReview, submit, submitting }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to top when switching cases
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [instances?.[0]?.id]);

    if (!instances || instances.length === 0) return <div className="p-6 text-gray-500">Loading details...</div>;

    // Check if all instances have a status set (true or false, not null)
    const allReviewed = instances.every(inst => {
        const r = reviews[inst.id];
        return r && r.status !== null;
    });

    return (
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col shadow-2xl z-10 shrink-0">
            {/* Details Panel */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
                {instances.map((instance, index) => {
                    const review = reviews[instance.id] || { status: null, comment: '' };

                    return (
                        <div key={instance.id} className={`p-6 border-b border-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-teal-400 font-bold text-sm uppercase tracking-wider">
                                    Instance #{instance.instanceNumber || index + 1}
                                </h3>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${instance.detected ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                                    {instance.detected ? 'POSITIVE' : 'NEGATIVE'}
                                </span>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Condition</label>
                                    <div className="text-white font-medium">{instance.condition}</div>
                                </div>
                                <div className='flex justify-between'>
                                    {instance.location && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                                            <div className="text-white font-medium">{instance.location}</div>
                                        </div>
                                    )}
                                    {(instance.area !== null && instance.area !== 0) && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Area</label>
                                            <div className="text-white font-medium">{instance.area}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Assessment Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setReview(instance.id, { ...review, status: true })}
                                        disabled={submitting}
                                        className={`p-3 rounded-lg font-bold transition-all border flex flex-col items-center gap-1
                                                ${review.status === true
                                                ? 'bg-green-600/20 border-green-500 text-green-400'
                                                : 'bg-gray-700 border-transparent text-gray-400 hover:bg-gray-600 cursor-pointer'}`}
                                    >
                                        <span className="text-lg">✓</span>
                                        <span className="text-xs">Correct</span>
                                    </button>
                                    <button
                                        onClick={() => setReview(instance.id, { ...review, status: false })}
                                        disabled={submitting}
                                        className={`p-3 rounded-lg font-bold transition-all border flex flex-col items-center gap-1
                                                ${review.status === false
                                                ? 'bg-red-600/20 border-red-500 text-red-400'
                                                : 'bg-gray-700 border-transparent text-gray-400 hover:bg-gray-600 cursor-pointer'}`}
                                    >
                                        <span className="text-lg">✕</span>
                                        <span className="text-xs">Incorrect</span>
                                    </button>
                                </div>

                                {/* Comment Field */}
                                <div>
                                    <label className="block mb-2 text-xs font-bold text-gray-500">Comments</label>
                                    <textarea
                                        value={review.comment}
                                        onChange={e => setReview(instance.id, { ...review, comment: e.target.value })}
                                        disabled={submitting}
                                        className="w-full h-20 bg-gray-900 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-teal-500 border border-gray-700 resize-none placeholder-gray-600"
                                        placeholder={`Notes for #${instance.instanceNumber || index + 1}...`}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-gray-900 border-t border-gray-800">
                <button
                    onClick={submit}
                    disabled={!allReviewed || submitting}
                    className={`w-full py-4 rounded-lg font-bold text-white text-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2
                        ${!allReviewed || submitting
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-linear-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 cursor-pointer'}`}
                >
                    {submitting ? (
                        <><span>Saving...</span></>
                    ) : (
                        <><span>Submit All & Next</span> <span>&rarr;</span></>
                    )}
                </button>
            </div>
        </div>
    );
};
