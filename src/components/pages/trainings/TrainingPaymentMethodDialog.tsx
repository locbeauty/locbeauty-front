"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Banknote,
  CalendarIcon,
  CheckCircle,
  Coins,
  CreditCard,
  User,
  GraduationCap,
} from "lucide-react";
import PriceInput from "@/components/shared/PriceInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  centsToString,
  centsToStringWithCurrencyMark,
} from "@/utils/centsToString";
import { parseStringToCents } from "@/utils/parseStringToCents";
import {
  PaymentMethods,
  paymentStatuses,
  PaymentStatuses,
  PaymentModes,
} from "@/utils/constants";
import { validateCheckoutForm } from "@/utils/validators/update-payment-info";
import { BookingPaymentStatusBadge } from "../bookings/common/BookingPaymentStatusBadge";
import { UpdateTraining } from "@/services/trainings.service";
import { Trainee } from "@/utils/@types/trainee";
import { Address } from "@/utils/@types/address";
import { Training } from "@/utils/@types/training";

// --- TIPOS ---

export type PayerType = "TRAINEE" | "VOLUNTEER";
type InstallmentStatus = "Pendente" | "Pago";

export type LocalErrorsType = {
  paymentStatus: string | null;
  paymentInfo: {
    firstPaymentAmount: string | null;
    firstPaymentDate: string | null;
    firstPaymentMethod: string | null;
    secondPaymentAmount: string | null;
    secondPaymentDate: string | null;
    secondPaymentMethod: string | null;
    general?: string | null;
  };
};

export type UpdateTrainingPayload = {
  trainingStatus: string;
  payerType: PayerType;
  isCourtesy?: boolean;
  wasRefunded?: boolean;
  cancellationFee?: number;
  canceledBy?: "TRAINEE" | "VOLUNTEER";
  cancellationDate?: Date | null;
  cancellationFeePaymentDate?: Date | null;
  cancellationFeePaymentMethod?:
    | "PIX"
    | "Transferencia"
    | "Debito"
    | "Credito"
    | "Dinheiro"
    | null;
  traineeId?: string;
  customerId?: string;
  volunteerId?: string;
  addedTrainees?: string[];
  removedTrainees?: string[];
  addedVolunteers?: string[];
  removedVolunteers?: string[];
  TrainingPayment: {
    totalPrice: number;
    basePrice: number;
    additionalCost: number;
    additionalCostDescription: string;
    paymentStatus: PaymentStatuses;
    paymentMode: PaymentModes;
    firstPaymentAmount: number;
    firstPaymentDate: Date | null;
    firstPaymentMethod: string | null;
    firstPaymentStatus: InstallmentStatus;
    secondPaymentAmount: number;
    secondPaymentDate: Date | null;
    secondPaymentMethod: string | null;
    secondPaymentStatus: InstallmentStatus;
    refundAmount?: number | null;
  };
};

const initialErrors: LocalErrorsType = {
  paymentStatus: null,
  paymentInfo: {
    firstPaymentAmount: null,
    firstPaymentDate: null,
    firstPaymentMethod: null,
    secondPaymentAmount: null,
    secondPaymentDate: null,
    secondPaymentMethod: null,
    general: null,
  },
};

// --- HELPER FUNCTIONS ---

function getPaymentIcon(method: string) {
  switch (method) {
  case "PIX":
    return (
      <div className="w-4 h-4 bg-teal-600 rounded-sm flex items-center justify-center text-white text-[10px] font-bold">
          PIX
      </div>
    );
  case "Dinheiro":
    return <Coins className="h-4 w-4 text-green-600" />;
  case "Transferência bancária":
    return <Banknote className="h-4 w-4 text-blue-600" />;
  case "Crédito":
  case "Débito":
    return <CreditCard className="h-4 w-4 text-violet-600" />;
  default:
    return <CreditCard className="h-4 w-4" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
  case "Pago":
    return "bg-green-500";
  case "Parcial":
    return "bg-yellow-500";
  case "Pendente":
    return "bg-red-500";
  case "Cortesia":
    return "bg-blue-500";
  default:
    return "bg-gray-500";
  }
}

const formatDateForInput = (date: string | Date | null | undefined) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

interface TrainingPaymentMethodDialogProps {
  selectedTraining: Training | null;
  setSelectedTraining?: Dispatch<SetStateAction<Training | null>>;
  isTrainingPaymentMethodDialogOpen: boolean;
  setIsTrainingPaymentMethodDialogOpen: Dispatch<SetStateAction<boolean>>;
  payerType: PayerType;
  traineeTotalPrice?: number;
  volunteerTotalPrice?: number;
  participantId?: string | null;
}

export function TrainingPaymentMethodDialog({
  selectedTraining,
  isTrainingPaymentMethodDialogOpen,
  setIsTrainingPaymentMethodDialogOpen,
  payerType,
  setSelectedTraining,
  traineeTotalPrice,
  volunteerTotalPrice,
  participantId,
}: TrainingPaymentMethodDialogProps) {
  const queryClient = useQueryClient();
  const [ trainingStatus, setTrainingStatus ] = useState<string>("Pendente");
  const [ paymentStatus, setPaymentStatus ] =
    useState<PaymentStatuses>("Pendente");
  const [ paymentMode, setPaymentMode ] = useState<PaymentModes>("AVista");

  const [ firstPaymentAmount, setFirstPaymentAmount ] = useState("0,00");
  const [ firstPaymentDate, setFirstPaymentDate ] = useState("");
  const [ firstPaymentMethod, setFirstPaymentMethod ] = useState<string | null>(
    null,
  );
  const [ firstPaymentStatus, setFirstPaymentStatus ] =
    useState<InstallmentStatus>("Pendente");

  const [ secondPaymentAmount, setSecondPaymentAmount ] = useState("0,00");
  const [ secondPaymentDate, setSecondPaymentDate ] = useState("");
  const [ secondPaymentMethod, setSecondPaymentMethod ] = useState<string | null>(
    null,
  );
  const [ secondPaymentStatus, setSecondPaymentStatus ] =
    useState<InstallmentStatus>("Pendente");

  const [ isCourtesy, setIsCourtesy ] = useState(false);
  const [ wasRefunded, setWasRefunded ] = useState(false);
  const [ cancellationFee, setCancellationFee ] = useState<string>("0,00");
  const [ isRefunded, setIsRefunded ] = useState(false);
  const [ refundAmount, setRefundAmount ] = useState("0,00");

  const [ errors, setErrors ] = useState<LocalErrorsType>(initialErrors);
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  // 1. Encontrar o pagamento específico para o payerType atual
  const currentPaymentData = useMemo(() => {
    if (!selectedTraining || !payerType) return null;

    const paymentsList = selectedTraining.TrainingPayment;

    if (Array.isArray(paymentsList)) {
      // Find based on payerType AND participant ID if provided
      return paymentsList.find((p) => {
        const matchesType = p.payerType === payerType;
        if (!participantId) return matchesType; // Legacy fallback or general payment

        if (payerType === "TRAINEE") {
          return (
            matchesType &&
            (p.traineeId === participantId || p.customerId === participantId)
          );
        } else {
          return matchesType && p.volunteerId === participantId;
        }
      });
    }

    return null;
  }, [ selectedTraining, payerType, participantId ]);

  // Tenta sugerir um preço baseado em outros participantes do mesmo tipo se o atual for 0
  const suggestedPriceFromOthers = useMemo(() => {
    if (!selectedTraining) return 0;
    const otherPayments = Array.isArray(selectedTraining.TrainingPayment)
      ? selectedTraining.TrainingPayment
      : [];
    const sameTypePayment = otherPayments.find(
      (p) =>
        p.payerType === payerType &&
        (p.totalPrice || 0) > 0 &&
        !p.isCourtesy &&
        p.paymentStatus !== "Cortesia",
    );
    return sameTypePayment?.totalPrice || 0;
  }, [ selectedTraining, payerType ]);

  // Pega o preço para exibir no label (agora vindo de currentPaymentData) com a mesma lógica robusta
  const displayPrice =
    payerType === "TRAINEE"
      ? traineeTotalPrice ||
        (currentPaymentData
          ? currentPaymentData.isCourtesy ||
            currentPaymentData.paymentStatus === "Cortesia"
            ? 0
            : currentPaymentData.totalPrice ||
              (currentPaymentData.basePrice || 0) +
                (currentPaymentData.additionalCost || 0)
          : suggestedPriceFromOthers)
      : volunteerTotalPrice ||
        (currentPaymentData
          ? currentPaymentData.isCourtesy ||
            currentPaymentData.paymentStatus === "Cortesia"
            ? 0
            : currentPaymentData.totalPrice ||
              (currentPaymentData.basePrice || 0) +
                (currentPaymentData.additionalCost || 0)
          : suggestedPriceFromOthers);

  // Lógica de desabilitação
  const areDetailsDisabled = useMemo(() => {
    const isSavedAsPaid =
      currentPaymentData?.paymentStatus === "Pago" ||
      currentPaymentData?.paymentStatus === "Cortesia";
    const isLocallyPaid =
      paymentStatus === "Pago" || paymentStatus === "Cortesia";

    return isSavedAsPaid && isLocallyPaid;
  }, [ currentPaymentData, paymentStatus ]);

  // 2. Detectar mudanças
  const hasChanged = useMemo(() => {
    if (!selectedTraining || !payerType) return false;
    if (!currentPaymentData) return true;

    const payment = currentPaymentData;

    // Determine the effective payment status from the database
    // If isCourtesy is true, the effective status is "Cortesia", otherwise use the stored status
    const effectiveDbPaymentStatus = payment.isCourtesy
      ? "Cortesia"
      : payment.paymentStatus;

    const isSame =
      trainingStatus === selectedTraining.trainingStatus &&
      isCourtesy === (payment.isCourtesy || false) &&
      wasRefunded === (payment.wasRefunded || false) &&
      cancellationFee === centsToString(payment.cancellationFee || 0) &&
      paymentStatus === effectiveDbPaymentStatus &&
      paymentMode === payment.paymentMode &&
      firstPaymentAmount === centsToString(payment.firstPaymentAmount || 0) &&
      firstPaymentDate === formatDateForInput(payment.firstPaymentDate) &&
      firstPaymentMethod === payment.firstPaymentMethod &&
      firstPaymentStatus === (payment.firstPaymentStatus || "Pendente") &&
      secondPaymentAmount === centsToString(payment.secondPaymentAmount || 0) &&
      secondPaymentDate === formatDateForInput(payment.secondPaymentDate) &&
      secondPaymentMethod === payment.secondPaymentMethod &&
      secondPaymentStatus === (payment.secondPaymentStatus || "Pendente") &&
      isRefunded === (payment.wasRefunded || false) &&
      (isRefunded
        ? refundAmount === centsToString(payment.refundAmount || 0)
        : true);

    return !isSame;
  }, [
    selectedTraining,
    payerType,
    currentPaymentData,
    trainingStatus,
    paymentStatus,
    paymentMode,
    firstPaymentAmount,
    firstPaymentDate,
    firstPaymentMethod,
    firstPaymentStatus,
    secondPaymentAmount,
    secondPaymentDate,
    secondPaymentMethod,
    secondPaymentStatus,
    isCourtesy,
    wasRefunded,
    cancellationFee,
    isRefunded,
    refundAmount,
  ]);

  // 3. Preencher formulário ao abrir
  useEffect(() => {
    if (selectedTraining && isTrainingPaymentMethodDialogOpen && payerType) {
      setTrainingStatus(selectedTraining.trainingStatus);
      // Default values
      setIsCourtesy(false);
      setWasRefunded(false);
      setCancellationFee("0,00");
      setIsRefunded(currentPaymentData?.wasRefunded || false);
      setRefundAmount(centsToString(currentPaymentData?.refundAmount || 0));

      if (currentPaymentData) {
        // MODO EDIÇÃO
        const payment = currentPaymentData;

        // Correctly set payment status: if it's stored as 'Pago' but isCourtesy is true, show 'Cortesia'
        if (payment.isCourtesy) {
          setPaymentStatus("Cortesia");
          setIsCourtesy(true);
        } else {
          setPaymentStatus(payment.paymentStatus);
          setIsCourtesy(false);
        }

        setPaymentMode(payment.paymentMode);
        setWasRefunded(payment.wasRefunded);
        setCancellationFee(centsToString(payment.cancellationFee || 0));

        setFirstPaymentAmount(centsToString(payment.firstPaymentAmount || 0));
        setFirstPaymentDate(formatDateForInput(payment.firstPaymentDate));
        setFirstPaymentMethod(payment.firstPaymentMethod);
        setFirstPaymentStatus(payment.firstPaymentStatus || "Pendente");

        // Logic synced with CheckoutPaymentMethodDialog
        const pendingValue =
          (payment.totalPrice || 0) - (payment.firstPaymentAmount || 0);
        const secondPaymentAmountInputDisplayValue =
          payment.paymentMode === "Parcelado" ? pendingValue : 0;

        setSecondPaymentAmount(
          centsToString(secondPaymentAmountInputDisplayValue),
        );
        setSecondPaymentDate(formatDateForInput(payment.secondPaymentDate));
        setSecondPaymentMethod(payment.secondPaymentMethod);
        setSecondPaymentStatus(payment.secondPaymentStatus || "Pendente");
      } else {
        // MODO CRIAÇÃO (Caso raro se o array vier populado do backend)
        setPaymentStatus("Pendente");
        setPaymentMode("AVista");

        // Tenta pegar o preço do pagamento atual se existir, senão 0
        const suggestedAmount = 0;

        setFirstPaymentAmount(centsToString(suggestedAmount));
        setFirstPaymentDate("");
        setFirstPaymentMethod(null);
        setFirstPaymentStatus("Pendente");
        setSecondPaymentAmount("0,00");
        setSecondPaymentDate("");
        setSecondPaymentMethod(null);
        setSecondPaymentStatus("Pendente");
      }
    }
    setErrors({} as LocalErrorsType);
  }, [
    selectedTraining,
    isTrainingPaymentMethodDialogOpen,
    payerType,
    currentPaymentData,
  ]);

  useEffect(() => {
    if (
      paymentStatus === "Pago" &&
      selectedTraining &&
      paymentMode === "AVista"
    ) {
      setFirstPaymentAmount(centsToString(displayPrice));
      if (!firstPaymentDate) {
        setFirstPaymentDate(new Date().toISOString().split("T")[0]);
      }
    }
  }, [
    paymentStatus,
    displayPrice,
    paymentMode,
    selectedTraining,
    firstPaymentDate,
  ]);

  // Auto-fill payment details when status is "Cortesia"
  useEffect(() => {
    if (
      paymentStatus === "Cortesia" &&
      selectedTraining &&
      paymentMode === "AVista"
    ) {
      setFirstPaymentAmount("0,00");
      if (!firstPaymentDate) {
        setFirstPaymentDate(new Date().toISOString().split("T")[0]);
      }
    }
  }, [
    paymentStatus,
    displayPrice,
    paymentMode,
    selectedTraining,
    firstPaymentDate,
  ]);

  // Auto-calculate second parcel amount when first amount changes
  useEffect(() => {
    if (
      selectedTraining &&
      (paymentMode === "Parcelado" || paymentStatus === "Parcial")
    ) {
      const total = displayPrice;
      const first = parseStringToCents(firstPaymentAmount);
      const remaining = Math.max(0, total - first);
      setSecondPaymentAmount(centsToString(remaining));
    }
  }, [
    firstPaymentAmount,
    paymentMode,
    paymentStatus,
    selectedTraining,
    displayPrice,
    setSecondPaymentAmount,
  ]);

  async function handleSave() {
    // Calculate total cancellation fee and wasRefunded status early for validation
    const calculatedWasRefunded = wasRefunded;
    const totalCents = displayPrice;

    const isValid = validateCheckoutForm({
      paymentStatus,
      paymentMode,
      firstPaymentAmount,
      firstPaymentDate,
      firstPaymentMethod,
      firstPaymentStatus,
      secondPaymentAmount,
      secondPaymentDate,
      secondPaymentMethod,
      secondPaymentStatus: secondPaymentStatus || "Pendente",
      selectedTraining,
      totalValue: totalCents,
      initialErrors,
      setErrors,
      isRefunded: calculatedWasRefunded,
    });

    if (!selectedTraining || !isValid || !payerType) {
      return;
    }

    setIsSubmitting(true);

    const payload: UpdateTrainingPayload = {
      trainingStatus: trainingStatus,
      payerType: payerType,
      isCourtesy: isCourtesy || paymentStatus === "Cortesia",
      wasRefunded,
      cancellationFee: parseStringToCents(cancellationFee),
      traineeId:
        payerType === "TRAINEE"
          ? ((participantId || currentPaymentData?.traineeId) ?? undefined)
          : undefined,
      customerId:
        payerType === "TRAINEE"
          ? ((participantId ||
              currentPaymentData?.traineeId ||
              currentPaymentData?.customerId) ??
            undefined)
          : undefined,
      volunteerId:
        payerType === "VOLUNTEER"
          ? ((participantId || currentPaymentData?.volunteerId) ?? undefined)
          : undefined,
      TrainingPayment: {
        additionalCost: currentPaymentData?.additionalCost || 0,
        additionalCostDescription:
          currentPaymentData?.additionalCostDescription || "",
        paymentStatus: paymentStatus === "Cortesia" ? "Pago" : paymentStatus,
        paymentMode,
        totalPrice: totalCents,
        basePrice: currentPaymentData?.basePrice || -1,
        firstPaymentAmount: parseStringToCents(firstPaymentAmount),
        firstPaymentDate: firstPaymentDate ? new Date(firstPaymentDate) : null,
        firstPaymentMethod,
        firstPaymentStatus:
          paymentStatus === "Pago" ||
          paymentStatus === "Cortesia" ||
          paymentStatus === "Parcial"
            ? "Pago"
            : firstPaymentStatus,
        secondPaymentAmount: parseStringToCents(secondPaymentAmount),
        secondPaymentDate: secondPaymentDate
          ? new Date(secondPaymentDate)
          : null,
        secondPaymentMethod,
        secondPaymentStatus:
          secondPaymentDate &&
          secondPaymentMethod &&
          parseStringToCents(secondPaymentAmount) > 0
            ? "Pago"
            : secondPaymentStatus,
        refundAmount: isRefunded ? parseStringToCents(refundAmount) : null,
      },
    };

    try {
      const response = await UpdateTraining({
        trainingId: selectedTraining.trainingId,
        body: payload,
      });

      if (response.statusCode !== 200) {
        toast.warning(response.message || "Erro ao atualizar pagamento.");
      } else {
        queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-all-goals" ] });
        if (setSelectedTraining && response.data) {
          setSelectedTraining(response.data);
        }
        toast.success(
          `Pagamento do ${
            payerType === "TRAINEE" ? "Aluno" : "Modelo"
          } atualizado!`,
        );
        setIsTrainingPaymentMethodDialogOpen(false);
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const personName = useMemo(() => {
    if (!selectedTraining || !payerType) return "";

    // Check type indirectly or use check inside hook
    if (payerType === "TRAINEE") {
      if (participantId && selectedTraining.Trainees) {
        return (
          selectedTraining.Trainees.find((t) => t.customerId === participantId)
            ?.fullname || "Aluno"
        );
      }
      return (
        selectedTraining.Trainee?.fullname ||
        selectedTraining.Trainees?.[0]?.fullname ||
        "Aluno"
      );
    } else {
      if (participantId && selectedTraining.Volunteers) {
        return (
          selectedTraining.Volunteers.find(
            (v) => v.volunteerId === participantId,
          )?.name || "Modelo"
        );
      }
    }
  }, [ payerType, participantId, selectedTraining ]);

  if (!selectedTraining || !payerType) return null;

  const isTrainee = payerType === "TRAINEE";
  const dialogTitle = isTrainee
    ? "Pagamento do Aluno"
    : "Pagamento do Paciente Modelo";
  const Icon = isTrainee ? GraduationCap : User;
  const headerColorClass = isTrainee
    ? "text-orange-600 bg-orange-50"
    : "text-blue-600 bg-blue-50";

  // Lógica para bloquear inputs se a parcela já estiver paga no banco
  const isFirstInstallmentSavedAsPaid =
    currentPaymentData?.firstPaymentStatus === "Pago";
  const isSecondInstallmentSavedAsPaid =
    currentPaymentData?.secondPaymentStatus === "Pago";

  return (
    <Dialog
      open={ isTrainingPaymentMethodDialogOpen }
      onOpenChange={ setIsTrainingPaymentMethodDialogOpen }
    >
      <DialogContent className="max-h-[90vh] w-[90vw] md:w-[700px] overflow-scroll dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-3 pt-2">
              <span>Gerencie as informações financeiras para:</span>
              <div
                className={ `flex items-center gap-2 p-2 rounded-md w-fit border ${headerColorClass}` }
              >
                <Icon className="w-4 h-4" />
                <span className="font-bold text-sm">{personName}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <CardContent className="space-y-6 pt-6 px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between">
              <div className="space-y-2 w-full">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  Status do pagamento
                </Label>
                <Select
                  onValueChange={ (value: PaymentStatuses) => {
                    setPaymentStatus(value);
                    if (value === "Cortesia") {
                      setIsCourtesy(true);
                      setPaymentMode("AVista");
                    } else {
                      setIsCourtesy(false);
                    }

                    if (value === "Parcial") {
                      setPaymentMode("Parcelado");
                      setFirstPaymentAmount("0,00");
                      setFirstPaymentDate(
                        new Date().toISOString().split("T")[0],
                      );
                    } else if (value === "Pago" || value === "Cortesia") {
                      setPaymentMode("AVista");
                    }
                  } }
                  value={ paymentStatus }
                >
                  <SelectTrigger
                    className={ errors.paymentStatus ? "border-red-500" : "" }
                    disabled={
                      areDetailsDisabled ||
                      (paymentStatus === "Parcial" &&
                        isFirstInstallmentSavedAsPaid)
                    }
                  >
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses
                      .filter((status) => {
                        if (
                          status === "Reembolsado" ||
                          status === "Cancelado"
                        ) {
                          return paymentStatus === status;
                        }
                        return true;
                      })
                      .map((status) => (
                        <SelectItem key={ status } value={ status }>
                          <div className="flex items-center gap-2">
                            <div
                              className={ `w-2 h-2 rounded-full ${getStatusColor(
                                status,
                              )}` }
                            />
                            {status}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.paymentStatus && (
                  <p className="text-xs text-red-500">{errors.paymentStatus}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Checkboxes removed to match Checkout flow */}
            </div>

            {paymentStatus !== "Pendente" && paymentStatus !== "Cancelado" && (
              <div className="">
                <Label>
                  O valor total é:{" "}
                  <span>{centsToStringWithCurrencyMark(displayPrice)}</span>
                </Label>
              </div>
            )}
          </div>

          {paymentStatus !== "Pendente" &&
            paymentStatus !== "Cortesia" &&
            paymentStatus !== "Cancelado" && (
            <div className="bg-muted/30 p-4 rounded-lg border space-y-6">
              {/* --- PRIMEIRA PARCELA / ENTRADA --- */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold flex items-center gap-2 text-primary">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        1
                    </div>
                      Primeira parcela
                  </Label>
                  <BookingPaymentStatusBadge status={ firstPaymentStatus } />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4">
                    <Label className="text-xs text-muted-foreground">
                        Valor
                    </Label>
                    <PriceInput
                      disabled={
                        areDetailsDisabled ||
                          currentPaymentData?.paymentStatus === "Pago" ||
                          paymentStatus === "Pago" ||
                          // paymentMode === "Parcelado" ||
                          isFirstInstallmentSavedAsPaid
                      }
                      withLabel={ false }
                      value={ firstPaymentAmount || "0,00" }
                      onChange={ (value) => setFirstPaymentAmount(value) }
                    />
                    {errors.paymentInfo?.firstPaymentAmount && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.paymentInfo.firstPaymentAmount}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-4">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" /> Data do pagamento
                    </Label>
                    <Input
                      type="date"
                      disabled={
                        areDetailsDisabled ||
                          currentPaymentData?.paymentStatus === "Pago" ||
                          // paymentMode === "Parcelado" ||
                          isFirstInstallmentSavedAsPaid
                      }
                      value={ firstPaymentDate }
                      onChange={ (e) => setFirstPaymentDate(e.target.value) }
                    />
                    {errors.paymentInfo?.firstPaymentDate && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.paymentInfo.firstPaymentDate}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-4">
                    <Label className="text-xs text-muted-foreground">
                        Forma de pagamento
                    </Label>
                    <Select
                      onValueChange={ (value) => setFirstPaymentMethod(value) }
                      value={ firstPaymentMethod || "" }
                    >
                      <SelectTrigger
                        disabled={
                          areDetailsDisabled ||
                            currentPaymentData?.paymentStatus === "Pago" ||
                            isFirstInstallmentSavedAsPaid
                        }
                        className={
                          errors.paymentInfo?.firstPaymentMethod
                            ? "border-red-500"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PaymentMethods.map((method) => (
                          <SelectItem key={ method } value={ method }>
                            <div className="flex items-center gap-2">
                              {getPaymentIcon(method)}
                              <span>{method}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.paymentInfo?.firstPaymentMethod && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.paymentInfo.firstPaymentMethod}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* --- SEGUNDA PARCELA (CONDICIONAL) --- */}
              {(paymentMode === "Parcelado" || paymentStatus === "Parcial") &&
                  firstPaymentStatus !== "Pendente" && (
                <>
                  <div className="h-px bg-border border-dashed" />
                  <div className="space-y-3 opacity-90">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-bold flex items-center gap-2 text-orange-600">
                        <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-xs">
                              2
                        </div>
                            Segunda parcela
                      </Label>
                      <BookingPaymentStatusBadge
                        status={ secondPaymentStatus }
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-4">
                        <Label className="text-xs text-muted-foreground">
                              Valor restante
                        </Label>
                        <PriceInput
                          disabled={ true }
                          withLabel={ false }
                          value={ secondPaymentAmount || "0,00" }
                          onChange={ (value) =>
                            setSecondPaymentAmount(value)
                          }
                        />
                        {errors.paymentInfo?.secondPaymentAmount && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.paymentInfo.secondPaymentAmount}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-4">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" /> Data do
                              segundo pagamento
                        </Label>
                        <Input
                          type="date"
                          disabled={
                            areDetailsDisabled ||
                                secondPaymentStatus === "Pago"
                          }
                          value={ secondPaymentDate }
                          onChange={ (e) =>
                            setSecondPaymentDate(e.target.value)
                          }
                        />
                        {errors.paymentInfo?.secondPaymentDate && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.paymentInfo.secondPaymentDate}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-4">
                        <Label className="text-xs text-muted-foreground">
                              Forma de pagamento
                        </Label>
                        <Select
                          onValueChange={ (value) =>
                            setSecondPaymentMethod(value)
                          }
                          value={ secondPaymentMethod || "" }
                        >
                          <SelectTrigger
                            disabled={
                              areDetailsDisabled ||
                                  secondPaymentStatus === "Pago"
                            }
                            className={
                              errors.paymentInfo?.secondPaymentMethod
                                ? "border-red-500"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Selecione (opcional)..." />
                          </SelectTrigger>
                          <SelectContent>
                            {PaymentMethods.map((method) => (
                              <SelectItem key={ method } value={ method }>
                                <div className="flex items-center gap-2">
                                  {getPaymentIcon(method)}
                                  <span>{method}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.paymentInfo?.secondPaymentMethod && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.paymentInfo.secondPaymentMethod}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Refund Section */}
          {(currentPaymentData?.paymentStatus === "Pago" ||
            isFirstInstallmentSavedAsPaid ||
            isSecondInstallmentSavedAsPaid) &&
            paymentStatus !== "Cortesia" &&
            (trainingStatus !== "Concluido" || isRefunded) && (
            <div className="bg-red-50/50 p-4 rounded-lg border border-dashed border-red-200 mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="refunded"
                  checked={ isRefunded }
                  disabled={ paymentStatus === "Reembolsado" }
                  onCheckedChange={ (checked) =>
                    setIsRefunded(checked as boolean)
                  }
                />
                <Label
                  htmlFor="refunded"
                  className="text-xs text-red-600 font-medium"
                >
                    Houve Reembolso?
                </Label>
              </div>

              {isRefunded && (
                <div className="pl-6 w-full sm:w-1/2">
                  <Label className="text-xs text-muted-foreground">
                      Valor do Reembolso
                  </Label>
                  <PriceInput
                    disabled={ paymentStatus === "Reembolsado" }
                    value={ refundAmount }
                    onChange={ (value) => setRefundAmount(value) }
                  />
                </div>
              )}
            </div>
          )}

          {errors.paymentInfo?.general && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md text-sm">
              <AlertCircle className="h-4 w-4" />
              <p>{errors.paymentInfo.general}</p>
            </div>
          )}
        </CardContent>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={ () => setIsTrainingPaymentMethodDialogOpen(false) }
          >
            Cancelar
          </Button>
          <Button
            onClick={ handleSave }
            disabled={
              isSubmitting || !hasChanged || currentPaymentData?.isCourtesy
            }
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
