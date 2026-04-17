// ──────────────────────────────────────────────
// PROMÉTHÉE — WidgetToolbar
// ──────────────────────────────────────────────
// Floating toolbar in edit mode. Glassmorphism per charter.

import React from 'react';
import { Plus, Save, RotateCcw, Settings, X } from 'lucide-react';
import { useUiEditorStore } from '../../store/useUiEditorStore';
import { useDashboardActions } from '../../hooks/useDashboardActions';
import clsx from 'clsx';

export const WidgetToolbar: React.FC = () => {
    const isEditMode = useUiEditorStore((s) => s.isEditMode);
    const openWidgetPicker = useUiEditorStore((s) => s.openWidgetPicker);
    const toggleSettingsModal = useUiEditorStore((s) => s.toggleSettingsModal);
    const { activeDashboard, resetToDefault, saveAndExit } = useDashboardActions();

    if (!isEditMode) return null;

    const buttons = [
        {
            label: 'Ajouter',
            icon: Plus,
            onClick: openWidgetPicker,
            accent: true,
        },
        {
            label: 'Paramètres',
            icon: Settings,
            onClick: toggleSettingsModal,
        },
        {
            label: 'Réinitialiser',
            icon: RotateCcw,
            onClick: () => activeDashboard && resetToDefault(activeDashboard.id),
            danger: true,
        },
        {
            label: 'Sauvegarder',
            icon: Save,
            onClick: saveAndExit,
            accent: true,
        },
        {
            label: 'Fermer',
            icon: X,
            onClick: saveAndExit,
        },
    ];

    return (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0E1419]/85 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            {/* Dashboard name */}
            <span className="text-xs font-semibold text-[#A1A8B3] uppercase tracking-wider mr-3 hidden sm:inline-block">
                Édition : {activeDashboard?.name ?? '—'}
            </span>

            <div className="h-5 w-px bg-white/10 mr-1" />

            {buttons.map((btn) => (
                <button
                    key={btn.label}
                    onClick={btn.onClick}
                    className={clsx(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200',
                        btn.accent
                            ? 'bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 ring-1 ring-neon-cyan/30'
                            : btn.danger
                                ? 'text-[#A1A8B3] hover:bg-alert-red/10 hover:text-alert-red'
                                : 'text-[#A1A8B3] hover:bg-white/5 hover:text-white',
                    )}
                    title={btn.label}
                >
                    <btn.icon size={14} />
                    <span className="hidden md:inline">{btn.label}</span>
                </button>
            ))}
        </div>
    );
};
