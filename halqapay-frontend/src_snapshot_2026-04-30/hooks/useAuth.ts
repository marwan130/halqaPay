import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";
import * as usersApi from "../api/users";
import { useAuthStore } from "../store/authStore";
import type { LoginPayload, RegisterPayload } from "../types";

export type AuthRedirectOptions = { redirectTo?: string };

export function useAuth() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const patchUser = useAuthStore((s) => s.patchUser);
  const logout = useAuthStore((s) => s.logout);

  const refreshUser = useCallback(async () => {
    const t = useAuthStore.getState().token;
    if (!t) return;
    const me = await usersApi.fetchMe();
    patchUser(usersApi.profileToUserSummary(me));
  }, [patchUser]);

  const login = useCallback(
    async (payload: LoginPayload, options?: AuthRedirectOptions) => {
      const res = await authApi.login(payload);
      setSession(res.token, res.user);
      navigate(options?.redirectTo ?? "/dashboard", { replace: true });
    },
    [navigate, setSession]
  );

  const register = useCallback(
    async (payload: RegisterPayload, options?: AuthRedirectOptions) => {
      const res = await authApi.register(payload);
      setSession(res.token, res.user);
      navigate(options?.redirectTo ?? "/dashboard", { replace: true });
    },
    [navigate, setSession]
  );

  const signOut = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  return {
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    register,
    signOut,
    refreshUser,
    patchUser
  };
}
