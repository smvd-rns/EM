import React from 'react';

const AdminPerformance = () => {
    const admins = [
        { name: 'John Smith', sent: 45, time: '1.2 Days', onTime: '98%' },
        { name: 'Sarah Connor', sent: 32, time: '2.5 Days', onTime: '85%' },
        { name: 'Mike Ross', sent: 28, time: '1.8 Days', onTime: '92%' },
    ];

    return (
        <div className="bg-white rounded-[16px] shadow-google-1 border border-[#dadce0]/50 p-6 h-full">
            <h3 className="text-[18px] font-google-sans text-[#202124] mb-4">Admin Performance</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-[#dadce0]">
                            <th className="pb-2 text-[12px] font-medium text-[#5f6368] uppercase">Admin</th>
                            <th className="pb-2 text-[12px] font-medium text-[#5f6368] uppercase text-right">Qtns Sent</th>
                            <th className="pb-2 text-[12px] font-medium text-[#5f6368] uppercase text-right">Avg Time</th>
                            <th className="pb-2 text-[12px] font-medium text-[#5f6368] uppercase text-right">On-Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((admin, i) => (
                            <tr key={i} className="border-b border-[#dadce0]/50 last:border-0 hover:bg-[#f8fafe]">
                                <td className="py-3 text-[14px] font-medium text-[#202124]">{admin.name}</td>
                                <td className="py-3 text-[14px] text-[#5f6368] text-right">{admin.sent}</td>
                                <td className="py-3 text-[14px] text-[#5f6368] text-right">{admin.time}</td>
                                <td className="py-3 text-[14px] font-bold text-[#188038] text-right">{admin.onTime}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPerformance;
