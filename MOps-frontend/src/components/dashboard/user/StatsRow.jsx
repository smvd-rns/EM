import React from 'react';

const StatsRow = () => {
    const stats = [
        { label: 'Active Requests', value: '4', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { label: 'Avg Resolution', value: '2 Days', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: 'Completed (Month)', value: '12', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-[16px] shadow-google-1 border border-[#dadce0]/50 flex items-center justify-between">
                    <div>
                        <div className="text-[32px] font-display text-[#202124]">{stat.value}</div>
                        <div className="text-[14px] text-[#5f6368] font-medium font-google-sans">{stat.label}</div>
                    </div>
                    <div className="w-12 h-12 bg-[#e8f0fe] rounded-full flex items-center justify-center text-[#1a73e8]">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                        </svg>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsRow;
