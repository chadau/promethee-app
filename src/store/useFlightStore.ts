import { create } from 'zustand';

export type FlightMode = 'STABILIZE' | 'GUIDED' | 'AUTO' | 'RTH' | 'LAND';

interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
}

interface FlightState {
    isArmed: boolean;
    flightMode: FlightMode;
    logs: LogEntry[];
    controlInput: ControlInput;
    position: Position;
    telemetry: Telemetry;

    // Actions
    setArmed: (armed: boolean) => void;
    setFlightMode: (mode: FlightMode) => void;
    addLog: (message: string, type?: LogEntry['type']) => void;
    clearLogs: () => void;
    setControlInput: (input: { pitch: number; roll: number; yaw: number; throttle: number }) => void;
    updatePosition: (pos: Partial<Position>) => void;
    updateTelemetry: (telem: Partial<Telemetry>) => void;
}

export interface Position {
    lat: number;
    lon: number;
    alt: number;
    heading: number;
}

export interface ControlInput {
    pitch: number;
    roll: number;
    yaw: number;
    throttle: number;
}

export interface Telemetry {
    speed: number;
    battery: number;
}

export const useFlightStore = create<FlightState>((set) => ({
    isArmed: false,
    flightMode: 'STABILIZE',
    logs: [
        { id: '1', timestamp: '10:00:01', message: 'System Initialized', type: 'info' },
        { id: '2', timestamp: '10:00:02', message: 'MAVLink Connection Established', type: 'success' },
        { id: '3', timestamp: '10:00:05', message: 'GPS Fix Acquired (12 sats)', type: 'success' },
        { id: '4', timestamp: '10:00:08', message: 'Battery Voltage Optimal (24.5V)', type: 'info' },
        { id: '5', timestamp: '10:00:10', message: 'Waiting for Arm Command...', type: 'warning' },
    ],

    setArmed: (armed) => set((state) => {
        // Prevent duplicate logs if state hasn't changed
        if (state.isArmed === armed) return state;

        const status = armed ? 'ARMED' : 'DISARMED';
        return {
            isArmed: armed,
            logs: [
                ...state.logs,
                {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    timestamp: new Date().toLocaleTimeString('fr-FR', { hour12: false }),
                    message: `Vehicle ${status}`,
                    type: armed ? 'error' : 'info' // Red for armed (danger)
                }
            ]
        };
    }),

    setFlightMode: (mode) => set((state) => ({
        flightMode: mode,
        logs: [
            ...state.logs,
            {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toLocaleTimeString('fr-FR', { hour12: false }),
                message: `Mode changed to ${mode}`,
                type: 'info'
            }
        ]
    })),

    addLog: (message, type = 'info') => set((state) => ({
        logs: [
            ...state.logs,
            {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toLocaleTimeString('fr-FR', { hour12: false }),
                message,
                type
            }
        ]
    })),

    clearLogs: () => set({ logs: [] }),

    controlInput: { pitch: 0, roll: 0, yaw: 0, throttle: 0 },
    setControlInput: (input) => set({ controlInput: input }),

    position: { lat: 48.8566, lon: 2.3522, alt: 100, heading: 0 }, // Default Paris
    updatePosition: (pos) => set((state) => ({
        position: { ...state.position, ...pos }
    })),

    telemetry: { speed: 0, battery: 100 },
    updateTelemetry: (telem) => set((state) => ({
        telemetry: { ...state.telemetry, ...telem }
    })),
}));
