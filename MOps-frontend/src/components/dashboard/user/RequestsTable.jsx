import React from 'react';

const RequestsTable = () => {
    const requests = [
        { id: 'REQ-2024-001', desc: 'Air Conditioner Repair', dept: 'Maintenance', date: 'Oct 24, 2024', status: 'In Progress' },
        { id: 'REQ-2024-002', desc: 'New Laptop Request', dept: 'IT', date: 'Oct 22, 2024', status: 'Pending' },
        { id: 'REQ-2024-003', desc: 'Water Leaking in Pantry', dept: 'Plumbing', date: 'Oct 20, 2024', status: 'Urgent' },
        { id: 'REQ-2024-004', desc: 'Office Chair Replacement', dept: 'Procurement', date: 'Oct 18, 2024', status: 'Completed' },
        { id: 'REQ-2024-005', desc: 'Server Room Access', dept: 'Security', date: 'Oct 15, 2024', status: 'Completed' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress': return 'bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8]'; // Blue
            case 'Pending': return 'bg-[#fef7e0] text-[#f9ab00] border-[#f9ab00]'; // Amber
            case 'Urgent': return 'bg-[#fce8e6] text-[#d93025] border-[#d93025]'; // Red
            case 'Completed': return 'bg-[#e6f4ea] text-[#188038] border-[#188038]'; // Green
            default: return 'bg-gray-100 text-gray-600 border-gray-400';
        }
    };

    return (
        <div className="bg-surface rounded-2xl shadow-xl border border-outline overflow-hidden">
            <div className="p-6 border-b border-outline flex justify-between items-center bg-surface-variant/40">
                <h3 className="text-[18px] font-display font-bold text-on-surface">My Requests</h3>
                <button className="text-[14px] text-accent font-semibold hover:bg-primary-container/30 px-3 py-1 rounded-lg transition-colors">
                    View All
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-outline bg-surface-variant/20">
                            <th className="py-4 px-6 text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">ID</th>
                            <th className="py-4 px-6 text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Description</th>
                            <th className="py-4 px-6 text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Department</th>
                            <th className="py-4 px-6 text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Date</th>
                            <th className="py-4 px-6 text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                            <th className="py-4 px-6 text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/40">
                        {requests.map((req, index) => (
                            <tr key={index} className="hover:bg-surface-variant/40 transition-colors group">
                                <td className="py-4 px-6 text-[14px] font-semibold text-accent">{req.requestNumber || req.id}</td>
                                <td className="py-4 px-6 text-[14px] text-on-surface font-medium">{req.itemDescription || req.desc}</td>
                                <td className="py-4 px-6 text-[14px] text-on-surface-variant">{req.serviceDepartmentName || req.dept}</td>
                                <td className="py-4 px-6 text-[14px] text-on-surface-variant">{req.date || req.createdAt}</td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${getStatusColor(req.status)}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <button className="text-on-surface-variant hover:text-accent transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RequestsTable;
