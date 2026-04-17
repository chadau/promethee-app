// ──────────────────────────────────────────────
// PROMÉTHÉE — ProfileList
// ──────────────────────────────────────────────
// Vertical list of operator profiles.

import React, { useEffect } from 'react';
import { Shield, Plane, Radio, Eye, Plus } from 'lucide-react';
import { useOperatorProfileStore } from '../../store/useOperatorProfileStore';
import type { ProfileRole } from '../../types/dashboard';
import clsx from 'clsx';

const ROLE_ICONS: Record<ProfileRole, React.ElementType> = {
    pilot: Plane,
    mission: Radio,
    supervision: Eye,
    admin: Shield,
};

const ROLE_LABELS: Record<ProfileRole, string> = {
    pilot: 'Pilote',
    mission: 'Mission',
    supervision: 'Supervision',
    admin: 'Admin',
};

interface ProfileListProps {
    onCreateProfile?: () => void;
}

export const ProfileList: React.FC<ProfileListProps> = ({ onCreateProfile }) => {
    const profiles = useOperatorProfileStore((s) => s.profiles);
    const activeProfileId = useOperatorProfileStore((s) => s.activeProfileId);
    const setActiveProfile = useOperatorProfileStore((s) => s.setActiveProfile);
    const loadProfiles = useOperatorProfileStore((s) => s.loadProfiles);
    const isLoading = useOperatorProfileStore((s) => s.isLoading);

    useEffect(() => {
        loadProfiles();
    }, [loadProfiles]);

    if (isLoading && profiles.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#12171C] rounded-xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="text-sm font-semibold text-[#E6EAF0] uppercase tracking-wider">
                    Profils Opérateurs
                </h2>
                {onCreateProfile && (
                    <button
                        onClick={onCreateProfile}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 ring-1 ring-neon-cyan/30 transition-all"
                    >
                        <Plus size={14} />
                        Créer
                    </button>
                )}
            </div>

            {/* Profile list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {profiles.map((profile) => {
                    const isActive = profile.id === activeProfileId;
                    const Icon = ROLE_ICONS[profile.role];

                    return (
                        <button
                            key={profile.id}
                            onClick={() => setActiveProfile(profile.id)}
                            className={clsx(
                                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left',
                                isActive
                                    ? 'bg-neon-cyan/5 ring-1 ring-neon-cyan/20 shadow-[0_0_10px_rgba(0,191,255,0.08)]'
                                    : 'hover:bg-white/[0.02] border border-transparent hover:border-white/5',
                            )}
                        >
                            {/* Avatar */}
                            <div
                                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${profile.avatarColor}15` }}
                            >
                                <Icon
                                    size={18}
                                    style={{ color: profile.avatarColor }}
                                    strokeWidth={isActive ? 2 : 1.5}
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={clsx(
                                        'text-xs font-semibold truncate',
                                        isActive ? 'text-[#E6EAF0]' : 'text-[#A1A8B3]',
                                    )}>
                                        {profile.name}
                                    </span>
                                    <span
                                        className="text-[9px] px-1.5 py-0.5 rounded font-medium uppercase"
                                        style={{
                                            backgroundColor: `${profile.avatarColor}15`,
                                            color: profile.avatarColor,
                                        }}
                                    >
                                        {ROLE_LABELS[profile.role]}
                                    </span>
                                </div>
                                <span className="text-[10px] text-[#6B7280] line-clamp-1 mt-0.5">
                                    {profile.dashboardIds.length} dashboard{profile.dashboardIds.length > 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Active indicator */}
                            {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_6px_#00BFFF]" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
