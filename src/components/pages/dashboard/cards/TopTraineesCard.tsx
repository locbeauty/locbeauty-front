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
import { getTopTraineesMetric } from "@/services/dashboard.service";

interface Filial {
  filialId: string;
  filialName: string;
}

interface TopTrainee {
  traineeId: string;
  name: string;
  count: number;
}

export function TopTraineesCard() {
  const [ filials, setFilials ] = useState<Filial[]>([]);
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("all");
  const [ topTrainees, setTopTrainees ] = useState<TopTrainee[]>([]);

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

  // Fetch top trainees
  useEffect(() => {
    async function fetchTopTrainees() {
      try {
        const currentYear = new Date().getFullYear();
        const { topTrainees } = await getTopTraineesMetric({
          year: currentYear,
          filialId: selectedFilialId === "all" ? undefined : selectedFilialId,
        });
        setTopTrainees(topTrainees);
      } catch (error) {
        console.error("Failed to fetch top trainees", error);
      }
    }
    fetchTopTrainees();
  }, [ selectedFilialId ]);

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
