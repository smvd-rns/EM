import React, { useState, useEffect } from 'react';
import { materialService } from '../../../services/materialService';
import Button from '../../../components/Button';
import Pagination from '../../../components/common/Pagination';
import AddVendorModal from '../../../components/vendors/AddVendorModal';

const MaterialsPage = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Material',
        defaultUnit: 'piece',
        specifications: []
    });
    const [newSpec, setNewSpec] = useState({ specification: '', description: '' });

    const defaultCategories = ['Material', 'Labor', 'Hardware', 'Consumable', 'Electrical', 'Plumbing', 'Civil'];
    const allCategories = Array.from(new Set([
        ...defaultCategories,
        ...materials.map(m => m.category).filter(Boolean)
    ]));

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const data = await materialService.getAllMaterials();
            setMaterials(data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (material = null) => {
        if (material) {
            setEditingMaterial(material);
            setFormData({
                name: material.materialName || material.name || '',
                category: material.category || 'Material',
                defaultUnit: material.defaultUnit || 'piece',
                specifications: material.specifications || []
            });
            setIsCustomCategory(false);
        } else {
            setEditingMaterial(null);
            setFormData({
                name: '',
                category: 'Material',
                defaultUnit: 'piece',
                specifications: []
            });
            setIsCustomCategory(false);
        }
        setIsModalOpen(true);
    };

    const handleAddSpec = () => {
        if (!newSpec.specification) return;
        setFormData({
            ...formData,
            specifications: [...formData.specifications, { ...newSpec, id: null }]
        });
        setNewSpec({ specification: '', description: '' });
    };

    const handleRemoveSpec = (index) => {
        const updated = [...formData.specifications];
        updated.splice(index, 1);
        setFormData({ ...formData, specifications: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                category: formData.category,
                defaultUnit: formData.defaultUnit,
                specifications: formData.specifications.map(s => ({
                    id: s.id,
                    specification: s.specification,
                    description: s.description
                }))
            };

            const matId = editingMaterial ? (editingMaterial.materialId || editingMaterial.id) : null;
            if (editingMaterial && matId) {
                await materialService.updateMaterial(matId, payload);
            } else {
                await materialService.createMaterial(payload);
            }
            setIsModalOpen(false);
            fetchMaterials();
        } catch (error) {
            console.error('Error saving material:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this material?')) {
            try {
                await materialService.deleteMaterial(id);
                fetchMaterials();
            } catch (error) {
                console.error('Error deleting material:', error);
            }
        }
    };

    const filteredMaterials = (materials || []).filter(m => {
        const matName = m.materialName || m.name || '';
        const cat = m.category || '';
        return matName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               cat.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const paginatedMaterials = filteredMaterials.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="relative min-h-screen pb-24">

            <div className="relative max-w-6xl mx-auto px-6 sm:px-8 pt-10 animate-fadeUp">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#6366f1] to-[#818cf8] flex items-center justify-center text-white text-[12px]">📦</div>
                            <span className="text-[10px] font-ui font-bold uppercase tracking-[0.2em] text-[#6366f1]">Inventory Ops</span>
                        </div>
                        <h1 className="text-[28px] font-display font-semibold text-on-surface tracking-tight">Material Management</h1>
                        <p className="text-[13px] font-ui text-on-surface-variant/60 mt-0.5">Manage the internal material database and specifications.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button 
                            onClick={() => setIsVendorModalOpen(true)}
                            className="px-5 py-2.5 rounded-xl text-[13px] font-ui font-bold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 transition-all flex items-center gap-2"
                        >
                            <span>🏢</span> Add New Vendor
                        </button>
                        <button 
                            onClick={() => handleOpenModal()}
                            className="px-6 py-2.5 rounded-xl text-[13px] font-ui font-bold text-white bg-gradient-to-r from-[#6366f1] to-[#818cf8] shadow-md shadow-[#6366f1]/20 hover:opacity-90 transition-all flex items-center gap-2"
                        >
                            <span>+</span> Add Material
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-xl bg-white/60 backdrop-blur-md border border-white/60 p-4 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input 
                            type="text" 
                            placeholder="Search materials or categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-white border border-[#dde1ed] rounded-lg text-[14px] font-ui focus:outline-none focus:border-[#6366f1] transition-all"
                        />
                        <span className="absolute left-3.5 top-2.5 text-on-surface-variant/40">🔍</span>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl overflow-hidden shadow-indigo-100/20">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-[#6366f1]/5 border-b border-[#6366f1]/10">
                                <th className="px-6 py-4 text-[11px] font-ui font-bold text-[#6366f1] uppercase tracking-wider">Material Name</th>
                                <th className="px-6 py-4 text-[11px] font-ui font-bold text-[#6366f1] uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-[11px] font-ui font-bold text-[#6366f1] uppercase tracking-wider">Unit</th>
                                <th className="px-6 py-4 text-[11px] font-ui font-bold text-[#6366f1] uppercase tracking-wider">Specs</th>
                                <th className="px-6 py-4 text-[11px] font-ui font-bold text-[#6366f1] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant/40 font-ui italic">Loading database...</td>
                                </tr>
                            ) : filteredMaterials.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant/40 font-ui italic">No materials found matching your search.</td>
                                </tr>
                            ) : paginatedMaterials.map(m => (
                                <tr key={m.materialId || m.id} className="hover:bg-[#6366f1]/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="text-[14px] font-display font-medium text-on-surface">{m.materialName || m.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-md bg-[#6366f1]/5 text-[#6366f1] text-[11px] font-ui font-bold border border-[#6366f1]/10 uppercase tracking-tighter">
                                            {m.category || 'Material'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[13px] font-ui text-on-surface-variant">{m.defaultUnit}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {m.specifications?.map(s => (
                                                <span key={s.id} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{s.specification}</span>
                                            ))}
                                            <span className="text-[10px] text-[#6366f1] font-bold">({m.specifications?.length || 0})</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleOpenModal(m)}
                                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-all"
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(m.materialId || m.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredMaterials.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                        pageSizeOptions={[10, 30, 50]}
                    />
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="px-8 py-6 bg-gradient-to-r from-[#6366f1]/5 to-transparent border-b border-[#6366f1]/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-[20px] font-display font-semibold text-on-surface">{editingMaterial ? 'Edit Material' : 'Add New Material'}</h2>
                                <p className="text-[12px] font-ui text-on-surface-variant/60">Define properties and technical specifications.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant/40 hover:text-on-surface transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-ui font-bold text-on-surface-variant/60 uppercase tracking-wider mb-2">Material Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full h-11 px-4 border border-[#dde1ed] rounded-xl text-[14px] font-ui focus:outline-none focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/5 transition-all"
                                        placeholder="e.g. Commercial Plywood 18mm"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-[11px] font-ui font-bold text-on-surface-variant/60 uppercase tracking-wider">Category</label>
                                        {!isCustomCategory && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCustomCategory(true);
                                                    setFormData(prev => ({ ...prev, category: '' }));
                                                }}
                                                className="text-[11px] font-bold text-[#6366f1] hover:underline cursor-pointer"
                                            >
                                                + New Category
                                            </button>
                                        )}
                                    </div>

                                    {!isCustomCategory ? (
                                        <select 
                                            value={formData.category}
                                            onChange={e => {
                                                if (e.target.value === 'NEW_CATEGORY') {
                                                    setIsCustomCategory(true);
                                                    setFormData(prev => ({ ...prev, category: '' }));
                                                } else {
                                                    setFormData(prev => ({ ...prev, category: e.target.value }));
                                                }
                                            }}
                                            className="w-full h-11 px-4 border border-[#dde1ed] rounded-xl text-[14px] font-ui bg-white focus:outline-none focus:border-[#6366f1] transition-all cursor-pointer"
                                        >
                                            {allCategories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                            <option value="NEW_CATEGORY">➕ Add New Category...</option>
                                        </select>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    required
                                                    type="text" 
                                                    value={formData.category}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                    className="flex-1 h-11 px-4 border border-[#dde1ed] rounded-xl text-[14px] font-ui focus:outline-none focus:border-[#6366f1] transition-all"
                                                    placeholder="Enter new category name..."
                                                    autoFocus
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCustomCategory(false);
                                                        setFormData(prev => ({ ...prev, category: allCategories[0] || 'Material' }));
                                                    }}
                                                    className="h-11 px-3 border border-[#dde1ed] rounded-xl text-[12px] font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                                                    title="Back to dropdown"
                                                >
                                                    ✕ Select Existing
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-[#6366f1] font-medium">Type custom category name to add to catalog.</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-ui font-bold text-on-surface-variant/60 uppercase tracking-wider mb-2">Default Unit</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={formData.defaultUnit}
                                        onChange={e => setFormData({...formData, defaultUnit: e.target.value})}
                                        className="w-full h-11 px-4 border border-[#dde1ed] rounded-xl text-[14px] font-ui focus:outline-none focus:border-[#6366f1] transition-all"
                                        placeholder="piece, kg, sqft, etc."
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-[11px] font-ui font-bold text-on-surface-variant/60 uppercase tracking-wider">Specifications</label>
                                    <span className="text-[10px] text-on-surface-variant/40 italic">Add specific brands, sizes, or grades</span>
                                </div>

                                <div className="space-y-3 mb-4">
                                    {formData.specifications.map((spec, index) => (
                                        <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 transition-all hover:bg-gray-100/50">
                                            <div className="flex-1">
                                                <div className="text-[13px] font-medium text-on-surface">{spec.specification}</div>
                                                {spec.description && <div className="text-[11px] text-on-surface-variant/60">{spec.description}</div>}
                                            </div>
                                            <button type="button" onClick={() => handleRemoveSpec(index)} className="text-red-400 hover:text-red-600 transition-colors">✕</button>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-[1fr,1.5fr,auto] gap-3 items-end">
                                    <div>
                                        <input 
                                            type="text" 
                                            placeholder="Spec Name"
                                            value={newSpec.specification}
                                            onChange={e => setNewSpec({...newSpec, specification: e.target.value})}
                                            className="w-full h-10 px-3 border border-[#dde1ed] rounded-lg text-[13px] font-ui focus:outline-none focus:border-[#6366f1]"
                                        />
                                    </div>
                                    <div>
                                        <input 
                                            type="text" 
                                            placeholder="Description (Optional)"
                                            value={newSpec.description}
                                            onChange={e => setNewSpec({...newSpec, description: e.target.value})}
                                            className="w-full h-10 px-3 border border-[#dde1ed] rounded-lg text-[13px] font-ui focus:outline-none focus:border-[#6366f1]"
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={handleAddSpec}
                                        className="h-10 px-4 bg-[#6366f1]/10 text-[#6366f1] rounded-lg text-[13px] font-bold hover:bg-[#6366f1]/20 transition-all"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl border border-outline/20 text-on-surface-variant font-medium hover:bg-surface-variant transition-all text-[13px]"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white font-bold shadow-lg shadow-[#6366f1]/20 hover:opacity-90 active:scale-[0.98] transition-all text-[13px]"
                                >
                                    {editingMaterial ? 'Save Changes' : 'Create Material'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Vendor Modal */}
            <AddVendorModal
                isOpen={isVendorModalOpen}
                onClose={() => setIsVendorModalOpen(false)}
            />
        </div>
    );
};

export default MaterialsPage;
