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
import { getTopVolunteersMetric } from "@/services/dashboard.service";

interface Filial {
  filialId: string;
  filialName: string;
}

interface TopVolunteer {
  volunteerId: string;
  name: string;
  count: number;
}

export function TopVolunteersCard() {
  const [ filials, setFilials ] = useState<Filial[]>([]);
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("all");
  const [ topVolunteers, setTopVolunteers ] = useState<TopVolunteer[]>([]);

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

  // Fetch top volunteers
  useEffect(() => {
    async function fetchTopVolunteers() {
      try {
        const currentYear = new Date().getFullYear();
        const { topVolunteers } = await getTopVolunteersMetric({
          year: currentYear,
          filialId: selectedFilialId === "all" ? undefined : selectedFilialId,
        });
        setTopVolunteers(topVolunteers);
      } catch (error) {
        console.error("Failed to fetch top volunteers", error);
      }
    }
    fetchTopVolunteers();
  }, [ selectedFilialId ]);

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
