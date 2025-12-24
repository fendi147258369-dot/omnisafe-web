"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../lib/api";

type User = {
  id?: string | number;
  email?: string;
  provider?: string;
  display_name?: string;
  avatar?: string;
  plan_label?: string | null;
  prepaid_credits?: number | null;
  subscription_credits?: number | null;
  total_credits?: number | null;
};

type UserContextValue = {
  user: User | null;
  loaded: boolean;
  refresh: () => Promise<void>;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  loaded: false,
  refresh: async () => undefined,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [tokenSnapshot, setTokenSnapshot] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  );

  const fetchUser = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    setTokenSnapshot(token);
    if (!token) {
      setUser(null);
      setLoaded(true);
      return;
    }
    try {
      setLoaded(false);
      const data = await api("/auth/me");
      setUser(data ?? null);
      if (data?.email) {
        localStorage.setItem("user_email", data.email);
      }
      if (data?.provider) {
        localStorage.setItem("auth_provider", data.provider);
      }
    } catch {
      setUser(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rerun = () => fetchUser();
    const tokenPoll = () => {
      const current = localStorage.getItem("access_token");
      if (current !== tokenSnapshot) {
        fetchUser();
      }
    };
    window.addEventListener("auth-changed", rerun);
    window.addEventListener("storage", rerun);
    const interval = window.setInterval(tokenPoll, 1500);
    return () => {
      window.removeEventListener("auth-changed", rerun);
      window.removeEventListener("storage", rerun);
      window.clearInterval(interval);
    };
  }, [fetchUser, tokenSnapshot]);

  return (
    <UserContext.Provider
      value={{
        user,
        loaded,
        refresh: fetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
