"use client";

import { useAccess } from "@/contexts/access-provider";
import { SYSTEM_MODULES, AccessPermissions } from "@/utils/@types/access";
import { ReactNode } from "react";

interface RouteGuardProps {
  module: SYSTEM_MODULES;
  action?: keyof AccessPermissions;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RouteGuard({
  module,
  action = "canView",
  children,
  fallback = (
    <div className="flex flex-col items-center justify-center h-full w-full min-h-[50vh] space-y-4">
      <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
      <p className="text-muted-foreground">
        Você não tem permissão para acessar esta página.
      </p>
    </div>
  ),
}: RouteGuardProps) {
  const { can } = useAccess();

  if (can(module, action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
