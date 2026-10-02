import React, { useMemo, useState, useEffect } from 'react';
import { useRequests } from '../../context/RequestContext';
import RequestDetailsModal from '../../components/requests/RequestDetailsModal';
import Button from '../../components/Button';
import Pagination from '../../components/common/Pagination';

const RequestsPage = () => {
    const { requests, refreshRequests, loading, error } = useRequests();
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | ACTIVE | COMPLETED | REJECTED | PAYMENT_PENDING
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        setCurrentPage(1);
    }, [query, statusFilter]);

    const handleApprovalSuccess = () => {
        refreshRequests();
        setSelectedRequest(null);
    };

    const getStatusChip = (status) => {
        const styles = {
            'REQUEST_CREATED': 'bg-primary-container text-primary border-primary/20',
            'QUOTATION_ADDED': 'bg-warning-container text-warning border-warning/20',
            'QUOTATION_APPROVED': 'bg-[#e8f5e9] text-[#2e7d32] border-[#2e7d32]/20',
            'APPROVED': 'bg-success-container text-success border-success/20',
            'PENDING_SA_APPROVAL': 'bg-warning-container text-warning border-warning/20',
            'VENDOR_LIST_APPROVED': 'bg-[#e3f2fd] text-[#1565c0] border-[#1565c0]/20',
            'ITEMS_READY': 'bg-[#f3e8fd] text-[#9334ea] border-[#9334ea]/20',
            'IN_PRODUCTION': 'bg-[#fff3e0] text-[#e65100] border-[#e65100]/20',
            'PAYMENT_PENDING': 'bg-[#fce4ec] text-[#c62828] border-[#c62828]/20',
            'COMPLETED': 'bg-success text-white border-transparent',
            'REJECTED': 'bg-error-container text-error border-error/20'
        };
        const style = styles[status] || 'bg-surface-variant text-on-surface-variant border-outline/30';

        return (
            <span className={`inline-flex items-center px-3 py-0.5 rounded-pill border text-[11px] font-medium font-ui tracking-wide uppercase ${style}`}>
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

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

    const filteredRequests = useMemo(() => {
        const q = query.trim().toLowerCase();
        let rows = requests;

        if (statusFilter !== 'ALL') {
            if (statusFilter === 'ACTIVE') {
                rows = rows.filter(r => r.status !== 'COMPLETED');
            } else {
                rows = rows.filter(r => r.status === statusFilter);
            }
        }

        if (!q) return rows;
        return rows.filter((r) => {
            const hay = [
                r.requestNumber,
                r.id,
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
    }, [requests, query, statusFilter]);

    const paginatedRequests = useMemo(() => {
        return filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }, [filteredRequests, currentPage, pageSize]);

    const counts = useMemo(() => {
        const active = requests.filter(r => r.status !== 'COMPLETED').length;
        const completed = requests.filter(r => r.status === 'COMPLETED').length;
        const rejected = requests.filter(r => r.status === 'REJECTED').length;
        const paymentPending = requests.filter(r => r.status === 'PAYMENT_PENDING').length;
        return { active, completed, rejected, paymentPending, total: requests.length };
    }, [requests]);

    return (
        <div className="relative pb-24 px-6 sm:px-8 pt-8 max-w-[1400px] mx-auto animate-fadeUp">
            <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <h1 className="text-[32px] text-on-surface font-display font-medium tracking-tight mb-2">My Requests</h1>
                    <p className="text-[15px] text-on-surface-variant font-ui">Manage and monitor your facility maintenance service tickets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={refreshRequests} className="h-10 px-4 text-[13px]">
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="card border-outline bg-surface overflow-hidden shadow-xl">
                <div className="px-6 py-5 border-b border-outline bg-surface-variant/40">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-[18px] font-display font-bold text-on-surface">Requests</h3>
                            <span className="text-[12px] font-ui font-semibold text-accent bg-primary-container border border-primary/20 px-2.5 py-0.5 rounded-full">
                                {filteredRequests.length} / {counts.total}
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative w-full sm:w-[340px]">
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by request #, description, dept, date, status…"
                                    className="w-full h-10 px-4 rounded-xl border border-outline bg-surface text-[13px] font-ui text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                                />
                                {query ? (
                                    <button
                                        type="button"
                                        onClick={() => setQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                                        aria-label="Clear search"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {[
                            { key: 'ALL', label: 'All', count: counts.total },
                            { key: 'ACTIVE', label: 'Active', count: counts.active },
                            { key: 'PAYMENT_PENDING', label: 'Payment Pending', count: counts.paymentPending },
                            { key: 'REJECTED', label: 'Rejected', count: counts.rejected },
                            { key: 'COMPLETED', label: 'Completed', count: counts.completed }
                        ].map(t => {
                            const active = statusFilter === t.key;
                            return (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setStatusFilter(t.key)}
                                    className={`h-9 px-3 rounded-full border text-[12px] font-ui font-semibold transition inline-flex items-center gap-2
                                        ${active ? 'bg-primary text-white border-transparent shadow-md' : 'bg-surface-variant border-outline text-on-surface-variant hover:text-on-surface hover:border-outline/80'}
                                    `}
                                >
                                    <span>{t.label}</span>
                                    <span className={`${active ? 'bg-white/20 text-white' : 'bg-surface border border-outline/50 text-on-surface'} px-2 py-0.5 rounded-full text-[11px]`}>
                                        {t.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {error ? (
                    <div className="px-6 py-12 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-error-container text-error border border-error/20 text-[13px] font-ui font-semibold">
                            {error}
                        </div>
                        <div className="mt-6">
                            <Button variant="primary" onClick={refreshRequests}>Retry</Button>
                        </div>
                    </div>
                ) : null}

                {loading ? (
                    <div className="px-6 py-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="p-5 rounded-2xl border border-outline/20 bg-white animate-skeleton min-h-[120px]" />
                            ))}
                        </div>
                    </div>
                ) : null}

                {!loading && !error ? (
                <>
                {/* Mobile cards */}
                <div className="block lg:hidden px-6 py-6">
                    <div className="grid grid-cols-1 gap-4">
                        {paginatedRequests.map((req, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedRequest(req)}
                                className="text-left p-5 rounded-2xl border border-outline bg-surface hover:shadow-md hover:border-primary/40 transition"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-[14px] font-ui font-bold text-primary truncate">
                                            #{req.requestNumber}
                                        </div>
                                        <div className="mt-1 text-[14px] font-body text-on-surface font-medium truncate" title={req.itemDescription}>
                                            {req.itemDescription}
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                                            {getDeptChip(req.serviceDepartmentName)}
                                            <span className="text-[12px] font-ui text-on-surface-variant">{req.date}</span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {getStatusChip(req.status)}
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <span className="text-[12px] font-ui font-semibold text-primary">View details</span>
                                </div>
                            </button>
                        ))}

                        {filteredRequests.length === 0 && (
                            <div className="py-10 text-center">
                                <div className="flex flex-col items-center gap-3 opacity-50">
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="font-ui text-[14px]">No requests match your filters.</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0 min-w-[900px]">
                        <thead>
                            <tr className="bg-surface-variant/30">
                                <th className="px-6 py-4 text-[12px] font-bold font-ui text-on-surface-variant uppercase tracking-[1px] border-b border-outline/30">Request ID</th>
                                <th className="px-6 py-4 text-[12px] font-bold font-ui text-on-surface-variant uppercase tracking-[1px] border-b border-outline/30">Category</th>
                                <th className="px-6 py-4 text-[12px] font-bold font-ui text-on-surface-variant uppercase tracking-[1px] border-b border-outline/30">Description</th>
                                <th className="px-6 py-4 text-[12px] font-bold font-ui text-on-surface-variant uppercase tracking-[1px] border-b border-outline/30">Created Date</th>
                                <th className="px-6 py-4 text-[12px] font-bold font-ui text-on-surface-variant uppercase tracking-[1px] border-b border-outline/30">Status</th>
                                <th className="px-6 py-4 text-[12px] font-bold font-ui text-on-surface-variant uppercase tracking-[1px] border-b border-outline/30 text-right">Activity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline/10">
                            {paginatedRequests.map((req, i) => (
                                <tr
                                    key={i}
                                    onClick={() => setSelectedRequest(req)}
                                    className="hover:bg-primary-container/10 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <span className="text-[14px] font-medium font-ui text-primary group-hover:underline">
                                            #{req.requestNumber}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{getDeptChip(req.serviceDepartmentName)}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-[14px] font-body text-on-surface max-w-[280px] truncate" title={req.itemDescription}>
                                            {req.itemDescription}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[14px] font-body text-on-surface-variant">
                                        {req.date}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusChip(req.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            className="h-8 px-4 text-[13px]"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedRequest(req);
                                            }}
                                        >
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="font-ui text-[14px]">No requests match your filters.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredRequests.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    pageSizeOptions={[10, 30, 50]}
                />
                </>
                ) : null}
            </div>

            <RequestDetailsModal
                isOpen={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                request={selectedRequest}
                onSuccess={handleApprovalSuccess}
            />
        </div>
    );
};

export default RequestsPage;
