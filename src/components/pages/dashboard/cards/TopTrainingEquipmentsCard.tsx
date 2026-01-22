"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/api";
import { getTopTrainingEquipmentsMetric } from "@/services/dashboard.service";

interface Filial {
  filialId: string;
  filialName: string;
}

interface TopEquipment {
  gearId: string;
  name: string;
  count: number;
}

export function TopTrainingEquipmentsCard() {
  const [ filials, setFilials ] = useState<Filial[]>([]);
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("all");
  const [ topEquipments, setTopEquipments ] = useState<TopEquipment[]>([]);

  // Fetch filials on mount
  useEffect(() => {
    async function fetchFilials() {
      try {
        const { data } = await apiRequest<Filial[]>({
          endpoint: "filials",
          method: "GET",
        });
        if (data) {
          setFilials(data);
        }
      } catch (error) {
        console.error("Failed to fetch filials", error);
      }
    }
    fetchFilials();
  }, []);

  // Fetch top equipments
  useEffect(() => {
    async function fetchTopEquipments() {
      try {
        const currentYear = new Date().getFullYear();
        const { topEquipments } = await getTopTrainingEquipmentsMetric({
          year: currentYear,
          filialId: selectedFilialId === "all" ? undefined : selectedFilialId,
        });
        setTopEquipments(topEquipments);
      } catch (error) {
        console.error("Failed to fetch top training equipments", error);
      }
    }
    fetchTopEquipments();
  }, [ selectedFilialId ]);

  return (
    <Card className="col-span-1 relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Equipamentos Mais Utilizados</CardTitle>
            <CardDescription>
              Top 5 equipamentos em treinamentos em {new Date().getFullYear()}
            </CardDescription>
          </div>
          <Select value={ selectedFilialId } onValueChange={ setSelectedFilialId }>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as filiais</SelectItem>
              {filials.map((fil) => (
                <SelectItem key={ fil.filialId } value={ fil.filialId }>
                  {fil.filialName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipamento</TableHead>
              <TableHead className="text-right">Utilizações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topEquipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={ 2 } className="text-center">
                  Nenhum dado encontrado
                </TableCell>
              </TableRow>
            ) : (
              topEquipments.map((item, index) => (
                <TableRow key={ index }>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
