
// Mock authentication service

export interface User {
    id: string;
    username: string;
    role: 'operator' | 'admin';
}

export interface AuthResponse {
    user: User;
    token: string;
}

const MOCK_DELAY = 800; // Simulate network latency

export const authService = {
    login: async (username: string, password: string): Promise<AuthResponse> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (username === 'operator' && password === 'operator') {
                    // Generate a mock JWT-like token
                    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
                    const payload = btoa(JSON.stringify({ sub: '1234567890', name: 'Operator', role: 'operator' }));
                    const signature = 'mockSignature';
                    const token = `${header}.${payload}.${signature}`;

                    resolve({
                        user: {
                            id: '1',
                            username: 'operator',
                            role: 'operator',
                        },
                        token,
                    });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, MOCK_DELAY);
        });
    },

    logout: async (): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock server-side logout if needed
                resolve();
            }, 200);
        });
    }
};
