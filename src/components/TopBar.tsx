import React from 'react';
import { Wifi, Clock, Pencil, Check } from 'lucide-react';
import logo from '../assets/logo.png';
import { VoiceVisualizer } from './voice/VoiceVisualizer';
import { useUiEditorStore } from '../store/useUiEditorStore';
import { useDashboardLayoutStore } from '../store/useDashboardLayoutStore';
import clsx from 'clsx';

export const TopBar: React.FC = () => {
    const isEditMode = useUiEditorStore((s) => s.isEditMode);
    const toggleEditMode = useUiEditorStore((s) => s.toggleEditMode);
    const activeDashboardId = useDashboardLayoutStore((s) => s.activeDashboardId);
    const dashboards = useDashboardLayoutStore((s) => s.dashboards);
    const activeDashboard = dashboards.find((d) => d.id === activeDashboardId);

    return (
        <header className="h-24 w-full fixed top-0 left-0 z-50 bg-[#0E1419]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 shadow-lg">

            {/* Left: Brand */}
            <div className="flex items-center gap-3">
                <img src={logo} alt="Prométhée Logo" className="h-20 w-auto animate-pulse-slow object-contain" />
                <h1 className="text-2xl font-extrabold tracking-wider text-neon-cyan uppercase font-sans">
                    Prométhée
                </h1>
            </div>

            {/* Center: Mission Info + Dashboard name */}
            <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="text-[#A1A8B3] text-xs uppercase tracking-widest">Mission ID:</span>
                    <span className="text-tech-green font-mono font-medium">ALPHA-09</span>
                </div>

                {activeDashboard && (
                    <>
                        <div className="h-4 w-px bg-white/10" />
                        <span className="text-xs text-[#A1A8B3] font-medium">
                            {activeDashboard.name}
                        </span>
                    </>
                )}
            </div>

            {/* Right: Status Indicators + Edit toggle */}
            <div className="flex items-center gap-6">

                {/* Edit mode toggle */}
                <button
                    onClick={toggleEditMode}
                    className={clsx(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200',
                        isEditMode
                            ? 'bg-neon-cyan/15 text-neon-cyan ring-1 ring-neon-cyan/40 shadow-[0_0_12px_rgba(0,191,255,0.2)]'
                            : 'text-[#A1A8B3] hover:text-white hover:bg-white/5',
                    )}
                >
                    {isEditMode ? <Check size={16} /> : <Pencil size={16} />}
                    <span className="hidden lg:inline">
                        {isEditMode ? 'Terminer' : 'Éditer'}
                    </span>
                </button>

                <div className="h-6 w-px bg-white/10" />

                <VoiceVisualizer />

                {/* Timer */}
                <div className="flex items-center gap-2 text-[#E6EAF0]">
                    <Clock size={18} className="text-neon-cyan" />
                    <span className="font-mono text-lg">01:34:52</span>
                </div>

                <div className="h-6 w-px bg-white/10 mx-2"></div>

                {/* Signal */}
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-[10px] text-[#A1A8B3]">RF SIGNAL</span>
                        <span className="text-tech-green font-bold text-sm">STRONG</span>
                    </div>
                    <Wifi size={20} className="text-tech-green drop-shadow-[0_0_5px_rgba(52,224,161,0.5)]" />
                </div>

            </div>
        </header>
    );
};
