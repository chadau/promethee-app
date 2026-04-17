// ──────────────────────────────────────────────
// PROMÉTHÉE — Dashboard Builder Types
// ──────────────────────────────────────────────

/**
 * Widget category for filtering in the WidgetPickerDrawer.
 */
export type WidgetCategory = 'telemetry' | 'control' | 'map' | 'video' | 'system';

/**
 * A registered widget type from the widget registry.
 * Describes WHAT a widget is (not where it's placed).
 */
export interface WidgetDefinition {
    id: string;                    // Unique key, e.g. 'altitude', 'globe'
    name: string;                  // Human-readable display name
    description: string;           // Short description
    category: WidgetCategory;
    icon: string;                  // lucide-react icon name
    defaultW: number;              // GridStack default column-span
    defaultH: number;              // GridStack default row-span
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    isHeavy?: boolean;             // If true, component is lazy-loaded
}

/**
 * A placed widget instance on a specific dashboard.
 * Captures the layout position and size.
 */
export interface WidgetPlacement {
    instanceId: string;            // Unique per placement (uuid-like)
    widgetId: string;              // References WidgetDefinition.id
    x: number;
    y: number;
    w: number;
    h: number;
}

/**
 * A complete dashboard layout definition.
 */
export interface DashboardLayout {
    id: string;
    name: string;
    description: string;
    widgets: WidgetPlacement[];
    columns: number;               // GridStack column count (default 12)
    cellHeight: number;            // GridStack cell height in px
    createdAt: string;             // ISO 8601
    updatedAt: string;             // ISO 8601
    isDefault?: boolean;           // Marked as the default for its profile
}

/**
 * Operator profile roles.
 */
export type ProfileRole = 'pilot' | 'mission' | 'supervision' | 'admin';

/**
 * Per-dashboard permissions granted to a profile.
 */
export interface DashboardPermission {
    dashboardId: string;
    canView: boolean;
    canEdit: boolean;
}

/**
 * An operator profile that defines what dashboards and widgets
 * a user with this role can access.
 */
export interface OperatorProfile {
    id: string;
    name: string;
    role: ProfileRole;
    description: string;
    avatarColor: string;           // Hex color for UI avatar
    dashboardIds: string[];        // Assigned dashboard layout IDs
    defaultDashboardId: string;    // Which dashboard loads first
    allowedWidgetIds: string[];    // Which widget types are accessible
    permissions: DashboardPermission[];
}

/**
 * Transient editor state for a widget being manipulated.
 */
export interface EditableWidgetState {
    instanceId: string;
    isSelected: boolean;
    isDragging: boolean;
    isResizing: boolean;
}
