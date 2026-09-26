import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const QuotationEntryModal = ({ isOpen, onClose, onSubmit, request }) => {
    const [amount, setAmount] = useState('');
    const [estimatedDate, setEstimatedDate] = useState('');
    const [description, setDescription] = useState('');
    const [remarks, setRemarks] = useState('');

    if (!isOpen || !request) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            requestId: request.id,
            quotationAmount: parseFloat(amount),
            requiredDate: estimatedDate,
            quotationDescription: description,
            superAdminRemarks: remarks,
            approved: true
        });

        // Reset state
        setAmount('');
        setEstimatedDate('');
        setDescription('');
        setRemarks('');
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] w-full max-w-[500px] max-h-[90vh] shadow-[0_24px_60px_rgba(0,0,0,0.15)] flex flex-col animate-fadeUp overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-[#dadce0] flex justify-between items-center bg-[#f8f9fa] flex-shrink-0">
                    <div>
                        <h2 className="text-[18px] font-['Google_Sans_Display',sans-serif] text-[#202124]">Provide Quotation</h2>
                        <p className="text-[13px] font-['Roboto',sans-serif] text-[#5f6368] mt-0.5">Request {request.id} • {request.vendor}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">

                    {/* Request Description context */}
                    <div className="p-4 bg-[#f1f3f4] rounded-[8px] border border-[#dadce0] mb-6">
                        <div className="text-[12px] font-['Google_Sans',sans-serif] font-medium text-[#5f6368] mb-1">Original Request</div>
                        <div className="text-[14px] font-['Roboto',sans-serif] text-[#202124] italic">
                            "{request.itemDescription || request.req || request.desc || 'No description provided.'}"
                        </div>
                    </div>

                    <div className="space-y-5">

                        {/* Amount */}
                        <div>
                            <label className="block text-[13px] font-medium text-[#202124] mb-1.5 font-['Google_Sans',sans-serif]">
                                Estimated Cost (₹) <span className="text-[#d93025]">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g. 5000"
                                className="w-full h-11 px-4 rounded-[8px] border border-[#dadce0] focus:border-[#1a73e8] focus:ring-2 focus:ring-[#e8f0fe] py-2 text-[14px] font-['Roboto',sans-serif] text-[#202124] placeholder-[#9aa0a6] outline-none transition-all"
                            />
                        </div>

                        {/* Estimated Date */}
                        <div>
                            <label className="block text-[13px] font-medium text-[#202124] mb-1.5 font-['Google_Sans',sans-serif]">
                                Estimated Date <span className="text-[#d93025]">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                value={estimatedDate}
                                onChange={(e) => setEstimatedDate(e.target.value)}
                                className="w-full h-11 px-4 rounded-[8px] border border-[#dadce0] focus:border-[#1a73e8] focus:ring-2 focus:ring-[#e8f0fe] py-2 text-[14px] font-['Roboto',sans-serif] text-[#202124] outline-none transition-all"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-[13px] font-medium text-[#202124] mb-1.5 font-['Google_Sans',sans-serif]">
                                Quotation Breakdown <span className="text-[#d93025]">*</span>
                            </label>
                            <textarea
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Parts: AC Compressor (₹3500), Labor (₹1500)"
                                className="w-full min-h-[80px] px-4 rounded-[8px] border border-[#dadce0] focus:border-[#1a73e8] focus:ring-2 focus:ring-[#e8f0fe] py-3 text-[14px] font-['Roboto',sans-serif] text-[#202124] placeholder-[#9aa0a6] outline-none transition-all resize-y"
                            ></textarea>
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="block text-[13px] font-medium text-[#202124] mb-1.5 font-['Google_Sans',sans-serif]">
                                Approval Remarks <span className="text-[#d93025]">*</span>
                            </label>
                            <textarea
                                required
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="e.g. Approved for execution."
                                className="w-full min-h-[80px] px-4 rounded-[8px] border border-[#dadce0] focus:border-[#1a73e8] focus:ring-2 focus:ring-[#e8f0fe] py-3 text-[14px] font-['Roboto',sans-serif] text-[#202124] placeholder-[#9aa0a6] outline-none transition-all resize-y"
                            ></textarea>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-5 border-t border-[#dadce0] flex justify-end gap-3 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 h-[44px] rounded-[50px] font-medium text-[14px] text-[#1a73e8] hover:bg-[#f8f9fa] transition-colors font-['Google_Sans',sans-serif]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 h-[44px] rounded-[50px] font-medium text-[14px] bg-[#1a73e8] text-white hover:bg-[#1557b0] transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-[#1a73e8] font-['Google_Sans',sans-serif]"
                        >
                            Approve & Send Quotation
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default QuotationEntryModal;
