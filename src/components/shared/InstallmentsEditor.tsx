"use client";

import { useEffect, useState } from "react";
import { Banknote, CalendarIcon, Coins, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PriceInput from "@/components/shared/PriceInput";
import { PaymentMethods } from "@/utils/constants";
import { centsToString } from "@/utils/centsToString";
import { parseStringToCents } from "@/utils/parseStringToCents";
import {
  buildInstallments,
  fillMissingDueDates,
  redistributeInstallments,
  sumTotal,
} from "@/utils/installments";
import { Installment } from "@/utils/@types/payments";

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

const formatDateForInput = (date: string | null | undefined) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

const todayInput = () => new Date().toISOString().split("T")[0];

interface InstallmentsEditorProps {
  totalCents: number;
  installments: Installment[];
  onChange: (next: Installment[]) => void;
  /** Desabilita todos os controles (ex.: reembolsado). */
  disabled?: boolean;
  /** Quando true, não permite alterar o número de parcelas (ex.: já há parcela paga salva). */
  lockCount?: boolean;
  /** Exibe as parcelas em duas colunas em telas largas (ex.: página de criação). */
  twoColumns?: boolean;
}

const MAX_INSTALLMENTS = 60;

export function InstallmentsEditor({
  totalCents,
  installments,
  onChange,
  disabled,
  lockCount,
  twoColumns,
}: InstallmentsEditorProps) {
  const count = installments.length || 1;

  // Texto do input desacoplado do `count` derivado: permite limpar o campo e
  // digitar um novo número sem que o valor "salte" de volta para 1.
  const [ countText, setCountText ] = useState(String(count));

  useEffect(() => {
    setCountText(String(count));
  }, [ count ]);

  function handleCountChange(value: number) {
    const next = Math.max(1, Math.min(MAX_INSTALLMENTS, Math.floor(value || 1)));
    // Novas parcelas nascem com vencimento derivado da 1ª (mês a mês); a data
    // continua editável parcela a parcela.
    onChange(fillMissingDueDates(buildInstallments(totalCents, next, installments)));
  }

  function handleCountInputChange(value: string) {
    setCountText(value);
    const parsed = Number.parseInt(value, 10);
    // Só reconstrói as parcelas quando há um número válido (>= 1); enquanto o
    // campo está vazio/inválido, não reseta para 1.
    if (Number.isInteger(parsed) && parsed >= 1) {
      handleCountChange(parsed);
    }
  }

  function handleCountInputBlur() {
    const parsed = Number.parseInt(countText, 10);
    if (!Number.isInteger(parsed) || parsed < 1) {
      setCountText(String(count));
    }
  }

  function updateAt(index: number, patch: Partial<Installment>) {
    onChange(
      installments.map((inst, i) => (i === index ? { ...inst, ...patch } : inst)),
    );
  }

  function togglePaid(index: number, paid: boolean) {
    const inst = installments[index];
    if (paid) {
      const date = inst.dueDate || todayInput();
      updateAt(index, {
        paymentStatus: "Pago",
        dueDate: date,
        paymentDate: date,
      });
    } else {
      updateAt(index, { paymentStatus: "Pendente", paymentDate: null });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3 flex-wrap">
        <div className="w-44">
          <Label className="text-xs text-muted-foreground">
            Número de parcelas
          </Label>
          <Input
            type="number"
            min={ 1 }
            max={ MAX_INSTALLMENTS }
            value={ countText }
            disabled={ disabled || lockCount }
            onChange={ (e) => handleCountInputChange(e.target.value) }
            onBlur={ handleCountInputBlur }
          />
        </div>
        <p className="text-xs text-muted-foreground pb-2">
          Total: {centsToString(sumTotal(installments))}
        </p>
      </div>

      <div
        className={
          twoColumns
            ? "grid grid-cols-1 xl:grid-cols-2 gap-4"
            : "space-y-4"
        }
      >
        {installments.map((inst, index) => (
          <div
            key={ index }
            className="space-y-3 rounded-md border p-3 bg-background/60"
          >
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold flex items-center gap-2 text-primary">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                  {inst.number}
                </div>
              Parcela {inst.number}
              </Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={ `installment-paid-${index}` }
                  checked={ inst.paymentStatus === "Pago" }
                  disabled={ disabled }
                  onCheckedChange={ (checked) =>
                    togglePaid(index, checked === true) }
                />
                <Label
                  htmlFor={ `installment-paid-${index}` }
                  className="text-xs cursor-pointer"
                >
                Paga
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <Label className="text-xs text-muted-foreground">Valor</Label>
                <PriceInput
                  disabled={ disabled || inst.paymentStatus === "Pago" }
                  withLabel={ false }
                  value={ centsToString(inst.amount) }
                  onChange={ (value) =>
                    onChange(
                      redistributeInstallments(
                        installments,
                        index,
                        parseStringToCents(value),
                        totalCents,
                      ),
                    ) }
                />
              </div>

              <div className="sm:col-span-4">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" /> Data
                </Label>
                <Input
                  type="date"
                  disabled={ disabled }
                  value={ formatDateForInput(inst.dueDate) }
                  onChange={ (e) => {
                    const value = e.target.value || null;
                    updateAt(index, {
                      dueDate: value,
                      ...(inst.paymentStatus === "Pago"
                        ? { paymentDate: value }
                        : {}),
                    });
                  } }
                />
              </div>

              <div className="sm:col-span-4">
                <Label className="text-xs text-muted-foreground">
                Forma de pagamento
                </Label>
                <Select
                  value={ inst.paymentMethod || "" }
                  onValueChange={ (value) =>
                    updateAt(index, { paymentMethod: value }) }
                >
                  <SelectTrigger disabled={ disabled }>
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
