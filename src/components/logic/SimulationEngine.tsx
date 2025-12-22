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
                }

                // Calculate Ground Speed (approximate based on input magnitude)
                // Pitch/Roll are 0-1. Max Speed is SPEED (50m/s).
                const inputMagnitude = Math.min(1.0, Math.sqrt(pitch * pitch + roll * roll));
                const groundSpeedMps = inputMagnitude * SPEED;
                const groundSpeedKmh = groundSpeedMps * 3.6;

                // Battery Logic
                // Base drain (avionics/computer): 0.05% per second
                // Motor drain: up to 0.5% per second at full throttle
                // Total max drain ~ 0.55% per sec -> ~3 mins flight time (simulation speed)
                // Real drone ~20 mins -> ~0.08% per sec average. 
                // Let's make it visible but realistic-ish: 12-15 mins flight.
                // Avionics: 0.01% per sec
                // Motors: 0.1% per sec at max

                const motorLoad = (Math.abs(throttle) + Math.abs(pitch) + Math.abs(roll) + Math.abs(yaw)) / 4;
                const batteryDrain = (0.01 + (motorLoad * 0.1)) * dt;

                const currentTelemetry = useFlightStore.getState().telemetry;
                let newBattery = currentTelemetry.battery - batteryDrain;
                if (newBattery < 0) newBattery = 0;

                // Update Telemetry (throttle update to avoid too many renders? maybe every 100ms? 
                // but we optimized selectors so it should be fine)
                // Only update if changed significantly
                const currentSpeed = currentTelemetry.speed;

                // Update if speed changed OR battery drop > 0.1 (visual update)
                // Actually battery needs to update frequently for decimal precision or just round it for UI
                // Storing imprecise float in store is fine.

                if (Math.abs(groundSpeedKmh - currentSpeed) > 0.1 || Math.abs(newBattery - currentTelemetry.battery) > 0.01) {
                    useFlightStore.getState().updateTelemetry({
                        speed: Math.round(groundSpeedKmh),
                        battery: newBattery
                    });
                }
            }

            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current!);
    }, []); // Empty dependency array? We use refs for everything.

    return null; // Headless
};


