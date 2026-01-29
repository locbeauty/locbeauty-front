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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "lucide-react";
import PriceInput from "@/components/shared/PriceInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkout } from "@/utils/@types/checkouts";
import { UpdateCheckout } from "@/services/checkouts.service";
import { toast } from "sonner";
import { queryClient } from "@/app/(main)/layout";
import {
  centsToString,
  centsToStringWithCurrencyMark,
} from "@/utils/centsToString";
import { parseStringToCents } from "@/utils/parseStringToCents";
import {
  CheckoutStatuses,
  checkoutStatuses,
  PaymentMethods,
  PaymentModes,
  PaymentStatuses,
  paymentStatuses,
} from "@/utils/constants";
import { validateCheckoutForm } from "@/utils/validators/update-payment-info";
import { BookingPaymentStatusBadge } from "../../bookings/common/BookingPaymentStatusBadge";

// type CheckoutStatus = "Pendente" | "Concluido" | "Cancelado";
// type PaymentStatus = "Pendente" | "Pago" | "Parcial";
// type PaymentMode = "AVista" | "Parcelado";
type PaymentMethod = string;
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

export type PaymentMethodData = {
  paymentStatus: PaymentStatuses;
  paymentMode: PaymentModes;
  firstPaymentAmount: number;
  firstPaymentDate: Date | null;
  firstPaymentMethod: PaymentMethod | null;
  firstPaymentStatus: InstallmentStatus;
  secondPaymentAmount: number;
  secondPaymentDate: Date | null;
  secondPaymentMethod: PaymentMethod | null;
  secondPaymentStatus: InstallmentStatus;
};

export type UpdateCheckoutPayload = {
  checkoutStatus: CheckoutStatuses;
  isCourtesy?: boolean;
  wasRefunded?: boolean;
  cancellationFee?: number;
  refundAmount?: number;
  CheckoutPayment: PaymentMethodData;
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

interface CheckoutPaymentMethodDialogProps {
  selectedCheckout: Checkout | null;
  setSelectedCheckout: Dispatch<SetStateAction<Checkout | null>>;
  isCheckoutPaymentMethodDialogOpen: boolean;
  setIsCheckoutPaymentMethodDialogOpen: Dispatch<SetStateAction<boolean>>;
}

export function CheckoutPaymentMethodDialog({
  selectedCheckout,
  setSelectedCheckout,
  isCheckoutPaymentMethodDialogOpen,
  setIsCheckoutPaymentMethodDialogOpen,
}: CheckoutPaymentMethodDialogProps) {
  const [ checkoutStatus, setCheckoutStatus ] =
    useState<CheckoutStatuses>("Pendente");
  const [ paymentStatus, setPaymentStatus ] =
    useState<PaymentStatuses>("Pendente");
  const [ paymentMode, setPaymentMode ] = useState<PaymentModes>("AVista");

  /* REMOVED: isCourtesy, wasRefunded (global), cancellationFee (global state used differently now) */
  // We still need local state for tracking changes, but we will track per-parcel refund status visually
  // Note: Persisted data only has `wasRefunded` and `cancellationFee`.
  // Refactor: Unified refund state for "Parcial" status
  const [ isRefunded, setIsRefunded ] = useState(false);
  const [ refundAmount, setRefundAmount ] = useState("0,00");

  const [ firstPaymentAmount, setFirstPaymentAmount ] = useState("0,00");
  const [ firstPaymentDate, setFirstPaymentDate ] = useState("");
  const [ firstPaymentMethod, setFirstPaymentMethod ] =
    useState<PaymentMethod | null>(null);
  const [ firstPaymentStatus, setFirstPaymentStatus ] =
    useState<InstallmentStatus>("Pendente");

  const [ secondPaymentAmount, setSecondPaymentAmount ] = useState("0,00");
  const [ secondPaymentDate, setSecondPaymentDate ] = useState("");
  const [ secondPaymentMethod, setSecondPaymentMethod ] =
    useState<PaymentMethod | null>(null);
  const [ secondPaymentStatus, setSecondPaymentStatus ] =
    useState<InstallmentStatus>("Pendente");

  const [ errors, setErrors ] = useState<LocalErrorsType>(initialErrors);
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  const hasChanged = useMemo(() => {
    if (!selectedCheckout) return false;

    const payment = selectedCheckout.CheckoutPayment;
    if (!payment) return false;

    // --- Início da Lógica Replicada ---
    // Recrie a lógica EXATA do seu useEffect para os valores de "original"

    // 1. Lógica do secondPaymentAmount
    const originalPendingValue =
      selectedCheckout.totalPrice - (payment?.firstPaymentAmount || 0);
    const originalSecondPaymentAmountValue =
      payment.paymentMode === "Parcelado" ? originalPendingValue : 0;
    const originalSecondPaymentAmountString = centsToString(
      originalSecondPaymentAmountValue,
    );

    // 2. Lógica do secondPaymentStatus
    const originalSecondPaymentStatus = payment.secondPaymentStatus
      ? payment.secondPaymentStatus
      : "Pendente";
    // --- Fim da Lógica Replicada ---

    // Compara cada campo do estado atual com o valor original
    const isSame =
      checkoutStatus === selectedCheckout.checkoutStatus &&
      // Removed isCourtesy, wasRefunded, cancellationFee from strict comparison here as they are derived/computed now
      paymentStatus === payment.paymentStatus &&
      paymentMode === payment.paymentMode &&
      firstPaymentAmount === centsToString(payment.firstPaymentAmount || 0) &&
      firstPaymentDate === formatDateForInput(payment.firstPaymentDate) &&
      firstPaymentMethod === payment.firstPaymentMethod &&
      firstPaymentStatus === payment.firstPaymentStatus &&
      // Use os valores originais calculados na comparação
      secondPaymentAmount === originalSecondPaymentAmountString && // <--- CORRIGIDO
      secondPaymentDate === formatDateForInput(payment.secondPaymentDate) &&
      secondPaymentMethod === payment.secondPaymentMethod &&
      // Use o valor original com o default correto
      secondPaymentStatus === originalSecondPaymentStatus &&
      // Check refund changes
      isRefunded === selectedCheckout.wasRefunded &&
      (isRefunded
        ? refundAmount === centsToString(selectedCheckout.refundAmount || 0)
        : true);
    // Retorna 'true' se for DIFERENTE (ou seja, se mudou)
    return !isSame;
  }, [
    // Dependências: recalcule sempre que qualquer um desses valores mudar
    selectedCheckout,
    checkoutStatus,
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
    isRefunded,
    refundAmount,
  ]);

  const isRefundedStatus =
    selectedCheckout?.CheckoutPayment?.paymentStatus === "Reembolsado";

  useEffect(() => {
    if (selectedCheckout && isCheckoutPaymentMethodDialogOpen) {
      const payment = selectedCheckout.CheckoutPayment;
      if (!payment) return;
      const pendingValue =
        selectedCheckout.totalPrice -
        (selectedCheckout?.CheckoutPayment?.firstPaymentAmount || 0);
      setCheckoutStatus(selectedCheckout.checkoutStatus);
      setPaymentStatus(payment.paymentStatus);
      setPaymentMode(payment.paymentMode);

      // Initialize Refund State
      // Simplified: If wasRefunded is true, we assume it complies with the current single refund input
      const isGlobalRefunded = selectedCheckout.wasRefunded || false;

      if (isGlobalRefunded) {
        setIsRefunded(true);
        setRefundAmount(centsToString(selectedCheckout.refundAmount || 0));
      } else {
        setIsRefunded(false);
        setRefundAmount("0,00");
      }

      setFirstPaymentAmount(centsToString(payment.firstPaymentAmount || 0));
      setFirstPaymentDate(formatDateForInput(payment.firstPaymentDate));
      setFirstPaymentMethod(payment.firstPaymentMethod);
      setFirstPaymentStatus(payment.firstPaymentStatus);

      const secondPaymentAmountInputDisplayValue =
        payment.paymentMode === "Parcelado" ? pendingValue : 0;

      setSecondPaymentAmount(
        centsToString(secondPaymentAmountInputDisplayValue),
      );
      setSecondPaymentDate(formatDateForInput(payment.secondPaymentDate));
      setSecondPaymentMethod(payment.secondPaymentMethod);
      setSecondPaymentStatus(
        payment.secondPaymentStatus ? payment.secondPaymentStatus : "Pendente",
      );
    }
    setErrors({} as LocalErrorsType);
  }, [ selectedCheckout, isCheckoutPaymentMethodDialogOpen ]);

  useEffect(() => {
    if (
      paymentStatus === "Pago" &&
      selectedCheckout &&
      paymentMode === "AVista"
    ) {
      setFirstPaymentAmount(centsToString(selectedCheckout.totalPrice));
    }
  }, [ setFirstPaymentAmount, selectedCheckout, paymentStatus, paymentMode ]);

  // Auto-calculate second parcel amount when first amount changes
  useEffect(() => {
    if (
      selectedCheckout &&
      (paymentMode === "Parcelado" || paymentStatus === "Parcial")
    ) {
      const total = selectedCheckout.totalPrice;
      const first = parseStringToCents(firstPaymentAmount);
      const remaining = Math.max(0, total - first);
      setSecondPaymentAmount(centsToString(remaining));
    }
  }, [
    firstPaymentAmount,
    paymentMode,
    paymentStatus,
    selectedCheckout,
    setSecondPaymentAmount,
  ]);

  async function handleSave() {
    // Calculate total cancellation fee and wasRefunded status early for validation
    const calculatedWasRefunded = isRefunded;

    const isValid = validateCheckoutForm({
      paymentStatus,
      paymentMode,
      firstPaymentAmount,
      firstPaymentDate,
      firstPaymentMethod,
      firstPaymentStatus, // Passando o status da 1ª parcela
      secondPaymentAmount,
      secondPaymentDate,
      secondPaymentMethod,
      secondPaymentStatus,
      selectedCheckout,
      initialErrors,
      isRefunded: calculatedWasRefunded,
      setErrors,
    });
    if (!selectedCheckout || !isValid) {
      return;
    }

    // Calculate total cancellation fee
    const calculatedRefundAmount = isRefunded
      ? parseStringToCents(refundAmount)
      : 0;

    // Validate refund amounts locally
    if (isRefunded) {
      const paidAmount = parseStringToCents(firstPaymentAmount);
      // Logic check: Refund usually shouldn't exceed what was paid.
      // In "Parcial" mode, what was paid is the first parcel.
      // In "Pago" mode, what was paid is everything.
      // We'll check against firstPaymentAmount if Parcial, or Total if Pago?
      // Actually, if status is Parcial, we only care about first parcel refund usually.
      const refundVal = parseStringToCents(refundAmount);

      const maxRefund =
        paymentStatus === "Parcial" ? paidAmount : selectedCheckout.totalPrice; //Fallback or other logic for generic refund

      if (refundVal > maxRefund) {
        toast.error(
          `O reembolso não pode ser maior que o valor pago (${centsToStringWithCurrencyMark(
            maxRefund,
          )}).`,
        );
        return;
      }
    }

    // Global cap check
    if (calculatedRefundAmount > selectedCheckout.totalPrice) {
      toast.error("O valor do reembolso não pode ser maior que o valor total.");
      return;
    }

    setIsSubmitting(true);

    const payload: UpdateCheckoutPayload = {
      checkoutStatus,
      // isCourtesy removed from UI, so we keep existing or default (handled by other logic if needed, but here we just pass existing if possible?
      // Actually per requirement 'isCourtesy' checkbox removed.
      // If we don't send isCourtesy, backend might keep it? Or set to false/undefined?
      // UpdateCheckoutPayload defines isCourtesy as optional.
      // We should probably preserve the existing value if we aren't changing it.
      isCourtesy: selectedCheckout.isCourtesy,
      wasRefunded: calculatedWasRefunded,
      refundAmount: calculatedRefundAmount,
      CheckoutPayment: {
        paymentStatus: calculatedWasRefunded ? "Reembolsado" : paymentStatus,
        paymentMode,

        firstPaymentAmount: parseStringToCents(firstPaymentAmount),
        firstPaymentDate: firstPaymentDate ? new Date(firstPaymentDate) : null,
        firstPaymentMethod,
        firstPaymentStatus,

        secondPaymentAmount: parseStringToCents(secondPaymentAmount),
        secondPaymentDate: secondPaymentDate
          ? new Date(secondPaymentDate)
          : null,
        secondPaymentMethod,
        secondPaymentStatus,
      },
    };

    try {
      const response = await UpdateCheckout({
        checkoutId: selectedCheckout.checkoutId,
        body: payload,
      });

      if (response.statusCode !== 200) {
        toast.warning(response.message || "Erro ao atualizar pagamento.");
      } else {
        const updatedCheckout: Checkout = {
          ...selectedCheckout,
          checkoutStatus: payload.checkoutStatus,
          isCourtesy: payload.isCourtesy ?? false,
          wasRefunded: payload.wasRefunded ?? false,
          cancellationFee: payload.cancellationFee ?? null,
          refundAmount: payload.refundAmount ?? null,
          CheckoutPayment: {
            ...selectedCheckout.CheckoutPayment,
            ...payload.CheckoutPayment,
            firstPaymentDate: payload.CheckoutPayment.firstPaymentDate
              ? payload.CheckoutPayment.firstPaymentDate.toISOString()
              : null,
            secondPaymentDate: payload.CheckoutPayment.secondPaymentDate
              ? payload.CheckoutPayment.secondPaymentDate.toISOString()
              : null,
            firstPaymentStatus:
              !secondPaymentMethod && !secondPaymentDate
                ? "Pago"
                : selectedCheckout.CheckoutPayment?.firstPaymentStatus ||
                  "Pendente",
            secondPaymentStatus:
              secondPaymentMethod && secondPaymentDate
                ? "Pago"
                : selectedCheckout.CheckoutPayment?.secondPaymentStatus ||
                  "Pendente",
            paymentMode: paymentMode,
            paymentStatus:
              secondPaymentMethod && secondPaymentDate
                ? "Pago"
                : payload.CheckoutPayment.paymentStatus,
          },
        };

        // Atualiza o estado local
        setSelectedCheckout(updatedCheckout);
        queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-all-goals" ] });

        toast.success("Pagamento atualizado com sucesso!");
        queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
        setIsCheckoutPaymentMethodDialogOpen(false);
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!selectedCheckout) return null;

  return (
    <Dialog
      open={ isCheckoutPaymentMethodDialogOpen }
      onOpenChange={ setIsCheckoutPaymentMethodDialogOpen }
    >
      <DialogContent className="max-h-[90vh] w-[90vw] md:w-[700px] overflow-scroll dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl">Gerenciar Pagamento</DialogTitle>
          <DialogDescription>
            Atualize o status do pagamento e da reserva.
          </DialogDescription>
        </DialogHeader>

        <CardContent className="space-y-6 pt-6 px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  Status do Pagamento
                </Label>
                <Select
                  disabled={ selectedCheckout.checkoutStatus === "Cancelado" }
                  onValueChange={ (value: PaymentStatuses) => {
                    setPaymentStatus(value);
                    if (value === "Parcial") {
                      setPaymentMode("Parcelado");
                      setFirstPaymentAmount("0,00");
                      setFirstPaymentDate(
                        new Date().toISOString().split("T")[0],
                      );
                    } else if (value === "Pago") {
                      setPaymentMode("AVista");
                    }
                  } }
                  value={ paymentStatus }
                >
                  <SelectTrigger
                    disabled={
                      isRefundedStatus ||
                      selectedCheckout.CheckoutPayment?.paymentStatus ===
                        "Pago" ||
                      (paymentStatus === "Parcial" &&
                        firstPaymentStatus === "Pago")
                    }
                    className={ errors.paymentStatus ? "border-red-500" : "" }
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
              {/* Checkboxes removed as requested */}
            </div>

            {paymentStatus !== "Pendente" && paymentStatus !== "Cancelado" && (
              <div className="">
                <Label>
                  O valor total é:{" "}
                  <span>
                    {centsToStringWithCurrencyMark(selectedCheckout.totalPrice)}
                  </span>
                </Label>
              </div>
            )}
          </div>
          {paymentStatus !== "Pendente" &&
            paymentStatus !== "Cortesia" &&
            paymentStatus !== "Cancelado" && (
            <div className={ "bg-muted/30 p-4 rounded-lg border space-y-6" }>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold flex items-center gap-2 text-primary">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        1
                    </div>
                      Primeira Parcela / Entrada
                  </Label>
                  <BookingPaymentStatusBadge
                    status={
                      selectedCheckout.CheckoutPayment?.firstPaymentStatus
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4">
                    <Label className="text-xs text-muted-foreground">
                        Valor
                    </Label>
                    <PriceInput
                      disabled={
                        isRefundedStatus ||
                          paymentStatus === "Pago" ||
                          selectedCheckout?.CheckoutPayment?.paymentMode ===
                            "Parcelado" ||
                          firstPaymentStatus === "Pago"
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
                      <CalendarIcon className="w-3 h-3" /> Data do Pagamento
                    </Label>
                    <Input
                      disabled={
                        isRefundedStatus ||
                          selectedCheckout.CheckoutPayment?.paymentStatus ===
                            "Pago" ||
                          selectedCheckout?.CheckoutPayment?.paymentMode ===
                            "Parcelado" ||
                          firstPaymentStatus === "Pago"
                      }
                      type="date"
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
                        Forma de Pagamento
                    </Label>
                    <Select
                      onValueChange={ (value) => setFirstPaymentMethod(value) }
                      value={ firstPaymentMethod || "" }
                    >
                      <SelectTrigger
                        disabled={
                          isRefundedStatus ||
                            selectedCheckout.CheckoutPayment?.paymentStatus ===
                              "Pago" ||
                            selectedCheckout?.CheckoutPayment?.paymentMode ===
                              "Parcelado" ||
                            firstPaymentStatus === "Pago"
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
                            Segunda Parcela / Restante
                      </Label>
                      <BookingPaymentStatusBadge
                        status={
                          selectedCheckout.CheckoutPayment
                            ?.secondPaymentStatus
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-4">
                        <Label className="text-xs text-muted-foreground">
                              Valor Restante
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
                          <CalendarIcon className="w-3 h-3" /> Data Prevista
                        </Label>
                        <Input
                          disabled={
                            isRefundedStatus ||
                                selectedCheckout.CheckoutPayment
                                  ?.paymentStatus === "Pendente" ||
                                selectedCheckout.CheckoutPayment
                                  ?.secondPaymentStatus === "Pago"
                          }
                          type="date"
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
                              Forma Prevista
                        </Label>
                        <Select
                          onValueChange={ (value) =>
                            setSecondPaymentMethod(value)
                          }
                          value={ secondPaymentMethod || "" }
                        >
                          <SelectTrigger
                            disabled={
                              isRefundedStatus ||
                                  selectedCheckout.CheckoutPayment
                                    ?.paymentStatus === "Pendente" ||
                                  selectedCheckout.CheckoutPayment
                                    ?.secondPaymentStatus === "Pago"
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

          {/* Refund Section - Hide when Concluído unless already refunded */}
          {(selectedCheckout.CheckoutPayment?.paymentStatus === "Pago" ||
            selectedCheckout.CheckoutPayment?.firstPaymentStatus === "Pago" ||
            selectedCheckout.CheckoutPayment?.secondPaymentStatus === "Pago") &&
            (checkoutStatus !== "Concluido" ||
              isRefunded ||
              selectedCheckout.wasRefunded) && (
            <div className="bg-red-50/50 p-4 rounded-lg border border-dashed border-red-200 mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="refunded"
                  checked={ isRefunded }
                  disabled={
                    selectedCheckout.CheckoutPayment?.paymentStatus ===
                      "Reembolsado"
                  }
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
                    disabled={
                      selectedCheckout.CheckoutPayment?.paymentStatus ===
                        "Reembolsado"
                    }
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
            onClick={ () => setIsCheckoutPaymentMethodDialogOpen(false) }
          >
            Cancelar
          </Button>
          <Button onClick={ handleSave } disabled={ isSubmitting || !hasChanged }>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
