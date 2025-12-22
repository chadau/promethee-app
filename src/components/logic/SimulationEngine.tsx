import React, { useEffect, useRef } from 'react';
import { useFlightStore } from '../../store/useFlightStore';
import { Math as CesiumMath } from 'cesium';

export const SimulationEngine: React.FC = () => {
    // Direct store access via ref to avoid closure staleness in animation loop
    // But Zustand state is external. We can use the subscription or just getState() if we had access.
    // However, hooks provide the current value. Ref pattern helps avoiding dependency array resets.

    // We can use the transient update pattern or references
    const isArmed = useFlightStore(state => state.isArmed);
    const controlInput = useFlightStore(state => state.controlInput);
    const position = useFlightStore(state => state.position);

    // Refs for mutable state in the loop
    const stateRef = useRef({
        isArmed,
        controlInput,
        position,
        lastTime: performance.now()
    });

    // Keep refs synced with store updates
    useEffect(() => {
        stateRef.current.isArmed = isArmed;
        stateRef.current.controlInput = controlInput;
        // We only sync position IN if we aren't the ones updating it? 
        // Actually, for a simulation, we are the source of truth for position changes usually.
        // But if we use store position as base.
        stateRef.current.position = position;
    }, [isArmed, controlInput, position]);

    const requestRef = useRef<number>();
    const updatePosition = useFlightStore(state => state.updatePosition);

    useEffect(() => {
        const loop = (time: number) => {
            const dt = (time - stateRef.current.lastTime) / 1000;
            stateRef.current.lastTime = time;

            if (stateRef.current.isArmed) {
                const { controlInput, position } = stateRef.current;

                // Physics Constants
                const SPEED = 50.0; // meters per second max speed
                const ROTATION_SPEED = 90.0; // degrees per second
                const CLIMB_SPEED = 10.0; // meters per second

                // Deadzone already applied in widget, but safe to check
                const { pitch, roll, yaw, throttle } = controlInput;

                let newLat = position.lat;
                let newLon = position.lon;
                let newAlt = position.alt;
                let newHeading = position.heading;

                // 1. Heading (Yaw) -> Right Stick X
                if (Math.abs(yaw) > 0.05) {
                    newHeading += yaw * ROTATION_SPEED * dt;
                    // Normalize 0-360
                    if (newHeading >= 360) newHeading -= 360;
                    if (newHeading < 0) newHeading += 360;
                }

                // 2. Altitude (Throttle) -> Right Stick Y
                if (Math.abs(throttle) > 0.05) {
                    newAlt += throttle * CLIMB_SPEED * dt;
                    if (newAlt < 0) newAlt = 0; // Ground clamp
                }

                // 3. Movement (Pitch/Roll) -> Left Stick
                // Pitch (Forward/Back) -> Left Stick Y (Up=+1, Down=-1)
                // Roll (Left/Right) -> Left Stick X

                if (Math.abs(pitch) > 0.05 || Math.abs(roll) > 0.05) {
                    // Calculate velocity vector based on heading
                    // Heading 0 = North. 
                    const headingRad = CesiumMath.toRadians(newHeading);
                    const cosH = Math.cos(headingRad);
                    const sinH = Math.sin(headingRad);

                    // Forward vector (Pitch)
                    // Pitch > 0 (Stick Up) should effectively be "Forward" -> Move North if heading 0?
                    // Usually Stick Up = Pitch Down (Nose Down) = Forward.
                    // ManualControlWidget: pitch = -paramLeftY. Stick Up (negative Y axis) -> paramLeftY < 0 -> pitch > 0.
                    // So Pitch > 0 = Forward.

                    const fwdX = sinH * pitch * SPEED * dt; // East component
                    const fwdY = cosH * pitch * SPEED * dt; // North component

                    // Strafe vector (Roll)
                    // Roll > 0 (Right Stick Right) -> Strafe Right.
                    // Right vector is Heading + 90 deg
                    const strafeX = Math.cos(headingRad) * roll * SPEED * dt;
                    const strafeY = -Math.sin(headingRad) * roll * SPEED * dt;

                    // Wait, Math check:
                    // North (0 deg): sin=0, cos=1. Fwd = (0, pitch). Correct (Latitude increases).
                    // Right vector for North (East): (1, 0).
                    // cos(0) = 1. -sin(0) = 0. Strafe = (roll, 0). Correct (Longitude increases).

                    // Meters to Degrees roughly (at equator/Paris)
                    // 1 deg Lat ~= 111km = 111000m
                    const metersToLat = 1 / 111111;
                    const metersToLon = 1 / (111111 * Math.cos(CesiumMath.toRadians(newLat)));

                    newLat += (fwdY + strafeY) * metersToLat;
                    newLon += (fwdX + strafeX) * metersToLon;
                }

                // Update store if changed
                if (newLat !== position.lat || newLon !== position.lon || newAlt !== position.alt || newHeading !== position.heading) {
                    updatePosition({
                        lat: newLat,
                        lon: newLon,
                        alt: newAlt,
                        heading: newHeading
                    });

                    // Update ref immediately to prevent stutter in next frame if store hasn't updated yet?
                    // No, store update is usually fast enough, strictly React might batch.
                    // Updating ref manually is risky if we deviate from store truth.
                    // But for smooth physics, we might want to keep local state accumulator?
                    // For now, let's rely on store info. 
                    // Actually, if we rely on store which updates async, we might get lag.
                    // Better to keep local position accumulator and sync only occasionally? 
                    // Or just assume 60FPS store updates are fine (Zustand is fast, transient updates are better).
                    // For a "Sim", updating store 60 times a second might trigger 60 re-renders of components subscribed.
                    // We optimized Globe and others to only listen to position.
                    // It should be fine.
                }
            }

            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current!);
    }, []); // Empty dependency array? We use refs for everything.

    return null; // Headless
};


