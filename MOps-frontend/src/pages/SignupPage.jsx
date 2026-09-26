import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        mobileNumber: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!/^\d{10}$/.test(formData.mobileNumber)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        try {
            setLoading(true);
            await signup(formData.name, formData.email, formData.password, formData.mobileNumber);
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4 sm:p-6 font-body text-slate-900 relative overflow-hidden py-10">
            {/* Background Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sky-300/30 rounded-full blur-[140px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-300/30 rounded-full blur-[140px] pointer-events-none"></div>

            {/* Logo */}
            <Link to="/" className="mb-6 flex flex-col items-center gap-3 animate-fadeUp z-10 group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-sky-500/30 group-hover:scale-105 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V7m0 4h4m-4 0H7" />
                    </svg>
                </div>
                <span className="text-[26px] font-extrabold font-display text-slate-900 tracking-tight">
                    Mainten<span className="text-sky-600">Ops</span>
                </span>
            </Link>

            {/* Signup Card */}
            <div className="w-full max-w-[500px] bg-white/95 backdrop-blur-2xl border border-sky-200 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-sky-100 animate-fadeUp relative overflow-hidden z-10">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-600"></div>
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-[24px] font-display font-extrabold text-slate-900 mb-2">Create your account</h1>
                    <p className="text-[14px] text-slate-600 font-ui font-medium">Join MaintenOps to request and monitor facility maintenance</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Full Name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className="font-ui !bg-sky-50/50 !border-sky-200 !text-slate-900 placeholder-slate-400 focus:!border-sky-500"
                        required
                    />

                    <Input
                        label="Email address"
                        type="email"
                        name="email"
                        placeholder="user@maintenops.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="font-ui !bg-sky-50/50 !border-sky-200 !text-slate-900 placeholder-slate-400 focus:!border-sky-500"
                        required
                    />

                    <Input
                        label="Mobile Number (10 digits)"
                        name="mobileNumber"
                        placeholder="9876543210"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        className="font-ui !bg-sky-50/50 !border-sky-200 !text-slate-900 placeholder-slate-400 focus:!border-sky-500"
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="6+ chars"
                            value={formData.password}
                            onChange={handleChange}
                            className="font-ui !bg-sky-50/50 !border-sky-200 !text-slate-900 placeholder-slate-400 focus:!border-sky-500"
                            showPasswordToggle={true}
                            required
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            placeholder="Re-type"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="font-ui !bg-sky-50/50 !border-sky-200 !text-slate-900 placeholder-slate-400 focus:!border-sky-500"
                            showPasswordToggle={true}
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-[13px] text-rose-600 bg-rose-50 px-4 py-3 rounded-xl border border-rose-200 flex items-center gap-3 font-ui animate-fadeUp">
                            <svg className="w-4 h-4 shrink-0 fill-rose-500" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-between !mt-8">
                        <Link to="/login" className="text-sky-600 hover:text-sky-700 font-bold font-ui text-[14px] transition-colors">
                            Sign in instead
                        </Link>
                        <button type="submit" disabled={loading} className="btn-primary !px-8 !py-3 font-bold">
                            {loading ? 'Creating...' : 'Register'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
