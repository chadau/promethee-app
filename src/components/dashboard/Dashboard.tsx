import React, { useEffect, useRef } from 'react';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';


import { SystemLogs } from '../console/SystemLogs';
import { FlightInstruments } from '../console/FlightInstruments';
import { FlightControls } from '../console/FlightControls';
import { Globe } from '../Globe';
import { GridWidget } from './GridWidget';
import { TelemetryCard } from '../TelemetryCard';
import { VideoFeedWidget } from './VideoFeedWidget';
import { Navigation, Gauge, Zap } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const gridRef = useRef<GridStack | null>(null);

    useEffect(() => {
        // Initialize GridStack
        gridRef.current = GridStack.init({
            column: 12,
            cellHeight: 70, // Adjust base height row
            minRow: 1,
            margin: 10,
            animate: true,
        });

        return () => {
            // Clean up
            gridRef.current?.destroy(false); // don't remove DOM elements
        };
    }, []);

    return (
        <div className="grid-stack w-full h-full">

            {/* Map Area: 9x6 (Reduced Height) */}
            <GridWidget id="map" x={0} y={0} w={5} h={11} minH={4} minW={5} className="z-0">
                <div className="w-full h-full relative rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                    <Globe />
                </div>
            </GridWidget>

            {/* Video Feed Widget (New) */}
            <GridWidget id="video" x={5} y={0} w={4} h={11} minW={3} minH={3} className="z-10">
                <div className="w-full h-full overflow-hidden">
                    <VideoFeedWidget />
                </div>
            </GridWidget>

            {/* Telemetry: Altitude (Top Right) */}
            <GridWidget id="altitude" x={9} y={0} w={3} h={3} minW={2} className="z-10">
                <div className="w-full h-full overflow-hidden">
                    <TelemetryCard
                        title="Altitude"
                        value="120"
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
                </div>
            </GridWidget>

            {/* Telemetry: Speed (Middle Right) - Moved Up */}
            <GridWidget id="speed" x={9} y={3} w={3} h={3} minW={2} className="z-10">
                <div className="w-full h-full overflow-hidden">
                    <TelemetryCard
                        title="Ground Speed"
                        value="45"
                        unit="km/h"
                        icon={Gauge}
                        className="h-full bg-[#0E1419]/90 backdrop-blur-md border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
                    >
                        <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-neon-cyan w-3/4 h-full shadow-[0_0_8px_#00BFFF]" />
                        </div>
                    </TelemetryCard>
                </div>
            </GridWidget>

            {/* Telemetry: Battery (Bottom Right) - Moved Up */}
            <GridWidget id="battery" x={9} y={6} w={3} h={3} minW={2} className="z-10">
                <div className="w-full h-full overflow-hidden">
                    <TelemetryCard
                        title="Battery"
                        value="87"
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
                </div>
            </GridWidget>

            {/* Console: Logs: Moved to fit next to video */}
            <GridWidget id="logs" x={0} y={11} w={3} h={4} minH={2} minW={2} className="z-10">
                <div className="w-full h-full overflow-hidden">
                    <SystemLogs />
                </div>
            </GridWidget>

            {/* Console: Instruments: Moved to bottom row */}
            <GridWidget id="instruments" x={3} y={11} w={3} h={4} minH={2} minW={2} className="z-10">
                <div className="w-full h-full overflow-hidden">
                    <FlightInstruments />
                </div>
            </GridWidget>

            {/* Console: Controls: Moved to bottom row */}
            <GridWidget id="controls" x={6} y={11} w={3} h={4} minH={2} minW={2} className="z-10">
                <div className="w-full h-full overflow-hidden">
                    <FlightControls />
                </div>
            </GridWidget>

        </div>
    );
};
