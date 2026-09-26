import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import NewRequestModal from '../../components/requests/NewRequestModal';
import Button from '../../components/Button';
import StatusTracker from '../../components/dashboard/user/StatusTracker';

const UserDashboard = () => {
    const { user } = useAuth();
    const { activeRequests, stats, loading, error, refreshRequests } = useRequests();
    const [animatedStats, setAnimatedStats] = useState({ total: 0, active: 0, pending: 0, completed: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrackId, setSelectedTrackId] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [requestQuery, setRequestQuery] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (activeRequests.length > 0 && !selectedTrackId) {
            setSelectedTrackId(activeRequests[0].id);
        }
    }, [activeRequests, selectedTrackId]);

    useEffect(() => {
        if (!isDropdownOpen) return;

        const onPointerDown = (e) => {
            const el = dropdownRef.current;
            if (!el) return;
            if (el.contains(e.target)) return;
            setIsDropdownOpen(false);
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') setIsDropdownOpen(false);
        };

        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isDropdownOpen]);

    useEffect(() => {
        const duration = 800;
        const steps = 20;
        const stepTime = duration / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            setAnimatedStats({
                total: Math.floor(stats.total * progress),
                active: Math.floor(stats.active * progress),
                pending: Math.floor(stats.pending * progress),
                completed: Math.floor(stats.completed * progress),
            });

            if (currentStep >= steps) clearInterval(timer);
        }, stepTime);

        return () => clearInterval(timer);
    }, [stats]);

    const getDeptChip = (dept) => {
        const styles = {
            'Electrical': 'text-error bg-error-container/20 border-error/10',
            'Carpentry': 'text-warning bg-warning-container/20 border-warning/10',
            'Plumbing': 'text-primary bg-primary-container/20 border-primary/10',
            'EM': 'text-success bg-success-container/20 border-success/10'
        };
        const style = styles[dept] || 'text-on-surface-variant bg-surface-variant border-outline/10';
        return (
            <span className={`px-2.5 py-0.5 rounded-md border text-[12px] font-medium font-ui ${style}`}>
                {dept}
            </span>
        );
    };

    const currentReq = activeRequests.find(r => r.id === selectedTrackId);
    const selectedReqLabel =
        currentReq?.itemDescription ||
        (activeRequests.length > 0 ? 'Select a request' : 'No active requests');

    const filteredRequests = useMemo(() => {
        const q = requestQuery.trim().toLowerCase();
        if (!q) return activeRequests;
        return activeRequests.filter((r) => {
            const hay = [
                r.requestNumber || r.id,
                r.itemDescription,
                r.serviceDepartmentName,
                r.date,
                r.status
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return hay.includes(q);
        });
    }, [activeRequests, requestQuery]);

    const getStatusPill = (status) => {
        const s = String(status || '').toUpperCase();
        const map = {
            REQUEST_CREATED: 'bg-warning-container text-warning border-warning/20',
            QUOTATION_ADDED: 'bg-warning-container text-warning border-warning/20',
            APPROVED: 'bg-primary/10 text-primary border-primary/20',
            PENDING_SA_APPROVAL: 'bg-warning-container text-warning border-warning/20',
            VENDOR_LIST_APPROVED: 'bg-primary/10 text-primary border-primary/20',
            ITEMS_READY: 'bg-success/10 text-success border-success/20',
            IN_PRODUCTION: 'bg-primary/10 text-primary border-primary/20',
            PAYMENT_PENDING: 'bg-error-container text-error border-error/20',
            COMPLETED: 'bg-success text-white border-transparent',
            REJECTED: 'bg-error-container text-error border-error/20',
        };
        const cls = map[s] || 'bg-surface-variant/40 text-on-surface-variant border-outline/15';
        const label = status ? String(status).replace(/_/g, ' ') : '—';
        return (
            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-ui font-semibold whitespace-nowrap ${cls}`}>
                {label}
            </span>
        );
    };

    const statusToStage = (status) => {
        const s = (status || '').toUpperCase();
        if (!s) return 'Submitted';
        if (s === 'REJECTED') return 'Submitted';
        if (s === 'COMPLETED') return 'Completed';
        if (s === 'PAYMENT_PENDING') return 'Payment Pending';
        if (s === 'IN_PRODUCTION') return 'In Production';
        if (s === 'ITEMS_READY') return 'Ready';
        if (s === 'VENDOR_LIST_APPROVED') return 'Materials Sourced';
        if (s === 'PENDING_SA_APPROVAL' || s === 'QUOTATION_APPROVED' || s === 'APPROVED') return 'Approved';
        if (s === 'QUOTATION_ADDED') return 'Quotation Sent';
        if (s === 'REQUEST_CREATED') return 'Submitted';
        return 'Submitted';
    };

    if (loading) {
        return (
            <div className="pb-24 px-6 sm:px-8 pt-8 max-w-[1400px] mx-auto animate-fadeUp">
                <div className="mb-10 w-64 h-12 animate-skeleton rounded-2xl"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="card p-6 min-h-[160px] flex flex-col justify-between">
                            <div className="w-12 h-12 animate-skeleton rounded-2xl"></div>
                            <div className="w-24 h-10 animate-skeleton rounded-2xl"></div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col xl:flex-row gap-8">
                    <div className="flex-1 card p-8 min-h-[500px]">
                        <div className="w-1/3 h-8 animate-skeleton rounded-xl mb-8"></div>
                        <div className="w-full h-24 animate-skeleton rounded-2xl mb-12"></div>
                        <div className="w-full h-40 animate-skeleton rounded-2xl"></div>
                    </div>
                    <div className="w-full xl:w-[450px] card p-8 min-h-[500px]">
                        <div className="w-1/2 h-8 animate-skeleton rounded-xl mb-8"></div>
                        <div className="w-full h-40 animate-skeleton rounded-2xl mb-8"></div>
                        <div className="w-full h-14 animate-skeleton rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-[20px] font-display font-medium text-on-surface mb-2">Service Connection Error</h3>
                <p className="text-on-surface-variant font-ui max-w-sm mb-8">{error}</p>
                <Button variant="primary" onClick={refreshRequests}>
                    Reconnect Now
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="relative min-h-screen pb-24">

                <div className="relative px-6 sm:px-8 pt-10 max-w-[1400px] mx-auto animate-fadeUp">

                    {/* HEADER */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">

                        <div>
                            <h2 className="text-[32px] font-display font-semibold text-on-surface tracking-tight mb-2">
                                Hare Krishna, {user?.name?.replace(/\bDas\b/gi, '').trim() || user?.username || 'Krishna Das'} Prabhu
                            </h2>



                            {/* Lotus divider */}
                            <div className="flex items-center gap-4 mt-6 mb-2">

                                <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent"></div>

                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-sky-300 shadow-sm">
                                    <span className="text-[18px]">🪷</span>
                                </div>

                                <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent"></div>

                            </div>

                        </div>

                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                        {[
                            { label: 'Total Tickets', val: animatedStats.total, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', bg: 'bg-sky-100', color: 'text-sky-700', border: 'border-sky-300' },
                            { label: 'Active', val: animatedStats.active, icon: 'M13 10V3L4 14h7v7l9-11h-7z', bg: 'bg-sky-50', color: 'text-sky-600', border: 'border-sky-200' },
                            { label: 'Awaiting Review', val: animatedStats.pending, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0', bg: 'bg-amber-50', color: 'text-amber-600', border: 'border-amber-200' },
                            { label: 'Resolved', val: animatedStats.completed, icon: 'M5 13l4 4L19 7', bg: 'bg-emerald-50', color: 'text-emerald-600', border: 'border-emerald-200' }
                        ].map((s, i) => (

                            <div
                                key={i}
                                className="p-6 rounded-2xl bg-white border border-sky-200/80 shadow-md shadow-sky-100/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-sky-400"
                            >

                                <div className={`w-12 h-12 ${s.bg} ${s.border} border rounded-xl flex items-center justify-center mb-5`}>

                                    <svg
                                        className={`w-6 h-6 ${s.color}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                                    </svg>

                                </div>

                                <div>
                                    <div className="text-[32px] font-display font-bold text-slate-900 leading-none mb-1.5">
                                        {s.val}
                                    </div>

                                    <div className="text-[12px] font-ui font-semibold text-sky-800 uppercase tracking-wider">
                                        {s.label}
                                    </div>
                                </div>

                            </div>

                        ))}

                    </div>

                    {/* MAIN CARD */}
                    <div className="flex flex-col xl:flex-row gap-8">

                        <div className="flex-1 p-8 rounded-2xl bg-white border border-sky-200/80 shadow-md shadow-sky-100/60">

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-outline/40">

                                <div>
                                    <h3 className="text-[20px] font-display font-bold text-on-surface tracking-tight mb-1">
                                        Service Progress
                                    </h3>

                                    <p className="text-[13px] text-on-surface-variant font-ui">
                                        Track your maintenance request journey
                                    </p>
                                </div>

                                <div ref={dropdownRef} className="relative w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (activeRequests.length === 0) return;
                                            setIsDropdownOpen(v => {
                                                const next = !v;
                                                if (next) setRequestQuery('');
                                                return next;
                                            });
                                        }}
                                        className={`w-full sm:w-[340px] inline-flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border shadow-sm text-[13px] font-ui transition
            ${activeRequests.length === 0
                                                ? 'bg-surface-variant/50 border-outline/40 text-on-surface-variant/60 cursor-not-allowed'
                                                : 'bg-surface border-outline/60 text-on-surface hover:shadow-md hover:border-primary/50'}
        `}
                                        aria-haspopup="listbox"
                                        aria-expanded={isDropdownOpen}
                                        disabled={activeRequests.length === 0}
                                        title={selectedReqLabel}
                                    >
                                        <span className="truncate text-left">
                                            {selectedReqLabel}
                                            {activeRequests.length > 0 ? (
                                                <span className="ml-2 text-[12px] text-primary font-ui font-medium">
                                                    ({activeRequests.length})
                                                </span>
                                            ) : null}
                                        </span>
                                        <svg className={`w-4 h-4 flex-shrink-0 text-on-surface-variant transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {isDropdownOpen && activeRequests.length > 0 && (
                                        <div
                                            className="absolute right-0 mt-2 w-full sm:w-[420px] z-50 rounded-2xl border border-outline bg-surface shadow-2xl overflow-hidden"
                                            role="listbox"
                                            aria-label="Select maintenance request"
                                        >
                                            <div className="p-3 border-b border-outline/50 bg-surface-variant/40">
                                                <input
                                                    value={requestQuery}
                                                    onChange={(e) => setRequestQuery(e.target.value)}
                                                    autoFocus
                                                    placeholder="Search by ID, description, dept, date, status…"
                                                    className="w-full px-3 py-2 rounded-xl border border-outline/50 bg-surface text-[13px] font-ui text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                                />
                                                <div className="mt-2 text-[12px] font-ui text-on-surface-variant flex items-center justify-between">
                                                    <span>{filteredRequests.length} result(s)</span>
                                                    {requestQuery ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setRequestQuery('')}
                                                            className="text-primary font-ui font-semibold hover:underline"
                                                        >
                                                            Clear
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className="max-h-[320px] overflow-auto">
                                                {filteredRequests.length === 0 ? (
                                                    <div className="px-4 py-10 text-center">
                                                        <div className="text-[13px] font-ui font-semibold text-on-surface">No matches</div>
                                                        <div className="text-[12px] font-ui text-on-surface-variant mt-1">Try a different keyword.</div>
                                                    </div>
                                                ) : null}

                                                {filteredRequests.map((r) => {
                                                    const isSelected = r.id === selectedTrackId;
                                                    const line1 = r.itemDescription || `Request #${r.id}`;
                                                    const line2 = [r.serviceDepartmentName, r.date].filter(Boolean).join(' • ');
                                                    return (
                                                        <button
                                                            key={r.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedTrackId(r.id);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-3.5 border-b border-outline/10 transition
                                ${isSelected ? 'bg-primary/6' : 'hover:bg-surface-variant/20'}
                            `}
                                                            role="option"
                                                            aria-selected={isSelected}
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <div className="text-[13px] font-ui font-semibold text-on-surface truncate">
                                                                        {line1}
                                                                    </div>
                                                                    {line2 ? (
                                                                        <div className="text-[12px] font-ui text-on-surface-variant truncate mt-0.5">
                                                                            {line2}
                                                                        </div>
                                                                    ) : null}
                                                                    <div className="mt-1.5 flex items-center gap-2">
                                                                        <span className="text-[11px] font-ui font-semibold text-on-surface-variant">
                                                                            {r.id}
                                                                        </span>
                                                                        {getStatusPill(r.status)}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                                    {r.serviceDepartmentName ? getDeptChip(r.serviceDepartmentName) : null}
                                                                    {isSelected ? (
                                                                        <span className="inline-flex items-center gap-1.5 text-primary text-[12px] font-ui font-semibold">
                                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                            Selected
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* REQUEST CONTENT */}
                            {currentReq ? (

                                <div className="animate-fadeUp">

                                    <div className="mb-10 bg-primary/5 p-5 rounded-xl border border-primary/10">

                                        <h4 className="text-[16px] font-display font-medium text-on-surface mb-2">
                                            {currentReq.itemDescription}
                                        </h4>

                                        <div className="flex gap-2 flex-wrap">

                                            {getDeptChip(currentReq.serviceDepartmentName)}

                                            <span className="px-2.5 py-0.5 rounded-md border border-outline/40 bg-surface text-[12px] font-medium text-on-surface-variant">
                                                Submitted on {currentReq.date}
                                            </span>

                                        </div>

                                    </div>

                                    {/* TIMELINE */}
                                    <div className="rounded-2xl border border-outline/50 bg-surface shadow-sm p-6">
                                        <div className="flex items-center justify-between gap-4 mb-4">
                                            <div>
                                                <div className="text-[14px] font-ui font-semibold text-on-surface">Timeline</div>
                                                <div className="text-[12px] font-ui text-on-surface-variant">
                                                    {currentReq.status ? currentReq.status.replace(/_/g, ' ') : '—'}
                                                </div>
                                            </div>

                                            {String(currentReq.status || '').toUpperCase() === 'REJECTED' ? (
                                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-error-container text-error border border-error/20 text-[12px] font-ui font-semibold">
                                                    Rejected
                                                </span>
                                            ) : null}
                                        </div>

                                        <StatusTracker currentStage={statusToStage(currentReq.status)} />
                                    </div>

                                    {/* STATUS */}
                                    <div className="mt-8 flex-grow flex flex-col justify-center items-center text-center p-8 border border-dashed border-outline/40 rounded-2xl bg-surface-variant/40">

                                        <div className="text-[14px] font-medium text-on-surface-variant mb-3">
                                            Live Status
                                        </div>

                                        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-surface rounded-xl border border-outline/50 shadow-sm text-primary font-bold text-[14px]">

                                            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(26,115,232,0.6)]"></div>

                                            {currentReq.status.replace(/_/g, ' ')}

                                        </div>

                                        <p className="mt-4 text-[13px] text-on-surface-variant/60 max-w-sm leading-relaxed">
                                            Please remain peaceful. The service team will update you when the next phase begins.
                                        </p>

                                    </div>

                                </div>

                            ) : (

                                <div className="flex flex-col items-center justify-center py-24 text-center">

                                    <div className="w-20 h-20 bg-surface-variant/40 rounded-full flex items-center justify-center mb-6">

                                        <span className="text-3xl">🪷</span>

                                    </div>

                                    <h4 className="text-[17px] font-display font-medium text-on-surface mb-2">
                                        All Clear
                                    </h4>

                                    <p className="text-[14px] text-on-surface-variant max-w-[260px]">
                                        You currently have no active maintenance requests.
                                    </p>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

                {/* FLOATING BUTTON */}

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="fixed bottom-8 right-8 h-14 bg-sky-600 text-white px-6 rounded-full font-medium text-[15px] shadow-lg shadow-sky-600/35 hover:bg-sky-700 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 z-40"
                >

                    <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>

                    New Request

                </button>

            </div>

            <NewRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

        </>
    );
};

export default UserDashboard;
