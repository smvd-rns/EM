import React from 'react';

const StatusTracker = ({ currentStage }) => {
    const stages = [
        'Submitted', 'Quotation Sent', 'Approved', 'Materials Sourced', 'In Production', 'Ready', 'Payment Pending', 'Completed'
    ];

    const currentStageIndex = stages.indexOf(currentStage);

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="flex items-center min-w-[800px]">
                {stages.map((stage, index) => {
                    const isCompleted = index < currentStageIndex;
                    const isActive = index === currentStageIndex;

                    return (
                        <div key={index} className="flex-1 flex flex-col items-center relative group">
                            {/* Connector Line */}
                            {index !== 0 && (
                                <div className={`absolute top-3 right-[50%] w-full h-[2px] -z-10 ${index <= currentStageIndex ? 'bg-[#0284c7]' : 'bg-[#bae6fd]'}`}></div>
                            )}

                            {/* Circle */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${isActive ? 'bg-[#0284c7] border-[#0284c7] shadow-[0_0_0_4px_rgba(2,132,199,0.25)]' :
                                    isCompleted ? 'bg-[#0284c7] border-[#0284c7]' : 'bg-white border-[#bae6fd]'
                                }`}>
                                {isCompleted && (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>

                            {/* Label */}
                            <div className={`mt-2 text-[12px] font-medium text-center px-1 ${isActive ? 'text-[#0284c7] font-bold' :
                                    isCompleted ? 'text-[#0c4a6e]' : 'text-[#0369a1]/60'
                                }`}>
                                {stage}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusTracker;
