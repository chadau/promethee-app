
// Mock authentication service

export interface User {
    id: string;
    username: string;
    role: 'operator' | 'admin';
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export const authService = {
    login: async (username: string, password: string): Promise<AuthResponse> => {
        const response = await fetch('http://localhost:8080/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error('Authentication failed');
        }

        const data = await response.json();
        return {
            user: {
                id: '1', // Backend doesn't return user details yet, mock for now
                username: username,
                role: 'operator',
            },
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
        };
    },

    logout: async (): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock server-side logout if needed
                resolve();
            }, 200);
        });
    },

    refreshToken: async (token: string): Promise<{ accessToken: string, refreshToken: string }> => {
        const response = await fetch('http://localhost:8080/api/v1/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: token }),
        });

        if (!response.ok) {
            throw new Error('Refresh failed');
        }

        const data = await response.json();
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
        };
    }
};
