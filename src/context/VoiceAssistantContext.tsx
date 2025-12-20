import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Howl, Howler } from 'howler';

interface VoiceAssistantContextType {
    isSpeaking: boolean;
    playGreeting: () => Promise<void>;
    playArmed: () => Promise<void>;
    playHomeReturn: () => Promise<void>;
    playTakeoff: () => Promise<void>;
    playCameraActivated: () => Promise<void>;
    playCameraDeactivated: () => Promise<void>;
    audioAnalyser: AnalyserNode | null;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export const VoiceAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const currentHowlRef = useRef<Howl | null>(null);

    // Initialize Global Audio Context via Howler
    useEffect(() => {
        // Force unlock audio on mobile/strict browsers
        Howler.autoUnlock = true;

        // Initialize Analyser once global context is ready
        // We verify if context exists (it should with Howler default)
        const ctx = Howler.ctx;
        if (ctx) {
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;

            // Connect Howler's master gain to our analyser
            // Howler.masterGain -> Analyser -> Destination (implicit if we don't disconnect master from destination)
            // Actually Howler connects Main -> Destination. We just want to tap into it.
            // Howler masterGain is internal but we can assume it's exposed or we connect to destination?
            // "Howler.masterGain" is the gain node. 
            // Correct flow: Howler.masterGain.connect(analyser); 
            // Note: We don't need to connect analyser to destination unless we want to pass through (which we don't, it's a tap).

            Howler.masterGain.connect(analyser);
            analyserRef.current = analyser;
        }

        return () => {
            // Cleanup if needed
        };
    }, []);

    const playAudioFile = useCallback(async (path: string) => {
        // Stop currently playing sound if any
        if (currentHowlRef.current) {
            currentHowlRef.current.stop();
        }

        // Setup Analyser if it wasn't ready (sometimes ctx initializes late)
        if (!analyserRef.current && Howler.ctx) {
            const analyser = Howler.ctx.createAnalyser();
            analyser.fftSize = 64;
            Howler.masterGain.connect(analyser);
            analyserRef.current = analyser;
        }

        const sound = new Howl({
            src: [path],
            html5: false, // Must be false for Web Audio API (analyser) to work
            onplay: () => {
                setIsSpeaking(true);
            },
            onend: () => {
                setIsSpeaking(false);
            },
            onstop: () => {
                setIsSpeaking(false);
            },
            onloaderror: (id, error) => {
                console.error(`Error loading audio ${path}:`, error);
                setIsSpeaking(false);
            },
            onplayerror: (id, error) => {
                console.error(`Error playing audio ${path}:`, error);
                setIsSpeaking(false);
            }
        });

        currentHowlRef.current = sound;
        sound.play();
    }, []);

    const playGreeting = useCallback(() => playAudioFile('/src/assets/audio/welcome.mp3'), [playAudioFile]);
    const playArmed = useCallback(() => playAudioFile('/src/assets/audio/armed.mp3'), [playAudioFile]);
    const playHomeReturn = useCallback(() => playAudioFile('/src/assets/audio/home_return.mp3'), [playAudioFile]);
    const playTakeoff = useCallback(() => playAudioFile('/src/assets/audio/takeoff.mp3'), [playAudioFile]);
    const playCameraActivated = useCallback(() => playAudioFile('/src/assets/audio/camera_activated.mp3'), [playAudioFile]);
    const playCameraDeactivated = useCallback(() => playAudioFile('/src/assets/audio/camera_deactivated.mp3'), [playAudioFile]);

    return (
        <VoiceAssistantContext.Provider value={{
            isSpeaking,
            playGreeting,
            playArmed,
            playHomeReturn,
            playTakeoff,
            playCameraActivated,
            playCameraDeactivated,
            audioAnalyser: analyserRef.current
        }}>
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
