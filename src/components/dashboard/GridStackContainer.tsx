// ──────────────────────────────────────────────
// PROMÉTHÉE — GridStackContainer
// ──────────────────────────────────────────────
// Uses the same pattern as the original Dashboard.tsx:
// React renders grid-stack-item children → GridStack.init() picks them up.
// Widget content is rendered INLINE (no portals needed).

import React, { useEffect } from 'react';
import 'gridstack/dist/gridstack.min.css';
import type { WidgetPlacement } from '../../types/dashboard';
import { useGridStack } from '../../hooks/useGridStack';
import { WidgetRenderer } from './WidgetRenderer';
import { useWidgetRegistryStore } from '../../store/useWidgetRegistryStore';

interface GridStackContainerProps {
    dashboardId: string;
    widgets: WidgetPlacement[];
    columns?: number;
    cellHeight?: number;
    onRemoveWidget?: (instanceId: string) => void;
}

export const GridStackContainer: React.FC<GridStackContainerProps> = ({
    dashboardId,
    widgets,
    columns = 12,
    cellHeight = 70,
    onRemoveWidget,
}) => {
    const { containerRef, gridRef } = useGridStack({
        dashboardId,
        columns,
        cellHeight,
    });

    const getById = useWidgetRegistryStore((s) => s.getById);

    // Make sure GridStack knows about all items after render
    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        // Batch update to avoid layout thrashing
        grid.batchUpdate();
        const items = grid.el.querySelectorAll('.grid-stack-item');
        items.forEach((el) => {
            if (!(el as HTMLElement & { gridstackNode?: any }).gridstackNode) {
                try {
                    grid.makeWidget(el as HTMLElement);
                } catch {
                    // Already managed
                }
            }
        });
        grid.batchUpdate(false);
    }, [widgets, gridRef]);

    return (
        <div
            ref={containerRef}
            className="grid-stack w-full h-full"
        >
            {widgets.map((widget) => {
                const def = getById(widget.widgetId);
                return (
                    <div
                        key={widget.instanceId}
                        className="grid-stack-item"
                        gs-id={widget.instanceId}
                        gs-x={String(widget.x)}
                        gs-y={String(widget.y)}
                        gs-w={String(widget.w)}
                        gs-h={String(widget.h)}
                        gs-min-w={def?.minW ? String(def.minW) : undefined}
                        gs-min-h={def?.minH ? String(def.minH) : undefined}
                        data-widget-id={widget.widgetId}
                    >
                        <div className="grid-stack-item-content">
                            <WidgetRenderer
                                widgetId={widget.widgetId}
                                instanceId={widget.instanceId}
                                onRemove={onRemoveWidget}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
