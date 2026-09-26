import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getDashboardRoute } from '../utils/roleUtils';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const userData = await login(email, password);
            const route = getDashboardRoute(userData.role);
            navigate(route);
        } catch (err) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4 sm:p-6 font-body text-slate-900 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-sky-300/30 rounded-full blur-[140px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-cyan-300/30 rounded-full blur-[140px] pointer-events-none"></div>

            {/* Logo */}
            <Link to="/" className="mb-8 flex flex-col items-center gap-3 animate-fadeUp z-10 group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-sky-500/30 group-hover:scale-105 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V7m0 4h4m-4 0H7" />
                    </svg>
                </div>
                <span className="text-[26px] font-extrabold font-display text-slate-900 tracking-tight">
                    Mainten<span className="text-sky-600">Ops</span>
                </span>
            </Link>

            {/* Login Card */}
            <div className="w-full max-w-[448px] bg-white/95 backdrop-blur-2xl border border-sky-200 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-sky-100 animate-fadeUp relative overflow-hidden z-10">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-600"></div>
                <div className="text-center mb-8">
                    <h1 className="text-[26px] font-display font-extrabold text-slate-900 mb-2">Welcome Back</h1>
                    <p className="text-[14px] text-slate-600 font-ui font-medium">Sign in to manage facility requests & upkeep</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="admin@maintenops.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="font-ui !bg-sky-50/50 !border-sky-200 !text-slate-900 placeholder-slate-400 focus:!border-sky-500"
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="font-ui !bg-sky-50/50 !border-sky-200 !text-slate-900 placeholder-slate-400 focus:!border-sky-500"
                        showPasswordToggle={true}
                    />

                    {error && (
                        <div className="text-[13px] text-rose-600 bg-rose-50 px-4 py-3 rounded-xl border border-rose-200 flex items-center gap-3 font-ui animate-fadeUp">
                            <svg className="w-4 h-4 shrink-0 fill-rose-500" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-between !mt-8">
                        <Link to="/signup" className="text-sky-600 hover:text-sky-700 font-bold font-ui text-[14px] transition-colors">
                            Create account
                        </Link>
                        <button type="submit" disabled={loading} className="btn-primary !px-8 !py-3 font-bold">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Footer */}
            <div className="mt-10 flex gap-8 text-[12px] text-slate-500 font-ui font-bold uppercase tracking-widest z-10">
                <a href="#" className="hover:text-sky-600 transition-colors">Privacy</a>
                <a href="#" className="hover:text-sky-600 transition-colors">Terms</a>
                <a href="#" className="hover:text-sky-600 transition-colors">Support</a>
            </div>
        </div>
    );
};

export default LoginPage;

