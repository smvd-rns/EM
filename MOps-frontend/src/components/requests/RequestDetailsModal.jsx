import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { quotationService } from '../../services/materialService';
import { requestService } from '../../services/requestService';
import NegotiationModal from './NegotiationModal';

const RequestDetailsModal = ({ isOpen, onClose, request, onSuccess }) => {
    const [isApproving, setIsApproving] = useState(false);
    const [approveError, setApproveError] = useState('');
    const [fetchedMaterials, setFetchedMaterials] = useState(null); // null = not fetched yet
    const [isNegotiateOpen, setIsNegotiateOpen] = useState(false);

    // If request.materials is empty but a quotation exists, fetch materials directly
    useEffect(() => {
        if (!isOpen || !request) return;
        const hasQuotationData = request.totalEstimatedCost != null || (request.estimatedDays != null);
        const hasMaterials = request.materials && request.materials.length > 0;
        if (hasQuotationData && !hasMaterials) {
            quotationService.getQuotation(request.id)
                .then(q => setFetchedMaterials(q.materials || []))
                .catch(() => setFetchedMaterials([]));
        } else {
            setFetchedMaterials(request.materials || []);
        }
    }, [isOpen, request?.id, request?.totalEstimatedCost]);

    if (!isOpen || !request) return null;

    const status = request.status;
    const isRequestCreated = status === 'REQUEST_CREATED';
    const isQuotationAdded = status === 'QUOTATION_ADDED';
    const isQuotationApproved = status === 'QUOTATION_APPROVED';
    const isNegotiationPending = status === 'NEGOTIATION_PENDING';
    const isApproved = status === 'APPROVED';
    const isPendingSA = status === 'PENDING_SA_APPROVAL';
    const isVendorListApproved = status === 'VENDOR_LIST_APPROVED';
    const isItemsReady = status === 'ITEMS_READY';
    const isInProduction = status === 'IN_PRODUCTION';
    const isPaymentPending = status === 'PAYMENT_PENDING';
    const isCompleted = status === 'COMPLETED';

    const materials = fetchedMaterials ?? request.materials ?? [];
    const totalCost = request.totalEstimatedCost ?? request.quotationAmount;

    // Show quotation panel whenever any quotation data exists
    const hasQuotation = totalCost != null || materials.length > 0 || request.estimatedDays != null;

    const handleApproveQuotation = async () => {
        setIsApproving(true);
        setApproveError('');
        try {
            await quotationService.userApproveQuotation(request.id);
            setIsApproving(false);
            if (onSuccess) onSuccess();
        } catch (err) {
            setApproveError(err.message || 'Failed to approve quotation');
            setIsApproving(false);
        }
    };

    const getDeptChip = (dept) => {
        const map = {
            Electrical: 'bg-[#fce8e6] text-[#c5221f]',
            Carpentry: 'bg-[#fff8e1] text-[#f9ab00]',
            Plumbing: 'bg-[#e6f4ea] text-[#137333]',
            EM: 'bg-[#e6f4ea] text-[#137333]',
        };
        return (
            <span className={`inline-block px-3 py-[4px] rounded-[50px] text-[12px] ${map[dept] || 'bg-[#f1f3f4] text-[#5f6368]'}`}>
                {dept}
            </span>
        );
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

    // Timeline steps
    // Timeline steps covering all 10 statuses
    const pastQuotationAdded = !isRequestCreated;
    const pastQuotationApproved = !isRequestCreated && !isQuotationAdded;
    const pastNegotiationRequest = isNegotiationPending;
    const pastApproved = isApproved || isPendingSA || isVendorListApproved || isItemsReady || isInProduction || isPaymentPending || isCompleted;
    const pastListGenerated = isPendingSA || isVendorListApproved || isItemsReady || isInProduction || isPaymentPending || isCompleted;
    const pastVendorApproved = isVendorListApproved || isItemsReady || isInProduction || isPaymentPending || isCompleted;
    const pastItemsReady = isItemsReady || isInProduction || isPaymentPending || isCompleted;
    const pastInProduction = isInProduction || isPaymentPending || isCompleted;
    const pastPaymentPending = isPaymentPending || isCompleted;

    const steps = [
        { label: 'Request Created', sub: request.date, done: true },
        { label: 'Quotation Added by Admin', sub: pastQuotationAdded ? 'Materials & costs assessed' : 'Awaiting admin review', done: pastQuotationAdded },
        { label: 'Quotation Approved by SA', sub: pastQuotationApproved ? 'Ready for your review' : 'Awaiting SA sign-off', done: pastQuotationApproved, active: isQuotationApproved },
        { label: 'Negotiation Initiated', sub: isNegotiationPending ? 'Awaiting admin response' : '', done: isNegotiationPending || pastApproved, active: isNegotiationPending },
        { label: 'You Accepted the Quotation', sub: pastApproved ? 'Quotation accepted' : 'Pending your approval', done: pastApproved, active: isQuotationApproved },
        { label: 'Lists Generated', sub: pastListGenerated ? 'Material & vendor lists created' : 'Pending', done: pastListGenerated },
        { label: 'Vendor Lists Approved', sub: pastVendorApproved ? 'Procurement authorized' : 'Awaiting SA approval', done: pastVendorApproved },
        { label: 'Items Procured', sub: pastItemsReady ? '✅ All materials received' : 'Procurement in progress', done: pastItemsReady },
        { label: 'In Production', sub: pastInProduction ? 'Work in progress' : 'Pending', done: pastInProduction, active: isInProduction },
        { label: 'Payment Pending', sub: pastPaymentPending ? 'Production complete' : 'Pending', done: pastPaymentPending },
        { label: 'Completed', sub: isCompleted ? '✅ Request closed' : 'Pending', done: isCompleted },
    ];

    const progressFraction = steps.reduce((n, s) => n + (s.done ? 1 : 0), 0) - 1;
    const progressPct = Math.max(0, Math.min(100, (progressFraction / (steps.length - 1)) * 100));

    return createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-[100] flex items-start justify-center px-4 py-6 sm:py-10 overflow-y-auto">
            <div className="bg-[#f8f9fa] rounded-[24px] w-full max-w-[960px] shadow-[0_24px_60px_rgba(0,0,0,0.15)] flex flex-col relative animate-fadeUp overflow-hidden max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-5rem)]">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#e8f0fe] via-white to-white px-6 sm:px-8 py-5 sm:py-6 border-b border-[#dadce0] flex flex-row justify-between items-start sm:items-center sticky top-0 z-30">
                    <div className="flex-1 min-w-0 pr-2">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <h2 className="text-[18px] sm:text-[22px] font-bold font-['Google_Sans_Display',sans-serif] text-[#1a73e8] shrink-0 leading-tight">
                                {request.requestNumber || request.id}
                            </h2>
                            <div className="flex flex-wrap gap-1.5 items-center">
                                {getDeptChip(request.serviceDepartmentName || request.dept)}
                                {isQuotationApproved && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[50px] bg-[#fff8e1] text-[#f9ab00] text-[11px] font-semibold animate-pulse border border-[#fef3c7]">
                                        ✉️ Action Required
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-[13px] sm:text-[14px] font-medium font-['Roboto',sans-serif] text-[#3c4043] line-clamp-2 sm:line-clamp-none leading-relaxed">
                            {request.itemDescription || request.desc}
                        </p>
                    </div>
                    <button onClick={onClose} className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] transition-all bg-white sm:bg-transparent border border-[#dadce0] sm:border-transparent">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* QUOTATION_APPROVED Banner — user needs to accept */}
                {isQuotationApproved && (
                    <div className="px-6 sm:px-8 py-4 bg-[#fff8e1] border-b border-[#fde68a] flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                        <div className="text-center sm:text-left w-full sm:w-auto">
                            <div className="text-[13px] sm:text-[14px] font-semibold text-[#b45309] mb-1">✉️ Quotation ready for review</div>
                            <div className="text-[12px] sm:text-[13px] text-[#92400e]">
                                Total: <strong>₹{Number(totalCost ?? 0).toFixed(2)}</strong>
                                {request.requiredDate && <span className="hidden sm:inline"> · Required by: <strong>{fmtDate(request.requiredDate)}</strong></span>}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            <button onClick={handleApproveQuotation} disabled={isApproving}
                                className="flex-1 sm:flex-none flex items-center justify-center bg-[#137333] hover:bg-[#0d652d] text-white px-6 py-2.5 rounded-[50px] text-[13px] font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:scale-100">
                                {isApproving ? 'Approving...' : '✅ Accept Quotation'}
                            </button>
                            <button onClick={() => setIsNegotiateOpen(true)} disabled={isApproving}
                                className="flex-1 sm:flex-none flex items-center justify-center bg-white border border-[#b45309]/30 hover:bg-white text-[#b45309] px-6 py-2.5 rounded-[50px] text-[13px] font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:scale-100 gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Negotiate
                            </button>
                        </div>
                    </div>
                )}

                {/* NEGOTIATION_PENDING Banner */}
                {isNegotiationPending && (
                    <div className="px-6 sm:px-8 py-4 bg-blue-50 border-b border-blue-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-blue-800">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[14px] font-semibold">Negotiation in Progress</div>
                                <div className="text-[12px] opacity-80">Awaiting response from admin on your requested modifications.</div>
                            </div>
                        </div>
                    </div>
                )}
                {approveError && (
                    <div className="px-6 sm:px-8 py-3 bg-[#fce8e6] text-[#c5221f] text-[12px] sm:text-[13px] border-b border-[#fad2cf] font-medium">{approveError}</div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-[#f8f9fa] custom-scrollbar">

                    {/* Top summary row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-[16px] border border-[#dadce0]/70 shadow-sm px-4 py-3 flex items-center justify-between">
                            <div>
                                <div className="text-[11px] text-[#5f6368] uppercase tracking-wide mb-1">Status</div>
                                <div className="text-[14px] font-semibold text-[#202124]">
                                    {String(status || '—').replace(/_/g, ' ')}
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8]">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7 7h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-white rounded-[16px] border border-[#dadce0]/70 shadow-sm px-4 py-3 flex items-center justify-between">
                            <div>
                                <div className="text-[11px] text-[#5f6368] uppercase tracking-wide mb-1">Estimated Cost</div>
                                <div className="text-[18px] font-bold text-[#1a73e8]">
                                    ₹{Number(totalCost ?? 0).toFixed(2)}
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8]">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 .895-4 2s1.79 2 4 2 4 .895 4 2-1.79 2-4 2m0-10V4m0 14v-2" />
                                </svg>
                            </div>
                        </div>
                        <div className="bg-white rounded-[16px] border border-[#dadce0]/70 shadow-sm px-4 py-3 flex items-center justify-between">
                            <div>
                                <div className="text-[11px] text-[#5f6368] uppercase tracking-wide mb-1">Required By</div>
                                <div className="text-[15px] font-semibold text-[#137333]">
                                    {fmtDate(request.requiredDate)}
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#e6f4ea] flex items-center justify-center text-[#137333]">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M5 11h14M7 19h10a2 2 0 002-2v-6H5v6a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-[20px] border border-[#dadce0]/70 shadow-sm p-5 sm:p-6">
                        <h3 className="text-[15px] sm:text-[16px] font-['Google_Sans',sans-serif] text-[#202124] font-medium mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#1a73e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Request Progress
                        </h3>
                        <div className="relative pl-1 sm:pl-3">
                            <div className="absolute left-[15.5px] sm:left-[23.5px] top-3 bottom-3 w-[2px] bg-[#f1f3f4]" />
                            <div
                                className="absolute left-[15.5px] sm:left-[23.5px] top-3 w-[2px] bg-[#137333] transition-all duration-700"
                                style={{ height: `${progressPct}%` }}
                            />
                            {steps.map((step, i) => (
                                <div key={i} className={`flex gap-3 sm:gap-4 mb-5 sm:mb-6 relative z-10 ${i === steps.length - 1 ? 'mb-0' : ''}`}>
                                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all
                                        ${step.done ? 'bg-[#137333] border-[#137333]' : step.active ? 'bg-[#1a73e8] border-[#1a73e8] animate-pulse' : 'border-[#dadce0] bg-white'}`}>
                                        {step.done && (
                                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <div className={`text-[12px] sm:text-[13px] font-['Google_Sans',sans-serif] leading-tight ${step.done || step.active ? 'font-semibold text-[#202124]' : 'text-[#9aa0a6]'}`}>{step.label}</div>
                                        {step.sub && <div className="text-[10px] sm:text-[11px] text-[#5f6368] mt-0.5">{step.sub}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Details + Quotation */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Request details + notes */}
                        <div className="bg-white rounded-[20px] border border-[#dadce0]/70 shadow-sm p-5 sm:p-6">
                            <h3 className="text-[15px] sm:text-[16px] font-['Google_Sans',sans-serif] text-[#202124] font-medium mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#1a73e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V6a2 2 0 012-2h4a2 2 0 012 2v1M7 11h10M9 15h6" />
                                </svg>
                                Request Details
                            </h3>

                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-4 text-[12px] sm:text-[13px] text-[#3c4043]">
                                <div>
                                    <dt className="text-[11px] uppercase tracking-wide text-[#5f6368] mb-0.5">Created</dt>
                                    <dd className="font-semibold">{request.date || fmtDate(request.createdAt)}</dd>
                                </div>
                                <div>
                                    <dt className="text-[11px] uppercase tracking-wide text-[#5f6368] mb-0.5">Service Department</dt>
                                    <dd className="font-semibold">{request.serviceDepartmentName || request.dept || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-[11px] uppercase tracking-wide text-[#5f6368] mb-0.5">Required By</dt>
                                    <dd className="font-semibold">{fmtDate(request.requiredDate)}</dd>
                                </div>
                            </dl>

                            {(request.adminRemarks || request.superAdminRemarks || request.quotationDescription) ? (
                                <div className="space-y-3">
                                    {request.adminRemarks ? (
                                        <div className="rounded-[10px] p-3 bg-[#f1f3f4] border border-[#dadce0]">
                                            <div className="text-[11px] text-[#5f6368] font-semibold mb-1 uppercase tracking-wide">Admin Note</div>
                                            <p className="text-[13px] text-[#3c4043] leading-relaxed">{request.adminRemarks}</p>
                                        </div>
                                    ) : null}
                                    {request.superAdminRemarks ? (
                                        <div className="rounded-[10px] p-3 bg-[#e8f0fe]/70 border border-[#1a73e8]/15">
                                            <div className="text-[11px] text-[#1a73e8] font-semibold mb-1 uppercase tracking-wide">Approval Note</div>
                                            <p className="text-[13px] text-[#3c4043] leading-relaxed">{request.superAdminRemarks}</p>
                                        </div>
                                    ) : null}
                                    {request.quotationDescription ? (
                                        <div className="rounded-[10px] p-3 bg-[#fef7e0]/70 border border-[#fef0c3]">
                                            <div className="text-[11px] text-[#ea8600] font-semibold mb-1 uppercase tracking-wide">Scope of Work</div>
                                            <p className="text-[13px] text-[#3c4043] leading-relaxed">{request.quotationDescription}</p>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            {/* Attached Photos */}
                            {request.images && request.images.length > 0 && (
                                <div className="mt-4">
                                    <div className="text-[11px] text-[#5f6368] font-semibold mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                                        </svg>
                                        Attached Photos ({request.images.length})
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {request.images.map((imgUrl, idx) => (
                                            <a
                                                key={idx}
                                                href={requestService.formatImageUrl(imgUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block aspect-square rounded-[10px] overflow-hidden border border-[#dadce0] hover:border-[#1a73e8] hover:shadow-md transition-all"
                                            >
                                                <img src={requestService.formatImageUrl(imgUrl)} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quotation + materials */}
                        <div className="bg-white rounded-[20px] border border-[#dadce0]/70 shadow-sm p-5 sm:p-6">
                            <h3 className="text-[15px] sm:text-[16px] font-['Google_Sans',sans-serif] text-[#202124] font-medium mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#f9ab00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                                </svg>
                                Quotation Details
                            </h3>

                            {hasQuotation ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="bg-[#e8f0fe]/60 rounded-[12px] p-4 border border-[#1a73e8]/15">
                                            <div className="text-[10px] sm:text-[11px] text-[#1a73e8] font-bold uppercase tracking-tight mb-1">Estimated Cost</div>
                                            <div className="text-[20px] sm:text-[22px] font-bold text-[#1a73e8] leading-none">₹{Number(totalCost ?? 0).toFixed(2)}</div>
                                        </div>
                                        <div className="bg-[#f0faf3]/60 rounded-[12px] p-4 border border-[#137333]/15">
                                            <div className="text-[10px] sm:text-[11px] text-[#137333] font-bold uppercase tracking-tight mb-1">📅 Required By</div>
                                            <div className="text-[16px] sm:text-[18px] font-bold text-[#137333] leading-none">{fmtDate(request.requiredDate)}</div>
                                        </div>
                                    </div>

                                    {materials.length > 0 && (
                                        <div>
                                            <div className="text-[12px] font-semibold text-[#5f6368] mb-2 uppercase tracking-wide">Material Breakdown</div>
                                            <div className="border border-[#dadce0] rounded-[12px] overflow-auto custom-scrollbar">
                                                <table className="w-full text-[12px] min-w-[500px]">
                                                    <thead className="bg-[#f8f9fa] border-b border-[#dadce0]">
                                                        <tr>
                                                            <th className="px-3 py-2.5 text-left text-[#5f6368] font-medium">Item</th>
                                                            <th className="px-3 py-2.5 text-right text-[#5f6368] font-medium">Qty</th>
                                                            <th className="px-3 py-2.5 text-right text-[#5f6368] font-medium">Unit ₹</th>
                                                            <th className="px-3 py-2.5 text-left text-[#5f6368] font-medium">Vendor</th>
                                                            <th className="px-3 py-2.5 text-right text-[#5f6368] font-medium">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {materials.map((m, i) => (
                                                            <tr key={i} className="border-t border-[#f1f3f4] hover:bg-[#fafafa]">
                                                                <td className="px-3 py-2.5">
                                                                    <div className="font-medium text-[#202124]">{m.materialName}</div>
                                                                    {m.specification && <div className="text-[10px] text-[#5f6368]">{m.specification}</div>}
                                                                </td>
                                                                <td className="px-3 py-2.5 text-right">{m.quantity} {m.unit}</td>
                                                                <td className="px-3 py-2.5 text-right">₹{Number(m.unitPrice ?? 0).toFixed(2)}</td>
                                                                <td className="px-3 py-2.5 text-[#5f6368] text-[11px]">{m.vendorName || '—'}</td>
                                                                <td className="px-3 py-2.5 text-right font-semibold">₹{Number(m.totalPrice ?? 0).toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot className="bg-[#f8f9fa] border-t-2 border-[#dadce0]">
                                                        <tr>
                                                            <td colSpan={4} className="px-3 py-2.5 text-right font-semibold text-[#5f6368]">Grand Total</td>
                                                            <td className="px-3 py-2.5 text-right font-bold text-[#1a73e8]">₹{Number(totalCost ?? 0).toFixed(2)}</td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {request.superAdminName && (
                                        <div className="bg-[#fef7e0]/50 rounded-[12px] p-3 border border-[#fef0c3] flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#f9ab00] flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0">
                                                {request.superAdminName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-[#ea8600] font-semibold uppercase tracking-wide">Authorized By</div>
                                                <div className="text-[14px] font-medium text-[#202124]">{request.superAdminName}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="w-16 h-16 bg-[#f1f3f4] rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-[#9aa0a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-[16px] font-['Google_Sans',sans-serif] font-medium text-[#202124] mb-2">Quotation Pending</h4>
                                    <p className="text-[13px] font-['Roboto',sans-serif] text-[#5f6368] max-w-[260px]">
                                        The admin is preparing a material-based quotation. You'll be notified once it's ready.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <NegotiationModal
                isOpen={isNegotiateOpen}
                onClose={() => setIsNegotiateOpen(false)}
                request={request}
                onNegotiated={() => {
                    if (onSuccess) onSuccess();
                    onClose();
                }}
            />
        </div>,
        document.body
    );
};

export default RequestDetailsModal;
