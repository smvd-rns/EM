import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FadeInSection from '../components/FadeInSection';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="font-body text-slate-900 bg-sky-50 min-h-screen text-[16px] selection:bg-sky-500 selection:text-white">
            <Navbar />

            {/* HERO SECTION */}
            <section className="relative pt-[150px] pb-[120px] px-6 overflow-hidden max-w-[1440px] mx-auto min-h-[90vh] flex flex-col justify-center">
                {/* Glowing Background Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[550px] h-[550px] bg-sky-400/20 rounded-full blur-[140px] pointer-events-none animate-pulse-slow"></div>
                <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-cyan-300/25 rounded-full blur-[140px] pointer-events-none"></div>

                <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-[60px] items-center relative z-10">
                    {/* Hero Text */}
                    <div className="lg:col-span-7 flex flex-col gap-6 sm:gap-8 z-10 animate-fadeUp">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-sky-100/90 border border-sky-300 text-sky-800 text-[12px] font-bold tracking-[0.15em] uppercase w-fit backdrop-blur-md shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping"></span>
                            Smart Facility Management Platform
                        </div>

                        <h1 className="text-[40px] sm:text-[56px] lg:text-[68px] leading-[1.08] font-display font-extrabold tracking-tight text-slate-900">
                            Intelligent facility <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-600 relative inline-block">
                                operations & upkeep.
                            </span>
                        </h1>

                        <p className="text-[17px] sm:text-[20px] leading-[1.6] text-slate-600 max-w-[580px]">
                            Streamline maintenance requests, track real-time quotations, manage stock inventory, and optimize resolution speeds with next-gen clarity.
                        </p>

                        <form onSubmit={handleSearch} className="relative max-w-[520px] w-full group mt-2">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400 group-focus-within:text-sky-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="w-full h-[58px] sm:h-[64px] pl-12 pr-24 rounded-2xl border border-sky-200 bg-white/90 text-slate-900 placeholder-slate-400 backdrop-blur-xl focus:outline-none focus:ring-4 focus:ring-sky-500/25 focus:border-sky-500 shadow-lg shadow-sky-100/80 transition-all font-ui text-[15px]"
                                placeholder="Search 'HVAC repair', 'Electrical'..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="btn-primary absolute right-2 top-2 bottom-2 px-7 !rounded-xl !text-[15px] font-bold"
                            >
                                Search
                            </button>
                        </form>

                        <div className="flex flex-wrap items-center gap-6 pt-2 text-slate-600 text-[14px] font-medium">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                <span>Real-time tracking</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                <span>Multi-role admin portal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                <span>Inventory sync</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual Showcase */}
                    <div className="lg:col-span-5 relative z-10 animate-fadeUp">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-90 transition duration-700 animate-pulse-slow"></div>
                            
                            <div className="relative rounded-3xl overflow-hidden border border-sky-200/80 bg-white shadow-2xl">
                                <img
                                    src="/assets/hero_facility.jpg"
                                    alt="Facility Management Dashboard"
                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />

                                {/* Glass Overlay Floating Metric Pill */}
                                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/20 flex items-center justify-between text-white shadow-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-sky-600/40 border border-sky-400/40 flex items-center justify-center text-sky-300">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <div>
                                            <div className="text-[13px] text-slate-300 font-medium">Resolution Efficiency</div>
                                            <div className="text-[18px] font-bold text-white">99.4% Uptime</div>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[12px] font-bold">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST BAR */}
            <section className="bg-white/80 border-y border-sky-200/70 py-8 px-6 backdrop-blur-md shadow-xs">
                <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <span className="text-[13px] font-bold text-sky-800 uppercase tracking-widest whitespace-nowrap flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                        Powering Enterprise Operations Across
                    </span>
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-10 gap-y-4 text-slate-700 font-semibold text-[15px]">
                        {['Facilities & Estate', 'Electrical & Utilities', 'HVAC & Plumbing', 'Safety & Compliance', 'Inventory & Stores'].map((dept, i) => (
                            <span key={i} className="hover:text-sky-600 transition-colors cursor-default whitespace-nowrap">
                                {dept}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION: HOW IT WORKS */}
            <section className="py-[120px] px-6 bg-sky-100/50 relative overflow-hidden">
                <div className="max-w-[1240px] mx-auto">
                    <FadeInSection>
                        <div className="text-center max-w-[700px] mx-auto mb-20">
                            <span className="px-4 py-1.5 rounded-full bg-sky-200/80 border border-sky-300 text-sky-800 text-[12px] font-bold tracking-[0.2em] uppercase">
                                STREAMLINED WORKFLOW
                            </span>
                            <h2 className="text-[36px] sm:text-[48px] font-display font-extrabold text-slate-900 mt-4 tracking-tight">
                                From issue log to instant resolution
                            </h2>
                            <p className="text-slate-600 text-[18px] mt-3">
                                End-to-end transparency designed for operational speed and zero downtime.
                            </p>
                        </div>
                    </FadeInSection>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: '1. Report & Categorize', desc: 'Requesters create priority work-orders with clear task details and images.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                            { step: '02', title: '2. Quotation & Approval', desc: 'Admins prepare itemized quotations, verify materials, and send for review.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
                            { step: '03', title: '3. Execute & Resolve', desc: 'Technicians fulfill orders with complete stock audits and live status sync.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
                        ].map((item, index) => (
                            <FadeInSection key={index} delay={`${index * 0.15}s`}>
                                <div className="p-8 rounded-3xl bg-white border border-sky-200/80 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-100 transition-all duration-300 group h-full flex flex-col justify-between shadow-sm">
                                    <div>
                                        <div className="text-[13px] font-bold text-sky-700 tracking-[0.15em] mb-4">PHASE {item.step}</div>
                                        <div className="w-14 h-14 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 mb-6 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all">
                                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                            </svg>
                                        </div>
                                        <h3 className="text-[22px] font-display font-bold text-slate-900 mb-3">{item.title}</h3>
                                        <p className="text-[15px] leading-[1.6] text-slate-600">{item.desc}</p>
                                    </div>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURE VISUAL SHOWCASE */}
            <section className="py-[100px] px-6 bg-white/70 border-y border-sky-200/70">
                <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <FadeInSection>
                        <div className="relative rounded-3xl overflow-hidden border border-sky-200 shadow-xl group">
                            <img
                                src="/assets/smart_building.jpg"
                                alt="Smart Building Operations"
                                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                <div className="text-[13px] font-bold text-sky-300 uppercase tracking-widest">Enterprise Architecture</div>
                                <div className="text-[22px] font-bold text-white mt-1">Integrated Facility Control</div>
                            </div>
                        </div>
                    </FadeInSection>

                    <FadeInSection delay="0.2s">
                        <div className="flex flex-col gap-8">
                            <div>
                                <span className="text-sky-700 font-bold text-[13px] tracking-widest uppercase">BUILT FOR SCALE</span>
                                <h2 className="text-[36px] font-display font-bold text-slate-900 mt-2">Engineered for facility managers & teams</h2>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { title: 'Automated Stock Inventory', desc: 'Real-time sync between materials requested, approved quotes, and available warehouse stock.', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
                                    { title: 'Quotation Workflow', desc: 'Multi-vendor pricing entries, auto-calculated total costs, and instant approvals.', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
                                    { title: 'Role-Based Dashboards', desc: 'Custom tailored views for Requesters, Admins, and Super Admins for maximum productivity.', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white border border-sky-200/80 shadow-sm hover:border-sky-300 transition-all">
                                        <div className="w-12 h-12 rounded-xl bg-sky-100 shrink-0 flex items-center justify-center text-sky-700 border border-sky-200">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-[18px] font-bold text-slate-900">{item.title}</h3>
                                            <p className="text-slate-600 text-[14px] leading-relaxed mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* LIVE SERVICE TRACEABILITY STAGES */}
            <section className="py-[120px] px-6 bg-sky-50 relative">
                <div className="max-w-[1240px] mx-auto text-center">
                    <FadeInSection>
                        <span className="px-4 py-1.5 rounded-full bg-sky-200/80 border border-sky-300 text-sky-800 text-[12px] font-bold tracking-[0.2em] uppercase">
                            LIVE STATUS PIPELINE
                        </span>
                        <h2 className="text-[36px] sm:text-[44px] font-display font-extrabold text-slate-900 mt-4">8-Step Traceability Engine</h2>
                        <p className="text-slate-600 text-[17px] max-w-[650px] mx-auto mt-3 mb-16">
                            Every maintenance request moves cleanly across verified operational milestones.
                        </p>

                        <div className="max-w-[950px] mx-auto p-8 rounded-3xl bg-white border border-sky-200 shadow-xl">
                            <div className="overflow-x-auto pb-4 custom-scrollbar">
                                <div className="flex items-center justify-between relative min-w-[780px] px-6 py-4">
                                    {/* Line background */}
                                    <div className="absolute top-[32px] left-8 right-8 h-[4px] bg-sky-100 -z-0 rounded-full"></div>
                                    {/* Active Glow Progress Line */}
                                    <div className="absolute top-[32px] left-8 w-[62%] h-[4px] bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-500 -z-0 rounded-full shadow-[0_0_12px_rgba(2,132,199,0.5)]"></div>

                                    {[
                                        { label: 'Submitted', done: true },
                                        { label: 'Quotation', done: true },
                                        { label: 'Approved', done: true },
                                        { label: 'Sourced', done: true },
                                        { label: 'In Progress', active: true },
                                        { label: 'Ready', done: false },
                                        { label: 'Delivery', done: false },
                                        { label: 'Completed', done: false }
                                    ].map((step, i) => (
                                        <div key={i} className="flex flex-col items-center gap-3 shrink-0 z-10">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                                ${step.done ? 'border-sky-600 bg-sky-600 text-white shadow-md shadow-sky-600/30' :
                                                    step.active ? 'border-sky-500 bg-sky-500 text-white shadow-lg shadow-sky-500/40 ring-4 ring-sky-300/40' :
                                                    'border-sky-200 bg-sky-50 text-sky-400'}`}>
                                                {step.done && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                {step.active && <div className="w-3.5 h-3.5 bg-white rounded-full animate-ping"></div>}
                                                {!step.done && !step.active && <span className="text-[12px] font-bold">{i + 1}</span>}
                                            </div>
                                            <span className={`text-[12px] font-ui font-bold tracking-wider uppercase ${step.done || step.active ? 'text-slate-900' : 'text-slate-400'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section className="py-[100px] px-6 bg-gradient-to-b from-sky-50 to-sky-100 relative">
                <div className="max-w-[1000px] mx-auto rounded-3xl p-12 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-600 text-white shadow-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                    <h2 className="text-[36px] sm:text-[44px] font-display font-extrabold text-white">Ready to elevate your facility management?</h2>
                    <p className="text-sky-100 text-[18px] max-w-[600px] mx-auto mt-4 mb-8">
                        Experience seamless request logging, instant quotation workflow, and full operational transparency today.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/login">
                            <button className="px-8 py-3.5 text-[16px] font-bold bg-white text-sky-800 rounded-xl hover:bg-sky-50 transition-all shadow-md">
                                Sign In to Portal
                            </button>
                        </Link>
                        <Link to="/signup">
                            <button className="px-8 py-3.5 rounded-xl border-2 border-white/60 text-white font-bold text-[16px] hover:bg-white/10 transition-colors">
                                Register Account
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-white text-slate-900 py-14 px-6 border-t border-sky-200">
                <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center font-bold text-white text-lg">
                            M
                        </div>
                        <span className="text-[22px] font-extrabold font-display tracking-tight text-slate-900">
                            Mainten<span className="text-sky-600">Ops</span>
                        </span>
                    </div>

                    <div className="text-[14px] text-slate-500 font-ui">
                        © 2026 MaintenOps Facility Platform. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;