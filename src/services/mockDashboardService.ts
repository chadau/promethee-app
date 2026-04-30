// ──────────────────────────────────────────────
// PROMÉTHÉE — Mock Dashboard Service
// ──────────────────────────────────────────────
// All persistence via localStorage. Replace this file with real API calls later.

import type {
    DashboardLayout,
    OperatorProfile,
    WidgetPlacement,
} from '../types/dashboard';
import { fetchWithAuth } from '../utils/apiClient';

// ── Constants ────────────────────────────────
const STORAGE_KEY_DASHBOARDS = 'promethee_dashboards';
const STORAGE_KEY_PROFILES = 'promethee_profiles';
const SIMULATE_ERRORS = false; // Toggle for dev testing
const LATENCY_MIN = 150;
const LATENCY_MAX = 400;

// ── Helpers ──────────────────────────────────
const delay = (ms?: number) =>
    new Promise((resolve) =>
        setTimeout(resolve, ms ?? Math.random() * (LATENCY_MAX - LATENCY_MIN) + LATENCY_MIN),
    );

const uuid = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const maybeThrow = () => {
    if (SIMULATE_ERRORS && Math.random() < 0.05) {
        throw new Error('Mock service: simulated network error');
    }
};

// ── localStorage wrapper ─────────────────────
function readStorage<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

function writeStorage<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
}

// ── Default data ─────────────────────────────
// Mirrors the current static Dashboard.tsx layout
const DEFAULT_PILOT_WIDGETS: WidgetPlacement[] = [
    { instanceId: 'inst-map', widgetId: 'globe', x: 0, y: 0, w: 5, h: 13 },
    { instanceId: 'inst-video', widgetId: 'video-feed', x: 5, y: 0, w: 4, h: 13 },
    { instanceId: 'inst-altitude', widgetId: 'altitude', x: 9, y: 0, w: 3, h: 3 },
    { instanceId: 'inst-speed', widgetId: 'speed', x: 9, y: 3, w: 3, h: 3 },
    { instanceId: 'inst-battery', widgetId: 'battery', x: 9, y: 6, w: 3, h: 3 },
    { instanceId: 'inst-manual', widgetId: 'manual-control', x: 3, y: 13, w: 3, h: 4 },
    { instanceId: 'inst-logs', widgetId: 'system-logs', x: 9, y: 9, w: 3, h: 4 },
    { instanceId: 'inst-instr', widgetId: 'flight-instruments', x: 0, y: 13, w: 3, h: 4 },
    { instanceId: 'inst-controls', widgetId: 'flight-controls', x: 6, y: 13, w: 3, h: 4 },
];

const DEFAULT_DASHBOARDS: DashboardLayout[] = [
    {
        id: 'dash-pilot-default',
        name: 'Pilote — Vue principale',
        description: 'Dashboard par défaut pour les pilotes avec carte, vidéo et télémétrie.',
        widgets: DEFAULT_PILOT_WIDGETS,
        columns: 12,
        cellHeight: 70,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        isDefault: true,
    },
    {
        id: 'dash-supervision',
        name: 'Supervision',
        description: 'Vue de supervision avec les logs système et la télémétrie.',
        widgets: [
            { instanceId: 'inst-s-map', widgetId: 'globe', x: 0, y: 0, w: 8, h: 10 },
            { instanceId: 'inst-s-alt', widgetId: 'altitude', x: 8, y: 0, w: 4, h: 3 },
            { instanceId: 'inst-s-speed', widgetId: 'speed', x: 8, y: 3, w: 4, h: 3 },
            { instanceId: 'inst-s-battery', widgetId: 'battery', x: 8, y: 6, w: 4, h: 3 },
            { instanceId: 'inst-s-logs', widgetId: 'system-logs', x: 0, y: 10, w: 12, h: 4 },
        ],
        columns: 12,
        cellHeight: 70,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
    },
    {
        id: 'dash-mission',
        name: 'Mission Planning',
        description: 'Vue centrée sur la carte et le contrôle de vol.',
        widgets: [
            { instanceId: 'inst-m-map', widgetId: 'globe', x: 0, y: 0, w: 9, h: 12 },
            { instanceId: 'inst-m-controls', widgetId: 'flight-controls', x: 9, y: 0, w: 3, h: 6 },
            { instanceId: 'inst-m-instr', widgetId: 'flight-instruments', x: 9, y: 6, w: 3, h: 6 },
            { instanceId: 'inst-m-logs', widgetId: 'system-logs', x: 0, y: 12, w: 12, h: 3 },
        ],
        columns: 12,
        cellHeight: 70,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
    },
];

const DEFAULT_PROFILES: OperatorProfile[] = [
    {
        id: 'profile-pilot',
        name: 'Pilote',
        role: 'pilot',
        description: 'Opérateur de vol en charge du pilotage et du contrôle direct du drone.',
        avatarColor: '#00BFFF',
        dashboardIds: ['dash-pilot-default'],
        defaultDashboardId: 'dash-pilot-default',
        allowedWidgetIds: [
            'globe', 'video-feed', 'altitude', 'speed', 'battery',
            'manual-control', 'flight-instruments', 'flight-controls', 'system-logs',
        ],
        permissions: [
            { dashboardId: 'dash-pilot-default', canView: true, canEdit: true },
        ],
    },
    {
        id: 'profile-mission',
        name: 'Mission',
        role: 'mission',
        description: 'Planificateur de mission. Prépare les waypoints et les paramètres de vol.',
        avatarColor: '#FFB347',
        dashboardIds: ['dash-mission'],
        defaultDashboardId: 'dash-mission',
        allowedWidgetIds: [
            'globe', 'flight-controls', 'flight-instruments', 'system-logs',
        ],
        permissions: [
            { dashboardId: 'dash-mission', canView: true, canEdit: true },
        ],
    },
    {
        id: 'profile-supervision',
        name: 'Supervision',
        role: 'supervision',
        description: 'Superviseur de flotte. Surveille la télémétrie et les événements système.',
        avatarColor: '#34E0A1',
        dashboardIds: ['dash-supervision'],
        defaultDashboardId: 'dash-supervision',
        allowedWidgetIds: [
            'globe', 'altitude', 'speed', 'battery', 'system-logs',
        ],
        permissions: [
            { dashboardId: 'dash-supervision', canView: true, canEdit: false },
        ],
    },
    {
        id: 'profile-admin',
        name: 'Admin',
        role: 'admin',
        description: 'Administrateur système. Accès complet à toutes les fonctionnalités.',
        avatarColor: '#FF5E5E',
        dashboardIds: ['dash-pilot-default', 'dash-supervision', 'dash-mission'],
        defaultDashboardId: 'dash-pilot-default',
        allowedWidgetIds: [
            'globe', 'video-feed', 'altitude', 'speed', 'battery',
            'manual-control', 'flight-instruments', 'flight-controls', 'system-logs',
        ],
        permissions: [
            { dashboardId: 'dash-pilot-default', canView: true, canEdit: true },
            { dashboardId: 'dash-supervision', canView: true, canEdit: true },
            { dashboardId: 'dash-mission', canView: true, canEdit: true },
        ],
    },
];

// ── Initialization ───────────────────────────
function ensureDefaults(): void {
    if (!localStorage.getItem(STORAGE_KEY_DASHBOARDS)) {
        writeStorage(STORAGE_KEY_DASHBOARDS, DEFAULT_DASHBOARDS);
    }
    if (!localStorage.getItem(STORAGE_KEY_PROFILES)) {
        writeStorage(STORAGE_KEY_PROFILES, DEFAULT_PROFILES);
    }
}

// ── Service API ──────────────────────────────
const API_BASE = 'http://localhost:8080/api/v1';

export const mockDashboardService = {
    // ── Dashboards ──
    async getDashboards(): Promise<DashboardLayout[]> {
        const res = await fetchWithAuth(`${API_BASE}/dashboards`);
        if (!res.ok) {
            throw new Error('Failed to fetch dashboards');
        }
        return res.json();
    },

    async getDashboard(id: string): Promise<DashboardLayout> {
        if (!id) throw new Error('Dashboard ID is required');
        const res = await fetchWithAuth(`${API_BASE}/dashboards/${id}`);
        if (!res.ok) throw new Error(`Dashboard not found: ${id}`);
        return res.json();
    },

    async saveDashboard(layout: DashboardLayout): Promise<DashboardLayout> {
        // IDs generated by backend are MongoDB ObjectIDs (24 hex chars)
        // Default local IDs start with 'dash-'
        const isNew = !layout.id || layout.id === '';

        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? `${API_BASE}/dashboards` : `${API_BASE}/dashboards/${layout.id}`;

        const payload: any = { ...layout };
        if (isNew) {
            // Avoid sending local/empty IDs when creating so backend can generate it
            delete payload.id;
        }

        const res = await fetchWithAuth(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`Failed to save dashboard: ${res.statusText}`);
        }

        if (!isNew && res.status === 204) {
            return layout; // 204 No Content signifies successful update with no JSON response.
        }

        return res.json();
    },

    async duplicateDashboard(id: string): Promise<DashboardLayout> {
        // Fetch source and modify name + instanceIds
        const source = await this.getDashboard(id);

        const duplicate: any = {
            ...source,
            name: `${source.name} (copie)`,
            isDefault: false,
            widgets: source.widgets.map((w) => ({
                ...w,
                instanceId: `inst-${uuid()}`,
            })),
        };

        // Remove the source ID so backend generates an ID upon POST
        delete duplicate.id;

        const res = await fetchWithAuth(`${API_BASE}/dashboards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(duplicate)
        });

        if (!res.ok) {
            throw new Error(`Failed to duplicate dashboard: ${res.statusText}`);
        }
        return res.json();
    },

    async deleteDashboard(id: string): Promise<void> {
        const res = await fetchWithAuth(`${API_BASE}/dashboards/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok && res.status !== 404) {
            throw new Error(`Failed to delete dashboard: ${id}`);
        }

        // Also remove from profiles locally (mock behavior kept for profiles)
        ensureDefaults();
        const profiles = readStorage<OperatorProfile[]>(STORAGE_KEY_PROFILES, []);
        const updatedProfiles = profiles.map((p) => ({
            ...p,
            dashboardIds: p.dashboardIds.filter((did) => did !== id),
            defaultDashboardId: p.defaultDashboardId === id
                ? (p.dashboardIds.find((did) => did !== id) ?? '')
                : p.defaultDashboardId,
            permissions: p.permissions.filter((perm) => perm.dashboardId !== id),
        }));
        writeStorage(STORAGE_KEY_PROFILES, updatedProfiles);
    },

    // ── Profiles ──
    async getProfiles(): Promise<OperatorProfile[]> {
        ensureDefaults();
        await delay();
        maybeThrow();
        return readStorage<OperatorProfile[]>(STORAGE_KEY_PROFILES, []);
    },

    async saveProfile(profile: OperatorProfile): Promise<OperatorProfile> {
        ensureDefaults();
        await delay();
        maybeThrow();
        const all = readStorage<OperatorProfile[]>(STORAGE_KEY_PROFILES, []);
        const idx = all.findIndex((p) => p.id === profile.id);

        if (idx >= 0) {
            all[idx] = profile;
        } else {
            all.push(profile);
        }

        writeStorage(STORAGE_KEY_PROFILES, all);
        return profile;
    },

    async assignDashboardToProfile(
        profileId: string,
        dashboardId: string,
    ): Promise<void> {
        ensureDefaults();
        await delay();
        maybeThrow();
        const all = readStorage<OperatorProfile[]>(STORAGE_KEY_PROFILES, []);
        const profile = all.find((p) => p.id === profileId);
        if (!profile) throw new Error(`Profile not found: ${profileId}`);

        if (!profile.dashboardIds.includes(dashboardId)) {
            profile.dashboardIds.push(dashboardId);
            profile.permissions.push({
                dashboardId,
                canView: true,
                canEdit: profile.role === 'admin',
            });
        }

        writeStorage(STORAGE_KEY_PROFILES, all);
    },

    async removeDashboardFromProfile(
        profileId: string,
        dashboardId: string,
    ): Promise<void> {
        ensureDefaults();
        await delay();
        maybeThrow();
        const all = readStorage<OperatorProfile[]>(STORAGE_KEY_PROFILES, []);
        const profile = all.find((p) => p.id === profileId);
        if (!profile) throw new Error(`Profile not found: ${profileId}`);

        profile.dashboardIds = profile.dashboardIds.filter((id) => id !== dashboardId);
        profile.permissions = profile.permissions.filter(
            (p) => p.dashboardId !== dashboardId,
        );
        if (profile.defaultDashboardId === dashboardId) {
            profile.defaultDashboardId = profile.dashboardIds[0] ?? '';
        }

        writeStorage(STORAGE_KEY_PROFILES, all);
    },

    // ── Utility ──
    getDefaultDashboards(): DashboardLayout[] {
        return structuredClone(DEFAULT_DASHBOARDS);
    },

    getDefaultProfiles(): OperatorProfile[] {
        return structuredClone(DEFAULT_PROFILES);
    },

    resetAllData(): void {
        localStorage.removeItem(STORAGE_KEY_DASHBOARDS);
        localStorage.removeItem(STORAGE_KEY_PROFILES);
        ensureDefaults();
    },
};
