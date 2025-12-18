import React, { useEffect, useRef } from 'react';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';

export const VoiceVisualizer: React.FC = () => {
    const { isSpeaking, audioAnalyser } = useVoiceAssistant();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Visualizer config
        const barCount = 5;
        const gap = 4;
        const barWidth = 6; // Width of the dot/bar
        const maxBarHeight = 24;
        const minBarHeight = 6; // Diameter of the dot

        canvas.width = (barWidth + gap) * barCount;
        canvas.height = 30;

        const dataArray = new Uint8Array(audioAnalyser ? audioAnalyser.frequencyBinCount : 0);

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (isSpeaking && audioAnalyser) {
                audioAnalyser.getByteFrequencyData(dataArray);
            }

            // Draw 5 bars
            for (let i = 0; i < barCount; i++) {
                let intensity = 0;

                if (isSpeaking && audioAnalyser) {
                    // Sample the frequency data: evenly separate 5 chunks
                    const step = Math.floor(dataArray.length / barCount);
                    const index = i * step;
                    // Simple average or max of the chunk
                    intensity = dataArray[index] / 255;
                }

                // Calculate height: minHeight + intensity * (max - min)
                // If not speaking, intensity is 0 -> minHeight (dot)
                let currentHeight = minBarHeight + (intensity * (maxBarHeight - minBarHeight));

                const x = i * (barWidth + gap);
                const y = (canvas.height - currentHeight) / 2; // Center vertically

                // Styling
                ctx.fillStyle = '#00BFFF'; // Neon Cyan
                ctx.shadowBlur = isSpeaking ? (intensity * 10 + 2) : 0; // Glow only when active
                ctx.shadowColor = '#00BFFF';
                ctx.globalAlpha = isSpeaking ? 1 : 0.5; // Dimmer when idle

                // Draw rounded rect (pill shape)
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, currentHeight, 999);
                ctx.fill();
            }
        };

        draw();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isSpeaking, audioAnalyser]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                opacity: 1,
                // Adjust size if needed, but canvas pixel width is small now
                // We can let CSS scale it or keep it 1:1. 
                // Given "right side", keep it compact.
            }}
        />
    );
};
