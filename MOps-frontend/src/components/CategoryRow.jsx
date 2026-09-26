import React from 'react';
import { Link } from 'react-router-dom';

const CategoryRow = ({ icon, title, description, to = "/login" }) => {
    return (
        <Link
            to={to}
            className="group flex items-center justify-between p-4 rounded-[12px] border border-transparent hover:bg-white hover:border-[#E2E8F0] hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200 cursor-pointer"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[8px] bg-[#F1F5F9] text-[#2563EB] flex items-center justify-center group-hover:bg-[#EFF6FF] transition-colors">
                    {icon}
                </div>
                <div className="flex flex-col">
                    <span className="text-[15px] font-semibold text-[#0F172A]">{title}</span>
                    <span className="text-[14px] text-[#64748B]">{description}</span>
                </div>
            </div>

            <div className="text-[#94A3B8] group-hover:text-[#2563EB] group-hover:translate-x-1 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </Link>
    );
};

export default CategoryRow;
