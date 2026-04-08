
import React, { useEffect, useRef, useState } from 'react';
import { Gamepad2, AlertCircle } from 'lucide-react';
import { useFlightStore } from '../../store/useFlightStore';

export const ManualControlWidget: React.FC = () => {
    // Stable selectors
    const isArmed = useFlightStore(state => state.isArmed);
    const setControlInput = useFlightStore(state => state.setControlInput);

    const [gamepadConnected, setGamepadConnected] = useState(false);

    // State for visual feedback of stick positions (x, y) from -1 to 1
    const [leftStick, setLeftStick] = useState({ x: 0, y: 0 }); // Direction (Roll, Pitch)
    const [rightStick, setRightStick] = useState({ x: 0, y: 0 }); // Altitude (Yaw, Throttle)

    // Refs for animation loop and previous values to avoid duplicate updates
    const requestRef = useRef<number | null>(null);
    const prevInputRef = useRef({ pitch: 0, roll: 0, yaw: 0, throttle: 0 });
    const prevLeftStickRef = useRef({ x: 0, y: 0 });
    const prevRightStickRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleGamepadConnected = () => setGamepadConnected(true);
        const handleGamepadDisconnected = () => setGamepadConnected(false);

        window.addEventListener("gamepadconnected", handleGamepadConnected);
        window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

        // Check if gamepad is already connected
        if (navigator.getGamepads()[0]) setGamepadConnected(true);

        return () => {
            window.removeEventListener("gamepadconnected", handleGamepadConnected);
            window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected);
        };
    }, []);

    const updateLoop = () => {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0]; // Use first gamepad

        if (gp) {
            // Apply deadzone
            const deadzone = 0.1;
            const applyDeadzone = (val: number) => (Math.abs(val) > deadzone ? val : 0);

            // Left Stick (Standard Mode 2: Throttle/Yaw, but here User requested Direction on Left)
            // Request: Left Joystick = Direction (Pitch/Roll)
            // Gamepad Mapping Usually: Left Stick Axis 0 (X), Axis 1 (Y)
            const paramLeftX = applyDeadzone(gp.axes[0]);
            const paramLeftY = applyDeadzone(gp.axes[1]);

            // Request: Right Joystick = Altitude (Throttle/Yaw)
            // Gamepad Mapping Usually: Right Stick Axis 2 (X), Axis 3 (Y)
            const paramRightX = applyDeadzone(gp.axes[2]);
            const paramRightY = applyDeadzone(gp.axes[3]);

            // Only update local state if values changed significantly (visual update)
            if (Math.abs(paramLeftX - prevLeftStickRef.current.x) > 0.01 || Math.abs(paramLeftY - prevLeftStickRef.current.y) > 0.01) {
                setLeftStick({ x: paramLeftX, y: paramLeftY });
                prevLeftStickRef.current = { x: paramLeftX, y: paramLeftY };
            }
            if (Math.abs(paramRightX - prevRightStickRef.current.x) > 0.01 || Math.abs(paramRightY - prevRightStickRef.current.y) > 0.01) {
                setRightStick({ x: paramRightX, y: paramRightY });
                prevRightStickRef.current = { x: paramRightX, y: paramRightY };
            }

            // Update Store
            // Mappings based on request:
            // Left (Direction) -> Roll (X) / Pitch (Y)
            // Right (Altitude) -> Yaw (X) / Throttle (Y - Inverted typically for throttle up)

            const newInput = {
                roll: paramLeftX,
                pitch: -paramLeftY, // Invert Y for standard pitch up/down logic usually
                yaw: paramRightX,
                throttle: (-paramRightY + 1) / 2 // Map -1..1 to 0..1 (Center 0.5)
            };

            // Check if input changed significantly to avoid store thrashing
            const prev = prevInputRef.current;
            if (
                Math.abs(newInput.roll - prev.roll) > 0.01 ||
                Math.abs(newInput.pitch - prev.pitch) > 0.01 ||
                Math.abs(newInput.yaw - prev.yaw) > 0.01 ||
                Math.abs(newInput.throttle - prev.throttle) > 0.01
            ) {
                setControlInput(newInput);
                prevInputRef.current = newInput;
            }
        }

        requestRef.current = requestAnimationFrame(updateLoop);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updateLoop);
        return () => cancelAnimationFrame(requestRef.current!);
    }, []);

    // Helper for visual joystick handle
    const JoystickHandle = ({ x, y }: { x: number, y: number }) => (
        <div
            className="absolute w-8 h-8 rounded-full bg-neon-cyan/20 border border-neon-cyan shadow-[0_0_15px_#00BFFF] backdrop-blur-sm transition-transform duration-75 ease-out flex items-center justify-center pointer-events-none"
            style={{
                transform: `translate(${x * 40}px, ${y * 40}px)`,
                left: 'calc(50% - 16px)',
                top: 'calc(50% - 16px)'
            }}
        >
            <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_5px_#fff]" />
        </div>
    );

    // We use Refs for synchronous tracking of drag state to avoid "stale closure" issues in event handlers
    const activeStickRef = useRef<'left' | 'right' | null>(null);

    // Revised Handler using Pointer Events
    const handlePointerDown = (e: React.PointerEvent, stick: 'left' | 'right') => {
        e.preventDefault(); // Prevent native drag/selection
        e.stopPropagation(); // Prevent GridStack drag

        e.currentTarget.setPointerCapture(e.pointerId);
        activeStickRef.current = stick;

        handlePointerMove(e, stick); // Process initial click to jump to pos
    };

    const handlePointerMove = (e: React.PointerEvent, stick: 'left' | 'right') => {
        // Only process if this stick is the one being dragged
        if (activeStickRef.current !== stick) return;

        e.preventDefault();
        e.stopPropagation();

        const container = e.currentTarget.getBoundingClientRect();
        const centerX = container.left + container.width / 2;
        const centerY = container.top + container.height / 2;
        const maxRadius = 40;

        let dx = e.clientX - centerX;
        let dy = e.clientY - centerY;

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > maxRadius) {
            const ratio = maxRadius / distance;
            dx *= ratio;
            dy *= ratio;
        }

        const normX = dx / maxRadius;
        const normY = dy / maxRadius;

        // Current state of sticks
        let lx = prevLeftStickRef.current.x;
        let ly = prevLeftStickRef.current.y;
        let rx = prevRightStickRef.current.x;
        let ry = prevRightStickRef.current.y;

        if (stick === 'left') {
            setLeftStick({ x: normX, y: normY });
            prevLeftStickRef.current = { x: normX, y: normY };
            lx = normX;
            ly = normY;
        } else {
            setRightStick({ x: normX, y: normY });
            prevRightStickRef.current = { x: normX, y: normY };
            rx = normX;
            ry = normY;
        }

        // Update Store
        setControlInput({
            roll: lx,
            pitch: -ly,
            yaw: rx,
            throttle: (-ry + 1) / 2 // Map -1..1 to 0..1
        });
    };

    const handlePointerUp = (e: React.PointerEvent, stick: 'left' | 'right') => {
        e.preventDefault();
        e.stopPropagation();

        if (activeStickRef.current === stick) {
            e.currentTarget.releasePointerCapture(e.pointerId);
            activeStickRef.current = null;

            // Reset to center
            let lx = prevLeftStickRef.current.x;
            let ly = prevLeftStickRef.current.y;
            let rx = prevRightStickRef.current.x;
            let ry = prevRightStickRef.current.y;

            if (stick === 'left') {
                setLeftStick({ x: 0, y: 0 });
                prevLeftStickRef.current = { x: 0, y: 0 };
                lx = 0;
                ly = 0;
            } else {
                setRightStick({ x: 0, y: 0 });
                prevRightStickRef.current = { x: 0, y: 0 };
                rx = 0;
                ry = 0;
            }

            // Update Store
            setControlInput({
                roll: lx,
                pitch: -ly,
                yaw: rx,
                throttle: (-ry + 1) / 2
            });
        }
    };


    return (
        <div className="h-full flex flex-col bg-[#1A1F24] rounded-xl overflow-hidden border border-white/5 shadow-lg relative"
            onMouseDown={(e) => e.stopPropagation()} // Stop propagation from main container too just in case
        >
            {/* Header */}
            <div className="h-8 px-3 flex items-center justify-between bg-[#13171B] border-b border-white/5">
                <div className="flex items-center gap-2 text-neon-cyan">
                    <Gamepad2 size={16} />
                    <span className="text-xs font-bold tracking-widest uppercase">Manual Control</span>
                </div>
                {!gamepadConnected && (
                    <div className="flex items-center gap-1 text-solar-amber text-[10px]">
                        <AlertCircle size={12} />
                        <span>NO CONTROLLER</span>
                    </div>
                )}
                {gamepadConnected && (
                    <div className="flex items-center gap-1 text-tech-green text-[10px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-tech-green shadow-[0_0_5px_currentColor] animate-pulse" />
                        <span>CONNECTED</span>
                    </div>
                )}
            </div>

            {/* Content - 2 Joysticks Side-by-Side */}
            <div className="flex-1 grid grid-cols-2 relative p-2 gap-2">
                {!isArmed && (
                    <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-muted-gray text-center p-2">
                        <span className="text-xs font-mono uppercase tracking-widest opacity-70">System Disarmed</span>
                    </div>
                )}

                {/* Left Joystick: Direction */}
                <div
                    className="relative rounded-lg bg-[#0E1419]/50 border border-white/5 flex flex-col items-center justify-center overflow-hidden touch-none cursor-crosshair active:cursor-grabbing"
                    onPointerDown={(e) => !isArmed ? null : handlePointerDown(e, 'left')}
                    onPointerMove={(e) => !isArmed ? null : handlePointerMove(e, 'left')}
                    onPointerUp={(e) => !isArmed ? null : handlePointerUp(e, 'left')}
                >
                    {/* Crosshair / Grid Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                            backgroundPosition: 'center center'
                        }}
                    />

                    {/* Center Marker */}
                    <div className="absolute w-full h-[1px] bg-white/10 pointer-events-none" />
                    <div className="absolute h-full w-[1px] bg-white/10 pointer-events-none" />

                    {/* Base Ring */}
                    <div className="w-24 h-24 rounded-full border border-white/10 absolute pointer-events-none" />

                    {/* Label */}
                    <span className="absolute bottom-1 right-2 text-[9px] text-muted-gray/50 font-mono pointer-events-none">DIRECTION</span>

                    {/* Stick */}
                    <JoystickHandle x={leftStick.x} y={leftStick.y} />
                </div>

                {/* Right Joystick: Altitude */}
                <div
                    className="relative rounded-lg bg-[#0E1419]/50 border border-white/5 flex flex-col items-center justify-center overflow-hidden touch-none cursor-crosshair active:cursor-grabbing"
                    onPointerDown={(e) => !isArmed ? null : handlePointerDown(e, 'right')}
                    onPointerMove={(e) => !isArmed ? null : handlePointerMove(e, 'right')}
                    onPointerUp={(e) => !isArmed ? null : handlePointerUp(e, 'right')}
                >
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                            backgroundPosition: 'center center'
                        }}
                    />
                    <div className="absolute w-full h-[1px] bg-white/10 pointer-events-none" />
                    <div className="absolute h-full w-[1px] bg-white/10 pointer-events-none" />
                    <div className="w-24 h-24 rounded-full border border-white/10 absolute pointer-events-none" />

                    <span className="absolute bottom-1 right-2 text-[9px] text-muted-gray/50 font-mono pointer-events-none">ALTITUDE</span>

                    <JoystickHandle x={rightStick.x} y={rightStick.y} />
                </div>
            </div>
        </div>
    );
};
