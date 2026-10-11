"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CustomerStatusBadge } from "@/components/shared/CustomerStatusBadge";
import { ListPagination } from "@/components/shared/ListPagination";
import { ReferenceMonthYearSelect } from "@/components/shared/ReferenceMonthYearSelect";
import { GetAllCustomers } from "@/services/customers.service";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ExternalLink, Loader2, UserSearch } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/routes";
import { getMonthName } from "@/utils/getMonthName";
import {
  CUSTOMER_SEGMENT_OPTIONS,
  CustomerSegment,
  getCustomerSegmentOption,
} from "@/utils/customer-segments";
import { DashboardFilialSelect } from "../DashboardFilialSelect";

// Clientes por página do card; o total do segmento vem sempre completo.
const PAGE_SIZE = 10;

export function CustomerSegmentsCard({
  filialIds: generalFilialIds,
}: {
  filialIds: string[];
}) {
  // "ALL" = sem recorte de segmento (mesma opção da aba Clientes).
  const [ segment, setSegment ] = useState<CustomerSegment | "ALL">("ALL");
  const [ page, setPage ] = useState(1);
  // Começa (e é reposto) pelo filtro geral da aba; o card pode refinar.
  const [ filialIds, setFilialIds ] = useState(generalFilialIds);
  useEffect(() => {
    setFilialIds(generalFilialIds);
    setPage(1);
  }, [ generalFilialIds ]);
  const [ referenceMonth, setReferenceMonth ] = useState(
    () => new Date().getMonth() + 1,
  );
  const [ referenceYear, setReferenceYear ] = useState(() =>
    new Date().getFullYear(),
  );

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: [
      "customer-segment",
      segment,
      filialIds,
      referenceMonth,
      referenceYear,
      page,
    ],
    queryFn: () =>
      GetAllCustomers(
        {
          filialId: filialIds,
          // Sem segmento não há mês de referência: o recorte é a base inteira.
          ...(segment === "ALL"
            ? {}
            : { segment, referenceMonth, referenceYear }),
        },
        { page, limit: PAGE_SIZE },
      ),
    // Mantém a página atual na tela enquanto a próxima carrega.
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  });

  const customers = data?.data?.items || [];
  const total = data?.data?.total || 0;
  const option =
    segment === "ALL" ? undefined : getCustomerSegmentOption(segment);

  // Toda troca de recorte volta para a primeira página.
  function changeFilter<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  // Leva o mesmo recorte para a aba Clientes. Ela filtra por uma filial só:
  // com várias selecionadas aqui, segue sem filtro de filial.
  function getCustomersHref() {
    const params = new URLSearchParams();

    if (segment !== "ALL") {
      params.set("segment", segment);
      params.set("referenceMonth", String(referenceMonth));
      params.set("referenceYear", String(referenceYear));
    }

    if (filialIds.length === 1) {
      params.set("filialId", filialIds[0]);
    }

    const query = params.toString();
    return query ? `${ROUTES.CUSTOMERS}?${query}` : ROUTES.CUSTOMERS;
  }

  return (
    <Card className="w-[89vw] md:w-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserSearch className="h-4 w-4 text-muted-foreground" />
          Segmentos de Clientes
        </CardTitle>
        <CardDescription className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <span>{option?.description ?? "Todos os clientes da base."}</span>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={ segment }
              onValueChange={ changeFilter((value: string) =>
                setSegment(value === "ALL" ? "ALL" : (value as CustomerSegment)),
              ) }
            >
              <SelectTrigger className="w-[260px] h-8">
                <SelectValue placeholder="Segmento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os segmentos</SelectItem>
                {CUSTOMER_SEGMENT_OPTIONS.map((item) => (
                  <SelectItem key={ item.value } value={ item.value }>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mês/ano só fazem sentido com um segmento selecionado. */}
            {segment !== "ALL" && (
              <ReferenceMonthYearSelect
                month={ referenceMonth }
                year={ referenceYear }
                onMonthChange={ changeFilter(setReferenceMonth) }
                onYearChange={ changeFilter(setReferenceYear) }
                triggerClassName="h-8"
              />
            )}

            <DashboardFilialSelect
              value={ filialIds }
              onChange={ changeFilter(setFilialIds) }
              className="h-8"
            />
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <div className="text-2xl font-bold">{total}</div>
                <p className="text-xs text-muted-foreground">
                  {total === 1 ? "cliente" : "clientes"}
                  {segment === "ALL"
                    ? " na base"
                    : ` em ${getMonthName(referenceMonth - 1).toLowerCase()} de ${referenceYear}`}
                </p>
              </div>

              {total > 0 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={ getCustomersHref() }>
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver todos em Clientes
                  </Link>
                </Button>
              )}
            </div>

            <Table
              className={ cn(
                "transition-opacity",
                isPlaceholderData && "opacity-60",
              ) }
            >
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">Telefone</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">
                    Último Agendamento
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={ customer.customerId }>
                    <TableCell className="font-medium">
                      <div>{customer.fullname}</div>
                      <div className="text-xs text-muted-foreground">
                        {customer.SourceFilial?.filialName}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {customer.cellphone || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <CustomerStatusBadge status={ customer.customerStatus } />
                    </TableCell>
                    <TableCell className="text-center">
                      {customer.lastBooking
                        ? format(new Date(customer.lastBooking), "dd/MM/yyyy")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={ 4 } className="h-24 text-center">
                      Nenhum cliente neste segmento.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {total > PAGE_SIZE && (
              <ListPagination
                page={ page }
                limit={ PAGE_SIZE }
                totalItems={ total }
                onPageChange={ setPage }
                itemLabel="cliente(s)"
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
