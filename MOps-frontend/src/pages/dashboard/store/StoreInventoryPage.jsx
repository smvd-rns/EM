import React, { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '../../../services/inventoryService';
import { materialService } from '../../../services/materialService';

const StoreInventoryPage = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    // Modals
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalMode, setModalMode] = useState(null); // 'RECEIVE' | 'ISSUE' | 'ADD_SKU'
    const [actionQty, setActionQty] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // Add SKU form
    const [newSkuData, setNewSkuData] = useState({
        materialName: '',
        category: 'Hardware',
        unit: 'piece',
        quantityAvailable: '10',
        minThreshold: '5'
    });

    const loadInventory = useCallback(async () => {
        setLoading(true);
        try {
            const data = await inventoryService.getAllInventory();
            setInventory(data);
        } catch (e) {
            console.error('Error loading inventory:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInventory();
    }, [loadInventory]);

    const categories = ['ALL', ...new Set(inventory.map(i => i.category || 'General'))];

    const filteredInventory = inventory.filter(i => {
        const matchesSearch = (i.materialName || '').toLowerCase().includes(search.toLowerCase()) ||
                              (i.category || '').toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || i.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleStockAction = async (e) => {
        e.preventDefault();
        if (!selectedItem || !actionQty || Number(actionQty) <= 0) return;

        setActionLoading(true);
        try {
            const qtyNum = Number(actionQty);
            let newQty = selectedItem.quantityAvailable;

            if (modalMode === 'RECEIVE') {
                newQty += qtyNum;
                await inventoryService.updateStock(selectedItem.id, newQty);
                setToastMessage(`Successfully added +${qtyNum} ${selectedItem.unit} to ${selectedItem.materialName}`);
            } else if (modalMode === 'ISSUE') {
                newQty = Math.max(0, newQty - qtyNum);
                await inventoryService.updateStock(selectedItem.id, newQty);
                setToastMessage(`Issued -${qtyNum} ${selectedItem.unit} of ${selectedItem.materialName}`);
            }

            setInventory(prev => prev.map(item => item.id === selectedItem.id ? { ...item, quantityAvailable: newQty } : item));
            setModalMode(null);
            setSelectedItem(null);
            setActionQty('');
            setTimeout(() => setToastMessage(null), 3500);
        } catch (err) {
            alert('Failed to update stock: ' + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddSku = async (e) => {
        e.preventDefault();
        if (!newSkuData.materialName) return;

        setActionLoading(true);
        try {
            const created = await inventoryService.addInventoryItem(newSkuData);
            setInventory(prev => [created, ...prev]);
            setToastMessage(`Added new store inventory item: ${newSkuData.materialName}`);
            setModalMode(null);
            setNewSkuData({
                materialName: '',
                category: 'Hardware',
                unit: 'piece',
                quantityAvailable: '10',
                minThreshold: '5'
            });
            setTimeout(() => setToastMessage(null), 3500);
        } catch (err) {
            alert('Failed to add inventory item: ' + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen pb-24">
            <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8 pt-10 animate-fadeUp">
                
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shadow-sm">
                                🏬
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Store Control</span>
                        </div>
                        <h1 className="text-[28px] font-display font-semibold text-slate-900 tracking-tight">
                            Store Inventory Catalogue
                        </h1>
                        <p className="text-[13px] font-ui text-slate-500 mt-0.5">
                            Comprehensive material stock registry, threshold configuration, and restock management.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setModalMode('ADD_SKU')}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[13px] font-bold shadow-md shadow-emerald-500/20 hover:opacity-90 transition-all flex items-center gap-2"
                        >
                            <span>+</span> Add New Inventory SKU
                        </button>
                    </div>
                </div>

                {/* Toast Notification */}
                {toastMessage && (
                    <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[14px] font-bold flex items-center justify-between animate-fadeUp">
                        <span>{toastMessage}</span>
                        <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
                    </div>
                )}

                {/* Filter and Search Bar */}
                <div className="mb-6 rounded-2xl bg-white/80 border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative flex-1 w-full">
                        <input
                            type="text"
                            placeholder="Filter by material name or category..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-emerald-500 transition-all"
                        />
                        <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-[14px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">SKU / Material Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Current Stock</th>
                                <th className="px-6 py-4">Safety Threshold</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Quick Stock Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">Fetching inventory database...</td>
                                </tr>
                            ) : filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">No materials found matching your search.</td>
                                </tr>
                            ) : (
                                filteredInventory.map(item => {
                                    const isOut = item.quantityAvailable === 0;
                                    const isLow = item.quantityAvailable > 0 && item.quantityAvailable <= item.minThreshold;

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-900">
                                                {item.materialName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                {item.quantityAvailable} {item.unit}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {item.minThreshold} {item.unit}
                                            </td>
                                            <td className="px-6 py-4">
                                                {isOut ? (
                                                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">Out of Stock</span>
                                                ) : isLow ? (
                                                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200">Low Stock Alert</span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">In Stock</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => { setSelectedItem(item); setModalMode('RECEIVE'); }}
                                                        className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                                    >
                                                        + Restock
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedItem(item); setModalMode('ISSUE'); }}
                                                        className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                                                    >
                                                        - Issue
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Stock Receive/Issue Modal */}
                {(modalMode === 'RECEIVE' || modalMode === 'ISSUE') && selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeUp">
                        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="text-[18px] font-bold text-slate-900">
                                    {modalMode === 'RECEIVE' ? '📥 Receive / Restock Delivery' : '📤 Issue Store Material'}
                                </h3>
                                <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>

                            <div className="space-y-3 text-[14px]">
                                <div>
                                    <span className="text-slate-500 text-[12px] uppercase font-bold">Material Item:</span>
                                    <div className="font-bold text-slate-900 text-[16px]">{selectedItem.materialName}</div>
                                </div>
                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border">
                                    <span className="text-slate-500">Current Stock:</span>
                                    <span className="font-bold text-slate-900">{selectedItem.quantityAvailable} {selectedItem.unit}</span>
                                </div>
                            </div>

                            <form onSubmit={handleStockAction} className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-600 uppercase mb-1">
                                        Quantity to {modalMode === 'RECEIVE' ? 'Add (+)' : 'Deduct (-)'} ({selectedItem.unit})
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={actionQty}
                                        onChange={e => setActionQty(e.target.value)}
                                        className="w-full h-11 px-4 border border-slate-300 rounded-xl text-[15px] font-bold focus:outline-none focus:border-emerald-500"
                                        placeholder="Enter quantity..."
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setModalMode(null)}
                                        className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 text-[13px]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className={`px-6 py-2.5 rounded-xl text-white font-bold text-[13px] transition-all ${modalMode === 'RECEIVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                    >
                                        {actionLoading ? 'Processing...' : modalMode === 'RECEIVE' ? 'Confirm Restock' : 'Confirm Issue'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add New SKU Modal */}
                {modalMode === 'ADD_SKU' && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeUp">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="text-[18px] font-bold text-slate-900">
                                    ✨ Add New Inventory SKU
                                </h3>
                                <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>

                            <form onSubmit={handleAddSku} className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-600 uppercase mb-1">
                                        Material / SKU Name
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={newSkuData.materialName}
                                        onChange={e => setNewSkuData({...newSkuData, materialName: e.target.value})}
                                        className="w-full h-11 px-4 border border-slate-300 rounded-xl text-[14px] font-semibold focus:outline-none focus:border-emerald-500"
                                        placeholder="e.g. Copper Wire 2.5 sqmm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-600 uppercase mb-1">Category</label>
                                        <select
                                            value={newSkuData.category}
                                            onChange={e => setNewSkuData({...newSkuData, category: e.target.value})}
                                            className="w-full h-11 px-4 border border-slate-300 rounded-xl text-[14px] font-semibold bg-white focus:outline-none focus:border-emerald-500"
                                        >
                                            <option value="Hardware">Hardware</option>
                                            <option value="Material">Material</option>
                                            <option value="Consumable">Consumable</option>
                                            <option value="Electrical">Electrical</option>
                                            <option value="Plumbing">Plumbing</option>
                                            <option value="Civil">Civil</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-600 uppercase mb-1">Unit</label>
                                        <input
                                            required
                                            type="text"
                                            value={newSkuData.unit}
                                            onChange={e => setNewSkuData({...newSkuData, unit: e.target.value})}
                                            className="w-full h-11 px-4 border border-slate-300 rounded-xl text-[14px] font-semibold focus:outline-none focus:border-emerald-500"
                                            placeholder="piece, kg, meter..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-600 uppercase mb-1">Initial Stock Qty</label>
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            value={newSkuData.quantityAvailable}
                                            onChange={e => setNewSkuData({...newSkuData, quantityAvailable: e.target.value})}
                                            className="w-full h-11 px-4 border border-slate-300 rounded-xl text-[14px] font-semibold focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-600 uppercase mb-1">Safety Min Threshold</label>
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            value={newSkuData.minThreshold}
                                            onChange={e => setNewSkuData({...newSkuData, minThreshold: e.target.value})}
                                            className="w-full h-11 px-4 border border-slate-300 rounded-xl text-[14px] font-semibold focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setModalMode(null)}
                                        className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 text-[13px]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-[13px] hover:opacity-90 shadow-md shadow-emerald-500/20 transition-all"
                                    >
                                        {actionLoading ? 'Saving...' : 'Add Inventory SKU'}
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

export default StoreInventoryPage;
