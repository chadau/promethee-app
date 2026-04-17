// ──────────────────────────────────────────────
// PROMÉTHÉE — useGridStack Hook
// ──────────────────────────────────────────────
// Bridge between React and GridStack.
// Uses the same proven pattern as the original Dashboard.tsx:
// React renders static grid-stack-item children → GridStack.init() picks them up.

import { useEffect, useRef } from 'react';
import { GridStack } from 'gridstack';
import type { WidgetPlacement } from '../types/dashboard';
import { useDashboardLayoutStore } from '../store/useDashboardLayoutStore';
import { useUiEditorStore } from '../store/useUiEditorStore';

interface UseGridStackOptions {
    columns?: number;
    cellHeight?: number;
    dashboardId: string;
}

export function useGridStack({ columns = 12, cellHeight = 70, dashboardId }: UseGridStackOptions) {
    const gridRef = useRef<GridStack | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInternalUpdateRef = useRef(false);
    const dashboardIdRef = useRef(dashboardId);
    dashboardIdRef.current = dashboardId;

    const updateWidgets = useDashboardLayoutStore((s) => s.updateWidgets);
    const isEditMode = useUiEditorStore((s) => s.isEditMode);

    // ── Initialize GridStack once ─────────────────
    useEffect(() => {
        if (!containerRef.current || gridRef.current) return;

        const grid = GridStack.init(
            {
                column: columns,
                cellHeight,
                minRow: 1,
                margin: 10,
                animate: true,
                float: false,
                disableResize: true,
                disableDrag: true,
                acceptWidgets: false,
            },
            containerRef.current,
        );

        gridRef.current = grid;

        // Listen for layout changes → sync to Zustand (debounced)
        grid.on('change', () => {
            if (isInternalUpdateRef.current) return;

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
                const nodes = grid.getGridItems().map((el) => {
                    const node = el.gridstackNode;
                    return {
                        instanceId: el.getAttribute('gs-id') ?? '',
                        widgetId: el.getAttribute('data-widget-id') ?? '',
                        x: node?.x ?? 0,
                        y: node?.y ?? 0,
                        w: node?.w ?? 1,
                        h: node?.h ?? 1,
                    } satisfies WidgetPlacement;
                });
                updateWidgets(dashboardIdRef.current, nodes);
            }, 150);
        });

        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            grid.destroy(false);
            gridRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Toggle drag/resize based on edit mode ──
    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;
        grid.enableMove(isEditMode);
        grid.enableResize(isEditMode);
    }, [isEditMode]);

    // ── makeWidget: tell GridStack about a new DOM element ──
    const makeWidget = (el: HTMLElement) => {
        const grid = gridRef.current;
        if (!grid) return;
        try {
            grid.makeWidget(el);
        } catch {
            // Widget may already be managed
        }
    };

    // ── removeWidget ──
    const removeWidgetEl = (instanceId: string) => {
        const grid = gridRef.current;
        if (!grid) return;
        isInternalUpdateRef.current = true;
        const el = grid.el.querySelector(`[gs-id="${instanceId}"]`) as HTMLElement | null;
        if (el) {
            grid.removeWidget(el, true);
        }
        isInternalUpdateRef.current = false;
    };

    return {
        containerRef,
        gridRef,
        makeWidget,
        removeWidget: removeWidgetEl,
    };
}
