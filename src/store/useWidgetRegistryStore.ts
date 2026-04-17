// ──────────────────────────────────────────────
// PROMÉTHÉE — Widget Registry Store
// ──────────────────────────────────────────────
// Static registry of all available widget types.
// This store doesn't need persistence — it's code-defined.

import { create } from 'zustand';
import type { WidgetCategory, WidgetDefinition } from '../types/dashboard';

// ── All known widgets ────────────────────────
const ALL_WIDGETS: WidgetDefinition[] = [
    {
        id: 'globe',
        name: 'Carte 3D',
        description: 'Vue satellite Cesium avec trajectoire et waypoints.',
        category: 'map',
        icon: 'Globe',
        defaultW: 5,
        defaultH: 13,
        minW: 5,
        minH: 4,
        isHeavy: true,
    },
    {
        id: 'video-feed',
        name: 'Flux Vidéo',
        description: 'Flux vidéo en direct depuis la caméra du drone.',
        category: 'video',
        icon: 'Video',
        defaultW: 4,
        defaultH: 13,
        minW: 3,
        minH: 3,
        isHeavy: true,
    },
    {
        id: 'altitude',
        name: 'Altitude',
        description: 'Indicateur d\'altitude en temps réel avec jauge.',
        category: 'telemetry',
        icon: 'Mountain',
        defaultW: 3,
        defaultH: 3,
        minW: 2,
    },
    {
        id: 'speed',
        name: 'Vitesse',
        description: 'Indicateur de vitesse sol et vitesse air.',
        category: 'telemetry',
        icon: 'Gauge',
        defaultW: 3,
        defaultH: 3,
        minW: 2,
    },
    {
        id: 'battery',
        name: 'Batterie',
        description: 'Niveau de batterie et tension avec alertes.',
        category: 'telemetry',
        icon: 'Battery',
        defaultW: 3,
        defaultH: 3,
        minW: 2,
    },
    {
        id: 'manual-control',
        name: 'Contrôle Manuel',
        description: 'Joystick virtuel pour le pilotage direct.',
        category: 'control',
        icon: 'Joystick',
        defaultW: 3,
        defaultH: 4,
        minW: 2,
    },
    {
        id: 'system-logs',
        name: 'Logs Système',
        description: 'Console de logs MAVLink et événements système.',
        category: 'system',
        icon: 'Terminal',
        defaultW: 3,
        defaultH: 4,
        minW: 2,
        minH: 2,
    },
    {
        id: 'flight-instruments',
        name: 'Instruments de Vol',
        description: 'Horizon artificiel, compas et instruments primaires.',
        category: 'control',
        icon: 'Compass',
        defaultW: 3,
        defaultH: 4,
        minW: 2,
        minH: 2,
    },
    {
        id: 'flight-controls',
        name: 'Commandes de Vol',
        description: 'Panneau de commandes : arm, mode, takeoff, land.',
        category: 'control',
        icon: 'ToggleRight',
        defaultW: 3,
        defaultH: 4,
        minW: 2,
        minH: 2,
    },
];

// ── Store ────────────────────────────────────
interface WidgetRegistryState {
    widgets: WidgetDefinition[];
    getByCategory: (category: WidgetCategory) => WidgetDefinition[];
    getById: (id: string) => WidgetDefinition | undefined;
    searchWidgets: (query: string) => WidgetDefinition[];
    getCategories: () => WidgetCategory[];
}

export const useWidgetRegistryStore = create<WidgetRegistryState>()((_, get) => ({
    widgets: ALL_WIDGETS,

    getByCategory: (category) =>
        get().widgets.filter((w) => w.category === category),

    getById: (id) =>
        get().widgets.find((w) => w.id === id),

    searchWidgets: (query) => {
        const q = query.toLowerCase().trim();
        if (!q) return get().widgets;
        return get().widgets.filter(
            (w) =>
                w.name.toLowerCase().includes(q) ||
                w.description.toLowerCase().includes(q) ||
                w.category.toLowerCase().includes(q),
        );
    },

    getCategories: () => {
        const cats = new Set(get().widgets.map((w) => w.category));
        return Array.from(cats);
    },
}));
