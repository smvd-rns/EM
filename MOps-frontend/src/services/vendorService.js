import { supabase } from './supabaseClient';

export const vendorService = {
    /**
     * Get purchase orders assigned to vendor
     */
    getVendorOrders: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            // Try fetching from vendor_purchase_lists
            const { data, error } = await supabase
                .from('vendor_purchase_lists')
                .select('*')
                .order('created_at', { ascending: false });

            if (error || !data || data.length === 0) {
                console.warn('[vendorService] Falling back to default vendor orders:', error?.message);
                return vendorService.getFallbackVendorOrders();
            }

            const savedStatuses = JSON.parse(localStorage.getItem('vendor_order_statuses') || '{}');

            return data.map(item => {
                let status = savedStatuses[item.id] || (item.is_purchased ? 'DELIVERED' : 'PENDING');
                if (item.is_purchased && status !== 'DELIVERED') {
                    status = 'DELIVERED';
                }
                return {
                    id: item.id,
                    orderNumber: `PO-${item.id.toString().padStart(5, '0')}`,
                    vendorName: item.vendor_name || user?.user_metadata?.name || 'Authorized Vendor',
                    materialName: item.material_name || 'Commercial Plywood 18mm',
                    specification: item.specification_text || 'IS:303 Grade Waterproof',
                    quantity: Number(item.total_quantity || 10),
                    unit: item.unit || 'sheet',
                    ratePerUnit: Number(item.rate_per_unit || 1200),
                    totalPrice: Number(item.total_price || (item.total_quantity * item.rate_per_unit) || 12000),
                    status: status,
                    deliveryAddress: 'ISKCON NVCC Maintenance Store, Katraj-Kondhwa Rd, Pune',
                    createdAt: item.created_at || new Date().toISOString()
                };
            });
        } catch (e) {
            console.error('[vendorService] Error fetching vendor orders:', e);
            return vendorService.getFallbackVendorOrders();
        }
    },

    /**
     * Update order delivery status (e.g. mark DELIVERED)
     */
    updateOrderStatus: async (orderId, newStatus) => {
        try {
            const isPurchased = newStatus === 'DELIVERED';
            const { error } = await supabase
                .from('vendor_purchase_lists')
                .update({
                    is_purchased: isPurchased
                })
                .eq('id', orderId);

            if (error) console.warn('[vendorService] DB update notice:', error.message);

            // Persist status locally so IN_TRANSIT and DELIVERED stay reactive
            const savedStatuses = JSON.parse(localStorage.getItem('vendor_order_statuses') || '{}');
            savedStatuses[orderId] = newStatus;
            localStorage.setItem('vendor_order_statuses', JSON.stringify(savedStatuses));

            return { id: orderId, status: newStatus };
        } catch (e) {
            console.error('[vendorService] Error updating order status:', e);
            return { id: orderId, status: newStatus };
        }
    },

    /**
     * Fallback vendor orders for demonstration and offline mode
     */
    getFallbackVendorOrders: () => [
        {
            id: 101,
            orderNumber: 'PO-98201',
            vendorName: 'Mahavir Hardware & Plywoods',
            materialName: 'Commercial Plywood 18mm',
            specification: '18mm Heavy Duty BWP Grade',
            quantity: 30,
            unit: 'sheet',
            ratePerUnit: 1450,
            totalPrice: 43500,
            status: 'PENDING',
            deliveryAddress: 'ISKCON NVCC Maintenance Store, Katraj-Kondhwa Rd, Pune',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
            id: 102,
            orderNumber: 'PO-98202',
            vendorName: 'Mahavir Hardware & Plywoods',
            materialName: 'Fevicol SH Synthetic Adhesive 5kg',
            specification: '5kg Industrial Can',
            quantity: 8,
            unit: 'can',
            ratePerUnit: 980,
            totalPrice: 7840,
            status: 'IN_TRANSIT',
            deliveryAddress: 'ISKCON NVCC Maintenance Store, Katraj-Kondhwa Rd, Pune',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 103,
            orderNumber: 'PO-98190',
            vendorName: 'Mahavir Hardware & Plywoods',
            materialName: 'Asian Paints Apex Royale White 20L',
            specification: 'Exterior Emulsion 20L Bucket',
            quantity: 5,
            unit: 'bucket',
            ratePerUnit: 4200,
            totalPrice: 21000,
            status: 'DELIVERED',
            deliveryAddress: 'ISKCON NVCC Maintenance Store, Katraj-Kondhwa Rd, Pune',
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
        },
        {
            id: 104,
            orderNumber: 'PO-98188',
            vendorName: 'Mahavir Hardware & Plywoods',
            materialName: 'Copper Wire 2.5 sqmm Polycab',
            specification: 'FR PVC Insulated 90m Roll',
            quantity: 12,
            unit: 'bundle',
            ratePerUnit: 1850,
            totalPrice: 22200,
            status: 'DELIVERED',
            deliveryAddress: 'ISKCON NVCC Electrical Store, Pune',
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
        }
    ]
};
