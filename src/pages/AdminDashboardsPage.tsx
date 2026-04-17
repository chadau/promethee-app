// ──────────────────────────────────────────────
// PROMÉTHÉE — Admin Dashboards Page
// ──────────────────────────────────────────────

import React from 'react';
import { DashboardEditorPanel } from '../components/builder/DashboardEditorPanel';
import { DashboardCanvas } from '../components/dashboard/DashboardCanvas';

export const AdminDashboardsPage: React.FC = () => {
    return (
        <div className="w-full h-full flex gap-4 p-4 overflow-hidden">
            {/* Left: Dashboard editor panel */}
            <div className="w-[320px] shrink-0">
                <DashboardEditorPanel />
            </div>

            {/* Right: Live dashboard preview */}
            <div className="flex-1 min-w-0 bg-[#12171C] rounded-xl border border-white/5 overflow-hidden">
                <DashboardCanvas />
            </div>
        </div>
    );
};
