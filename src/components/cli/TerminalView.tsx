// ──────────────────────────────────────────────
// PROMÉTHÉE — MAVLink CLI Terminal View
// ──────────────────────────────────────────────
// Renders shell output lines with per-drone selectors
// and auto-scroll support.

import React, { useEffect, useRef, useCallback } from 'react';
import { useShellStore, selectDroneLines, selectDroneAutoScroll, selectDronePartialBuffer } from '../../store/useShellStore';
import type { ShellLine, ShellLineType } from '../../store/useShellStore';
import clsx from 'clsx';

// ── Memoized line component ──────────────────

const LINE_STYLES: Record<ShellLineType, string> = {
    command: 'text-neon-cyan font-semibold',
    output: 'text-[#E6EAF0]',
    error: 'text-alert-red',
    system: 'text-[#A1A8B3] italic',
};

const LINE_PREFIX: Record<ShellLineType, string> = {
    command: 'pxh> ',
    output: '',
    error: '✖ ',
    system: '● ',
};

const TerminalLine = React.memo<{ line: ShellLine }>(({ line }) => (
    <div className="flex leading-relaxed min-h-[18px]">
        <span className={clsx('font-mono text-xs whitespace-pre-wrap break-all', LINE_STYLES[line.type])}>
            {LINE_PREFIX[line.type]}{line.text}
        </span>
    </div>
));

TerminalLine.displayName = 'TerminalLine';

// ── Terminal View ────────────────────────────

interface TerminalViewProps {
    droneId: string;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ droneId }) => {
    const lines = useShellStore(selectDroneLines(droneId));
    const autoScroll = useShellStore(selectDroneAutoScroll(droneId));
    const partialBuffer = useShellStore(selectDronePartialBuffer(droneId));
    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // ── Auto-scroll on new content ───────────
    const scrollToBottom = useCallback(() => {
        if (autoScroll && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [autoScroll]);

    useEffect(() => {
        scrollToBottom();
    }, [lines, partialBuffer, scrollToBottom]);

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-0.5 relative scrollbar-thin"
        >
            {/* Scanline overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-10 z-10" />

            {/* Lines */}
            {lines.map((line) => (
                <TerminalLine key={line.id} line={line} />
            ))}

            {/* Partial buffer (incomplete line being streamed) */}
            {partialBuffer.length > 0 && (
                <div className="flex leading-relaxed min-h-[18px]">
                    <span className="font-mono text-xs text-[#E6EAF0] whitespace-pre-wrap break-all opacity-70">
                        {partialBuffer}
                        <span className="inline-block w-[5px] h-[12px] bg-neon-cyan/50 animate-pulse ml-0.5 align-middle rounded-sm" />
                    </span>
                </div>
            )}

            {/* Empty state */}
            {lines.length === 0 && partialBuffer.length === 0 && (
                <div className="flex items-center justify-center h-full">
                    <span className="text-[#6B7280] text-xs font-mono">
                        En attente de commandes…
                    </span>
                </div>
            )}

            {/* Scroll anchor */}
            <div ref={bottomRef} />
        </div>
    );
};
