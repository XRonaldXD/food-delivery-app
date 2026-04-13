import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, userApi, setToken, removeToken, getToken } from '../api/client';
import { User } from '../types';

/** Decode JWT payload without verifying signature (verification happens on the server). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string, name?: string, restaurantId?: string, restaurantPassword?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (body: { name?: string; phone?: string; email?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  // Restore token on app start and decode user from JWT payload
  useEffect(() => {
    getToken().then((token) => {
      if (token) {
        const payload = decodeJwtPayload(token);
        if (payload && typeof payload.userId === 'string' && typeof payload.role === 'string') {
          const restored: User = {
            id: payload.userId,
            email: '',
            role: payload.role as User['role'],
            name: '',
            restaurantId: typeof payload.restaurantId === 'string' ? payload.restaurantId : undefined,
          };
          setState({ user: restored, token, isLoading: false });
          return;
        }
      }
      setState({ user: null, token, isLoading: false });
    });
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await authApi.login({ email, password });
    await setToken(token);
    setState({ user, token, isLoading: false });
  };

  const register = async (email: string, password: string, role: string, name?: string, restaurantId?: string, restaurantPassword?: string) => {
    const { token, user } = await authApi.register({ email, password, role, name, restaurantId, restaurantPassword });
    await setToken(token);
    setState({ user, token, isLoading: false });
  };

  const logout = async () => {
    await removeToken();
    setState({ user: null, token: null, isLoading: false });
  };

  const updateProfile = async (body: { name?: string; phone?: string; email?: string; currentPassword?: string; newPassword?: string }) => {
    const updated = await userApi.updateProfile(body);
    setState((prev) => ({ ...prev, user: prev.user ? { ...prev.user, ...updated } : updated }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
