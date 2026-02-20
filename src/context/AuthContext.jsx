import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('pigc-token'));
    const [loading, setLoading] = useState(true);

    // On mount, validate stored token
    useEffect(() => {
        const validateToken = async () => {
            const storedToken = localStorage.getItem('pigc-token');
            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                const userData = await authApi.me();
                setUser(userData);
                setToken(storedToken);
            } catch {
                // Token invalid or expired
                localStorage.removeItem('pigc-token');
                localStorage.removeItem('pigc-user');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        validateToken();
    }, []);

    const login = useCallback(async (username, password) => {
        const response = await authApi.login(username, password);
        localStorage.setItem('pigc-token', response.token);
        localStorage.setItem('pigc-user', JSON.stringify({
            username: response.username,
            rol: response.rol,
            nombreCompleto: response.nombreCompleto
        }));
        setToken(response.token);
        setUser({
            username: response.username,
            rol: response.rol,
            nombreCompleto: response.nombreCompleto
        });
        return response;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('pigc-token');
        localStorage.removeItem('pigc-user');
        setToken(null);
        setUser(null);
    }, []);

    const hasRole = useCallback((role) => {
        if (!user) return false;
        const hierarchy = { Admin: 3, Editor: 2, Viewer: 1 };
        return (hierarchy[user.rol] || 0) >= (hierarchy[role] || 0);
    }, [user]);

    const isAuthenticated = !!token && !!user;

    const value = {
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        hasRole
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
