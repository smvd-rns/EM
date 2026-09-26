import { supabase } from './supabaseClient';

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

let profileMapCache = null;
let profileMapPromise = null;
export const getProfileMap = async () => {
    if (profileMapCache) return profileMapCache;
    if (profileMapPromise) return profileMapPromise;
    profileMapPromise = (async () => {
        try {
            const { data } = await supabase.from('profiles').select('id, username, email');
            if (data && data.length > 0) {
                profileMapCache = new Map(data.map(p => [p.id, p.username || (p.email ? p.email.split('@')[0] : 'User')]));
            }
        } catch (e) {
            console.warn('[requestService] Error fetching profile map:', e);
        }
        return profileMapCache || new Map();
    })();
    return profileMapPromise;
};

export const getCurrentUser = async () => {
    try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) return data.user;
    } catch (e) {
        // ignore
    }
    const stored = localStorage.getItem('user');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            // ignore
        }
    }
    return null;
};

export const mapRequest = (r, profileMap = null) => {
    if (!r) return null;
    const rawMaterials = r.request_materials || r.materials || [];
    const profileName = profileMap ? profileMap.get(r.requester_id) : null;
    const nameFromProfile = profileName || r.profiles?.username || r.profiles?.name || (r.profiles?.email ? r.profiles.email.split('@')[0] : null);
    return {
        id: r.id,
        requestNumber: r.request_number || r.requestNumber,
        requesterId: r.requester_id || r.requesterId,
        requesterName: nameFromProfile || r.requester_name || r.requesterName || 'Requester User',
        mobileNumber: r.mobile_number || r.mobileNumber,
        serviceDepartmentId: r.service_department_id || r.serviceDepartmentId,
        serviceDepartmentName: r.service_departments?.name || r.serviceDepartmentName,
        organizationDepartmentName: r.organization_department_name || r.organizationDepartmentName || r.dept,
        dept: r.organization_department_name || r.dept,
        itemDescription: r.item_description || r.itemDescription,
        requiredDate: r.required_date || r.requiredDate,
        status: r.status,
        urgencyRequested: r.urgency_requested || r.urgencyRequested,
        urgencyReason: r.urgency_reason || r.urgencyReason,
        adminRemarks: r.admin_remarks || r.adminRemarks,
        adminName: r.admin_name || r.adminName,
        adminReviewedAt: r.admin_reviewed_at || r.adminReviewedAt,
        totalEstimatedCost: r.total_estimated_cost || r.totalEstimatedCost,
        quotationNotes: r.quotation_notes || r.quotationNotes || r.quotationDescription,
        quotationAmount: r.total_estimated_cost || r.quotationAmount,
        estimatedDays: r.estimated_days || r.estimatedDays,
        superAdminRemarks: r.super_admin_remarks || r.superAdminRemarks,
        superAdminName: r.super_admin_name || r.superAdminName,
        superAdminReviewedAt: r.super_admin_reviewed_at || r.superAdminReviewedAt,
        negotiationNote: r.negotiation_note || r.negotiationNote || '',
        createdAt: r.created_at || r.createdAt,
        updatedAt: r.updated_at || r.updatedAt,
        images: r.request_images ? r.request_images.map(img => img.image_path) : (r.images || []),
        materials: rawMaterials.map(mapMaterialItem).filter(Boolean)
    };
};

/**
 * Service handling all request-related API calls using direct Supabase queries
 */
export const requestService = {
    // Convert any Drive URL format → lh3.googleusercontent.com direct CDN URL
    // Works for both newly stored lh3 URLs and legacy thumbnail URLs
    formatImageUrl: (path) => {
        if (!path) return '';
        // Already an lh3 URL — return as-is
        if (path.includes('lh3.googleusercontent.com')) return path;
        // Legacy: https://drive.google.com/thumbnail?id=FILE_ID&sz=...
        const thumbnailMatch = path.match(/[?&]id=([^&]+)/);
        if (thumbnailMatch) {
            return `https://lh3.googleusercontent.com/d/${thumbnailMatch[1]}`;
        }
        // Legacy: https://drive.google.com/file/d/FILE_ID/...
        const fileMatch = path.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (fileMatch) {
            return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
        }
        return path;
    },

    // ==================== Phase 1: Request & Quotation ====================

    /**
     * Create a new maintenance request with optional image uploads
     */
    createRequest: async (requestData, imageFiles = []) => {
        try {
            const user = await getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            // Generate unique request number
            const timestamp = Date.now();
            const random = Math.floor(1000 + Math.random() * 9000);
            const requestNumber = `REQ-${timestamp}-${random}`;

            // Resolve department name to ID
            const { data: deptData, error: deptError } = await supabase
                .from('service_departments')
                .select('id')
                .ilike('name', requestData.serviceDepartmentName)
                .single();

            if (deptError || !deptData) {
                throw new Error(`Invalid service department: ${requestData.serviceDepartmentName}`);
            }

            // 1. Insert Request
            const { data: request, error: reqError } = await supabase
                .from('requests')
                .insert({
                    request_number: requestNumber,
                    mobile_number: requestData.mobileNumber,
                    requester_id: user.id,
                    service_department_id: deptData.id,
                    item_description: requestData.itemDescription,
                    status: 'REQUEST_CREATED'
                })
                .select()
                .single();

            if (reqError) throw new Error(reqError.message);

            // Helper to get Google OAuth access token using refresh token
            const getGoogleAccessToken = async () => {
                const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
                const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
                const refreshToken = import.meta.env.VITE_GOOGLE_REFRESH_TOKEN;

                const response = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        client_id: clientId,
                        client_secret: clientSecret,
                        refresh_token: refreshToken,
                        grant_type: 'refresh_token',
                    }),
                });
                const data = await response.json();
                if (data.error) throw new Error(data.error_description || data.error);
                return data.access_token;
            };

            // 2. Upload images to Google Drive
            if (imageFiles && imageFiles.length > 0) {
                const imageUrls = [];
                const accessToken = await getGoogleAccessToken();
                const folderId = import.meta.env.VITE_MAIN_DRIVE_FOLDER_ID;

                for (const file of imageFiles) {
                    const metadata = {
                        name: `${requestNumber}-${Date.now()}-${file.name}`,
                        parents: [folderId],
                    };

                    const formData = new FormData();
                    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
                    formData.append('file', file);

                    const uploadResponse = await fetch(
                        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                            },
                            body: formData,
                        }
                    );

                    const result = await uploadResponse.json();
                    if (result.error) {
                        console.error('Failed to upload to Google Drive:', result.error.message);
                        continue;
                    }

                    // Set file permissions so anyone with the link can view it (required for display)
                    try {
                        await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}/permissions`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                role: 'reader',
                                type: 'anyone',
                            }),
                        });
                    } catch (e) {
                        console.error('Failed to set permission on Google Drive file:', e);
                    }

                    // Store as lh3.googleusercontent.com direct CDN URL — no redirects, no Vercel bandwidth
                    const directImageUrl = `https://lh3.googleusercontent.com/d/${result.id}`;

                    imageUrls.push({
                        request_id: request.id,
                        image_path: directImageUrl
                    });
                }

                if (imageUrls.length > 0) {
                    const { error: imgInsertError } = await supabase
                        .from('request_images')
                        .insert(imageUrls);
                    if (imgInsertError) console.error('Failed to save image metadata:', imgInsertError);
                }
            }

            return mapRequest(request);
        } catch (error) {
            console.error('[RequestService] Error creating request:', error);
            throw error;
        }
    },

    /**
     * Get all requests for the logged-in user
     */
    getMyRequests: async () => {
        try {
            const user = await getCurrentUser();
            if (!user || !user.id) {
                console.warn('[RequestService] No logged-in user found for getMyRequests');
                return [];
            }

            const pMap = await getProfileMap();

            const { data, error } = await supabase
                .from('requests')
                .select(`
                    *,
                    service_departments (name),
                    request_images (image_path),
                    request_materials (*)
                `)
                .eq('requester_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[RequestService] Error fetching user requests:', error);
                return [];
            }

            // Normalize structure to match existing DTO format
            return (data || []).map(r => mapRequest(r, pMap));
        } catch (error) {
            console.error('[RequestService] Error fetching user requests:', error);
            return [];
        }
    },

    /**
     * Get a specific request by ID
     */
    getRequestById: async (id) => {
        try {
            const { data: request, error: reqError } = await supabase
                .from('requests')
                .select(`
                    *,
                    service_departments (name)
                `)
                .eq('id', id)
                .single();

            if (reqError) throw new Error(reqError.message);

            // Fetch images
            const { data: images } = await supabase
                .from('request_images')
                .select('image_path')
                .eq('request_id', id);

            // Fetch materials
            const { data: materials } = await supabase
                .from('request_materials')
                .select('*')
                .eq('request_id', id);

            return mapRequest({
                ...request,
                request_images: images,
                materials: materials || []
            });
        } catch (error) {
            console.error('[RequestService] Error fetching request details:', error);
            throw error;
        }
    },

    /**
     * Get pending requests for Admin review (REQUEST_CREATED status)
     */
    getPendingAdminRequests: async () => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .select(`
                    *,
                    service_departments (name),
                    request_images (image_path),
                    request_materials (*)
                `)
                .in('status', ['REQUEST_CREATED', 'APPROVED', 'VENDOR_LIST_APPROVED', 'ITEMS_READY', 'IN_PRODUCTION', 'PAYMENT_PENDING'])
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[RequestService] Error fetching pending admin requests:', error);
                return [];
            }

            const pMap = await getProfileMap();
            return (data || []).map(r => mapRequest(r, pMap));
        } catch (error) {
            console.error('[RequestService] Error in getPendingAdminRequests:', error);
            return [];
        }
    },

    /**
     * Submit Admin review for a request (REQUEST_CREATED → QUOTATION_ADDED)
     */
    submitAdminReview: async (reviewData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('requests')
                .update({
                    admin_remarks: reviewData.adminRemarks,
                    required_date: reviewData.requiredDate,
                    service_department_id: reviewData.serviceDepartmentId,
                    reviewed_by_admin_id: user.id,
                    admin_reviewed_at: new Date().toISOString(),
                    status: 'QUOTATION_ADDED',
                    updated_at: new Date().toISOString()
                })
                .eq('id', reviewData.requestId)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return mapRequest(data);
        } catch (error) {
            console.error('[RequestService] Error submitting admin review:', error);
            throw error;
        }
    },

    /**
     * Get pending requests for Super Admin review (QUOTATION_ADDED status)
     */
    getPendingSuperAdminRequests: async () => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .select(`
                    *,
                    service_departments (name),
                    request_images (image_path),
                    request_materials (*)
                `)
                .eq('status', 'QUOTATION_ADDED')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[RequestService] Error fetching pending super admin requests:', error);
                return [];
            }

            const pMap = await getProfileMap();
            return (data || []).map(r => mapRequest(r, pMap));
        } catch (error) {
            console.error('[RequestService] Error in getPendingSuperAdminRequests:', error);
            return [];
        }
    },

    /**
     * Submit Super Admin review (quotation approval)
     * Status: QUOTATION_ADDED → QUOTATION_APPROVED
     */
    submitSuperAdminReview: async (reviewData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('requests')
                .update({
                    super_admin_remarks: reviewData.superAdminRemarks,
                    total_estimated_cost: reviewData.quotationAmount,
                    quotation_notes: reviewData.quotationDescription,
                    reviewed_by_super_admin_id: user.id,
                    super_admin_reviewed_at: new Date().toISOString(),
                    status: 'QUOTATION_APPROVED',
                    updated_at: new Date().toISOString()
                })
                .eq('id', reviewData.requestId)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return mapRequest(data);
        } catch (error) {
            console.error('[RequestService] Error submitting super admin review:', error);
            throw error;
        }
    },

    /**
     * User accepts the quotation
     * Status: QUOTATION_APPROVED → APPROVED
     */
    approveQuotation: async (requestId) => {
        try {
            const { data: items } = await supabase
                .from('request_materials')
                .select('*')
                .eq('request_id', requestId);

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

                    try {
                        await supabase.from('vendor_purchase_lists').insert(purchaseListInserts);
                    } catch (e) {
                        console.warn('[approveQuotation] Insert notice:', e.message);
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
        } catch (error) {
            console.error('[RequestService] Error approving quotation:', error);
            throw error;
        }
    },

    // ==================== History ====================

    /**
     * Get request history for the logged-in Admin
     */
    getAdminRequestHistory: async () => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .select(`
                    *,
                    service_departments (name),
                    request_images (image_path),
                    request_materials (*)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[RequestService] Error fetching admin request history:', error);
                return [];
            }

            const pMap = await getProfileMap();
            return (data || []).map(r => mapRequest(r, pMap));
        } catch (error) {
            console.error('[RequestService] Error in getAdminRequestHistory:', error);
            return [];
        }
    },

    /**
     * Get request history for the logged-in Super Admin
     */
    getSuperAdminRequestHistory: async () => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .select(`
                    *,
                    service_departments (name),
                    request_images (image_path),
                    request_materials (*)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[RequestService] Error fetching super admin request history:', error);
                return [];
            }

            const pMap = await getProfileMap();
            return (data || []).map(r => mapRequest(r, pMap));
        } catch (error) {
            console.error('[RequestService] Error in getSuperAdminRequestHistory:', error);
            return [];
        }
    },

    // ==================== Phase 2: List Preparation ====================

    /**
     * Get all APPROVED requests (ready for list generation)
     */
    getApprovedRequests: async () => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .select(`
                    *,
                    service_departments (name),
                    request_images (image_path)
                `)
                .eq('status', 'APPROVED')
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);

            return data.map(mapRequest);
        } catch (error) {
            console.error('[RequestService] Error fetching approved requests:', error);
            throw error;
        }
    },

    /**
     * Generate User Material List + Vendor Lists for a request
     * Status: APPROVED → PENDING_SA_APPROVAL
     */
    generateLists: async (requestId) => {
        try {
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

                    await supabase.from('vendor_purchase_lists').insert(purchaseListInserts);
                }
            }

            const { data, error } = await supabase
                .from('requests')
                .update({
                    status: 'PENDING_SA_APPROVAL',
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return mapRequest(data);
        } catch (error) {
            console.error('[RequestService] Error generating lists:', error);
            throw error;
        }
    },

    /**
     * Get requests pending vendor list approval (for Super Admin)
     */
    getPendingListApproval: async () => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .select(`
                    *,
                    service_departments (name),
                    request_images (image_path),
                    request_materials (*)
                `)
                .eq('status', 'PENDING_SA_APPROVAL')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[RequestService] Error fetching pending list approval:', error);
                return [];
            }

            const pMap = await getProfileMap();
            return (data || []).map(r => mapRequest(r, pMap));
        } catch (error) {
            console.error('[RequestService] Error in getPendingListApproval:', error);
            return [];
        }
    },

    /**
     * Super Admin approves vendor lists
     * Status: PENDING_SA_APPROVAL → VENDOR_LIST_APPROVED
     */
    approveVendorLists: async (requestId) => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .update({
                    status: 'VENDOR_LIST_APPROVED',
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return mapRequest(data);
        } catch (error) {
            console.error('[RequestService] Error approving vendor lists:', error);
            throw error;
        }
    },

    // ==================== Phase 3: Procurement ====================

    /**
     * Mark a single material item as PROCURED
     * When all items are procured, request auto-transitions to ITEMS_READY
     */
    markItemProcured: async (materialId) => {
        try {
            // First mark this specific item as PROCURED
            const { error: updateItemError } = await supabase
                .from('request_materials')
                .update({ status: 'PROCURED' })
                .eq('id', materialId);
            
            if (updateItemError) throw new Error(updateItemError.message);

            // Fetch the request_id for this item
            const { data: item } = await supabase
                .from('request_materials')
                .select('request_id')
                .eq('id', materialId)
                .single();

            if (item) {
                // Check if all items in this request are procured
                const { data: allItems } = await supabase
                    .from('request_materials')
                    .select('status')
                    .eq('request_id', item.request_id);

                const allProcured = allItems.every(i => i.status === 'PROCURED');
                if (allProcured) {
                    // Update request status to ITEMS_READY
                    await supabase
                        .from('requests')
                        .update({ status: 'ITEMS_READY', updated_at: new Date().toISOString() })
                        .eq('id', item.request_id);
                }
            }

            return { success: true };
        } catch (error) {
            console.error('[RequestService] Error marking item as procured:', error);
            throw error;
        }
    },

    /**
     * Mark all materials for a request as PROCURED & advance status to ITEMS_READY
     */
    markAllProcured: async (requestId) => {
        try {
            // Update all request_materials to PROCURED
            await supabase
                .from('request_materials')
                .update({ status: 'PROCURED' })
                .eq('request_id', requestId);

            // Update request status to ITEMS_READY
            const { data, error } = await supabase
                .from('requests')
                .update({
                    status: 'ITEMS_READY',
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return mapRequest(data);
        } catch (error) {
            console.error('[RequestService] Error marking all procured:', error);
            throw error;
        }
    },

    /**
     * Get all requests with ITEMS_READY status (Super Admin monitoring)
     */
    getItemsReadyRequests: async () => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .select(`
                    *,
                    service_departments (name),
                    request_images (image_path)
                `)
                .eq('status', 'ITEMS_READY')
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);

            return data.map(mapRequest);
        } catch (error) {
            console.error('[RequestService] Error fetching items ready requests:', error);
            throw error;
        }
    },

    /**
     * Get all requests with IN_PRODUCTION status (Super Admin monitoring)
     */
    getInProductionRequests: async () => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .select(`
                    *,
                    service_departments (name),
                    request_images (image_path)
                `)
                .eq('status', 'IN_PRODUCTION')
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);

            return data.map(mapRequest);
        } catch (error) {
            console.error('[RequestService] Error fetching in-production requests:', error);
            throw error;
        }
    },

    // ==================== Phase 4: Production ====================

    /**
     * Start production for a request
     * Status: ITEMS_READY → IN_PRODUCTION
     */
    startProduction: async (requestId) => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .update({
                    status: 'IN_PRODUCTION',
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return mapRequest(data);
        } catch (error) {
            console.error('[RequestService] Error starting production:', error);
            throw error;
        }
    },

    /**
     * Complete production for a request
     * Status: IN_PRODUCTION → PAYMENT_PENDING
     */
    completeProduction: async (requestId) => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .update({
                    status: 'PAYMENT_PENDING',
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return mapRequest(data);
        } catch (error) {
            console.error('[RequestService] Error completing production:', error);
            throw error;
        }
    },

    // ==================== Phase 5: Payment & Closure ====================

    /**
     * Confirm payment received, close the request
     * Status: PAYMENT_PENDING → COMPLETED
     */
    confirmPayment: async (requestId) => {
        try {
            const { data, error } = await supabase
                .from('requests')
                .update({
                    status: 'COMPLETED',
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return mapRequest(data);
        } catch (error) {
            console.error('[RequestService] Error confirming payment:', error);
            throw error;
        }
    },

    /**
     * Admin approves the negotiated quotation
     */
    approveNegotiation: async (requestId, adminRemarks = '') => {
        try {
            // 1. Fetch materials for this request
            const { data: materials, error: fetchError } = await supabase
                .from('request_materials')
                .select('*')
                .eq('request_id', requestId);
            
            if (fetchError) throw new Error(fetchError.message);

            let newTotalCost = 0;

            // 2. Overwrite quantity_required with negotiation_quantity, update database
            for (const item of (materials || [])) {
                let qty = item.quantity_required;
                let price = item.total_price;

                if (item.negotiation_quantity !== null && Number(item.negotiation_quantity) > 0) {
                    qty = Number(item.negotiation_quantity);
                    price = qty * Number(item.unit_price);
                }

                newTotalCost += price;

                const { error: updateItemError } = await supabase
                    .from('request_materials')
                    .update({
                        quantity_required: qty,
                        total_price: price,
                        negotiation_quantity: null,
                        negotiation_reason: null
                    })
                    .eq('id', item.id);
                
                if (updateItemError) throw new Error(updateItemError.message);
            }

            // 3. Update Request status to QUOTATION_APPROVED so requester must accept it
            const updatePayload = {
                status: 'QUOTATION_APPROVED',
                total_estimated_cost: newTotalCost,
                updated_at: new Date().toISOString()
            };

            if (adminRemarks) {
                updatePayload.admin_remarks = adminRemarks;
            }

            const { data, error } = await supabase
                .from('requests')
                .update(updatePayload)
                .eq('id', requestId)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return mapRequest(data);
        } catch (error) {
            console.error('[RequestService] Error approving negotiation:', error);
            throw error;
        }
    },
};
