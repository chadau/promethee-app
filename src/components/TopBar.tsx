import React from 'react';
import { Wifi, Clock } from 'lucide-react';
import logo from '../assets/logo.png';

export const TopBar: React.FC = () => {
    return (
        <header className="h-24 w-full fixed top-0 left-0 z-50 bg-[#0E1419]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 shadow-lg">

            {/* Left: Brand */}
            <div className="flex items-center gap-3">
                <img src={logo} alt="Prométhée Logo" className="h-20 w-auto animate-pulse-slow object-contain" />
                <h1 className="text-2xl font-extrabold tracking-wider text-neon-cyan uppercase font-sans">
                    Prométhée
                </h1>
            </div>

            {/* Center: Mission Info (Optional, kept minimal for now) */}
            <div className="hidden md:flex items-center gap-2">
                <span className="text-muted-gray text-xs uppercase tracking-widest">Mission ID:</span>
                <span className="text-tech-green font-mono font-medium">ALPHA-09</span>
            </div>

            {/* Right: Status Indicators */}
            <div className="flex items-center gap-6">

                {/* Timer */}
                <div className="flex items-center gap-2 text-light-gray">
                    <Clock size={18} className="text-neon-cyan" />
                    <span className="font-mono text-lg">01:34:52</span>
                </div>

                <div className="h-6 w-px bg-white/10 mx-2"></div>

                {/* Signal */}
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-[10px] text-muted-gray">RF SIGNAL</span>
                        <span className="text-tech-green font-bold text-sm">STRONG</span>
                    </div>
                    <Wifi size={20} className="text-tech-green drop-shadow-[0_0_5px_rgba(52,224,161,0.5)]" />
                </div>

            </div>
        </header>
    );
};
