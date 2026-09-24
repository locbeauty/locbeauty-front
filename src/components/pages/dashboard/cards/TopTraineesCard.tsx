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
import { getTopTraineesMetric } from "@/services/dashboard.service";
import { DashboardFilialSelect } from "../DashboardFilialSelect";

interface TopTrainee {
  traineeId: string;
  name: string;
  count: number;
}

export function TopTraineesCard({
  filialIds: generalFilialIds,
}: {
  filialIds: string[];
}) {
  // Começa (e é reposto) pelo filtro geral da aba; o card pode refinar.
  const [ filialIds, setFilialIds ] = useState(generalFilialIds);
  useEffect(() => setFilialIds(generalFilialIds), [ generalFilialIds ]);
  const [ topTrainees, setTopTrainees ] = useState<TopTrainee[]>([]);

  // Fetch top trainees
  useEffect(() => {
    async function fetchTopTrainees() {
      try {
        const currentYear = new Date().getFullYear();
        const { topTrainees } = await getTopTraineesMetric({
          year: currentYear,
          filialIds,
        });
        setTopTrainees(topTrainees);
      } catch (error) {
        console.error("Failed to fetch top trainees", error);
      }
    }
    fetchTopTrainees();
  }, [ filialIds ]);

  return (
    <Card className="col-span-1 relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Alunos Mais Assíduos</CardTitle>
            <CardDescription>
              Top 5 alunos por frequência em {new Date().getFullYear()}
            </CardDescription>
          </div>
          <DashboardFilialSelect value={ filialIds } onChange={ setFilialIds } />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead className="text-right">Treinamentos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topTrainees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={ 2 } className="text-center">
                  Nenhum dado encontrado
                </TableCell>
              </TableRow>
            ) : (
              topTrainees.map((trainee, index) => (
                <TableRow key={ index }>
                  <TableCell className="font-medium">{trainee.name}</TableCell>
                  <TableCell className="text-right">{trainee.count}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
