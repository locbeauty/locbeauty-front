"use client";

import { useAccess } from "@/contexts/access-provider";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { ReactNode } from "react";

interface CanProps {
  module: SYSTEM_MODULES;
  action: "canView" | "canCreate" | "canEdit";
  filialId?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({
  module,
  action,
  filialId,
  children,
  fallback = null,
}: CanProps) {
  const { can } = useAccess();

  if (can(module, action, filialId)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
