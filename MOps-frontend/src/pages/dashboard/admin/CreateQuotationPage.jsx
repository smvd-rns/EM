import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestService } from '../../../services/requestService';
import { quotationService } from '../../../services/materialService';
import { get } from '../../../services/api';
import MaterialPicker from '../../../components/requests/MaterialPicker';

/**
 * CreateQuotationPage — indigo-toned admin quotation builder.
 * Route: /admin/create-quotation/:requestId
 */
const CreateQuotationPage = () => {
    console.log('[DEBUG] CreateQuotationPage mounting...');
    const { requestId } = useParams();
    const navigate = useNavigate();

    const [request, setRequest] = useState(null);
    const [loadingRequest, setLoadingRequest] = useState(true);

    const [materials, setMaterials] = useState([]);
    const [totalCost, setTotalCost] = useState(0);
    const [description, setDescription] = useState('');
    const [estimatedDays, setEstimatedDays] = useState(7);
    const [quotationNotes, setQuotationNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [lightboxImg, setLightboxImg] = useState(null); // lh3 URL currently open

    // Close lightbox on Escape
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') setLightboxImg(null);
    }, []);
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        requestService.getRequestById(requestId)
            .then(data => {
                setRequest(data);
                if (data.estimatedDays) setEstimatedDays(data.estimatedDays);
                if (data.adminRemarks) setQuotationNotes(data.adminRemarks);
            })
            .catch(err => {
                console.error('Error fetching request:', err);
                setError('Could not load request details. Please ensure you are logged in as Admin.');
            })
            .finally(() => setLoadingRequest(false));
    }, [requestId]);

    const handleMaterialsChange = (items, total, desc) => {
        setMaterials(items);
        setTotalCost(total);
        setDescription(desc);
    };

    const handleSubmit = async () => {
        if (materials.length === 0) {
            setError('Please add at least one material to the quotation.');
            return;
        }
        if (!estimatedDays || estimatedDays < 1) {
            setError('Please enter a valid estimated completion time.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await quotationService.createQuotation({
                requestId: Number(requestId),
                // quotationService.createQuotation expects `itemBreakdown`, not `materials`
                itemBreakdown: materials.map(m => ({
                    materialId: m.materialId,
                    materialName: m.materialName || '',
                    specificationId: m.specificationId || null,
                    specificationText: m.specification || '',
                    quantityRequired: m.quantity,
                    unit: m.unit || '',
                    unitPrice: m.unitPrice,
                    vendorId: m.vendorId,
                    vendorName: m.vendorName || '',
                    lastPurchaseRate: m.unitPrice,
                })),
                estimatedDays: Number(estimatedDays),
                quotationNotes: quotationNotes || null,
            });

            setSuccess(true);
            setTimeout(() => navigate(`/admin/queue?openReview=${requestId}`), 1000);
        } catch (err) {
            setError(err.message || 'Failed to create quotation.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingRequest) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pb-24">

            <div className="relative max-w-5xl mx-auto px-6 sm:px-8 pt-10 animate-fadeUp">

                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/admin/queue?openReview=${requestId}`)}
                        className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm border border-[#6366f1]/10 flex items-center justify-center text-on-surface-variant hover:bg-[#6366f1]/5 hover:border-[#6366f1]/25 transition-all shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#6366f1] to-[#818cf8] flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-[10px] font-ui font-bold uppercase tracking-[0.2em] text-[#6366f1]">Quotation Builder</span>
                        </div>
                        <h1 className="text-[24px] font-display font-semibold text-on-surface tracking-tight">
                            Create Quotation
                        </h1>
                        <p className="text-[13px] font-ui text-on-surface-variant/60 mt-0.5">
                            {request ? `Request ${request.requestNumber} — ${request.requesterName}` : `Request #${requestId}`}
                        </p>
                    </div>
                </div>

                {/* Request Summary Card */}
                {request && (
                    <div className="mb-6 rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm overflow-hidden">
                        <div className="px-5 py-3 bg-[#6366f1]/5 border-b border-[#6366f1]/10">
                            <span className="text-[10px] font-ui font-bold uppercase tracking-[0.15em] text-[#6366f1]">Request Summary</span>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-3 gap-5 mb-4">
                                <div>
                                    <div className="text-[10px] font-ui font-bold text-on-surface-variant/50 uppercase tracking-wider mb-1.5">Service</div>
                                    <span className="inline-block px-2.5 py-1 rounded-md bg-[#10b981]/10 text-[#10b981] text-[11px] font-ui font-bold border border-[#10b981]/15">
                                        {request.serviceDepartmentName}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-[10px] font-ui font-bold text-on-surface-variant/50 uppercase tracking-wider mb-1.5">Department</div>
                                    <div className="text-[13px] font-display font-medium text-on-surface">{request.organizationDepartmentName}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-ui font-bold text-on-surface-variant/50 uppercase tracking-wider mb-1.5">Required By</div>
                                    <div className="text-[13px] font-display font-medium text-on-surface">
                                        {request.requiredDate ? new Date(request.requiredDate).toLocaleDateString('en-IN') : 'Not set'}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-ui font-bold text-on-surface-variant/50 uppercase tracking-wider mb-1.5">Work Description</div>
                                <p className="text-[13px] font-ui text-on-surface bg-[#f0f2f8] border border-[#dde1ed] rounded-lg p-3 leading-relaxed">
                                    {request.itemDescription}
                                </p>
                            </div>

                            {/* Work Photos — LLM-style large image viewer */}
                            {request.images && request.images.length > 0 && (
                                <div className="mt-5">
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <svg className="w-3.5 h-3.5 text-[#6366f1]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                                        </svg>
                                        <div className="text-[10px] font-ui font-bold text-on-surface-variant/50 uppercase tracking-wider">
                                            Work Photos ({request.images.length})
                                        </div>
                                    </div>

                                    {/* LLM-style: 1 photo = full width, 2+ = 2-col grid */}
                                    <div className={`grid gap-3 ${
                                        request.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                                    }`}>
                                        {request.images.map((rawUrl, idx) => {
                                            const lh3Url = requestService.formatImageUrl(rawUrl);
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setLightboxImg(lh3Url)}
                                                    className="group relative w-full overflow-hidden rounded-2xl border border-[#e2e4f0] bg-[#f5f6fa] shadow-sm hover:shadow-lg hover:border-[#6366f1]/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30"
                                                    style={{ aspectRatio: request.images.length === 1 ? '16/7' : '4/3' }}
                                                >
                                                    <img
                                                        src={lh3Url}
                                                        alt={`Work photo ${idx + 1}`}
                                                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.parentElement.querySelector('.img-error-fallback').style.display = 'flex';
                                                        }}
                                                    />
                                                    {/* Error fallback */}
                                                    <div className="img-error-fallback absolute inset-0 hidden flex-col items-center justify-center gap-2 bg-[#f0f2f8]">
                                                        <svg className="w-8 h-8 text-on-surface-variant/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                                                        </svg>
                                                        <span className="text-[11px] text-on-surface-variant/40 font-ui">Could not load image</span>
                                                    </div>
                                                    {/* Expand hint on hover */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
                                                        <span className="text-[11px] font-ui font-medium text-white/80">Photo {idx + 1}</span>
                                                        <span className="flex items-center gap-1 text-[10px] font-ui font-bold text-white/70 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                            </svg>
                                                            Expand
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* No photos placeholder */}
                            {(!request.images || request.images.length === 0) && (
                                <div className="mt-5 flex items-center gap-2 text-[12px] font-ui text-on-surface-variant/40 italic">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                                    </svg>
                                    No work photos attached
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Material Picker */}
                <div className="mb-6">
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-5 h-5 rounded-md bg-[#6366f1]/10 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]"></div>
                        </div>
                        <h2 className="text-[15px] font-display font-bold text-on-surface tracking-tight">Select Materials</h2>
                    </div>
                    <MaterialPicker
                        onMaterialsChange={handleMaterialsChange}
                        initialItems={request?.materials || []}
                    />
                </div>

                {/* Quotation Details */}
                <div className="rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-[#6366f1]/5 border-b border-[#6366f1]/10 flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-md bg-[#6366f1]/10 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]"></div>
                        </div>
                        <span className="text-[12px] font-display font-bold text-on-surface tracking-tight">Quotation Details</span>
                    </div>

                    <div className="p-5 space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[11px] font-ui font-bold text-on-surface-variant/60 uppercase tracking-wider mb-2">
                                    Est. Completion (days) <span className="text-error">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={estimatedDays}
                                    onChange={e => setEstimatedDays(e.target.value)}
                                    className="w-full h-10 px-3 border border-[#dde1ed] rounded-lg text-[14px] font-ui text-on-surface bg-white focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 transition-all"
                                />
                            </div>

                            <div className="flex items-end">
                                <div className="bg-gradient-to-r from-[#6366f1]/8 to-[#818cf8]/8 border border-[#6366f1]/10 rounded-xl px-5 py-3 w-full">
                                    <div className="text-[10px] font-ui font-bold text-[#6366f1]/60 uppercase tracking-wider mb-0.5">Total Estimated Cost</div>
                                    <div className="text-[22px] font-display font-bold text-[#6366f1]">₹{totalCost.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-ui font-bold text-on-surface-variant/60 uppercase tracking-wider mb-2">
                                Internal Admin Notes <span className="text-[10px] font-normal text-on-surface-variant/40">(not visible to requester)</span>
                            </label>
                            <textarea
                                value={quotationNotes}
                                onChange={e => setQuotationNotes(e.target.value)}
                                rows={3}
                                placeholder="Optional notes for SA..."
                                className="w-full p-3 border border-[#dde1ed] rounded-lg text-[13px] font-ui text-on-surface bg-white focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 transition-all resize-none placeholder:text-on-surface-variant/30"
                            />
                        </div>

                        {/* Auto-generated description */}
                        {description && (
                            <div className="bg-[#f0f2f8] border border-[#dde1ed] rounded-lg p-3">
                                <div className="text-[10px] font-ui font-bold text-on-surface-variant/50 uppercase tracking-wider mb-1">Auto-Generated Description</div>
                                <p className="text-[13px] font-ui text-on-surface">{description}</p>
                            </div>
                        )}

                        {error && (
                            <div className="px-4 py-3 bg-error/5 border border-error/15 rounded-lg text-error text-[12px] font-ui font-medium flex items-center gap-2">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="px-4 py-3 bg-[#10b981]/5 border border-[#10b981]/15 rounded-lg text-[#10b981] text-[12px] font-ui font-medium flex items-center gap-2">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Quotation saved! Returning to review form…
                            </div>
                        )}

                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || materials.length === 0 || success}
                                className="px-6 py-2.5 rounded-xl text-[13px] font-ui font-bold text-white bg-gradient-to-r from-[#6366f1] to-[#818cf8] shadow-md shadow-[#6366f1]/20 hover:opacity-90 hover:shadow-lg active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                {isSubmitting ? 'Saving…' : 'Save Quotation'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Lightbox ── */}
            {lightboxImg && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
                    onClick={() => setLightboxImg(null)}
                >
                    {/* Close button */}
                    <button
                        onClick={() => setLightboxImg(null)}
                        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all z-10"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Full-size image */}
                    <img
                        src={lightboxImg}
                        alt="Work photo full size"
                        referrerPolicy="no-referrer"
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-full max-h-[90vh] rounded-2xl object-contain border border-white/10"
                        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
                    />

                    {/* ESC hint */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[11px] font-ui text-white/40 select-none">
                        Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/50 font-mono text-[10px]">ESC</kbd> to close
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateQuotationPage;
