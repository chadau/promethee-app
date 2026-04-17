// ──────────────────────────────────────────────
// PROMÉTHÉE — DashboardEditorPanel
// ──────────────────────────────────────────────
// Right-side editor panel for dashboard management (admin page).

import React, { useEffect, useState } from 'react';
import { Pencil, Copy, Trash2, Plus, RotateCcw } from 'lucide-react';
import { useDashboardLayoutStore } from '../../store/useDashboardLayoutStore';
import { useDashboardActions } from '../../hooks/useDashboardActions';
import { DashboardPreviewCard } from './DashboardPreviewCard';
import clsx from 'clsx';

export const DashboardEditorPanel: React.FC = () => {
    const loadDashboards = useDashboardLayoutStore((s) => s.loadDashboards);
    const {
        dashboards,
        activeDashboard,
        setActiveDashboard,
        createDashboard,
        renameDashboard,
        duplicateDashboard,
        deleteDashboard,
        resetToDefault,
    } = useDashboardActions();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        loadDashboards();
    }, [loadDashboards]);

    const handleCreate = async () => {
        await createDashboard(`Dashboard ${dashboards.length + 1}`);
    };

    const startRename = (id: string, currentName: string) => {
        setEditingId(id);
        setEditName(currentName);
    };

    const confirmRename = async () => {
        if (editingId && editName.trim()) {
            await renameDashboard(editingId, editName.trim());
            setEditingId(null);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#12171C] rounded-xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="text-sm font-semibold text-[#E6EAF0] uppercase tracking-wider">
                    Dashboards
                </h2>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 ring-1 ring-neon-cyan/30 transition-all"
                >
                    <Plus size={14} />
                    Créer
                </button>
            </div>

            {/* Dashboard list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {dashboards.map((dash) => {
                    const isActive = dash.id === activeDashboard?.id;
                    const isEditing = editingId === dash.id;

                    return (
                        <div key={dash.id} className="space-y-2">
                            <DashboardPreviewCard
                                dashboard={dash}
                                isActive={isActive}
                                isDefault={dash.isDefault}
                                onClick={() => setActiveDashboard(dash.id)}
                            />

                            {/* Action bar */}
                            {isActive && (
                                <div className="flex items-center gap-1 pl-1">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
                                                onBlur={confirmRename}
                                                autoFocus
                                                className="flex-1 px-3 py-1.5 bg-[#0B0F12] border border-neon-cyan/30 rounded-lg text-xs text-[#E6EAF0] focus:outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => startRename(dash.id, dash.name)}
                                                className="p-1.5 rounded-lg text-[#6B7280] hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all"
                                                title="Renommer"
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                onClick={() => duplicateDashboard(dash.id)}
                                                className="p-1.5 rounded-lg text-[#6B7280] hover:text-white hover:bg-white/5 transition-all"
                                                title="Dupliquer"
                                            >
                                                <Copy size={13} />
                                            </button>
                                            <button
                                                onClick={() => resetToDefault(dash.id)}
                                                className="p-1.5 rounded-lg text-[#6B7280] hover:text-solar-amber hover:bg-solar-amber/10 transition-all"
                                                title="Réinitialiser"
                                            >
                                                <RotateCcw size={13} />
                                            </button>
                                            {!dash.isDefault && (
                                                <button
                                                    onClick={() => deleteDashboard(dash.id)}
                                                    className={clsx(
                                                        'p-1.5 rounded-lg text-[#6B7280] hover:text-alert-red hover:bg-alert-red/10 transition-all ml-auto',
                                                    )}
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
