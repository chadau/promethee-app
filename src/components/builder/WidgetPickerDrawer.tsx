// ──────────────────────────────────────────────
// PROMÉTHÉE — WidgetPickerDrawer
// ──────────────────────────────────────────────
// Slide-in drawer to browse and add widgets.

import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Lock } from 'lucide-react';
import { useWidgetRegistryStore } from '../../store/useWidgetRegistryStore';
import { useUiEditorStore } from '../../store/useUiEditorStore';
import { useDashboardActions } from '../../hooks/useDashboardActions';
import { useProfilePermissions } from '../../hooks/useProfilePermissions';
import type { WidgetCategory, WidgetDefinition } from '../../types/dashboard';
import clsx from 'clsx';

const CATEGORY_LABELS: Record<WidgetCategory, string> = {
    telemetry: 'Télémétrie',
    control: 'Contrôle',
    map: 'Carte',
    video: 'Vidéo',
    system: 'Système',
};

const CATEGORY_COLORS: Record<WidgetCategory, string> = {
    telemetry: 'bg-neon-cyan/10 text-neon-cyan',
    control: 'bg-solar-amber/10 text-solar-amber',
    map: 'bg-tech-green/10 text-tech-green',
    video: 'bg-purple-500/10 text-purple-400',
    system: 'bg-white/5 text-[#A1A8B3]',
};

export const WidgetPickerDrawer: React.FC = () => {
    const closeWidgetPicker = useUiEditorStore((s) => s.closeWidgetPicker);
    const allWidgets = useWidgetRegistryStore((s) => s.widgets);
    const { addWidgetToDashboard } = useDashboardActions();
    const { canAddWidget } = useProfilePermissions();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<WidgetCategory | 'all'>('all');

    const categories = useMemo(() => {
        const cats = new Set(allWidgets.map((w) => w.category));
        return Array.from(cats) as WidgetCategory[];
    }, [allWidgets]);

    const filteredWidgets = useMemo(() => {
        let result = allWidgets;

        if (activeCategory !== 'all') {
            result = result.filter((w) => w.category === activeCategory);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (w) =>
                    w.name.toLowerCase().includes(q) ||
                    w.description.toLowerCase().includes(q),
            );
        }

        return result;
    }, [allWidgets, activeCategory, searchQuery]);

    const handleAdd = async (widget: WidgetDefinition) => {
        if (!canAddWidget(widget.id)) return;
        await addWidgetToDashboard(widget.id);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={closeWidgetPicker}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 z-50 w-[380px] max-w-[90vw] bg-[#12171C] border-l border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <h2 className="text-sm font-semibold text-[#E6EAF0] uppercase tracking-wider">
                        Ajouter un Widget
                    </h2>
                    <button
                        onClick={closeWidgetPicker}
                        className="p-2 rounded-xl hover:bg-white/5 text-[#6B7280] hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-5 py-3">
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher un widget..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F12] border border-white/10 rounded-xl text-xs text-[#E6EAF0] placeholder:text-[#6B7280] focus:outline-none focus:border-neon-cyan/40 focus:shadow-[0_0_10px_rgba(0,191,255,0.1)] transition-all"
                        />
                    </div>
                </div>

                {/* Category filters */}
                <div className="flex items-center gap-1.5 px-5 pb-3 overflow-x-auto">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={clsx(
                            'px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all shrink-0',
                            activeCategory === 'all'
                                ? 'bg-neon-cyan/10 text-neon-cyan ring-1 ring-neon-cyan/30'
                                : 'text-[#6B7280] hover:text-white hover:bg-white/5',
                        )}
                    >
                        Tous
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={clsx(
                                'px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all shrink-0',
                                activeCategory === cat
                                    ? CATEGORY_COLORS[cat]
                                    : 'text-[#6B7280] hover:text-white hover:bg-white/5',
                            )}
                        >
                            {CATEGORY_LABELS[cat]}
                        </button>
                    ))}
                </div>

                {/* Widget list */}
                <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">
                    {filteredWidgets.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <span className="text-xs text-[#6B7280]">Aucun widget trouvé</span>
                        </div>
                    ) : (
                        filteredWidgets.map((widget) => {
                            const allowed = canAddWidget(widget.id);
                            return (
                                <div
                                    key={widget.id}
                                    className={clsx(
                                        'group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200',
                                        allowed
                                            ? 'border-white/5 hover:border-neon-cyan/20 hover:bg-white/[0.02] cursor-pointer'
                                            : 'border-white/5 opacity-50 cursor-not-allowed',
                                    )}
                                    onClick={() => allowed && handleAdd(widget)}
                                >
                                    {/* Category badge */}
                                    <div className={clsx(
                                        'shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-xs',
                                        CATEGORY_COLORS[widget.category],
                                    )}>
                                        {widget.category === 'telemetry' ? '📊' :
                                            widget.category === 'control' ? '🎮' :
                                                widget.category === 'map' ? '🌍' :
                                                    widget.category === 'video' ? '📹' : '⚙️'}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-[#E6EAF0]">
                                                {widget.name}
                                            </span>
                                            {!allowed && <Lock size={10} className="text-[#6B7280]" />}
                                        </div>
                                        <p className="text-[10px] text-[#6B7280] mt-0.5 line-clamp-2">
                                            {widget.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={clsx(
                                                'text-[9px] px-1.5 py-0.5 rounded font-medium uppercase',
                                                CATEGORY_COLORS[widget.category],
                                            )}>
                                                {CATEGORY_LABELS[widget.category]}
                                            </span>
                                            <span className="text-[9px] text-[#6B7280] font-mono">
                                                {widget.defaultW}×{widget.defaultH}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Add button */}
                                    {allowed && (
                                        <button className="shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 transition-all">
                                            <Plus size={14} />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
};
