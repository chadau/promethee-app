// ──────────────────────────────────────────────
// PROMÉTHÉE — Admin Profiles Page
// ──────────────────────────────────────────────

import React from 'react';
import { ProfileList } from '../components/profiles/ProfileList';
import { ProfileEditor } from '../components/profiles/ProfileEditor';
import { DashboardAssignmentPanel } from '../components/profiles/DashboardAssignmentPanel';

export const AdminProfilesPage: React.FC = () => {
    return (
        <div className="w-full h-full flex gap-4 p-4 overflow-hidden">
            {/* Left: Profile list */}
            <div className="w-[280px] shrink-0">
                <ProfileList />
            </div>

            {/* Center: Profile editor */}
            <div className="w-[340px] shrink-0">
                <ProfileEditor />
            </div>

            {/* Right: Dashboard assignment */}
            <div className="flex-1 min-w-0">
                <DashboardAssignmentPanel />
            </div>
        </div>
    );
};
