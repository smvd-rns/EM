import React from 'react';
import AdminPerformance from '../../../components/dashboard/superadmin/AdminPerformance';

const SystemAdminsPage = () => {
    return (
        <div className="p-8">
            <h1 className="text-[28px] font-['Google_Sans_Display',sans-serif] text-[#202124] mb-1">System Admins</h1>
            <p className="text-[14px] text-[#5f6368] mb-6">Performance and metrics for facility managers and administrators.</p>
            <div className="max-w-4xl">
                <AdminPerformance />
            </div>
        </div>
    );
};

export default SystemAdminsPage;
