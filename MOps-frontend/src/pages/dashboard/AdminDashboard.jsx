import React, { useState, useEffect, useCallback } from 'react';
import { requestService } from '../../services/requestService';
import AdminReviewModal from '../../components/requests/AdminReviewModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Admin Dashboard — cool-toned "ops command center" aesthetic.
 * Distinct from UserDashboard's warm golden spiritual look.
 */

const STATUS_CONFIG = {
    REQUEST_CREATED: { label: 'New Request', action: 'Review', icon: '📋' },
    APPROVED: { label: 'Approved', action: 'Generate Lists', icon: '✅' },
    VENDOR_LIST_APPROVED: { label: 'Procurement', action: 'Mark Procured', icon: '🛒' },
    ITEMS_READY: { label: 'Items Ready', action: 'Start Production', icon: '📦' },
    IN_PRODUCTION: { label: 'In Production', action: 'Complete', icon: '🏭' },
    PAYMENT_PENDING: { label: 'Payment Due', action: 'Confirm Payment', icon: '💰' },
    QUOTATION_ADDED: { label: 'With Super Admin', icon: '⏳' },
    QUOTATION_APPROVED: { label: 'With Requester', icon: '⏳' },
    PENDING_SA_APPROVAL: { label: 'Lists with SA', icon: '⏳' },
    COMPLETED: { label: 'Completed', icon: '🎉' },
};

const ACTIONABLE = ['REQUEST_CREATED', 'APPROVED', 'VENDOR_LIST_APPROVED', 'ITEMS_READY', 'IN_PRODUCTION', 'PAYMENT_PENDING'];
const WAITING = ['QUOTATION_ADDED', 'QUOTATION_APPROVED', 'PENDING_SA_APPROVAL'];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [allRequests, setAllRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [animatedStats, setAnimatedStats] = useState({ actionable: 0, waiting: 0, completed: 0, total: 0 });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [p, h] = await Promise.allSettled([
            requestService.getPendingAdminRequests(),
            requestService.getAdminRequestHistory(),
        ]);
        const map = new Map();
        [...(p.status === 'fulfilled' ? p.value || [] : []), ...(h.status === 'fulfilled' ? h.value || [] : [])]
            .forEach(r => { if (!map.has(r.id)) map.set(r.id, r); });
        setAllRequests(Array.from(map.values()));
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const actionable = allRequests.filter(r => ACTIONABLE.includes(r.status));
    const waiting = allRequests.filter(r => WAITING.includes(r.status));
    const completed = allRequests.filter(r => r.status === 'COMPLETED');
    const totalActive = allRequests.filter(r => r.status !== 'COMPLETED').length;

    useEffect(() => {
        const targets = { actionable: actionable.length, waiting: waiting.length, completed: completed.length, total: totalActive };
        const duration = 600;
        const steps = 20;
        const stepTime = duration / steps;
        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            setAnimatedStats({
                actionable: Math.floor(targets.actionable * progress),
                waiting: Math.floor(targets.waiting * progress),
                completed: Math.floor(targets.completed * progress),
                total: Math.floor(targets.total * progress),
            });
            if (currentStep >= steps) clearInterval(timer);
        }, stepTime);
        return () => clearInterval(timer);
    }, [actionable.length, waiting.length, completed.length, totalActive]);

    const handleAction = async (action, reqId) => {
        setActionLoading(reqId);
        try {
            switch (action) {
                case 'generate-lists': await requestService.generateLists(reqId); break;
                case 'mark-all-procured': await requestService.markAllProcured(reqId); break;
                case 'start-production': await requestService.startProduction(reqId); break;
                case 'complete-production': await requestService.completeProduction(reqId); break;
                case 'confirm-payment': await requestService.confirmPayment(reqId); break;
                default: break;
            }
            fetchData();
        } catch (e) { alert(e.message); }
        setActionLoading(null);
    };

    const getActionHandler = (req) => {
        const s = req.status;
        if (s === 'REQUEST_CREATED') return () => {
            if (req.estimatedDays) { setSelectedRequest(req); setShowReviewModal(true); }
            else navigate(`/admin/create-quotation/${req.id}`);
        };
        if (s === 'APPROVED') return () => handleAction('generate-lists', req.id);
        if (s === 'VENDOR_LIST_APPROVED') return () => handleAction('mark-all-procured', req.id);
        if (s === 'ITEMS_READY') return () => handleAction('start-production', req.id);
        if (s === 'IN_PRODUCTION') return () => handleAction('complete-production', req.id);
        if (s === 'PAYMENT_PENDING') return () => handleAction('confirm-payment', req.id);
        return null;
    };

    const getActionLabel = (req) => {
        const s = req.status;
        if (s === 'REQUEST_CREATED') return req.estimatedDays ? 'Finalize' : 'Draft Quote';
        return STATUS_CONFIG[s]?.action || 'View';
    };

    /* Loading skeleton */
    if (loading) {
        return (
            <div className="pb-24 px-6 sm:px-8 pt-8 max-w-[1400px] mx-auto animate-fadeUp">
                <div className="mb-10 w-64 h-12 animate-skeleton rounded-2xl"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-6 min-h-[130px] flex flex-col justify-between rounded-2xl bg-[#f0f2f8] border border-[#dde1ed]">
                            <div className="w-12 h-4 animate-skeleton rounded-lg"></div>
                            <div className="w-20 h-10 animate-skeleton rounded-lg"></div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-7 min-h-[320px] flex flex-col justify-between rounded-2xl bg-[#f0f2f8] border border-[#dde1ed]">
                            <div className="w-1/2 h-5 animate-skeleton rounded-md mb-4"></div>
                            <div className="w-full h-10 animate-skeleton rounded-md mb-6"></div>
                            <div className="space-y-3"><div className="w-full h-3 animate-skeleton rounded-md"></div><div className="w-3/4 h-3 animate-skeleton rounded-md"></div></div>
                            <div className="w-full h-10 animate-skeleton rounded-md mt-6"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="relative min-h-screen pb-24">

                <div className="relative px-6 sm:px-8 pt-10 max-w-[1400px] mx-auto animate-fadeUp">

                    {/* HEADER — professional ops style */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#818cf8] flex items-center justify-center shadow-md shadow-[#6366f1]/20">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-ui font-bold uppercase tracking-[0.2em] text-[#6366f1]">Admin Dashboard</span>
                            </div>

                            <h2 className="text-[32px] font-display font-semibold text-on-surface tracking-tight mb-2">
                                Hare Krishna, {user?.name?.replace(/\bDas\b/gi, '').trim() || user?.username || 'Krishna Das'} Prabhu
                            </h2>
                            

                            {/* Indigo line divider — distinct from user's lotus */}
                            <div className="flex items-center gap-3 mt-5">
                                <div className="flex-1 h-[1px] bg-gradient-to-r from-[#6366f1]/30 via-[#6366f1]/15 to-transparent"></div>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]/40"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]/25"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]/15"></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-[#6366f1]/10 shadow-sm flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                <span className="text-[11px] font-ui font-bold text-[#6366f1]/80 uppercase tracking-[0.15em]">Live</span>
                            </div>
                            <button
                                onClick={fetchData}
                                className="w-11 h-11 rounded-xl bg-white/80 backdrop-blur-sm border border-[#6366f1]/10 flex items-center justify-center hover:bg-[#6366f1]/5 hover:border-[#6366f1]/25 hover:scale-105 active:scale-95 transition-all shadow-sm"
                                title="Refresh"
                            >
                                <svg className="w-4.5 h-4.5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* STATS — horizontal strip cards with left accent */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        {[
                            { label: 'Needs Action', val: animatedStats.actionable, accent: '#6366f1', urgent: actionable.some(r => r.urgencyRequested) },
                            { label: 'External Sync', val: animatedStats.waiting, accent: '#f59e0b' },
                            { label: 'Completed', val: animatedStats.completed, accent: '#10b981' },
                            { label: 'Total Active', val: animatedStats.total, accent: '#64748b' },
                        ].map((s, i) => (
                            <div
                                key={i}
                                className="group relative flex items-center gap-5 p-5 rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#6366f1]/15 overflow-hidden"
                            >
                                {/* Left accent bar */}
                                <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: s.accent }}></div>

                                <div className="pl-3">
                                    <div className="text-[28px] font-display font-bold text-on-surface leading-none mb-0.5" style={{ color: s.accent }}>
                                        {s.val}
                                    </div>
                                    <div className="text-[11px] font-ui font-semibold text-on-surface-variant uppercase tracking-wider">
                                        {s.label}
                                    </div>
                                </div>
                                {s.urgent && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-error animate-pulse" />}
                            </div>
                        ))}
                    </div>

                    {/* === NEEDS YOUR ACTION === */}
                    {actionable.length > 0 && (
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-5 h-5 rounded-md bg-[#6366f1]/10 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]"></div>
                                </div>
                                <h3 className="text-[16px] font-display font-bold text-on-surface tracking-tight">Needs Your Action</h3>
                                <span className="px-2 py-0.5 rounded-md bg-[#6366f1]/10 text-[#6366f1] text-[11px] font-ui font-bold">
                                    {actionable.length}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {actionable.map(req => {
                                    const cfg = STATUS_CONFIG[req.status];
                                    const handler = getActionHandler(req);
                                    const isActing = actionLoading === req.id;
                                    const isUrgent = req.urgencyRequested;

                                    const created = new Date(req.createdAt || Date.now());
                                    const diff = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
                                    const daysLabel = diff === 0 ? 'Today' : `${diff}d ago`;

                                    return (
                                        <div key={req.id} className="group relative rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-[#6366f1]/15 overflow-hidden">
                                            {/* Top gradient accent */}
                                            <div className="h-[3px] w-full bg-gradient-to-r from-[#6366f1] via-[#818cf8] to-[#a5b4fc]"></div>

                                            {isUrgent && (
                                                <div className="absolute top-4 right-4 z-10">
                                                    <span className="text-[10px] font-ui font-bold px-2 py-0.5 bg-error/10 text-error rounded-md border border-error/15 uppercase tracking-wider">Urgent</span>
                                                </div>
                                            )}

                                            <div className="p-5">
                                                <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 border-b border-slate-100 pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-[#6366f1]/10 text-[#6366f1] flex items-center justify-center text-[11px] font-bold">
                                                            {(req.requesterName || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-[13px] font-bold text-slate-900 leading-tight">{req.requesterName}</div>
                                                            <div className="text-[10px] text-slate-500 font-ui">{req.serviceDepartmentName}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-ui font-bold uppercase tracking-[0.12em] px-2 py-1 rounded-md bg-[#f0f2f8] text-on-surface-variant border border-[#dde1ed]">
                                                            {cfg.label}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-on-surface-variant/50">#{req.requestNumber}</span>
                                                    </div>
                                                </div>

                                                <h4 className="text-[15px] font-display font-semibold text-on-surface line-clamp-2 mb-3 leading-snug">{req.itemDescription}</h4>

                                                {req.materials && req.materials.length > 0 && (
                                                    <div className="mb-4 p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-lg text-[12px]">
                                                        <div className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                                                            📦 Items ({req.materials.length})
                                                        </div>
                                                        <div className="space-y-1">
                                                            {req.materials.slice(0, 3).map((m, idx) => (
                                                                <div key={idx} className="flex justify-between text-slate-700">
                                                                    <span className="font-medium">• {m.materialName}</span>
                                                                    <span className="text-slate-500">{m.quantity} {m.unit}</span>
                                                                </div>
                                                            ))}
                                                            {req.materials.length > 3 && (
                                                                <div className="text-[10px] text-indigo-600 font-medium">+{req.materials.length - 3} more items</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#eaecf5]">
                                                    <div className="text-[14px] font-display font-bold text-on-surface">
                                                        {req.totalEstimatedCost ? `₹${Number(req.totalEstimatedCost).toLocaleString('en-IN')}` : <span className="text-on-surface-variant/50 font-normal text-[12px]">Estimating…</span>}
                                                    </div>
                                                    <button
                                                        onClick={handler}
                                                        disabled={isActing}
                                                        className={`w-full sm:w-auto px-4 py-2 rounded-lg text-[12px] font-ui font-bold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-40 ${isUrgent
                                                            ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-sm shadow-red-500/20'
                                                            : 'bg-gradient-to-r from-[#6366f1] to-[#818cf8] shadow-sm shadow-[#6366f1]/20'
                                                        }`}
                                                    >
                                                        {isActing ? '...' : getActionLabel(req)}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* === WAITING ON OTHERS === */}
                    {waiting.length > 0 && (
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-5 h-5 rounded-md bg-warning/10 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                                </div>
                                <h3 className="text-[16px] font-display font-bold text-on-surface tracking-tight">Waiting on Others</h3>
                                <span className="px-2 py-0.5 rounded-md bg-warning/10 text-warning text-[11px] font-ui font-bold">
                                    {waiting.length}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                                {waiting.map(req => {
                                    const cfg = STATUS_CONFIG[req.status];
                                    return (
                                        <div key={req.id} className="relative flex items-start gap-3 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
                                            <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full bg-warning/50"></div>
                                            <div className="pl-2 min-w-0 flex-1">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[11px] font-ui text-on-surface-variant/60">#{req.requestNumber}</span>
                                                    <span className="text-[10px] font-ui font-bold px-2 py-0.5 rounded-md bg-[#f0f2f8] text-on-surface-variant border border-[#dde1ed]">
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                                <div className="text-[14px] font-display font-medium text-on-surface line-clamp-1 mb-0.5">{req.itemDescription}</div>
                                                <div className="text-[12px] font-ui text-on-surface-variant/60">{req.requesterName}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* === RECENTLY COMPLETED === */}
                    {completed.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-5 h-5 rounded-md bg-success/10 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                                </div>
                                <h3 className="text-[16px] font-display font-bold text-on-surface tracking-tight">Recently Completed</h3>
                                <span className="px-2 py-0.5 rounded-md bg-success/10 text-success text-[11px] font-ui font-bold">
                                    {completed.length}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                                {completed.slice(0, 8).map(req => (
                                    <div key={req.id} className="relative flex items-start gap-3 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
                                        <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full bg-success/40"></div>
                                        <div className="pl-2 min-w-0 flex-1">
                                            <div className="text-[11px] font-ui text-on-surface-variant/60 mb-1">#{req.requestNumber}</div>
                                            <div className="text-[14px] font-display font-medium text-on-surface line-clamp-1 mb-0.5">{req.itemDescription}</div>
                                            <div className="text-[12px] font-ui text-on-surface-variant/60">{req.requesterName}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Empty state */}
                    {actionable.length === 0 && waiting.length === 0 && completed.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[#6366f1]/8 flex items-center justify-center mb-5 shadow-sm">
                                <svg className="w-7 h-7 text-[#6366f1]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="text-[16px] font-display font-semibold text-on-surface mb-1">All Clear</h4>
                            <p className="text-[13px] font-ui text-on-surface-variant/60 max-w-[240px]">
                                No active requests right now. Enjoy the calm!
                            </p>
                        </div>
                    )}

                </div>
            </div>

            {/* Admin Review Modal */}
            {showReviewModal && selectedRequest && (
                <AdminReviewModal
                    isOpen={showReviewModal}
                    onClose={() => { setShowReviewModal(false); setSelectedRequest(null); }}
                    request={selectedRequest}
                    onSuccess={() => { setShowReviewModal(false); setSelectedRequest(null); fetchData(); }}
                />
            )}
        </>
    );
};

export default AdminDashboard;
