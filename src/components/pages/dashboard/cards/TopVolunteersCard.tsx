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
import { getTopVolunteersMetric } from "@/services/dashboard.service";

interface TopVolunteer {
  customerId: string;
  name: string;
  count: number;
}

export function TopVolunteersCard({
  filialIds,
}: {
  /** Filtro geral da aba (o card não tem filtro próprio). */
  filialIds: string[];
}) {
  const [ topVolunteers, setTopVolunteers ] = useState<TopVolunteer[]>([]);

  // Fetch top volunteers
  useEffect(() => {
    async function fetchTopVolunteers() {
      try {
        const currentYear = new Date().getFullYear();
        const { topVolunteers } = await getTopVolunteersMetric({
          year: currentYear,
          filialIds,
        });
        setTopVolunteers(topVolunteers);
      } catch (error) {
        console.error("Failed to fetch top volunteers", error);
      }
    }
    fetchTopVolunteers();
  }, [ filialIds ]);

  return (
    <Card className="col-span-1 relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Modelos Mais Frequentes</CardTitle>
            <CardDescription>
              Top 5 modelos por participação em {new Date().getFullYear()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modelo</TableHead>
              <TableHead className="text-right">Participações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topVolunteers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={ 2 } className="text-center">
                  Nenhum dado encontrado
                </TableCell>
              </TableRow>
            ) : (
              topVolunteers.map((volunteer, index) => (
                <TableRow key={ index }>
                  <TableCell className="font-medium">
                    {volunteer.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {volunteer.count}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
