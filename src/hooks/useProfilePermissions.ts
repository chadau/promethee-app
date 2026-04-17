// ──────────────────────────────────────────────
// PROMÉTHÉE — useProfilePermissions Hook
// ──────────────────────────────────────────────

import { useMemo } from 'react';
import { useOperatorProfileStore } from '../store/useOperatorProfileStore';
import { useWidgetRegistryStore } from '../store/useWidgetRegistryStore';

export function useProfilePermissions() {
    const activeProfile = useOperatorProfileStore((s) => {
        const { profiles, activeProfileId } = s;
        return profiles.find((p) => p.id === activeProfileId);
    });

    const allWidgets = useWidgetRegistryStore((s) => s.widgets);

    const allowedWidgetIds = useMemo(
        () => new Set(activeProfile?.allowedWidgetIds ?? []),
        [activeProfile?.allowedWidgetIds],
    );

    const allowedWidgets = useMemo(
        () => allWidgets.filter((w) => allowedWidgetIds.has(w.id)),
        [allWidgets, allowedWidgetIds],
    );

    const canEditDashboard = (dashboardId: string): boolean => {
        if (!activeProfile) return false;
        if (activeProfile.role === 'admin') return true;
        const perm = activeProfile.permissions.find(
            (p) => p.dashboardId === dashboardId,
        );
        return perm?.canEdit ?? false;
    };

    const canViewDashboard = (dashboardId: string): boolean => {
        if (!activeProfile) return false;
        if (activeProfile.role === 'admin') return true;
        const perm = activeProfile.permissions.find(
            (p) => p.dashboardId === dashboardId,
        );
        return perm?.canView ?? false;
    };

    const canAddWidget = (widgetId: string): boolean => {
        return allowedWidgetIds.has(widgetId);
    };

    const isAdmin = activeProfile?.role === 'admin';

    return {
        activeProfile,
        allowedWidgets,
        allowedWidgetIds,
        canEditDashboard,
        canViewDashboard,
        canAddWidget,
        isAdmin,
    };
}
