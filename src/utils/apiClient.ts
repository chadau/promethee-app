import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const getAuthHeaders = (): Record<string, string> => {
        const token = useAuthStore.getState().accessToken;
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const headers = { ...options.headers, ...getAuthHeaders() };
    let response = await fetch(url, { ...options, headers });

    // Handle 401 Unauthorized
    if (response.status === 401) {
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
            useAuthStore.getState().logout();
            return response;
        }

        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const refreshedTokens = await authService.refreshToken(refreshToken);
                useAuthStore.getState().setTokens(refreshedTokens.accessToken, refreshedTokens.refreshToken);
                isRefreshing = false;
                onRefreshed(refreshedTokens.accessToken);
            } catch (error) {
                isRefreshing = false;
                useAuthStore.getState().logout();
                return response;
            }
        }

        // Wait for the refresh to complete then retry the request
        const retryOriginalRequest = new Promise<Response>((resolve) => {
            subscribeTokenRefresh((newToken: string) => {
                // Update the authorization header
                const retryHeaders = { ...options.headers, 'Authorization': `Bearer ${newToken}` };
                resolve(fetch(url, { ...options, headers: retryHeaders }));
            });
        });

        return retryOriginalRequest;
    }

    return response;
};
