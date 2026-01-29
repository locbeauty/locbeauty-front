import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Training } from "@/utils/@types/training";

interface FinishTrainingConfirmationDialogProps {
  selectedTraining: Training | null;
  isFinishTrainingConfirmationDialogOpen: boolean;
  setFinishTrainingConfirmationDialogOpen: Dispatch<SetStateAction<boolean>>;
  setCurrentTrainingStatus: Dispatch<
    SetStateAction<"Pendente" | "Concluido" | "Cancelado">
  >;
  handleUpdateTrainingStatus: (
    trainingId: string,
    trainingStatus: "Concluido" | "Cancelado",
    wasRefunded?: boolean,
    cancellationFee?: number | null,
  ) => void;
}

export function FinishTrainingConfirmationDialog({
  selectedTraining,
  isFinishTrainingConfirmationDialogOpen,
  setFinishTrainingConfirmationDialogOpen,
  handleUpdateTrainingStatus,
  setCurrentTrainingStatus,
}: FinishTrainingConfirmationDialogProps) {
  if (!selectedTraining) return null;

  const handleConfirm = () => {
    handleUpdateTrainingStatus(selectedTraining.trainingId, "Concluido");
    setCurrentTrainingStatus("Concluido");
    setFinishTrainingConfirmationDialogOpen(false);
  };

  return (
    <Dialog
      open={ isFinishTrainingConfirmationDialogOpen }
      onOpenChange={ setFinishTrainingConfirmationDialogOpen }
    >
      <DialogContent className="max-h-[90vh] w-[90vw] md:w-[500px] overflow-hidden dark:bg-gray-900">
        <DialogHeader className="space-y-2 text-center">
          <DialogTitle className="text-2xl font-semibold text-green-600">
            Confirmar conclusão
          </DialogTitle>
          <DialogDescription className="text-base text-center text-gray-500 dark:text-gray-400 leading-relaxed">
            Ao confirmar, o status do treinamento será alterado para{" "}
            <span className="font-semibold text-green-600">Concluído</span>.
            <br />
            <span className="font-bold">Deseja prosseguir?</span>
          </DialogDescription>
        </DialogHeader>

        <CardContent className="mt-6 flex flex-col items-center justify-center space-y-2">
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            <p>
              <span className="font-medium text-gray-700 dark:text-gray-200">
                Aluno:
              </span>{" "}
              {selectedTraining.Trainees?.[0]?.name || "Desconhecido"}
            </p>
            {selectedTraining.dueDate && (
              <p>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  Data do treinamento:
                </span>{" "}
                {new Date(selectedTraining.dueDate).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        </CardContent>

        <DialogFooter className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={ () => setFinishTrainingConfirmationDialogOpen(false) }
          >
            Voltar
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={ handleConfirm }
          >
            Confirmar Conclusão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
