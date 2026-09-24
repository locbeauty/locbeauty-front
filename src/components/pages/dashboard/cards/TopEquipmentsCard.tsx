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
import { getTopBookedGearsRanking } from "@/services/dashboard.service";
import { DashboardFilialSelect } from "../DashboardFilialSelect";

interface TopGear {
  gearName: string;
  count: number;
  totalRevenue: number;
  occupancyRate: number;
}

export function TopEquipmentsCard({
  filialIds: generalFilialIds,
  year,
}: {
  filialIds: string[];
  /** Ano do filtro geral da aba. */
  year: number;
}) {
  // Começa (e é reposto) pelo filtro geral da aba; o card pode refinar.
  const [ filialIds, setFilialIds ] = useState(generalFilialIds);
  useEffect(() => setFilialIds(generalFilialIds), [ generalFilialIds ]);
  const [ topGears, setTopGears ] = useState<TopGear[]>([]);

  // Fetch top gears
  useEffect(() => {
    async function fetchTopGears() {
      try {
        const { ranking } = await getTopBookedGearsRanking({
          year,
          filialIds,
        });
        setTopGears(ranking);
      } catch (error) {
        console.error("Failed to fetch top gears", error);
      }
    }
    fetchTopGears();
  }, [ filialIds, year ]);

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
              Top 5 equipamentos por número de locações em {year}
            </CardDescription>
          </div>
          <DashboardFilialSelect value={ filialIds } onChange={ setFilialIds } />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipamento</TableHead>
              <TableHead>Locações</TableHead>
              <TableHead>Recebido</TableHead>
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
