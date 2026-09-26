import React, { useState, useEffect, useCallback } from 'react';
import { requestService } from '../../../services/requestService';

const VendorQuotationsPage = () => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadQuotations = useCallback(async () => {
        setLoading(true);
        try {
            const data = await requestService.getAdminRequestHistory();
            // Filter requests that have quotation details or estimated costs
            const quotedRequests = (data || []).filter(r => r.totalEstimatedCost || r.quotationAmount || r.status !== 'REQUEST_CREATED');
            
            setQuotations(quotedRequests);
        } catch (e) {
            console.error('Error loading vendor quotations:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadQuotations();
    }, [loadQuotations]);

    return (
        <div className="relative min-h-screen pb-24">
            <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8 pt-10 animate-fadeUp">
                
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shadow-sm">
                                💰
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">Material & Service Bids</span>
                        </div>
                        <h1 className="text-[28px] font-display font-semibold text-slate-900 tracking-tight">
                            Vendor Quotations & Bids
                        </h1>
                        <p className="text-[13px] font-ui text-slate-500 mt-0.5">
                            Real-time submitted rate quotes, cost assessments, and approval statuses from facility requests.
                        </p>
                    </div>

                    <button
                        onClick={loadQuotations}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-[12px] hover:bg-slate-50 shadow-sm"
                    >
                        🔄 Refresh Bids
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="py-24 text-center text-slate-400 font-medium italic">Loading quotation records...</div>
                ) : quotations.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm max-w-lg mx-auto">
                        <div className="text-4xl mb-3">📝</div>
                        <h3 className="text-[18px] font-bold text-slate-900 mb-1">No Active Quotation Bids</h3>
                        <p className="text-[13px] text-slate-500 mb-4">
                            There are currently no formal rate quotations or contractor bids associated with your account.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quotations.map(req => {
                            const amount = req.totalEstimatedCost || req.quotationAmount || 0;
                            const isApproved = ['APPROVED', 'VENDOR_LIST_APPROVED', 'ITEMS_READY', 'IN_PRODUCTION', 'COMPLETED'].includes(req.status);
                            const isUnderReview = ['QUOTATION_ADDED', 'QUOTATION_APPROVED', 'PENDING_SA_APPROVAL'].includes(req.status);

                            return (
                                <div key={req.id} className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 flex flex-col justify-between space-y-4 hover:shadow-xl transition-all">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-bold text-indigo-600 text-[12px]">#{req.requestNumber || req.id}</span>
                                            {isApproved ? (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    ✓ Approved Quote
                                                </span>
                                            ) : isUnderReview ? (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    ⏳ Under SA Review
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                    📝 Bid Submitted
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-bold text-slate-900 text-[16px] leading-snug mb-2">
                                            {req.itemDescription}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200 uppercase tracking-wider">
                                                {req.serviceDepartmentName || 'Facility Service'}
                                            </span>
                                            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 text-[11px] font-bold border border-indigo-100">
                                                {req.organizationDepartmentName || req.dept}
                                            </span>
                                        </div>

                                        {req.quotationNotes && (
                                            <p className="text-[12px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                                                {req.quotationNotes}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t flex items-center justify-between">
                                        <div>
                                            <span className="text-[11px] text-slate-400 uppercase font-bold block">Quoted Amount:</span>
                                            <span className="font-bold text-indigo-600 text-[18px]">
                                                {amount > 0 ? `₹${Number(amount).toLocaleString('en-IN')}` : 'Pending Quote'}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-slate-400 font-medium">
                                            {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
};

export default VendorQuotationsPage;
