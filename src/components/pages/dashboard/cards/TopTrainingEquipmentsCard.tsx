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
import { getTopTrainingEquipmentsMetric } from "@/services/dashboard.service";
import { DashboardFilialSelect } from "../DashboardFilialSelect";

interface TopEquipment {
  gearId: string;
  name: string;
  count: number;
}

export function TopTrainingEquipmentsCard({
  filialIds: generalFilialIds,
}: {
  filialIds: string[];
}) {
  // Começa (e é reposto) pelo filtro geral da aba; o card pode refinar.
  const [ filialIds, setFilialIds ] = useState(generalFilialIds);
  useEffect(() => setFilialIds(generalFilialIds), [ generalFilialIds ]);
  const [ topEquipments, setTopEquipments ] = useState<TopEquipment[]>([]);

  // Fetch top equipments
  useEffect(() => {
    async function fetchTopEquipments() {
      try {
        const currentYear = new Date().getFullYear();
        const { topEquipments } = await getTopTrainingEquipmentsMetric({
          year: currentYear,
          filialIds,
        });
        setTopEquipments(topEquipments);
      } catch (error) {
        console.error("Failed to fetch top training equipments", error);
      }
    }
    fetchTopEquipments();
  }, [ filialIds ]);

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
          <DashboardFilialSelect value={ filialIds } onChange={ setFilialIds } />
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
