'use client';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useEffect, useState, ReactNode } from 'react';

const SUPER_ADMIN_UID = '5RBc7GzSyLTPnBh0NRzNZccp7aK2';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSuperAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsSuperAdmin(user?.uid === SUPER_ADMIN_UID);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, loading, isSuperAdmin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
