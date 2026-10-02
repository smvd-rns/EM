import React, { useState, useEffect, useCallback } from 'react';
import { requestService } from '../../../services/requestService';
import AdminReviewModal from '../../../components/requests/AdminReviewModal';
import { useNavigate, useLocation } from 'react-router-dom';
import Pagination from '../../../components/common/Pagination';

/**
 * Action Queue — Admin operations command center.
 * Categorizes requests into "Needs Your Action", "With SA / Requester", and "Completed".
 * Displays requester name and material items prominently on every card.
 */
const ADMIN_ACTIONABLE = [
    'REQUEST_CREATED',
    'NEGOTIATION_PENDING',
    'APPROVED',
    'VENDOR_LIST_APPROVED',
    'ITEMS_READY',
    'IN_PRODUCTION',
    'PAYMENT_PENDING',
];

const ADMIN_WAITING = [
    'QUOTATION_ADDED',
    'QUOTATION_APPROVED',
    'PENDING_SA_APPROVAL',
];

const ActionQueuePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [tab, setTab] = useState('pending'); // 'pending' | 'waiting' | 'completed'
    const [pendingRequests, setPendingRequests] = useState([]);
    const [waitingRequests, setWaitingRequests] = useState([]);
    const [completedRequests, setCompletedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        setCurrentPage(1);
    }, [tab]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [pendingResult, historyResult] = await Promise.allSettled([
            requestService.getPendingAdminRequests(),
            requestService.getAdminRequestHistory(),
        ]);

        const pending = pendingResult.status === 'fulfilled' ? (pendingResult.value || []) : [];
        const history = historyResult.status === 'fulfilled' ? (historyResult.value || []) : [];

        const map = new Map();
        [...pending, ...history].forEach(r => { if (!map.has(r.id)) map.set(r.id, r); });
        const all = Array.from(map.values());

        const actionable = all.filter(r => ADMIN_ACTIONABLE.includes(r.status));
        const waiting = all.filter(r => ADMIN_WAITING.includes(r.status));
        const done = all.filter(r => r.status === 'COMPLETED');

        setPendingRequests(actionable);
        setWaitingRequests(waiting);
        setCompletedRequests(done);
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const openReviewId = params.get('openReview');
        if (!openReviewId) return;

        requestService.getRequestById(openReviewId)
            .then(req => {
                setSelectedRequest(req);
                setShowReviewModal(true);
                navigate('/admin/queue', { replace: true });
            })
            .catch(console.error);
    }, [location.search, navigate]);

    const handleReviewSuccess = () => {
        setShowReviewModal(false);
        setSelectedRequest(null);
        fetchData();
    };

    const handleGenerateLists = async (reqId) => {
        setActionLoading(reqId);
        try { await requestService.generateLists(reqId); fetchData(); } catch (e) { alert(e.message); }
        setActionLoading(null);
    };

    const handleStartProduction = async (reqId) => {
        setActionLoading(reqId);
        try { await requestService.startProduction(reqId); fetchData(); } catch (e) { alert(e.message); }
        setActionLoading(null);
    };

    const handleCompleteProduction = async (reqId) => {
        setActionLoading(reqId);
        try { await requestService.completeProduction(reqId); fetchData(); } catch (e) { alert(e.message); }
        setActionLoading(null);
    };

    const handleConfirmPayment = async (reqId) => {
        setActionLoading(reqId);
        try { await requestService.confirmPayment(reqId); fetchData(); } catch (e) { alert(e.message); }
        setActionLoading(null);
    };

    const handleMarkItemProcured = async (materialId) => {
        setActionLoading(materialId);
        try { await requestService.markItemProcured(materialId); fetchData(); } catch (e) { alert(e.message); }
        setActionLoading(null);
    };

    const handleMarkAllProcured = async (reqId) => {
        setActionLoading(reqId);
        try { await requestService.markAllProcured(reqId); fetchData(); } catch (e) { alert(e.message); }
        setActionLoading(null);
    };

    /* ================== Status config ================== */
    const statusConfig = {
        REQUEST_CREATED:      { label: 'Submitted',          accent: '#6366f1' },
        QUOTATION_ADDED:      { label: 'With Super Admin',    accent: '#f59e0b' },
        QUOTATION_APPROVED:   { label: 'With Requester',      accent: '#10b981' },
        NEGOTIATION_PENDING:  { label: 'Negotiation Pending', accent: '#f59e0b' },
        APPROVED:             { label: 'User Accepted',      accent: '#10b981' },
        PENDING_SA_APPROVAL:  { label: 'Lists With SA',      accent: '#f59e0b' },
        VENDOR_LIST_APPROVED: { label: 'Vendor Approved',    accent: '#3b82f6' },
        ITEMS_READY:          { label: 'Items Ready',        accent: '#8b5cf6' },
        IN_PRODUCTION:        { label: 'In Production',      accent: '#f97316' },
        PAYMENT_PENDING:      { label: 'Payment Pending',    accent: '#ef4444' },
        COMPLETED:            { label: 'Completed',          accent: '#10b981' },
    };

    /* ================== Request Card ================== */
    const RequestCard = ({ req }) => {
        const cfg = statusConfig[req.status] || { label: req.status, accent: '#64748b' };
        const quotationReady = !!req.estimatedDays;
        const isActing = actionLoading === req.id;
        const st = req.status;
        const materials = req.materials || [];

        return (
            <div className="relative rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-[#6366f1]/20 overflow-hidden group">
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ background: cfg.accent }}></div>

                <div className="p-6 pl-7">
                    {/* Top Header Row: Requester Name prominently displayed + Status + Dept + Request # */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#6366f1]/10 text-[#6366f1] flex items-center justify-center text-[13px] font-bold">
                                {(req.requesterName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-[15px] font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                                    <span>{req.requesterName || 'Requester'}</span>
                                    {req.mobileNumber && <span className="text-[11px] text-slate-400 font-normal">({req.mobileNumber})</span>}
                                </div>
                                <div className="text-[11px] text-slate-500 font-ui">{req.organizationDepartmentName || 'Department'}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
                                style={{ background: cfg.accent }}
                            >
                                {cfg.label}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200">
                                {req.serviceDepartmentName}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 ml-1">#{req.requestNumber}</span>
                        </div>
                    </div>

                    {/* Description / Summary */}
                    <div className="mb-4">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Request Description</div>
                        <h4 className="text-[16px] font-bold text-slate-800 leading-snug">{req.itemDescription}</h4>
                    </div>

                    {/* Material Items Breakdown Box */}
                    {materials.length > 0 ? (
                        <div className="mb-5 border border-indigo-100 bg-indigo-50/40 rounded-xl overflow-hidden">
                            <div className="px-4 py-2 bg-indigo-100/50 border-b border-indigo-100 flex items-center justify-between text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                                <span>📦 Requested Items ({materials.length})</span>
                                {req.totalEstimatedCost && <span>Total: ₹{Number(req.totalEstimatedCost).toLocaleString('en-IN')}</span>}
                            </div>
                            <div className="p-3 divide-y divide-indigo-100/60">
                                {materials.map((m, idx) => (
                                    <div key={idx} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[13px]">
                                        <div>
                                            <span className="font-semibold text-slate-900">🔧 {m.materialName || m.material_name}</span>
                                            {(m.specification || m.specificationText) && (
                                                <span className="text-[11px] text-slate-500 block ml-4">{m.specification || m.specificationText}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-[12px]">
                                            <span className="font-medium text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">{m.quantity || m.quantityRequired} {m.unit}</span>
                                            {m.vendorName && <span className="text-slate-500">Vendor: {m.vendorName}</span>}
                                            {m.unitPrice && <span className="font-bold text-slate-800">₹{Number(m.totalPrice || 0).toFixed(2)}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        req.totalEstimatedCost && (
                            <div className="mb-5 flex items-center justify-between bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-3">
                                <span className="text-[13px] font-medium text-slate-700">Estimated Cost</span>
                                <span className="text-[15px] font-bold text-indigo-600">₹{Number(req.totalEstimatedCost).toLocaleString('en-IN')} ({req.estimatedDays} Days)</span>
                            </div>
                        )
                    )}

                    {/* Procurement checklist */}
                    {st === 'VENDOR_LIST_APPROVED' && materials.length > 0 && (
                        <div className="mb-5 border border-indigo-200 rounded-xl overflow-hidden bg-white shadow-sm">
                            <div className="px-4 py-2.5 bg-indigo-50 border-b border-indigo-100 text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center justify-between">
                                <span>🛒 Procurement Status</span>
                                <span>Mark items as procured</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {materials.map(m => (
                                    <div key={m.id} className="flex items-center justify-between px-4 py-3">
                                        <div className="flex-1">
                                            <div className="text-[13px] font-semibold text-slate-900">{m.materialName}</div>
                                            <div className="text-[11px] text-slate-500">
                                                {m.quantity} {m.unit} · Vendor: {m.vendorName || 'Unassigned'}
                                            </div>
                                        </div>
                                        {m.status === 'PROCURED' ? (
                                            <span className="text-[11px] font-bold text-emerald-700 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-200">✓ Procured</span>
                                        ) : (
                                            <button
                                                onClick={() => handleMarkItemProcured(m.id)}
                                                disabled={actionLoading === m.id}
                                                className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-40"
                                            >
                                                {actionLoading === m.id ? 'Marking...' : 'Mark Procured'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status note for waiting requests */}
                    {ADMIN_WAITING.includes(st) && (
                        <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-[13px] text-amber-900 font-medium flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                                <span>
                                    {st === 'QUOTATION_ADDED' && 'Quotation submitted — currently under Super Admin review.'}
                                    {st === 'QUOTATION_APPROVED' && 'Quotation approved by Super Admin — waiting for Requester final acceptance.'}
                                    {st === 'PENDING_SA_APPROVAL' && 'Vendor purchase lists generated — awaiting Super Admin final approval.'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3 flex-wrap items-center">
                        {st === 'REQUEST_CREATED' && (
                            <>
                                {!quotationReady ? (
                                    <button
                                        onClick={() => navigate(`/admin/create-quotation/${req.id}`)}
                                        className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-sm shadow-indigo-500/20 hover:opacity-95 active:scale-[0.97] transition-all"
                                    >
                                        Draft Quotation
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => { setSelectedRequest(req); setShowReviewModal(true); }}
                                        className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-sm shadow-emerald-500/20 hover:opacity-95 active:scale-[0.97] transition-all"
                                    >
                                        Finalize Assessment
                                    </button>
                                )}
                                {quotationReady && (
                                    <button
                                        onClick={() => navigate(`/admin/create-quotation/${req.id}`)}
                                        className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100 transition-colors"
                                    >
                                        Adjust Costs
                                    </button>
                                )}
                            </>
                        )}

                        {st === 'NEGOTIATION_PENDING' && (
                            <button
                                onClick={() => { setSelectedRequest(req); setShowReviewModal(true); }}
                                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 shadow-sm shadow-amber-500/20 hover:opacity-95 active:scale-[0.97] transition-all"
                            >
                                Review Negotiation Request
                            </button>
                        )}

                        {st === 'APPROVED' && (
                            <button
                                onClick={() => handleGenerateLists(req.id)}
                                disabled={isActing}
                                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-sm shadow-blue-500/20 hover:opacity-95 active:scale-[0.97] transition-all disabled:opacity-50"
                            >
                                {isActing ? 'Generating...' : '📋 Generate Vendor Purchase Lists'}
                            </button>
                        )}

                        {st === 'VENDOR_LIST_APPROVED' && (
                            <button
                                onClick={() => handleMarkAllProcured(req.id)}
                                disabled={isActing}
                                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-sm shadow-blue-500/20 hover:opacity-95 active:scale-[0.97] transition-all disabled:opacity-50"
                            >
                                {isActing ? 'Marking...' : '🛒 Complete Procurement'}
                            </button>
                        )}

                        {st === 'ITEMS_READY' && (
                            <button
                                onClick={() => handleStartProduction(req.id)}
                                disabled={isActing}
                                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 shadow-sm shadow-orange-500/20 hover:opacity-95 active:scale-[0.97] transition-all disabled:opacity-50"
                            >
                                {isActing ? 'Starting...' : '🏭 Start Production'}
                            </button>
                        )}

                        {st === 'IN_PRODUCTION' && (
                            <button
                                onClick={() => handleCompleteProduction(req.id)}
                                disabled={isActing}
                                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-red-600 to-red-500 shadow-sm shadow-red-500/20 hover:opacity-95 active:scale-[0.97] transition-all disabled:opacity-50"
                            >
                                {isActing ? 'Completing...' : '✅ Complete Production'}
                            </button>
                        )}

                        {st === 'PAYMENT_PENDING' && (
                            <button
                                onClick={() => handleConfirmPayment(req.id)}
                                disabled={isActing}
                                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-sm shadow-emerald-500/20 hover:opacity-95 active:scale-[0.97] transition-all disabled:opacity-50"
                            >
                                {isActing ? 'Confirming...' : '💰 Confirm Payment'}
                            </button>
                        )}

                        <button
                            onClick={() => { setSelectedRequest(req); setShowReviewModal(true); }}
                            className="px-4 py-2.5 rounded-xl text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ml-auto border border-slate-200"
                        >
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const activeList = tab === 'pending' ? pendingRequests : tab === 'waiting' ? waitingRequests : completedRequests;
    const paginatedList = activeList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="relative min-h-screen pb-24">
            <div className="relative px-6 sm:px-8 pt-10 max-w-5xl mx-auto animate-fadeUp">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#818cf8] flex items-center justify-center shadow-sm shadow-[#6366f1]/20">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <span className="text-[11px] font-ui font-bold uppercase tracking-[0.2em] text-[#6366f1]">Admin Operations</span>
                        </div>
                        <h1 className="text-[28px] font-display font-semibold text-on-surface tracking-tight mb-1">Action Queue</h1>
                        <p className="text-[14px] font-ui text-on-surface-variant/60">Process pending facility requests and track end-to-end status.</p>
                    </div>

                    <button
                        onClick={fetchData}
                        className="px-4 py-2 rounded-xl text-[13px] font-ui font-bold text-on-surface-variant bg-white/80 border border-white/60 shadow-sm hover:bg-white transition-all flex items-center gap-2"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Sync
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 mb-8 max-w-fit">
                    <button
                        onClick={() => setTab('pending')}
                        className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 ${tab === 'pending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        ⚡ Awaiting Action
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-indigo-100 text-indigo-700">{pendingRequests.length}</span>
                    </button>
                    <button
                        onClick={() => setTab('waiting')}
                        className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 ${tab === 'waiting' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        ⏳ With SA / Requester
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-800">{waitingRequests.length}</span>
                    </button>
                    <button
                        onClick={() => setTab('completed')}
                        className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 ${tab === 'completed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        ✅ Resolved
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-800">{completedRequests.length}</span>
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-6 rounded-2xl bg-slate-100 animate-pulse h-44"></div>
                        ))}
                    </div>
                ) : activeList.length === 0 ? (
                    <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-8 shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                            {tab === 'pending' ? '⚡' : tab === 'waiting' ? '⏳' : '✅'}
                        </div>
                        <h3 className="text-[17px] font-bold text-slate-800 mb-1">
                            {tab === 'pending' ? 'No Action Required' : tab === 'waiting' ? 'No Requests Awaiting External Review' : 'No Resolved Requests'}
                        </h3>
                        <p className="text-[13px] text-slate-500 max-w-sm mx-auto">
                            {tab === 'pending'
                                ? 'All requests requiring your immediate administrative action are processed.'
                                : tab === 'waiting'
                                ? 'There are no active requests currently under review by Super Admin or Requester.'
                                : 'Completed maintenance requests will be archived here.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {paginatedList.map(req => (
                            <RequestCard key={req.id} req={req} />
                        ))}
                        <Pagination
                            currentPage={currentPage}
                            totalItems={activeList.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                            pageSizeOptions={[10, 30, 50]}
                        />
                    </div>
                )}
            </div>

            {/* Admin Review Modal */}
            <AdminReviewModal
                isOpen={showReviewModal}
                onClose={() => { setShowReviewModal(false); setSelectedRequest(null); }}
                request={selectedRequest}
                onSuccess={handleReviewSuccess}
            />
        </div>
    );
};

export default ActionQueuePage;
