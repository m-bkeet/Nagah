import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  alwaysRequireLogin: boolean;
  setAlwaysRequireLogin: (require: boolean) => void;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  canAccess: (allowedRoles: UserRole[]) => boolean;
  switchDemoUser: (role: UserRole) => Promise<void>;
  updateUserOptimistic: (updates: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'success_v7_user';
const STORAGE_KEY_TOKEN = 'success_v7_token';
const STORAGE_KEY_ALWAYS_ASK_LOGIN = 'nagah_always_ask_login';
const STORAGE_KEY_SAVED_USERNAME = 'nagah_saved_username';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alwaysRequireLogin, setAlwaysRequireLoginState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ALWAYS_ASK_LOGIN);
    return saved === null ? true : saved === 'true'; // Default to true for security and easy role rotation
  });

  const setAlwaysRequireLogin = (require: boolean) => {
    setAlwaysRequireLoginState(require);
    localStorage.setItem(STORAGE_KEY_ALWAYS_ASK_LOGIN, require ? 'true' : 'false');
  };

  useEffect(() => {
    try {
      // Check sessionStorage first, then fallback to localStorage so multiple browser tabs stay logged in
      const sessionUser = sessionStorage.getItem(STORAGE_KEY_USER);
      const sessionToken = sessionStorage.getItem(STORAGE_KEY_TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEY_USER);
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);

      const targetUser = sessionUser || storedUser;
      const targetToken = sessionToken || storedToken;

      // Reject & purge legacy unsigned/mock tokens so users receive a real HMAC-SHA256 signed token
      const isValidSignedToken = (tok: string | null) =>
        Boolean(tok && tok.startsWith('nagah_v1.') && tok.split('.').length === 3);

      if (targetUser && targetToken && isValidSignedToken(targetToken)) {
        let parsed = JSON.parse(targetUser);
        if (parsed.role === 'admin') parsed.role = 'super_admin';
        setUser(parsed);
        setToken(targetToken);
        if (!sessionUser) {
          try {
            sessionStorage.setItem(STORAGE_KEY_USER, targetUser);
            sessionStorage.setItem(STORAGE_KEY_TOKEN, targetToken);
          } catch {}
        }
      } else if (targetToken && !isValidSignedToken(targetToken)) {
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        sessionStorage.removeItem(STORAGE_KEY_USER);
        sessionStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Multi-tab real-time sync for auth state
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_USER) {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setUser(parsed);
          } catch {}
        } else {
          setUser(null);
          setToken(null);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Optimistic User Update with Background Sync and Rollback
  const updateUserOptimistic = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    const previousUser = { ...user };
    const optimisticUser = { ...user, ...updates };

    // 1. Instant local UI update
    setUser(optimisticUser);
    try {
      const userStr = JSON.stringify(optimisticUser);
      localStorage.setItem(STORAGE_KEY_USER, userStr);
      sessionStorage.setItem(STORAGE_KEY_USER, userStr);
    } catch {}

    // 2. Background sync to Server & Firebase
    try {
      await api.updateUser(user.id, updates);
      return true;
    } catch (err) {
      console.warn('[AuthContext] Background sync failed, rolling back:', err);
      // Rollback to previous state on failure
      setUser(previousUser);
      try {
        const prevStr = JSON.stringify(previousUser);
        localStorage.setItem(STORAGE_KEY_USER, prevStr);
        sessionStorage.setItem(STORAGE_KEY_USER, prevStr);
      } catch {}
      return false;
    }
  };

  const login = async (
    username: string,
    password: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanU = username.trim().toLowerCase();
    const cleanP = password.trim();

    if (!cleanU || !cleanP) {
      return { success: false, message: 'يرجى إدخال اسم المستخدم وكلمة المرور' };
    }

    try {
      const res = await api.login({ username: cleanU, password: cleanP });
      if (res.success && res.user && res.token) {
        setUser(res.user);
        setToken(res.token);

        if (rememberMe && !alwaysRequireLogin) {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
          localStorage.setItem(STORAGE_KEY_TOKEN, res.token);
          localStorage.setItem(STORAGE_KEY_SAVED_USERNAME, username);
        } else {
          sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
          sessionStorage.setItem(STORAGE_KEY_TOKEN, res.token);
          if (rememberMe) {
            localStorage.setItem(STORAGE_KEY_SAVED_USERNAME, username);
          }
          localStorage.removeItem(STORAGE_KEY_USER);
          localStorage.removeItem(STORAGE_KEY_TOKEN);
        }

        return { success: true };
      }
      return { success: false, message: (res as any)?.error || 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    } catch (err: any) {
      const rawMsg = err?.message || '';
      const errMsg = rawMsg.includes('405')
        ? 'الخادم غير متاح حالياً للتحقق من الدخول. يرجى المحاولة بعد قليل.'
        : (rawMsg || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      return { success: false, message: errMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_USER);
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);
  };

  const canAccess = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return allowedRoles.includes(user.role);
  };

  const switchDemoUser = async (role: UserRole) => {
    try {
      const currentRole = user?.role || 'trainee';
      const checkRes = await api.secureSwitchRole(currentRole, role);
      if (!checkRes.allowed) {
        console.warn('[AuthContext] Role switch denied:', checkRes.error);
        return;
      }

      const users = await api.getUsers();
      const match = users.find(u => u.role === role && u.status === 'active');
      if (match) {
        setUser(match);
        sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(match));
        if (localStorage.getItem(STORAGE_KEY_USER)) {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(match));
        }
      }
    } catch (err: any) {
      console.error('[AuthContext] Role switch verification failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, alwaysRequireLogin, setAlwaysRequireLogin, login, logout, canAccess, switchDemoUser, updateUserOptimistic }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
