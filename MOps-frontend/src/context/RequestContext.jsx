import React, { createContext, useState, useContext, useEffect } from 'react';
import { requestService } from '../services/requestService';
import { useAuth } from './AuthContext';
import { formatDate } from '../utils/dateUtils';

const RequestContext = createContext();

export const useRequests = () => useContext(RequestContext);

export const RequestProvider = ({ children }) => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRequests = async () => {
        if (!user || user.role !== 'REQUESTER') {
            setRequests([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await requestService.getMyRequests();
            // Transform backend DTO to match frontend expectations where needed
            // Backend keys: id, requestNumber, mobileNumber, itemDescription, requiredDate, status, urgencyRequested, urgencyReason, requesterName, organizationDepartmentName, serviceDepartmentName, adminRemarks, adminName, adminReviewedAt, quotationAmount, quotationDescription, superAdminRemarks, superAdminName, superAdminReviewedAt, createdAt

            const transformedRequests = data.map(req => ({
                id: req.id, // Keep the numeric ID as 'id' for service calls
                requestNumber: req.requestNumber, // Use requestNumber for display
                serviceDepartmentName: req.serviceDepartmentName,
                itemDescription: req.itemDescription,
                date: formatDate(req.createdAt),
                status: req.status,
                requesterName: req.requesterName,
                createdAt: req.createdAt,
                adminRemarks: req.adminRemarks,
                adminName: req.adminName,
                adminReviewedAt: req.adminReviewedAt,
                requiredDate: req.requiredDate,
                quotationAmount: req.quotationAmount,
                quotationDescription: req.quotationDescription,
                totalEstimatedCost: req.totalEstimatedCost,
                estimatedDays: req.estimatedDays,
                materials: req.materials,
                images: req.images || [],
                superAdminRemarks: req.superAdminRemarks,
                superAdminName: req.superAdminName,
                superAdminReviewedAt: req.superAdminReviewedAt
            }));

            // Sort by newest first
            transformedRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRequests(transformedRequests);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch requests:', err);
            setRequests([]);
            setError(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [user]); // Re-fetch when user changes (e.g., login/logout)

    const activeRequests = requests.filter(req => req.status !== 'COMPLETED');
    const totalRequests = requests.length;
    const submittedRequests = requests.filter(req => req.status === 'REQUEST_CREATED').length;
    const pendingSARequests = requests.filter(req => req.status === 'QUOTATION_ADDED').length;
    const completedRequests = requests.filter(req => req.status === 'COMPLETED').length;

    const addRequest = (newRequestData) => {
        // Transform the newly created request before adding to state
        const formattedNewRequest = {
            id: newRequestData.id,
            requestNumber: newRequestData.requestNumber,
            serviceDepartmentName: newRequestData.serviceDepartmentName,
            itemDescription: newRequestData.itemDescription,
            date: formatDate(newRequestData.createdAt || Date.now()),
            status: newRequestData.status || 'REQUEST_CREATED',
            createdAt: newRequestData.createdAt || new Date().toISOString()
        };

        setRequests(prev => [formattedNewRequest, ...prev]);
    };

    return (
        <RequestContext.Provider value={{
            requests,
            activeRequests,
            loading,
            error,
            refreshRequests: fetchRequests,
            addRequest,
            stats: { total: totalRequests, active: submittedRequests, pending: pendingSARequests, completed: completedRequests }
        }}>
            {children}
        </RequestContext.Provider>
    );
};
