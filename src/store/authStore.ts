
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type User } from '../services/authService';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (username, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authService.login(username, password);
                    set({
                        user: response.user,
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken,
                        isAuthenticated: true,
                        isLoading: false
                    });
                } catch (err) {
                    set({
                        error: err instanceof Error ? err.message : 'Authentication failed',
                        isLoading: false,
                        isAuthenticated: false
                    });
                    throw err;
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await authService.logout();
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null
                    });
                } catch (err) {
                    console.error(err);
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null
                    });
                }
            },

            clearError: () => set({ error: null }),

            setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
