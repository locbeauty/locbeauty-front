"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, DollarSign } from "lucide-react";
import PriceInput from "@/components/shared/PriceInput";
import { UpdateTraining } from "@/services/trainings.service";
import { Training } from "@/utils/@types/training";
import { TrainingPayment } from "@/utils/@types/payments";
import { PayerType } from "./TrainingPaymentMethodDialog";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { centsToString } from "@/utils/centsToString";
import { queryClient } from "@/app/(main)/layout";

interface UpdateParticipantValuesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTraining: Training;
  setSelectedTraining?: Dispatch<SetStateAction<Training | null>>;
  payerType: PayerType;
  participantId: string;
  currentPayment: TrainingPayment | undefined;
}

export function UpdateParticipantValuesDialog({
  open,
  onOpenChange,
  selectedTraining,
  setSelectedTraining,
  payerType,
  participantId,
  currentPayment,
}: UpdateParticipantValuesDialogProps) {
  const [ basePrice, setBasePrice ] = useState("0,00");
  const [ additionalCost, setAdditionalCost ] = useState("0,00");
  const [ additionalCostDescription, setAdditionalCostDescription ] =
    useState("");
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  useEffect(() => {
    if (open && currentPayment) {
      setBasePrice(centsToString(currentPayment.basePrice || 0));
      setAdditionalCost(centsToString(currentPayment.additionalCost || 0));
      setAdditionalCostDescription(
        currentPayment.additionalCostDescription || "",
      );
    } else if (open) {
      // Defaults if no payment record exists yet (should be rare given getSafePaymentData logic)
      setBasePrice("0,00");
      setAdditionalCost("0,00");
      setAdditionalCostDescription("");
    }
  }, [ open, currentPayment ]);

  const handleSave = async () => {
    if (!selectedTraining) return;

    setIsSubmitting(true);
    try {
      const basePriceCents = parseStringToCents(basePrice);
      const additionalCostCents = parseStringToCents(additionalCost);
      const totalPriceCents = basePriceCents + additionalCostCents;

      // Construct payload specifically to update values
      // We must preserve existing payment status/details so we don't reset them
      const payload = {
        trainingStatus: selectedTraining.trainingStatus,
        payerType: payerType,
        traineeId: payerType === "TRAINEE" ? participantId : undefined,
        customerId: payerType === "TRAINEE" ? participantId : undefined,
        volunteerId: payerType === "VOLUNTEER" ? participantId : undefined,
        TrainingPayment: {
          ...currentPayment, // Spread existing payment to keep other fields
          basePrice: basePriceCents,
          additionalCost: additionalCostCents,
          additionalCostDescription: additionalCostDescription,
          totalPrice: totalPriceCents,
          // Ensure mandatory fields for UpdateTrainingPayload are present if currentPayment is undefined
          paymentStatus: currentPayment?.paymentStatus || "Pendente",
          paymentMode: currentPayment?.paymentMode || "AVista",
          firstPaymentAmount: currentPayment?.firstPaymentAmount || 0,
          firstPaymentDate: currentPayment?.firstPaymentDate
            ? new Date(currentPayment.firstPaymentDate)
            : null,
          firstPaymentMethod: currentPayment?.firstPaymentMethod || null,
          firstPaymentStatus: currentPayment?.firstPaymentStatus || "Pendente",
          secondPaymentAmount: currentPayment?.secondPaymentAmount || 0,
          secondPaymentDate: currentPayment?.secondPaymentDate
            ? new Date(currentPayment.secondPaymentDate)
            : null,
          secondPaymentMethod: currentPayment?.secondPaymentMethod || null,
          secondPaymentStatus:
            currentPayment?.secondPaymentStatus || "Pendente",
        },
      };

      const response = await UpdateTraining({
        trainingId: selectedTraining.trainingId,
        body: payload as any, // Cast as any because UpdateTrainingPayload type in service might be loose or strict
      });

      if (response.statusCode === 200) {
        toast.success("Valores atualizados com sucesso!");
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        if (setSelectedTraining && response.data) {
          setSelectedTraining(response.data);
        }
        onOpenChange(false);
      } else {
        toast.warning(response.message || "Erro ao atualizar valores.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar valores.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Editar Valores
          </DialogTitle>
          <DialogDescription>
            Atualize o preço base e custos adicionais para este participante.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="basePrice">Preço Base (R$)</Label>
            <PriceInput
              value={ basePrice }
              onChange={ setBasePrice }
              withLabel={ false }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="additionalCost">Custo Adicional (R$)</Label>
            <PriceInput
              value={ additionalCost }
              onChange={ setAdditionalCost }
              withLabel={ false }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição do Adicional</Label>
            <Input
              id="description"
              value={ additionalCostDescription }
              onChange={ (e) => setAdditionalCostDescription(e.target.value) }
              placeholder="Ex: Material extra, transporte..."
            />
          </div>
          <div className="p-3 bg-muted rounded-md flex justify-between items-center font-medium">
            <span>Total:</span>
            <span>
              {centsToString(
                parseStringToCents(basePrice) +
                  parseStringToCents(additionalCost),
              )}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={ () => onOpenChange(false) }>
            Cancelar
          </Button>
          <Button onClick={ handleSave } disabled={ isSubmitting }>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
