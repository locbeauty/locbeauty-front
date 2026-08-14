"use client";

import { RouteGuard } from "@/components/auth/RouteGuard";
import { ImportBatchesTable } from "@/components/pages/audit/ImportBatchesTable";
import { Button } from "@/components/ui/button";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuditPage() {
  const router = useRouter();

  return (
    <RouteGuard module={ SYSTEM_MODULES.AUDITORIA }>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={ () => router.back() }>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Auditoria</h1>
            <p className="text-muted-foreground">
              Importações realizadas no sistema e reversão de lotes
            </p>
          </div>
        </div>

        <ImportBatchesTable />
      </div>
    </RouteGuard>
  );
}
