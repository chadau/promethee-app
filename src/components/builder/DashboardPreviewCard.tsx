// ──────────────────────────────────────────────
// PROMÉTHÉE — DashboardPreviewCard
// ──────────────────────────────────────────────
// Miniature preview card showing dashboard layout as colored blocks.

import React from 'react';
import { Star, Clock } from 'lucide-react';
import type { DashboardLayout } from '../../types/dashboard';
import clsx from 'clsx';

interface DashboardPreviewCardProps {
    dashboard: DashboardLayout;
    isActive?: boolean;
    isDefault?: boolean;
    onClick?: () => void;
    onSetDefault?: () => void;
    className?: string;
}

// Widget color mapping by widgetId prefix
const WIDGET_COLORS: Record<string, string> = {
    'globe': '#00BFFF',
    'video-feed': '#8B5CF6',
    'altitude': '#34E0A1',
    'speed': '#FFB347',
    'battery': '#FF5E5E',
    'manual-control': '#FFB347',
    'system-logs': '#6B7280',
    'flight-instruments': '#00BFFF',
    'flight-controls': '#34E0A1',
};

export const DashboardPreviewCard: React.FC<DashboardPreviewCardProps> = ({
    dashboard,
    isActive = false,
    isDefault = false,
    onClick,
    onSetDefault,
    className,
}) => {
    const maxY = Math.max(...dashboard.widgets.map((w) => w.y + w.h), 1);

    return (
        <div
            onClick={onClick}
            className={clsx(
                'group relative rounded-xl border p-3 cursor-pointer transition-all duration-200',
                isActive
                    ? 'border-neon-cyan/30 bg-neon-cyan/5 shadow-[0_0_15px_rgba(0,191,255,0.1)]'
                    : 'border-white/5 bg-dark-panel hover:border-white/15 hover:bg-white/[0.02]',
                className,
            )}
        >
            {/* Mini grid preview */}
            <div
                className="relative w-full rounded-lg bg-[#0B0F12] overflow-hidden mb-3"
                style={{ aspectRatio: `${dashboard.columns} / ${Math.min(maxY, 10)}` }}
            >
                {dashboard.widgets.map((widget) => (
                    <div
                        key={widget.instanceId}
                        className="absolute rounded-sm transition-all"
                        style={{
                            left: `${(widget.x / dashboard.columns) * 100}%`,
                            top: `${(widget.y / maxY) * 100}%`,
                            width: `${(widget.w / dashboard.columns) * 100}%`,
                            height: `${(widget.h / maxY) * 100}%`,
                            backgroundColor: WIDGET_COLORS[widget.widgetId] ?? '#6B7280',
                            opacity: 0.35,
                            padding: '1px',
                        }}
                    >
                        <div
                            className="w-full h-full rounded-sm"
                            style={{
                                backgroundColor: WIDGET_COLORS[widget.widgetId] ?? '#6B7280',
                                opacity: 0.6,
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Info */}
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-semibold text-[#E6EAF0] truncate">
                            {dashboard.name}
                        </h3>
                        {isDefault && (
                            <Star size={11} className="text-solar-amber shrink-0" fill="#FFB347" />
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-[#6B7280] font-mono">
                            {dashboard.widgets.length} widgets
                        </span>
                        <span className="text-[9px] text-[#6B7280] flex items-center gap-0.5">
                            <Clock size={8} />
                            {new Date(dashboard.updatedAt).toLocaleDateString('fr-FR')}
                        </span>
                    </div>
                </div>

                {/* Default toggle */}
                {onSetDefault && !isDefault && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSetDefault();
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-solar-amber/10 text-[#6B7280] hover:text-solar-amber transition-all"
                        title="Définir par défaut"
                    >
                        <Star size={12} />
                    </button>
                )}
            </div>
        </div>
    );
};
