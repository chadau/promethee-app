// ──────────────────────────────────────────────
// PROMÉTHÉE — DashboardCanvas
// ──────────────────────────────────────────────
// Main dashboard view. Replaces the static Dashboard.tsx.
// Renders the active dashboard via GridStackContainer.

import React, { useEffect } from 'react';
import { useDashboardLayoutStore } from '../../store/useDashboardLayoutStore';
import { useUiEditorStore } from '../../store/useUiEditorStore';
import { useDashboardActions } from '../../hooks/useDashboardActions';
import { GridStackContainer } from './GridStackContainer';
import { WidgetToolbar } from './WidgetToolbar';
import { LayoutSwitcher } from './LayoutSwitcher';
import { WidgetPickerDrawer } from '../builder/WidgetPickerDrawer';
import { LayoutSettingsModal } from '../builder/LayoutSettingsModal';
import clsx from 'clsx';

export const DashboardCanvas: React.FC = () => {
    const loadDashboards = useDashboardLayoutStore((s) => s.loadDashboards);
    const isLoading = useDashboardLayoutStore((s) => s.isLoading);
    const error = useDashboardLayoutStore((s) => s.error);
    const isEditMode = useUiEditorStore((s) => s.isEditMode);
    const isWidgetPickerOpen = useUiEditorStore((s) => s.isWidgetPickerOpen);
    const isSettingsModalOpen = useUiEditorStore((s) => s.isSettingsModalOpen);

    const { activeDashboard, removeWidgetFromDashboard } = useDashboardActions();

    // Load dashboards on mount
    useEffect(() => {
        loadDashboards();
    }, [loadDashboards]);

    // ── Loading state ─────────────────────────────
    if (isLoading && !activeDashboard) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
                    <span className="text-sm text-[#A1A8B3] font-medium">Chargement des dashboards...</span>
                </div>
            </div>
        );
    }

    // ── Error state ───────────────────────────────
    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl bg-dark-panel border border-alert-red/20">
                    <span className="text-sm text-alert-red font-medium">Erreur</span>
                    <span className="text-xs text-[#A1A8B3]">{error}</span>
                </div>
            </div>
        );
    }

    // ── No dashboard ──────────────────────────────
    if (!activeDashboard) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <span className="text-sm text-[#6B7280]">Aucun dashboard disponible.</span>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Layout switcher bar */}
            <div className={clsx(
                'shrink-0 bg-[#0E1419]/60 backdrop-blur-sm border-b border-white/5 rounded-t-xl',
                isEditMode && 'ring-1 ring-neon-cyan/10',
            )}>
                <LayoutSwitcher />
            </div>

            {/* Edit mode toolbar */}
            <WidgetToolbar />

            {/* GridStack area */}
            <div className="flex-1 overflow-auto relative">
                <GridStackContainer
                    key={activeDashboard.id}
                    dashboardId={activeDashboard.id}
                    widgets={activeDashboard.widgets}
                    columns={activeDashboard.columns}
                    cellHeight={activeDashboard.cellHeight}
                    onRemoveWidget={removeWidgetFromDashboard}
                />

                {/* Edit mode visual indicator */}
                {isEditMode && (
                    <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-neon-cyan/15 rounded-xl z-10" />
                )}
            </div>

            {/* Widget picker drawer */}
            {isWidgetPickerOpen && <WidgetPickerDrawer />}

            {/* Layout settings modal */}
            {isSettingsModalOpen && <LayoutSettingsModal />}
        </div>
    );
};
