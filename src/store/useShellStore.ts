// ──────────────────────────────────────────────
// PROMÉTHÉE — MAVLink Shell Store
// ──────────────────────────────────────────────
// Per-drone shell state with fine-grained selectors
// for optimal re-render performance.

import { create } from 'zustand';

// ── Types ────────────────────────────────────

export type ShellLineType = 'command' | 'output' | 'error' | 'system';

export interface ShellLine {
    id: string;
    type: ShellLineType;
    text: string;
    timestamp: number;
}

interface DroneShellState {
    lines: ShellLine[];
    commandHistory: string[];
    historyIndex: number;       // -1 = new input (not navigating)
    partialLineBuffer: string;  // Buffer for incomplete chunked lines
    autoScroll: boolean;
}

const MAX_LINES = 2000;
const MAX_HISTORY = 100;

let lineIdCounter = 0;
const nextLineId = (): string => `sl-${++lineIdCounter}-${Date.now()}`;

const createEmptyDroneState = (): DroneShellState => ({
    lines: [],
    commandHistory: [],
    historyIndex: -1,
    partialLineBuffer: '',
    autoScroll: true,
});

// ── Store ────────────────────────────────────

interface ShellStoreState {
    shells: Record<string, DroneShellState>;

    // ── Actions ──
    ensureDrone: (droneId: string) => void;
    appendOutput: (droneId: string, data: string) => void;
    appendError: (droneId: string, data: string) => void;
    addCommandLine: (droneId: string, command: string) => void;
    addSystemLine: (droneId: string, text: string) => void;
    clearTerminal: (droneId: string) => void;
    setAutoScroll: (droneId: string, enabled: boolean) => void;
    navigateHistory: (droneId: string, direction: 'up' | 'down') => string | null;
    resetHistoryIndex: (droneId: string) => void;
}

const getDroneState = (shells: Record<string, DroneShellState>, droneId: string): DroneShellState =>
    shells[droneId] ?? createEmptyDroneState();

const trimLines = (lines: ShellLine[]): ShellLine[] =>
    lines.length > MAX_LINES ? lines.slice(lines.length - MAX_LINES) : lines;

export const useShellStore = create<ShellStoreState>()((set, get) => ({
    shells: {},

    ensureDrone: (droneId) => {
        if (get().shells[droneId]) return;
        set((state) => ({
            shells: {
                ...state.shells,
                [droneId]: createEmptyDroneState(),
            },
        }));
    },

    appendOutput: (droneId, data) => {
        set((state) => {
            const drone = getDroneState(state.shells, droneId);
            const buffered = drone.partialLineBuffer + data;

            // Split into complete lines and remaining partial
            const parts = buffered.split('\n');
            const partial = parts.pop() ?? '';

            const newLines: ShellLine[] = parts
                .filter((line) => line.length > 0)
                .map((line) => ({
                    id: nextLineId(),
                    type: 'output' as const,
                    text: line,
                    timestamp: Date.now(),
                }));

            return {
                shells: {
                    ...state.shells,
                    [droneId]: {
                        ...drone,
                        lines: trimLines([...drone.lines, ...newLines]),
                        partialLineBuffer: partial,
                    },
                },
            };
        });
    },

    appendError: (droneId, data) => {
        set((state) => {
            const drone = getDroneState(state.shells, droneId);
            return {
                shells: {
                    ...state.shells,
                    [droneId]: {
                        ...drone,
                        lines: trimLines([
                            ...drone.lines,
                            { id: nextLineId(), type: 'error', text: data, timestamp: Date.now() },
                        ]),
                    },
                },
            };
        });
    },

    addCommandLine: (droneId, command) => {
        set((state) => {
            const drone = getDroneState(state.shells, droneId);

            // Flush any partial buffer before the command echo
            const flushed: ShellLine[] = [];
            let buffer = drone.partialLineBuffer;
            if (buffer.length > 0) {
                flushed.push({ id: nextLineId(), type: 'output', text: buffer, timestamp: Date.now() });
                buffer = '';
            }

            const cmdLine: ShellLine = {
                id: nextLineId(),
                type: 'command',
                text: command,
                timestamp: Date.now(),
            };

            // Update history — avoid duplicates at the top
            const history = [...drone.commandHistory];
            if (history[history.length - 1] !== command) {
                history.push(command);
                if (history.length > MAX_HISTORY) history.shift();
            }

            return {
                shells: {
                    ...state.shells,
                    [droneId]: {
                        ...drone,
                        lines: trimLines([...drone.lines, ...flushed, cmdLine]),
                        commandHistory: history,
                        historyIndex: -1,
                        partialLineBuffer: buffer,
                    },
                },
            };
        });
    },

    addSystemLine: (droneId, text) => {
        set((state) => {
            const drone = getDroneState(state.shells, droneId);
            return {
                shells: {
                    ...state.shells,
                    [droneId]: {
                        ...drone,
                        lines: trimLines([
                            ...drone.lines,
                            { id: nextLineId(), type: 'system', text, timestamp: Date.now() },
                        ]),
                    },
                },
            };
        });
    },

    clearTerminal: (droneId) => {
        set((state) => {
            const drone = getDroneState(state.shells, droneId);
            return {
                shells: {
                    ...state.shells,
                    [droneId]: {
                        ...drone,
                        lines: [],
                        partialLineBuffer: '',
                    },
                },
            };
        });
    },

    setAutoScroll: (droneId, enabled) => {
        set((state) => {
            const drone = getDroneState(state.shells, droneId);
            return {
                shells: {
                    ...state.shells,
                    [droneId]: { ...drone, autoScroll: enabled },
                },
            };
        });
    },

    navigateHistory: (droneId, direction) => {
        const state = get();
        const drone = getDroneState(state.shells, droneId);
        const { commandHistory, historyIndex } = drone;

        if (commandHistory.length === 0) return null;

        let newIndex: number;
        if (direction === 'up') {
            newIndex = historyIndex === -1
                ? commandHistory.length - 1
                : Math.max(0, historyIndex - 1);
        } else {
            if (historyIndex === -1) return null;
            newIndex = historyIndex + 1;
            if (newIndex >= commandHistory.length) {
                // Past the end — reset to new input
                set((s) => ({
                    shells: {
                        ...s.shells,
                        [droneId]: { ...getDroneState(s.shells, droneId), historyIndex: -1 },
                    },
                }));
                return '';
            }
        }

        set((s) => ({
            shells: {
                ...s.shells,
                [droneId]: { ...getDroneState(s.shells, droneId), historyIndex: newIndex },
            },
        }));

        return commandHistory[newIndex] ?? null;
    },

    resetHistoryIndex: (droneId) => {
        set((state) => {
            const drone = getDroneState(state.shells, droneId);
            return {
                shells: {
                    ...state.shells,
                    [droneId]: { ...drone, historyIndex: -1 },
                },
            };
        });
    },
}));

// ── Selectors (fine-grained, per-drone) ──────
// Components should use these to avoid re-renders
// when a different drone's state changes.

export const selectDroneLines = (droneId: string) =>
    (state: ShellStoreState): ShellLine[] =>
        state.shells[droneId]?.lines ?? [];

export const selectDroneAutoScroll = (droneId: string) =>
    (state: ShellStoreState): boolean =>
        state.shells[droneId]?.autoScroll ?? true;

export const selectDronePartialBuffer = (droneId: string) =>
    (state: ShellStoreState): string =>
        state.shells[droneId]?.partialLineBuffer ?? '';
