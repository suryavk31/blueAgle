import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('staffUser');
        if (saved) {
            try {
                const user = JSON.parse(saved);
                return {
                    uid: user.id?.toString() || '1',
                    email: user.email,
                    phoneNumber: user.phone,
                    getIdToken: async () => "mock-staff-token"
                };
            } catch (e) { return null; }
        }
        return null;
    });
    const [userData, setUserData] = useState(() => {
        const saved = localStorage.getItem('staffUser');
        try { return saved ? JSON.parse(saved) : null; } catch (e) { return null; }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        if (!auth) {
            console.warn("Auth is null (Guest Mode). Skipping Firebase listener.");
            setLoading(false);
            return;
        }

        // If on admin route or admin token exists, resolve loading immediately for admin panel
        if (window.location.pathname.startsWith('/admin') || localStorage.getItem('admin_access_token') || localStorage.getItem('staffUser')) {
            setLoading(false);
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!mounted) return;
            
            // If already logged in as staff via localStorage, keep that session
            if (localStorage.getItem('staffUser')) {
                setLoading(false);
                return;
            }

            setCurrentUser(user);
            if (user) {
                // Sync with DB and get role
                try {
                    const token = await user.getIdToken();
                    const res = await api.get('/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (mounted) setUserData(res.data);
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                }
            } else {
                if (mounted) setUserData(null);
            }
            if (mounted) setLoading(false);
        });


        // Safety timeout in case Firebase hangs (e.g. missing config)
        const timer = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth check timed out - forcing app load");
                setLoading(false);
            }
        }, 2000);

        return () => {
            mounted = false;
            unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const logout = async () => {
        localStorage.removeItem('staffUser');
        setCurrentUser(null);
        setUserData(null);
        if (auth) return firebaseSignOut(auth);
    };

    const loginAsStaff = (user) => {
        localStorage.setItem('staffUser', JSON.stringify(user));
        setCurrentUser({ 
            uid: user.id.toString(), 
            email: user.email, 
            phoneNumber: user.phone,
            getIdToken: async () => "mock-staff-token"
        });
        setUserData(user);
        setLoading(false);
    };

    const value = {
        currentUser,
        userData,
        loading,
        logout,
        loginAsStaff
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
