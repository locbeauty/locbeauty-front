"use client";

import { useAccess } from "@/contexts/access-provider";
import { useAuth } from "@/contexts/auth-provider";
import { SYSTEM_MODULES, AccessPermissions } from "@/utils/@types/access";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getFirstAccessibleRoute } from "@/utils/get-first-accessible-route";

const ROLE_DEFAULT_ROUTES: Record<string, string> = {
  Motorista: "/schedule",
  "Motorista Chefe": "/schedule",
  Comercial: "/schedule",
  Logistica: "/schedule",
};

interface RouteGuardProps {
  module: SYSTEM_MODULES;
  action?: keyof AccessPermissions;
  /** Cargos que acessam a página mesmo sem a permissão do módulo. */
  allowedRoles?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RouteGuard({
  module,
  action = "canView",
  allowedRoles,
  children,
  fallback,
}: RouteGuardProps) {
  const { can, accesses } = useAccess();
  const { user } = useAuth();
  const router = useRouter();
  const hasAccess =
    can(module, action) || !!allowedRoles?.includes(user?.role ?? "");

  useEffect(() => {
    if (!hasAccess) {
      const role = user?.role ?? "";
      if (ROLE_DEFAULT_ROUTES[role]) {
        router.replace(ROLE_DEFAULT_ROUTES[role]);
      } else {
        router.replace(getFirstAccessibleRoute(accesses as any, role));
      }
    }
  }, [hasAccess, user, accesses, router]);

  if (hasAccess) {
    return <>{children}</>;
  }

  return fallback ? (
    <>{fallback}</>
  ) : (
    <div className="flex flex-col items-center justify-center h-full w-full min-h-[50vh] space-y-4">
      <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
      <p className="text-muted-foreground">
        Você não tem permissão para acessar esta página.
      </p>
    </div>
  );
}
