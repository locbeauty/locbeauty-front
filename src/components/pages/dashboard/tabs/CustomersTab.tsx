import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomPieChart } from "../CustomPieChart";
import { Clock, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TopCustomersCard } from "@/components/pages/dashboard/cards/TopCustomersCard";
import { DefaultsCard } from "../cards/DefaultsCard";
import { InactiveClientsCard } from "../cards/InactiveClientsCard";
import { ActiveClientsCard } from "../cards/ActiveClientsCard";
import { CustomerStatusCard } from "../cards/CustomerStatusCard";
import { useState } from "react";

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

export function CustomersTab() {
  const currentMonthIndex = new Date().getMonth();
  const [ selectedMonth, setSelectedMonth ] = useState<string>(
    MONTHS[currentMonthIndex].toLowerCase(),
  );
  const [ selectedYear, setSelectedYear ] = useState<string>(
    String(new Date().getFullYear()),
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DefaultsCard />
        </div>
        <div className="flex flex-col gap-4">
          <InactiveClientsCard />
          <ActiveClientsCard />
        </div>
      </div>
      <CustomerStatusCard />
      <TopCustomersCard />
    </div>
  );
}
