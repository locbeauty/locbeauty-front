"use client";

import { useQuery } from "@tanstack/react-query";
import { GetNotices } from "@/services/notices.service";
import { ApiResponse } from "@/lib/api";
import { Notice } from "@/utils/@types/notice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useMemo } from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-provider";
import { minutesToHHMM } from "@/utils/minutesToHHMM";

import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { NoticeDetailsDialog } from "@/components/pages/calendar/DetailsDialog/NoticeDetailsDialog";
import { useAccess } from "@/contexts/access-provider";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { SelectFilial } from "@/components/shared/SelectFilial";

export function NoticesTable() {
  const { user } = useAuth();
  const { accesses } = useAccess();

  const [ startDate, setStartDate ] = useState<Date | undefined>(
    startOfMonth(new Date()),
  );

  const [ filialId, setFilialId ] = useState<string | undefined>();

  const accessibleFilialsIds = useMemo(() => {
    if (user?.role === "ADMIN" || user?.role === "MASTER") {
      return undefined;
    }
    const permissions = accesses
      .filter((a) => a.module === SYSTEM_MODULES.NOTICES && a.canView)
      .map((a) => a.filialId);
    const uniquePermissions = Array.from(new Set(permissions));
    return uniquePermissions.length > 0 ? uniquePermissions : [ "NO_ACCESS" ];
  }, [ user, accesses ]);

  const [ selectedNotice, setSelectedNotice ] = useState<Notice | null>(null);
  const [ isDetailsOpen, setIsDetailsOpen ] = useState(false);

  const { data, isLoading, error } = useQuery<ApiResponse<Notice[]>, Error>({
    queryKey: [ "get-notices", startDate, filialId ],
    queryFn: () => {
      const computedEndDate = startDate ? endOfMonth(startDate) : undefined;
      return GetNotices({
        startDate: startDate?.toISOString() || "",
        endDate: computedEndDate?.toISOString() || "",
        filialId,
        filterByStartDateOnly: true,
      });
    },
    enabled: !!startDate,
  });

  const notices = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end">
        <div className="space-y-2">
          <Label>Data Início</Label>
          <DatePicker value={ startDate || null } onChange={ setStartDate } />
        </div>

        <div className="space-y-2 min-w-[200px]">
          <Label>Filial</Label>
          <SelectFilial
            value={ filialId }
            onValueChange={ setFilialId }
            accessibleFilials={ accessibleFilialsIds }
            placeholder="Todas as filiais"
          />
        </div>
      </div>

      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Fim</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Filial</TableHead>
              <TableHead>Criado Por</TableHead>
              <TableHead className="w-[100px]">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={ 7 } className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && notices.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={ 7 }
                  className="text-center bg-muted/50 text-muted-foreground h-24"
                >
                  Nenhum aviso encontrado neste período.
                </TableCell>
              </TableRow>
            )}
            {notices.map((notice) => (
              <TableRow key={ notice.noticeId }>
                <TableCell className="font-medium truncate max-w-[200px]">
                  {notice.description}
                </TableCell>
                <TableCell>
                  {format(new Date(notice.startDate), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  {format(new Date(notice.endDate), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  {minutesToHHMM(notice.startHourInMinutes)} -{" "}
                  {minutesToHHMM(notice.endHourInMinutes)}
                </TableCell>
                <TableCell>{notice.filial?.filialName || "-"}</TableCell>
                <TableCell>{notice.createdBy?.fullname || "-"}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={ () => {
                      setSelectedNotice(notice);
                      setIsDetailsOpen(true);
                    } }
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4">
        {isLoading && (
          <p className="text-center text-muted-foreground">Carregando...</p>
        )}
        {!isLoading && notices.length === 0 && (
          <p className="text-center text-muted-foreground">
            Nenhum aviso encontrado.
          </p>
        )}
        {notices.map((notice) => (
          <ResponsiveCard
            key={ notice.noticeId }
            cardData={ {
              id: notice.noticeId,
              title: notice.description,
              items: [
                {
                  itemLabel: "Início:",
                  itemInfo: format(new Date(notice.startDate), "dd/MM/yyyy", {
                    locale: ptBR,
                  }),
                },
                {
                  itemLabel: "Fim:",
                  itemInfo: format(new Date(notice.endDate), "dd/MM/yyyy", {
                    locale: ptBR,
                  }),
                },
                {
                  itemLabel: "Horário:",
                  itemInfo: `${minutesToHHMM(notice.startHourInMinutes)} - ${minutesToHHMM(notice.endHourInMinutes)}`,
                },
                {
                  itemLabel: "Filial:",
                  itemInfo: notice.filial?.filialName || "-",
                },
              ],
            } }
            rawData={ notice }
            handleToggleDialog={ () => {
              setSelectedNotice(notice);
              setIsDetailsOpen(true);
            } }
          />
        ))}
      </div>

      <NoticeDetailsDialog
        open={ isDetailsOpen }
        onOpenChange={ setIsDetailsOpen }
        notice={ selectedNotice }
      />
    </div>
  );
}
