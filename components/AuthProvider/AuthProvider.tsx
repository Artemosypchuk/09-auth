"use client";

import { useEffect, useState, ReactNode } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { checkSession, getMe } from "@/lib/api/clientApi";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearIsAuthenticated = useAuthStore(
    (state) => state.clearIsAuthenticated,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const session = await checkSession();

        if (session) {
          const userData = await getMe();
          setUser(userData);
        } else {
          clearIsAuthenticated();
        }
      } catch (error) {
        console.error(error);
        clearIsAuthenticated();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSession();
  }, [setUser, clearIsAuthenticated]);

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}
