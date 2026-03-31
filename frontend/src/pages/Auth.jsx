import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        let result;
        if (isLogin) {
            result = await login(username, password);
        } else {
            result = await signup(username, email, password);
        }

        if (!result.success) {
            setError(typeof result.message === 'object' ? JSON.stringify(result.message) : result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-brand-charcoal flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-cobalt/10 rounded-full blur-[120px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="w-12 h-12 bg-brand-accent rounded-2xl flex items-center justify-center shadow-lg shadow-brand-accent/20">
                        <LayoutDashboard className="text-brand-charcoal" size={28} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white italic">PromptFlow</h1>
                </div>

                <div className="glass-card p-8 border-white/10 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-2">{isLogin ? 'Welcome Back' : 'Join the Future'}</h2>
                    <p className="text-slate-400 text-sm mb-8">
                        {isLogin ? 'Enter your credentials to access your Vault.' : 'Start automating your prompt engineering today.'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-sm">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-brand-slate/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:ring-2 focus:ring-brand-accent/50 outline-none transition-all"
                                    placeholder="johndoe"
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-brand-slate/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:ring-2 focus:ring-brand-accent/50 outline-none transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-brand-slate/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:ring-2 focus:ring-brand-accent/50 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-cobalt hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-cobalt/20 disabled:opacity-50 mt-4 group"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Create Account')}
                            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-slate-400 hover:text-brand-accent transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Footer from research papers goals */}
            <footer className="mt-12 text-center z-10">
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Research & Implementation</p>
                <div className="flex gap-8 text-[9px] text-slate-500 font-bold uppercase">
                    <span>Automated Prompt Optimization</span>
                    <span>SOPL Framework</span>
                    <span>Reducing Manual Effort</span>
                </div>
            </footer>
        </div>
    );
};

export default Auth;
