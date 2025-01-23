export const REDIS_KEY_PREFIXES = {
    AUTH: 'auth_',
    USERS: 'users',
} as const;

export const REDIS_TTL = {
    AUTH_TOKEN: 86400, // 1 day in seconds
} as const; 