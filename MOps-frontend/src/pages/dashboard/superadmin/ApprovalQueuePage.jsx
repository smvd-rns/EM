import React from 'react';
import ApprovalQueue from '../../../components/dashboard/superadmin/ApprovalQueue';

const ApprovalQueuePage = () => {
    return (
        <div className="p-8">
            <h1 className="text-[28px] font-['Google_Sans_Display',sans-serif] text-[#202124] mb-6">Approval Queue</h1>
            <div className="max-w-4xl">
                <ApprovalQueue />
            </div>
        </div>
    );
};

export default ApprovalQueuePage;
