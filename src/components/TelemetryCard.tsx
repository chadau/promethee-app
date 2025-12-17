import React from 'react';
import clsx from 'clsx';

interface TelemetryCardProps {
    title: string;
    value: string | number;
    unit?: string;
    icon?: React.ElementType;
    className?: string;
    children?: React.ReactNode;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({ title, value, unit, icon: Icon, className, children }) => {
    return (
        <div className={clsx(
            "bg-dark-panel/60 backdrop-blur-md border border-white/5 rounded-xl p-4 shadow-lg hover:border-neon-cyan/30 transition-colors group",
            className
        )}>
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-muted-gray text-xs uppercase tracking-wider font-semibold">{title}</h3>
                {Icon && <Icon size={16} className="text-neon-cyan opacity-80 group-hover:drop-shadow-[0_0_8px_rgba(0,191,255,0.6)] transition-all" />}
            </div>

            {/* Main Value */}
            <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-mono font-bold text-white drop-shadow-sm">{value}</span>
                {unit && <span className="text-sm font-medium text-muted-gray">{unit}</span>}
            </div>

            {/* Extra Content (Graph, Bar, etc.) */}
            {children}
        </div>
    );
};
