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
import { UpdateTraining } from "@/services/trainings.service";
import { Loader2 } from "lucide-react";
import { UpdateTrainingPayload } from "./TrainingPaymentMethodDialog";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { toast } from "sonner";
import { queryClient } from "@/app/(main)/layout";
import { FinancialInputSection } from "./FinancialInputSection";
import { CreateTrainingDataType } from "@/lib/zod/CreateTrainingValidation";

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
  const methods = useForm<CreateTrainingDataType>({
    defaultValues: {
      traineePayments: [],
      volunteerPayments: [],
    },
  });

  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
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
              paymentStatus: payment?.isCourtesy
                ? "Cortesia"
                : payment?.paymentStatus || "Pendente",
              firstPaymentDate: payment?.firstPaymentDate
                ? new Date(payment.firstPaymentDate)
                : null,
              firstPaymentAmount: payment?.firstPaymentAmount
                ? (payment.firstPaymentAmount / 100)
                  .toFixed(2)
                  .replace(".", ",")
                : "",
              firstPaymentStatus: payment?.firstPaymentStatus || "Pendente",
              firstPaymentMethod: payment?.firstPaymentMethod || "",
              secondPaymentAmount: payment?.secondPaymentAmount
                ? (payment.secondPaymentAmount / 100)
                  .toFixed(2)
                  .replace(".", ",")
                : "",
              secondPaymentStatus: payment?.secondPaymentStatus || "Pendente",
              secondPaymentMethod: payment?.secondPaymentMethod || "",
              secondPaymentDate: payment?.secondPaymentDate
                ? new Date(payment.secondPaymentDate)
                : null,
            },
          };
        });
        replaceTrainees(initialTraineePayments);
        // Clear volunteers to avoid confusion
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
              paymentStatus: payment?.isCourtesy
                ? "Cortesia"
                : payment?.paymentStatus || "Pendente",
              firstPaymentDate: payment?.firstPaymentDate
                ? new Date(payment.firstPaymentDate)
                : null,
              firstPaymentAmount: payment?.firstPaymentAmount
                ? (payment.firstPaymentAmount / 100)
                  .toFixed(2)
                  .replace(".", ",")
                : "",
              firstPaymentStatus: payment?.firstPaymentStatus || "Pendente",
              firstPaymentMethod: payment?.firstPaymentMethod || "",
              secondPaymentAmount: payment?.secondPaymentAmount
                ? (payment.secondPaymentAmount / 100)
                  .toFixed(2)
                  .replace(".", ",")
                : "",
              secondPaymentStatus: payment?.secondPaymentStatus || "Pendente",
              secondPaymentMethod: payment?.secondPaymentMethod || "",
              secondPaymentDate: payment?.secondPaymentDate
                ? new Date(payment.secondPaymentDate)
                : null,
            },
          };
        });
        replaceVolunteers(initialVolunteerPayments);
        // Clear trainees
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
        // Find existing payment to preserve other fields if needed,
        // essentially we are overwriting financial fields but keeping others safe
        const existingPayment = training.TrainingPayment?.find(
          (ep) =>
            ep.payerType === payerType &&
            (payerType === "TRAINEE"
              ? ep.traineeId === p.participantId ||
                ep.customerId === p.participantId
              : ep.volunteerId === p.participantId),
        );

        const basePrice = parseStringToCents(p.price || "0");
        const additionalCost =
          payerType === "TRAINEE"
            ? parseStringToCents(p.additionalCost || "0")
            : 0;
        const totalPrice = basePrice + additionalCost;

        const payload: UpdateTrainingPayload = {
          trainingStatus: training.trainingStatus,
          payerType: payerType,
          traineeId: payerType === "TRAINEE" ? p.participantId : undefined,
          customerId: payerType === "TRAINEE" ? p.participantId : undefined,
          volunteerId: payerType === "VOLUNTEER" ? p.participantId : undefined,

          TrainingPayment: {
            basePrice: basePrice,
            additionalCost: additionalCost,
            additionalCostDescription: p.additionalCostDescription,
            totalPrice: totalPrice,

            // Payment info
            paymentStatus: p.paymentInfo.paymentStatus || "Pendente",

            firstPaymentAmount: parseStringToCents(
              String(p.paymentInfo.firstPaymentAmount || "0"),
            ),
            firstPaymentDate: p.paymentInfo.firstPaymentDate
              ? new Date(p.paymentInfo.firstPaymentDate)
              : null,
            firstPaymentMethod: p.paymentInfo.firstPaymentMethod || null,
            firstPaymentStatus: p.paymentInfo.firstPaymentStatus || "Pendente",

            secondPaymentAmount: parseStringToCents(
              String(p.paymentInfo.secondPaymentAmount || "0"),
            ),
            secondPaymentDate: p.paymentInfo.secondPaymentDate
              ? new Date(p.paymentInfo.secondPaymentDate)
              : null,
            secondPaymentMethod: p.paymentInfo.secondPaymentMethod || null,
            secondPaymentStatus:
              p.paymentInfo.secondPaymentStatus || "Pendente",

            // Preserve other fields but update isCourtesy based on selection
            isCourtesy:
              p.paymentInfo.paymentStatus === "Cortesia"
                ? true
                : p.paymentInfo.paymentStatus === "Pendente" ||
                    p.paymentInfo.paymentStatus === "Pago" ||
                    p.paymentInfo.paymentStatus === "Parcial"
                  ? false // Explicitly false if changed to a paid status
                  : existingPayment?.isCourtesy || false, // Fallback for other statuses? Actually better to be strict
            wasRefunded: existingPayment?.wasRefunded || false,
            paymentMode: existingPayment?.paymentMode || "AVista",
          },
        };

        return UpdateTraining({
          trainingId: training.trainingId,
          body: payload,
        });
      });

      const results = await Promise.all(updatePromises);

      const hasError = results.some((r) => r.statusCode !== 200);

      if (!hasError) {
        toast.success("Valores atualizados com sucesso!");
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });

        // Ideally we should merge the results to update the selected training locally
        // For now, we return the last result's data or trigger a refetch
        if (results.length > 0 && results[results.length - 1].data) {
          onSuccess(results[results.length - 1].data!);
        }
        onOpenChange(false);
      } else {
        toast.warning("Alguns participantes podem não ter sido atualizados.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar valores.");
    }
  };

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle>
            Gerenciar Financeiro (
            {payerType === "TRAINEE" ? "Alunos" : "Pacientes Modelo"})
          </DialogTitle>
        </DialogHeader>

        <FormProvider { ...methods }>
          <form onSubmit={ handleSubmit(onSubmit) } className="space-y-6">
            <div className="border rounded-md p-5 bg-muted/10 shadow-sm">
              <FinancialInputSection
                control={ control }
                register={ register }
                setValue={ setValue }
                watch={ watch }
                errors={ errors }
                participants={ participants }
                type={ payerType === "TRAINEE" ? "trainee" : "volunteer" }
                fields={
                  payerType === "TRAINEE" ? traineeFields : volunteerFields
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={ () => onOpenChange(false) }
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={ isSubmitting }>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
