import React, { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '../../../services/inventoryService';
import { requestService } from '../../../services/requestService';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';

const StoreManagerDashboard = () => {
    const { user } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [issuanceRequests, setIssuanceRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Restock Modal
    const [selectedItem, setSelectedItem] = useState(null);
    const [actionQty, setActionQty] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const loadOverviewData = useCallback(async () => {
        setLoading(true);
        try {
            const [invData, reqData] = await Promise.allSettled([
                inventoryService.getAllInventory(),
                requestService.getAdminRequestHistory()
            ]);

            if (invData.status === 'fulfilled') {
                setInventory(invData.value || []);
            }
            if (reqData.status === 'fulfilled') {
                const pending = (reqData.value || []).filter(r => ['VENDOR_LIST_APPROVED', 'APPROVED'].includes(r.status));
                setIssuanceRequests(pending);
            }
        } catch (e) {
            console.error('Error loading store overview:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOverviewData();
    }, [loadOverviewData]);

    const lowStockItems = inventory.filter(i => i.quantityAvailable <= i.minThreshold);
    const healthyStockItems = inventory.filter(i => i.quantityAvailable > i.minThreshold);
    const outOfStockItems = inventory.filter(i => i.quantityAvailable === 0);

    const handleRestock = async (e) => {
        e.preventDefault();
        if (!selectedItem || !actionQty || Number(actionQty) <= 0) return;

        setActionLoading(true);
        try {
            const qtyNum = Number(actionQty);
            const newQty = selectedItem.quantityAvailable + qtyNum;

            await inventoryService.updateStock(selectedItem.id, newQty);
            setToastMessage(`Restocked +${qtyNum} ${selectedItem.unit} for ${selectedItem.materialName}`);
            
            setInventory(prev => prev.map(item => item.id === selectedItem.id ? { ...item, quantityAvailable: newQty } : item));
            setSelectedItem(null);
            setActionQty('');
            setTimeout(() => setToastMessage(null), 3500);
        } catch (err) {
            alert('Failed to restock item: ' + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const [issuanceLoading, setIssuanceLoading] = useState(null);

    const handleIssueRequest = async (reqId) => {
        setIssuanceLoading(reqId);
        try {
            await requestService.markAllProcured(reqId);
            setToastMessage(`Successfully dispatched materials for Request #${reqId}`);
            await loadOverviewData();
            setTimeout(() => setToastMessage(null), 3500);
        } catch (e) {
            alert('Failed to issue items: ' + e.message);
        } finally {
            setIssuanceLoading(null);
        }
    };

    return (
        <div className="relative min-h-screen pb-24">
            <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8 pt-10 animate-fadeUp space-y-10">
                
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-slate-200/90 p-8 rounded-3xl shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/20">
                                🏬
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-700">Store Executive Dashboard</span>
                        </div>
                        <h1 className="text-[32px] font-display font-bold text-slate-900 tracking-tight">
                            Hare Krishna, <span className="text-emerald-700">{user?.name || 'Store Manager'} Prabhu</span>
                        </h1>
                        <p className="text-[14px] text-slate-600 font-medium mt-1 max-w-xl">
                            Overview of facility store operations, critical reorder alerts, and pending material dispatches.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center gap-3">
                        <Link
                            to="/store-manager/inventory"
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
                        >
                            📦 Master Inventory
                        </Link>
                        <Link
                            to="/store-manager/issuance"
                            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-bold border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-2"
                        >
                            🚚 Issuance Queue ({issuanceRequests.length})
                        </Link>
                    </div>
                </div>

                {/* Toast Notification */}
                {toastMessage && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[14px] font-bold flex items-center justify-between animate-fadeUp">
                        <span>{toastMessage}</span>
                        <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
                    </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total SKUs</span>
                            <div className="text-[28px] font-bold text-slate-900 mt-1">{inventory.length}</div>
                            <span className="text-[12px] text-slate-400 font-medium">In Store Database</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">🏬</div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Stock</span>
                            <div className="text-[28px] font-bold text-emerald-600 mt-1">{healthyStockItems.length}</div>
                            <span className="text-[12px] text-emerald-600/80 font-medium">Above Threshold</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">✅</div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Low Stock Alerts</span>
                            <div className="text-[28px] font-bold text-amber-600 mt-1">{lowStockItems.length}</div>
                            <span className="text-[12px] text-amber-600/80 font-medium">Needs Reordering</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">⚠️</div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Issuances</span>
                            <div className="text-[28px] font-bold text-indigo-600 mt-1">{issuanceRequests.length}</div>
                            <span className="text-[12px] text-indigo-600/80 font-medium">Approved Tickets</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">📋</div>
                    </div>
                </div>

                {/* Main 2-Column Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left Column: Low Stock Alerts */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                                <h3 className="text-[16px] font-bold text-slate-900">Critical Low Stock & Reorder Alerts</h3>
                            </div>
                            <Link to="/store-manager/inventory" className="text-[12px] font-bold text-emerald-600 hover:text-emerald-800">
                                View All SKUs →
                            </Link>
                        </div>

                        <div className="p-6 flex-grow">
                            {loading ? (
                                <div className="py-12 text-center text-slate-400 italic">Checking stock levels...</div>
                            ) : lowStockItems.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="text-3xl mb-2">🎉</div>
                                    <div className="font-bold text-slate-700">All materials healthy!</div>
                                    <div className="text-[12px] text-slate-400">No items are below minimum safety threshold.</div>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {lowStockItems.map(item => (
                                        <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                                            <div>
                                                <div className="font-bold text-slate-900 text-[14px]">{item.materialName}</div>
                                                <div className="text-[12px] text-slate-500 font-medium">
                                                    Current Stock: <span className="font-bold text-amber-600">{item.quantityAvailable} {item.unit}</span> (Min: {item.minThreshold} {item.unit})
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSelectedItem(item)}
                                                className="px-3.5 py-1.5 rounded-xl text-[12px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                            >
                                                + Restock
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Pending Issuance Queue */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                <h3 className="text-[16px] font-bold text-slate-900">Pending Material Issuance Queue</h3>
                            </div>
                            <Link to="/store-manager/issuance" className="text-[12px] font-bold text-indigo-600 hover:text-indigo-800">
                                Full Queue →
                            </Link>
                        </div>

                        <div className="p-6 flex-grow">
                            {loading ? (
                                <div className="py-12 text-center text-slate-400 italic">Fetching issuance tickets...</div>
                            ) : issuanceRequests.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="text-3xl mb-2">✅</div>
                                    <div className="font-bold text-slate-700">No pending dispatches</div>
                                    <div className="text-[12px] text-slate-400">All approved maintenance tickets have been issued.</div>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {issuanceRequests.slice(0, 5).map(req => (
                                        <div key={req.id} className="py-3.5 flex items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-indigo-600 text-[12px]">#{req.requestNumber || req.id}</span>
                                                    <span className="font-semibold text-slate-900 text-[14px]">{req.itemDescription}</span>
                                                </div>
                                                <div className="text-[12px] text-slate-400 mt-0.5">
                                                    {req.requesterName} · {req.organizationDepartmentName}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleIssueRequest(req.id)}
                                                disabled={issuanceLoading === req.id}
                                                className="px-3.5 py-1.5 rounded-xl text-[12px] font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/20 hover:opacity-90 transition-all disabled:opacity-50"
                                            >
                                                {issuanceLoading === req.id ? 'Dispatching...' : 'Issue'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Quick Restock Modal */}
                {selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeUp">
                        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="text-[18px] font-bold text-slate-900">
                                    📥 Restock Delivery
                                </h3>
                                <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>

                            <div className="space-y-3 text-[14px]">
                                <div>
                                    <span className="text-slate-500 text-[12px] uppercase font-bold">Material:</span>
                                    <div className="font-bold text-slate-900 text-[16px]">{selectedItem.materialName}</div>
                                </div>
                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border">
                                    <span className="text-slate-500">Current Available:</span>
                                    <span className="font-bold text-amber-600">{selectedItem.quantityAvailable} {selectedItem.unit}</span>
                                </div>
                            </div>

                            <form onSubmit={handleRestock} className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-600 uppercase mb-1">
                                        Quantity to Restock ({selectedItem.unit})
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={actionQty}
                                        onChange={e => setActionQty(e.target.value)}
                                        className="w-full h-11 px-4 border border-slate-300 rounded-xl text-[15px] font-bold focus:outline-none focus:border-emerald-500"
                                        placeholder="Enter delivery quantity..."
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedItem(null)}
                                        className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 text-[13px]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] transition-all shadow-md shadow-emerald-600/20"
                                    >
                                        {actionLoading ? 'Processing...' : 'Confirm Restock'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default StoreManagerDashboard;
