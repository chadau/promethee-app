import React from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';

interface GridWidgetProps {
    id: string; // Unique ID for the widget
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    minW?: number;
    minH?: number;
    noResize?: boolean;
    noMove?: boolean;
    children: ReactNode;
    className?: string;
    locked?: boolean;
}

export const GridWidget: React.FC<GridWidgetProps> = ({
    id,
    x = 0,
    y = 0,
    w = 1,
    h = 1,
    minW,
    minH,
    noResize = false,
    noMove = false,
    children,
    className,
    locked = false
}) => {
    return (
        <div
            className={clsx("grid-stack-item", className)}
            gs-id={id}
            gs-x={x}
            gs-y={y}
            gs-w={w}
            gs-h={h}
            gs-min-w={minW}
            gs-min-h={minH}
            gs-no-resize={noResize || locked ? 'true' : undefined}
            gs-no-move={noMove || locked ? 'true' : undefined}
            gs-locked={locked ? 'true' : undefined}
        >
            <div className="grid-stack-item-content">
                {/* Helper Wrapper for styling consistency if needed */}
                {children}
            </div>
        </div>
    );
};
