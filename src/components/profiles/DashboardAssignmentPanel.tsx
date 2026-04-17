// ──────────────────────────────────────────────
// PROMÉTHÉE — DashboardAssignmentPanel
// ──────────────────────────────────────────────
// Assign dashboards to a profile. Set default. Preview.

import React, { useEffect } from 'react';
import { Check, Star, Eye } from 'lucide-react';
import { useOperatorProfileStore } from '../../store/useOperatorProfileStore';
import { useDashboardLayoutStore } from '../../store/useDashboardLayoutStore';
import { useUiEditorStore } from '../../store/useUiEditorStore';
import { DashboardPreviewCard } from '../builder/DashboardPreviewCard';
import clsx from 'clsx';

export const DashboardAssignmentPanel: React.FC = () => {
    const profiles = useOperatorProfileStore((s) => s.profiles);
    const activeProfileId = useOperatorProfileStore((s) => s.activeProfileId);
    const assignDashboard = useOperatorProfileStore((s) => s.assignDashboard);
    const removeDashboard = useOperatorProfileStore((s) => s.removeDashboard);
    const setDefaultDashboard = useOperatorProfileStore((s) => s.setDefaultDashboard);

    const dashboards = useDashboardLayoutStore((s) => s.dashboards);
    const loadDashboards = useDashboardLayoutStore((s) => s.loadDashboards);

    const setPreviewDashboard = useUiEditorStore((s) => s.setPreviewDashboard);
    const previewDashboardId = useUiEditorStore((s) => s.previewDashboardId);

    const activeProfile = profiles.find((p) => p.id === activeProfileId);

    useEffect(() => {
        loadDashboards();
    }, [loadDashboards]);

    if (!activeProfile) {
        return (
            <div className="h-full flex items-center justify-center bg-[#12171C] rounded-xl border border-white/5">
                <span className="text-xs text-[#6B7280]">Sélectionnez un profil pour gérer les dashboards</span>
            </div>
        );
    }

    const isAssigned = (dashId: string) =>
        activeProfile.dashboardIds.includes(dashId);

    const isDefault = (dashId: string) =>
        activeProfile.defaultDashboardId === dashId;

    const handleToggle = async (dashId: string) => {
        if (isAssigned(dashId)) {
            await removeDashboard(activeProfile.id, dashId);
        } else {
            await assignDashboard(activeProfile.id, dashId);
        }
    };

    const handleSetDefault = (dashId: string) => {
        if (!isAssigned(dashId)) return;
        setDefaultDashboard(activeProfile.id, dashId);
    };

    return (
        <div className="h-full flex flex-col bg-[#12171C] rounded-xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div>
                    <h2 className="text-sm font-semibold text-[#E6EAF0] uppercase tracking-wider">
                        Dashboards du Profil
                    </h2>
                    <span className="text-[10px] text-[#6B7280] mt-0.5 block">
                        {activeProfile.name} — {activeProfile.dashboardIds.length} assigné{activeProfile.dashboardIds.length > 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Dashboard grid */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {dashboards.map((dash) => {
                        const assigned = isAssigned(dash.id);
                        const isDef = isDefault(dash.id);
                        const isPreviewing = previewDashboardId === dash.id;

                        return (
                            <div
                                key={dash.id}
                                className={clsx(
                                    'relative rounded-xl border transition-all duration-200',
                                    assigned
                                        ? 'border-neon-cyan/20 bg-neon-cyan/[0.02]'
                                        : 'border-white/5 opacity-60 hover:opacity-100',
                                )}
                            >
                                <DashboardPreviewCard
                                    dashboard={dash}
                                    isActive={isPreviewing}
                                    isDefault={isDef}
                                    onClick={() => handleToggle(dash.id)}
                                />

                                {/* Action overlay */}
                                <div className="absolute top-2 right-2 flex items-center gap-1">
                                    {/* Assigned check */}
                                    <div
                                        className={clsx(
                                            'w-6 h-6 rounded-lg flex items-center justify-center transition-all',
                                            assigned
                                                ? 'bg-tech-green/15 text-tech-green'
                                                : 'bg-white/5 text-[#6B7280]',
                                        )}
                                    >
                                        <Check size={12} strokeWidth={assigned ? 3 : 1.5} />
                                    </div>

                                    {/* Default star */}
                                    {assigned && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSetDefault(dash.id);
                                            }}
                                            className={clsx(
                                                'w-6 h-6 rounded-lg flex items-center justify-center transition-all',
                                                isDef
                                                    ? 'bg-solar-amber/15 text-solar-amber'
                                                    : 'bg-white/5 text-[#6B7280] hover:text-solar-amber hover:bg-solar-amber/10',
                                            )}
                                            title={isDef ? 'Dashboard par défaut' : 'Définir par défaut'}
                                        >
                                            <Star size={12} fill={isDef ? '#FFB347' : 'transparent'} />
                                        </button>
                                    )}

                                    {/* Preview */}
                                    {assigned && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewDashboard(isPreviewing ? null : dash.id);
                                            }}
                                            className={clsx(
                                                'w-6 h-6 rounded-lg flex items-center justify-center transition-all',
                                                isPreviewing
                                                    ? 'bg-neon-cyan/15 text-neon-cyan'
                                                    : 'bg-white/5 text-[#6B7280] hover:text-neon-cyan hover:bg-neon-cyan/10',
                                            )}
                                            title="Prévisualiser"
                                        >
                                            <Eye size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
