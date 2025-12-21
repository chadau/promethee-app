import React, { useEffect, useRef } from 'react';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';

export const VoiceVisualizer: React.FC = () => {
    const { isSpeaking, audioAnalyser } = useVoiceAssistant();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);

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

            // Draw 5 bars with symmetric modulation (Center = Low Freq/Bass, Edges = High Freq)
            for (let i = 0; i < barCount; i++) {
                let intensity = 0;

                if (isSpeaking && audioAnalyser) {
                    // We want 3 distinct frequency bands for 5 bars:
                    // Bar 2 (Center) -> Band 0 (Bass)
                    // Bars 1, 3 -> Band 1 (Mids)
                    // Bars 0, 4 -> Band 2 (Highs)

                    // Distance from center (0, 1, or 2)
                    const distFromCenter = Math.abs(i - 2);

                    // Simple logic: mapping distFromCenter to frequency chunks
                    // 0 -> closest to 0Hz (Bass)
                    // 2 -> higher freq

                    const step = Math.floor(dataArray.length / 3); // Divide spectrum into 3 bands
                    const dataIndex = distFromCenter * step;

                    // Average a small chunk around the dataIndex to make it smoother
                    const value = dataArray[dataIndex];
                    intensity = value / 255;
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
