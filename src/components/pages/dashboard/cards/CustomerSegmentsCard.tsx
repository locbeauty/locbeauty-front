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
import { GetAllCustomers } from "@/services/customers.service";
import { apiRequest } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ExternalLink, Loader2, UserSearch } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/utils/routes";
import {
  CUSTOMER_SEGMENT_OPTIONS,
  CustomerSegment,
  getCustomerSegmentOption,
} from "@/utils/customer-segments";

interface Filial {
  filialId: string;
  filialName: string;
}

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// Quantos clientes o card lista; o total do segmento vem sempre completo.
const PREVIEW_SIZE = 10;

export function CustomerSegmentsCard() {
  const now = new Date();

  // "ALL" = sem recorte de segmento (mesma opção da aba Clientes).
  const [ segment, setSegment ] = useState<CustomerSegment | "ALL">("ALL");
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("all");
  const [ referenceMonth, setReferenceMonth ] = useState<number>(
    now.getMonth() + 1,
  );
  const [ referenceYear, setReferenceYear ] = useState<number>(
    now.getFullYear(),
  );
  const [ filials, setFilials ] = useState<Filial[]>([]);

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

  const { data, isLoading } = useQuery({
    queryKey: [
      "customer-segment",
      segment,
      selectedFilialId,
      referenceMonth,
      referenceYear,
    ],
    queryFn: () =>
      GetAllCustomers(
        {
          filialId: selectedFilialId === "all" ? "" : selectedFilialId,
          // Sem segmento não há mês de referência: o recorte é a base inteira.
          ...(segment === "ALL"
            ? {}
            : { segment, referenceMonth, referenceYear }),
        },
        { page: 1, limit: PREVIEW_SIZE },
      ),
    staleTime: 1000 * 60,
  });

  const customers = data?.data?.items || [];
  const total = data?.data?.total || 0;
  const option =
    segment === "ALL" ? undefined : getCustomerSegmentOption(segment);

  // Anos disponíveis: do ano corrente até 4 anos atrás.
  const availableYears = Array.from(
    { length: 5 },
    (_, index) => now.getFullYear() - index,
  );

  const isCurrentMonth =
    referenceMonth === now.getMonth() + 1 &&
    referenceYear === now.getFullYear();

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
              onValueChange={ (value) =>
                setSegment(value === "ALL" ? "ALL" : (value as CustomerSegment))
              }
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
              <>
                <Select
                  value={ String(referenceMonth) }
                  onValueChange={ (value) => setReferenceMonth(Number(value)) }
                >
                  <SelectTrigger className="w-[130px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={ month } value={ String(index + 1) }>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={ String(referenceYear) }
                  onValueChange={ (value) => setReferenceYear(Number(value)) }
                >
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={ year } value={ String(year) }>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            <Select
              value={ selectedFilialId }
              onValueChange={ setSelectedFilialId }
            >
              <SelectTrigger className="w-[160px] h-8">
                <SelectValue placeholder="Filial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as filiais</SelectItem>
                {filials.map((filial) => (
                  <SelectItem key={ filial.filialId } value={ filial.filialId }>
                    {filial.filialName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <div className="mb-3">
              <div className="text-2xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground">
                {total === 1 ? "cliente" : "clientes"}
                {segment === "ALL"
                  ? " na base"
                  : ` em ${MONTHS[referenceMonth - 1].toLowerCase()} de ${referenceYear}`}
              </p>
            </div>

            <Table>
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

            {total > customers.length && (
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  Mostrando {customers.length} de {total}.
                </span>
                {/* A tela de Clientes sempre usa o mês corrente, então o
                    atalho só aparece quando o card está nesse mesmo mês. */}
                {(segment === "ALL" || isCurrentMonth) && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={
                        segment === "ALL"
                          ? ROUTES.CUSTOMERS
                          : `${ROUTES.CUSTOMERS}?segment=${segment}`
                      }
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Ver todos em Clientes
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
