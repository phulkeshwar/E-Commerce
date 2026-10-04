import { useEffect, useState } from "react";
import { loginRequest, meRequest, registerRequest, googleLoginRequest, logoutRequest, updateProfileRequest } from "../api/auth.api";
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from "../store/authStore";

export function useAuth() {
  const [session, setSession] = useState(() => getStoredSession());
  const [loading, setLoading] = useState(false);

  const refreshUser = async () => {
    const storedSession = getStoredSession();
    if (!storedSession?.token) {
      return null;
    }

    try {
      const data = await meRequest();
      if (data?.user) {
        const nextSession = { ...storedSession, user: data.user };
        setSession(nextSession);
        setStoredSession(nextSession);
        return data.user;
      }
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
    }
    return null;
  };

  useEffect(() => {
    const storedSession = getStoredSession();
    if (!storedSession?.token) {
      return;
    }

    refreshUser();

    // Auto-refresh when tab regains focus (e.g. returning after verifying email in another tab)
    const handleFocus = () => {
      refreshUser();
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const login = async (payload) => {
    setLoading(true);
    try {
      const data = await loginRequest(payload);
      const nextSession = { user: data.user, token: data.token };
      setSession(nextSession);
      setStoredSession(nextSession);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const data = await registerRequest(payload);
      const nextSession = { user: data.user, token: data.token };
      setSession(nextSession);
      setStoredSession(nextSession);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (payload) => {
    setLoading(true);
    try {
      const data = await googleLoginRequest(payload);
      const nextSession = { user: data.user, token: data.token };
      setSession(nextSession);
      setStoredSession(nextSession);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (err) {
      console.error("Failed to call logout API:", err);
    }
    setSession(null);
    clearStoredSession();
  };

  const updateProfile = async (payload) => {
    setLoading(true);
    try {
      const data = await updateProfileRequest(payload);
      const nextSession = { ...session, user: data.user };
      setSession(nextSession);
      setStoredSession(nextSession);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  return {
    user: session?.user || null,
    token: session?.token || "",
    isAuthenticated: Boolean(session?.token),
    loading,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    refreshUser,
  };
}
