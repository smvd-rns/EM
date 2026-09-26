import React from 'react';

const SystemOverview = () => {
    const stats = [
        { label: 'Total Active', value: '42', change: '+12%', color: 'text-[#1a73e8]' },
        { label: 'Pending Approval', value: '8', change: '-5%', color: 'text-[#f9ab00]' },
        { label: 'Overdue Tasks', value: '3', change: '+1', color: 'text-[#d93025]' },
        { label: 'Completed (Mo)', value: '156', change: '+18%', color: 'text-[#188038]' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-[16px] shadow-google-1 border border-[#dadce0]/50">
                    <div className="text-[12px] font-medium text-[#5f6368] uppercase tracking-wide mb-2">{stat.label}</div>
                    <div className="flex items-end justify-between">
                        <div className={`text-[32px] font-display ${stat.color}`}>{stat.value}</div>
                        <div className="text-[12px] font-medium bg-[#f1f3f4] px-2 py-1 rounded text-[#3c4043]">{stat.change}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SystemOverview;
