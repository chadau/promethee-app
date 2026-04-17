// ──────────────────────────────────────────────
// PROMÉTHÉE — ProfileEditor
// ──────────────────────────────────────────────
// Form panel for editing operator profile details.

import React, { useState, useEffect } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { useOperatorProfileStore } from '../../store/useOperatorProfileStore';
import { useWidgetRegistryStore } from '../../store/useWidgetRegistryStore';
import type { ProfileRole, WidgetCategory } from '../../types/dashboard';
import clsx from 'clsx';

const ROLE_OPTIONS: { value: ProfileRole; label: string }[] = [
    { value: 'pilot', label: 'Pilote' },
    { value: 'mission', label: 'Mission' },
    { value: 'supervision', label: 'Supervision' },
    { value: 'admin', label: 'Admin' },
];

const CATEGORY_LABELS: Record<WidgetCategory, string> = {
    telemetry: 'Télémétrie',
    control: 'Contrôle',
    map: 'Carte',
    video: 'Vidéo',
    system: 'Système',
};

export const ProfileEditor: React.FC = () => {
    const profiles = useOperatorProfileStore((s) => s.profiles);
    const activeProfileId = useOperatorProfileStore((s) => s.activeProfileId);
    const updateProfile = useOperatorProfileStore((s) => s.updateProfile);
    const deleteProfile = useOperatorProfileStore((s) => s.deleteProfile);
    const allWidgets = useWidgetRegistryStore((s) => s.widgets);

    const activeProfile = profiles.find((p) => p.id === activeProfileId);

    const [name, setName] = useState('');
    const [role, setRole] = useState<ProfileRole>('pilot');
    const [description, setDescription] = useState('');
    const [allowedWidgetIds, setAllowedWidgetIds] = useState<string[]>([]);
    const [isDirty, setIsDirty] = useState(false);

    // Sync form when active profile changes
    useEffect(() => {
        if (activeProfile) {
            setName(activeProfile.name);
            setRole(activeProfile.role);
            setDescription(activeProfile.description);
            setAllowedWidgetIds([...activeProfile.allowedWidgetIds]);
            setIsDirty(false);
        }
    }, [activeProfile]);

    const toggleWidget = (widgetId: string) => {
        setAllowedWidgetIds((prev) =>
            prev.includes(widgetId)
                ? prev.filter((id) => id !== widgetId)
                : [...prev, widgetId],
        );
        setIsDirty(true);
    };

    const handleSave = async () => {
        if (!activeProfile) return;
        await updateProfile({
            ...activeProfile,
            name,
            role,
            description,
            allowedWidgetIds,
        });
        setIsDirty(false);
    };

    const handleDelete = async () => {
        if (!activeProfile) return;
        await deleteProfile(activeProfile.id);
    };

    if (!activeProfile) {
        return (
            <div className="h-full flex items-center justify-center bg-[#12171C] rounded-xl border border-white/5">
                <span className="text-xs text-[#6B7280]">Sélectionnez un profil</span>
            </div>
        );
    }

    // Group widgets by category
    const widgetsByCategory = allWidgets.reduce(
        (acc, w) => {
            if (!acc[w.category]) acc[w.category] = [];
            acc[w.category].push(w);
            return acc;
        },
        {} as Record<string, typeof allWidgets>,
    );

    return (
        <div className="h-full flex flex-col bg-[#12171C] rounded-xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="text-sm font-semibold text-[#E6EAF0] uppercase tracking-wider">
                    Éditer le Profil
                </h2>
                <div className="flex items-center gap-2">
                    {isDirty && (
                        <span className="text-[9px] text-solar-amber px-2 py-0.5 rounded-full bg-solar-amber/10 font-medium">
                            Non sauvegardé
                        </span>
                    )}
                </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Name */}
                <div>
                    <label className="block text-[10px] text-[#A1A8B3] uppercase tracking-wider font-semibold mb-2">
                        Nom
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
                        className="w-full px-4 py-2.5 bg-[#0B0F12] border border-white/10 rounded-xl text-sm text-[#E6EAF0] focus:outline-none focus:border-neon-cyan/40 focus:shadow-[0_0_10px_rgba(0,191,255,0.1)] transition-all"
                    />
                </div>

                {/* Role */}
                <div>
                    <label className="block text-[10px] text-[#A1A8B3] uppercase tracking-wider font-semibold mb-2">
                        Rôle
                    </label>
                    <select
                        value={role}
                        onChange={(e) => { setRole(e.target.value as ProfileRole); setIsDirty(true); }}
                        className="w-full px-4 py-2.5 bg-[#0B0F12] border border-white/10 rounded-xl text-sm text-[#E6EAF0] focus:outline-none focus:border-neon-cyan/40 transition-all appearance-none cursor-pointer"
                    >
                        {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-[10px] text-[#A1A8B3] uppercase tracking-wider font-semibold mb-2">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => { setDescription(e.target.value); setIsDirty(true); }}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-[#0B0F12] border border-white/10 rounded-xl text-sm text-[#E6EAF0] placeholder:text-[#6B7280] focus:outline-none focus:border-neon-cyan/40 focus:shadow-[0_0_10px_rgba(0,191,255,0.1)] transition-all resize-none"
                    />
                </div>

                {/* Allowed Widgets */}
                <div>
                    <label className="block text-[10px] text-[#A1A8B3] uppercase tracking-wider font-semibold mb-3">
                        Widgets Autorisés
                    </label>
                    <div className="space-y-4">
                        {Object.entries(widgetsByCategory).map(([category, widgets]) => (
                            <div key={category}>
                                <span className="text-[9px] text-[#6B7280] uppercase tracking-wider font-medium">
                                    {CATEGORY_LABELS[category as WidgetCategory] ?? category}
                                </span>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {widgets.map((widget) => {
                                        const isAllowed = allowedWidgetIds.includes(widget.id);
                                        return (
                                            <button
                                                key={widget.id}
                                                onClick={() => toggleWidget(widget.id)}
                                                className={clsx(
                                                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-200 text-left',
                                                    isAllowed
                                                        ? 'bg-neon-cyan/10 text-neon-cyan ring-1 ring-neon-cyan/20'
                                                        : 'bg-[#0B0F12] text-[#6B7280] border border-white/5 hover:border-white/15',
                                                )}
                                            >
                                                <div
                                                    className={clsx(
                                                        'w-3 h-3 rounded-sm border transition-all',
                                                        isAllowed
                                                            ? 'bg-neon-cyan border-neon-cyan'
                                                            : 'border-[#6B7280]',
                                                    )}
                                                />
                                                <span className="truncate">{widget.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
                <button
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#6B7280] hover:text-alert-red hover:bg-alert-red/10 transition-all"
                >
                    <Trash2 size={14} />
                    Supprimer
                </button>
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className={clsx(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all',
                        isDirty
                            ? 'bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 ring-1 ring-neon-cyan/30'
                            : 'bg-white/5 text-[#6B7280] cursor-not-allowed',
                    )}
                >
                    <Save size={14} />
                    Enregistrer
                </button>
            </div>
        </div>
    );
};
