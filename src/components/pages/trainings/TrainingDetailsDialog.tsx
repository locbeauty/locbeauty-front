import { Dispatch, SetStateAction, useEffect, useState, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  MapPin,
  Calendar,
  Clock,
  Phone,
  GraduationCap,
  DollarSign,
  Check,
  Trash2,
  FileText,
  Building,
  Plus,
  X,
  Pencil,
  Copy,
  RefreshCcw,
} from "lucide-react";

import { BookingStatusBadge } from "../bookings/common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../bookings/common/BookingPaymentStatusBadge";

import {
  TrainingPaymentMethodDialog,
  UpdateTrainingPayload,
} from "./TrainingPaymentMethodDialog";

import { centsToString } from "@/utils/centsToString";
import { Training } from "@/utils/@types/training";
import { TrainingPayment } from "@/utils/@types/payments";
import { CancelTrainingConfirmationDialog } from "./CancelTrainingConfirmationDialog";
import { UpdateTraining } from "@/services/trainings.service";
import { toast } from "sonner";
import { FinishTrainingConfirmationDialog } from "./FinishTrainingConfirmationDialog";
import { queryClient } from "@/app/(main)/layout";
import { AddParticipantDialog } from "./AddParticipantDialog";
// import { UpdateParticipantValuesDialog } from "./UpdateParticipantValuesDialog";
import EditTrainingFinancialsDialog from "./EditTrainingFinancialsDialog";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";

interface TrainingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTraining: Training;
  setSelectedTraining?: Dispatch<SetStateAction<Training | null>>;
}

export type PayerType = "TRAINEE" | "VOLUNTEER";

export function TrainingDetailsDialog({
  open,
  onOpenChange,
  selectedTraining,
  setSelectedTraining,
}: TrainingDetailsDialogProps) {
  const [
    isTrainingPaymentMethodDialogOpen,
    setIsTrainingPaymentMethodDialogOpen,
  ] = useState(false);
  const [ isUpdateValuesDialogOpen, setIsUpdateValuesDialogOpen ] =
    useState(false);
  const [
    isCancelTrainingConfirmationDialogOpen,
    setCancelTrainingConfirmationDialogOpen,
  ] = useState(false);
  const [
    isFinishTrainingConfirmationDialogOpen,
    setFinishTrainingConfirmationDialogOpen,
  ] = useState(false);
  const [ selectedPayerType, setSelectedPayerType ] = useState<PayerType | null>(
    null,
  );
  const [ currentTrainingStatus, setCurrentTrainingStatus ] = useState(
    selectedTraining?.trainingStatus,
  );

  const [ isAddParticipantDialogOpen, setIsAddParticipantDialogOpen ] =
    useState(false);
  const [ participantTypeToAdd, setParticipantTypeToAdd ] =
    useState<PayerType>("TRAINEE");

  const [ isEditFinancialsDialogOpen, setIsEditFinancialsDialogOpen ] =
    useState(false);
  const [ financialPayerTypeToEdit, setFinancialPayerTypeToEdit ] =
    useState<PayerType>("TRAINEE");

  const { user } = useAuth();
  const [ isRestoring, setIsRestoring ] = useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const response = await UpdateTraining({
        //@ts-expect-error
        trainingId: selectedTraining.trainingId,
        body: {
          trainingStatus: selectedTraining.trainingStatus,
          payerType: "TRAINEE",
          isVisible: true,
        },
      });

      if (response && response.isVisible) {
        toast.success("Treinamento restaurado com sucesso.");
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        if (onOpenChange) onOpenChange(false);
      } else {
        toast.error("Erro ao restaurar treinamento.");
      }
    } catch (error) {
      toast.error("Erro ao restaurar treinamento.");
      console.error(error);
    } finally {
      setIsRestoring(false);
    }
  };

  useEffect(() => {
    setCurrentTrainingStatus(selectedTraining.trainingStatus);
  }, [ selectedTraining ]);

  // --- Extrair os pagamentos do Array (APENAS PARA USO GERAL/LEGADO) ---
  const { traineePayment, volunteerPayment } = useMemo(() => {
    const payments = Array.isArray(selectedTraining.TrainingPayment)
      ? selectedTraining.TrainingPayment
      : [];

    return {
      traineePayment: payments.find(
        (p: TrainingPayment) => p.payerType === "TRAINEE",
      ),
      volunteerPayment: payments.find(
        (p: TrainingPayment) => p.payerType === "VOLUNTEER",
      ),
    };
  }, [ selectedTraining ]);

  const [ selectedParticipantId, setSelectedParticipantId ] = useState<
    string | null
  >(null);

  const handleOpenPaymentDialog = (type: PayerType, participantId?: string) => {
    setSelectedPayerType(type);
    setSelectedParticipantId(participantId || null);
    setIsTrainingPaymentMethodDialogOpen(true);
  };

  const handleOpenUpdateValuesDialog = (
    type: PayerType,
    participantId?: string,
  ) => {
    setSelectedPayerType(type);
    setSelectedParticipantId(participantId || null);
    setIsUpdateValuesDialogOpen(true);
  };

  const handleOpenEditFinancials = (type: PayerType) => {
    setFinancialPayerTypeToEdit(type);
    setIsEditFinancialsDialogOpen(true);
  };

  const getSafePaymentData = (
    type: PayerType,
    participantId?: string | null,
  ) => {
    const payments = Array.isArray(selectedTraining.TrainingPayment)
      ? selectedTraining.TrainingPayment
      : [];

    // Find specific payment if ID provided
    const payment = participantId
      ? payments.find(
        (p) =>
          p.payerType === type &&
            (type === "TRAINEE"
              ? p.traineeId === participantId || p.customerId === participantId
              : p.volunteerId === participantId),
      )
      : null; // Do NOT default to "first found"

    if (payment) {
      return {
        totalPrice: payment.totalPrice,
        basePrice: payment.basePrice,
        paymentStatus: payment.paymentStatus || "Pendente",
        paymentMode: payment.paymentMode,
        firstPaymentAmount: payment.firstPaymentAmount || 0,
        firstPaymentDate: payment.firstPaymentDate
          ? new Date(payment.firstPaymentDate)
          : null,
        firstPaymentMethod: payment.firstPaymentMethod,
        firstPaymentStatus: payment.firstPaymentStatus,
        secondPaymentAmount: payment.secondPaymentAmount || 0,
        secondPaymentDate: payment.secondPaymentDate
          ? new Date(payment.secondPaymentDate)
          : null,
        secondPaymentMethod: payment.secondPaymentMethod,
        secondPaymentStatus: payment.secondPaymentStatus,
        additionalCost: payment.additionalCost || 0,
        additionalCostDescription: payment.additionalCostDescription || "",
      };
    }

    return {
      paymentStatus: "Pendente" as const,
      paymentMode: "AVista" as const,
      totalPrice: 0,
      basePrice: 0,
      firstPaymentAmount: 0,
      firstPaymentDate: null,
      firstPaymentMethod: null,
      firstPaymentStatus: "Pendente" as const,
      secondPaymentAmount: 0,
      secondPaymentDate: null,
      secondPaymentMethod: null,
      secondPaymentStatus: "Pendente" as const,
      additionalCost: 0,
      additionalCostDescription: "",
    };
  };

  const handleAddParticipantClick = (type: PayerType) => {
    setParticipantTypeToAdd(type);
    setIsAddParticipantDialogOpen(true);
  };

  const onAddParticipant = async (id: string) => {
    const type = participantTypeToAdd;
    try {
      const payload: UpdateTrainingPayload = {
        trainingStatus: selectedTraining.trainingStatus,
        payerType: type,
        traineeId: type === "TRAINEE" ? id : undefined,
        customerId: type === "TRAINEE" ? id : undefined,
        volunteerId: type === "VOLUNTEER" ? id : undefined,

        TrainingPayment: getSafePaymentData(type, null),

        addedTrainees: type === "TRAINEE" ? [ id ] : undefined,
        addedVolunteers: type === "VOLUNTEER" ? [ id ] : undefined,
      };

      const response = await UpdateTraining({
        trainingId: selectedTraining.trainingId,
        body: payload,
      });

      if (response && response.statusCode === 200) {
        toast.success("Participante adicionado com  sucesso!");
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        if (setSelectedTraining && response.data) {
          setSelectedTraining(response.data);
        }
      } else {
        toast.error(response?.message || "Erro ao adicionar participante.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao adicionar participante.");
    }
  };

  const onRemoveParticipant = async (
    type: "TRAINEE" | "VOLUNTEER",
    id: string,
  ) => {
    // Buscar status do pagamento
    const payments = Array.isArray(selectedTraining.TrainingPayment)
      ? selectedTraining.TrainingPayment
      : [];
    const participantPayment = payments.find(
      (p) =>
        p.payerType === type &&
        (type === "TRAINEE"
          ? p.traineeId === id || p.customerId === id
          : p.volunteerId === id),
    );

    // Permitir se não tiver pagamento (recém adicionado) ou se status for Pendente
    const paymentStatus = participantPayment?.paymentStatus || "Pendente";

    if (paymentStatus !== "Pendente") {
      toast.error(
        "Não é possível remover participantes com pagamentos processados (diferente de Pendente).",
      );
      return;
    }

    if (!window.confirm("Tem certeza que deseja remover este participante?"))
      return;

    const payload: UpdateTrainingPayload = {
      trainingStatus: selectedTraining.trainingStatus,
      payerType: type,
      traineeId: type === "TRAINEE" ? id : undefined,
      customerId: type === "TRAINEE" ? id : undefined,
      volunteerId: type === "VOLUNTEER" ? id : undefined,
      TrainingPayment: getSafePaymentData(type, id),
      removedTrainees: type === "TRAINEE" ? [ id ] : undefined,
      removedVolunteers: type === "VOLUNTEER" ? [ id ] : undefined,
    };

    try {
      const response = await UpdateTraining({
        trainingId: selectedTraining.trainingId,
        body: payload,
      });
      if (response && response.statusCode === 200) {
        toast.success("Participante removido com sucesso!");
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        if (setSelectedTraining && response.data) {
          setSelectedTraining(response.data);
        }
      } else {
        toast.error(response?.message || "Erro ao remover participante.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao remover participante.");
    }
  };

  const handleUpdateTrainingStatus = async (
    trainingId: string,
    trainingStatus: "Concluido" | "Cancelado",
    wasRefunded?: boolean,
    cancellationFee?: number | null,
    canceledBy?: "TRAINEE" | "VOLUNTEER",
    cancellationDate?: Date | null,
    cancellationFeePaymentDate?: Date | null,
    cancellationFeePaymentMethod?:
      | "PIX"
      | "Transferencia"
      | "Debito"
      | "Credito"
      | "Dinheiro"
      | null,
  ) => {
    try {
      const targetPayerType = canceledBy || "TRAINEE";
      const targetPayment =
        targetPayerType === "VOLUNTEER" ? volunteerPayment : traineePayment;

      const paymentData = targetPayment
        ? {
          totalPrice: targetPayment.totalPrice,
          basePrice: targetPayment.basePrice,
          paymentStatus:
              trainingStatus === "Cancelado"
                ? "Cancelado"
                : targetPayment.paymentStatus === "Cortesia"
                  ? "Pago"
                  : targetPayment.paymentStatus || "Pendente",
          paymentMode: targetPayment.paymentMode,
          firstPaymentAmount: targetPayment.firstPaymentAmount || 0,
          firstPaymentDate: targetPayment.firstPaymentDate
            ? new Date(targetPayment.firstPaymentDate)
            : null,
          firstPaymentMethod: targetPayment.firstPaymentMethod,
          firstPaymentStatus: targetPayment.firstPaymentStatus,
          secondPaymentAmount: targetPayment.secondPaymentAmount || 0,
          secondPaymentDate: targetPayment.secondPaymentDate
            ? new Date(targetPayment.secondPaymentDate)
            : null,
          secondPaymentMethod: targetPayment.secondPaymentMethod,
          secondPaymentStatus: targetPayment.secondPaymentStatus,
          additionalCost: targetPayment.additionalCost || 0,
          additionalCostDescription:
              targetPayment.additionalCostDescription || "",
        }
        : {
          paymentStatus: "Pendente" as const,
          paymentMode: "AVista" as const,
          totalPrice: 0,
          basePrice: 0,
          firstPaymentAmount: 0,
          firstPaymentDate: null,
          firstPaymentMethod: null,
          firstPaymentStatus: "Pendente" as const,
          secondPaymentAmount: 0,
          secondPaymentDate: null,
          secondPaymentMethod: null,
          secondPaymentStatus: "Pendente" as const,
          additionalCost: 0,
          additionalCostDescription: "",
        };

      const targetId =
        targetPayerType === "VOLUNTEER"
          ? targetPayment?.volunteerId ||
            selectedTraining.Volunteers?.[0]?.volunteerId
          : targetPayment?.traineeId ||
            targetPayment?.customerId ||
            selectedTraining.Trainees?.[0]?.customerId;

      const payload: UpdateTrainingPayload = {
        trainingStatus,
        payerType: targetPayerType,
        traineeId: targetPayerType === "TRAINEE" ? targetId : undefined,
        customerId: targetPayerType === "TRAINEE" ? targetId : undefined,
        volunteerId: targetPayerType === "VOLUNTEER" ? targetId : undefined,
        TrainingPayment: paymentData,
        isCourtesy: traineePayment?.isCourtesy ?? false,
        wasRefunded: wasRefunded || false,
        cancellationFee: cancellationFee || undefined,
        canceledBy: canceledBy,
        cancellationDate: cancellationDate,
        cancellationFeePaymentDate: cancellationFeePaymentDate,
        cancellationFeePaymentMethod: cancellationFeePaymentMethod,
      };

      const response = await UpdateTraining({ trainingId, body: payload });

      if (response && response.statusCode === 200) {
        toast.success(
          `Treinamento ${
            trainingStatus === "Cancelado" ? "cancelado" : "concluído"
          } com sucesso!`,
        );
        if (setSelectedTraining && response.data) {
          setSelectedTraining(response.data);
        }
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-all-goals" ] });
        onOpenChange(false);
      } else {
        toast.warning(response.message || "Erro ao atualizar status.");
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status do treinamento.");
    }
  };

  // Esta dos para os valores financeiros
  const [ traineeBasePrice, setTraineeBasePrice ] = useState(0);
  const [ traineeAdditionalCost, setTraineeAdditionalCost ] = useState(0);
  const [
    traineeAdditionalCostDescription,
    setTraineeAdditionalCostDescription,
  ] = useState("");
  const [ traineeTotalPrice, setTraineeTotalPrice ] = useState(0);
  const [ volunteerTotalPrice, setVolunteerTotalPrice ] = useState(0);

  // Helper para formatar moeda
  const formatCurrency = (val: number) => `R$ ${centsToString(val)}`;

  const canEditParticipants =
    currentTrainingStatus !== "Concluido" &&
    currentTrainingStatus !== "Cancelado";

  const handleCopySummary = () => {
    // Calculate start time
    const start = new Date(selectedTraining.dueDate);
    start.setHours(Math.floor(selectedTraining.hourInMinutes / 60));
    start.setMinutes(selectedTraining.hourInMinutes % 60);

    // Format times
    const formatTime = (date: Date) =>
      `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    const lines = [
      "*Resumo do Treinamento*",
      `Equipamento: ${selectedTraining.Gear.gearName}`,
      `Data: ${new Date(selectedTraining.dueDate).toLocaleDateString("pt-BR")}`,
      `Horário: ${formatTime(start)}`,
      `Endereço: ${selectedTraining.Address.street}, ${selectedTraining.Address.buildingNumber} - ${selectedTraining.Address.neighborhood}, ${selectedTraining.Address.city}/${selectedTraining.Address.state}`,
    ];

    const summary = lines.join("\n");
    navigator.clipboard.writeText(summary);
    toast.success("Resumo copiado para a área de transferência!");
  };

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="max-h-[90vh] w-[90vw] md:w-[900px] overflow-hidden flex flex-col dark:bg-gray-900">
        <DialogHeader className="px-1">
          <DialogTitle className="text-xl">Detalhes do Treinamento</DialogTitle>
          <DialogDescription>
            Informações do treinamento e gestão financeira.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 py-4 custom-scrollbar">
          <div className="space-y-6">
            {/* 1. CABEÇALHO (Mantido) */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {selectedTraining.Gear.gearName}
                </h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {String(
                      Math.floor(selectedTraining.hourInMinutes / 60),
                    ).padStart(2, "0")}
                    :
                    {String(selectedTraining.hourInMinutes % 60).padStart(
                      2,
                      "0",
                    )}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(selectedTraining.dueDate).toLocaleDateString(
                      "pt-BR",
                      { dateStyle: "long" },
                    )}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-auto items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8"
                  onClick={ handleCopySummary }
                >
                  <Copy className="h-3 w-3" />
                  <span className="hidden sm:inline">Copiar Resumo</span>
                </Button>
                <BookingStatusBadge status={ currentTrainingStatus } />
              </div>
            </div>

            <Separator />

            {/* 4. RESUMO DO CANCELAMENTO */}
            {selectedTraining.trainingStatus === "Cancelado" && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium text-xs text-red-600 uppercase tracking-wider flex items-center gap-2">
                    <Trash2 className="h-3 w-3" /> Detalhes do Cancelamento
                  </h4>
                  <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 text-sm space-y-2">
                    {/* Data do Cancelamento */}
                    {selectedTraining.TrainingPayment.find(
                      (p) => p.cancellationDate,
                    )?.cancellationDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Data do Cancelamento:
                        </span>
                        <span className="font-medium">
                          {new Date(
                            selectedTraining.TrainingPayment.find(
                              (p) => p.cancellationDate,
                            )!.cancellationDate!,
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}

                    {/* Taxa de Cancelamento */}
                    {selectedTraining.TrainingPayment.some(
                      (p) => (p.cancellationFee || 0) > 0,
                    ) ? (
                        selectedTraining.TrainingPayment.filter(
                          (p) => (p.cancellationFee || 0) > 0,
                        ).map((p) => (
                          <div
                            key={ `$ {p.payerType}-${p.traineeId || p.volunteerId}` }
                            className="space-y-2"
                          >
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                              Taxa (
                                {p.payerType === "TRAINEE" ? "Aluno" : "Modelo"}):
                              </span>
                              <span className="font-bold text-red-600">
                                {formatCurrency(p.cancellationFee || 0)}
                              </span>
                            </div>

                            {p.cancellationFeePaymentDate && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                Data Pagamento Taxa:
                                </span>
                                <span className="font-medium">
                                  {new Date(
                                    p.cancellationFeePaymentDate,
                                  ).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            )}

                            {p.cancellationFeePaymentMethod && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                Método Pagamento Taxa:
                                </span>
                                <span className="font-medium">
                                  {p.cancellationFeePaymentMethod}
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                          Taxa de Cancelamento:
                          </span>
                          <span className="font-medium text-green-600">
                          Isento / Não aplicada
                          </span>
                        </div>
                      )}

                    {/* Reembolso */}
                    {selectedTraining.wasRefunded && (
                      <div className="flex justify-between items-center pt-2 border-t border-red-200 dark:border-red-900/30">
                        <span className="text-muted-foreground font-medium">
                          Reembolso Efetuado
                        </span>
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* FILIAL E LOCALIZAÇÃO */}
            <div className="space-y-3">
              <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Building className="h-3 w-3" /> Filial e Localização
              </h4>
              <div className="p-4 rounded-lg border bg-muted/20 text-sm space-y-4">
                {/* Filial Info */}
                <div className="flex gap-3 items-center">
                  <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-base">
                      {selectedTraining.SourceFilial.filialName}
                    </p>
                  </div>
                </div>

                <Separator className="my-3" />

                {/* Address Info */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/20">
                    <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {selectedTraining.Address.street},{" "}
                      {selectedTraining.Address.buildingNumber}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {selectedTraining.Address.neighborhood} •{" "}
                      {selectedTraining.Address.city}/
                      {selectedTraining.Address.state}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      CEP: {selectedTraining.Address.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* 2.5 PARTICIPANTES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Aluno */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="h-3 w-3" /> Alunos (
                    {selectedTraining.Trainees?.length || 0})
                  </h4>
                  {canEditParticipants && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs flex gap-1"
                        onClick={ () => handleOpenEditFinancials("TRAINEE") }
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        Valores
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs flex gap-1"
                        onClick={ () => handleAddParticipantClick("TRAINEE") }
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {selectedTraining.Trainees?.length ? (
                    selectedTraining.Trainees.map((trainee) => {
                      const payment = selectedTraining.TrainingPayment?.find(
                        (p) =>
                          p.payerType === "TRAINEE" &&
                          (p.traineeId === trainee.customerId ||
                            p.customerId === trainee.customerId),
                      );
                      const isPartialFullyPaid =
                        payment?.paymentStatus === "Parcial" &&
                        payment?.firstPaymentStatus === "Pago" &&
                        payment?.secondPaymentStatus === "Pago";
                      const status = isPartialFullyPaid
                        ? "Pago"
                        : payment?.paymentStatus || "Pendente";
                      const canRemove =
                        canEditParticipants && status === "Pendente";

                      return (
                        <div
                          key={ trainee.customerId }
                          className="p-3 rounded-lg border bg-card flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-8 w-8 min-w-[2rem] rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                              <span className="font-bold text-xs text-orange-600">
                                {trainee.fullname?.charAt(0) || "?"}
                              </span>
                            </div>
                            <div className="text-sm overflow-hidden">
                              <p className="font-medium truncate">
                                {trainee.fullname}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <FileText className="h-3 w-3 min-w-[0.75rem]" />{" "}
                                <span className="truncate">
                                  {trainee.cpf || trainee.cnpj}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3 min-w-[0.75rem]" />{" "}
                                <span className="truncate">
                                  {trainee.cellphone}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-auto px-2">
                            <BookingPaymentStatusBadge
                              status={ status }
                              isCourtesy={ payment?.isCourtesy }
                              wasRefunded={ payment?.wasRefunded }
                              small
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={ () =>
                                handleOpenPaymentDialog(
                                  "TRAINEE",
                                  trainee.customerId,
                                )
                              }
                            >
                              <DollarSign className="h-4 w-4 text-orange-600" />
                              <span className="sr-only">
                                Gerenciar Pagamento
                              </span>
                            </Button>
                            {canRemove && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={ () =>
                                  onRemoveParticipant(
                                    "TRAINEE",
                                    trainee.customerId,
                                  )
                                }
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remover</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground italic pl-3">
                      Nenhum aluno vinculado.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <User className="h-3 w-3" /> Pacientes Modelo (
                    {selectedTraining.Volunteers?.length || 0})
                  </h4>
                  {canEditParticipants && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={ () => handleOpenEditFinancials("VOLUNTEER") }
                      >
                        <DollarSign className="h-3 w-3 mr-1" /> Valores
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={ () => handleAddParticipantClick("VOLUNTEER") }
                      >
                        <Plus className="h-3 w-3 mr-1" /> Adicionar
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {selectedTraining.Volunteers?.length ? (
                    selectedTraining.Volunteers.map((volunteer) => {
                      const payment = selectedTraining.TrainingPayment?.find(
                        (p) =>
                          p.payerType === "VOLUNTEER" &&
                          p.volunteerId === volunteer.volunteerId,
                      );
                      const isPartialFullyPaid =
                        payment?.paymentStatus === "Parcial" &&
                        payment?.firstPaymentStatus === "Pago" &&
                        payment?.secondPaymentStatus === "Pago";
                      const status = isPartialFullyPaid
                        ? "Pago"
                        : payment?.paymentStatus || "Pendente";
                      const canRemove =
                        canEditParticipants && status === "Pendente";

                      return (
                        <div
                          key={ volunteer.volunteerId }
                          className="p-3 rounded-lg border bg-card flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-8 w-8 min-w-[2rem] rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-bold text-xs text-primary">
                                {volunteer.name?.charAt(0) || "?"}
                              </span>
                            </div>
                            <div className="text-sm overflow-hidden">
                              <p className="font-medium truncate">
                                {volunteer.name || "N/A"}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <FileText className="h-3 w-3 min-w-[0.75rem]" />{" "}
                                <span className="truncate">
                                  {volunteer.documentNumber || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3 min-w-[0.75rem]" />{" "}
                                <span className="truncate">
                                  {volunteer.cellphone || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-auto px-2">
                            <BookingPaymentStatusBadge
                              status={ status }
                              isCourtesy={ payment?.isCourtesy }
                              wasRefunded={ payment?.wasRefunded }
                              small
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={ () =>
                                handleOpenPaymentDialog(
                                  "VOLUNTEER",
                                  volunteer.volunteerId,
                                )
                              }
                            >
                              <DollarSign className="h-4 w-4 text-blue-600" />
                              <span className="sr-only">
                                Gerenciar Pagamento
                              </span>
                            </Button>
                            {canRemove && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={ () =>
                                  onRemoveParticipant(
                                    "VOLUNTEER",
                                    volunteer.volunteerId,
                                  )
                                }
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remover</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground italic pl-3">
                      Nenhum modelo vinculado.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2 w-full">
          <div className="flex items-center gap-2">
            <Button
              disabled={ currentTrainingStatus !== "Pendente" }
              variant="destructive"
              className="flex items-center justify-center gap-2"
              onClick={ () => setCancelTrainingConfirmationDialogOpen(true) }
            >
              <Trash2 className="w-4 h-4" />
              <span className="sr-only md:not-sr-only">Cancelar</span>
            </Button>

            <Button
              variant="default"
              className="flex items-center justify-center gap-2"
              disabled={
                selectedTraining.trainingStatus === "Concluido" ||
                selectedTraining.trainingStatus === "Cancelado"
              }
              onClick={ () => setFinishTrainingConfirmationDialogOpen(true) }
            >
              <Check className="w-4 h-4" />
              <span className="sr-only md:not-sr-only">Concluir</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {selectedPayerType && (
        <TrainingPaymentMethodDialog
          key={ selectedPayerType }
          payerType={ selectedPayerType }
          isTrainingPaymentMethodDialogOpen={ isTrainingPaymentMethodDialogOpen }
          selectedTraining={ selectedTraining }
          setSelectedTraining={ setSelectedTraining }
          setIsTrainingPaymentMethodDialogOpen={
            setIsTrainingPaymentMethodDialogOpen
          }
          traineeTotalPrice={ traineeTotalPrice }
          volunteerTotalPrice={ volunteerTotalPrice }
          participantId={ selectedParticipantId }
        />
      )}

      <CancelTrainingConfirmationDialog
        isCancelTrainingConfirmationDialogOpen={
          isCancelTrainingConfirmationDialogOpen
        }
        setCancelTrainingConfirmationDialogOpen={
          setCancelTrainingConfirmationDialogOpen
        }
        setCurrentTrainingStatus={ setCurrentTrainingStatus }
        selectedTraining={ selectedTraining }
        setSelectedTraining={ setSelectedTraining }
        handleUpdateTrainingStatus={ handleUpdateTrainingStatus }
      />

      <FinishTrainingConfirmationDialog
        isFinishTrainingConfirmationDialogOpen={
          isFinishTrainingConfirmationDialogOpen
        }
        setFinishTrainingConfirmationDialogOpen={
          setFinishTrainingConfirmationDialogOpen
        }
        setCurrentTrainingStatus={ setCurrentTrainingStatus }
        selectedTraining={ selectedTraining }
        handleUpdateTrainingStatus={ handleUpdateTrainingStatus }
      />

      <AddParticipantDialog
        open={ isAddParticipantDialogOpen }
        onOpenChange={ setIsAddParticipantDialogOpen }
        type={ participantTypeToAdd }
        onAdd={ onAddParticipant }
        filialId={ selectedTraining.sourceFilialId }
        excludeIds={ [
          ...(selectedTraining.Trainees?.map((t) => t.customerId) || []),
          ...(selectedTraining.Volunteers?.map((v) => v.volunteerId) || []),
        ] }
      />

      <EditTrainingFinancialsDialog
        open={ isEditFinancialsDialogOpen }
        onOpenChange={ setIsEditFinancialsDialogOpen }
        training={ selectedTraining }
        payerType={ financialPayerTypeToEdit }
        onSuccess={ (updated) => {
          if (setSelectedTraining) {
            setSelectedTraining(updated);
          }
        } }
      />
    </Dialog>
  );
}
