import React from 'react';
import { TelemetryCard } from '../TelemetryCard';
import { Zap } from 'lucide-react';
import { useFlightStore } from '../../store/useFlightStore';

export const BatteryWidget: React.FC = () => {
    // Optimized selector
    const battery = useFlightStore(state => state.telemetry.battery);

    return (
        <TelemetryCard
            title="Battery"
            value={battery.toFixed(0)}
            unit="%"
            icon={Zap}
            className="h-full bg-[#0E1419]/90 backdrop-blur-md border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.35)] border-solar-amber/30 hover:border-solar-amber/60"
        >
            <div className="flex gap-1 mt-2">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className={`h-3 flex-1 rounded-sm ${i < 7 ? 'bg-solar-amber shadow-[0_0_5px_#FFB347]' : 'bg-white/10'}`} />
                ))}
            </div>
            <p className="text-[10px] text-muted-gray mt-1 text-right">Est. Time: 22 min</p>
        </TelemetryCard>
    );
};
