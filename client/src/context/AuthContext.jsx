import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        if (!auth) {
            console.warn('Auth is null (Guest Mode). Skipping Firebase listener.');
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!mounted) return;

            setCurrentUser(user);
            if (user) {
                // Sync with DB and get user role
                try {
                    const token = await user.getIdToken();
                    const res = await api.get('/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (mounted) setUserData(res.data);
                } catch (error) {
                    console.error('Failed to fetch user data', error);
                }
            } else {
                if (mounted) setUserData(null);
            }
            if (mounted) setLoading(false);
        });

        // Safety timeout in case Firebase hangs (e.g. missing config)
        const timer = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Auth check timed out - forcing app load');
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
        setCurrentUser(null);
        setUserData(null);
        if (auth) return firebaseSignOut(auth);
    };

    const value = {
        currentUser,
        userData,
        loading,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
