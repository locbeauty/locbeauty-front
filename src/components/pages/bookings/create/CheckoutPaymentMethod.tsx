"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Banknote,
  CalendarIcon,
  CheckCircle,
  Coins,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Controller, useFormContext } from "react-hook-form";
import PriceInput from "@/components/shared/PriceInput";
import { CreateCheckoutFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import {
  checkoutStatuses,
  CheckoutStatuses,
  PaymentMethods,
  paymentStatuses,
  PaymentStatuses,
} from "@/utils/constants";
import { useEffect } from "react";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { DatePicker } from "@/components/ui/DatePicker";
import { InstallmentsEditor } from "@/components/shared/InstallmentsEditor";
import { buildInstallments, fillMissingDueDates } from "@/utils/installments";

const todayISO = () => new Date().toISOString().split("T")[0];

export function CheckoutPaymentMethod() {
  const {
    setValue,
    getValues,
    control,
    watch,
    formState: { errors },
  } = useFormContext<CreateCheckoutFormSchemaType>();

  const watchedPaymentStatus = watch("paymentStatus");
  const watchedTotalPrice = watch("totalPrice");

  const installmentsError =
    (errors.paymentInfo?.installments as { message?: string } | undefined)
      ?.message ??
    (
      errors.paymentInfo?.installments as
        | { root?: { message?: string } }
        | undefined
    )?.root?.message;

  useEffect(() => {
    if (!watchedPaymentStatus) return;

    const totalCents = parseStringToCents(watchedTotalPrice || "0");

    if (watchedPaymentStatus === "Pago") {
      setValue("paymentInfo.paymentStatus", "Pago");
      setValue("paymentInfo.installments", undefined);
      setValue("paymentInfo.firstPaymentAmount", watchedTotalPrice);
      setValue("paymentInfo.firstPaymentStatus", "Pago");
      setValue("paymentInfo.secondPaymentAmount", "0,00");
      setValue("paymentInfo.secondPaymentStatus", undefined);
    }

    if (watchedPaymentStatus === "Parcial") {
      // As parcelas do editor são a fonte da verdade do pagamento parcial.
      // Inicializa com 2 parcelas: a 1ª (entrada) marcada como paga hoje e a
      // 2ª vencendo um mês depois — datas editáveis parcela a parcela.
      setValue("paymentInfo.paymentStatus", "Parcial");

      const current = getValues("paymentInfo.installments") ?? [];
      const count = current.length >= 2 ? current.length : 2;
      let next = buildInstallments(totalCents, count, current);
      if (current.length === 0) {
        const today = todayISO();
        next = next.map((inst, idx) =>
          idx === 0
            ? {
              ...inst,
              paymentStatus: "Pago" as const,
              dueDate: today,
              paymentDate: today,
            }
            : inst,
        );
      }
      next = fillMissingDueDates(next);
      if (JSON.stringify(next) !== JSON.stringify(current)) {
        setValue("paymentInfo.installments", next);
      }
    }

    if (watchedPaymentStatus === "Pendente") {
      setValue("paymentInfo.paymentStatus", "Pendente");
      setValue("paymentInfo.installments", undefined);
      setValue("paymentInfo.firstPaymentStatus", "Pendente");
      setValue("paymentInfo.firstPaymentAmount", watchedTotalPrice);
      setValue("paymentInfo.secondPaymentAmount", "0,00");
      setValue("paymentInfo.secondPaymentStatus", undefined);
    }
  }, [ watchedPaymentStatus, watchedTotalPrice, setValue, getValues ]);

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
    default:
      return "bg-gray-500";
    }
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Pagamento e Status</CardTitle>
        </div>
        <CardDescription>
          Defina como será feito o pagamento da reserva.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              Status do Pagamento
            </Label>
            <Controller
              name="paymentStatus"
              control={ control }
              render={ ({ field }) => (
                <Select
                  onValueChange={ (value: "Pendente" | "Pago" | "Parcial") => {
                    field.onChange(value);
                    setValue("paymentInfo.paymentStatus", value);
                  } }
                  value={ field.value }
                >
                  <SelectTrigger
                    className={ errors.paymentStatus ? "border-red-500" : "" }
                  >
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.filter((status) => {
                      if (
                        status === "Reembolsado" ||
                          status === "Cancelado"
                      ) {
                        return field.value === status;
                      }
                      return true;
                    }).map((status) => (
                      <SelectItem key={ status } value={ status }>
                        <div className="flex items-center gap-2">
                          <div
                            className={ `w-2 h-2 rounded-full ${getStatusColor(status)}` }
                          />
                          {status}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) }
            />
            {errors.paymentStatus && (
              <p className="text-xs text-red-500">
                {errors.paymentStatus.message}
              </p>
            )}
          </div>

          {/* <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              Status da Reserva
            </Label>
            <Controller
              name="checkoutStatus"
              control={ control }
              render={ ({ field }) => (
                <Select onValueChange={ field.onChange } value={ field.value }>
                  <SelectTrigger
                    className={ errors.checkoutStatus ? "border-red-500" : "" }
                  >
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {checkoutStatuses.map((status) => (
                      <SelectItem key={ status } value={ status }>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) }
            />
            {errors.checkoutStatus && (
              <p className="text-xs text-red-500">
                {errors.checkoutStatus.message}
              </p>
            )}
          </div> */}
        </div>

        {watchedPaymentStatus === "Parcial" && (
          <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
            <Controller
              name="paymentInfo.installments"
              control={ control }
              render={ ({ field }) => (
                <InstallmentsEditor
                  totalCents={ parseStringToCents(watchedTotalPrice || "0") }
                  installments={ field.value ?? [] }
                  onChange={ field.onChange }
                  twoColumns
                />
              ) }
            />
            <p className="text-xs text-muted-foreground">
              A data de vencimento é obrigatória em todas as parcelas: é ela
              que define a inadimplência (parcela vencida há mais de 24h).
            </p>
            {installmentsError && (
              <p className="text-xs text-red-500">{installmentsError}</p>
            )}
          </div>
        )}

        <div
          className={ `bg-muted/30 p-4 rounded-lg border space-y-6 ${watchedPaymentStatus === "Pago" ? "block" : "hidden"}` }
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold flex items-center gap-2 text-primary">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                  1
                </div>
                Primeira Parcela / Entrada
              </Label>
              {watchedPaymentStatus === "Pago" && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  Valor Total
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <Label className="text-xs text-muted-foreground">Valor</Label>
                <Controller
                  name="paymentInfo.firstPaymentAmount"
                  control={ control }
                  render={ ({ field }) => (
                    <PriceInput
                      withLabel={ false }
                      value={ field.value || "0,00" }
                      onChange={ field.onChange }
                      disabled={ watchedPaymentStatus === "Pago" }
                    />
                  ) }
                />
                {errors.paymentInfo?.firstPaymentAmount && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.paymentInfo.firstPaymentAmount.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-4">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" /> Data do Pagamento
                </Label>
                <Controller
                  name="paymentInfo.firstPaymentDate"
                  control={ control }
                  render={ ({ field }) => (
                    <DatePicker
                      value={ field.value || null }
                      onChange={ field.onChange }
                      placeholder="Selecione a data"
                      clearable
                    />
                  ) }
                />
                {errors.paymentInfo?.firstPaymentDate && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.paymentInfo.firstPaymentDate.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-4">
                <Label className="text-xs text-muted-foreground">
                  Forma de Pagamento
                </Label>
                <Controller
                  name="paymentInfo.firstPaymentMethod"
                  control={ control }
                  render={ ({ field }) => (
                    <Select
                      onValueChange={ field.onChange }
                      value={ field.value || "" }
                    >
                      <SelectTrigger
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
                  ) }
                />
                {errors.paymentInfo?.firstPaymentMethod && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.paymentInfo.firstPaymentMethod.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {errors.paymentInfo &&
          !errors.paymentInfo.firstPaymentAmount &&
          !errors.paymentInfo.firstPaymentMethod &&
          !installmentsError && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md text-sm">
            <AlertCircle className="h-4 w-4" />
            <p>Verifique os dados de pagamento.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
