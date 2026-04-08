import React, { useEffect, useRef } from 'react';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';


import { SystemLogs } from '../console/SystemLogs';
import { FlightInstruments } from '../console/FlightInstruments';
import { FlightControls } from '../console/FlightControls';
import { Globe } from '../Globe';
import { GridWidget } from './GridWidget';
import { VideoFeedWidget } from './VideoFeedWidget';
import { AltitudeWidget } from '../telemetry/AltitudeWidget';
import { SpeedWidget } from '../telemetry/SpeedWidget';
import { BatteryWidget } from '../telemetry/BatteryWidget';
import { ManualControlWidget } from './ManualControlWidget';
// import { SimulationEngine } from '../logic/SimulationEngine';

export const Dashboard: React.FC = () => {
    // Mount simulation engine (headless)
    // It runs the physics loop when drone is Armed

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
            {/* <SimulationEngine /> */}

            {/* Map Area: 9x6 (Reduced Height) */}
            <GridWidget id="map" x={0} y={0} w={5} h={13} minH={4} minW={5} className="z-0">
                <div className="w-full h-full relative rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                    <Globe />
                </div>
            </GridWidget>

            {/* Video Feed Widget (New) */}
            <GridWidget id="video" x={5} y={0} w={4} h={13} minW={3} minH={3} className="z-10">
                <div className="w-full h-full overflow-hidden">
                    <VideoFeedWidget />
                </div>
            </GridWidget>

            {/* Telemetry: Altitude (Top Right) */}
            <GridWidget id="altitude" x={9} y={0} w={3} h={3} minW={2} className="z-10">
                <div className="w-full h-full overflow-hidden">
                    <AltitudeWidget />
                </div>
            </GridWidget>

            {/* Telemetry: Speed (Middle Right) - Moved Up */}
            <GridWidget id="speed" x={9} y={3} w={3} h={3} minW={2} className="z-10">
                <div className="w-full h-full overflow-hidden">
                    <SpeedWidget />
                </div>
            </GridWidget>

            {/* Telemetry: Battery (Bottom Right) - Moved Up */}
            <GridWidget id="battery" x={9} y={6} w={3} h={3} minW={2} className="z-10">
                <div className="w-full h-full overflow-hidden">
                    <BatteryWidget />
                </div>
            </GridWidget>

            {/* Manual Control (Bottom Right) */}
            <GridWidget id="manual-control" x={3} y={13} w={3} h={4} minW={2} className="z-10">
                <div className="w-full h-full overflow-hidden">
                    <ManualControlWidget />
                </div>
            </GridWidget>

            {/* Console: Logs: Moved to fit next to video */}
            <GridWidget id="logs" x={9} y={9} w={3} h={4} minH={2} minW={2} className="z-10">
                <div className="w-full h-full overflow-hidden">
                    <SystemLogs />
                </div>
            </GridWidget>

            {/* Console: Instruments: Moved to bottom row */}
            <GridWidget id="instruments" x={0} y={13} w={3} h={4} minH={2} minW={2} className="z-10">
                <div className="w-full h-full overflow-hidden">
                    <FlightInstruments />
                </div>
            </GridWidget>

            {/* Console: Controls: Moved to bottom row */}
            <GridWidget id="controls" x={6} y={13} w={3} h={4} minH={2} minW={2} className="z-10">
                <div className="w-full h-full overflow-hidden">
                    <FlightControls />
                </div>
            </GridWidget>

        </div>
    );
};
