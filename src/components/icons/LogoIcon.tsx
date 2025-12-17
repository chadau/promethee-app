import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        viewBox="0 0 100 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <defs>
            <linearGradient id="logo-gradient" x1="50" y1="100%" x2="50" y2="0%" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#00BFFF" />
            </linearGradient>
        </defs>

        {/* Clean Vector Shape - No Glow */}
        <path
            d="M50 55 C50 45, 52 35, 65 30 C80 25, 95 15, 98 10 C92 12, 75 18, 60 22 C55 24, 52 28, 50 35 C48 28, 45 24, 40 22 C25 18, 8 12, 2 10 C5 15, 20 25, 35 30 C48 35, 50 45, 50 55 Z"
            fill="url(#logo-gradient)"
        />

        {/* Floating Core */}
        <ellipse cx="50" cy="18" rx="6" ry="2.5" fill="#00E5FF" />
    </svg>
);
