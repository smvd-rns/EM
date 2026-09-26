import React, { useState, useEffect } from 'react';
import { requestService } from '../../../services/requestService';

/**
 * SAInProductionPage — Super Admin view of requests currently in production.
 * Status: IN_PRODUCTION
 * Route: /super-admin/in-production
 */
const SAInProductionPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await requestService.getInProductionRequests();
            setRequests(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 animate-fadeUp">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-[28px] font-bold text-[#202124] tracking-tight mb-1">
                        In Production
                    </h1>
                    <p className="text-[14px] text-[#5f6368]">
                        Requests where work is currently underway by the maintenance team.
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 rounded-full text-[13px] font-medium text-[#5f6368] hover:bg-[#e8eaed] border border-[#dadce0] transition-colors"
                >
                    <svg className={`w-4 h-4 inline mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="card p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-9 h-9 bg-[#e8f0fe] rounded-lg flex items-center justify-center text-[16px]">🔨</span>
                        <div className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">In Production</div>
                    </div>
                    <div className="text-[28px] font-bold text-[#1a73e8]">{requests.length}</div>
                </div>
                <div className="card p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-9 h-9 bg-[#fef7e0] rounded-lg flex items-center justify-center text-[16px]">📋</span>
                        <div className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">Departments</div>
                    </div>
                    <div className="text-[28px] font-bold text-[#f9ab00]">
                        {new Set(requests.map(r => r.serviceDepartmentName)).size}
                    </div>
                </div>
                <div className="card p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-9 h-9 bg-[#fff3e0] rounded-lg flex items-center justify-center text-[16px]">💰</span>
                        <div className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">Total Value</div>
                    </div>
                    <div className="text-[28px] font-bold text-[#e65100]">
                        ₹{requests.reduce((sum, r) => sum + Number(r.totalEstimatedCost || 0), 0).toLocaleString('en-IN')}
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20 bg-[#f8f9fa] rounded-2xl border border-dashed border-[#dadce0]">
                    <div className="text-5xl mb-4">🔨</div>
                    <div className="text-[16px] font-bold text-[#202124] mb-1">No requests in production</div>
                    <div className="text-[13px] text-[#5f6368]">Requests appear here when admin starts production</div>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => {
                        const isExpanded = expandedId === req.id;
                        return (
                            <div key={req.id} className="card overflow-hidden transition-all">
                                <div
                                    className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 cursor-pointer hover:bg-[#f8f9fa] transition-colors gap-4"
                                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8] font-bold text-[15px] shrink-0">
                                            🔨
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[16px] font-semibold text-[#202124] truncate">
                                                {req.requestNumber || `Request #${req.id}`}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#5f6368]">
                                                <span>{req.serviceDepartmentName}</span>
                                                <span className="hidden xs:inline">·</span>
                                                <span>By {req.requesterName}</span>
                                                <span className="hidden xs:inline">·</span>
                                                <span>{req.materials?.length || 0} materials</span>
                                                {req.totalEstimatedCost && (
                                                    <>
                                                        <span className="hidden xs:inline">·</span>
                                                        <span className="font-medium text-[#1a73e8]">₹{Number(req.totalEstimatedCost).toLocaleString('en-IN')}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 pt-3 sm:pt-0">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-[12px] font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] animate-pulse"></div>
                                            In Production
                                        </span>
                                        <svg className={`w-5 h-5 text-[#5f6368] transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Expanded Material Table */}
                                {isExpanded && (
                                    <div className="border-t border-[#dadce0] px-6 py-5 overflow-x-auto custom-scrollbar">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-[13px] min-w-[600px]">
                                            <div><span className="text-[#5f6368]">Department:</span> <span className="font-medium">{req.serviceDepartmentName}</span></div>
                                            <div><span className="text-[#5f6368]">Requester:</span> <span className="font-medium">{req.requesterName}</span></div>
                                            <div><span className="text-[#5f6368]">Org Dept:</span> <span className="font-medium">{req.organizationDepartmentName}</span></div>
                                            <div><span className="text-[#5f6368]">Created:</span> <span className="font-medium">{formatDate(req.createdAt)}</span></div>
                                        </div>
                                        <div className="text-[13px] text-[#5f6368] mb-4 min-w-[600px]">
                                            <span className="font-medium text-[#202124]">Description:</span> {req.itemDescription}
                                        </div>
                                        {req.materials && req.materials.length > 0 && (
                                            <table className="w-full text-[13px] min-w-[800px]">
                                                <thead className="bg-[#f1f3f4]">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-[11px] font-bold text-[#5f6368] uppercase">#</th>
                                                        <th className="px-4 py-2 text-left text-[11px] font-bold text-[#5f6368] uppercase">Material</th>
                                                        <th className="px-4 py-2 text-right text-[11px] font-bold text-[#5f6368] uppercase">Qty</th>
                                                        <th className="px-4 py-2 text-left text-[11px] font-bold text-[#5f6368] uppercase">Vendor</th>
                                                        <th className="px-4 py-2 text-right text-[11px] font-bold text-[#5f6368] uppercase">Total</th>
                                                        <th className="px-4 py-2 text-center text-[11px] font-bold text-[#5f6368] uppercase">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#f1f3f4]">
                                                    {req.materials.map((mat, i) => (
                                                        <tr key={mat.id || i} className="hover:bg-[#f8f9fa]">
                                                            <td className="px-4 py-2.5 text-[#5f6368]">{i + 1}</td>
                                                            <td className="px-4 py-2.5">
                                                                <div className="font-medium text-[#202124]">{mat.materialName}</div>
                                                                {mat.specification && <div className="text-[11px] text-[#5f6368]">{mat.specification}</div>}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right font-medium">{mat.quantity} {mat.unit}</td>
                                                            <td className="px-4 py-2.5 text-[#5f6368]">{mat.vendorName || '—'}</td>
                                                            <td className="px-4 py-2.5 text-right font-semibold">₹{Number(mat.totalPrice || 0).toLocaleString('en-IN')}</td>
                                                            <td className="px-4 py-2.5 text-center">
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333] text-[11px] font-medium">
                                                                    ✓ Procured
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SAInProductionPage;
