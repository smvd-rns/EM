export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

let isRefreshing = false;
let refreshPromise = null;
let getAccessToken = () => null; // Will be set by AuthContext
let setAccessToken = null; // Will be set by AuthContext

/**
 * Set the token getter and setter functions (called by AuthContext)
 */
export const setTokenGetter = (getter, setter) => {
    getAccessToken = getter;
    setAccessToken = setter;
};

/**
 * Refresh access token using refresh token from HttpOnly cookie
 */
const refreshAccessToken = async () => {
    // Only allow one refresh request at a time
    if (isRefreshing) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            console.log('[API] Attempting to refresh access token');
            const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Send refresh token from HttpOnly cookie
                body: JSON.stringify({}),
            });

            if (response.ok) {
                const data = await response.json();
                const { accessToken, expiresIn } = data;

                // Update token in React state and localStorage
                if (setAccessToken) {
                    setAccessToken(accessToken);
                }
                localStorage.setItem('expiresIn', expiresIn);

                console.log('[API] Access token refreshed successfully');
                return accessToken;
            } else {
                console.log('[API] Token refresh failed with status:', response.status);
                return null;
            }
        } catch (error) {
            console.error('[API] Token refresh error:', error);
            return null;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

/**
 * Generic API call function with authorization token and auto-refresh
 * @param {string} endpoint - API endpoint (e.g., '/api/users')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>}
 */
export const apiCall = async (endpoint, options = {}) => {
    const token = getAccessToken();
    const tokenType = localStorage.getItem('tokenType') || 'Bearer';

    const headers = {
        ...options.headers,
    };

    // Only set Content-Type to JSON if body is NOT FormData
    // (FormData needs the browser to auto-set the multipart boundary)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    // Add authorization header if token exists
    if (token) {
        headers['Authorization'] = `${tokenType} ${token}`;
    }

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for refresh token
    });

    // Handle unauthorized (token expired) - try to refresh
    if (response.status === 401) {
        console.log('[API] Got 401, attempting token refresh');
        const refreshedToken = await refreshAccessToken();

        if (refreshedToken) {
            // Retry the original request with new token directly from refresh
            const newHeaders = {
                ...headers,
                'Authorization': `${tokenType} ${refreshedToken}`,
            };

            console.log('[API] Retrying request with new token');
            response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: newHeaders,
                credentials: 'include',
            });
        }

        // ONLY redirect to login if STILL 401 (truly unauthenticated / session expired)
        // Do NOT redirect on 403 (Forbidden) — that's a role/permission error we handle in the UI
        if (response.status === 401) {
            console.log('[API] Still 401 after refresh attempt, redirecting to login');
            localStorage.removeItem('tokenType');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
        }
    }

    return response;
};

/**
 * GET request helper
 */
export const get = (endpoint, options = {}) => {
    return apiCall(endpoint, { ...options, method: 'GET' });
};

/**
 * POST request helper
 */
export const post = (endpoint, body, options = {}) => {
    return apiCall(endpoint, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body),
    });
};

/**
 * PUT request helper
 */
export const put = (endpoint, body, options = {}) => {
    return apiCall(endpoint, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body),
    });
};

/**
 * DELETE request helper
 */
export const deleteRequest = (endpoint, options = {}) => {
    return apiCall(endpoint, { ...options, method: 'DELETE' });
};

/**
 * PATCH request helper
 */
export const patch = (endpoint, body, options = {}) => {
    return apiCall(endpoint, {
        ...options,
        method: 'PATCH',
        body: JSON.stringify(body),
    });
};

/**
 * POST request helper for FormData (multipart/form-data)
 * Does NOT set Content-Type — the browser auto-sets it with the correct boundary.
 */
export const postFormData = (endpoint, formData, options = {}) => {
    return apiCall(endpoint, {
        ...options,
        method: 'POST',
        body: formData,
        headers: {
            // Explicitly remove Content-Type so browser sets multipart boundary
            ...options.headers,
        },
    });
};
