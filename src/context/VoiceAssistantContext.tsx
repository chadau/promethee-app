import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Howl, Howler } from 'howler';

interface VoiceAssistantState {
    isSpeaking: boolean;
    audioAnalyser: AnalyserNode | null;
}

interface VoiceAssistantActions {
    playGreeting: () => Promise<void>;
    playArmed: () => Promise<void>;
    playHomeReturn: () => Promise<void>;
    playTakeoff: () => Promise<void>;
    playCameraActivated: () => Promise<void>;
    playCameraDeactivated: () => Promise<void>;
}

const VoiceAssistantStateContext = createContext<VoiceAssistantState | undefined>(undefined);
const VoiceAssistantActionsContext = createContext<VoiceAssistantActions | undefined>(undefined);

export const VoiceAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const currentHowlRef = useRef<Howl | null>(null);

    // Initialize Global Audio Context via Howler
    useEffect(() => {
        // Force unlock audio on mobile/strict browsers
        Howler.autoUnlock = true;

        const ctx = Howler.ctx;
        if (ctx) {
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            Howler.masterGain.connect(analyser);
            analyserRef.current = analyser;
        }
    }, []);

    const playAudioFile = useCallback(async (path: string) => {
        if (currentHowlRef.current) {
            currentHowlRef.current.stop();
        }

        if (!analyserRef.current && Howler.ctx) {
            const analyser = Howler.ctx.createAnalyser();
            analyser.fftSize = 64;
            Howler.masterGain.connect(analyser);
            analyserRef.current = analyser;
        }

        const sound = new Howl({
            src: [path],
            html5: false,
            onplay: () => setIsSpeaking(true),
            onend: () => setIsSpeaking(false),
            onstop: () => setIsSpeaking(false),
            onloaderror: (_id, error) => {
                console.error(`Error loading audio ${path}:`, error);
                setIsSpeaking(false);
            },
            onplayerror: (_id, error) => {
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

    // Stable actions object
    const actions = React.useMemo(() => ({
        playGreeting,
        playArmed,
        playHomeReturn,
        playTakeoff,
        playCameraActivated,
        playCameraDeactivated
    }), [playGreeting, playArmed, playHomeReturn, playTakeoff, playCameraActivated, playCameraDeactivated]);

    // State object (changes when isSpeaking changes)
    const state = React.useMemo(() => ({
        isSpeaking,
        audioAnalyser: analyserRef.current
    }), [isSpeaking]);

    return (
        <VoiceAssistantActionsContext.Provider value={actions}>
            <VoiceAssistantStateContext.Provider value={state}>
                {children}
            </VoiceAssistantStateContext.Provider>
        </VoiceAssistantActionsContext.Provider>
    );
};

export const useVoiceAssistant = () => {
    const state = useContext(VoiceAssistantStateContext);
    const actions = useContext(VoiceAssistantActionsContext);

    if (state === undefined || actions === undefined) {
        throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
    }
    return { ...state, ...actions };
};

export const useVoiceActions = () => {
    const context = useContext(VoiceAssistantActionsContext);
    if (context === undefined) {
        throw new Error('useVoiceActions must be used within a VoiceAssistantProvider');
    }
    return context;
};
