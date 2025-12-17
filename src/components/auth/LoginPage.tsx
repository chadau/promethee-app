
import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalLoader } from './TerminalLoader';
import { Lock, User as UserIcon } from 'lucide-react';
import logo from '../../assets/logo.png';

export const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();
    const [showTerminal, setShowTerminal] = useState(false);

    // We want to differentiate between "authenticating" and "animating success"
    // isLoading covers the API call. After API success, we show terminal.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        try {
            await login(username, password);
            // Login successful, show terminal animation
            setShowTerminal(true);
        } catch (err) {
            // Error is handled by store
        }
    };

    const handleTerminalComplete = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#0B0F12] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-[#00BFFF]/5 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-[#00BFFF]/5 rounded-full blur-[100px]" />
            </div>

            <AnimatePresence>
                {showTerminal && (
                    <TerminalLoader onComplete={handleTerminalComplete} />
                )}
            </AnimatePresence>

            <motion.div
                className="w-full max-w-md bg-[#1A1F24]/80 backdrop-blur-xl border border-[#00BFFF]/20 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="text-center mb-8">
                    <img src={logo} alt="Prométhée Logo" className="h-24 mx-auto mb-4 object-contain drop-shadow-[0_0_15px_rgba(0,191,255,0.5)]" />
                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#00BFFF] to-transparent mx-auto mt-4" />
                    <p className="text-[#A1A8B3] mt-2 text-sm">SECURE ACCESS REQUIRED</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-[#FF5E5E]/10 border border-[#FF5E5E]/30 text-[#FF5E5E] px-4 py-3 rounded-lg text-sm flex items-center"
                        >
                            <span className="font-mono">ERROR: {error}</span>
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A8B3] group-focus-within:text-[#00BFFF] transition-colors" />
                            <input
                                type="text"
                                placeholder="OPERATOR ID"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-[#0B0F12] border border-[#2A3441] text-[#E6EAF0] pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#00BFFF]/50 focus:ring-1 focus:ring-[#00BFFF]/50 transition-all font-mono placeholder:text-[#6B7280]"
                                disabled={isLoading || showTerminal}
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A8B3] group-focus-within:text-[#00BFFF] transition-colors" />
                            <input
                                type="password"
                                placeholder="ACCESS CODE"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0B0F12] border border-[#2A3441] text-[#E6EAF0] pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#00BFFF]/50 focus:ring-1 focus:ring-[#00BFFF]/50 transition-all font-mono placeholder:text-[#6B7280]"
                                disabled={isLoading || showTerminal}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || showTerminal}
                        className="w-full bg-[#00BFFF]/10 hover:bg-[#00BFFF]/20 text-[#00BFFF] border border-[#00BFFF]/30 font-semibold py-3 rounded-lg transition-all duration-300 relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="absolute inset-0 w-0 bg-[#00BFFF]/10 transition-all duration-[250ms] ease-out group-hover:w-full" />
                        <span className="relative font-mono tracking-widest">{isLoading ? 'AUTHENTICATING...' : 'INITIATE SEQUENCE'}</span>
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[#6B7280] text-xs font-mono">SYSTEM V1.0 // ALBI.SUBORBITAL</p>
                </div>
            </motion.div>
        </div>
    );
};
