
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TerminalLoaderProps {
    onComplete: () => void;
}

const lines = [
    "INITIALIZING PROMETHEE CORE...",
    "ESTABLISHING SECURE CONNECTION...",
    "VERIFYING OPERATOR CREDENTIALS...",
    "LOADING TACTICAL INTERFACE...",
    "ACCESS GRANTED."
];

export const TerminalLoader: React.FC<TerminalLoaderProps> = ({ onComplete }) => {
    const [currentLineIndex, setCurrentLineIndex] = useState(0);

    useEffect(() => {
        if (currentLineIndex < lines.length) {
            const timeout = setTimeout(() => {
                setCurrentLineIndex(prev => prev + 1);
            }, 600); // Speed of each line appearing
            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                onComplete();
            }, 800);
            return () => clearTimeout(timeout);
        }
    }, [currentLineIndex, onComplete]);

    return (
        <motion.div
            className="fixed inset-0 bg-[#0B0F12] flex items-center justify-center z-50 font-mono text-[#00BFFF]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="w-full max-w-2xl p-8">
                <div className="flex flex-col space-y-2">
                    {lines.slice(0, currentLineIndex + 1).map((line, index) => (
                        <motion.div
                            key={index}
                            className="whitespace-nowrap"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="text-[#34E0A1] mr-2">root@promethee:~#</span>
                            {line}
                            {index === currentLineIndex && index < lines.length && (
                                <span className="animate-pulse">_</span>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 h-1 w-full bg-[#1A1F24] rounded overflow-hidden">
                    <motion.div
                        className="h-full bg-[#00BFFF]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${Math.min(((currentLineIndex + 1) / lines.length) * 100, 100)}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>
        </motion.div>
    );
};
