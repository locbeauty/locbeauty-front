"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil } from "lucide-react";

import { Trainee } from "@/utils/@types/trainee";
import { Training } from "@/utils/@types/training";
import { Button } from "@/components/ui/button";
import { ResponsiveCard } from "@/components/shared/ResponsiveCard";
import { TraineeDetailsDialog } from "./TraineeDetailsDialog";

interface TraineesTableProps {
  trainees: Trainee[] | undefined;
  allTrainings: Training[];
  onViewDetails?: (trainee: Trainee) => void;
}

export function TraineesTable({
  trainees,
  allTrainings,
  onViewDetails,
}: TraineesTableProps) {
  const [ selectedTrainee, setSelectedTrainee ] = useState<Trainee | null>(null);
  const [ isDetailsOpen, setIsDetailsOpen ] = useState(false);

  const handleOpenDetails = (trainee: Trainee) => {
    setSelectedTrainee(trainee);
    setIsDetailsOpen(true);
    if (onViewDetails) {
      onViewDetails(trainee);
    }
  };

  const sortedTrainees = useMemo(() => {
    if (!trainees) return [];
    return [ ...trainees ].sort((a, b) => a.name.localeCompare(b.name));
  }, [ trainees ]);

  const handleToggleDialog = (open: boolean, data: unknown) => {
    if (open && data) {
      handleOpenDetails(data as Trainee);
    } else {
      setIsDetailsOpen(open);
    }
  };

  return (
    <>
      <div className="border rounded-lg w-full overflow-x-auto hidden md:block">
        <table className="min-w-[800px] w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium">CPF</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-center p-3 font-medium">Telefone</th>
              <th className="text-center p-3 font-medium">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {(!trainees || trainees.length === 0) && (
              <tr>
                <td className="text-center p-4" colSpan={ 5 }>
                  Nenhum aluno encontrado.
                </td>
              </tr>
            )}
            {sortedTrainees.map((trainee) => (
              <tr
                key={ trainee.traineeId }
                className="border-t hover:bg-muted/50"
              >
                <td className="p-3 text-sm font-medium">{trainee.name}</td>
                <td className="p-3 text-sm">{trainee.documentNumber}</td>
                <td className="p-3 text-sm">{trainee.email}</td>
                <td className="p-3 text-center text-sm">{trainee.cellphone}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {sortedTrainees.map((trainee) => (
          <ResponsiveCard
            key={ trainee.traineeId }
            cardData={ {
              id: trainee.traineeId,
              title: trainee.name,
              description: "Aluno",
              items: [
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
        ))}
        {(!trainees || trainees.length === 0) && (
          <p className="text-center text-muted-foreground py-8">
            Nenhum aluno encontrado.
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
