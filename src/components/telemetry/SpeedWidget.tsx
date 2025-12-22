import React from 'react';
import { useFlightStore } from '../../store/useFlightStore';
import { TelemetryCard } from '../TelemetryCard';
import { Gauge } from 'lucide-react';

export const SpeedWidget: React.FC = () => {
    // Optimized selector: only re-render when speed changes
    const speed = useFlightStore(state => state.telemetry.speed);

    // Calculate percentage for progress bar (assuming max speed 100 km/h for visualization)
    const maxSpeed = 100;
    const percentage = Math.min(100, (speed / maxSpeed) * 100);

    return (
        <TelemetryCard
            title="Ground Speed"
            value={speed.toString()}
            unit="km/h"
            icon={Gauge}
            className="h-full bg-[#0E1419]/90 backdrop-blur-md border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
        >
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                    className="bg-neon-cyan h-full shadow-[0_0_8px_#00BFFF] transition-all duration-300 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </TelemetryCard>
    );
};
