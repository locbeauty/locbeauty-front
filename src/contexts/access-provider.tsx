"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";
import { getEmployeeAccesses } from "@/services/access.service";
import { EmployeeAccess, SYSTEM_MODULES } from "@/utils/@types/access";
import { Loader2 } from "lucide-react";

type AccessContextType = {
  accesses: EmployeeAccess[];
  isLoading: boolean;
  can: (
    module: SYSTEM_MODULES,
    action: "canView" | "canCreate" | "canEdit",
    filialId?: string
  ) => boolean;
  reloadAccesses: () => Promise<void>;
};

const AccessContext = createContext<AccessContextType>({
    accesses: [],
    isLoading: true,
    can: () => false,
    reloadAccesses: async () => {},
});

export const useAccess = () => useContext(AccessContext);

export function AccessProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [ accesses, setAccesses ] = useState<EmployeeAccess[]>([]);
    const [ isLoading, setIsLoading ] = useState(true);

    const fetchAccesses = useCallback(async () => {
        if (!user?.sub) {
            setAccesses([]);
            setIsLoading(false);
            return;
        }

        try {
            // Check if user is MASTER/ADMIN first?
            // For now, assuming RBAC via DB even for admins, or we can hardcode admin bypass here.
            // Let's stick to DB accesses.

            const data = await getEmployeeAccesses(user.sub);
            setAccesses(data);
        } catch (error) {
            console.error("Failed to load accesses", error);
        } finally {
            setIsLoading(false);
        }
    }, [ user?.sub ]);

    useEffect(() => {
        if (user) {
            fetchAccesses();
        } else {
            // If no user (e.g. logging out), clear accesses
            setAccesses([]);
            setIsLoading(false);
        }
    }, [ fetchAccesses, user ]);

    const pathname = usePathname();

    useEffect(() => {
        if (user) {
            fetchAccesses();
        }
    }, [ pathname, fetchAccesses, user ]);

    const can = useCallback(
        (
            module: SYSTEM_MODULES,
            action: "canView" | "canCreate" | "canEdit",
            filialId?: string
        ) => {
            // ADMIN Bypass (Optional - based on requirement. Assuming 'ADMIN' role in User exists)
            if (user?.role === "ADMIN" || user?.role === "MASTER") return true;

            // Find relevant permission
            const permission = accesses.find((a) => {
                const moduleMatch = a.module === module;
                // If filialId provided, match it. If not, match "any"?
                // Usually "global" access check means "do they have this access in ANY filial"
                // OR "do they have this access in CURRENT context's filial".
                // If filialId is NOT provided, it depends on the use case.
                // Strict mode: if no filialId passed, we might check if they have it in AT LEAST ONE place?
                // Let's implement: if filialId provided, exact match.
                // If NO filialId provided, return true if they have it for ANY filial (e.g. can view "Employees" page at all).

                if (filialId) {
                    return moduleMatch && a.filialId === filialId;
                }
                return moduleMatch;
            });

            if (!permission) return false;

            return !!permission[action];
        },
        [ accesses, user?.role ]
    );

    const value = {
        accesses,
        isLoading,
        can,
        reloadAccesses: fetchAccesses,
    };

    if (isLoading && user) {
    // Optional: Block UI until accesses are loaded?
    // Or render children and let components handle loading state via context?
    // Blocking is safer to avoid UI flicker of forbidden elements.
        return null; // Or a spinner
    }

    return (
        <AccessContext.Provider value={ value }>{children}</AccessContext.Provider>
    );
}
