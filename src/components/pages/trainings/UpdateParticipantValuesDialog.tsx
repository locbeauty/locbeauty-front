"use client";

import { useForm, FormProvider } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Training } from "@/utils/@types/training";
import {
  PaymentMethodsType as TrainingPaymentMethod,
  PaymentModes as TrainingPaymentMode,
  PaymentStatuses as TrainingPaymentStatus,
} from "@/utils/constants";
import { TrainingPayment } from "@/utils/@types/payments";
import { UpdateTraining } from "@/services/trainings.service";
import { Loader2 } from "lucide-react";
import { UpdateTrainingPayload } from "./TrainingPaymentMethodDialog";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { TrainingPaymentSection } from "./TrainingPaymentSection";
import PriceInput from "@/components/shared/PriceInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface UpdateParticipantValuesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTraining: Training | null;
  setSelectedTraining?: (training: Training) => void;
  payerType: "TRAINEE" | "VOLUNTEER";
  participantId: string;
  currentPayment: TrainingPayment | null | undefined;
}

type FormValues = {
  price: string;
  additionalCost: string;
  additionalCostDescription: string;
  paymentInfo: {
    paymentStatus: TrainingPaymentStatus;
    firstPaymentDate: string;
    firstPaymentAmount: string;
    firstPaymentStatus: TrainingPaymentStatus;
    firstPaymentMethod: TrainingPaymentMethod;
    secondPaymentAmount: string;
    secondPaymentStatus: TrainingPaymentStatus;
    secondPaymentMethod: TrainingPaymentMethod;
    secondPaymentDate: string;
    wasRefunded: boolean;
    refundedAmount: string;
  };
};

export default function UpdateParticipantValuesDialog({
  open,
  onOpenChange,
  selectedTraining,
  setSelectedTraining,
  payerType,
  participantId,
  currentPayment,
}: UpdateParticipantValuesDialogProps) {
  const queryClient = useQueryClient();
  const methods = useForm<FormValues>({
    defaultValues: {
      price: currentPayment?.basePrice
        ? (currentPayment.basePrice / 100).toFixed(2).replace(".", ",")
        : "",
      additionalCost: currentPayment?.additionalCost
        ? (currentPayment.additionalCost / 100).toFixed(2).replace(".", ",")
        : "",
      additionalCostDescription:
        currentPayment?.additionalCostDescription || "",
      paymentInfo: {
        paymentStatus: (currentPayment?.isCourtesy
          ? "Cortesia"
          : currentPayment?.paymentStatus ||
            "Pendente") as TrainingPaymentStatus,
        firstPaymentDate: currentPayment?.firstPaymentDate
          ? new Date(currentPayment.firstPaymentDate)
            .toISOString()
            .split("T")[0]
          : "",
        firstPaymentAmount: currentPayment?.firstPaymentAmount
          ? (currentPayment.firstPaymentAmount / 100)
            .toFixed(2)
            .replace(".", ",")
          : "",
        firstPaymentStatus: (currentPayment?.firstPaymentStatus ||
          "Pendente") as TrainingPaymentStatus,
        firstPaymentMethod: (currentPayment?.firstPaymentMethod ||
          "Dinheiro") as TrainingPaymentMethod,
        secondPaymentAmount: currentPayment?.secondPaymentAmount
          ? (currentPayment.secondPaymentAmount / 100)
            .toFixed(2)
            .replace(".", ",")
          : "",
        secondPaymentStatus: (currentPayment?.secondPaymentStatus ||
          "Pendente") as TrainingPaymentStatus,
        secondPaymentMethod: (currentPayment?.secondPaymentMethod ||
          "Dinheiro") as TrainingPaymentMethod,
        secondPaymentDate: currentPayment?.secondPaymentDate
          ? new Date(currentPayment.secondPaymentDate)
            .toISOString()
            .split("T")[0]
          : "",
        wasRefunded: currentPayment?.wasRefunded || false,
        refundedAmount: currentPayment?.refundedAmount
          ? (currentPayment.refundedAmount / 100).toFixed(2).replace(".", ",")
          : "",
      },
    },
  });

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValues) => {
    if (!selectedTraining) return;

    try {
      const priceCents = parseStringToCents(data.price || "0");
      const additionalCostCents = parseStringToCents(
        data.additionalCost || "0",
      );
      const firstPaymentAmountCents = parseStringToCents(
        data.paymentInfo.firstPaymentAmount || "0",
      );
      const secondPaymentAmountCents = parseStringToCents(
        data.paymentInfo.secondPaymentAmount || "0",
      );
      const refundAmountCents = parseStringToCents(
        data.paymentInfo.refundedAmount || "0",
      );

      const payload: UpdateTrainingPayload = {
        trainingStatus: selectedTraining.trainingStatus,
        payerType: payerType,
        traineeId: payerType === "TRAINEE" ? participantId : undefined,
        customerId: payerType === "TRAINEE" ? participantId : undefined,
        volunteerId: payerType === "VOLUNTEER" ? participantId : undefined,
        isCourtesy:
          data.paymentInfo.paymentStatus ===
          ("Cortesia" as TrainingPaymentStatus),
        TrainingPayment: {
          basePrice: priceCents,
          additionalCost: additionalCostCents,
          totalPrice: priceCents + additionalCostCents,
          additionalCostDescription: data.additionalCostDescription || "",
          paymentStatus:
            data.paymentInfo.paymentStatus ===
            ("Cortesia" as TrainingPaymentStatus)
              ? "Pago"
              : (data.paymentInfo.paymentStatus as TrainingPaymentStatus),
          paymentMode: "AVista" as TrainingPaymentMode,
          firstPaymentAmount: firstPaymentAmountCents,
          firstPaymentDate: data.paymentInfo.firstPaymentDate
            ? new Date(data.paymentInfo.firstPaymentDate)
            : null,
          firstPaymentMethod: data.paymentInfo
            .firstPaymentMethod as TrainingPaymentMethod,
          firstPaymentStatus: data.paymentInfo
            .firstPaymentStatus as TrainingPaymentStatus,
          secondPaymentAmount: secondPaymentAmountCents,
          secondPaymentDate: data.paymentInfo.secondPaymentDate
            ? new Date(data.paymentInfo.secondPaymentDate)
            : null,
          secondPaymentMethod: data.paymentInfo
            .secondPaymentMethod as TrainingPaymentMethod,
          secondPaymentStatus: data.paymentInfo
            .secondPaymentStatus as TrainingPaymentStatus,
          wasRefunded: data.paymentInfo.wasRefunded,
          refundedAmount: refundAmountCents,
        },
      };

      const response = await UpdateTraining({
        trainingId: selectedTraining.trainingId,
        body: payload as unknown as UpdateTrainingPayload,
      });

      if (response.statusCode === 200) {
        toast.success("Valores atualizados com sucesso!");
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        if (setSelectedTraining && response.data) {
          setSelectedTraining(response.data);
        }
        onOpenChange(false);
      } else {
        toast.error(response.message || "Erro ao atualizar valores.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar!");
    }
  };

  const currentPrice = watch("price");
  const currentAddCost = watch("additionalCost");

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Atualizar Valores do Participante</DialogTitle>
        </DialogHeader>

        <FormProvider { ...methods }>
          <form onSubmit={ handleSubmit(onSubmit) } className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor Base</Label>
                <PriceInput
                  withLabel={ false }
                  register={ register("price") }
                  value={ currentPrice || "" }
                  setValue={ setValue }
                  name="price"
                  placeholder="R$ 0,00"
                />
              </div>

              {payerType === "TRAINEE" && (
                <div className="space-y-2">
                  <Label>Custo Adicional</Label>
                  <PriceInput
                    withLabel={ false }
                    register={ register("additionalCost") }
                    value={ currentAddCost || "" }
                    setValue={ setValue }
                    name="additionalCost"
                    placeholder="R$ 0,00"
                  />
                </div>
              )}
            </div>

            {payerType === "TRAINEE" && (
              <div className="space-y-2">
                <Label>Descrição do Custo Adicional</Label>
                <Textarea
                  { ...register("additionalCostDescription") }
                  placeholder="Descreva o motivo do custo adicional"
                  rows={ 2 }
                />
              </div>
            )}

            <div className="border-t pt-4">
              <TrainingPaymentSection
                prefix="paymentInfo"
                label="Informações de Pagamento"
                totalValue={
                  parseStringToCents(currentPrice || "0") / 100 +
                  parseStringToCents(currentAddCost || "0") / 100
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={ () => onOpenChange(false) }
                disabled={ isSubmitting }
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={ isSubmitting }>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
