"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { Search, X } from "lucide-react";
import { CityDistancesTable } from "@/components/pages/city-distances/CityDistancesTable";
import { CreateCityDistanceDialog } from "@/components/pages/city-distances/CreateCityDistanceDialog";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";
import { useDebounce } from "@/hooks/use-debounce";

export default function CityDistancesPage() {
  const { user } = useAuth();
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>(
    user?.sourceFilialId || "",
  );
  const [ searchQuery, setSearchQuery ] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  // If user is Master, they can select any filial, otherwise default to their own sourceFilial
  // But SelectFilial handles permissions internally usually.

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Distâncias Manuais
          </h1>
          <p className="text-muted-foreground">
            Gerencie as distâncias entre cidades e filiais para cálculo de
            frete.
          </p>
        </div>
        <CreateCityDistanceDialog preSelectedFilialId={ selectedFilialId } />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar cidade..."
            className="pl-8"
            value={ searchQuery }
            onChange={ (e) => setSearchQuery(e.target.value) }
          />
        </div>
        <SelectFilial
          value={ selectedFilialId }
          onValueChange={ setSelectedFilialId }
          placeholder="Selecione a Filial"
          className="w-[250px]"
          defaultFilial={ user?.sourceFilialId }
        />
        {(searchQuery ||
          (user?.role === USER_ROLES.MASTER &&
            selectedFilialId !== user.sourceFilialId)) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={ () => {
              setSearchQuery("");
              if (user?.role === USER_ROLES.MASTER) setSelectedFilialId("");
            } }
            title="Limpar filtros"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <CityDistancesTable
        filialId={ selectedFilialId }
        searchFilter={ debouncedSearch }
      />
    </div>
  );
}
