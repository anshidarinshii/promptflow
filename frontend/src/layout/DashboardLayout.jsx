import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, History, Settings, LogOut, Search, User as UserIcon, Bell, Languages } from 'lucide-react';

const Sidebar = ({ targetLLM, setTargetLLM, optimizer, setOptimizer, setSelectedHistoryItem, onNewChat }) => {
    const { logout, api, user } = useAuth();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('prompts/history/');
                setHistory(response.data.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch vault history", error);
            }
        };
        fetchHistory();
    }, [api]);

    return (
        <aside className="w-[300px] bg-brand-charcoal h-screen border-r border-white/5 flex flex-col p-6 shadow-2xl shrink-0 overflow-y-auto">
            <div className="flex items-center gap-3 mb-10 pl-2 cursor-pointer group" onClick={onNewChat}>
                <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent/20 transition-transform group-hover:scale-105">
                    <LayoutDashboard className="text-brand-charcoal" size={24} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white italic transition-colors group-hover:text-brand-accent">PromptFlow</h1>
            </div>

            <div className="space-y-8">
                {/* User Session */}
                <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] pl-2 mb-4">Active Session</div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-slate flex items-center justify-center overflow-hidden shrink-0">
                            <UserIcon size={20} className="text-brand-accent" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold truncate">{user?.username || 'User'}</span>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0"></span>
                                Online
                            </span>
                        </div>
                    </div>
                </div>

                {/* Prompt Vault */}
                <div>
                    <div className="flex items-center justify-between mb-4 pl-2 pr-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Prompt Vault</span>
                        <div className="flex items-center gap-3">
                            <span 
                                onClick={onNewChat}
                                className="text-[9px] font-bold text-brand-accent uppercase tracking-widest cursor-pointer hover:bg-brand-accent/10 px-2 py-1 rounded transition-colors"
                            >
                                + New
                            </span>
                            <History size={14} className="text-slate-600" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        {history.length > 0 ? history.map((p) => (
                            <div key={p.id} className="sidebar-item group cursor-pointer" onClick={() => setSelectedHistoryItem(p)}>
                                <span className="text-xs font-semibold truncate group-hover:text-brand-accent transition-colors">
                                    {p.original_text.substring(0, 20)}...
                                </span>
                            </div>
                        )) : (
                            <div className="text-[10px] text-slate-600 italic pl-4">No sessions yet</div>
                        )}
                    </div>
                </div>

                {/* Setup Configuration */}
                <div>
                    <div className="flex items-center justify-between mb-4 pl-2 pr-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Setup Configuration</span>
                        <Settings size={14} className="text-slate-600" />
                    </div>
                    <div className="space-y-4 px-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Target LLM</label>
                            <select
                                value={targetLLM}
                                onChange={(e) => setTargetLLM(e.target.value)}
                                className="bg-brand-slate border border-white/10 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-brand-accent outline-none"
                            >
                                <option>Gemini 1.5 Pro</option>
                                <option>GPT-4o</option>
                                <option>Llama 3 (Meta)</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Optimizer Choice</label>
                            <select
                                value={optimizer}
                                onChange={(e) => setOptimizer(e.target.value)}
                                className="bg-brand-slate border border-white/10 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-brand-accent outline-none"
                            >
                                <option>HyPE (Sequential)</option>
                                <option>KG-Policy (Bayesian)</option>
                                <option>Reflective Agent</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/5">
                <div onClick={logout} className="sidebar-item text-rose-500/80 hover:bg-rose-500/10 hover:text-rose-500">
                    <LogOut size={18} />
                    <span className="font-bold text-sm">Exit Account</span>
                </div>
            </div>
        </aside>
    );
};

const Header = () => {
    return (
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-brand-charcoal/50 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5 w-[400px]">
                <Search size={18} className="text-slate-500" />
                <input
                    type="text"
                    placeholder="Search collections..."
                    className="bg-transparent border-none outline-none text-sm text-slate-100 flex-1 placeholder:text-slate-600"
                />
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-brand-slate/50 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400">
                    <Languages size={14} />
                    <span>EN</span>
                </div>
                <div className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-slate-400 relative">
                    <Bell size={18} />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-brand-accent rounded-full border border-brand-charcoal"></div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-cobalt to-brand-accent flex items-center justify-center shadow-lg shadow-brand-cobalt/20 cursor-pointer border border-white/5">
                    <UserIcon size={20} className="text-white" />
                </div>
            </div>
        </header>
    );
};

const DashboardLayout = ({ children }) => {
    const [targetLLM, setTargetLLM] = useState('Gemini 1.5 Pro');
    const [optimizer, setOptimizer] = useState('HyPE (Sequential)');
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
    const [resetCounter, setResetCounter] = useState(0);

    const handleNewChat = () => {
        setResetCounter(c => c + 1);
        setSelectedHistoryItem(null);
    };

    // Correctly inject props into children (Dashboard)
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { 
                targetLLM, 
                setTargetLLM, 
                optimizer, 
                setOptimizer,
                selectedHistoryItem,
                resetCounter 
            });
        }
        return child;
    });

    return (
        <div className="flex min-h-screen bg-brand-charcoal text-slate-100 overflow-hidden">
            <Sidebar
                targetLLM={targetLLM}
                setTargetLLM={setTargetLLM}
                optimizer={optimizer}
                setOptimizer={setOptimizer}
                setSelectedHistoryItem={setSelectedHistoryItem}
                onNewChat={handleNewChat}
            />
            <div className="flex-1 flex flex-col h-screen overflow-hidden overflow-y-auto">
                <Header />
                <main className="p-10 flex-1 bg-brand-charcoal flex flex-col gap-10">
                    {childrenWithProps}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
