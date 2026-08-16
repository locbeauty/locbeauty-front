"use client";

import { useState } from "react";

import { FilialsTable } from "@/components/pages/filials/view/FilialTable";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/utils/routes";
import { Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { Can } from "@/components/auth/Can";
import { SYSTEM_MODULES } from "@/utils/@types/access";

export default function FilialsPage() {
  const [ searchTerm, setSearchTerm ] = useState("");

  return (
    <RouteGuard module={ SYSTEM_MODULES.FILIALS }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Filiais</h1>
            <p className="text-muted-foreground">
              Gerencie o cadastro de filiais
            </p>
          </div>
          <Can module={ SYSTEM_MODULES.FILIALS } action="canCreate">
            <Button className="flex justify-center items-center" asChild>
              <Link href={ ROUTES.CREATE_FILIAL }>
                <Plus className="" />
                <span className="hidden md:inline">Nova filial</span>
              </Link>
            </Button>
          </Can>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nome, cidade, gerente ou e-mail..."
              className="pl-8 pr-8"
              value={ searchTerm }
              onChange={ (e) => setSearchTerm(e.target.value) }
            />
            {searchTerm && (
              <button
                type="button"
                onClick={ () => setSearchTerm("") }
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Limpar busca</span>
              </button>
            )}
          </div>
        </div>

        <FilialsTable searchTerm={ searchTerm } />
      </div>
    </RouteGuard>
  );
}
