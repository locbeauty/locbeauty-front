import { useEffect, useMemo, useState } from "react";
import { Eye, Filter, X } from "lucide-react";

import { Trainee } from "@/utils/@types/trainee";
import { Training } from "@/utils/@types/training";
import { Filial } from "@/utils/@types/filials";
import { Button } from "@/components/ui/button";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { TraineeDetailsDialog } from "./TraineeDetailsDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TraineesTableProps {
  trainees: Trainee[] | undefined;
  allTrainings: Training[];
  filials?: Filial[];
  onViewDetails?: (trainee: Trainee) => void;
}

export function TraineesTable({
  trainees,
  allTrainings,
  filials,
  onViewDetails,
}: TraineesTableProps) {
  const [ selectedTrainee, setSelectedTrainee ] = useState<Trainee | null>(null);
  const [ isDetailsOpen, setIsDetailsOpen ] = useState(false);

  // Filters
  const [ filterName, setFilterName ] = useState("");
  const [ filterPending, setFilterPending ] = useState(false);
  const [ filterFilial, setFilterFilial ] = useState<string>("all");

  useEffect(() => {
    console.log("trainees: ", trainees);
  }, [ trainees ]);

  const handleOpenDetails = (trainee: Trainee) => {
    setSelectedTrainee(trainee);
    setIsDetailsOpen(true);
    if (onViewDetails) {
      onViewDetails(trainee);
    }
  };

  const clearFilters = () => {
    setFilterName("");
    setFilterPending(false);
    setFilterFilial("all");
  };

  const sortedTrainees = useMemo(() => {
    if (!trainees) return [];
    let result = [ ...trainees ];

    // Name Filter
    if (filterName) {
      result = result.filter((t) =>
        t.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    // Pending Payment Filter
    if (filterPending) {
      // We need to check if this trainee has any training with pending payment.
      // The `trainees` object itself might not have payment info directly attached in this view unless we cross-reference `allTrainings`.
      // `allTrainings` contains the payment info linked to `traineeId`.
      const traineesWithPending = new Set<string>();
      allTrainings.forEach((training) => {
        // Check trainee payments
        if (
          training.TrainingPayment?.some(
            (p) => p.paymentStatus === "Pendente" && p.payerType === "TRAINEE"
          )
        ) {
          if (training.traineeId) traineesWithPending.add(training.traineeId);
        }
      });

      result = result.filter((t) => traineesWithPending.has(t.traineeId));
    }

    // Filial Filter
    if (filterFilial && filterFilial !== "all") {
      const traineesInFilial = new Set<string>();
      allTrainings.forEach((training) => {
        if (training.sourceFilialId === filterFilial) {
          if (training.traineeId) traineesInFilial.add(training.traineeId);
        }
      });
      result = result.filter((t) => traineesInFilial.has(t.traineeId));
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [ trainees, filterName, filterPending, filterFilial, allTrainings ]);

  const handleToggleDialog = (open: boolean, data: unknown) => {
    if (open && data) {
      handleOpenDetails(data as Trainee);
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
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-1 w-full sm:w-1/3">
            <Label className="text-xs">Nome do Aluno</Label>
            <Input
              placeholder="Buscar por nome..."
              value={ filterName }
              onChange={ (e) => setFilterName(e.target.value) }
              className="h-9 bg-background"
            />
          </div>
          <div className="space-y-1 w-full sm:w-[200px]">
            <Label className="text-xs">Filial</Label>
            <Select value={ filterFilial } onValueChange={ setFilterFilial }>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {filials?.map((filial) => (
                  <SelectItem key={ filial.filialId } value={ filial.filialId }>
                    {filial.filialName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 border p-2 rounded-md h-9 bg-background px-3">
            <Switch
              id="pending-trainee"
              checked={ filterPending }
              onCheckedChange={ setFilterPending }
            />
            <Label
              htmlFor="pending-trainee"
              className="text-sm cursor-pointer whitespace-nowrap"
            >
              Com Pagamento Pendente
            </Label>
          </div>
          <div className="flex-1 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={ clearFilters }
              className="text-muted-foreground h-9"
            >
              <X className="h-3 w-3 mr-1" /> Limpar
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg w-full overflow-x-auto hidden md:block">
        <table className="min-w-[800px] w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium">Filiais</th>
              <th className="text-left p-3 font-medium">CPF</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-center p-3 font-medium">Telefone</th>
              <th className="text-center p-3 font-medium">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrainees.length === 0 && (
              <tr>
                <td className="text-center p-4" colSpan={ 6 }>
                  {trainees ? "Nenhum aluno encontrado." : "Carregando..."}
                </td>
              </tr>
            )}
            {sortedTrainees.map((trainee) => {
              const traineeFilials = Array.from(
                new Set(
                  allTrainings
                    .filter((t) => t.traineeId === trainee.traineeId)
                    .map((t) => t.SourceFilial?.filialName)
                    .filter(Boolean)
                )
              ).join(", ");

              return (
                <tr
                  key={ trainee.traineeId }
                  className="border-t hover:bg-muted/50"
                >
                  <td className="p-3 text-sm font-medium">{trainee.name}</td>
                  <td className="p-3 text-sm">{traineeFilials || "N/A"}</td>
                  <td className="p-3 text-sm">{trainee.documentNumber}</td>
                  <td className="p-3 text-sm">{trainee.email}</td>
                  <td className="p-3 text-center text-sm">
                    {trainee.cellphone}
                  </td>
                  <td className="p-3 flex justify-center items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={ () => handleOpenDetails(trainee) }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {sortedTrainees.map((trainee) => {
          const traineeFilials = Array.from(
            new Set(
              allTrainings
                .filter((t) => t.traineeId === trainee.traineeId)
                .map((t) => t.SourceFilial?.filialName)
                .filter(Boolean)
            )
          ).join(", ");
          return (
            <ResponsiveCard
              key={ trainee.traineeId }
              cardData={ {
                id: trainee.traineeId,
                title: trainee.name,
                description: "Aluno",
                items: [
                  {
                    itemLabel: "Filiais: ",
                    itemInfo: traineeFilials || "N/A",
                  },
                  {
                    itemLabel: "CPF: ",
                    itemInfo: trainee.documentNumber || "N/A",
                  },
                  { itemLabel: "Tel: ", itemInfo: trainee.cellphone },
                ],
              } }
              rawData={ trainee }
              handleToggleDialog={ handleToggleDialog }
            />
          );
        })}
        {sortedTrainees.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {trainees ? "Nenhum aluno encontrado." : "Carregando..."}
          </p>
        )}
      </div>

      <TraineeDetailsDialog
        isOpen={ isDetailsOpen }
        setIsOpen={ setIsDetailsOpen }
        trainee={ selectedTrainee }
        allTrainings={ allTrainings }
      />
    </>
  );
}
