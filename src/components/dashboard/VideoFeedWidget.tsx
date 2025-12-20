import React, { useState, useEffect, useRef } from 'react';
import { VideoOff, Power, RefreshCw, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';

interface VideoFeedWidgetProps {
    className?: string;
}

export const VideoFeedWidget: React.FC<VideoFeedWidgetProps> = ({ className }) => {
    const [isStreamActive, setIsStreamActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { playCameraActivated, playCameraDeactivated } = useVoiceAssistant();

    // Mock connection to WebRTC (via local file)
    const toggleStream = async () => {
        if (isStreamActive) {
            // Stop stream
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.src = "";
            }
            setIsStreamActive(false);
            setError(null);
            playCameraDeactivated();
        } else {
            // Start stream (Mock)
            setIsLoading(true);
            setError(null);

            try {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (videoRef.current) {
                    // Use local video file as source
                    videoRef.current.src = "/videos/drone_feed.mp4";
                    videoRef.current.loop = true;
                    videoRef.current.muted = true; // Required for autoplay usually
                    await videoRef.current.play();
                    setIsStreamActive(true);
                    playCameraActivated();
                }
            } catch (err) {
                console.warn("Could not play video mock:", err);
                setError("SIGNAL SOURCE NOT FOUND");
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.src = "";
            }
        };
    }, []);

    return (
        <div className={clsx(
            "relative w-full h-full bg-dark-panel rounded-xl overflow-hidden border border-white/5 shadow-2xl flex flex-col",
            className
        )}>
            {/* Header / StatusBar Overlay */}
            <div className="absolute top-0 left-0 right-0 z-20 p-3 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className={clsx(
                        "w-2 h-2 rounded-full shadow-[0_0_8px]",
                        isStreamActive ? "bg-tech-green shadow-tech-green" : "bg-alert-red shadow-alert-red"
                    )} />
                    <span className="text-xs font-mono font-bold text-white tracking-wider">
                        {isStreamActive ? "LIVE FEED // DRONE-01" : "SIGNAL LOST"}
                    </span>
                </div>
                <div className="flex items-center gap-2 pointer-events-auto">
                    {/* Controls */}
                    <button
                        onClick={toggleStream}
                        disabled={isLoading}
                        className={clsx(
                            "p-1.5 rounded-lg transition-all backdrop-blur-md border border-white/10",
                            isStreamActive
                                ? "bg-alert-red/20 text-alert-red hover:bg-alert-red/40 border-alert-red/30"
                                : "bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/40 border-neon-cyan/30"
                        )}
                        title={isStreamActive ? "Cut Feed" : "Connect Stream"}
                    >
                        {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Power size={16} />}
                    </button>
                </div>
            </div>

            {/* Video Content */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                <video
                    ref={videoRef}
                    className={clsx("w-full h-full object-cover", !isStreamActive && "hidden")}
                    playsInline
                    muted
                />

                {!isStreamActive && (
                    /* No Signal State */
                    <div className="absolute inset-0 flex flex-col gap-4 items-center justify-center text-muted-gray bg-[#05070a] z-10">
                        {/* Static Noise Overlay (CSS pattern) */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }} />

                        {/* Animated Scanline */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-full w-full animate-scanline pointer-events-none" />

                        <div className="z-10 flex flex-col items-center">
                            {error ? (
                                <>
                                    <AlertTriangle size={48} className="text-alert-red mb-2 opacity-80" />
                                    <span className="text-alert-red font-mono text-sm tracking-widest">{error.toUpperCase()}</span>
                                </>
                            ) : (
                                <>
                                    <VideoOff size={48} className="text-white/20 mb-2" />
                                    <span className="font-mono text-xs tracking-[0.2em] text-white/40">WAITING FOR CONNECTION</span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* HUD Overlay (Always visible or only when active? Usually nice to have some persistent UI) */}
                <div className="absolute inset-4 border border-white/10 rounded-lg pointer-events-none z-10 flex flex-col justify-between">
                    <div className="flex justify-between p-2">
                        <span className="text-[10px] font-mono text-neon-cyan/60">REC: OFF</span>
                        <span className="text-[10px] font-mono text-neon-cyan/60">LAT: 48.8566 N</span>
                    </div>
                    <div className="flex justify-center items-center opacity-30">
                        {/* Crosshair */}
                        <div className="w-4 h-4 border border-neon-cyan rounded-full flex items-center justify-center">
                            <div className="w-0.5 h-0.5 bg-neon-cyan rounded-full" />
                        </div>
                    </div>
                    <div className="flex justify-between p-2">
                        <span className="text-[10px] font-mono text-neon-cyan/60">BAT: 87%</span>
                        <span className="text-[10px] font-mono text-neon-cyan/60">LON: 2.3522 E</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
