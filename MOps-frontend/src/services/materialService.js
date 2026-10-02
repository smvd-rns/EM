import { supabase } from './supabaseClient';
import { mapRequest } from './requestService';

const mapMaterialItem = (item) => {
    if (!item) return null;
    return {
        id: item.id,
        requestId: item.request_id || item.requestId,
        materialId: item.material_id || item.materialId,
        specificationId: item.specification_id || item.specificationId,
        materialName: item.material_name || item.materialName,
        specification: item.specification_text || item.specification || '',
        specificationText: item.specification_text || item.specificationText || '',
        quantity: item.quantity_required || item.quantity,
        quantityRequired: item.quantity_required || item.quantityRequired,
        unit: item.unit,
        unitPrice: item.unit_price || item.unitPrice,
        totalPrice: item.total_price || item.totalPrice,
        vendorId: item.vendor_id || item.vendorId,
        vendorName: item.vendor_name || item.vendorName,
        lastPurchaseRate: item.last_purchase_rate || item.lastPurchaseRate,
        status: item.status,
        negotiationQuantity: item.negotiation_quantity || item.negotiationQuantity,
        negotiationReason: item.negotiation_reason || item.negotiationReason
    };
};

const mapVendorListItem = (item) => {
    if (!item) return null;
    return {
        id: item.id,
        vendorId: item.vendor_id || item.vendorId,
        materialId: item.material_id || item.materialId,
        specificationId: item.specification_id || item.specificationId,
        vendorName: item.vendor_name || item.vendorName,
        materialName: item.material_name || item.materialName,
        specification: item.specification_text || item.specification || '',
        quantity: item.total_quantity || item.quantity,
        unit: item.unit,
        ratePerUnit: item.rate_per_unit || item.ratePerUnit,
        totalPrice: item.total_price || item.totalPrice,
        isPurchased: item.is_purchased !== undefined ? item.is_purchased : item.isPurchased,
        purchasedAt: item.purchased_at || item.purchasedAt
    };
};

/**
 * Service for material search and details (used by MaterialPicker)
 */
export const materialService = {
    /**
     * Search materials by name or get all active materials
     * @param {string} query - Optional search term
     * @returns {Promise<Array>} List of MaterialSearchDTO
     */
    searchMaterials: async (query = '') => {
        let q = supabase
            .from('materials')
            .select(`
                id,
                name,
                category,
                default_unit,
                material_specifications(id, specification)
            `)
            .eq('is_active', true);
        
        if (query) {
            q = q.ilike('name', `%${query}%`);
        }

        const { data, error } = await q;
        if (error) throw new Error(error.message);

        return (data || []).map(m => ({
            id: m.id,
            materialId: m.id,
            name: m.name,
            materialName: m.name,
            category: m.category || 'Material',
            defaultUnit: m.default_unit || 'piece',
            specifications: (m.material_specifications || []).map(s => ({
                id: s.id,
                specification: s.specification
            }))
        }));
    },

    /**
     * Get all active materials
     * @returns {Promise<Array>} List of MaterialSearchDTO
     */
    getAllMaterials: async () => {
        const { data, error } = await supabase
            .from('materials')
            .select(`
                id,
                name,
                category,
                default_unit,
                material_specifications(id, specification)
            `)
            .eq('is_active', true);

        if (error) throw new Error(error.message);

        return (data || []).map(m => ({
            id: m.id,
            materialId: m.id,
            name: m.name,
            materialName: m.name,
            category: m.category || 'Material',
            defaultUnit: m.default_unit || 'piece',
            specifications: (m.material_specifications || []).map(s => ({
                id: s.id,
                specification: s.specification
            }))
        }));
    },

    /**
     * Create a new material (Admin only)
     * @param {Object} payload - MaterialRequestDTO
     */
    createMaterial: async (payload) => {
        const { name, category, defaultUnit, specifications } = payload;
        const { data: newMat, error: matError } = await supabase
            .from('materials')
            .insert({ name, category, default_unit: defaultUnit })
            .select()
            .single();

        if (matError) throw new Error(matError.message);

        if (specifications && specifications.length > 0) {
            const specInserts = specifications.map(spec => ({
                material_id: newMat.id,
                specification: spec
            }));
            const { error: specError } = await supabase
                .from('material_specifications')
                .insert(specInserts);
            if (specError) throw new Error(specError.message);
        }

        return {
            id: newMat.id,
            name: newMat.name,
            category: newMat.category,
            defaultUnit: newMat.default_unit
        };
    },

    /**
     * Update an existing material (Admin only)
     */
    updateMaterial: async (id, payload) => {
        const { name, category, defaultUnit } = payload;
        const { data, error } = await supabase
            .from('materials')
            .update({ name, category, default_unit: defaultUnit })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return {
            id: data.id,
            name: data.name,
            category: data.category,
            defaultUnit: data.default_unit
        };
    },

    /**
     * Delete (deactivate) a material (Admin only)
     */
    deleteMaterial: async (id) => {
        const { error } = await supabase
            .from('materials')
            .update({ is_active: false })
            .eq('id', id);

        if (error) throw new Error(error.message);
    },

    /**
     * Get full material details (specs, vendors, last rate)
     * @param {number} materialId
     * @returns {Promise<Object>} MaterialSearchDTO
     */
    getMaterialDetails: async (materialId) => {
        const { data: material, error: matError } = await supabase
            .from('materials')
            .select(`
                id,
                name,
                category,
                default_unit,
                material_specifications(id, specification)
            `)
            .eq('id', materialId)
            .single();
        if (matError) throw new Error(matError.message);

        // Fetch vendor mappings
        const { data: mvList, error: mvError } = await supabase
            .from('material_vendors')
            .select(`
                is_preferred,
                vendors (id, name, contact_person, phone, email)
            `)
            .eq('material_id', materialId);
        if (mvError) throw new Error(mvError.message);

        // Fetch rate history
        const { data: rates, error: rateError } = await supabase
            .from('material_rate_history')
            .select('rate')
            .eq('material_id', materialId)
            .order('purchase_date', { ascending: false })
            .limit(1);
        if (rateError) throw new Error(rateError.message);

        return {
            id: material.id,
            name: material.name,
            category: material.category,
            defaultUnit: material.default_unit,
            specifications: material.material_specifications.map(s => ({
                id: s.id,
                specification: s.specification
            })),
            vendors: mvList.map(mv => ({
                id: mv.vendors.id,
                name: mv.vendors.name,
                isPreferred: mv.is_preferred,
                contactPerson: mv.vendors.contact_person,
                phone: mv.vendors.phone,
                email: mv.vendors.email
            })),
            lastPurchaseRate: rates.length > 0 ? rates[0].rate : null
        };
    },
};

/**
 * Vendor-related service calls
 */
export const vendorService = {
    /**
     * Get all active vendors
     */
    getAllVendors: async () => {
        const customVendors = JSON.parse(localStorage.getItem('custom_vendors') || '[]');
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .eq('is_active', true);
            
            if (error || !data || data.length === 0) {
                const fallbacks = [
                    { id: 1, name: 'Apex Electricals', contact_person: 'Ramesh Kumar', phone: '9876543214', email: 'vendor.electric@maintenops.com' },
                    { id: 2, name: 'Shree Krishna Traders', contact_person: 'Gopal Das', phone: '9876543215', email: 'krishna.traders@maintenops.com' },
                    { id: 3, name: 'National Hardware Supply', contact_person: 'Suresh Patel', phone: '9876543216', email: 'national.hw@maintenops.com' },
                    { id: 4, name: 'Mahavir Hardware & Plywoods', contact_person: 'Mahavir Jain', phone: '9876543217', email: 'mahavir@hardware.com' }
                ];
                // Combine default fallbacks with custom added vendors
                const combined = [...fallbacks];
                customVendors.forEach(cv => {
                    if (!combined.some(v => v.id === cv.id || v.name?.toLowerCase() === cv.name?.toLowerCase())) {
                        combined.push(cv);
                    }
                });
                return combined;
            }

            const combined = [...data];
            customVendors.forEach(cv => {
                if (!combined.some(v => v.id === cv.id || v.name?.toLowerCase() === cv.name?.toLowerCase())) {
                    combined.push(cv);
                }
            });
            return combined;
        } catch (e) {
            console.error('[vendorService] Error fetching vendors:', e);
            const fallbacks = [
                { id: 1, name: 'Apex Electricals', contact_person: 'Ramesh Kumar', phone: '9876543214', email: 'vendor.electric@maintenops.com' },
                { id: 2, name: 'Shree Krishna Traders', contact_person: 'Gopal Das', phone: '9876543215', email: 'krishna.traders@maintenops.com' },
                { id: 3, name: 'National Hardware Supply', contact_person: 'Suresh Patel', phone: '9876543216', email: 'national.hw@maintenops.com' },
                { id: 4, name: 'Mahavir Hardware & Plywoods', contact_person: 'Mahavir Jain', phone: '9876543217', email: 'mahavir@hardware.com' }
            ];
            const combined = [...fallbacks];
            customVendors.forEach(cv => {
                if (!combined.some(v => v.id === cv.id || v.name?.toLowerCase() === cv.name?.toLowerCase())) {
                    combined.push(cv);
                }
            });
            return combined;
        }
    },

    /**
     * Create a new vendor
     */
    createVendor: async (vendorData) => {
        const payload = {
            name: vendorData.name,
            contact_person: vendorData.contactPerson || vendorData.contact_person || '',
            phone: vendorData.phone || '',
            email: vendorData.email || '',
            is_active: true
        };

        const customVendors = JSON.parse(localStorage.getItem('custom_vendors') || '[]');
        const fallbackVendor = {
            id: Date.now(),
            ...payload
        };

        try {
            const { data, error } = await supabase
                .from('vendors')
                .insert([payload])
                .select()
                .single();

            if (error) {
                console.warn('[vendorService] DB insert notice:', error.message);
                customVendors.push(fallbackVendor);
                localStorage.setItem('custom_vendors', JSON.stringify(customVendors));
                return fallbackVendor;
            }

            customVendors.push(data);
            localStorage.setItem('custom_vendors', JSON.stringify(customVendors));
            return data;
        } catch (e) {
            console.error('[vendorService] Error creating vendor:', e);
            customVendors.push(fallbackVendor);
            localStorage.setItem('custom_vendors', JSON.stringify(customVendors));
            return fallbackVendor;
        }
    }
};

/**
 * Quotation-related service calls
 */
export const quotationService = {
    /**
     * Create a structured quotation using material picker selections
     * @param {Object} payload - QuotationRequestDTO
     */
    createQuotation: async (payload) => {
        const { requestId, estimatedDays, quotationNotes, itemBreakdown } = payload;
        
        let totalCost = 0;
        const insertItems = itemBreakdown.map(item => {
            const totalPrice = Number(item.quantityRequired) * Number(item.unitPrice);
            totalCost += totalPrice;
            return {
                request_id: requestId,
                material_id: item.materialId,
                specification_id: item.specificationId,
                material_name: item.materialName,
                specification_text: item.specificationText,
                quantity_required: item.quantityRequired,
                unit: item.unit,
                unit_price: item.unitPrice,
                total_price: totalPrice,
                vendor_id: item.vendorId,
                vendor_name: item.vendorName,
                last_purchase_rate: item.lastPurchaseRate,
                status: 'PENDING_PROCUREMENT'
            };
        });

        // Delete existing items for request
        await supabase.from('request_materials').delete().eq('request_id', requestId);

        // Insert new items
        const { error: insertError } = await supabase.from('request_materials').insert(insertItems);
        if (insertError) throw new Error(insertError.message);

        // Update request
        const { data: updatedRequest, error: updateError } = await supabase
            .from('requests')
            .update({
                total_estimated_cost: totalCost,
                estimated_days: estimatedDays,
                quotation_notes: quotationNotes,
                status: 'QUOTATION_ADDED',
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .select()
            .single();

        if (updateError) throw new Error(updateError.message);
        return mapRequest(updatedRequest);
    },

    /**
     * Get quotation details (material breakdown) for a request
     * @param {number} requestId
     */
    getQuotation: async (requestId) => {
        const { data, error } = await supabase
            .from('request_materials')
            .select('*')
            .eq('request_id', requestId);
        if (error) throw new Error(error.message);
        return data.map(mapMaterialItem);
    },

    /**
     * Check inventory status for a request's materials
     * @param {number} requestId
     */
    checkInventory: async (requestId) => {
        const { data: reqMaterials, error: rmError } = await supabase
            .from('request_materials')
            .select('*')
            .eq('request_id', requestId);
        if (rmError) throw new Error(rmError.message);

        const checks = await Promise.all(reqMaterials.map(async (rm) => {
            const { data: inv } = await supabase
                .from('inventory')
                .select('quantity_available')
                .eq('material_id', rm.material_id)
                .eq('specification_id', rm.specification_id)
                .maybeSingle();

            const available = inv ? Number(inv.quantity_available) : 0;
            const required = Number(rm.quantity_required);

            return {
                materialId: rm.material_id,
                materialName: rm.material_name,
                specificationText: rm.specification_text,
                quantityRequired: required,
                quantityAvailable: available,
                isSufficient: available >= required
            };
        }));

        return checks;
    },

    /**
     * Get all vendor purchase lists
     * @param {boolean} unpurchasedOnly - Filter to pending items only
     */
    getVendorLists: async (unpurchasedOnly = false) => {
        let q = supabase.from('vendor_purchase_lists').select('*');
        if (unpurchasedOnly) {
            q = q.eq('is_purchased', false);
        }
        const { data, error } = await q;
        if (error) throw new Error(error.message);
        return data.map(mapVendorListItem);
    },

    /**
     * Mark a vendor purchase list item as purchased
     * @param {number} id
     */
    markItemPurchased: async (id) => {
        const { error } = await supabase
            .from('vendor_purchase_lists')
            .update({
                is_purchased: true,
                purchased_at: new Date().toISOString()
            })
            .eq('id', id);
        if (error) throw new Error(error.message);
    },

    /**
     * User approves the quotation (QUOTATION_ADDED -> APPROVED)
     * @param {number} requestId
     */
    userApproveQuotation: async (requestId) => {
        // Fetch request materials
        const { data: items } = await supabase
            .from('request_materials')
            .select('*')
            .eq('request_id', requestId);

        if (items && items.length > 0) {
            // Populate vendor_purchase_lists entries for these items if not already existing
            const { data: existingLists } = await supabase
                .from('vendor_purchase_lists')
                .select('material_id')
                .in('material_id', items.map(i => i.material_id));

            const existingMatIds = new Set((existingLists || []).map(l => l.material_id));
            const newItems = items.filter(item => !existingMatIds.has(item.material_id));

            if (newItems.length > 0) {
                const purchaseListInserts = newItems.map(item => ({
                    vendor_id: item.vendor_id,
                    material_id: item.material_id,
                    specification_id: item.specification_id,
                    vendor_name: item.vendor_name,
                    material_name: item.material_name,
                    specification_text: item.specification_text,
                    total_quantity: item.quantity_required,
                    unit: item.unit,
                    rate_per_unit: item.unit_price,
                    total_price: item.total_price,
                    is_purchased: false
                }));

                try {
                    await supabase.from('vendor_purchase_lists').insert(purchaseListInserts);
                } catch (e) {
                    console.warn('[userApproveQuotation] vendor_purchase_lists insert notice:', e.message);
                }
            }
        }

        const { data, error } = await supabase
            .from('requests')
            .update({
                status: 'APPROVED',
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return mapRequest(data);
    },

    /**
     * Generate vendor purchase list (APPROVED -> PENDING_SA_APPROVAL)
     * @param {number} requestId
     */
    generateVendorList: async (requestId) => {
        // Fetch request materials
        const { data: items, error: fetchError } = await supabase
            .from('request_materials')
            .select('*')
            .eq('request_id', requestId);
        
        if (fetchError) throw new Error(fetchError.message);

        if (items && items.length > 0) {
            const { data: existingLists } = await supabase
                .from('vendor_purchase_lists')
                .select('material_id')
                .in('material_id', items.map(i => i.material_id));

            const existingMatIds = new Set((existingLists || []).map(l => l.material_id));
            const newItems = items.filter(item => !existingMatIds.has(item.material_id));

            if (newItems.length > 0) {
                const purchaseListInserts = newItems.map(item => ({
                    vendor_id: item.vendor_id,
                    material_id: item.material_id,
                    specification_id: item.specification_id,
                    vendor_name: item.vendor_name,
                    material_name: item.material_name,
                    specification_text: item.specification_text,
                    total_quantity: item.quantity_required,
                    unit: item.unit,
                    rate_per_unit: item.unit_price,
                    total_price: item.total_price,
                    is_purchased: false
                }));

                const { error: insertError } = await supabase
                    .from('vendor_purchase_lists')
                    .insert(purchaseListInserts);
                if (insertError) console.warn('[generateVendorList] Insert notice:', insertError.message);
            }
        }

        // Update Request status to PENDING_SA_APPROVAL
        const { data: updatedRequest, error: updateError } = await supabase
            .from('requests')
            .update({
                status: 'PENDING_SA_APPROVAL',
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .select()
            .single();

        if (updateError) throw new Error(updateError.message);
        return mapRequest(updatedRequest);
    },

    /**
     * Submit negotiation request (QUOTATION_ADDED -> NEGOTIATION_PENDING)
     * @param {number} requestId
     * @param {Object} payload - NegotiationRequestDto
     */
    negotiateQuotation: async (requestId, payload) => {
        const { negotiationNote, items } = payload;

        // Update items with requested negotiation quantities/reasons
        for (const item of items) {
            await supabase
                .from('request_materials')
                .update({
                    negotiation_quantity: item.negotiationQuantity,
                    negotiation_reason: item.negotiationReason
                })
                .eq('request_id', requestId)
                .eq('material_id', item.materialId);
        }

        // Update request status and overall negotiation note
        const { data: updatedRequest, error: updateError } = await supabase
            .from('requests')
            .update({
                status: 'NEGOTIATION_PENDING',
                negotiation_note: negotiationNote,
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .select()
            .single();

        if (updateError) throw new Error(updateError.message);
        return mapRequest(updatedRequest);
    },
};
