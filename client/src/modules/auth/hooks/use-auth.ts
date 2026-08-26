"use client";

import { useCallback, useEffect, useState } from "react";
import { authService } from "../services/auth.service";
import { authStorage } from "@/lib/auth/auth-storage";
import {
  AuthState,
  LoginRequest,
  RegisterRequest,
} from "../types/auth.types";

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const loadCurrentUser = useCallback(async () => {
    const token = authStorage.getToken();

    if (!token) {
      return {
        user: null,
        isAuthenticated: false,
      };
    }

    try {
      const user = await authService.getMe();

      return {
        user,
        isAuthenticated: true,
      };
    } catch {
      authStorage.removeToken();

      return {
        user: null,
        isAuthenticated: false,
      };
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      const result = await loadCurrentUser();

      if (cancelled) {
        return;
      }

      setState({
        user: result.user,
        isAuthenticated: result.isAuthenticated,
        isLoading: false,
      });
    };

    initializeAuth();

    return () => {
      cancelled = true;
    };
  }, [loadCurrentUser]);

  const login = async (data: LoginRequest) => {
  setIsLoggingIn(true);

  try {
    const response = await authService.login(data);

    const result = await loadCurrentUser();

    setState({
      user: result.user,
      isAuthenticated: result.isAuthenticated,
      isLoading: false,
    });

    return response;
  } finally {
    setIsLoggingIn(false);
  }
};

  const register = async (data: RegisterRequest) => {
  setIsRegistering(true);

  try {
    return await authService.register(data);
  } finally {
    setIsRegistering(false);
  }
};
  const logout = () => {
    authService.logout();

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const refreshUser = async () => {
    setState((current) => ({
      ...current,
      isLoading: true,
    }));

    const result = await loadCurrentUser();

    setState({
      user: result.user,
      isAuthenticated: result.isAuthenticated,
      isLoading: false,
    });
  };

  return {
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  isLoggingIn,
  isRegistering,
  login,
  register,
  logout,
  refreshUser,
};
}