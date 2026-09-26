import React, { useState, useEffect } from 'react';
import { quotationService } from '../../services/materialService';
import { requestService } from '../../services/requestService';
import { downloadQuotationPDF } from '../../utils/downloadUtils';
import { formatDate } from '../../utils/dateUtils';

/**
 * SARequestDetailModal — Full detail slide-over for Super Admin.
 * Shows request metadata, material list with procurement status,
 * total cost, and a "Download Quotation" button.
 */
const SARequestDetailModal = ({ isOpen, onClose, request }) => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !request) return;
        let cancelled = false;
        setLoading(true);
        quotationService.getQuotation(request.id)
            .then(data => {
                if (!cancelled) {
                    const mats = Array.isArray(data) ? data : (data.materials || data.requestMaterials || []);
                    setMaterials(mats);
                }
            })
            .catch(() => { if (!cancelled) setMaterials(request.materials || []); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [isOpen, request]);

    if (!isOpen || !request) return null;

    const totalCost = request.totalEstimatedCost ?? materials.reduce((s, m) => s + Number(m.totalPrice ?? m.estimatedCost ?? 0), 0);
    const statusLabel = (request.status || '').replace(/_/g, ' ');
    const procuredCount = materials.filter(m => m.status === 'PROCURED').length;
    const pendingCount = materials.length - procuredCount;

    const statusColors = {
        REQUEST_CREATED: { bg: '#e8f0fe', text: '#1a73e8' },
        QUOTATION_ADDED: { bg: '#fef7e0', text: '#f9ab00' },
        QUOTATION_APPROVED: { bg: '#e6f4ea', text: '#137333' },
        APPROVED: { bg: '#e6f4ea', text: '#137333' },
        PENDING_SA_APPROVAL: { bg: '#fff3e0', text: '#e65100' },
        VENDOR_LIST_APPROVED: { bg: '#e8f0fe', text: '#1565c0' },
        ITEMS_READY: { bg: '#f3e8fd', text: '#9334ea' },
        IN_PRODUCTION: { bg: '#fff3e0', text: '#e65100' },
        PAYMENT_PENDING: { bg: '#fce4ec', text: '#c62828' },
        COMPLETED: { bg: '#e6f4ea', text: '#137333' },
    };

    const sc = statusColors[request.status] || { bg: '#f1f3f4', text: '#5f6368' };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[90]" onClick={onClose} />

            {/* Slide-over panel — full height with h-screen fallback */}
            <div
                className="fixed right-0 top-0 w-full max-w-[780px] bg-white shadow-2xl z-[100] flex flex-col overflow-hidden"
                style={{ height: '100vh', animation: 'slideInRight 0.3s ease-out' }}
            >

                {/* ─── Header ─── */}
                <div className="flex-shrink-0 px-8 pt-6 pb-5 border-b border-[#e8eaed]" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #fff 100%)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[12px] font-mono font-bold text-[#5f6368] bg-[#f1f3f4] px-2.5 py-1 rounded-md">
                                #{request.requestNumber || request.id}
                            </span>
                            <span
                                className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
                                style={{ background: sc.bg, color: sc.text }}
                            >
                                {statusLabel}
                            </span>
                        </div>
                        <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-[#e8eaed] flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5 text-[#5f6368]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <h2 className="text-[22px] font-bold text-[#202124] leading-snug mb-2">{request.itemDescription}</h2>
                    <div className="flex items-center gap-2 text-[13px] text-[#5f6368]">
                        <div className="w-6 h-6 rounded-full bg-[#e8f0fe] flex items-center justify-center text-[11px] font-bold text-[#1a73e8]">
                            {(request.requesterName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-[#3c4043]">{request.requesterName}</span>
                        <span className="text-[#dadce0]">·</span>
                        <span>{request.organizationDepartmentName}</span>
                        <span className="text-[#dadce0]">·</span>
                        <span>{request.serviceDepartmentName}</span>
                    </div>
                </div>

                {/* ─── Scrollable Body ─── */}
                <div className="flex-1 overflow-y-auto bg-white px-8 py-6 space-y-6">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Total Cost', value: `₹${Number(totalCost || 0).toLocaleString('en-IN')}`, icon: '💰', accent: '#1a73e8' },
                            { label: 'Materials', value: materials.length, icon: '📦', accent: '#3c4043' },
                            { label: 'Created', value: formatDate(request.createdAt || request.date), icon: '📅', accent: '#3c4043' },
                            { label: 'Required By', value: formatDate(request.requiredDate) || '—', icon: '⏰', accent: '#e65100' },
                        ].map((s, i) => (
                            <div key={i} className="bg-[#f8f9fa] rounded-xl p-4 border border-[#e8eaed]">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[13px]">{s.icon}</span>
                                    <span className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">{s.label}</span>
                                </div>
                                <div className="text-[18px] font-bold" style={{ color: s.accent }}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Procurement Progress Bar */}
                    {materials.length > 0 && (
                        <div className="bg-[#f8f9fa] rounded-xl p-4 border border-[#e8eaed]">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[12px] font-bold text-[#5f6368] uppercase tracking-wider">Procurement Progress</span>
                                <span className="text-[13px] font-semibold text-[#3c4043]">{procuredCount}/{materials.length} procured</span>
                            </div>
                            <div className="w-full h-2.5 bg-[#e8eaed] rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${materials.length > 0 ? (procuredCount / materials.length) * 100 : 0}%`,
                                        background: procuredCount === materials.length ? '#137333' : '#1a73e8',
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-4 mt-2.5 text-[11px]">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#137333]"></span>
                                    <span className="text-[#5f6368]">Procured: <b className="text-[#137333]">{procuredCount}</b></span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#e65100]"></span>
                                    <span className="text-[#5f6368]">Pending: <b className="text-[#e65100]">{pendingCount}</b></span>
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Admin / SA Remarks */}
                    {(request.adminRemarks || request.superAdminRemarks) && (
                        <div className="space-y-3">
                            {request.adminRemarks && (
                                <div className="bg-[#e8f0fe] rounded-xl p-4 border border-[#1a73e8]/10">
                                    <div className="text-[10px] font-bold text-[#1a73e8] uppercase tracking-wider mb-1.5">Admin Remarks</div>
                                    <p className="text-[13px] text-[#202124] leading-relaxed">{request.adminRemarks}</p>
                                </div>
                            )}
                            {request.superAdminRemarks && (
                                <div className="bg-[#fef7e0] rounded-xl p-4 border border-[#f9ab00]/10">
                                    <div className="text-[10px] font-bold text-[#f9ab00] uppercase tracking-wider mb-1.5">Super Admin Remarks</div>
                                    <p className="text-[13px] text-[#202124] leading-relaxed">{request.superAdminRemarks}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Attached Photos */}
                    {request.images && request.images.length > 0 && (
                        <div className="bg-white rounded-xl border border-[#e8eaed] p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[12px] font-bold text-[#5f6368] uppercase tracking-wider">📷 Attached Photos</span>
                                <span className="text-[12px] font-medium text-[#5f6368] bg-[#f1f3f4] px-2.5 py-0.5 rounded-full">{request.images.length}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {request.images.map((imgUrl, idx) => (
                                    <a
                                        key={idx}
                                        href={requestService.formatImageUrl(imgUrl)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block aspect-square rounded-lg overflow-hidden border border-[#e8eaed] hover:border-[#1a73e8] hover:shadow-md transition-all"
                                    >
                                        <img src={requestService.formatImageUrl(imgUrl)} alt={`Request photo ${idx + 1}`} className="w-full h-full object-cover" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Material Table */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[13px] font-bold text-[#5f6368] uppercase tracking-wider">Material List</h3>
                            <span className="text-[12px] font-medium text-[#5f6368] bg-[#f1f3f4] px-2.5 py-1 rounded-full">{materials.length} items</span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : materials.length === 0 ? (
                            <div className="text-center py-12 text-[#5f6368] bg-[#f8f9fa] rounded-xl border border-dashed border-[#dadce0]">
                                <div className="text-3xl mb-2">📋</div>
                                <div className="text-[14px] font-medium">No materials found</div>
                                <div className="text-[12px]">Quotation may not have been created yet</div>
                            </div>
                        ) : (
                            <div className="border border-[#e8eaed] rounded-xl overflow-hidden">
                                <table className="w-full text-[13px]">
                                    <thead className="bg-[#f8f9fa]">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-[#5f6368] uppercase tracking-wider w-10">#</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">Material</th>
                                            <th className="px-4 py-3 text-right text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">Qty</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">Vendor</th>
                                            <th className="px-4 py-3 text-right text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">Rate</th>
                                            <th className="px-4 py-3 text-right text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">Total</th>
                                            <th className="px-4 py-3 text-center text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f1f3f4]">
                                        {materials.map((m, i) => (
                                            <tr key={m.id || i} className={`hover:bg-[#f8f9fa] transition-colors ${m.status === 'PROCURED' ? 'bg-[#f6fef8]' : ''}`}>
                                                <td className="px-4 py-3 text-[#5f6368]">{i + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-[#202124]">{m.materialName || m.name}</div>
                                                    {(m.specificationText || m.specification) && (
                                                        <div className="text-[11px] text-[#5f6368] mt-0.5">{m.specificationText || m.specification}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-[#3c4043]">{m.quantity} {m.unit || ''}</td>
                                                <td className="px-4 py-3 text-[#3c4043]">{m.vendorName || m.vendor?.name || '—'}</td>
                                                <td className="px-4 py-3 text-right text-[#3c4043]">₹{Number(m.unitPrice ?? m.ratePerUnit ?? 0).toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-[#202124]">₹{Number(m.totalPrice ?? m.estimatedCost ?? 0).toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {m.status === 'PROCURED' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e6f4ea] text-[#137333] text-[11px] font-semibold">
                                                            ✓ Procured
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fff3e0] text-[#e65100] text-[11px] font-semibold">
                                                            ⏳ Pending
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-[#e8f0fe]">
                                        <tr>
                                            <td colSpan="5" className="px-4 py-3 text-right text-[13px] font-bold text-[#202124]">Grand Total</td>
                                            <td className="px-4 py-3 text-right text-[16px] font-bold text-[#1a73e8]">₹{Number(totalCost || 0).toLocaleString('en-IN')}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Footer ─── */}
                <div className="flex-shrink-0 px-8 py-4 border-t border-[#e8eaed] bg-white flex items-center justify-between gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-[14px] font-medium text-[#5f6368] hover:bg-[#f1f3f4] border border-[#dadce0] transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => downloadQuotationPDF(request, materials)}
                        disabled={materials.length === 0}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1a73e8] text-white text-[14px] font-medium hover:bg-[#1557b0] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Quotation
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default SARequestDetailModal;
