import { createContext, useContext, useState, useEffect } from 'react';
import { setTokenGetter } from '../services/api';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Notify api.js of token getter and setter
    useEffect(() => {
        setTokenGetter(() => accessToken, (newToken) => setAccessToken(newToken));
    }, [accessToken]);

    // Check active session and listen to auth changes
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setAccessToken(session.access_token);
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();
                    
                    const roleFromDb = profile?.role || session.user.user_metadata?.role || 'REQUESTER';

                    if (profile || session.user) {
                        const normalizedUser = {
                            id: session.user.id,
                            email: session.user.email,
                            username: profile?.username || session.user.user_metadata?.username || 'User',
                            name: profile?.username || session.user.user_metadata?.username || 'User',
                            mobileNumber: profile?.mobile_number || session.user.user_metadata?.mobile_number || '',
                            role: roleFromDb,
                            roles: [roleFromDb]
                        };
                        localStorage.setItem('user', JSON.stringify(normalizedUser));
                        setUser(normalizedUser);
                    }
                }
            } catch (error) {
                console.error('[AuthContext] Session check error:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setAccessToken(null);
                localStorage.removeItem('user');
            } else if (session?.user) {
                setAccessToken(session.access_token);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Fetch profile directly from Supabase DB profiles table
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle();

            const roleFromDb = profile?.role || data.user.user_metadata?.role || 'REQUESTER';

            const normalizedUser = {
                id: data.user.id,
                email: data.user.email,
                username: profile?.username || data.user.user_metadata?.username || 'User',
                name: profile?.username || data.user.user_metadata?.username || 'User',
                mobileNumber: profile?.mobile_number || data.user.user_metadata?.mobile_number || '',
                role: roleFromDb,
                roles: [roleFromDb]
            };

            localStorage.setItem('user', JSON.stringify(normalizedUser));
            setUser(normalizedUser);
            setAccessToken(data.session?.access_token || '');

            return normalizedUser;
        } catch (error) {
            throw new Error(error.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const signup = async (name, email, password, mobileNumber) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        email,
                        username: name,
                        mobile_number: mobileNumber,
                        role: 'REQUESTER'
                    }
                }
            });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            throw new Error(error.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (updatedFields) => {
        try {
            const updatedUser = {
                ...user,
                ...updatedFields,
                name: updatedFields.name ?? user?.name,
                username: updatedFields.name ?? user?.username,
                mobileNumber: updatedFields.mobileNumber ?? user?.mobileNumber,
                location: updatedFields.location ?? user?.location,
                role: updatedFields.role ?? user?.role,
                roles: updatedFields.roles ?? (updatedFields.role ? [updatedFields.role] : user?.roles)
            };

            if (user?.id) {
                const supabaseUpdates = {};
                if (updatedFields.name) supabaseUpdates.username = updatedFields.name;
                if (updatedFields.mobileNumber) supabaseUpdates.mobile_number = updatedFields.mobileNumber;
                if (updatedFields.location) supabaseUpdates.location = updatedFields.location;
                if (updatedFields.role) supabaseUpdates.role = updatedFields.role;

                if (Object.keys(supabaseUpdates).length > 0) {
                    const { error } = await supabase
                        .from('profiles')
                        .update(supabaseUpdates)
                        .eq('id', user.id);

                    if (error) {
                        console.warn('[AuthContext] Supabase profile update error:', error.message);
                    }
                }
            }

            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('[AuthContext] Update profile error:', error);
            throw new Error(error.message || 'Failed to update profile');
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('[AuthContext] Logout error:', error);
        } finally {
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('user');
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading, accessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
