import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
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
import { PaymentMethods } from "@/utils/constants";
import { Input } from "@/components/ui/input";

interface CancelTrainingConfirmationDialogProps {
  selectedTraining: Training | null;
  setSelectedTraining?: Dispatch<SetStateAction<Training | null>>;
  setCurrentTrainingStatus: Dispatch<
    SetStateAction<"Pendente" | "Concluido" | "Cancelado">
  >;
  setCancelTrainingConfirmationDialogOpen: Dispatch<SetStateAction<boolean>>;
  isCancelTrainingConfirmationDialogOpen: boolean;
  handleUpdateTrainingStatus: (
    trainingId: string,
    trainingStatus: "Concluido" | "Cancelado",
    wasRefunded?: boolean,
    cancellationFee?: number | null,
    canceledBy?: "VOLUNTEER" | "TRAINEE",
    cancellationDate?: Date | null,
    cancellationFeePaymentDate?: Date | null,
    cancellationFeePaymentMethod?:
      | "PIX"
      | "Transferencia"
      | "Debito"
      | "Credito"
      | "Dinheiro"
      | null
  ) => void;
}

export function CancelTrainingConfirmationDialog({
  selectedTraining,
  isCancelTrainingConfirmationDialogOpen,
  setCancelTrainingConfirmationDialogOpen,
  handleUpdateTrainingStatus,
  setCurrentTrainingStatus,
}: CancelTrainingConfirmationDialogProps) {
  const [ wasRefunded, setWasRefunded ] = useState(false);
  const [ hasCancellationFee, setHasCancellationFee ] = useState(false);
  const [ cancellationFee, setCancellationFee ] = useState<string>("0,00");
  const [ canceledBy, setCanceledBy ] = useState<"VOLUNTEER" | "TRAINEE">(
    "TRAINEE"
  );

  const [ cancellationDate, setCancellationDate ] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [ cancellationFeePaymentDate, setCancellationFeePaymentDate ] =
    useState<string>("");
  const [ cancellationFeePaymentMethod, setCancellationFeePaymentMethod ] =
    useState<"PIX" | "Transferencia" | "Debito" | "Credito" | "Dinheiro" | "">(
      ""
    );

  if (!selectedTraining) return null;

  const trainingDate = new Date(selectedTraining.dueDate);
  const today = new Date();
  const daysUntilTraining = differenceInCalendarDays(trainingDate, today);

  // Check if any payment is made
  const somePaymentIsDone = selectedTraining.TrainingPayment?.some(
    (p) =>
      p.paymentStatus === "Pago" ||
      p.paymentStatus === "Parcial" ||
      p.firstPaymentStatus === "Pago" ||
      p.secondPaymentStatus === "Pago"
  );

  const handleConfirm = () => {
    const feeInCents = hasCancellationFee
      ? parseStringToCents(cancellationFee)
      : null;

    if (hasCancellationFee) {
      if (!feeInCents || feeInCents <= 0) {
        toast.error("Informe o valor da taxa de cancelamento.");
        return;
      }
      if (!cancellationDate) {
        toast.error("Informe a data do cancelamento.");
        return;
      }
      if (!cancellationFeePaymentDate) {
        toast.error("Informe a data de pagamento da taxa.");
        return;
      }
      if (!cancellationFeePaymentMethod) {
        toast.error("Informe o método de pagamento da taxa.");
        return;
      }
    }

    handleUpdateTrainingStatus(
      selectedTraining.trainingId,
      "Cancelado",
      somePaymentIsDone ? wasRefunded : undefined,
      feeInCents,
      canceledBy || "TRAINEE",
      new Date(),
      hasCancellationFee && cancellationFeePaymentDate
        ? new Date(cancellationFeePaymentDate + "T12:00:00")
        : null,
      hasCancellationFee && cancellationFeePaymentMethod
        ? (cancellationFeePaymentMethod as
            | "PIX"
            | "Transferencia"
            | "Debito"
            | "Credito"
            | "Dinheiro")
        : null
    );

    setCurrentTrainingStatus("Cancelado");
    setCancelTrainingConfirmationDialogOpen(false);
  };

  return (
    <Dialog
      open={ isCancelTrainingConfirmationDialogOpen }
      onOpenChange={ setCancelTrainingConfirmationDialogOpen }
    >
      <DialogContent className="max-h-[90vh] w-[90vw] md:w-[500px] overflow-y-auto dark:bg-gray-900">
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
            .
          </DialogDescription>
        </DialogHeader>

        <CardContent className="mt-4 flex flex-col items-center justify-center space-y-2">
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
        </CardContent>

        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-fee"
              checked={ hasCancellationFee }
              onCheckedChange={ (checked) =>
                setHasCancellationFee(checked as boolean)
              }
            />
            <Label htmlFor="has-fee" className="text-sm font-medium">
              Gerou taxa de cancelamento?
            </Label>
          </div>

          {hasCancellationFee && (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="cancellation-fee"
                  className="text-sm font-medium"
                >
                  Valor da taxa
                </Label>
                <PriceInput
                  withLabel={ false }
                  value={ cancellationFee }
                  onChange={ (value) => setCancellationFee(value) }
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="fee-payment-date"
                  className="text-sm font-medium"
                >
                  Data de pagamento da taxa
                </Label>
                <Input
                  type="date"
                  id="fee-payment-date"
                  value={ cancellationFeePaymentDate }
                  onChange={ (e) =>
                    setCancellationFeePaymentDate(e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="fee-payment-method"
                  className="text-sm font-medium"
                >
                  Método de pagamento da taxa
                </Label>
                <select
                  id="fee-payment-method"
                  value={ cancellationFeePaymentMethod }
                  onChange={ (e) =>
                    setCancellationFeePaymentMethod(
                      e.target.value as
                        | "PIX"
                        | "Transferencia"
                        | "Debito"
                        | "Credito"
                        | "Dinheiro"
                    )
                  }
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">Selecione...</option>
                  {PaymentMethods.map((method) => (
                    <option key={ method } value={ method }>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Refund checkbox - only show when applicable */}
          {somePaymentIsDone && (
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
              <Checkbox
                id="refund"
                checked={ wasRefunded }
                onCheckedChange={ (checked) =>
                  setWasRefunded(checked as boolean)
                }
              />
              <Label
                htmlFor="refund"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Reembolsar valor pago
              </Label>
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
