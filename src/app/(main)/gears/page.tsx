"use client";

import { useState } from "react";

import { GearsTable } from "@/components/pages/gears/view/GearsTable";
import { Can } from "@/components/auth/Can";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { FilialFilter } from "@/components/pages/customers/view/FilialFilter";
import { CustomFilterSelect } from "@/components/shared/CustomFilterSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/utils/routes";
import { Plus, Search, X } from "lucide-react";
import Link from "next/link";

export default function GearsPage() {
  const [ searchName, setSearchName ] = useState("");
  const [ filialId, setFilialId ] = useState("");

  return (
    <RouteGuard module={ SYSTEM_MODULES.GEARS }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
            <p className="text-muted-foreground">
              Gerencie o cadastro de equipamentos
            </p>
          </div>
          <Can module={ SYSTEM_MODULES.GEARS } action="canCreate">
            <Button className="flex justify-center items-center" asChild>
              <Link href={ ROUTES.CREATE_GEAR }>
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Novo Equipamento</span>
              </Link>
            </Button>
          </Can>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar equipamentos..."
              className="pl-8 pr-8"
              value={ searchName }
              onChange={ (e) => setSearchName(e.target.value) }
            />
            {searchName && (
              <button
                onClick={ () => setSearchName("") }
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <FilialFilter
            value={ filialId || "ALL" }
            onChange={ (value) => setFilialId(value === "ALL" ? "" : value) }
          />
        </div>

        <GearsTable searchName={ searchName } filialId={ filialId } />
      </div>
    </RouteGuard>
  );
}
