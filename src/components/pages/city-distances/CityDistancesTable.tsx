"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, MapPin } from "lucide-react";
import {
  fetchCityDistances,
  deleteCityDistance,
} from "@/services/city-distances.service";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CityDistancesTableProps {
  filialId: string;
  searchFilter?: string;
}

interface DistanceToDelete {
  id: string;
  name: string;
}

export function CityDistancesTable({
  filialId,
  searchFilter,
}: CityDistancesTableProps) {
  const queryClient = useQueryClient();
  const [ distanceToDelete, setDistanceToDelete ] =
    useState<DistanceToDelete | null>(null);

  const {
    data: distances = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: [ "city-distances", filialId ],
    queryFn: () => fetchCityDistances(filialId),
    enabled: !!filialId,
  });

  const { mutateAsync: deleteDistance, isPending: isDeleting } = useMutation({
    mutationFn: deleteCityDistance,
    onSuccess: () => {
      toast.success("Distância removida com sucesso!");
      queryClient.invalidateQueries({ queryKey: [ "city-distances" ] });
      setDistanceToDelete(null);
    },
    onError: () => {
      toast.error("Erro ao remover distância.");
    },
  });

  const filteredDistances = distances.filter((d) =>
    searchFilter
      ? d.cityName.toLowerCase().includes(searchFilter.toLowerCase())
      : true,
  );

  if (!filialId) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Selecione uma filial para visualizar as distâncias cadastradas.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Erro ao carregar distâncias. Tente novamente.
      </div>
    );
  }

  if (distances.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-muted/10">
        <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium">Nenhuma distância cadastrada</h3>
        <p className="text-sm text-muted-foreground">
          Use o botão &quot;Nova Distância&quot; para cadastrar manualmente.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cidade</TableHead>
            <TableHead>UF</TableHead>
            <TableHead>Distância (km)</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDistances.length > 0 ? (
            filteredDistances.map((distance, index) => (
              <TableRow key={ distance.cityDistanceId || `fallback-${index}` }>
                <TableCell className="font-medium">
                  {distance.cityName || JSON.stringify(distance)}
                </TableCell>
                <TableCell>{distance.state}</TableCell>
                <TableCell>{distance.distance} km</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    onClick={ () =>
                      setDistanceToDelete({
                        id: distance.cityDistanceId,
                        name: `${distance.cityName} - ${distance.state}`,
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={ 4 } className="h-24 text-center">
                Nenhuma cidade encontrada com o filtro &quot;{searchFilter}
                &quot;.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog
        open={ !!distanceToDelete }
        onOpenChange={ (open) => !open && setDistanceToDelete(null) }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remover distância?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o cadastro de{" "}
              <strong>{distanceToDelete?.name}</strong>? Essa ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={ () => setDistanceToDelete(null) }>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={ () => {
                if (distanceToDelete) {
                  deleteDistance(distanceToDelete.id);
                }
              } }
              disabled={ isDeleting }
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Remover"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
