// ──────────────────────────────────────────────
// PROMÉTHÉE — LayoutSwitcher
// ──────────────────────────────────────────────
// Horizontal tabs to switch between dashboards.

import React from 'react';
import { Star, Copy, Trash2, Plus } from 'lucide-react';
import { useDashboardActions } from '../../hooks/useDashboardActions';
import { useUiEditorStore } from '../../store/useUiEditorStore';
import clsx from 'clsx';

export const LayoutSwitcher: React.FC = () => {
    const {
        dashboards,
        activeDashboard,
        setActiveDashboard,
        createDashboard,
        duplicateDashboard,
        deleteDashboard,
    } = useDashboardActions();

    const isEditMode = useUiEditorStore((s) => s.isEditMode);

    const handleCreate = async () => {
        const name = `Dashboard ${dashboards.length + 1}`;
        await createDashboard(name);
    };

    return (
        <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto scrollbar-thin">
            {dashboards.map((dash) => {
                const isActive = dash.id === activeDashboard?.id;

                return (
                    <div
                        key={dash.id}
                        className={clsx(
                            'group relative flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 shrink-0',
                            isActive
                                ? 'bg-neon-cyan/10 text-neon-cyan ring-1 ring-neon-cyan/30 shadow-[0_0_10px_rgba(0,191,255,0.15)]'
                                : 'text-[#A1A8B3] hover:bg-white/5 hover:text-white',
                        )}
                        onClick={() => setActiveDashboard(dash.id)}
                    >
                        {/* Default badge */}
                        {dash.isDefault && (
                            <Star
                                size={12}
                                className={clsx(
                                    'shrink-0',
                                    isActive ? 'text-solar-amber' : 'text-solar-amber/50',
                                )}
                                fill={isActive ? '#FFB347' : 'transparent'}
                            />
                        )}

                        <span className="text-xs font-semibold truncate max-w-[120px]">
                            {dash.name}
                        </span>

                        {/* Actions (visible on hover in edit mode) */}
                        {isEditMode && (
                            <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        duplicateDashboard(dash.id);
                                    }}
                                    className="p-1 rounded hover:bg-white/10 text-[#6B7280] hover:text-white transition-colors"
                                    title="Dupliquer"
                                >
                                    <Copy size={11} />
                                </button>
                                {!dash.isDefault && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteDashboard(dash.id);
                                        }}
                                        className="p-1 rounded hover:bg-alert-red/20 text-[#6B7280] hover:text-alert-red transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={11} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Create new dashboard */}
            {isEditMode && (
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#6B7280] hover:text-neon-cyan hover:bg-neon-cyan/5 transition-all duration-200 shrink-0 border border-dashed border-white/10 hover:border-neon-cyan/30"
                    title="Nouveau dashboard"
                >
                    <Plus size={14} />
                    <span className="hidden sm:inline">Nouveau</span>
                </button>
            )}
        </div>
    );
};
