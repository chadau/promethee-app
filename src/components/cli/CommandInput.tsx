// ──────────────────────────────────────────────
// PROMÉTHÉE — MAVLink CLI Command Input
// ──────────────────────────────────────────────

import React, { useState, useRef, useCallback } from 'react';
import { useShellStore } from '../../store/useShellStore';
import { droneConnectionService } from '../../services/droneConnectionService';

interface CommandInputProps {
    droneId: string;
}

export const CommandInput: React.FC<CommandInputProps> = ({ droneId }) => {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const addCommandLine = useShellStore((s) => s.addCommandLine);
    const navigateHistory = useShellStore((s) => s.navigateHistory);
    const resetHistoryIndex = useShellStore((s) => s.resetHistoryIndex);

    const handleSubmit = useCallback(() => {
        const trimmed = input.trim();
        if (!trimmed) return;

        // Echo command in terminal
        addCommandLine(droneId, trimmed);

        // Send via WebSocket
        droneConnectionService.sendShellCommand(droneId, trimmed);

        setInput('');
    }, [input, droneId, addCommandLine]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
                return;
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const cmd = navigateHistory(droneId, 'up');
                if (cmd !== null) setInput(cmd);
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const cmd = navigateHistory(droneId, 'down');
                if (cmd !== null) setInput(cmd);
                return;
            }

            // Any other key resets history navigation
            resetHistoryIndex(droneId);
        },
        [droneId, handleSubmit, navigateHistory, resetHistoryIndex],
    );

    return (
        <div
            className="flex items-center gap-1 px-3 py-2 bg-[#0a0e11] border-t border-white/5 cursor-text"
            onClick={() => inputRef.current?.focus()}
        >
            {/* Prompt */}
            <span className="text-neon-cyan font-mono text-xs font-semibold select-none shrink-0">
                pxh&gt;
            </span>

            {/* Input */}
            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-light-gray font-mono text-xs outline-none border-none placeholder:text-[#6B7280] caret-neon-cyan"
                placeholder="Entrez une commande…"
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
            />

            {/* Blinking cursor indicator (visible when empty) */}
            {input.length === 0 && (
                <span className="w-[6px] h-[14px] bg-neon-cyan/70 animate-pulse rounded-sm" />
            )}
        </div>
    );
};
