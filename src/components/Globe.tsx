import React, { useEffect, useRef, useState } from 'react';
import { Viewer, Entity, PointGraphics, ModelGraphics } from 'resium';
import type { CesiumComponentRef } from 'resium';
import { Cartesian3, Color, Math as CesiumMath, Transforms, HeadingPitchRoll, Matrix4, HeadingPitchRange, Entity as CesiumEntity, CallbackProperty, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium';
import { useFlightStore } from '../store/useFlightStore';
import { Navigation, Crosshair } from 'lucide-react';

export const Globe: React.FC = () => {
    const position = useFlightStore((state) => state.position);
    const [isFollowing, setIsFollowing] = useState(true);
    const viewerRef = useRef<CesiumComponentRef<any>>(null);

    // Memoize Cesium Properties to avoid re-creating them on every render
    const positionProperty = React.useMemo(() => new CallbackProperty(() => {
        const { position } = useFlightStore.getState();
        return Cartesian3.fromDegrees(position.lon, position.lat, position.alt);
    }, false), []);

    const visualOrientationProperty = React.useMemo(() => new CallbackProperty(() => {
        const { position } = useFlightStore.getState();
        const dronePos = Cartesian3.fromDegrees(position.lon, position.lat, position.alt);
        return Transforms.headingPitchRollQuaternion(
            dronePos,
            new HeadingPitchRoll(
                CesiumMath.toRadians(position.heading - 90),
                0,
                0
            )
        );
    }, false), []); // Re-render when this memo changes is irrelevant due to CallbackProperty, but safer to keep deps empty or minimal

    // Camera Tracking Logic (Manual Control for Smoothness)
    useEffect(() => {
        let animationFrameId: number;
        let listenerCleanup: (() => void) | undefined;
        let handler: ScreenSpaceEventHandler | undefined;

        const setupCameraListener = () => {
            const viewer = viewerRef.current?.cesiumElement;
            if (!viewer || !viewer.scene) {
                // Viewer not ready yet, retry next frame
                animationFrameId = requestAnimationFrame(setupCameraListener);
                return;
            }

            const scene = viewer.scene;
            const canvas = viewer.canvas;

            // Setup Input Handler to break lock
            handler = new ScreenSpaceEventHandler(canvas);
            const breakLock = () => {
                if (isFollowing) {
                    setIsFollowing(false);
                    // Immediate unlock with state preservation
                    const camera = viewer.camera;
                    const pos = camera.positionWC.clone();
                    const dir = camera.directionWC.clone();
                    const up = camera.upWC.clone();

                    camera.lookAtTransform(Matrix4.IDENTITY);

                    // Restore position and orientation using setView
                    camera.setView({
                        destination: pos,
                        orientation: {
                            direction: dir,
                            up: up
                        }
                    });
                }
            };

            handler.setInputAction(breakLock, ScreenSpaceEventType.LEFT_DOWN);
            handler.setInputAction(breakLock, ScreenSpaceEventType.RIGHT_DOWN);
            handler.setInputAction(breakLock, ScreenSpaceEventType.WHEEL);
            handler.setInputAction(breakLock, ScreenSpaceEventType.PINCH_START);

            const updateCamera = () => {
                if (!isFollowing) return;

                const { position } = useFlightStore.getState();
                const center = Cartesian3.fromDegrees(position.lon, position.lat, position.alt);

                // Create a transform matrix that places the camera relative to the drone's position and orientation
                // Heading 0 to align with physics (North = Top)
                const transform = Transforms.headingPitchRollToFixedFrame(
                    center,
                    new HeadingPitchRoll(
                        CesiumMath.toRadians(position.heading),
                        0,
                        0
                    )
                );

                // Lock camera to this frame
                // Offset: 0 heading (aligned), -90 deg pitch (Top Down), 500m range
                viewer.camera.lookAtTransform(
                    transform,
                    new HeadingPitchRange(0, -CesiumMath.PI_OVER_TWO, 500)
                );
            };

            if (isFollowing) {
                scene.postUpdate.addEventListener(updateCamera);
            } else {
                // When we enter this branch from a re-render where isFollowing became false
                scene.postUpdate.removeEventListener(updateCamera);

                if (!Matrix4.equals(viewer.camera.transform, Matrix4.IDENTITY)) {
                    const camera = viewer.camera;
                    const pos = camera.positionWC.clone();
                    const dir = camera.directionWC.clone();
                    const up = camera.upWC.clone();

                    camera.lookAtTransform(Matrix4.IDENTITY);

                    camera.setView({
                        destination: pos,
                        orientation: {
                            direction: dir,
                            up: up
                        }
                    });
                }
            }

            // Assign cleanup function to the scoped variable
            listenerCleanup = () => {
                scene.postUpdate.removeEventListener(updateCamera);
                if (handler) {
                    handler.destroy();
                    handler = undefined;
                }
                if (!isFollowing && viewer && viewer.camera) {
                    viewer.camera.lookAtTransform(Matrix4.IDENTITY);
                }
            };
        };

        setupCameraListener();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            // Call the cleanup function if it was assigned (i.e. if setup completed)
            if (listenerCleanup) listenerCleanup();
        };
    }, [isFollowing]);

    return (
        <div className="w-full h-full bg-black/40 relative overflow-hidden rounded-xl border border-white/5 shadow-inner group">
            <Viewer
                ref={viewerRef}
                full
                timeline={false}
                animation={false}
                shouldAnimate={true}
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
                {/* Tracked Target (Point) */}
                <Entity
                    name="Prométhée Drone"
                    position={positionProperty}
                    description="Target Drone Unit"
                >
                    <PointGraphics pixelSize={15} color={Color.CYAN} outlineColor={Color.WHITE} outlineWidth={2} />
                </Entity>

                {/* Visual 3D Drone Model */}
                <Entity
                    position={positionProperty}
                    orientation={visualOrientationProperty}
                >
                    <ModelGraphics
                        uri="/CesiumDrone.glb"
                        minimumPixelSize={128}
                        maximumScale={20000}
                        scale={1.0}
                        runAnimations={true}
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
