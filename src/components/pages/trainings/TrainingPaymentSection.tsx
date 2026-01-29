/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable indent */
"use client";

import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import {
  CheckCircle,
  CalendarIcon,
  CreditCard,
  Banknote,
  QrCode,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import PriceInput from "@/components/shared/PriceInput";

// --- Helpers de Formatação e Parsing ---

import { DatePicker } from "@/components/ui/DatePicker";
import {
  paymentStatuses,
  PaymentMethods as paymentMethods,
} from "@/utils/constants";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pago":
      return "bg-green-500";
    case "Parcial":
      return "bg-orange-500";
    case "Cortesia":
      return "bg-blue-500";
    default:
      return "bg-gray-300";
  }
};

const getPaymentIcon = (method: string) => {
  switch (method) {
    case "Pix":
      return <QrCode className="w-4 h-4" />;
    case "Dinheiro":
      return <Banknote className="w-4 h-4" />;
    case "Cartão de Crédito":
    case "Cartão de Débito":
      return <CreditCard className="w-4 h-4" />;
    default:
      return <Banknote className="w-4 h-4" />;
  }
};

const parseCurrencyToFloat = (
  value: string | number | null | undefined,
): number => {
  if (!value) return 0;
  if (typeof value === "number") return value;
  // Remove tudo que não é dígito ou vírgula, depois troca vírgula por ponto
  const cleanString = value.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(cleanString) || 0;
};

const formatToDecimalString = (value: number) => {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// --- Componente Principal ---

interface TrainingPaymentSectionProps {
  prefix: string;
  label?: string;
  totalValue?: number;
}

import { CreateTrainingDataType } from "@/lib/zod/CreateTrainingValidation";

export function TrainingPaymentSection({
  prefix,
  label,
  totalValue = 0,
}: TrainingPaymentSectionProps) {
  const {
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<CreateTrainingDataType>();

  const paymentStatus = watch(
    `${prefix}.paymentInfo.paymentStatus` as any,
  ) as unknown as string;
  const firstPaymentStatus = watch(
    `${prefix}.paymentInfo.firstPaymentStatus` as any,
  ) as unknown as string;
  const firstPaymentAmount = watch(
    `${prefix}.paymentInfo.firstPaymentAmount` as any,
  );

  // Efeito 1: Quando status muda para "Pago" ou "Cortesia", ajusta valores como no CheckoutDialog
  useEffect(() => {
    if (totalValue > 0) {
      if (paymentStatus === "Pago") {
        // Replica lógica de CheckoutPaymentMethodDialog para "Pago"
        setValue(
          `${prefix}.paymentInfo.firstPaymentAmount` as any,
          formatToDecimalString(totalValue),
        );
        setValue(`${prefix}.paymentInfo.firstPaymentStatus` as any, "Pago");

        // Auto-fill date if empty
        const currentDate = getValues(
          `${prefix}.paymentInfo.firstPaymentDate` as any,
        );
        if (!currentDate) {
          setValue(`${prefix}.paymentInfo.firstPaymentDate` as any, new Date());
        }

        // Limpa segunda parcela
        setValue(`${prefix}.paymentInfo.secondPaymentAmount` as any, null);
        setValue(`${prefix}.paymentInfo.secondPaymentDate` as any, null);
        setValue(`${prefix}.paymentInfo.secondPaymentMethod` as any, null);
        setValue(`${prefix}.paymentInfo.secondPaymentStatus` as any, null);
      } else if (paymentStatus === "Cortesia") {
        // Para cortesia, podemos limpar ou zerar.
        // O backend provavelmente ignora, mas para UI limpa:
        setValue(`${prefix}.paymentInfo.firstPaymentAmount` as any, "0,00");
        setValue(`${prefix}.paymentInfo.secondPaymentAmount` as any, null);
      }
    }
  }, [ paymentStatus, totalValue, setValue, prefix, getValues ]); // getValues is stable

  // Efeito 2: Calcular valor da 2ª parcela se for "Parcial"
  useEffect(() => {
    if (paymentStatus === "Parcial") {
      // Auto-fill date if empty for Parcial too
      const currentDate = getValues(
        `${prefix}.paymentInfo.firstPaymentDate` as any,
      );
      if (!currentDate) {
        setValue(`${prefix}.paymentInfo.firstPaymentDate` as any, new Date());
      }

      if (totalValue > 0) {
        const firstAmount = parseCurrencyToFloat(
          firstPaymentAmount as unknown as string | number,
        );
        const remaining = Math.max(0, totalValue - firstAmount);
        setValue(
          `${prefix}.paymentInfo.secondPaymentAmount` as any,
          formatToDecimalString(remaining),
        );
      }
    }
  }, [
    paymentStatus,
    firstPaymentAmount,
    totalValue,
    setValue,
    prefix,
    getValues,
  ]);

  // ...

  // Helper para verificar erro no select de status
  // Acessa errors['traineePayment']['paymentInfo']['paymentStatus'] de forma segura
  const statusError = (errors as any)?.[prefix]?.paymentInfo?.paymentStatus;

  return (
    <div className="space-y-4 py-4 border-t mt-4">
      {label && (
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          {label}
        </h4>
      )}
      {/* Cabeçalho: Status do Pagamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            Status do Pagamento
          </Label>

          <FormField
            control={ control }
            name={ `${prefix}.paymentInfo.paymentStatus` as any }
            render={ ({ field }) => (
              <FormItem>
                <Select
                  onValueChange={ field.onChange }
                  value={ (field.value as string) || "Pendente" }
                >
                  <FormControl>
                    <SelectTrigger
                      className={ statusError ? "border-red-500" : "" }
                    >
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paymentStatuses
                      .filter((status) => {
                        // Oculta "Cancelado" e "Reembolsado" se não estiverem selecionados
                        if (
                          (status === "Cancelado" ||
                            status === "Reembolsado") &&
                          field.value !== status
                        ) {
                          return false;
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
                <FormMessage />
              </FormItem>
            ) }
          />
        </div>
      </div>

      {/* Inputs Detalhados (Aparecem se não for Pendente) */}
      {paymentStatus && paymentStatus !== "Pendente" && (
        <div className="bg-muted/30 p-4 rounded-lg border space-y-6 animate-in fade-in slide-in-from-top-2">
          {/* --- 1ª PARCELA / ENTRADA --- */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold flex items-center gap-2 text-primary">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                  1
                </div>
                {paymentStatus === "Parcial"
                  ? "Entrada / Primeira Parcela"
                  : "Valor Total"}
              </Label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <FormField
                  control={ control }
                  name={ `${prefix}.paymentInfo.firstPaymentAmount` as any }
                  render={ ({ field }) => (
                    <FormItem>
                      <Label className="text-xs text-muted-foreground">
                        Valor
                      </Label>
                      <FormControl>
                        <PriceInput
                          { ...field }
                          withLabel={ false }
                          value={
                            field.value != null
                              ? String(field.value)
                              : undefined
                          }
                          // Desabilita edição se estiver "Pago" (pois o useEffect fixa o valor total)
                          disabled={ paymentStatus === "Pago" }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  ) }
                />
              </div>

              <div className="sm:col-span-4">
                <FormField
                  control={ control }
                  name={ `${prefix}.paymentInfo.firstPaymentDate` as any }
                  render={ ({ field }) => (
                    <FormItem>
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" /> Data do Pagamento
                      </Label>
                      <FormControl>
                          <DatePicker
                              value={field.value ? new Date(field.value) : null}
                              onChange={field.onChange}
                              placeholder="Selecione a data"
                            />
                      </FormControl>
                      <FormMessage className="text-xs" />
                     </FormItem>
                  )}
                />
              </div>

              <div className="sm:col-span-4">
                <FormField
                  control={control}
                  name={`${prefix}.paymentInfo.firstPaymentMethod` as any}
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-xs text-muted-foreground">
                        Forma de Pagamento
                      </Label>
                      <Select
                        onValueChange={field.onChange}
                        value={(field.value as string) ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              <div className="flex items-center gap-2">
                                {getPaymentIcon(method)}
                                <span>{method}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* --- 2ª PARCELA / RESTANTE (Apenas Parcial) --- */}
          {paymentStatus === "Parcial" && firstPaymentStatus !== "Pendente" && (
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4">
                    <FormField
                      control={control}
                      name={`${prefix}.paymentInfo.secondPaymentAmount` as any}
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-xs text-muted-foreground">
                            Valor Restante
                          </Label>
                          <FormControl>
                            <PriceInput
                              {...field}
                              withLabel={false}
                              disabled={true} // Sempre calculado automaticamente
                              value={field.value ? String(field.value) : ""}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <FormField
                      control={control}
                      name={`${prefix}.paymentInfo.secondPaymentDate` as any}
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" /> Data Prevista
                          </Label>
                          <FormControl>
                            <DatePicker
                              value={field.value ? new Date(field.value) : null}
                              onChange={field.onChange}
                              placeholder="Selecione a data"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <FormField
                      control={control}
                      name={`${prefix}.paymentInfo.secondPaymentMethod` as any}
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-xs text-muted-foreground">
                            Forma Prevista
                          </Label>
                          <Select
                            onValueChange={field.onChange}
                            value={(field.value as string) ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paymentMethods.map((method) => (
                                <SelectItem key={method} value={method}>
                                  <div className="flex items-center gap-2">
                                    {getPaymentIcon(method)}
                                    <span>{method}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
