// ──────────────────────────────────────────────
// PROMÉTHÉE — Dashboard Layout Store
// ──────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DashboardLayout, WidgetPlacement } from '../types/dashboard';
import { mockDashboardService } from '../services/mockDashboardService';

interface DashboardLayoutState {
    dashboards: DashboardLayout[];
    activeDashboardId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    loadDashboards: () => Promise<void>;
    setActiveDashboard: (id: string) => void;
    createDashboard: (name: string, description?: string) => Promise<DashboardLayout>;
    renameDashboard: (id: string, name: string) => Promise<void>;
    updateWidgets: (id: string, widgets: WidgetPlacement[]) => Promise<void>;
    duplicateDashboard: (id: string) => Promise<DashboardLayout>;
    deleteDashboard: (id: string) => Promise<void>;
    resetToDefault: (id: string) => Promise<void>;
}

export const useDashboardLayoutStore = create<DashboardLayoutState>()(
    persist(
        (set, get) => ({
            dashboards: [],
            activeDashboardId: null,
            isLoading: false,
            error: null,

            loadDashboards: async () => {
                set({ isLoading: true, error: null });
                try {
                    const dashboards = await mockDashboardService.getDashboards();
                    const currentActive = get().activeDashboardId;
                    set({
                        dashboards,
                        activeDashboardId:
                            currentActive && dashboards.some((d) => d.id === currentActive)
                                ? currentActive
                                : dashboards[0]?.id ?? null,
                        isLoading: false,
                    });
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Failed to load dashboards',
                        isLoading: false,
                    });
                }
            },

            setActiveDashboard: (id) => {
                set({ activeDashboardId: id });
            },

            createDashboard: async (name, description = '') => {
                set({ isLoading: true, error: null });
                try {
                    const now = new Date().toISOString();
                    const newDashboard: DashboardLayout = {
                        id: `dash-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
                        name,
                        description,
                        widgets: [],
                        columns: 12,
                        cellHeight: 70,
                        createdAt: now,
                        updatedAt: now,
                    };
                    const saved = await mockDashboardService.saveDashboard(newDashboard);
                    set((state) => ({
                        dashboards: [...state.dashboards, saved],
                        activeDashboardId: saved.id,
                        isLoading: false,
                    }));
                    return saved;
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Failed to create dashboard',
                        isLoading: false,
                    });
                    throw err;
                }
            },

            renameDashboard: async (id, name) => {
                const dashboard = get().dashboards.find((d) => d.id === id);
                if (!dashboard) return;
                const updated = { ...dashboard, name, updatedAt: new Date().toISOString() };
                await mockDashboardService.saveDashboard(updated);
                set((state) => ({
                    dashboards: state.dashboards.map((d) => (d.id === id ? updated : d)),
                }));
            },

            updateWidgets: async (id, widgets) => {
                const dashboard = get().dashboards.find((d) => d.id === id);
                if (!dashboard) return;
                const updated = { ...dashboard, widgets, updatedAt: new Date().toISOString() };
                await mockDashboardService.saveDashboard(updated);
                set((state) => ({
                    dashboards: state.dashboards.map((d) => (d.id === id ? updated : d)),
                }));
            },

            duplicateDashboard: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const duplicate = await mockDashboardService.duplicateDashboard(id);
                    set((state) => ({
                        dashboards: [...state.dashboards, duplicate],
                        isLoading: false,
                    }));
                    return duplicate;
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Failed to duplicate dashboard',
                        isLoading: false,
                    });
                    throw err;
                }
            },

            deleteDashboard: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    await mockDashboardService.deleteDashboard(id);
                    set((state) => {
                        const dashboards = state.dashboards.filter((d) => d.id !== id);
                        return {
                            dashboards,
                            activeDashboardId:
                                state.activeDashboardId === id
                                    ? (dashboards[0]?.id ?? null)
                                    : state.activeDashboardId,
                            isLoading: false,
                        };
                    });
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Failed to delete dashboard',
                        isLoading: false,
                    });
                }
            },

            resetToDefault: async (id) => {
                const defaults = mockDashboardService.getDefaultDashboards();
                const defaultLayout = defaults.find((d) => d.id === id);
                if (!defaultLayout) return;
                const updated = { ...defaultLayout, updatedAt: new Date().toISOString() };
                await mockDashboardService.saveDashboard(updated);
                set((state) => ({
                    dashboards: state.dashboards.map((d) => (d.id === id ? updated : d)),
                }));
            },
        }),
        {
            name: 'promethee-dashboard-layout',
            partialize: (state) => ({
                activeDashboardId: state.activeDashboardId,
            }),
        },
    ),
);
