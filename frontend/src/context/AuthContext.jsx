import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const api = axios.create({
        baseURL: 'http://127.0.0.1:8000/api/',
    });

    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    const signup = async (username, email, password) => {
        try {
            await api.post('users/signup/', { username, email, password });
            return await login(username, password);
        } catch (error) {
            let msg = 'Signup failed';
            if (error.response && error.response.data) {
                const data = error.response.data;
                // Try to get the first validation string from objects like {username: ["A user with that username already exists."]}
                if (typeof data === 'object') {
                    const firstKey = Object.keys(data)[0];
                    if (Array.isArray(data[firstKey])) {
                        msg = data[firstKey][0];
                    } else if (typeof data[firstKey] === 'string') {
                        msg = data[firstKey];
                    }
                } else if (typeof data === 'string') {
                    msg = data;
                }
            }
            return { success: false, message: msg };
        }
    };

    const login = async (username, password) => {
        try {
            const response = await api.post('auth/token/', { username, password });
            const { access, refresh } = response.data;
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            localStorage.setItem('username', username);
            setUser({ username });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.detail || 'Login failed. Check your credentials.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        setUser(null);
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('username');
        
        if (token && storedUser) {
            setUser({ username: storedUser });
        } else if (token) {
            setUser({ username: 'Authenticated User' });
        }
        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, api, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
