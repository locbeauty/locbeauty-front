"use client";

import { Loader2 } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
import { redirect } from "next/navigation";

type User = {
    sub: string
    employeeName: string
    role: string
    email: string | null
    sourceFilial: {
            filialId: string,
            description: string,
        }
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  handleLogout?: () => void
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
                const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/me`, { next: { tags: [ "get-logged-user" ] }, credentials: "include", headers: {
                    "Access-Control-Allow-Origin": "true"

                } });

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

    async function handleLogout() {
        setIsLoading(true);
        await fetch("http://localhost:3000/api/logout");
        setIsLoading(false);
        redirect("/login");
    }

    // useEffect(() => {
    //     console.log("user: ", user);
    // }, [ user ]);

    return (
        <AuthContext.Provider value={ { user, isLoading, handleLogout } }>
            {user ? children : (
                <div className="h-screen flex justify-center items-center">
                    <Loader2 size={ 28 } className="animate-spin" />
                </div>
            )}
        </AuthContext.Provider>
    );
}
