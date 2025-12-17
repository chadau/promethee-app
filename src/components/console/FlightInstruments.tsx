
import React from 'react';
import { Compass, Rotate3d } from 'lucide-react';

export const FlightInstruments: React.FC = () => {
    return (
        <div className="flex h-full gap-3 p-3 bg-[#0E1419]/90 backdrop-blur-md rounded-xl border border-white/5 shadow-2xl">

            {/* Artificial Horizon (Simplified Mockup) */}
            <div className="flex-1 bg-[#15191E]/50 rounded-lg border border-white/5 relative overflow-hidden flex items-center justify-center">
                {/* Sky */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-[#0077BE]/30" />
                {/* Ground */}
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#8B4513]/30" />

                {/* Horizon Line */}
                <div className="absolute w-full h-px bg-white/50" />

                {/* Drone Icon Indicator */}
                <div className="z-10 text-neon-cyan">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L12 22" className="text-white/20" />
                        <path d="M2 12L22 12" className="text-white/20" />
                        {/* Center marker */}
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                        <path d="M5 12 H9 M15 12 H19" stroke="currentColor" />
                    </svg>
                </div>

                {/* Pitch Ladder Lines (Simplified) */}
                <div className="absolute inset-0 flex flex-col justify-between py-4 opacity-30 pointer-events-none">
                    <div className="w-1/2 h-px bg-white mx-auto" />
                    <div className="w-1/3 h-px bg-white mx-auto" />
                    <div className="w-1/2 h-px bg-white mx-auto" />
                </div>

                <div className="absolute top-2 left-2 text-[10px] text-muted-gray flex items-center gap-1">
                    <Rotate3d size={12} /> ATTITUDE
                </div>
            </div>

            {/* Compass / Heading */}
            <div className="w-1/3 bg-[#15191E] rounded-lg border border-white/10 flex flex-col items-center justify-center relative">
                <Compass className="text-neon-cyan mb-1" size={24} />
                <span className="text-2xl font-mono font-bold text-white">342°</span>
                <span className="text-[10px] text-muted-gray uppercase tracking-widest">Heading</span>

                {/* Tick marks */}
                <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w - px bg - white / 30 ${i === 2 ? 'h-3 bg-neon-cyan' : 'h-1'} `} />
                    ))}
                </div>
            </div>

        </div>
    );
};
