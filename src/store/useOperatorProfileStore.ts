// ──────────────────────────────────────────────
// PROMÉTHÉE — Operator Profile Store
// ──────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OperatorProfile } from '../types/dashboard';
import { mockDashboardService } from '../services/mockDashboardService';

interface OperatorProfileState {
    profiles: OperatorProfile[];
    activeProfileId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    loadProfiles: () => Promise<void>;
    setActiveProfile: (id: string) => void;
    createProfile: (profile: Omit<OperatorProfile, 'id'>) => Promise<OperatorProfile>;
    updateProfile: (profile: OperatorProfile) => Promise<void>;
    deleteProfile: (id: string) => Promise<void>;
    assignDashboard: (profileId: string, dashboardId: string) => Promise<void>;
    removeDashboard: (profileId: string, dashboardId: string) => Promise<void>;
    setDefaultDashboard: (profileId: string, dashboardId: string) => void;

    // Selectors
    getActiveProfile: () => OperatorProfile | undefined;
    getAllowedWidgets: (profileId: string) => string[];
}

export const useOperatorProfileStore = create<OperatorProfileState>()(
    persist(
        (set, get) => ({
            profiles: [],
            activeProfileId: null,
            isLoading: false,
            error: null,

            loadProfiles: async () => {
                set({ isLoading: true, error: null });
                try {
                    const profiles = await mockDashboardService.getProfiles();
                    const currentActive = get().activeProfileId;
                    set({
                        profiles,
                        activeProfileId:
                            currentActive && profiles.some((p) => p.id === currentActive)
                                ? currentActive
                                : profiles[0]?.id ?? null,
                        isLoading: false,
                    });
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Failed to load profiles',
                        isLoading: false,
                    });
                }
            },

            setActiveProfile: (id) => {
                set({ activeProfileId: id });
            },

            createProfile: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const profile: OperatorProfile = {
                        ...data,
                        id: `profile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
                    };
                    const saved = await mockDashboardService.saveProfile(profile);
                    set((state) => ({
                        profiles: [...state.profiles, saved],
                        isLoading: false,
                    }));
                    return saved;
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Failed to create profile',
                        isLoading: false,
                    });
                    throw err;
                }
            },

            updateProfile: async (profile) => {
                try {
                    await mockDashboardService.saveProfile(profile);
                    set((state) => ({
                        profiles: state.profiles.map((p) =>
                            p.id === profile.id ? profile : p,
                        ),
                    }));
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Failed to update profile',
                    });
                }
            },

            deleteProfile: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    // Remove from storage - for mock we reload
                    const profiles = get().profiles.filter((p) => p.id !== id);
                    // Persist each remaining profile (mock doesn't have deleteProfile)
                    for (const p of profiles) {
                        await mockDashboardService.saveProfile(p);
                    }
                    set((state) => {
                        const remaining = state.profiles.filter((p) => p.id !== id);
                        return {
                            profiles: remaining,
                            activeProfileId:
                                state.activeProfileId === id
                                    ? (remaining[0]?.id ?? null)
                                    : state.activeProfileId,
                            isLoading: false,
                        };
                    });
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Failed to delete profile',
                        isLoading: false,
                    });
                }
            },

            assignDashboard: async (profileId, dashboardId) => {
                try {
                    await mockDashboardService.assignDashboardToProfile(profileId, dashboardId);
                    set((state) => ({
                        profiles: state.profiles.map((p) => {
                            if (p.id !== profileId) return p;
                            if (p.dashboardIds.includes(dashboardId)) return p;
                            return {
                                ...p,
                                dashboardIds: [...p.dashboardIds, dashboardId],
                                permissions: [
                                    ...p.permissions,
                                    { dashboardId, canView: true, canEdit: p.role === 'admin' },
                                ],
                            };
                        }),
                    }));
                } catch (err) {
                    set({
                        error:
                            err instanceof Error ? err.message : 'Failed to assign dashboard',
                    });
                }
            },

            removeDashboard: async (profileId, dashboardId) => {
                try {
                    await mockDashboardService.removeDashboardFromProfile(profileId, dashboardId);
                    set((state) => ({
                        profiles: state.profiles.map((p) => {
                            if (p.id !== profileId) return p;
                            const updatedIds = p.dashboardIds.filter((id) => id !== dashboardId);
                            return {
                                ...p,
                                dashboardIds: updatedIds,
                                permissions: p.permissions.filter(
                                    (perm) => perm.dashboardId !== dashboardId,
                                ),
                                defaultDashboardId:
                                    p.defaultDashboardId === dashboardId
                                        ? (updatedIds[0] ?? '')
                                        : p.defaultDashboardId,
                            };
                        }),
                    }));
                } catch (err) {
                    set({
                        error:
                            err instanceof Error ? err.message : 'Failed to remove dashboard',
                    });
                }
            },

            setDefaultDashboard: (profileId, dashboardId) => {
                set((state) => ({
                    profiles: state.profiles.map((p) =>
                        p.id === profileId ? { ...p, defaultDashboardId: dashboardId } : p,
                    ),
                }));
            },

            // Selectors
            getActiveProfile: () => {
                const { profiles, activeProfileId } = get();
                return profiles.find((p) => p.id === activeProfileId);
            },

            getAllowedWidgets: (profileId) => {
                const profile = get().profiles.find((p) => p.id === profileId);
                return profile?.allowedWidgetIds ?? [];
            },
        }),
        {
            name: 'promethee-operator-profiles',
            partialize: (state) => ({
                activeProfileId: state.activeProfileId,
            }),
        },
    ),
);
