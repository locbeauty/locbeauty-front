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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  getTopCustomersMetric,
  getAvailableYears,
} from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";
import { centsToStringWithCurrencyMark } from "@/utils/centsToString";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomFilterSelect } from "@/components/shared/CustomFilterSelect";
import { apiRequest } from "@/lib/api";
import { useEffect, useState } from "react";

interface Filial {
  filialId: string;
  filialName: string;
}

interface TopCustomersCardProps {
  selectedYear: number;
  filialId?: string;
}

export function TopCustomersCard() {
  const [ selectedYear, setSelectedYear ] = useState<string>(
    String(new Date().getFullYear()),
  );
  const [ filials, setFilials ] = useState<Filial[]>([]);
  const [ selectedFilialId, setSelectedFilialId ] = useState<string>("all");
  const [ availableYears, setAvailableYears ] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const years = await getAvailableYears();
        const yearsString = years.map(String);
        setAvailableYears(yearsString);

        if (yearsString.length > 0 && !yearsString.includes(selectedYear)) {
          if (!yearsString.includes(String(new Date().getFullYear()))) {
            setSelectedYear(yearsString[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch available years", error);
      }

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
    fetchData();
  }, [ selectedYear ]);

  const { data, isLoading } = useQuery({
    queryKey: [
      "dashboard-top-customers",
      Number(selectedYear),
      selectedFilialId === "all" ? undefined : selectedFilialId,
    ],
    queryFn: () =>
      getTopCustomersMetric({
        year: Number(selectedYear),
        filialId: selectedFilialId === "all" ? undefined : selectedFilialId,
      }),
  });

  const topCustomers = data?.topCustomers || [];

  return (
    <Card className="w-[89vw] md:w-auto">
      <CardHeader>
        <CardTitle>Clientes Principais</CardTitle>
        <CardDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>Clientes com maior número de locações</span>
          <div className="flex items-center gap-2">
            <Select
              value={ selectedFilialId }
              onValueChange={ setSelectedFilialId }
            >
              <SelectTrigger className="w-[140px] h-8">
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
            <CustomFilterSelect
              items={ availableYears }
              placeholder="Selecione o ano"
              triggerProps={ { className: "w-[100px] h-8" } }
              value={ selectedYear }
              onValueChange={ setSelectedYear }
            />
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Locações</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCustomers.map((customer) => (
                <TableRow key={ customer.customerId }>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {/* <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {customer.fullname
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar> */}
                      <div>
                        <div>{customer.fullname}</div>
                        <div className="text-xs text-muted-foreground">
                          {customer.city}
                          {customer.state ? ` - ${customer.state}` : ""}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.count}</TableCell>
                  <TableCell>
                    {centsToStringWithCurrencyMark(customer.totalRevenue)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        customer.customerStatus === "Ativo"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }
                    >
                      {customer.customerStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {topCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={ 4 } className="h-24 text-center">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
