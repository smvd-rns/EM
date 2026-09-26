import React from 'react';

const TimelineCompliance = () => {
    const data = [
        { id: 'REQ-092', used: 3, total: 5 },  // Healthy
        { id: 'REQ-088', used: 4, total: 5 },  // Warning
        { id: 'REQ-095', used: 6, total: 5 },  // Overdue
        { id: 'REQ-102', used: 1, total: 3 },  // Healthy
    ];

    return (
        <div className="bg-white rounded-[16px] shadow-google-1 border border-[#dadce0]/50 p-6 h-full flex flex-col justify-center">
            <h3 className="text-[18px] font-google-sans text-[#202124] mb-4">Timeline Compliance</h3>
            <div className="space-y-5">
                {data.map((item, i) => {
                    const isOverdue = item.used > item.total;
                    const isWarning = item.used === item.total || item.used === item.total - 1;
                    const color = isOverdue ? 'bg-[#d93025]' : isWarning ? 'bg-[#f9ab00]' : 'bg-[#188038]';
                    const width = Math.min((item.used / item.total) * 100, 100);

                    return (
                        <div key={i}>
                            <div className="flex justify-between text-[13px] mb-1">
                                <span className="font-medium text-[#3c4043]">{item.id}</span>
                                <span className={isOverdue ? 'text-[#d93025] font-bold' : 'text-[#5f6368]'}>
                                    {item.used}/{item.total} Days
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-[#f1f3f4] rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TimelineCompliance;
