import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Plane, FileText, Settings, Users, LayoutGrid } from 'lucide-react';
import clsx from 'clsx';

type NavItem = {
    id: string;
    label: string;
    icon: React.ElementType;
    path: string;
};

const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, path: '/' },
    { id: 'map', label: 'Map', icon: Map, path: '/' },
    { id: 'flight', label: 'Flight', icon: Plane, path: '/' },
    { id: 'logs', label: 'Logs', icon: FileText, path: '/' },
];

const ADMIN_ITEMS: NavItem[] = [
    { id: 'dashboards', label: 'Dashboards', icon: LayoutGrid, path: '/admin/dashboards' },
    { id: 'profiles', label: 'Profils', icon: Users, path: '/admin/profiles' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/' },
];

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveId = () => {
        if (location.pathname === '/admin/dashboards') return 'dashboards';
        if (location.pathname === '/admin/profiles') return 'profiles';
        return 'dashboard';
    };

    const activeId = getActiveId();

    const renderItem = (item: NavItem) => {
        const isActive = activeId === item.id;
        return (
            <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={clsx(
                    "relative group flex flex-col items-center gap-1 p-2 w-full transition-all duration-300",
                    isActive ? "text-neon-cyan" : "text-[#A1A8B3] hover:text-white"
                )}
            >
                {/* Active Indicator Line */}
                {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-neon-cyan rounded-r-full shadow-[0_0_10px_#00BFFF]" />
                )}

                {/* Icon with Glow */}
                <div className={clsx(
                    "p-2 rounded-xl transition-all duration-300",
                    isActive ? "bg-neon-cyan/10 ring-1 ring-neon-cyan/50 shadow-[0_0_15px_rgba(0,191,255,0.3)]" : "group-hover:bg-white/5"
                )}>
                    <item.icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                </div>

                {/* Label */}
                <span className={clsx(
                    "text-[10px] font-medium tracking-wide transition-opacity",
                    isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )}>
                    {item.label}
                </span>
            </button>
        );
    };

    return (
        <aside className="fixed left-0 top-24 bottom-0 w-20 bg-[#12171C] border-r border-white/5 flex flex-col items-center py-6 z-40 shadow-2xl">
            <nav className="flex flex-col gap-8 w-full flex-1">
                {NAV_ITEMS.map(renderItem)}
            </nav>

            {/* Separator */}
            <div className="w-10 h-px bg-white/10 my-2" />

            {/* Admin section */}
            <nav className="flex flex-col gap-6 w-full pb-4">
                {ADMIN_ITEMS.map(renderItem)}
            </nav>
        </aside>
    );
};
