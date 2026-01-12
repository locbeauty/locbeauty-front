"use client";
import { CustomersTable } from "@/components/pages/customers/view/CustomersTable";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { CustomFilterSelect } from "@/components/shared/CustomFilterSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/utils/routes";
import { Plus, Search, Upload } from "lucide-react";
import Link from "next/link";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { useState } from "react";
import { ImportCustomersDialog } from "@/components/pages/customers/ImportCustomersDialog";

const CustomerFilterStatusTypes = [
  "Ativo",
  "Inativo",
  "Inadimplente",
  "Bloqueado",
];

export default function CustomersPage() {
  const [ dialogImportCustomers, setDialogImportCustomers ] = useState(false);

  return (
    <RouteGuard module={ SYSTEM_MODULES.CUSTOMERS }>
      <div className="">
        <div className="flex items-center justify-between space-y-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie o cadastro de clientes
            </p>
          </div>
          <Can module={ SYSTEM_MODULES.CUSTOMERS } action="canCreate">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={ () => setDialogImportCustomers(true) }
              >
                <Upload className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Importar</span>
              </Button>
              <Button className="flex justify-center items-center" asChild>
                <Link href={ ROUTES.CREATE_CUSTOMER }>
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden md:inline">Novo Cliente</span>
                </Link>
              </Button>
            </div>
          </Can>
        </div>

        <CustomersTable />

        <ImportCustomersDialog
          open={ dialogImportCustomers }
          onOpenChange={ setDialogImportCustomers }
        />
      </div>
    </RouteGuard>
  );
}
