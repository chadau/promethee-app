import React from 'react';
import { useFlightStore } from '../../store/useFlightStore';
import { TelemetryCard } from '../TelemetryCard';
import { Navigation } from 'lucide-react';

export const AltitudeWidget: React.FC = () => {
    // Optimized selector: only re-render when altitude changes
    const altitude = useFlightStore(state => state.position.alt);

    return (
        <TelemetryCard
            title="Altitude"
            value={Math.round(altitude).toString()}
            unit="m"
            icon={Navigation}
            className="h-full bg-[#0E1419]/90 backdrop-blur-md border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
        >
            <div className="h-8 w-full bg-gradient-to-r from-transparent via-neon-cyan/20 to-neon-cyan/5 mt-1 rounded-sm relative overflow-hidden">
                <svg className="w-full h-full text-neon-cyan" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0,20 L10,18 L30,15 L50,12 L70,16 L90,5 L100,0" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
            </div>
        </TelemetryCard>
    );
};
