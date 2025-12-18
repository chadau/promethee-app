import React from 'react';
import { useFlightStore } from '../../store/useFlightStore';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { Power, PlaneTakeoff, Home, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export const FlightControls: React.FC = () => {
    const { isArmed, setArmed, setFlightMode } = useFlightStore();
    const { playArmed } = useVoiceAssistant();

    const handleToggleArm = () => {
        if (!isArmed) {
            playArmed();
        }
        setArmed(!isArmed);
    };

    return (
        <div className="h-full flex flex-col gap-2 p-3 bg-[#0E1419]/90 backdrop-blur-md rounded-xl border border-white/5 shadow-2xl">

            {/* Top Row: Arming & Modes */}
            <div className="flex-1 flex gap-2">
                {/* ARM / DISARM Switch Button */}
                <button
                    onClick={handleToggleArm}
                    className={clsx(
                        "flex-1 rounded-lg border flex flex-col items-center justify-center transition-all duration-300",
                        isArmed
                            ? "bg-alert-red/20 border-alert-red text-alert-red hover:bg-alert-red/30"
                            : "bg-[#1A1F24] border-white/10 text-muted-gray hover:bg-white/5 hover:text-white hover:border-white/20"
                    )}
                >
                    <Power size={24} className="mb-1" />
                    <span className="text-xs font-bold tracking-wider">{isArmed ? 'ARMED' : 'DISARMED'}</span>
                </button>

                {/* Modes Grid */}
                <div className="flex-1 grid grid-cols-2 gap-2">
                    <ActionButton
                        label="TAKEOFF"
                        icon={PlaneTakeoff}
                        onClick={() => { if (isArmed) setFlightMode('AUTO'); }}
                        disabled={!isArmed}
                    />
                    <ActionButton
                        label="RTH"
                        icon={Home}
                        color="amber"
                        onClick={() => setFlightMode('RTH')}
                    />
                </div>
            </div>

            {/* Bottom Row: Emergency */}
            <button
                onClick={() => { setArmed(false); setFlightMode('LAND'); }}
                className="h-10 bg-alert-red hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors border border-red-400 shadow-[0_0_10px_rgba(255,94,94,0.4)]"
            >
                <AlertTriangle size={16} />
                <span className="font-bold text-xs tracking-widest uppercase">Emergency Land</span>
            </button>
        </div>
    );
};

interface ActionButtonProps {
    label: string;
    icon: React.ElementType;
    onClick?: () => void;
    disabled?: boolean;
    color?: 'cyan' | 'amber';
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, icon: Icon, onClick, disabled, color = 'cyan' }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={clsx(
                "rounded border flex flex-col items-center justify-center transition-all",
                disabled ? "opacity-30 cursor-not-allowed bg-transparent border-white/5 text-gray-500" :
                    color === 'cyan'
                        ? "bg-[#1A1F24] border-white/10 hover:border-neon-cyan/50 hover:text-neon-cyan active:bg-neon-cyan/10"
                        : "bg-[#1A1F24] border-white/10 hover:border-solar-amber/50 text-solar-amber active:bg-solar-amber/10"
            )}
        >
            <Icon size={18} className="mb-1" />
            <span className="text-[10px] font-bold">{label}</span>
        </button>
    );
};
