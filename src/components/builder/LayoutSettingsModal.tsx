// ──────────────────────────────────────────────
// PROMÉTHÉE — LayoutSettingsModal
// ──────────────────────────────────────────────
// Modal for dashboard-level settings.

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useUiEditorStore } from '../../store/useUiEditorStore';
import { useDashboardActions } from '../../hooks/useDashboardActions';

export const LayoutSettingsModal: React.FC = () => {
    const closeSettingsModal = useUiEditorStore((s) => s.closeSettingsModal);
    const { activeDashboard, renameDashboard } = useDashboardActions();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (activeDashboard) {
            setName(activeDashboard.name);
            setDescription(activeDashboard.description);
        }
    }, [activeDashboard]);

    const handleSave = async () => {
        if (!activeDashboard) return;
        await renameDashboard(activeDashboard.id, name);
        closeSettingsModal();
    };

    if (!activeDashboard) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={closeSettingsModal}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[440px] max-w-[90vw] bg-[#12171C] border border-white/10 rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.6)] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <h2 className="text-sm font-semibold text-[#E6EAF0] uppercase tracking-wider">
                        Paramètres du Dashboard
                    </h2>
                    <button
                        onClick={closeSettingsModal}
                        className="p-2 rounded-xl hover:bg-white/5 text-[#6B7280] hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <div className="px-6 py-5 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-[10px] text-[#A1A8B3] uppercase tracking-wider font-semibold mb-2">
                            Nom du dashboard
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#0B0F12] border border-white/10 rounded-xl text-sm text-[#E6EAF0] focus:outline-none focus:border-neon-cyan/40 focus:shadow-[0_0_10px_rgba(0,191,255,0.1)] transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] text-[#A1A8B3] uppercase tracking-wider font-semibold mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-[#0B0F12] border border-white/10 rounded-xl text-sm text-[#E6EAF0] placeholder:text-[#6B7280] focus:outline-none focus:border-neon-cyan/40 focus:shadow-[0_0_10px_rgba(0,191,255,0.1)] transition-all resize-none"
                        />
                    </div>

                    {/* Grid info (read-only) */}
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="block text-[10px] text-[#A1A8B3] uppercase tracking-wider font-semibold mb-2">
                                Colonnes
                            </label>
                            <div className="px-4 py-2.5 bg-[#0B0F12] border border-white/5 rounded-xl text-sm text-[#6B7280] font-mono">
                                {activeDashboard.columns}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-[#A1A8B3] uppercase tracking-wider font-semibold mb-2">
                                Hauteur cellule
                            </label>
                            <div className="px-4 py-2.5 bg-[#0B0F12] border border-white/5 rounded-xl text-sm text-[#6B7280] font-mono">
                                {activeDashboard.cellHeight}px
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-[#A1A8B3] uppercase tracking-wider font-semibold mb-2">
                                Widgets
                            </label>
                            <div className="px-4 py-2.5 bg-[#0B0F12] border border-white/5 rounded-xl text-sm text-neon-cyan font-mono">
                                {activeDashboard.widgets.length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
                    <button
                        onClick={closeSettingsModal}
                        className="px-4 py-2 rounded-xl text-xs font-medium text-[#A1A8B3] hover:text-white hover:bg-white/5 transition-all"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 ring-1 ring-neon-cyan/30 transition-all"
                    >
                        <Save size={14} />
                        Enregistrer
                    </button>
                </div>
            </div>
        </>
    );
};
