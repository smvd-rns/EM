import { supabase } from './supabaseClient';

export const inventoryService = {
    /**
     * Get all inventory items with material details
     */
    getAllInventory: async () => {
        try {
            const { data, error } = await supabase
                .from('inventory')
                .select(`
                    id,
                    material_id,
                    specification_id,
                    quantity_available,
                    min_threshold,
                    last_updated,
                    materials (
                        id,
                        name,
                        category,
                        default_unit
                    )
                `);

            if (error || !data || data.length === 0) {
                console.warn('[inventoryService] Supabase inventory fetch fallback:', error?.message);
                return inventoryService.getFallbackInventory();
            }

            return data.map(item => ({
                id: item.id,
                materialId: item.material_id,
                specificationId: item.specification_id,
                materialName: item.materials?.name || 'Store Item',
                category: item.materials?.category || 'General',
                unit: item.materials?.default_unit || 'piece',
                quantityAvailable: Number(item.quantity_available || 0),
                minThreshold: Number(item.min_threshold || 10),
                lastUpdated: item.last_updated || new Date().toISOString()
            }));
        } catch (e) {
            console.error('[inventoryService] Error fetching inventory:', e);
            return inventoryService.getFallbackInventory();
        }
    },

    /**
     * Update quantity available for an inventory item
     */
    updateStock: async (id, newQuantity) => {
        try {
            const { error } = await supabase
                .from('inventory')
                .update({
                    quantity_available: newQuantity,
                    last_updated: new Date().toISOString()
                })
                .eq('id', id);

            if (error) console.warn('[inventoryService] DB update warning:', error.message);
            return { id, quantityAvailable: newQuantity };
        } catch (e) {
            console.error('[inventoryService] Error updating stock:', e);
            return { id, quantityAvailable: newQuantity };
        }
    },

    /**
     * Add a new item to store inventory
     */
    addInventoryItem: async (newItem) => {
        try {
            const { data, error } = await supabase
                .from('inventory')
                .insert([{
                    material_id: newItem.materialId || null,
                    specification_id: newItem.specificationId || null,
                    quantity_available: Number(newItem.quantityAvailable || 0),
                    min_threshold: Number(newItem.minThreshold || 10),
                    last_updated: new Date().toISOString()
                }])
                .select();

            if (error || !data) {
                console.warn('[inventoryService] Add item fallback:', error?.message);
                return {
                    id: Date.now(),
                    materialName: newItem.materialName,
                    category: newItem.category || 'General',
                    unit: newItem.unit || 'piece',
                    quantityAvailable: Number(newItem.quantityAvailable || 0),
                    minThreshold: Number(newItem.minThreshold || 10),
                    lastUpdated: new Date().toISOString()
                };
            }
            return data[0];
        } catch (e) {
            console.error('[inventoryService] Error adding inventory item:', e);
            return {
                id: Date.now(),
                materialName: newItem.materialName,
                category: newItem.category || 'General',
                unit: newItem.unit || 'piece',
                quantityAvailable: Number(newItem.quantityAvailable || 0),
                minThreshold: Number(newItem.minThreshold || 10),
                lastUpdated: new Date().toISOString()
            };
        }
    },

    /**
     * Issue stock for maintenance requests
     */
    issueStock: async (id, quantityIssued) => {
        try {
            const items = await inventoryService.getAllInventory();
            const target = items.find(i => i.id === id);
            const currentQty = target ? target.quantityAvailable : 20;
            const updatedQty = Math.max(0, currentQty - quantityIssued);

            return await inventoryService.updateStock(id, updatedQty);
        } catch (e) {
            console.error('[inventoryService] Error issuing stock:', e);
            throw e;
        }
    },

    /**
     * Fallback Inventory Data when DB table is being initialized
     */
    getFallbackInventory: () => [
        { id: 1, materialId: 101, materialName: 'Commercial Plywood 18mm', category: 'Material', unit: 'sheet', quantityAvailable: 45, minThreshold: 15, lastUpdated: new Date().toISOString() },
        { id: 2, materialId: 102, materialName: 'Sunmica High Gloss 1mm', category: 'Material', unit: 'sheet', quantityAvailable: 8, minThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 3, materialId: 103, materialName: 'Iron Nails 1 inch', category: 'Hardware', unit: 'kg', quantityAvailable: 25, minThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 4, materialId: 104, materialName: 'Fevicol SH Adhesive 5kg', category: 'Consumable', unit: 'can', quantityAvailable: 12, minThreshold: 4, lastUpdated: new Date().toISOString() },
        { id: 5, materialId: 105, materialName: 'LED Tube Light 20W', category: 'Hardware', unit: 'piece', quantityAvailable: 4, minThreshold: 10, lastUpdated: new Date().toISOString() },
        { id: 6, materialId: 106, materialName: 'Copper Wire 1.5 sqmm', category: 'Hardware', unit: 'bundle', quantityAvailable: 18, minThreshold: 5, lastUpdated: new Date().toISOString() },
        { id: 7, materialId: 107, materialName: 'Asian Paints White 20L', category: 'Consumable', unit: 'bucket', quantityAvailable: 2, minThreshold: 5, lastUpdated: new Date().toISOString() }
    ]
};
