import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/api";

export type UserRole = "patient" | "doctor" | "admin";

interface Profile {
  full_name: string;
  email: string;
  phone?: string;
  specialization?: string;
  avatar_url?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  specialization?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

type AuthResponse = { token: string; user: User };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("medflow_token");
    if (!token) {
      setLoading(false);
      return;
    }
    apiRequest<{ user: User }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => {
        localStorage.removeItem("medflow_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string, _role: UserRole) => {
    try {
      const r = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("medflow_token", r.token);
      setUser(r.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || "Login failed" };
    }
  };

  const register = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      const r = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password, fullName, role }),
      });
      localStorage.setItem("medflow_token", r.token);
      setUser(r.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || "Registration failed" };
    }
  };

  const logout = async () => {
    localStorage.removeItem("medflow_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
