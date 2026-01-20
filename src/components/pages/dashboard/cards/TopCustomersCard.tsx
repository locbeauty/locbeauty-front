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
import { getTopCustomersMetric } from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";
import { centsToStringWithCurrencyMark } from "@/utils/centsToString";

interface TopCustomersCardProps {
  selectedYear: number;
  filialId?: string;
}

export function TopCustomersCard({
  selectedYear,
  filialId,
}: TopCustomersCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: [ "dashboard-top-customers", selectedYear, filialId ],
    queryFn: () => getTopCustomersMetric({ year: selectedYear, filialId }),
  });

  const topCustomers = data?.topCustomers || [];

  return (
    <Card className="w-[89vw] md:w-auto">
      <CardHeader>
        <CardTitle>Clientes Principais</CardTitle>
        <CardDescription>Clientes com maior número de locações</CardDescription>
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
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {customer.fullname
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
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
