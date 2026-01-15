import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Eye, Clock, Calendar, Filter, X } from "lucide-react";
import { ptBR } from "date-fns/locale";

import { Training } from "@/utils/@types/training";
import { Button } from "@/components/ui/button";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { Badge } from "@/components/ui/badge";
import { TrainingDetailsDialog } from "./TrainingDetailsDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Label } from "@/components/ui/label";

interface TrainingsTableProps {
  trainings: Training[] | undefined;
}

export function TrainingsTable({ trainings }: TrainingsTableProps) {
  const [ selectedTraining, setSelectedTraining ] = useState<Training | null>(
    null
  );
  const [ isDetailsOpen, setIsDetailsOpen ] = useState(false);

  // Filters state
  const [ filterTrainee, setFilterTrainee ] = useState("");
  const [ filterVolunteer, setFilterVolunteer ] = useState("");
  const [ filterStatus, setFilterStatus ] = useState<"ALL" | string>("ALL");
  const [ filterPaymentStatus, setFilterPaymentStatus ] = useState<
    "ALL" | "PENDING" | "PAID"
  >("ALL");
  const [ filterDate, setFilterDate ] = useState<Date | undefined>(undefined);

  const handleOpenDetails = (training: Training) => {
    setSelectedTraining(training);
    setIsDetailsOpen(true);
  };

  const clearFilters = () => {
    setFilterTrainee("");
    setFilterVolunteer("");
    setFilterStatus("ALL");
    setFilterPaymentStatus("ALL");
    setFilterDate(undefined);
  };

  const sortedTrainings = useMemo(() => {
    if (!trainings) return [];
    let result = [ ...trainings ];

    // Trainee Name Filter
    if (filterTrainee) {
      result = result.filter((t) =>
        t.Trainee?.name.toLowerCase().includes(filterTrainee.toLowerCase())
      );
    }

    // Volunteer Name Filter
    if (filterVolunteer) {
      result = result.filter((t) =>
        t.Volunteer?.name.toLowerCase().includes(filterVolunteer.toLowerCase())
      );
    }

    // Status Filter
    if (filterStatus && filterStatus !== "ALL") {
      result = result.filter((t) => t.trainingStatus === filterStatus);
    }

    // Payment Status Filter
    if (filterPaymentStatus && filterPaymentStatus !== "ALL") {
      if (filterPaymentStatus === "PENDING") {
        result = result.filter((t) =>
          t.TrainingPayment?.some((p) => p.paymentStatus === "Pendente")
        );
      } else if (filterPaymentStatus === "PAID") {
        // Assuming "Paid" means all payments are paid or at least one is "Pago" and none "Pendente"?
        // Or simply has "Pago" payments? The user request was "status de pagamento".
        // Let's implement logical interpretations.
        // "Pendente" usually means user wants to see what is missing money.
        // "Pago" might mean fully paid.
        // For now simple logic: Has any Paid payment? Or Strict?
        // Let's go with: All payments are "Pago" OR (has "Pago" and no "Pendente").
        // Actually, typically in grids: 'Pending' shows if ANY is pending. 'Paid' shows if ALL are paid.
        result = result.filter(
          (t) =>
            t.TrainingPayment?.length > 0 &&
            t.TrainingPayment.every(
              (p) =>
                p.paymentStatus === "Pago" || p.paymentStatus === "Confirmado"
            )
        );
      }
    }

    // Date Filter
    if (filterDate) {
      // Comparison by Day
      const filterDay = format(filterDate, "yyyy-MM-dd");
      result = result.filter((t) => t.dueDate.startsWith(filterDay));
    }

    return result.sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );
  }, [
    trainings,
    filterTrainee,
    filterVolunteer,
    filterStatus,
    filterPaymentStatus,
    filterDate,
  ]);

  // Helper to format duration
  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const getStatusBadge = (status: string) => {
    let colorClass = "bg-gray-100 text-gray-800";
    if (status === "Pago" || status === "Confirmado" || status === "Concluido")
      colorClass = "bg-green-100 text-green-800";
    if (status === "Pendente" || status === "Agendado")
      colorClass = "bg-yellow-100 text-yellow-800";
    if (status === "Cancelado") colorClass = "bg-red-100 text-red-800";

    return (
      <Badge variant="outline" className={ colorClass }>
        {status}
      </Badge>
    );
  };

  const handleToggleDialog = (open: boolean, data: unknown) => {
    if (open && data) {
      handleOpenDetails(data as Training);
    } else {
      setIsDetailsOpen(open);
    }
  };

  return (
    <>
      {/* Filters Toolbar */}
      <div className="bg-muted/30 p-4 rounded-lg border mb-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
          <Filter className="h-4 w-4" />
          Filtros
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Aluno</Label>
            <Input
              placeholder="Nome do Aluno"
              value={ filterTrainee }
              onChange={ (e) => setFilterTrainee(e.target.value) }
              className="h-9 bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Modelo</Label>
            <Input
              placeholder="Nome do Modelo"
              value={ filterVolunteer }
              onChange={ (e) => setFilterVolunteer(e.target.value) }
              className="h-9 bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Data</Label>
            <DatePicker
              value={ filterDate }
              onChange={ setFilterDate }
              placeholder="Selecione uma data"
              className="h-9 w-full bg-background"
              clearable
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status Treinamento</Label>
            <Select value={ filterStatus } onValueChange={ setFilterStatus }>
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="Agendado">Agendado</SelectItem>
                <SelectItem value="Concluido">Concluído</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status Pagamento</Label>
            <Select
              value={ filterPaymentStatus }
              onValueChange={ (v) =>
                setFilterPaymentStatus(v as "ALL" | "PENDING" | "PAID")
              }
            >
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="PAID">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={ clearFilters }
              className="text-muted-foreground h-9 w-full sm:w-auto"
            >
              <X className="h-3 w-3 mr-1" /> Limpar filtros
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg w-full overflow-x-auto hidden md:block">
        <table className="min-w-[800px] w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Data</th>
              <th className="text-left p-3 font-medium">Equipamento</th>
              <th className="text-left p-3 font-medium">Aluno</th>
              <th className="text-left p-3 font-medium">Modelo</th>
              <th className="text-center p-3 font-medium">Duração</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="text-center p-3 font-medium">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrainings.length === 0 && (
              <tr>
                <td className="text-center p-4" colSpan={ 7 }>
                  {trainings
                    ? "Nenhum treinamento encontrado."
                    : "Carregando..."}
                </td>
              </tr>
            )}
            {sortedTrainings.map((training) => (
              <tr
                key={ training.trainingId }
                className="border-t hover:bg-muted/50"
              >
                <td className="p-3 text-sm">
                  {format(new Date(training.dueDate), "dd/MM/yyyy HH:mm")}
                </td>
                <td className="p-3 text-sm font-medium">
                  {training.Gear?.gearName || "N/A"}
                </td>
                <td className="p-3 text-sm">
                  {training.Trainee?.name || "N/A"}
                </td>
                <td className="p-3 text-sm">
                  {training.Volunteer?.name || "N/A"}
                </td>
                <td className="p-3 text-center text-sm">
                  {formatDuration(training.hourInMinutes)}
                </td>
                <td className="p-3 text-center text-sm">
                  {getStatusBadge(training.trainingStatus)}
                </td>
                <td className="p-3 flex justify-center items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={ () => handleOpenDetails(training) }
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {sortedTrainings.map((training) => (
          <ResponsiveCard
            key={ training.trainingId }
            cardData={ {
              id: training.trainingId,
              title: training.Gear?.gearName || "Treinamento",
              description: format(
                new Date(training.dueDate),
                "dd/MM/yyyy HH:mm"
              ),
              items: [
                {
                  itemLabel: "Aluno: ",
                  itemInfo: training.Trainee?.name || "N/A",
                },
                {
                  itemLabel: "Modelo: ",
                  itemInfo: training.Volunteer?.name || "N/A",
                },
                { itemLabel: "Status: ", itemInfo: training.trainingStatus },
              ],
            } }
            rawData={ training }
            handleToggleDialog={ handleToggleDialog }
          />
        ))}
        {sortedTrainings.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {trainings ? "Nenhum treinamento encontrado." : "Carregando..."}
          </p>
        )}
      </div>

      {selectedTraining && (
        <TrainingDetailsDialog
          open={ isDetailsOpen }
          onOpenChange={ setIsDetailsOpen }
          selectedTraining={ selectedTraining }
          setSelectedTraining={ setSelectedTraining }
        />
      )}
    </>
  );
}
