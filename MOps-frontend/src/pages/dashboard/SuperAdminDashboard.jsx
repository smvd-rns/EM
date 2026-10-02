import React, { useState, useEffect, useCallback } from 'react';
import { requestService } from '../../services/requestService';
import SuperAdminReviewModal from '../../components/requests/SuperAdminReviewModal';
import SARequestDetailModal from '../../components/requests/SARequestDetailModal';
import UserManagementSection from '../../components/dashboard/superadmin/UserManagementSection';
import MaterialsPage from './admin/MaterialsPage';
import StoreInventoryPage from './store/StoreInventoryPage';

/**
 * Super Admin Dashboard — clean card-based layout.
 * System Operations + User Role Management + Material Database + Store Inventory.
 */

const STATUS_CONFIG = {
    QUOTATION_ADDED: { label: 'Quotation Review', color: '#f9ab00', bg: '#fef7e0', icon: '📝', action: 'Review & Approve' },
    PENDING_SA_APPROVAL: { label: 'Vendor Lists', color: '#1565c0', bg: '#e3f2fd', icon: '📋', action: 'Approve Lists' },
    QUOTATION_APPROVED: { label: 'With Requester', color: '#5e6c84', bg: '#f1f3f4', icon: '⏳' },
    APPROVED: { label: 'Approved', color: '#137333', bg: '#e6f4ea', icon: '✅' },
    VENDOR_LIST_APPROVED: { label: 'Procurement', color: '#1565c0', bg: '#e3f2fd', icon: '🛒' },
    ITEMS_READY: { label: 'Items Ready', color: '#9334ea', bg: '#f3e8fd', icon: '📦' },
    IN_PRODUCTION: { label: 'Production', color: '#e65100', bg: '#fff3e0', icon: '🏭' },
    PAYMENT_PENDING: { label: 'Payment', color: '#c62828', bg: '#fce4ec', icon: '💰' },
    COMPLETED: { label: 'Completed', color: '#137333', bg: '#e6f4ea', icon: '🎉' },
    REQUEST_CREATED: { label: 'New', color: '#1a73e8', bg: '#e8f0fe', icon: '📋' },
};

const SuperAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('OVERVIEW');
    const [allRequests, setAllRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [detailRequest, setDetailRequest] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const timeoutId = setTimeout(() => {
            setLoading(false);
        }, 1200);

        try {
            const data = await requestService.getSuperAdminRequestHistory();
            setAllRequests(data || []);
        } catch (e) {
            console.error("Error fetching data:", e);
            setAllRequests([]);
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const quotationReview = allRequests.filter(r => r.status === 'QUOTATION_ADDED');
    const listsApproval = allRequests.filter(r => r.status === 'PENDING_SA_APPROVAL');
    const inProgress = allRequests.filter(r => ['QUOTATION_APPROVED', 'APPROVED', 'VENDOR_LIST_APPROVED', 'ITEMS_READY', 'IN_PRODUCTION', 'PAYMENT_PENDING', 'REQUEST_CREATED'].includes(r.status));
    const completed = allRequests.filter(r => r.status === 'COMPLETED');

    const actionable = [...quotationReview, ...listsApproval];


    // State for animated stats
    const [animatedStats, setAnimatedStats] = useState({ actionable: 0, active: 0, completed: 0, total: 0 });

    useEffect(() => {
        const targets = { actionable: actionable.length, active: inProgress.length, completed: completed.length, total: allRequests.length };
        const duration = 600;
        const steps = 20;
        const stepTime = duration / steps;
        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            setAnimatedStats({
                actionable: Math.floor(targets.actionable * progress),
                active: Math.floor(targets.active * progress),
                completed: Math.floor(targets.completed * progress),
                total: Math.floor(targets.total * progress),
            });
            if (currentStep >= steps) clearInterval(timer);
        }, stepTime);
        return () => clearInterval(timer);
    }, [actionable.length, inProgress.length, completed.length, allRequests.length]);

    const handleApproveVendorLists = async (reqId) => {
        setActionLoading(reqId);
        try {
            await requestService.approveVendorLists(reqId);
            fetchData();
        } catch (e) { alert(e.message); }
        setActionLoading(null);
    };

    /* Loading skeleton */
    if (loading) {
        return (
            <div className="pb-24 px-6 sm:px-8 pt-8 max-w-[1400px] mx-auto animate-fadeUp">
                <div className="mb-10 w-64 h-12 animate-skeleton rounded-2xl"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-6 min-h-[130px] flex flex-col justify-between rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                            <div className="w-12 h-4 animate-skeleton rounded-lg"></div>
                            <div className="w-20 h-10 animate-skeleton rounded-lg"></div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-7 min-h-[320px] flex flex-col justify-between rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
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
                    {/* HEADER — Executive Profile Style */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center shadow-md shadow-[#7c3aed]/20">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h2 className="text-[30px] font-display font-semibold text-on-surface tracking-tight mb-1">
                                    Superadmin Dashboard
                                </h2>
                            </div>




                            {/* Violet line divider */}
                            <div className="flex items-center gap-3 mt-5">
                                <div className="flex-1 h-[1px] bg-gradient-to-r from-[#7c3aed]/30 via-[#7c3aed]/15 to-transparent"></div>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]/40"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]/25"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]/15"></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                                <button
                                    onClick={() => setActiveTab('OVERVIEW')}
                                    className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'OVERVIEW' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    ⚡ Operations
                                </button>
                                <button
                                    onClick={() => setActiveTab('USERS')}
                                    className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'USERS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    👥 User Roles
                                </button>
                                <button
                                    onClick={() => setActiveTab('MATERIALS')}
                                    className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'MATERIALS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    📦 Materials
                                </button>
                                <button
                                    onClick={() => setActiveTab('INVENTORY')}
                                    className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'INVENTORY' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    🏬 Store Inventory
                                </button>
                            </div>

                            <div className="px-4 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-[#7c3aed]/10 shadow-sm flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse shadow-[0_0_8px_rgba(124,58,237,0.5)]"></div>
                                <span className="text-[11px] font-ui font-bold text-[#7c3aed]/80 uppercase tracking-[0.15em]">Live</span>
                            </div>
                            <button
                                onClick={fetchData}
                                className="w-11 h-11 rounded-xl bg-white/80 backdrop-blur-sm border border-[#7c3aed]/10 flex items-center justify-center hover:bg-[#7c3aed]/5 hover:border-[#7c3aed]/25 hover:scale-105 active:scale-95 transition-all shadow-sm"
                                title="Refresh"
                            >
                                <svg className="w-4.5 h-4.5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {activeTab === 'USERS' ? (
                        <UserManagementSection />
                    ) : activeTab === 'MATERIALS' ? (
                        <MaterialsPage />
                    ) : activeTab === 'INVENTORY' ? (
                        <StoreInventoryPage />
                    ) : (
                        <>

                    {/* STATS — Executive horizontal strip cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        {[
                            { label: 'Strategic Ops', val: animatedStats.actionable, accent: '#7c3aed', icon: '⚡' },
                            { label: 'Active Ops', val: animatedStats.active, accent: '#d97706', icon: '🏭' },
                            { label: 'Archived', val: animatedStats.completed, accent: '#059669', icon: '✅' },
                            { label: 'Total Network', val: animatedStats.total, accent: '#475569', icon: '🌐' },
                        ].map((s, i) => (
                            <div
                                key={i}
                                className="group relative flex items-center gap-5 p-5 rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#7c3aed]/15 overflow-hidden"
                            >
                                {/* Left accent bar */}
                                <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: s.accent }}></div>

                                <div className="pl-3 w-full">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <div className="text-[28px] font-display font-bold text-on-surface leading-none" style={{ color: s.accent }}>
                                            {s.val}
                                        </div>
                                        <div className="text-[18px] opacity-70">{s.icon}</div>
                                    </div>
                                    <div className="text-[11px] font-ui font-semibold text-on-surface-variant uppercase tracking-wider">
                                        {s.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* === STRATEGIC OPS (ACTIONABLE) === */}
                    {actionable.length > 0 && (
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-5 h-5 rounded-md bg-[#7c3aed]/10 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]"></div>
                                </div>
                                <h3 className="text-[16px] font-display font-bold text-on-surface tracking-tight">Authority Oversight Hub</h3>
                                <span className="px-2 py-0.5 rounded-md bg-[#7c3aed]/10 text-[#7c3aed] text-[11px] font-ui font-bold">
                                    {actionable.length} Action{actionable.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {actionable.map(req => {
                                    const cfg = STATUS_CONFIG[req.status];
                                    const isActing = actionLoading === req.id;
                                    const isQuotation = req.status === 'QUOTATION_ADDED';

                                    const highValue = Number(req.totalEstimatedCost) >= 15000;
                                    const daysOld = req.createdAt ? Math.floor((new Date() - new Date(req.createdAt)) / (1000 * 60 * 60 * 24)) : 0;
                                    const isUrgent = highValue || daysOld >= 2;

                                    return (
                                        <div key={req.id} className="group relative rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-[#7c3aed]/15 overflow-hidden flex flex-col justify-between min-h-[220px]">
                                            {/* Top gradient accent */}
                                            <div className="h-[3px] w-full bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#ddd6fe]"></div>

                                            {isUrgent && (
                                                <div className="absolute top-4 right-4 z-10">
                                                    <span className="text-[10px] font-ui font-bold px-2 py-0.5 bg-error/10 text-error rounded-md border border-error/15 uppercase tracking-wider">
                                                        {highValue ? 'High Value' : 'Aged'}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex flex-wrap items-center gap-2.5 mb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/8 flex items-center justify-center text-[16px]">
                                                        {cfg.icon}
                                                    </div>
                                                    <span className="text-[10px] font-ui font-bold uppercase tracking-[0.12em] px-2 py-1 rounded-md text-[#7c3aed] bg-[#7c3aed]/10 border border-[#7c3aed]/20">
                                                        {cfg.label}
                                                    </span>
                                                    <span className="ml-auto text-[11px] font-ui font-medium text-on-surface-variant/60">#{req.requestNumber}</span>
                                                </div>

                                                <h4 className="text-[16px] font-display font-semibold text-on-surface line-clamp-2 mb-4 leading-snug">{req.itemDescription}</h4>

                                                <div className="mt-auto">
                                                    <div className="flex items-center justify-between mb-4 text-[12px] text-on-surface-variant">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-5 h-5 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center text-[10px] font-ui font-bold">
                                                                {(req.requesterName || 'U').charAt(0)}
                                                            </div>
                                                            <span className="font-ui">{req.requesterName}</span>
                                                        </div>
                                                        <span className="px-2 py-1 bg-surface-variant rounded-md text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest">{req.serviceDepartmentName}</span>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#f1f5f9]">
                                                        <div className="text-[14px] font-display font-bold text-on-surface">
                                                            {req.totalEstimatedCost ? `₹${Number(req.totalEstimatedCost).toLocaleString('en-IN')}` : <span className="text-on-surface-variant/50 font-normal text-[12px]">Estimating…</span>}
                                                        </div>
                                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                                            <button
                                                                onClick={() => { setDetailRequest(req); setIsDetailOpen(true); }}
                                                                className="px-3 py-2 rounded-lg text-[12px] font-ui font-bold text-[#475569] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors"
                                                            >
                                                                Details
                                                            </button>
                                                            {isQuotation ? (
                                                                <button
                                                                    onClick={() => { setSelectedRequest(req); setShowReviewModal(true); }}
                                                                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[12px] font-ui font-bold text-white transition-all hover:opacity-90 active:scale-[0.97] ${isUrgent
                                                                        ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-sm shadow-red-500/20'
                                                                        : 'bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] shadow-sm shadow-[#7c3aed]/20'
                                                                        }`}
                                                                >
                                                                    {cfg.action}
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleApproveVendorLists(req.id)}
                                                                    disabled={isActing}
                                                                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[12px] font-ui font-bold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-40 ${isUrgent
                                                                        ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-sm shadow-red-500/20'
                                                                        : 'bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] shadow-sm shadow-[#7c3aed]/20'
                                                                        }`}
                                                                >
                                                                    {isActing ? 'Wait...' : cfg.action}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {inProgress.length > 0 && (
                        <section className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-2 rounded-full bg-[#e65100]"></div>
                                <h2 className="text-[17px] font-display font-semibold text-on-surface">In Progress</h2>
                                <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#fff3e0] text-[#e65100]">{inProgress.length}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {inProgress.map(req => {
                                    const cfg = STATUS_CONFIG[req.status] || { label: req.status, color: '#5e6c84', bg: '#f1f3f4', icon: '📎' };
                                    return (
                                        <div
                                            key={req.id}
                                            className="card p-5 cursor-pointer flex flex-col justify-between min-h-[140px]"
                                            onClick={() => { setDetailRequest(req); setIsDetailOpen(true); }}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[12px] font-medium text-on-surface-variant">#{req.requestNumber}</span>
                                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ background: cfg.bg, color: cfg.color }}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <div className="text-[15px] font-display font-medium text-on-surface line-clamp-1 mb-2">{req.itemDescription}</div>
                                            <div className="flex items-center gap-3 text-[13px] text-on-surface-variant">
                                                <span>{req.requesterName}</span>
                                                {req.totalEstimatedCost && (
                                                    <span className="text-[13px] font-bold text-success">₹{Number(req.totalEstimatedCost).toLocaleString('en-IN')}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {completed.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-2 rounded-full bg-[#137333]"></div>
                                <h2 className="text-[17px] font-display font-semibold text-on-surface">Recently Completed</h2>
                                <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333]">{completed.length}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                                {completed.slice(0, 8).map(req => (
                                    <div
                                        key={req.id}
                                        className="card p-5 cursor-pointer flex flex-col justify-between min-h-[120px]"
                                        onClick={() => { setDetailRequest(req); setIsDetailOpen(true); }}
                                    >
                                        <div>
                                            <div className="text-[12px] text-on-surface-variant mb-1">#{req.requestNumber}</div>
                                            <div className="text-[14px] font-medium text-on-surface line-clamp-1">{req.itemDescription}</div>
                                        </div>
                                        <div className="text-[13px] text-on-surface-variant">{req.requesterName}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {allRequests.length === 0 && (
                        <div className="text-center py-20 bg-surface-variant/20 rounded-2xl border border-dashed border-outline/20">
                            <div className="text-5xl mb-4 opacity-30">✨</div>
                            <div className="text-[17px] font-display font-medium text-on-surface mb-1">All clear</div>
                        </div>
                    )}
                    </>
                    )}
                </div>
            </div>

            {/* Modals moved outside animating div */}
            {showReviewModal && selectedRequest && (
                <SuperAdminReviewModal
                    isOpen={showReviewModal}
                    onClose={() => { setShowReviewModal(false); setSelectedRequest(null); }}
                    onSuccess={() => { setShowReviewModal(false); setSelectedRequest(null); fetchData(); }}
                    request={selectedRequest}
                />
            )}
            <SARequestDetailModal
                isOpen={isDetailOpen}
                onClose={() => { setIsDetailOpen(false); setDetailRequest(null); }}
                request={detailRequest}
            />
        </>
    );
};

export default SuperAdminDashboard;
