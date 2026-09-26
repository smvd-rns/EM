import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { quotationService } from '../../services/materialService';
import NegotiationModal from './NegotiationModal';

/**
 * QuotationDetailsModal — shown to REQUESTER when status = QUOTATION_SENT.
 * Displays the material breakdown and allows the user to approve the quotation.
 */
const QuotationDetailsModal = ({ isOpen, onClose, request, onSuccess }) => {
    const [isApproving, setIsApproving] = useState(false);
    const [isNegotiateOpen, setIsNegotiateOpen] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !request) return null;

    const materials = request.materials || [];
    const totalCost = request.totalEstimatedCost ?? request.quotationAmount;

    const handleApprove = async () => {
        setIsApproving(true);
        setError('');
        try {
            await quotationService.userApproveQuotation(request.id);
            setIsApproving(false);
            onSuccess();
        } catch (err) {
            setError(err.message || 'Failed to approve quotation');
            setIsApproving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] w-full max-w-[700px] shadow-[0_24px_60px_rgba(0,0,0,0.15)] flex flex-col relative animate-fadeUp overflow-hidden max-h-[90vh]">

                {/* Header */}
                <div className="px-8 py-6 border-b border-[#dadce0] flex justify-between items-center bg-[#f8f9fa]">
                    <div>
                        <h2 className="text-[20px] font-['Google_Sans_Display',sans-serif] text-[#202124]">
                            Quotation Details
                        </h2>
                        <p className="text-[13px] text-[#5f6368]">Request {request.requestNumber}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#e8eaed] transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">

                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-4 mb-6 bg-[#f8f9fa] rounded-[12px] p-4">
                        <div>
                            <div className="text-[11px] text-[#5f6368] mb-1">Total Cost</div>
                            <div className="text-[22px] font-bold text-[#1a73e8]">₹{Number(totalCost ?? 0).toFixed(2)}</div>
                        </div>
                        {request.estimatedDays && (
                            <div>
                                <div className="text-[11px] text-[#5f6368] mb-1">Estimated Completion</div>
                                <div className="text-[18px] font-semibold text-[#202124]">{request.estimatedDays} days</div>
                            </div>
                        )}
                    </div>

                    {/* Quotation description */}
                    {request.quotationDescription && (
                        <div className="mb-5">
                            <div className="text-[12px] font-medium text-[#5f6368] mb-2">Scope of Work</div>
                            <p className="text-[14px] text-[#3c4043] bg-[#f8f9fa] border border-[#f1f3f4] rounded-[8px] p-3 leading-relaxed">
                                {request.quotationDescription}
                            </p>
                        </div>
                    )}

                    {/* Material breakdown table */}
                    {materials.length > 0 && (
                        <div className="mb-5">
                            <div className="text-[13px] font-semibold text-[#202124] mb-3">Material Breakdown</div>
                            <div className="border border-[#dadce0] rounded-[12px] overflow-hidden">
                                <table className="w-full text-[13px]">
                                    <thead className="bg-[#f8f9fa] border-b border-[#dadce0]">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left text-[#5f6368] font-medium">Item</th>
                                            <th className="px-4 py-2.5 text-right text-[#5f6368] font-medium">Qty</th>
                                            <th className="px-4 py-2.5 text-right text-[#5f6368] font-medium">Rate</th>
                                            <th className="px-4 py-2.5 text-left text-[#5f6368] font-medium">Vendor</th>
                                            <th className="px-4 py-2.5 text-right text-[#5f6368] font-medium">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {materials.map((item, idx) => (
                                            <tr key={idx} className="border-t border-[#f1f3f4]">
                                                <td className="px-4 py-2.5">
                                                    <div className="font-medium text-[#202124]">{item.materialName}</div>
                                                    {item.specification && (
                                                        <div className="text-[11px] text-[#5f6368]">{item.specification}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5 text-right">{item.quantity} {item.unit}</td>
                                                <td className="px-4 py-2.5 text-right">₹{Number(item.unitPrice).toFixed(2)}</td>
                                                <td className="px-4 py-2.5 text-[#5f6368]">{item.vendorName}</td>
                                                <td className="px-4 py-2.5 text-right font-semibold">₹{Number(item.totalPrice).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-[#f8f9fa] border-t-2 border-[#dadce0]">
                                        <tr>
                                            <td colSpan={4} className="px-4 py-2.5 text-right font-semibold">Total</td>
                                            <td className="px-4 py-2.5 text-right font-bold text-[#1a73e8]">
                                                ₹{Number(totalCost ?? 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* SA remarks */}
                    {request.superAdminRemarks && (
                        <div className="bg-[#e8f0fe] border border-[#1a73e8]/20 rounded-[8px] p-3">
                            <div className="text-[12px] font-medium text-[#1a73e8] mb-1">Note from Approval Team</div>
                            <p className="text-[13px] text-[#3c4043]">{request.superAdminRemarks}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 px-4 py-3 bg-[#fce8e6] border border-[#fad2cf] rounded-[8px] text-[#c5221f] text-[13px]">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-[#dadce0] bg-[#f8f9fa] flex flex-row-reverse gap-3">
                    <button
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="bg-[#137333] hover:bg-[#0d652d] text-white px-6 py-[10px] rounded-[50px] font-['Google_Sans',sans-serif] text-[14px] font-medium transition-all shadow-md flex items-center gap-2 min-w-[160px] justify-center disabled:opacity-70"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {isApproving ? 'Approving...' : 'Approve Quotation'}
                    </button>
                    <button
                        onClick={() => setIsNegotiateOpen(true)}
                        disabled={isApproving}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-[10px] rounded-[50px] font-['Google_Sans',sans-serif] text-[14px] font-medium transition-all shadow-sm flex items-center gap-2 min-w-[140px] justify-center disabled:opacity-70"
                    >
                        <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Negotiate
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isApproving}
                        className="px-6 py-[10px] rounded-[50px] font-['Google_Sans',sans-serif] text-[14px] font-medium text-[#5f6368] hover:bg-[#e8eaed] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>

            <NegotiationModal
                isOpen={isNegotiateOpen}
                onClose={() => setIsNegotiateOpen(false)}
                request={request}
                onNegotiated={() => {
                    onSuccess();
                    onClose();
                }}
            />
        </div>,
        document.body
    );
};

export default QuotationDetailsModal;
