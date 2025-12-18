import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

interface VoiceAssistantContextType {
    isSpeaking: boolean;
    playGreeting: () => Promise<void>;
    playArmed: () => Promise<void>;
    audioAnalyser: AnalyserNode | null;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export const VoiceAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    // Initialize Audio Context
    useEffect(() => {
        const initAudio = () => {
            // Lazy initialization
        };

        // We avoid closing the context on unmount to prevent race conditions in React StrictMode
        return () => {
            // No-op cleanup for AudioContext to keep it persistent
        };
    }, []);

    const playAudioFile = useCallback(async (path: string) => {
        try {
            // Ensure context exists and is running
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 64;
                analyserRef.current.connect(audioContextRef.current.destination);
            }

            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            // Stop previous instance if any
            if (sourceRef.current) {
                try {
                    sourceRef.current.stop();
                    sourceRef.current.disconnect();
                } catch (e) { /* ignore */ }
            }

            setIsSpeaking(true);

            // In a real app we might cache these buffers
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Failed to load audio: ${path}`);

            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;

            // Connect source to analyser
            if (analyserRef.current) {
                source.connect(analyserRef.current);
            }

            source.onended = () => {
                setIsSpeaking(false);
            };

            source.start(0);
            sourceRef.current = source;
        } catch (error) {
            console.error(`Error playing audio (${path}):`, error);
            setIsSpeaking(false);
        }
    }, []);

    const playGreeting = useCallback(() => playAudioFile('/src/assets/audio/welcome.mp3'), [playAudioFile]);
    const playArmed = useCallback(() => playAudioFile('/src/assets/audio/armed.mp3'), [playAudioFile]);

    return (
        <VoiceAssistantContext.Provider value={{ isSpeaking, playGreeting, playArmed, audioAnalyser: analyserRef.current }}>
            {children}
        </VoiceAssistantContext.Provider>
    );
};

export const useVoiceAssistant = () => {
    const context = useContext(VoiceAssistantContext);
    if (context === undefined) {
        throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
    }
    return context;
};
