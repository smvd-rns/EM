import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ role, isOpen, onClose }) => {
    const location = useLocation();
    const { user } = useAuth();

    const isActive = (path) => {
        if (['/dashboard', '/admin', '/store-manager', '/vendor', '/super-admin'].includes(path)) {
            return location.pathname === path;
        }
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const navItems = {
        'REQUESTER': [
            { label: 'Dashboard', path: '/dashboard', icon: <path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 00.707-1.707l-9-9a.999.999 0 00-1.414 0l-9 9A1 1 0 003 13zm7 7v-5h4v5h-4zm2-15.586l7 7V20h-1v-7a1 1 0 00-1-1H7a1 1 0 00-1 1v7H5v-7.586l7-7.414z" /> },
            { label: 'My Requests', path: '/dashboard/requests', icon: <><path d="M19 4H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V6h14l.002 14H5z" /><path d="M7 9h10v2H7zm0 4h10v2H7z" /></> },
            { label: 'Profile', path: '/dashboard/profile', icon: <><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" /><path d="M12 6c-1.93 0-3.5 1.57-3.5 3.5S10.07 13 12 13s3.5-1.57 3.5-3.5S13.93 6 12 6zm0 12c-2.384 0-4.469-1.258-5.636-3.144a.994.994 0 01.127-1.251c1.189-1.127 2.924-1.605 5.509-1.605s4.32.478 5.509 1.605a.994.994 0 01.127 1.251C16.469 16.742 14.384 18 12 18z" /></> },
        ],
        'ADMIN': [
            { label: 'Admin Dashboard', path: '/admin', icon: <path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 00.707-1.707l-9-9a.999.999 0 00-1.414 0l-9 9A1 1 0 003 13zm7 7v-5h4v5h-4z" /> },
            { label: 'Action Queue', path: '/admin/queue', icon: <path d="M20 6h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zM9 4h6v2H9V4zm11 15H4V8h3v2h2V8h6v2h2V8h3v11z" /> },
            { label: 'Materials', path: '/admin/materials', icon: <><path d="M19 4H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V6h14l.002 14H5z" /><path d="M7 9h10v2H7zm0 4h10v2H7z" /></> },
            { label: 'Vendor Lists', path: '/admin/vendor-lists', icon: <><path d="M19 4H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V6h14l.002 14H5z" /><path d="M7 9h10v2H7zm0 4h7v2H7z" /></> },
        ],
        'STORE_MANAGER': [
            { label: 'Store Overview', path: '/store-manager', icon: <path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 00.707-1.707l-9-9a.999.999 0 00-1.414 0l-9 9A1 1 0 003 13zm7 7v-5h4v5h-4z" /> },
            { label: 'Store Inventory', path: '/store-manager/inventory', icon: <path d="M20 6h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zM9 4h6v2H9V4zm11 15H4V8h3v2h2V8h6v2h2V8h3v11z" /> },
            { label: 'Material Issuance', path: '/store-manager/issuance', icon: <><path d="M19 4H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V6h14l.002 14H5z" /><path d="M7 9h10v2H7zm0 4h10v2H7z" /></> },
        ],
        'VENDOR': [
            { label: 'Vendor Portal', path: '/vendor', icon: <path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 00.707-1.707l-9-9a.999.999 0 00-1.414 0l-9 9A1 1 0 003 13zm7 7v-5h4v5h-4zm2-15.586l7 7V20h-1v-7a1 1 0 00-1-1H7a1 1 0 00-1 1v7H5v-7.586l7-7.414z" /> },
            { label: 'Purchase Orders', path: '/vendor/orders', icon: <><path d="M19 4H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V6h14l.002 14H5z" /><path d="M7 9h10v2H7zm0 4h10v2H7z" /></> },
            { label: 'Material Bids', path: '/vendor/quotations', icon: <><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" /><path d="M12 6c-1.93 0-3.5 1.57-3.5 3.5S10.07 13 12 13s3.5-1.57 3.5-3.5S13.93 6 12 6zm0 12c-2.384 0-4.469-1.258-5.636-3.144a.994.994 0 01.127-1.251c1.189-1.127 2.924-1.605 5.509-1.605s4.32.478 5.509 1.605a.994.994 0 01.127 1.251C16.469 16.742 14.384 18 12 18z" /></> },
        ],
        'SUPER_ADMIN': [
            { label: 'System Overview', path: '/super-admin', icon: <path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 00.707-1.707l-9-9a.999.999 0 00-1.414 0l-9 9A1 1 0 003 13zm7 7v-5h4v5h-4z" /> },
            { label: 'User Roles', path: '/super-admin/users', icon: <><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" /><path d="M12 6c-1.93 0-3.5 1.57-3.5 3.5S10.07 13 12 13s3.5-1.57 3.5-3.5S13.93 6 12 6zm0 12c-2.384 0-4.469-1.258-5.636-3.144a.994.994 0 01.127-1.251c1.189-1.127 2.924-1.605 5.509-1.605s4.32.478 5.509 1.605a.994.994 0 01.127 1.251C16.469 16.742 14.384 18 12 18z" /></> },
            { label: 'Materials', path: '/super-admin/materials', icon: <><path d="M19 4H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V6h14l.002 14H5z" /><path d="M7 9h10v2H7zm0 4h10v2H7z" /></> },
            { label: 'Store Inventory', path: '/super-admin/inventory', icon: <path d="M20 6h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zM9 4h6v2H9V4zm11 15H4V8h3v2h2V8h6v2h2V8h3v11z" /> },
            { label: 'Approval Queue', path: '/super-admin/approvals', icon: <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm-1.903 15.607l-4.524-4.524L7.003 11.66l3.148 3.148 6.845-6.845 1.414 1.414-8.259 8.259-.051-.029z" /> },
            { label: 'Vendor Lists', path: '/super-admin/vendor-lists', icon: <><path d="M19 4H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM5 20V6h14l.002 14H5z" /><path d="M7 9h10v2H7zm0 4h7v2H7z" /></> },
            { label: 'Items Ready', path: '/super-admin/items-ready', icon: <><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" /><path d="M9.999 13.587L7.7 11.292l-1.412 1.416 3.713 3.705 6.706-6.706-1.414-1.414z" /></> },
        ]
    };

    const links = navItems[role] && navItems[role].length > 0 ? navItems[role] : navItems['REQUESTER'];

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[45] md:hidden transition-opacity duration-300"
                    onClick={onClose}
                ></div>
            )}

            <aside
                className={`fixed left-0 top-0 bottom-0 w-[280px] md:w-[240px] bg-white border-r border-sky-200 flex flex-col z-50 transition-transform duration-300 md:translate-x-0 
                ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}`}
            >
                {/* Logo Section */}
                <div className="h-[64px] flex items-center justify-between px-6 border-b border-sky-200/60 bg-sky-50/60">
                    <Link to="/" onClick={onClose} className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-sky-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-sky-500/30">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                            </svg>
                        </div>
                        <span className="text-[18px] font-display font-bold tracking-tight text-slate-900">
                            Mainten<span className="text-sky-600">Ops</span>
                        </span>
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="md:hidden w-8 h-8 rounded-lg hover:bg-sky-100 flex items-center justify-center text-sky-700"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Rail */}
                <div className="py-6 flex-grow flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="px-3 space-y-1.5">
                        {links.map((link, index) => {
                            const active = isActive(link.path);
                            return (
                                <Link
                                    key={index}
                                    to={link.path}
                                    onClick={onClose}
                                    className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 group
                                        ${active
                                            ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-semibold'
                                            : 'text-slate-600 hover:bg-sky-100/80 hover:text-sky-900'
                                        }`}
                                >
                                    <svg
                                        className={`w-5 h-5 transition-colors duration-200 ${active ? 'fill-white' : 'fill-slate-500 group-hover:fill-sky-700'}`}
                                        viewBox="0 0 24 24"
                                    >
                                        {link.icon}
                                    </svg>
                                    <span className={`text-[14px] font-ui transition-colors duration-200 ${active ? 'font-semibold' : 'font-medium'}`}>
                                        {link.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="p-4 border-t border-sky-200/60">
                    <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200/80">
                        <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-1">Signed in as</div>
                        <div className="text-[14px] font-bold text-slate-900 truncate mb-1.5">{user?.name}</div>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-white border border-sky-200 text-sky-700 text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                            {role?.replace('_', ' ')}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
