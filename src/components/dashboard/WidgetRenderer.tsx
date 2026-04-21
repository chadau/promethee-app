// ──────────────────────────────────────────────
// PROMÉTHÉE — WidgetRenderer
// ──────────────────────────────────────────────
// Maps a widgetId to the actual React component.
// Heavy widgets are lazy-loaded with Suspense.

import React, { Suspense, lazy } from 'react';
import { useWidgetRegistryStore } from '../../store/useWidgetRegistryStore';
import { useUiEditorStore } from '../../store/useUiEditorStore';
import { X } from 'lucide-react';
import clsx from 'clsx';

// ── Lazy imports for heavy widgets ───────────
const Globe = lazy(() =>
    import('../Globe').then((m) => ({ default: m.Globe })),
);
const VideoFeedWidget = lazy(() =>
    import('./VideoFeedWidget').then((m) => ({ default: m.VideoFeedWidget })),
);

// ── Eager imports for lightweight widgets ────
import { AltitudeWidget } from '../telemetry/AltitudeWidget';
import { SpeedWidget } from '../telemetry/SpeedWidget';
import { BatteryWidget } from '../telemetry/BatteryWidget';
import { ManualControlWidget } from './ManualControlWidget';
import { SystemLogs } from '../console/SystemLogs';
import { FlightInstruments } from '../console/FlightInstruments';
import { FlightControls } from '../console/FlightControls';
import { MavlinkCliWidget } from '../cli/MavlinkCliWidget';

// ── Widget component map ─────────────────────
const WIDGET_COMPONENTS: Record<string, React.ComponentType> = {
    'globe': Globe,
    'video-feed': VideoFeedWidget,
    'altitude': AltitudeWidget,
    'speed': SpeedWidget,
    'battery': BatteryWidget,
    'manual-control': ManualControlWidget,
    'system-logs': SystemLogs,
    'flight-instruments': FlightInstruments,
    'flight-controls': FlightControls,
    'mavlink-cli': MavlinkCliWidget,
};

// ── Loading skeleton ─────────────────────────
const WidgetSkeleton: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center bg-dark-panel rounded-xl">
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
            <span className="text-xs text-[#6B7280] font-mono">Chargement...</span>
        </div>
    </div>
);

// ── Unknown widget fallback ──────────────────
const UnknownWidget: React.FC<{ widgetId: string }> = ({ widgetId }) => (
    <div className="w-full h-full flex items-center justify-center bg-dark-panel rounded-xl border border-alert-red/20">
        <span className="text-xs text-alert-red font-mono">Widget inconnu : {widgetId}</span>
    </div>
);

// ── Props ────────────────────────────────────
interface WidgetRendererProps {
    widgetId: string;
    instanceId: string;
    onRemove?: (instanceId: string) => void;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
    widgetId,
    instanceId,
    onRemove,
}) => {
    const isEditMode = useUiEditorStore((s) => s.isEditMode);
    const selectedId = useUiEditorStore((s) => s.selectedWidgetInstanceId);
    const selectWidget = useUiEditorStore((s) => s.selectWidget);
    const widgetDef = useWidgetRegistryStore((s) => s.getById(widgetId));

    const Component = WIDGET_COMPONENTS[widgetId];
    const isSelected = selectedId === instanceId;
    const isHeavy = widgetDef?.isHeavy;

    return (
        <div
            className={clsx(
                'w-full h-full relative rounded-xl overflow-hidden transition-all duration-200',
                isEditMode && 'ring-1 ring-white/10 hover:ring-neon-cyan/40',
                isSelected && isEditMode && 'ring-2 ring-neon-cyan shadow-[0_0_15px_rgba(0,191,255,0.25)]',
            )}
            onClick={() => {
                if (isEditMode) selectWidget(instanceId);
            }}
        >
            {/* Edit mode overlay header */}
            {isEditMode && (
                <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-1.5 bg-[#0E1419]/80 backdrop-blur-sm border-b border-white/5">
                    <span className="text-[10px] font-semibold text-[#A1A8B3] uppercase tracking-wider truncate">
                        {widgetDef?.name ?? widgetId}
                    </span>
                    {onRemove && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(instanceId);
                            }}
                            className="p-1 rounded-md hover:bg-alert-red/20 text-[#6B7280] hover:text-alert-red transition-colors duration-150"
                            title="Supprimer le widget"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            )}

            {/* Widget content */}
            <div className={clsx('w-full h-full', isEditMode && 'pt-0')}>
                {Component ? (
                    isHeavy ? (
                        <Suspense fallback={<WidgetSkeleton />}>
                            <Component />
                        </Suspense>
                    ) : (
                        <Component />
                    )
                ) : (
                    <UnknownWidget widgetId={widgetId} />
                )}
            </div>
        </div>
    );
};
