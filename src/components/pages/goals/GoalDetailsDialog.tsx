"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { format } from "date-fns";
import { Goal } from "@/utils/@types/goals";
import { Loader2 } from "lucide-react";

interface GoalDetailsDialogProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GoalDetailItem {
  id: string;
  type: "Booking" | "Training";
  status: string;
  date: string;
  value: number;
  contributesTo: "Current" | "Estimated" | "None";
  isCourtesy: boolean;
  description?: string;
}

export function GoalDetailsDialog({
  goal,
  open,
  onOpenChange,
}: GoalDetailsDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: [ "goal-details", goal?.goalId ],
    queryFn: async () => {
      if (!goal) return { details: [] };
      const response = await apiRequest<{ details: GoalDetailItem[] }>({
        endpoint: `goals/${goal.goalId}/details`,
        method: "GET",
      });
      return response.data;
    },
    enabled: !!goal && open,
  });

  const formatValue = (value: number) => {
    if (goal?.targetCents !== null && goal?.targetCents !== undefined) {
      return (value / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    }
    return value.toString();
  };

  const getStatusColor = (item: GoalDetailItem) => {
    if (item.isCourtesy) return "bg-blue-100 text-blue-800";
    if (item.contributesTo === "Current") return "bg-green-100 text-green-800";
    if (item.contributesTo === "Estimated")
      return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Detalhes da Meta</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-auto">ID</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contribuição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.details.map((item: GoalDetailItem, index) => (
                  <TableRow key={ `${item.id}-${index}` }>
                    <TableCell className="font-mono text-xs text-muted-foreground break-all">
                      {item.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {format(new Date(item.date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Badge variant="outline" className="w-fit">
                          {item.type}
                        </Badge>
                        {item.description && (
                          <span className="text-xs text-muted-foreground mt-1 ml-2">
                            ↳ {item.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.status}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={ getStatusColor(item) }
                        variant="secondary"
                      >
                        {item.isCourtesy
                          ? "Cortesia"
                          : item.contributesTo === "Current"
                            ? "Confirmado"
                            : item.contributesTo === "Estimated"
                              ? "Pendente"
                              : "Nenhum"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatValue(item.value)}
                    </TableCell>
                  </TableRow>
                ))}
                {data?.details?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={ 6 }
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum item encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
