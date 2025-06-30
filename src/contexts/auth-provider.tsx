"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
    sub: string
    employeeName: string
    role: string
    email: string | null
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
}

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
            try {
                const res = await fetch("http://localhost:3333/api/me", { next: { tags: [ "get-logged-user" ] }, credentials: "include" });

                if (!res.ok) throw new Error("Não autenticado");

                const data = await res.json();
                setUser(data.user);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={ { user, isLoading } }>
            {children}
        </AuthContext.Provider>
    );
}
