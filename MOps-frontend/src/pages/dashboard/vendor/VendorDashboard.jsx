import React, { useState, useEffect, useCallback } from 'react';
import { vendorService } from '../../../services/vendorService';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';

const VendorDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    const loadVendorData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await vendorService.getVendorOrders();
            setOrders(data);
        } catch (e) {
            console.error('Error loading vendor orders:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVendorData();
    }, [loadVendorData]);

    const pendingOrders = orders.filter(o => o.status === 'PENDING');
    const inTransitOrders = orders.filter(o => o.status === 'IN_TRANSIT');
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
    const totalDeliveredValue = deliveredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const handleUpdateStatus = async (orderId, newStatus) => {
        setActionLoading(orderId);
        try {
            await vendorService.updateOrderStatus(orderId, newStatus);
            setToastMessage(`Updated order PO-${orderId} status to ${newStatus.replace('_', ' ')}`);
            setOrders(prev => prev.map(o => String(o.id) === String(orderId) ? { ...o, status: newStatus } : o));
            setTimeout(() => setToastMessage(null), 3500);
        } catch (err) {
            alert('Failed to update order status: ' + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="relative min-h-screen pb-24">
            <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8 pt-10 animate-fadeUp space-y-10">
                
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-slate-200/90 p-8 rounded-3xl shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/20">
                                🚚
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-700">Vendor Partner Portal</span>
                        </div>
                        <h1 className="text-[32px] font-display font-bold text-slate-900 tracking-tight">
                            Hare Krishna, <span className="text-blue-700">{user?.name || 'Authorized Vendor'} Prabhu</span>
                        </h1>
                        <p className="text-[14px] text-slate-600 font-medium mt-1 max-w-xl">
                            Supply orders, material dispatch fulfillment, and delivery invoice management for ISKCON NVCC.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center gap-3">
                        <Link
                            to="/vendor/orders"
                            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            📋 View All Orders ({orders.length})
                        </Link>
                        <Link
                            to="/vendor/quotations"
                            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-bold border border-slate-200 hover:bg-slate-200 transition-all flex items-center gap-2"
                        >
                            💰 Material Bids
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

                {/* Metrics Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Orders</span>
                            <div className="text-[28px] font-bold text-amber-600 mt-1">{pendingOrders.length}</div>
                            <span className="text-[12px] text-amber-600/80 font-medium">Awaiting Dispatch</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">⏳</div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Transit</span>
                            <div className="text-[28px] font-bold text-blue-600 mt-1">{inTransitOrders.length}</div>
                            <span className="text-[12px] text-blue-600/80 font-medium">Out for Delivery</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">🚚</div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed Orders</span>
                            <div className="text-[28px] font-bold text-emerald-600 mt-1">{deliveredOrders.length}</div>
                            <span className="text-[12px] text-emerald-600/80 font-medium">Delivered to Store</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">✅</div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Delivered Value</span>
                            <div className="text-[26px] font-bold text-slate-900 mt-1">₹{totalDeliveredValue.toLocaleString('en-IN')}</div>
                            <span className="text-[12px] text-slate-400 font-medium">Total Supplied</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-xl">💰</div>
                    </div>
                </div>

                {/* Purchase Orders Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                    <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div>
                            <h3 className="text-[18px] font-bold text-slate-900">Active Material Purchase Orders</h3>
                            <p className="text-[13px] text-slate-500 mt-0.5">Orders assigned to your firm for delivery to ISKCON NVCC Maintenance Store.</p>
                        </div>
                        <Link to="/vendor/orders" className="text-[13px] font-bold text-blue-600 hover:text-blue-800">
                            Full Order Book →
                        </Link>
                    </div>

                    <table className="w-full text-left border-collapse text-[14px]">
                        <thead>
                            <tr className="bg-slate-100/50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">PO Number</th>
                                <th className="px-6 py-4">Material & Specification</th>
                                <th className="px-6 py-4">Quantity & Unit</th>
                                <th className="px-6 py-4">Agreed Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Dispatch Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">Fetching assigned purchase orders...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">No purchase orders currently assigned.</td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 font-bold text-blue-600">
                                            {order.orderNumber}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{order.materialName}</div>
                                            <div className="text-[12px] text-slate-500">{order.specification}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-800">
                                            {order.quantity} {order.unit}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            ₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.status === 'DELIVERED' ? (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Delivered</span>
                                            ) : order.status === 'IN_TRANSIT' ? (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">🚚 Out for Delivery</span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">⏳ Pending Supply</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {order.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, 'IN_TRANSIT')}
                                                    disabled={actionLoading === order.id}
                                                    className="px-4 py-2 rounded-xl text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                                                >
                                                    {actionLoading === order.id ? 'Updating...' : 'Dispatch Order'}
                                                </button>
                                            )}

                                            {order.status === 'IN_TRANSIT' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                                    disabled={actionLoading === order.id}
                                                    className="px-4 py-2 rounded-xl text-[12px] font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                                                >
                                                    {actionLoading === order.id ? 'Updating...' : 'Mark Delivered'}
                                                </button>
                                            )}

                                            {order.status === 'DELIVERED' && (
                                                <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                                                    Order Fulfilled
                                                </span>
                                            )}
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

export default VendorDashboard;
