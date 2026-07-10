"use client";
import { EmployeesTable } from "@/components/pages/employees/view/EmployeesTable";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/utils/routes";
import { Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

const EmployeeFilterStatusTypes = [
  "Todas",
  "Norte",
  "Nordeste",
  "Centro-Oeste",
  "Sudeste",
  "Sul",
];

export default function EmployeesPage() {
  const [ searchName, setSearchName ] = useState("");
  const debouncedSearchName = useDebounce(searchName, 500);
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("");

  return (
    <RouteGuard module={ SYSTEM_MODULES.EMPLOYEES }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
            <p className="text-muted-foreground">
              Gerencie o cadastro de funcionários
            </p>
          </div>
          <Can module={ SYSTEM_MODULES.EMPLOYEES } action="canCreate">
            <Button className="flex justify-center items-center" asChild>
              <Link href={ ROUTES.CREATE_EMPLOYEE }>
                <Plus className="" />
                <span className="hidden md:inline">Novo Funcionário</span>
              </Link>
            </Button>
          </Can>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar funcionários por nome..."
              className="pl-8"
              value={ searchName }
              onChange={ (e) => setSearchName(e.target.value) }
            />
          </div>
          <SelectFilial
            value={ selectedFilialId }
            onValueChange={ setSelectedFilialId }
            placeholder="Filial"
            className="w-[180px]"
          />
          {(searchName || selectedFilialId) && (
            <Button
              variant="ghost"
              onClick={ () => {
                setSearchName("");
                setSelectedFilialId("");
              } }
              size="icon"
              title="Limpar filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <EmployeesTable
          searchName={ debouncedSearchName }
          filialId={ selectedFilialId }
        />
      </div>
    </RouteGuard>
  );
}
