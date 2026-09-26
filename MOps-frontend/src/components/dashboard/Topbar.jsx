import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

import { Link, useNavigate } from 'react-router-dom';
import { getRoleDisplayName } from '../../utils/roleUtils';

const Topbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();

    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <header className="fixed top-0 right-0 left-0 md:left-[240px] h-[64px] bg-white/90 backdrop-blur-md border-b border-sky-200 z-40 flex items-center justify-between px-4 sm:px-8 shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button
                        onClick={onMenuClick}
                        className="md:hidden w-10 h-10 rounded-xl hover:bg-sky-100 flex items-center justify-center transition-colors text-sky-700"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-[18px] sm:text-[20px] font-display font-bold text-slate-900 tracking-tight">
                            MaintenOps Dashboard
                        </h1>
                        <p className="hidden sm:block text-[10px] text-sky-600 font-ui mt-0.5 uppercase tracking-[0.1em] font-bold opacity-90">ISKCON NVCC Pune | Maintenance System</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">

                    {/* User Profile */}
                    <div className="relative pl-1" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center transition-all shadow-md shadow-sky-600/30 hover:shadow-lg hover:scale-105"
                        >
                            <span className="text-white text-[14px] font-bold font-ui">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute top-[52px] right-0 w-[240px] bg-surface rounded-2xl shadow-2xl border border-outline py-2 animate-fadeUp origin-top-right z-50">
                                <div className="px-4 py-3 border-b border-outline mb-2 text-center bg-surface-variant/40">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent mx-auto mb-2 flex items-center justify-center text-white text-[18px] font-bold shadow-md">
                                        {user?.name?.charAt(0)}
                                    </div>
                                    <div className="text-[15px] font-ui font-bold text-on-surface">
                                        {user?.name}
                                    </div>
                                    <div className="text-[12px] text-on-surface-variant truncate mb-2">
                                        {user?.email}
                                    </div>
                                    <div className="inline-flex items-center px-3 py-0.5 rounded-pill bg-primary-container text-accent text-[11px] font-bold tracking-wide uppercase border border-primary/30">
                                        {getRoleDisplayName(user?.role)}
                                    </div>
                                </div>
                                <Link
                                    to="/dashboard/profile"
                                    onClick={() => setDropdownOpen(false)}
                                    className="w-full text-left px-4 py-2.5 hover:bg-surface-variant transition-colors flex items-center gap-3 text-[14px] font-ui text-on-surface"
                                >
                                    <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    Manage Account
                                </Link>
                                <button
                                    onClick={() => { setDropdownOpen(false); setShowLogoutConfirm(true); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-error-container/30 transition-colors flex items-center gap-3 text-[14px] font-ui text-error"
                                >
                                    <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeUp">
                    <div className="bg-surface border border-outline rounded-2xl w-full max-w-[400px] p-8 shadow-2xl">
                        <h3 className="text-[20px] font-display text-on-surface mb-3">Sign out</h3>
                        <p className="text-[14px] text-on-surface-variant mb-8 leading-relaxed">
                            Are you sure you want to sign out of MaintenOps? You'll need to log in again to manage your requests.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-5 py-2 font-ui text-[14px] font-medium text-on-surface-variant hover:bg-surface-variant rounded-pill transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2 rounded-pill bg-error text-white font-ui text-[14px] font-medium shadow-sm hover:shadow-md transition-all"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Topbar;
