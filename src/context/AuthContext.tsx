import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export interface UserProfile {
    name: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    login: (email: string) => Promise<void>;
    updateProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for local "mock" session
        const storedUser = localStorage.getItem('inventory_user');
        const storedProfile = localStorage.getItem('inventory_profile');

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setSession({ user: parsedUser } as Session);
            } catch (e) {
                console.error('Failed to parse user', e);
            }
        }

        if (storedProfile) {
            try {
                setProfile(JSON.parse(storedProfile));
            } catch (e) {
                console.error('Failed to parse profile', e);
            }
        } else {
            // Default profile if none exists
            setProfile({ name: 'John Doe', role: 'Inventory Manager' });
        }

        setLoading(false);
    }, []);

    const login = async (email: string) => {
        // Mock Login
        const mockUser: any = {
            id: 'local-user-' + Math.random().toString(36).substr(2, 9),
            email: email,
            aud: 'authenticated',
            created_at: new Date().toISOString(),
        };

        const defaultProfile = { name: 'John Doe', role: 'Inventory Manager' };

        localStorage.setItem('inventory_user', JSON.stringify(mockUser));
        localStorage.setItem('inventory_profile', JSON.stringify(defaultProfile));

        setUser(mockUser);
        setSession({ user: mockUser } as Session);
        setProfile(defaultProfile);
    };

    const signOut = async () => {
        localStorage.removeItem('inventory_user');
        localStorage.removeItem('inventory_profile');
        setUser(null);
        setSession(null);
        setProfile(null);
    };

    const updateProfile = (newProfile: UserProfile) => {
        setProfile(newProfile);
        localStorage.setItem('inventory_profile', JSON.stringify(newProfile));
    };

    const value = {
        session,
        user,
        profile,
        loading,
        signOut,
        login,
        updateProfile
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
