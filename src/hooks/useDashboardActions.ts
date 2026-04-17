// ──────────────────────────────────────────────
// PROMÉTHÉE — useDashboardActions Hook
// ──────────────────────────────────────────────
// High-level actions composing store operations.

import { useCallback } from 'react';
import { useDashboardLayoutStore } from '../store/useDashboardLayoutStore';
import { useUiEditorStore } from '../store/useUiEditorStore';
import { useWidgetRegistryStore } from '../store/useWidgetRegistryStore';
import type { WidgetPlacement } from '../types/dashboard';

export function useDashboardActions() {
    const {
        dashboards,
        activeDashboardId,
        createDashboard,
        renameDashboard,
        updateWidgets,
        duplicateDashboard,
        deleteDashboard,
        resetToDefault,
        setActiveDashboard,
    } = useDashboardLayoutStore();

    const { setEditMode, closeWidgetPicker } = useUiEditorStore();
    const getById = useWidgetRegistryStore((s) => s.getById);

    const activeDashboard = dashboards.find((d) => d.id === activeDashboardId);

    /** Add a widget to the active dashboard by widget definition ID. */
    const addWidgetToDashboard = useCallback(
        async (widgetId: string) => {
            if (!activeDashboard) return;
            const def = getById(widgetId);
            if (!def) return;

            const instanceId = `inst-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

            const newPlacement: WidgetPlacement = {
                instanceId,
                widgetId,
                x: 0,
                y: 999, // GridStack will auto-place at the bottom
                w: def.defaultW,
                h: def.defaultH,
            };

            const updatedWidgets = [...activeDashboard.widgets, newPlacement];
            await updateWidgets(activeDashboard.id, updatedWidgets);
        },
        [activeDashboard, getById, updateWidgets],
    );

    /** Remove a widget instance from the active dashboard. */
    const removeWidgetFromDashboard = useCallback(
        async (instanceId: string) => {
            if (!activeDashboard) return;
            const updatedWidgets = activeDashboard.widgets.filter(
                (w) => w.instanceId !== instanceId,
            );
            await updateWidgets(activeDashboard.id, updatedWidgets);
        },
        [activeDashboard, updateWidgets],
    );

    /** Save and exit edit mode. */
    const saveAndExit = useCallback(() => {
        setEditMode(false);
        closeWidgetPicker();
    }, [setEditMode, closeWidgetPicker]);

    return {
        activeDashboard,
        dashboards,
        createDashboard,
        renameDashboard,
        duplicateDashboard,
        deleteDashboard,
        resetToDefault,
        setActiveDashboard,
        addWidgetToDashboard,
        removeWidgetFromDashboard,
        saveAndExit,
    };
}
