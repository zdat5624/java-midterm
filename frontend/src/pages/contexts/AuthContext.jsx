import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserData = async (accessToken) => {
        try {
            const response = await axiosInstance.get('/api/auth/account');
            if (response.data.statusCode === 200) {
                const userData = response.data.data;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                setToken(accessToken);
                setIsAuthenticated(true);
            } else {
                throw new Error('Failed to fetch user data');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
        }
    };

    const refreshUserData = async () => {
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
            await fetchUserData(storedToken);
        }
    };

    const checkAuthStatus = async () => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('accessToken');
        console.log('Stored User:', storedUser);
        console.log('Stored Token:', storedToken);
        if (storedUser && storedToken) {
            await fetchUserData(storedToken);
        } else {
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            checkAuthStatus();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = async (userData, accessToken) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', accessToken);
        setUser(userData);
        setToken(accessToken);
        setIsAuthenticated(true);
        await fetchUserData(accessToken); // Fetch latest user data from API
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout, refreshUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);