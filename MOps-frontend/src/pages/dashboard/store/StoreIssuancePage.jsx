import React, { useState, useEffect } from 'react';
import { requestService } from '../../../services/requestService';
import { inventoryService } from '../../../services/inventoryService';

const StoreIssuancePage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await requestService.getAdminRequestHistory();
            const procurementReqs = (data || []).filter(r => ['VENDOR_LIST_APPROVED', 'APPROVED'].includes(r.status));
            setRequests(procurementReqs);
        } catch (e) {
            console.error('Error loading issuance requests:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleIssueAll = async (reqId) => {
        setActionLoading(reqId);
        try {
            await requestService.markAllProcured(reqId);
            setToastMessage(`Issued materials for Request #${reqId}`);
            loadData();
            setTimeout(() => setToastMessage(null), 3500);
        } catch (e) {
            alert('Failed to issue items: ' + e.message);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="relative min-h-screen pb-24">
            <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8 pt-10 animate-fadeUp">
                
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs">🚚</div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Material Dispatch</span>
                        </div>
                        <h1 className="text-[28px] font-display font-semibold text-slate-900 tracking-tight">Material Issuance Queue</h1>
                        <p className="text-[13px] text-slate-500 mt-0.5">Approved maintenance requests pending store issuance to technicians & leads.</p>
                    </div>
                </div>

                {toastMessage && (
                    <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[14px] font-bold animate-fadeUp">
                        {toastMessage}
                    </div>
                )}

                {/* Queue Table */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-[14px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Requester & Ticket</th>
                                <th className="px-6 py-4">Item & Description</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Estimated Days</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Issuance Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">Loading issuance queue...</td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">No pending material issuances in queue.</td>
                                </tr>
                            ) : (
                                requests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 text-[15px] flex items-center gap-1.5">
                                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-bold">
                                                    {(req.requesterName || 'U').charAt(0).toUpperCase()}
                                                </span>
                                                {req.requesterName || 'Requester User'}
                                            </div>
                                            <div className="text-[11px] font-mono text-emerald-600/80 font-medium mt-0.5">
                                                #{req.requestNumber || req.id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            {req.itemDescription}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div className="font-medium text-slate-800">{req.organizationDepartmentName || req.dept || 'General Dept'}</div>
                                            <div className="text-[12px] text-slate-400">{req.serviceDepartmentName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {req.estimatedDays ? `${req.estimatedDays} Days` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                                                {req.status?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleIssueAll(req.id)}
                                                disabled={actionLoading === req.id}
                                                className="px-4 py-2 rounded-xl text-[12px] font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/20 hover:opacity-90 transition-all disabled:opacity-40"
                                            >
                                                {actionLoading === req.id ? 'Dispatching...' : '📦 Issue & Dispatch'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StoreIssuancePage;
