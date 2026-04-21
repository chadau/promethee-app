// ──────────────────────────────────────────────
// PROMÉTHÉE — MAVLink CLI Widget
// ──────────────────────────────────────────────
// Self-contained terminal widget for the dashboard.
// Streams PX4 shell output via WebSocket.

import React, { useEffect } from 'react';
import { TerminalSquare, Trash2, ArrowDownToLine } from 'lucide-react';
import { TerminalView } from './TerminalView';
import { CommandInput } from './CommandInput';
import { useShellStore, selectDroneAutoScroll } from '../../store/useShellStore';
import clsx from 'clsx';

interface MavlinkCliWidgetProps {
    droneId?: string;
}

export const MavlinkCliWidget: React.FC<MavlinkCliWidgetProps> = ({
    droneId = '1',
}) => {
    const autoScroll = useShellStore(selectDroneAutoScroll(droneId));
    const ensureDrone = useShellStore((s) => s.ensureDrone);
    const clearTerminal = useShellStore((s) => s.clearTerminal);
    const setAutoScroll = useShellStore((s) => s.setAutoScroll);
    const addSystemLine = useShellStore((s) => s.addSystemLine);

    // Initialize drone shell state on mount
    useEffect(() => {
        ensureDrone(droneId);
        addSystemLine(droneId, `PROMÉTHÉE MAVLink Console — Drone ${droneId}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [droneId]);

    return (
        <div className="flex flex-col h-full bg-[#0E1419]/90 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden relative group shadow-2xl">
            {/* ── Header ──────────────────────── */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border-b border-white/5 shrink-0">
                {/* Icon + Title */}
                <TerminalSquare size={14} className="text-neon-cyan" />
                <span className="text-[10px] font-mono font-bold tracking-wider text-[#A1A8B3] uppercase">
                    Console MAVLink
                </span>

                {/* Status dot */}
                <div className="w-1.5 h-1.5 rounded-full bg-tech-green animate-pulse" />

                {/* Spacer */}
                <div className="flex-1" />

                {/* Auto-scroll toggle */}
                <button
                    onClick={() => setAutoScroll(droneId, !autoScroll)}
                    className={clsx(
                        'p-1 rounded-md transition-colors duration-150',
                        autoScroll
                            ? 'text-neon-cyan hover:bg-neon-cyan/10'
                            : 'text-[#6B7280] hover:bg-white/5',
                    )}
                    title={autoScroll ? 'Auto-scroll activé' : 'Auto-scroll désactivé'}
                >
                    <ArrowDownToLine size={13} />
                </button>

                {/* Clear terminal */}
                <button
                    onClick={() => clearTerminal(droneId)}
                    className="p-1 rounded-md text-[#6B7280] hover:text-alert-red hover:bg-alert-red/10 transition-colors duration-150"
                    title="Effacer la console"
                >
                    <Trash2 size={13} />
                </button>
            </div>

            {/* ── Terminal output ──────────────── */}
            <TerminalView droneId={droneId} />

            {/* ── Command input ───────────────── */}
            <CommandInput droneId={droneId} />
        </div>
    );
};
