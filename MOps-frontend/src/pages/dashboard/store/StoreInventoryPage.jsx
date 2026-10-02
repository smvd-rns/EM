import React, { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '../../../services/inventoryService';
import { materialService } from '../../../services/materialService';
import Pagination from '../../../components/common/Pagination';

const DEFAULT_CATALOG_FALLBACK = [
    {
        id: 101,
        materialId: 101,
        name: 'Commercial Plywood',
        category: 'Material',
        defaultUnit: 'sheet',
        specifications: [
            { id: 201, specification: '18mm Water Resistant (IS 303)' },
            { id: 202, specification: '12mm Standard Commercial' },
            { id: 203, specification: '6mm Thin Backing Sheet' }
        ]
    },
    {
        id: 102,
        materialId: 102,
        name: 'Copper Wire',
        category: 'Electrical',
        defaultUnit: 'roll',
        specifications: [
            { id: 204, specification: '1.5 sqmm Red (Flame Retardant)' },
            { id: 205, specification: '2.5 sqmm Blue (Heavy Duty)' },
            { id: 206, specification: '4.0 sqmm Yellow/Green Earth' }
        ]
    },
    {
        id: 103,
        materialId: 103,
        name: 'Iron Nails',
        category: 'Hardware',
        defaultUnit: 'kg',
        specifications: [
            { id: 207, specification: '1 inch Flat Head' },
            { id: 208, specification: '2 inch Counter Sunk' }
        ]
    },
    {
        id: 104,
        materialId: 104,
        name: 'Fevicol SH Adhesive',
        category: 'Consumable',
        defaultUnit: 'can',
        specifications: [
            { id: 209, specification: '5kg Standard Bucket' },
            { id: 210, specification: '1kg Pack' }
        ]
    },
    {
        id: 105,
        materialId: 105,
        name: 'LED Tube Light',
        category: 'Electrical',
        defaultUnit: 'piece',
        specifications: [
            { id: 211, specification: '20W Cool Day White 6500K' },
            { id: 212, specification: '10W Warm White 3000K' }
        ]
    },
    {
        id: 106,
        materialId: 106,
        name: 'Asian Paints',
        category: 'Consumable',
        defaultUnit: 'bucket',
        specifications: [
            { id: 213, specification: 'White 20L Premium Emulsion' },
            { id: 214, specification: 'Primer Sealer 4L' }
        ]
    },
    {
        id: 107,
        materialId: 107,
        name: 'PVC Pipe',
        category: 'Plumbing',
        defaultUnit: 'length',
        specifications: [
            { id: 215, specification: '2 inch Heavy Duty Schedule 40' },
            { id: 216, specification: '1 inch Standard Drain' }
        ]
    }
];

const StoreInventoryPage = () => {
    const [inventory, setInventory] = useState([]);
    const [catalogMaterials, setCatalogMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modals
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalMode, setModalMode] = useState(null); // 'RECEIVE' | 'ISSUE' | 'ADD_SKU'
    const [actionQty, setActionQty] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // Add SKU form
    const [selectedCatalogId, setSelectedCatalogId] = useState('');
    const [availableSpecs, setAvailableSpecs] = useState([]);
    const [selectedSpecId, setSelectedSpecId] = useState('');
    const [newSkuData, setNewSkuData] = useState({
        materialId: null,
        specificationId: null,
        specificationText: '',
        materialName: '',
        category: 'Hardware',
        unit: 'piece',
        quantityAvailable: '10',
        minThreshold: '5'
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [invData, matData] = await Promise.all([
                inventoryService.getAllInventory(),
                materialService.getAllMaterials().catch(() => DEFAULT_CATALOG_FALLBACK)
            ]);
            setInventory(invData || []);
            setCatalogMaterials(matData && matData.length > 0 ? matData : DEFAULT_CATALOG_FALLBACK);
        } catch (e) {
            console.error('Error loading inventory data:', e);
            setCatalogMaterials(DEFAULT_CATALOG_FALLBACK);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedCategory]);

    const categories = ['ALL', ...new Set(inventory.map(i => i.category || 'General'))];

    const filteredInventory = inventory.filter(i => {
        const searchStr = search.toLowerCase();
        const matchesSearch = (i.materialName || '').toLowerCase().includes(searchStr) ||
                              (i.specificationText || '').toLowerCase().includes(searchStr) ||
                              (i.category || '').toLowerCase().includes(searchStr);
        const matchesCategory = selectedCategory === 'ALL' || i.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const paginatedInventory = filteredInventory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

    const handleCatalogSelect = (materialId) => {
        setSelectedCatalogId(materialId);
        setSelectedSpecId('');
        setAvailableSpecs([]);

        if (materialId === 'CUSTOM') {
            setNewSkuData(prev => ({
                ...prev,
                materialId: null,
                specificationId: null,
                specificationText: '',
                materialName: '',
                category: 'Hardware',
                unit: 'piece'
            }));
            return;
        }

        const selectedMat = catalogMaterials.find(m => String(m.id || m.materialId) === String(materialId));
        if (selectedMat) {
            const specs = selectedMat.specifications || [];
            setAvailableSpecs(specs);

            const firstSpec = specs.length > 0 ? specs[0] : null;
            const specId = firstSpec ? (firstSpec.id || null) : null;
            const specText = firstSpec ? (firstSpec.specification || '') : '';
            setSelectedSpecId(specId ? String(specId) : '');

            setNewSkuData(prev => ({
                ...prev,
                materialId: selectedMat.id || selectedMat.materialId,
                specificationId: specId,
                specificationText: specText,
                materialName: selectedMat.name || selectedMat.materialName,
                category: selectedMat.category || 'Hardware',
                unit: selectedMat.defaultUnit || selectedMat.unit || 'piece'
            }));
        }
    };

    const handleSpecSelect = (specId) => {
        setSelectedSpecId(specId);
        if (!specId) {
            setNewSkuData(prev => ({ ...prev, specificationId: null, specificationText: '' }));
            return;
        }
        const foundSpec = availableSpecs.find(s => String(s.id) === String(specId));
        if (foundSpec) {
            setNewSkuData(prev => ({
                ...prev,
                specificationId: foundSpec.id,
                specificationText: foundSpec.specification
            }));
        }
    };

    const handleAddSku = async (e) => {
        e.preventDefault();
        if (!newSkuData.materialName) return;

        setActionLoading(true);
        try {
            const created = await inventoryService.addInventoryItem(newSkuData);
            setInventory(prev => [created, ...prev]);
            
            const variantInfo = newSkuData.specificationText ? ` (${newSkuData.specificationText})` : '';
            setToastMessage(`Added new store inventory item: ${newSkuData.materialName}${variantInfo}`);
            
            setModalMode(null);
            setSelectedCatalogId('');
            setSelectedSpecId('');
            setAvailableSpecs([]);
            setNewSkuData({
                materialId: null,
                specificationId: null,
                specificationText: '',
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
                            onClick={() => {
                                setSelectedCatalogId('');
                                setSelectedSpecId('');
                                setAvailableSpecs([]);
                                setModalMode('ADD_SKU');
                            }}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[13px] font-bold shadow-md shadow-emerald-500/20 hover:opacity-90 transition-all flex items-center gap-2"
                        >
                            <span>+</span> Add New Inventory
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
                            placeholder="Filter by material name, variant, or category..."
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
                                <th className="px-6 py-4">SKU / Material & Variant</th>
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
                                paginatedInventory.map(item => {
                                    const isOut = item.quantityAvailable === 0;
                                    const isLow = item.quantityAvailable > 0 && item.quantityAvailable <= item.minThreshold;

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{item.materialName}</div>
                                                {item.specificationText && (
                                                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        Variant: {item.specificationText}
                                                    </span>
                                                )}
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
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredInventory.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                        pageSizeOptions={[10, 30, 50]}
                    />
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
                                    <div className="font-bold text-slate-900 text-[16px]">
                                        {selectedItem.materialName}
                                        {selectedItem.specificationText && (
                                            <span className="text-slate-500 font-normal text-[14px]"> ({selectedItem.specificationText})</span>
                                        )}
                                    </div>
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
                                <div>
                                    <h3 className="text-[18px] font-bold text-slate-900">
                                        ✨ Add New Inventory
                                    </h3>
                                    <p className="text-[12px] text-slate-500">Link stock entry to Master Materials Catalog & Specification Variant</p>
                                </div>
                                <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>

                            <form onSubmit={handleAddSku} className="space-y-4">
                                {/* 1. Material Selection Dropdown */}
                                <div>
                                    <label className="block text-[12px] font-bold text-slate-600 uppercase mb-1">
                                        Select Material from Catalog
                                    </label>
                                    <select
                                        required
                                        value={selectedCatalogId}
                                        onChange={e => handleCatalogSelect(e.target.value)}
                                        className="w-full h-11 px-4 border border-slate-300 rounded-xl text-[14px] font-semibold bg-white focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                                    >
                                        <option value="">-- Choose Material --</option>
                                        {catalogMaterials.map(mat => (
                                            <option key={mat.id || mat.materialId} value={mat.id || mat.materialId}>
                                                {mat.name || mat.materialName} ({mat.category || 'Material'})
                                            </option>
                                        ))}
                                        <option value="CUSTOM">➕ Custom / Other Item (Type manually)</option>
                                    </select>
                                </div>

                                {/* 2. Variant / Specification Selection Dropdown */}
                                {selectedCatalogId && selectedCatalogId !== 'CUSTOM' && (
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-600 uppercase mb-1">
                                            Select Material Variant / Specification
                                        </label>
                                        {availableSpecs.length > 0 ? (
                                            <select
                                                value={selectedSpecId}
                                                onChange={e => handleSpecSelect(e.target.value)}
                                                className="w-full h-11 px-4 border border-slate-300 rounded-xl text-[14px] font-semibold bg-white focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                                            >
                                                <option value="">-- Standard / Default Variant --</option>
                                                {availableSpecs.map(spec => (
                                                    <option key={spec.id} value={spec.id}>
                                                        {spec.specification}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-500">
                                                No specific variants registered for this material. Using standard catalog item.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Custom Name & Spec input if user picks CUSTOM */}
                                {selectedCatalogId === 'CUSTOM' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[12px] font-bold text-slate-600 uppercase mb-1">
                                                Custom Material Name
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
                                        <div>
                                            <label className="block text-[12px] font-bold text-slate-600 uppercase mb-1">
                                                Specification / Variant Details (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={newSkuData.specificationText}
                                                onChange={e => setNewSkuData({...newSkuData, specificationText: e.target.value})}
                                                className="w-full h-11 px-4 border border-slate-300 rounded-xl text-[14px] font-semibold focus:outline-none focus:border-emerald-500"
                                                placeholder="e.g. Heavy Duty Flame Retardant"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 3. Derived Category & Unit Information Display */}
                                {selectedCatalogId && (
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[13px]">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500 font-medium">Category:</span>
                                            <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                                                {newSkuData.category}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500 font-medium">Unit:</span>
                                            <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200 uppercase text-[11px]">
                                                {newSkuData.unit}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* 4. Stock Count & Threshold */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-600 uppercase mb-1">
                                            Initial Stock Qty ({newSkuData.unit})
                                        </label>
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
                                        <label className="block text-[12px] font-bold text-slate-600 uppercase mb-1">
                                            Safety Min Threshold ({newSkuData.unit})
                                        </label>
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
                                        {actionLoading ? 'Saving...' : 'Add Inventory'}
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
