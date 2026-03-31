import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Send, CheckCircle2, Loader2, ArrowRight, Activity, Terminal, Shield, Target, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const PipelineStep = ({ icon: Icon, title, status, message, active }) => {
    return (
        <div className={`relative flex flex-col items-center gap-4 transition-all duration-300 w-full group ${active ? 'z-10' : 'opacity-40'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-xl shrink-0 transition-transform ${active
                ? 'bg-brand-cobalt border-brand-accent scale-110 shadow-brand-accent/30 translate-y-[-4px]'
                : 'bg-white/5 border-white/10 group-hover:border-white/20'
                }`}>
                {status === 'loading' ? <Loader2 size={24} className="animate-spin text-brand-accent" /> : <Icon size={24} className={active ? "text-white" : "text-slate-400"} />}
            </div>

            <div className="text-center w-full">
                <h3 className={`text-xs font-bold uppercase tracking-widest leading-tight ${active ? 'text-brand-accent' : 'text-slate-500'}`}>{title}</h3>
                <AnimatePresence>
                    {active && message && (
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[11px] text-slate-400 mt-2 line-clamp-2 max-w-[120px] mx-auto italic"
                        >
                            "{message}"
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const Dashboard = ({ targetLLM, optimizer, selectedHistoryItem, resetCounter }) => {
    const { api } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeStep, setActiveStep] = useState(-1);
    const [taskType, setTaskType] = useState('Classification');
    const [copied, setCopied] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (resetCounter > 0) {
            setPrompt('');
            setResult(null);
            setActiveStep(-1);
            setTaskType('Classification');
            setCopied(false);
            setSelectedImage(null);
        }
    }, [resetCounter]);

    useEffect(() => {
        if (selectedHistoryItem) {
            setPrompt(selectedHistoryItem.original_text);
            setResult({
                optimized: selectedHistoryItem.optimized_text,
                metrics: {
                    bert_score: 0.95, 
                    f1_score: 0.88,
                    token_reduction: '15%',
                    efficiency_gain: '+25%'
                }
            });
            setActiveStep(3);
        }
    }, [selectedHistoryItem]);

    const handleCopy = () => {
        if (!result?.optimized) return;
        navigator.clipboard.writeText(result.optimized);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const steps = [
        { id: 0, title: 'Input & Task', icon: Terminal, name: 'Input' },
        { id: 1, title: 'Augmentation', icon: Shield, name: 'Augmentation' },
        { id: 2, title: 'Refinement', icon: Target, name: 'Selection' },
        { id: 3, title: 'Optimized', icon: Sparkles, name: 'Optimized Output' }
    ];

    const handleOptimize = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setResult(null);

        for (let i = 0; i < steps.length; i++) {
            setActiveStep(i);
            await new Promise(r => setTimeout(r, 600));
        }

        try {
            const response = await api.post('prompts/optimize/', {
                prompt,
                target_llm: targetLLM,
                optimizer: optimizer,
                image: selectedImage
            });
            setResult(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setActiveStep(3);
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-20">
            <div className="glass-card flex justify-between px-16 py-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent"></div>
                {steps.map((step, idx) => (
                    <PipelineStep
                        key={step.id}
                        icon={step.icon}
                        title={step.title}
                        active={activeStep === idx}
                        status={loading && activeStep === idx ? 'loading' : (activeStep > idx ? 'complete' : 'idle')}
                        message={loading && activeStep === idx ? "Processing algorithms..." : (activeStep === idx ? "Step detailed" : "Ready")}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch min-h-[600px]">
                <div className="flex flex-col gap-6">
                    <div className="glass-card flex flex-col p-8 flex-1 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-brand-accent">
                                <Terminal size={18} />
                                <span className="text-xs font-bold uppercase tracking-widest">Seed Prompt Input</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-[9px] font-bold px-2 py-1 rounded-full uppercase flex items-center gap-1">
                                    <Activity size={10} />
                                    Task: {taskType}
                                </span>
                            </div>
                        </div>

                        <textarea
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value);
                                if (e.target.value.length > 20) setTaskType('Generation');
                                else setTaskType('Classification');
                            }}
                            placeholder="Enter your seed prompt instruction here..."
                            className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-600 resize-none text-base leading-relaxed"
                        />

                        <div className="mt-6 p-6 border-2 border-dashed border-white/5 bg-white/2 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:bg-white/5 transition-all cursor-pointer relative overflow-hidden min-h-[120px]">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            {selectedImage ? (
                                <>
                                    <div 
                                        className="absolute inset-2 z-0 rounded-xl bg-center bg-cover bg-no-repeat opacity-30 mix-blend-luminosity" 
                                        style={{ backgroundImage: `url(${selectedImage})` }} 
                                    />
                                    <button 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedImage(null); }}
                                        className="absolute top-4 right-4 z-30 bg-rose-500/80 hover:bg-rose-500 text-white text-[9px] font-bold px-2 py-1 rounded uppercase shadow-lg backdrop-blur"
                                    >
                                        Remove
                                    </button>
                                </>
                            ) : null}
                            <div className="z-10 flex flex-col items-center select-none pointer-events-none">
                                <Shield className={`transition-colors ${selectedImage ? 'text-brand-accent' : 'text-slate-500 group-hover:text-brand-accent'}`} size={20} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest text-center mt-2 ${selectedImage ? 'text-brand-accent' : 'text-slate-500'}`}>
                                    Interleaved Text-Image Zone (CoT)
                                </span>
                                <span className="text-[9px] text-slate-600 mt-1">
                                    {selectedImage ? 'Image Loaded for Context' : 'Click/Drag image for multi-modal augmentation'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex gap-2 text-[10px] text-slate-500 font-bold uppercase items-center">
                                <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-ping"></span>
                                Detector Core Active
                            </div>
                            <button
                                disabled={loading || !prompt.trim()}
                                onClick={handleOptimize}
                                className="bg-brand-accent hover:bg-cyan-400 text-brand-charcoal px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-accent/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-widest"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                {loading ? 'Processing Flow' : 'Trigger Optimizer'}
                            </button>
                        </div>
                    </div>

                    <div className={`glass-card p-6 h-32 flex flex-col justify-center transition-all ${activeStep === 1 ? 'border-brand-accent/40 shadow-brand-accent/10' : 'opacity-40'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Activity size={16} className="text-brand-accent" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">HyPE Augmentation Engine</span>
                            </div>
                            {activeStep === 1 && <span className="text-[9px] font-bold text-brand-accent animate-pulse">GENERATING CANDIDATES</span>}
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: activeStep >= 1 ? '100%' : '0%' }}
                                transition={{ duration: 1.5 }}
                                className="h-full bg-brand-accent"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="glass-card flex-1 overflow-hidden flex flex-col bg-brand-charcoal/40">
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <CheckCircle2 size={18} />
                                <span className="text-xs font-bold uppercase tracking-widest">Optimized Intelligence</span>
                            </div>
                            <button
                                onClick={handleCopy}
                                disabled={!result}
                                className="text-[10px] font-bold bg-white/5 hover:bg-white/10 text-slate-400 px-3 py-1.5 border border-white/5 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {copied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>

                        <div className="flex-1 p-8 overflow-y-auto">
                            {result ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <pre className="whitespace-pre-wrap font-sans text-slate-200 text-sm leading-relaxed">
                                        {result.optimized}
                                    </pre>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-20 text-center">
                                    <Sparkles size={48} />
                                    <p className="text-sm font-bold uppercase tracking-widest italic">Waiting for Pipeline Feed...</p>
                                </div>
                            )}
                        </div>

                        <div className={`p-6 bg-white/2 border-t border-white/5 transition-all ${activeStep === 2 ? 'opacity-100' : 'opacity-40'}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <Target size={14} className="text-emerald-400" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">KG-Policy Mapping</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {['Tone', 'Perspective', 'Roles', 'Precision'].map((feature, i) => (
                                    <div key={i} className="flex flex-col gap-1">
                                        <div className="flex justify-between text-[8px] text-slate-600 font-bold uppercase">
                                            <span>{feature}</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 transition-all duration-1000"
                                                style={{ width: activeStep >= 2 ? '100%' : '0%' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 border-t border-white/5 flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                                    <span>Semantic Alignment</span>
                                    <span className="text-brand-accent">
                                        {result?.metrics?.bert_score ? (result.metrics.bert_score * 10).toFixed(1) : '0.0'}/10
                                    </span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-accent transition-all duration-1000"
                                        style={{ width: `${result?.metrics?.bert_score ? (result.metrics.bert_score * 100) : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
