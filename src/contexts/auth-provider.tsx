"use client";

import { Loader2 } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
import { redirect } from "next/navigation";

type User = {
  sub: string;
  employeeName: string;
  role: string;
  email: string | null;
  sourceFilial: {
    filialId: string;
    description: string;
  };
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  handleLogout?: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ user, setUser ] = useState<User | null>(null);
  const [ isLoading, setIsLoading ] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        redirect("/login");
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("accessToken");
          throw new Error("Não autenticado");
        }

        const data = await res.json();
        setUser(data.user);
      } catch {
        localStorage.removeItem("token");
        redirect("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  async function handleLogout() {
    localStorage.removeItem("accessToken");
    redirect("/login");
  }

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader2 size={ 28 } className="animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={ { user, isLoading, handleLogout } }>
      {children}
    </AuthContext.Provider>
  );
}
