import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Eye, Clock, Calendar, Filter, X } from "lucide-react";
import { ptBR } from "date-fns/locale";

import { Training } from "@/utils/@types/training";
import { Filial } from "@/utils/@types/filials";
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
  filials?: Filial[];
}

export function TrainingsTable({ trainings, filials }: TrainingsTableProps) {
  const [ selectedTraining, setSelectedTraining ] = useState<Training | null>(
    null
  );
  const [ isDetailsOpen, setIsDetailsOpen ] = useState(false);

  // Filters state
  const [ searchTerm, setSearchTerm ] = useState("");
  const [ filterStatus, setFilterStatus ] = useState<"ALL" | string>("ALL");
  const [ filterPaymentStatus, setFilterPaymentStatus ] = useState<
    "ALL" | "PENDING" | "PAID" | "CANCELED"
  >("ALL");
  const [ filterDate, setFilterDate ] = useState<Date | undefined>(undefined);
  const [ filterFilial, setFilterFilial ] = useState<string>("ALL");

  const handleOpenDetails = (training: Training) => {
    setSelectedTraining(training);
    setIsDetailsOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("ALL");
    setFilterPaymentStatus("ALL");
    setFilterDate(undefined);
    setFilterFilial("ALL");
  };

  const sortedTrainings = useMemo(() => {
    if (!trainings) return [];
    let result = [ ...trainings ];

    // General Search Filter (ID, Trainee, Volunteer)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.trainingId.toLowerCase().includes(lowerSearch) ||
          t.Trainee?.name.toLowerCase().includes(lowerSearch) ||
          t.Volunteer?.name.toLowerCase().includes(lowerSearch)
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
                p.paymentStatus === "Pago" ||
                (p.paymentStatus as string) === "Confirmado"
            )
        );
      } else if (filterPaymentStatus === "CANCELED") {
        result = result.filter((t) =>
          t.TrainingPayment?.some((p) => p.paymentStatus === "Cancelado")
        );
      }
    }

    // Filial Filter
    if (filterFilial && filterFilial !== "ALL") {
      result = result.filter((t) => t.sourceFilialId === filterFilial);
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
    searchTerm,
    filterStatus,
    filterPaymentStatus,
    filterDate,
    filterFilial,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* Search Field - Spans 4 columns on large screens */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-4">
            <Label className="text-xs">Busca Geral</Label>
            <div className="relative">
              <Input
                placeholder="Buscar por ID, nome do aluno ou nome do modelo..."
                value={ searchTerm }
                onChange={ (e) => setSearchTerm(e.target.value) }
                className="h-9 bg-background pr-8"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-9 w-9 p-0 hover:bg-transparent"
                  onClick={ () => setSearchTerm("") }
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                  <span className="sr-only">Limpar busca</span>
                </Button>
              )}
            </div>
          </div>

          {/* Date Filter - Spans 2 columns */}
          <div className="space-y-1 lg:col-span-2">
            <Label className="text-xs">Data</Label>
            <DatePicker
              value={ filterDate || null }
              onChange={ (date) => setFilterDate(date || undefined) }
              placeholder="Selecione data"
              className="h-9 w-full bg-background"
              clearable
            />
          </div>

          {/* Status Filter - Spans 2 columns */}
          <div className="space-y-1 lg:col-span-2">
            <Label className="text-xs">Status Treino</Label>
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

          {/* Filial Filter - Spans 2 columns */}
          <div className="space-y-1 lg:col-span-2">
            <Label className="text-xs">Filial</Label>
            <Select value={ filterFilial } onValueChange={ setFilterFilial }>
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {filials?.map((filial) => (
                  <SelectItem key={ filial.filialId } value={ filial.filialId }>
                    {filial.filialName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Filter - Spans 2 columns */}
          <div className="space-y-1 lg:col-span-2">
            <Label className="text-xs">Pagamento</Label>
            <Select
              value={ filterPaymentStatus }
              onValueChange={ (v) =>
                setFilterPaymentStatus(
                  v as "ALL" | "PENDING" | "PAID" | "CANCELED"
                )
              }
            >
              <SelectTrigger className="h-9 bg-background">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="PAID">Pago</SelectItem>
                <SelectItem value="CANCELED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={ clearFilters }
            className="text-muted-foreground h-9"
          >
            <X className="h-3 w-3 mr-1" /> Limpar Todos os Filtros
          </Button>
        </div>
      </div>

      <div className="border rounded-lg w-full overflow-x-auto hidden md:block">
        <table className="min-w-[800px] w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Data</th>
              <th className="text-left p-3 font-medium">Filial</th>
              <th className="text-left p-3 font-medium">Equipamento</th>
              <th className="text-center p-3 font-medium">Horário</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="text-center p-3 font-medium">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrainings.length === 0 && (
              <tr>
                <td className="text-center p-4" colSpan={ 8 }>
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
                  {format(new Date(training.dueDate), "dd/MM/yyyy")}
                </td>
                <td className="p-3 text-sm font-medium">
                  {training.SourceFilial?.filialName || "N/A"}
                </td>
                <td className="p-3 text-sm">
                  {training.Gear?.gearName || "N/A"}
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
                  itemLabel: "Filial: ",
                  itemInfo: training.SourceFilial?.filialName || "N/A",
                },
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
