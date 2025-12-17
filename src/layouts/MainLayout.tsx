import React from 'react';
import { TopBar } from '../components/TopBar';
import { Sidebar } from '../components/Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-dark-core text-white font-sans overflow-hidden">
            <TopBar />
            <Sidebar />

            {/* Main Content Area */}
            <main className="pl-20 pt-24 h-screen w-full relative">
                {children}
            </main>
        </div>
    );
};
