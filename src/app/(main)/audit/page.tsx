"use client";

import { RouteGuard } from "@/components/auth/RouteGuard";
import { DeletedCheckoutsTable } from "@/components/pages/audit/DeletedCheckoutsTable";
import { ImportBatchesTable } from "@/components/pages/audit/ImportBatchesTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccess } from "@/contexts/access-provider";
import { useAuth } from "@/contexts/auth-provider";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import {
  DELETED_CHECKOUTS_AUDIT_ROLES,
  canViewDeletedCheckoutsAudit,
} from "@/utils/audit-access";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuditPage() {
  const router = useRouter();
  const { can } = useAccess();
  const { user } = useAuth();

  // Importações seguem o módulo Auditoria; agendamentos excluídos são
  // liberados por cargo (Master, Gerente e Comercial).
  const canViewImports = can(SYSTEM_MODULES.AUDITORIA, "canView");
  const canViewDeletedCheckouts = canViewDeletedCheckoutsAudit(user?.role);

  const description =
    canViewImports && canViewDeletedCheckouts
      ? "Importações realizadas no sistema e agendamentos excluídos"
      : canViewDeletedCheckouts
        ? "Agendamentos excluídos da agenda e quem os excluiu"
        : "Importações realizadas no sistema e reversão de lotes";

  return (
    <RouteGuard
      module={ SYSTEM_MODULES.AUDITORIA }
      allowedRoles={ DELETED_CHECKOUTS_AUDIT_ROLES }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={ () => router.back() }>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Auditoria</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>

        {canViewImports && canViewDeletedCheckouts ? (
          <Tabs defaultValue="importacoes" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:w-[420px]">
              <TabsTrigger value="importacoes">Importações</TabsTrigger>
              <TabsTrigger value="agendamentos-excluidos">
                Agendamentos excluídos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="importacoes" className="space-y-4">
              <ImportBatchesTable />
            </TabsContent>

            <TabsContent value="agendamentos-excluidos" className="space-y-4">
              <DeletedCheckoutsTable />
            </TabsContent>
          </Tabs>
        ) : canViewDeletedCheckouts ? (
          <DeletedCheckoutsTable />
        ) : (
          <ImportBatchesTable />
        )}
      </div>
    </RouteGuard>
  );
}
