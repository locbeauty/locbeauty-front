"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
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
  PaymentMethodsType,
  PaymentModes,
  PaymentStatuses,
} from "@/utils/constants";
import { UpdateTraining } from "@/services/trainings.service";
import { Loader2 } from "lucide-react";
import { UpdateTrainingPayload } from "./TrainingPaymentMethodDialog";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { FinancialInputSection } from "./FinancialInputSection";
import {
  CreateTrainingDataType,
  IndividualPaymentSchema,
} from "@/lib/zod/CreateTrainingValidation";
import { z } from "zod";

type IndividualPayment = z.infer<typeof IndividualPaymentSchema>;

interface EditTrainingFinancialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training: Training;
  payerType: "TRAINEE" | "VOLUNTEER";
  onSuccess: (updatedTraining: Training) => void;
}

export default function EditTrainingFinancialsDialog({
  open,
  onOpenChange,
  training,
  payerType,
  onSuccess,
}: EditTrainingFinancialsDialogProps) {
  const queryClient = useQueryClient();
  const methods = useForm<CreateTrainingDataType>({
    defaultValues: {
      traineePayments: [],
      volunteerPayments: [],
    },
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = methods;

  const { fields: traineeFields, replace: replaceTrainees } = useFieldArray({
    control,
    name: "traineePayments",
  });

  const { fields: volunteerFields, replace: replaceVolunteers } = useFieldArray(
    {
      control,
      name: "volunteerPayments",
    },
  );

  // Initialize form with training data
  useEffect(() => {
    if (open && training) {
      if (payerType === "TRAINEE") {
        const trainees = training.Trainees || [];
        const initialTraineePayments = trainees.map((trainee) => {
          const payment = training.TrainingPayment?.find(
            (p) =>
              p.payerType === "TRAINEE" &&
              (p.traineeId === trainee.customerId ||
                p.customerId === trainee.customerId),
          );

          return {
            participantId: trainee.customerId,
            price: payment?.basePrice
              ? (payment.basePrice / 100).toFixed(2).replace(".", ",")
              : "",
            additionalCost: payment?.additionalCost
              ? (payment.additionalCost / 100).toFixed(2).replace(".", ",")
              : "",
            additionalCostDescription: payment?.additionalCostDescription || "",
            paymentInfo: {
              paymentStatus: (payment?.isCourtesy
                ? "Cortesia"
                : payment?.paymentStatus || "Pendente") as PaymentStatuses,
              firstPaymentDate: payment?.firstPaymentDate
                ? new Date(payment.firstPaymentDate).toISOString().split("T")[0]
                : "",
              firstPaymentAmount: payment?.firstPaymentAmount
                ? (payment.firstPaymentAmount / 100)
                  .toFixed(2)
                  .replace(".", ",")
                : "",
              firstPaymentStatus: (payment?.firstPaymentStatus ||
                "Pendente") as PaymentStatuses,
              firstPaymentMethod: (payment?.firstPaymentMethod ||
                "Dinheiro") as PaymentMethodsType,
              secondPaymentAmount: payment?.secondPaymentAmount
                ? (payment.secondPaymentAmount / 100)
                  .toFixed(2)
                  .replace(".", ",")
                : "",
              secondPaymentStatus: (payment?.secondPaymentStatus ||
                "Pendente") as PaymentStatuses,
              secondPaymentMethod: (payment?.secondPaymentMethod ||
                "Dinheiro") as PaymentMethodsType,
              secondPaymentDate: payment?.secondPaymentDate
                ? new Date(payment.secondPaymentDate)
                  .toISOString()
                  .split("T")[0]
                : "",
              wasRefunded: payment?.wasRefunded || false,
              refundedAmount: payment?.refundedAmount
                ? (payment.refundedAmount / 100).toFixed(2).replace(".", ",")
                : "",
            },
          };
        });
        replaceTrainees(initialTraineePayments);
        replaceVolunteers([]);
      } else {
        const volunteers = training.Volunteers || [];
        const initialVolunteerPayments = volunteers.map((volunteer) => {
          const payment = training.TrainingPayment?.find(
            (p) =>
              p.payerType === "VOLUNTEER" &&
              p.volunteerId === volunteer.volunteerId,
          );

          return {
            participantId: volunteer.volunteerId,
            price: payment?.totalPrice
              ? (payment.totalPrice / 100).toFixed(2).replace(".", ",")
              : "",
            additionalCost: "",
            additionalCostDescription: "",
            paymentInfo: {
              paymentStatus: (payment?.isCourtesy
                ? "Cortesia"
                : payment?.paymentStatus || "Pendente") as PaymentStatuses,
              firstPaymentDate: payment?.firstPaymentDate
                ? new Date(payment.firstPaymentDate).toISOString().split("T")[0]
                : "",
              firstPaymentAmount: payment?.firstPaymentAmount
                ? (payment.firstPaymentAmount / 100)
                  .toFixed(2)
                  .replace(".", ",")
                : "",
              firstPaymentStatus: (payment?.firstPaymentStatus ||
                "Pendente") as PaymentStatuses,
              firstPaymentMethod: (payment?.firstPaymentMethod ||
                "Dinheiro") as PaymentMethodsType,
              secondPaymentAmount: payment?.secondPaymentAmount
                ? (payment.secondPaymentAmount / 100)
                  .toFixed(2)
                  .replace(".", ",")
                : "",
              secondPaymentStatus: (payment?.secondPaymentStatus ||
                "Pendente") as PaymentStatuses,
              secondPaymentMethod: (payment?.secondPaymentMethod ||
                "Dinheiro") as PaymentMethodsType,
              secondPaymentDate: payment?.secondPaymentDate
                ? new Date(payment.secondPaymentDate)
                  .toISOString()
                  .split("T")[0]
                : "",
              wasRefunded: payment?.wasRefunded || false,
              refundedAmount: payment?.refundedAmount
                ? (payment.refundedAmount / 100).toFixed(2).replace(".", ",")
                : "",
            },
          };
        });
        replaceVolunteers(initialVolunteerPayments);
        replaceTrainees([]);
      }
    }
  }, [ open, training, payerType, replaceTrainees, replaceVolunteers ]);

  const participants =
    payerType === "TRAINEE"
      ? training.Trainees?.map((t) => ({
        id: t.customerId,
        name: t.fullname,
      })) || []
      : training.Volunteers?.map((v) => ({
        id: v.volunteerId,
        name: v.name,
      })) || [];

  const onSubmit = async (data: CreateTrainingDataType) => {
    try {
      const payments =
        payerType === "TRAINEE" ? data.traineePayments : data.volunteerPayments;

      if (!payments || payments.length === 0) {
        toast.info("Nenhum participante para atualizar.");
        onOpenChange(false);
        return;
      }

      // We need to update each participant individually
      const updatePromises = payments.map(async (p) => {
        const priceCents = parseStringToCents(p.price || "0");
        const additionalCostCents = parseStringToCents(p.additionalCost || "0");
        const firstPaymentAmountCents = parseStringToCents(
          (p.paymentInfo.firstPaymentAmount as string) || "0",
        );
        const secondPaymentAmountCents = parseStringToCents(
          (p.paymentInfo.secondPaymentAmount as string) || "0",
        );
        const refundAmountCents = parseStringToCents(
          (p.paymentInfo.refundAmount as string) || "0",
        );

        const payload: UpdateTrainingPayload = {
          trainingStatus: training.trainingStatus,
          payerType: payerType,
          traineeId: payerType === "TRAINEE" ? p.participantId : undefined,
          customerId: payerType === "TRAINEE" ? p.participantId : undefined,
          volunteerId: payerType === "VOLUNTEER" ? p.participantId : undefined,
          isCourtesy:
            p.paymentInfo.paymentStatus === ("Cortesia" as PaymentStatuses),
          TrainingPayment: {
            basePrice: priceCents,
            additionalCost: additionalCostCents,
            totalPrice: priceCents + additionalCostCents,
            additionalCostDescription: p.additionalCostDescription || "",
            paymentStatus:
              p.paymentInfo.paymentStatus === ("Cortesia" as PaymentStatuses)
                ? "Pago"
                : (p.paymentInfo.paymentStatus as PaymentStatuses),
            paymentMode: "AVista" as PaymentModes,
            firstPaymentAmount: firstPaymentAmountCents,
            firstPaymentDate: p.paymentInfo.firstPaymentDate
              ? new Date(p.paymentInfo.firstPaymentDate as string)
              : null,
            firstPaymentMethod: p.paymentInfo
              .firstPaymentMethod as PaymentMethodsType,
            firstPaymentStatus: p.paymentInfo
              .firstPaymentStatus as PaymentStatuses,
            secondPaymentAmount: secondPaymentAmountCents,
            secondPaymentDate: p.paymentInfo.secondPaymentDate
              ? new Date(p.paymentInfo.secondPaymentDate as string)
              : null,
            secondPaymentMethod: p.paymentInfo
              .secondPaymentMethod as PaymentMethodsType,
            secondPaymentStatus: p.paymentInfo
              .secondPaymentStatus as PaymentStatuses,
            wasRefunded: p.paymentInfo.wasRefunded || false,
            refundedAmount: refundAmountCents,
          },
        };

        return UpdateTraining({
          trainingId: training.trainingId,
          body: payload,
        });
      });

      const results = await Promise.all(updatePromises);
      const allSuccessful = results.every((r) => r.statusCode === 200);

      if (allSuccessful) {
        toast.success("Financeiro atualizado com sucesso!");
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        if (onSuccess && results[0].data) {
          onSuccess(results[0].data);
        }
        onOpenChange(false);
      } else {
        toast.error("Ocorreu um erro ao atualizar alguns participantes.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar financeiro.");
    }
  };

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Financeiro do Treinamento</DialogTitle>
        </DialogHeader>

        <FormProvider { ...methods }>
          <form onSubmit={ handleSubmit(onSubmit) } className="space-y-6">
            <FinancialInputSection
              control={ control }
              register={ register }
              setValue={ setValue }
              watch={ methods.watch }
              errors={ errors }
              fields={
                (payerType === "TRAINEE"
                  ? traineeFields
                  : volunteerFields) as IndividualPayment[]
              }
              participants={ participants }
              type={ payerType === "TRAINEE" ? "trainee" : "volunteer" }
            />

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
                  "Salvar Tudo"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
