import React, { useEffect, useRef } from 'react';
import { useFlightStore } from '../../store/useFlightStore';
import clsx from 'clsx';
import { Terminal } from 'lucide-react';

export const SystemLogs: React.FC = () => {
    const { logs } = useFlightStore();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="flex flex-col h-full bg-[#0E1419]/90 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden relative group shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-2 p-3 bg-white/5 border-b border-white/5">
                <Terminal size={14} className="text-tech-green" />
                <span className="text-[10px] font-mono font-bold tracking-wider text-muted-gray uppercase">System Logs (MAVLink)</span>
                <div className="ml-auto w-2 h-2 rounded-full bg-tech-green animate-pulse" />
            </div>

            {/* Logs Area */}
            <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1 custom-scrollbar relative">
                {/* Subtle Scanline Effect */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20" />

                {logs.map((log) => (
                    <div key={log.id} className="flex gap-2">
                        <span className="text-muted-gray/50 select-none">[{log.timestamp}]</span>
                        <span className={clsx(
                            "break-words",
                            log.type === 'error' && "text-alert-red font-bold",
                            log.type === 'warning' && "text-solar-amber",
                            log.type === 'success' && "text-tech-green",
                            log.type === 'info' && "text-light-gray"
                        )}>
                            {log.type === 'success' ? '➔ ' : '> '}
                            {log.message}
                        </span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
