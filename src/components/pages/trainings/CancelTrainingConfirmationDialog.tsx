import { Dispatch, SetStateAction, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import PriceInput from "@/components/shared/PriceInput";
import { Training } from "@/utils/@types/training";
import { parseStringToCents } from "@/utils/parseStringToCents";

interface CancelTrainingConfirmationDialogProps {
  selectedTraining: Training | null;
  setSelectedTraining: Dispatch<SetStateAction<Training | null>>;
  setCancelTrainingConfirmationDialogOpen: Dispatch<SetStateAction<boolean>>;
  isCancelTrainingConfirmationDialogOpen: boolean;
  handleUpdateTrainingStatus: (
    trainingId: string,
    trainingStatus: "Concluido" | "Cancelado",
    wasRefunded?: boolean,
    cancellationFee?: number | null
  ) => void;
}

export function CancelTrainingConfirmationDialog({
    selectedTraining,
    isCancelTrainingConfirmationDialogOpen,
    setCancelTrainingConfirmationDialogOpen,
    handleUpdateTrainingStatus,
}: CancelTrainingConfirmationDialogProps) {
    const [ wasRefunded, setWasRefunded ] = useState(false);
    const [ cancellationFee, setCancellationFee ] = useState<string>("0,00");

    if (!selectedTraining) return null;

    const trainingDate = new Date(selectedTraining.dueDate);
    const today = new Date();
    const daysUntilTraining = differenceInCalendarDays(trainingDate, today);
    const hasFee = daysUntilTraining < 7;

    // Check if any payment is made (Trainee or Volunteer)
    const somePaymentIsDone = selectedTraining.TrainingPayment?.some(
        (p) =>
            p.paymentStatus === "Pago" ||
      p.paymentStatus === "Parcial" ||
      p.firstPaymentStatus === "Pago" ||
      p.secondPaymentStatus === "Pago"
    );

    const handleConfirm = () => {
        const feeInCents = hasFee ? parseStringToCents(cancellationFee) : null;
        handleUpdateTrainingStatus(
            selectedTraining.trainingId,
            "Cancelado",
            somePaymentIsDone ? wasRefunded : undefined,
            feeInCents
        );
        setCancelTrainingConfirmationDialogOpen(false);
    };

    return (
        <Dialog
            open={ isCancelTrainingConfirmationDialogOpen }
            onOpenChange={ setCancelTrainingConfirmationDialogOpen }
        >
            <DialogContent className="max-h-[90vh] w-[90vw] md:w-[500px] overflow-hidden dark:bg-gray-900">
                <DialogHeader className="space-y-2 text-center">
                    <DialogTitle className="text-2xl font-semibold text-red-600">
            Confirmar cancelamento
                    </DialogTitle>
                    <DialogDescription className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            Este treinamento está previsto para acontecer{" "}
                        {daysUntilTraining === 0
                            ? "hoje"
                            : daysUntilTraining === 1
                                ? "amanhã"
                                : `daqui a ${daysUntilTraining} dias`}
            . Cancelamentos realizados com{" "}
                        <span className="font-semibold text-red-500">menos de 7 dias</span>{" "}
            de antecedência{" "}
                        {hasFee ? (
                            <>
                                <span className="font-semibold">
                  geram uma taxa de cancelamento
                                </span>
                . Deseja prosseguir mesmo assim?
                            </>
                        ) : (
                            <>
                                <span className="font-semibold text-green-600">
                  não geram taxa
                                </span>
                . Deseja confirmar o cancelamento?
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <CardContent className="mt-6 flex flex-col items-center justify-center space-y-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        <p>
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                Aluno:
                            </span>{" "}
                            {selectedTraining.Trainee.name}
                        </p>
                        {selectedTraining.dueDate && (
                            <p>
                                <span className="font-medium text-gray-700 dark:text-gray-200">
                  Data do treinamento:
                                </span>{" "}
                                {trainingDate.toLocaleDateString("pt-BR")}
                            </p>
                        )}
                    </div>

                    {somePaymentIsDone && (
                        <div className="flex items-center space-x-2 justify-center mt-4">
                            <Checkbox
                                id="refunded"
                                checked={ wasRefunded }
                                onCheckedChange={ (checked) =>
                                    setWasRefunded(checked as boolean)
                                }
                            />
                            <Label
                                htmlFor="refunded"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                Foi reembolsado?
                            </Label>
                        </div>
                    )}

                    {hasFee && (
                        <div className="flex flex-col gap-2 mt-4 w-full px-10">
                            <Label className="text-sm font-medium">
                Taxa de cancelamento
                            </Label>
                            <PriceInput
                                value={ cancellationFee }
                                onChange={ (value) => setCancellationFee(value) }
                            />
                        </div>
                    )}
                </CardContent>

                <DialogFooter className="flex justify-end gap-3 mt-4">
                    <Button
                        variant="outline"
                        onClick={ () => setCancelTrainingConfirmationDialogOpen(false) }
                    >
            Voltar
                    </Button>
                    <Button variant="destructive" onClick={ handleConfirm }>
            Confirmar Cancelamento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
