import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import { getRoleDisplayName, getDashboardRoute } from '../utils/roleUtils';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Close dropdown on outside click
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
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 z-50 h-[70px] transition-all">
                <div className="max-w-[1440px] mx-auto h-full px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V7m0 4h4m-4 0H7" />
                            </svg>
                        </div>
                        <span className="text-[22px] font-extrabold font-display tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
                            Mainten<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500">Ops</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-5">
                        {user ? (
                            <>
                                <Link
                                    to={getDashboardRoute(user.role)}
                                    className="text-[14px] font-semibold text-slate-700 font-ui hover:text-sky-600 transition-colors px-3.5 py-1.5 rounded-xl hover:bg-sky-50"
                                >
                                    Dashboard
                                </Link>

                                {/* User Profile Dropdown */}
                                <div className="relative flex items-center pl-4 border-l border-slate-200" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center font-bold text-[14px] shadow-md shadow-sky-500/25 hover:ring-4 hover:ring-sky-100 transition-all"
                                        title="Profile"
                                    >
                                        {user?.name?.substring(0, 2)?.toUpperCase() || 'MK'}
                                    </button>

                                    {/* Dropdown Menu */}
                                    {dropdownOpen && (
                                        <div className="absolute top-[54px] right-0 w-[250px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-sky-100 py-2 animate-fadeUp origin-top-right z-50">
                                            <div className="px-4 py-3 border-b border-sky-100/60 mb-2">
                                                <div className="text-[15px] font-ui font-bold text-slate-900">
                                                    {user?.name || 'MaintenOps User'}
                                                </div>
                                                <div className="text-[13px] font-body text-slate-500 truncate">
                                                    {user?.email || 'user@maintenops.com'}
                                                </div>
                                                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold tracking-wide border border-sky-200/80 uppercase">
                                                    {getRoleDisplayName(user?.role) || 'REQUESTER'}
                                                </div>
                                            </div>
                                            <Link
                                                to="/dashboard/profile"
                                                onClick={() => setDropdownOpen(false)}
                                                className="w-full text-left px-4 py-2.5 hover:bg-sky-50/80 transition-colors flex items-center gap-3 text-[14px] font-ui text-slate-700 font-medium"
                                            >
                                                <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                My Profile
                                            </Link>
                                            <button
                                                onClick={() => { setDropdownOpen(false); setShowLogoutConfirm(true); }}
                                                className="w-full text-left px-4 py-2.5 hover:bg-rose-50 transition-colors flex items-center gap-3 text-[14px] font-ui text-rose-600 font-medium"
                                            >
                                                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <button className="h-10 px-5 rounded-xl border border-slate-200 text-slate-700 font-ui text-[14px] font-semibold hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50 transition-all duration-200">
                                        Log in
                                    </button>
                                </Link>
                                <Link to="/signup">
                                    <button className="btn-primary h-10 !px-6 !text-[14px]">
                                        Get Started
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-slate-700 p-2 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => setIsOpen(!isOpen)}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="absolute top-[70px] left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 p-4 md:hidden flex flex-col gap-3 shadow-xl animate-fadeUp">
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 px-4 py-2">
                                    <div className="text-right flex-1">
                                        <div className="text-[14px] font-bold text-slate-900">{user.name || user.username || 'User'}</div>
                                        <div className="text-[12px] text-indigo-600 font-medium">{getRoleDisplayName(user.role)}</div>
                                    </div>
                                    <button onClick={handleLogout} className="h-9 w-9 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[14px] shadow-sm">
                                        {(user.name || user.username || 'U')?.charAt(0).toUpperCase()}
                                    </button>
                                </div>
                                <Link to={getDashboardRoute(user.role)} onClick={() => setIsOpen(false)}>
                                    <button className="w-full h-10 rounded-xl bg-indigo-50 text-indigo-600 font-semibold text-[14px]">Dashboard</button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsOpen(false)}>
                                    <button className="w-full h-10 rounded-xl border border-slate-200 text-slate-700 font-semibold text-[14px] hover:bg-slate-50">Log in</button>
                                </Link>
                                <Link to="/signup" onClick={() => setIsOpen(false)}>
                                    <button className="w-full h-10 rounded-xl btn-primary text-white font-semibold text-[14px]">Get Started</button>
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </nav>

            {/* Logout Confirmation Modal */}
            {
                showLogoutConfirm && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeUp">
                        <div className="bg-white rounded-2xl w-full max-w-[400px] p-6 shadow-2xl border border-slate-200">
                            <h3 className="text-[22px] font-display font-bold text-slate-900 mb-2">Sign out</h3>
                            <p className="text-[14px] font-body text-slate-600 mb-6">
                                Are you sure you want to sign out of MaintenOps?
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="px-5 py-2 font-ui text-[14px] font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-6 py-2 rounded-xl bg-rose-600 text-white font-ui text-[14px] font-semibold shadow-md hover:bg-rose-700 transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default Navbar;
