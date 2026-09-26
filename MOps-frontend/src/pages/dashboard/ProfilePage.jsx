import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        name: user?.name || user?.username || '',
        mobileNumber: user?.mobileNumber || '',
        location: user?.location || 'ISKCON NVCC Pune'
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            await updateUser({
                name: formData.name,
                mobileNumber: formData.mobileNumber,
                location: formData.location
            });
            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err) {
            setErrorMessage(err.message || 'Failed to update user profile');
        } finally {
            setSaving(false);
        }
    };

    const profileInfo = {
        name: user?.name || user?.username || 'User',
        email: user?.email || '',
        phone: user?.mobileNumber || '',
        role: user?.role === 'REQUESTER' ? 'Standard User' : (user?.role || 'REQUESTER'),
        joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        location: user?.location || 'ISKCON NVCC Pune'
    };

    return (
        <div className="relative pb-24 px-6 sm:px-8 pt-10 max-w-[1400px] mx-auto animate-fadeUp">
            {/* Page Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[28px] sm:text-[32px] font-display font-bold text-slate-900 tracking-tight mb-1">My Profile</h1>
                    <p className="text-[14px] sm:text-[15px] font-ui text-slate-600">Basic details and account settings for your MaintenOps account.</p>
                </div>
            </div>

            {successMessage && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-ui font-semibold text-[14px] flex items-center justify-between animate-fadeUp shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{successMessage}</span>
                    </div>
                </div>
            )}

            {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-ui font-semibold text-[14px] flex items-center gap-2.5 animate-fadeUp shadow-sm">
                    <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: ID Summary */}
                <div className="lg:col-span-4">
                    <div className="rounded-3xl p-8 sm:p-10 flex flex-col items-center border border-sky-200 bg-white shadow-xl shadow-sky-100/60">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 text-white border-4 border-white shadow-xl flex items-center justify-center text-[48px] font-display font-extrabold">
                                {profileInfo.name.substring(0, 2).toUpperCase()}
                            </div>
                        </div>

                        <h2 className="text-[24px] font-display font-bold text-slate-900 mb-1">{profileInfo.name}</h2>
                        <div className="text-[13px] font-ui text-sky-700 mb-4 uppercase tracking-widest font-bold">{profileInfo.role}</div>

                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[12px] font-bold font-ui border border-emerald-200">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            ACTIVE STATUS
                        </div>

                        <div className="mt-8 w-full pt-6 border-t border-sky-100 space-y-4">
                            <div className="flex items-center gap-3 text-slate-600">
                                <svg className="w-5 h-5 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span className="text-[14px] font-ui">{profileInfo.location}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <svg className="w-5 h-5 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="text-[14px] font-ui">{profileInfo.joinDate !== '—' ? `Member since ${profileInfo.joinDate}` : 'MaintenOps Member'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Detailed Info & Edit Form */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Identity Section */}
                    <div className="rounded-3xl border border-sky-200 bg-white shadow-xl shadow-sky-100/60 overflow-hidden">
                        <div className="flex justify-between items-center px-8 py-6 border-b border-sky-100 bg-sky-50/60">
                            <div>
                                <h3 className="text-[18px] font-display font-bold text-slate-900">Identity Details</h3>
                                <p className="text-[13px] text-slate-600 font-ui">Manage and update your personal user profile information.</p>
                            </div>
                            {!isEditing ? (
                                <button
                                    onClick={() => {
                                        setFormData({
                                            name: user?.name || user?.username || '',
                                            mobileNumber: user?.mobileNumber || '',
                                            location: user?.location || 'ISKCON NVCC Pune'
                                        });
                                        setIsEditing(true);
                                    }}
                                    className="px-5 py-2 rounded-xl bg-sky-600 text-white font-ui font-bold text-[13px] hover:bg-sky-700 transition-all shadow-md shadow-sky-600/30"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-ui font-semibold text-[13px] hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        <div className="p-8">
                            {!isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-10">
                                    <div className="group">
                                        <div className="text-[12px] font-ui font-bold text-sky-700 uppercase tracking-widest mb-1">Display Name</div>
                                        <div className="text-[16px] font-display font-semibold text-slate-900">{profileInfo.name}</div>
                                    </div>
                                    <div className="group">
                                        <div className="text-[12px] font-ui font-bold text-sky-700 uppercase tracking-widest mb-1">Work Email</div>
                                        <div className="text-[16px] font-display font-semibold text-sky-600">{profileInfo.email || 'Not set'}</div>
                                    </div>
                                    <div className="group">
                                        <div className="text-[12px] font-ui font-bold text-sky-700 uppercase tracking-widest mb-1">Contact Number</div>
                                        <div className="text-[16px] font-display font-semibold text-slate-900">{profileInfo.phone || 'Not set'}</div>
                                    </div>
                                    <div className="group">
                                        <div className="text-[12px] font-ui font-bold text-sky-700 uppercase tracking-widest mb-1">Facility Location</div>
                                        <div className="text-[16px] font-display font-semibold text-slate-900">{profileInfo.location}</div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[13px] font-ui font-bold text-slate-700 mb-2">
                                                Full Name / Display Name
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/40 text-[14px] font-ui text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[13px] font-ui font-bold text-slate-700 mb-2">
                                                Contact Mobile Number
                                            </label>
                                            <input
                                                type="text"
                                                name="mobileNumber"
                                                value={formData.mobileNumber}
                                                onChange={handleChange}
                                                placeholder="e.g. 9876543210"
                                                className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/40 text-[14px] font-ui text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-[13px] font-ui font-bold text-slate-700 mb-2">
                                                Facility Location
                                            </label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                placeholder="e.g. ISKCON NVCC Pune"
                                                className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/40 text-[14px] font-ui text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-sky-100">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-ui font-semibold text-[14px] hover:bg-slate-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn-primary !px-7 !py-2.5 font-bold"
                                        >
                                            {saving ? 'Saving...' : 'Save Profile Changes'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
