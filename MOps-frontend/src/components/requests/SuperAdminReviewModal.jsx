import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { requestService } from '../../services/requestService';
import { quotationService } from '../../services/materialService';
import { formatDate } from '../../utils/dateUtils';

/**
 * SuperAdminReviewModal — SA reviews the Admin's material-based quotation and approves it.
 * On approval, status transitions to QUOTATION_APPROVED (user can accept the quotation).
 */
const SuperAdminReviewModal = ({ isOpen, onClose, request, onSuccess }) => {
    const [superAdminRemarks, setSuperAdminRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [materials, setMaterials] = useState([]);
    const [loadingMaterials, setLoadingMaterials] = useState(false);

    useEffect(() => {
        if (isOpen && request?.id) {
            setSuperAdminRemarks('');
            setError('');
            if (request.materials && request.materials.length > 0) {
                setMaterials(request.materials);
                setLoadingMaterials(false);
            } else {
                setLoadingMaterials(true);
                quotationService.getQuotation(request.id)
                    .then(data => {
                        setMaterials(data || []);
                    })
                    .catch(err => {
                        console.error('[SuperAdminReviewModal] Error fetching quotation materials:', err);
                    })
                    .finally(() => {
                        setLoadingMaterials(false);
                    });
            }
        }
    }, [isOpen, request]);

    if (!isOpen || !request) return null;

    const calculatedTotal = materials.reduce((acc, item) => acc + Number(item.totalPrice || item.total_price || 0), 0);
    const totalCost = calculatedTotal > 0 ? calculatedTotal : (request.totalEstimatedCost ?? request.quotationAmount ?? 0);

    const handleSubmit = async () => {
        if (!superAdminRemarks.trim()) {
            setError('Approval remarks are required.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await requestService.submitSuperAdminReview({
                requestId: request.id,
                // These fields are auto-populated from the material picker or request
                quotationAmount: Number(totalCost ?? 0),
                quotationDescription: request.quotationDescription || '',
                superAdminRemarks: superAdminRemarks,
                approved: true,
            });
            setIsSubmitting(false);
            onSuccess();
        } catch (err) {
            console.error('Submit review failed:', err);
            setError(err.message || 'Failed to submit review');
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] w-full max-w-[680px] shadow-[0_24px_60px_rgba(0,0,0,0.15)] flex flex-col relative my-auto animate-fadeUp overflow-hidden max-h-[90vh]">

                {/* Header */}
                <div className="px-8 py-6 border-b border-[#dadce0] flex justify-between items-center bg-[#f8f9fa]">
                    <div>
                        <h2 className="text-[20px] font-['Google_Sans_Display',sans-serif] text-[#202124]">
                            Review & Approve Quotation
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

                    {/* Request Info */}
                    <div className="mb-5 bg-[#f8f9fa] border border-[#f1f3f4] rounded-[16px] p-5">
                        <div className="grid grid-cols-3 gap-4 mb-3 border-b border-[#dadce0] pb-3">
                            <div>
                                <div className="text-[11px] text-[#5f6368] mb-1">Requester</div>
                                <div className="text-[14px] font-medium text-[#202124]">{request.requesterName}</div>
                            </div>
                            <div>
                                <div className="text-[11px] text-[#5f6368] mb-1">Service</div>
                                <div className="inline-block px-3 py-[4px] rounded-[50px] bg-[#e6f4ea] text-[#137333] text-[12px] font-medium">
                                    {request.serviceDepartmentName}
                                </div>
                            </div>
                            <div>
                                <div className="text-[11px] text-[#5f6368] mb-1">📅 Required By</div>
                                <div className="text-[14px] font-semibold text-[#202124]">
                                    {request.requiredDate ? formatDate(request.requiredDate) : '—'}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="text-[11px] text-[#5f6368] mb-1">Description</div>
                            <p className="text-[13px] text-[#202124]">{request.itemDescription}</p>
                        </div>

                        {/* Attached Photos */}
                        {request.images && request.images.length > 0 && (
                            <div className="mt-4">
                                <label className="block text-[11px] text-[#5f6368] mb-2 uppercase tracking-wide">Attached Photos</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {request.images.map((imgUrl, idx) => (
                                        <a
                                            key={idx}
                                            href={requestService.formatImageUrl(imgUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block aspect-square rounded-[8px] overflow-hidden border border-[#dadce0] hover:border-[#1a73e8] hover:shadow-md transition-all cursor-pointer"
                                        >
                                            <img
                                                src={requestService.formatImageUrl(imgUrl)}
                                                alt={`Request photo ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Admin Assessment & Remarks */}
                        {(request.adminRemarks || request.quotationNotes || request.adminName) && (
                            <div className="mt-4 bg-[#e8f0fe]/60 border border-[#1a73e8]/20 rounded-[12px] p-4">
                                <div className="text-[11px] font-bold text-[#1a73e8] mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                    <span>💬 Admin Assessment & Remarks</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <div className="text-[10px] text-[#5f6368] mb-0.5">Reviewed By</div>
                                        <div className="text-[13px] font-medium text-[#202124]">{request.adminName || 'Service Admin'}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-[#5f6368] mb-0.5">Required Date</div>
                                        <div className="text-[13px] font-medium text-[#202124]">
                                            {request.requiredDate ? formatDate(request.requiredDate) : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                {request.adminRemarks && (
                                    <div className="mb-2">
                                        <div className="text-[10px] text-[#5f6368] mb-1 font-semibold">Admin Remarks:</div>
                                        <div className="text-[13px] text-[#202124] bg-white p-2.5 rounded-[8px] border border-[#1a73e8]/15 leading-relaxed">
                                            {request.adminRemarks}
                                        </div>
                                    </div>
                                )}
                                {request.quotationNotes && request.quotationNotes !== request.adminRemarks && (
                                    <div>
                                        <div className="text-[10px] text-[#5f6368] mb-1 font-semibold">Quotation Notes:</div>
                                        <div className="text-[13px] text-[#202124] bg-white p-2.5 rounded-[8px] border border-[#1a73e8]/15 leading-relaxed italic">
                                            {request.quotationNotes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Material Cost Breakdown */}
                    {loadingMaterials ? (
                        <div className="mb-5 p-6 bg-[#f8f9fa] border border-[#e2e8f0] rounded-[12px] text-center text-[#64748b] text-[13px] animate-pulse">
                            🔄 Loading quotation material details...
                        </div>
                    ) : materials.length > 0 ? (
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[15px] font-['Google_Sans',sans-serif] font-semibold text-[#202124]">
                                    Material Quotation
                                </h3>
                                <div className="bg-[#e8f0fe] text-[#1a73e8] px-4 py-1.5 rounded-[50px] text-[14px] font-semibold">
                                    ₹{Number(totalCost ?? 0).toFixed(2)}
                                </div>
                            </div>

                            <div className="border border-[#dadce0] rounded-[12px] overflow-hidden">
                                <table className="w-full text-[13px]">
                                    <thead className="bg-[#f8f9fa] border-b border-[#dadce0]">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left text-[#5f6368] font-medium">Material</th>
                                            <th className="px-4 py-2.5 text-right text-[#5f6368] font-medium">Qty</th>
                                            <th className="px-4 py-2.5 text-right text-[#5f6368] font-medium">Rate (₹)</th>
                                            <th className="px-4 py-2.5 text-left text-[#5f6368] font-medium">Vendor</th>
                                            <th className="px-4 py-2.5 text-right text-[#5f6368] font-medium">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {materials.map((item, idx) => (
                                            <tr key={idx} className="border-t border-[#f1f3f4]">
                                                <td className="px-4 py-2.5">
                                                    <div className="font-medium text-[#202124]">{item.materialName || item.material_name}</div>
                                                    {(item.specification || item.specificationText) && (
                                                        <div className="text-[11px] text-[#5f6368]">{item.specification || item.specificationText}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5 text-right">{item.quantity || item.quantityRequired} {item.unit}</td>
                                                <td className="px-4 py-2.5 text-right">
                                                    ₹{Number(item.unitPrice || item.unit_price || 0).toFixed(2)}
                                                    {item.lastPurchaseRate && (
                                                        <div className="text-[10px] text-[#5f6368]">last: ₹{item.lastPurchaseRate}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5 text-[#5f6368]">{item.vendorName || item.vendor_name || '—'}</td>
                                                <td className="px-4 py-2.5 text-right font-semibold">₹{Number(item.totalPrice || item.total_price || 0).toFixed(2)}</td>
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

                            {request.requiredDate && (
                                <div className="mt-2 text-[13px] text-[#5f6368]">
                                    📅 Required by: <strong>{new Date(request.requiredDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong>
                                </div>
                            )}
                        </div>
                    ) : Number(totalCost ?? 0) > 0 ? (
                        <div className="mb-5 p-4 bg-[#e8f0fe] border border-[#adc1f7] rounded-[12px] text-[#1a73e8]">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-[14px]">Quotation Amount Summary</span>
                                <span className="text-[16px] font-bold">₹{Number(totalCost).toFixed(2)}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-5 p-4 bg-[#fff3e0] border border-[#ffcc80] rounded-[8px] text-[#e65100] text-[13px]">
                            ⚠️ No material quotation created yet. Ask admin to create a quotation first.
                        </div>
                    )}

                    {/* SA Remarks */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[13px] font-['Google_Sans',sans-serif] font-medium text-[#5f6368] mb-1.5">
                                Approval Remarks <span className="text-[#c5221f]">*</span>
                            </label>
                            <textarea
                                rows={3}
                                value={superAdminRemarks}
                                onChange={e => setSuperAdminRemarks(e.target.value)}
                                placeholder="e.g. Approved. Proceed with procurement as quoted."
                                className="w-full p-3 border-[1.5px] border-[#dadce0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#1a73e8] focus:shadow-[0_0_0_3px_rgba(26,115,232,0.12)] resize-none"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-[#fce8e6] border border-[#c5221f] rounded-[8px] text-[#c5221f] text-[13px]">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-[#dadce0] bg-[#f8f9fa] flex flex-row-reverse gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || (materials.length === 0 && Number(totalCost) === 0)}
                        className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-6 py-[10px] rounded-[50px] font-['Google_Sans',sans-serif] text-[14px] font-medium transition-all shadow-md flex items-center justify-center min-w-[160px] disabled:opacity-70"
                    >
                        {isSubmitting ? 'Approving...' : '✉️ Approve & Send to Requester'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-6 py-[10px] rounded-[50px] font-['Google_Sans',sans-serif] text-[14px] font-medium text-[#5f6368] hover:bg-[#e8eaed] transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SuperAdminReviewModal;
