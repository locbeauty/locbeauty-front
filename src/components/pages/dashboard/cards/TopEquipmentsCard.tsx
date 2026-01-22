"use client";

import { useEffect, useState } from "react";
// import { Badge } from "@/components/ui/badge";
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
import { getTopBookedGearsRanking } from "@/services/dashboard.service";

interface Filial {
  filialId: string;
  filialName: string;
}

interface TopGear {
  gearName: string;
  count: number;
  totalRevenue: number;
  occupancyRate: number;
}

export function TopEquipmentsCard() {
  const [ filials, setFilials ] = useState<Filial[]>([]);
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("all");
  const [ topGears, setTopGears ] = useState<TopGear[]>([]);

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

  // Fetch top gears
  useEffect(() => {
    async function fetchTopGears() {
      try {
        const currentYear = new Date().getFullYear();
        const { ranking } = await getTopBookedGearsRanking({
          year: currentYear,
          filialId: selectedFilialId === "all" ? undefined : selectedFilialId,
        });
        setTopGears(ranking);
      } catch (error) {
        console.error("Failed to fetch top gears", error);
      }
    }
    fetchTopGears();
  }, [ selectedFilialId ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="lg:col-span-2 relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Equipamentos Mais Locados</CardTitle>
            <CardDescription>
              Top 5 equipamentos por número de locações em{" "}
              {new Date().getFullYear()}
            </CardDescription>
          </div>
          <Select value={ selectedFilialId } onValueChange={ setSelectedFilialId }>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas as filiais" />
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
              <TableHead>Locações</TableHead>
              <TableHead>Receita</TableHead>
              {/* <TableHead>Taxa de Ocupação</TableHead> */}
              {/* <TableHead>Disponibilidade</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {topGears.length === 0 ? (
              <TableRow>
                <TableCell colSpan={ 3 } className="text-center">
                  Nenhum dado encontrado
                </TableCell>
              </TableRow>
            ) : (
              topGears.map((gear, index) => (
                <TableRow key={ index }>
                  <TableCell className="font-medium">{gear.gearName}</TableCell>
                  <TableCell>{gear.count}</TableCell>
                  <TableCell>
                    {formatCurrency(gear.totalRevenue / 100)}
                  </TableCell>
                  {/* <TableCell>{gear.occupancyRate}%</TableCell> */}
                  {/* <TableCell>
                    <Badge className="bg-green-500">Alta</Badge>
                  </TableCell> */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
