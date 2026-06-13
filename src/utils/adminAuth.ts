/**
 * Admin Authentication Utilities
 * Manages admin session in sessionStorage
 */

const ADMIN_TOKEN_KEY = 'kartika_admin_token';
const ADMIN_ROLE_KEY = 'kartika_admin_role';

export const setAdminSession = (token: string, role: string = 'Super Admin') => {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_ROLE_KEY, role);
};

export const getAdminRole = () => {
    return sessionStorage.getItem(ADMIN_ROLE_KEY) || 'Content Writer';
};

export const getAdminToken = () => {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
};

export const isAdminAuthenticated = () => {
    const token = getAdminToken();
    if (!token) return false;

    // Accept both Kartika tokens (current) and legacy Mangala tokens
    return token.startsWith('kartika-admin-token-') || token.startsWith('mangala_admin_session_');
};

export const logoutAdmin = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_ROLE_KEY);
    window.location.href = '/admin/login';
};
