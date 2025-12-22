import React, { useEffect, useRef, useState } from 'react';
import { Viewer, Entity } from 'resium';
import type { CesiumComponentRef } from 'resium';
import { Cartesian3, Color, Math as CesiumMath, Transforms, HeadingPitchRoll, Entity as CesiumEntity } from 'cesium';
import { useFlightStore } from '../store/useFlightStore';
import { Navigation, Crosshair } from 'lucide-react';

export const Globe: React.FC = () => {
    const position = useFlightStore((state) => state.position);
    const [isFollowing, setIsFollowing] = useState(true);
    const viewerRef = useRef<CesiumComponentRef<any>>(null);
    const entityRef = useRef<CesiumComponentRef<CesiumEntity>>(null);

    // Convert degrees to Cartesian3
    const dronePosition = Cartesian3.fromDegrees(position.lon, position.lat, position.alt);

    // Initial camera setup or mode switch
    // Initial camera setup or mode switch
    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>;

        const attemptLock = () => {
            if (viewerRef.current?.cesiumElement && entityRef.current?.cesiumElement) {
                const viewer = viewerRef.current.cesiumElement;
                if (isFollowing) {
                    if (viewer.trackedEntity !== entityRef.current.cesiumElement) {
                        viewer.trackedEntity = entityRef.current.cesiumElement;
                    }
                } else {
                    viewer.trackedEntity = undefined;
                }
                return true; // Success (refs available)
            }
            return false;
        };

        // Try immediately
        attemptLock();

        if (isFollowing) {
            intervalId = setInterval(() => {
                if (attemptLock()) {
                    if (viewerRef.current?.cesiumElement && entityRef.current?.cesiumElement) {
                        clearInterval(intervalId);
                    }
                }
            }, 100);
        } else {
            attemptLock();
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isFollowing]);

    // Manual interaction breaks the lock
    const handleManualInteraction = () => {
        if (isFollowing) {
            setIsFollowing(false);
            if (viewerRef.current?.cesiumElement) {
                viewerRef.current.cesiumElement.trackedEntity = undefined;
            }
        }
    };

    return (
        <div
            className="w-full h-full bg-black/40 relative overflow-hidden rounded-xl border border-white/5 shadow-inner group"
            onMouseDownCapture={handleManualInteraction}
            onWheelCapture={handleManualInteraction}
            onTouchStartCapture={handleManualInteraction}
        >
            <Viewer
                ref={viewerRef}
                full
                timeline={false}
                animation={false}
                infoBox={false}
                navigationHelpButton={false}
                homeButton={false}
                geocoder={false}
                baseLayerPicker={true}
                sceneModePicker={false}
                selectionIndicator={false}
                fullscreenButton={false}
                className="w-full h-full"
            >
                {/* Drone Entity */}
                <Entity
                    ref={entityRef}
                    name="Prométhée Drone"
                    position={dronePosition}
                    point={{ pixelSize: 15, color: Color.CYAN, outlineColor: Color.WHITE, outlineWidth: 2 }}
                    description="Target Drone Unit"
                    viewFrom={new Cartesian3(0.0, -0.1, 500.0)} // Top-down view closer to the drone
                >
                    {/* Visual Heading Cone/Arrow */}
                    <Entity
                        position={dronePosition}
                        orientation={Transforms.headingPitchRollQuaternion(
                            dronePosition,
                            new HeadingPitchRoll(
                                CesiumMath.toRadians(position.heading - 90),
                                CesiumMath.toRadians(90), // Pitch 90 to lay flat
                                0
                            )
                        )}
                        cylinder={{
                            length: 50.0,
                            topRadius: 0.0,
                            bottomRadius: 20.0,
                            material: Color.CYAN.withAlpha(0.7),
                        }}
                    />
                </Entity>
            </Viewer>

            {/* Recenter Button */}
            {!isFollowing && (
                <button
                    onClick={() => setIsFollowing(true)}
                    className="absolute bottom-6 right-6 z-10 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 border border-cyan-500/50 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg animate-in fade-in slide-in-from-bottom-2"
                >
                    <Crosshair size={20} />
                    <span>Recenter</span>
                </button>
            )}

            {/* Status Overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
                <div className="flex items-center gap-2 text-xs font-mono text-white/70 bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                    <Navigation size={12} className={isFollowing ? "text-cyan-400" : "text-gray-500"} />
                    <span>{isFollowing ? "LOCKED" : "FREE CAM"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-white/70 bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                    <span>LAT: {position.lat.toFixed(6)}</span>
                    <span>LON: {position.lon.toFixed(6)}</span>
                </div>
            </div>
        </div>
    );
};
