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
import { USER_ROLES } from "@/utils/constants";
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
  getAccessibleFilialsForCreate: (
    module: SYSTEM_MODULES
  ) => { filialId: string; filialName: string }[];
  reloadAccesses: () => Promise<void>;
};

const AccessContext = createContext<AccessContextType>({
    accesses: [],
    isLoading: true,
    can: () => false,
    getAccessibleFilialsForCreate: () => [],
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
            // ADMIN Bypass
            if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER)
                return true;

            // If specific filialId provided, find exact permission
            if (filialId) {
                const permission = accesses.find(
                    (a) => a.module === module && a.filialId === filialId
                );
                if (!permission) return false;
                return !!permission[action];
            }

            // If filialId NOT provided, check if they have the permission in ANY filial
            return accesses.some((a) => a.module === module && !!a[action]);
        },
        [ accesses, user?.role ]
    );

    const getAccessibleFilialsForCreate = useCallback(
        (module: SYSTEM_MODULES) => {
            // ADMIN/MASTER bypass - they have access to all filials
            // For now, we return empty array to indicate they should see the select
            // The SelectFilial component will fetch all available filials
            if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER) {
                return [];
            }

            // Filter accesses with canCreate = true for the specific module
            const createAccesses = accesses.filter(
                (a) => a.module === module && a.canCreate
            );

            // Map to return unique filials
            const uniqueFilials = createAccesses
                .map((a) => ({
                    filialId: a.filialId,
                    filialName: a.Filial.filialName,
                }))
                .filter(
                    (filial, index, self) =>
                        index === self.findIndex((f) => f.filialId === filial.filialId)
                );

            return uniqueFilials;
        },
        [ accesses, user?.role ]
    );

    const value = {
        accesses,
        isLoading,
        can,
        getAccessibleFilialsForCreate,
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
