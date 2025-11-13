"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Banknote, CalendarIcon, CheckCircle, Coins, CreditCard } from "lucide-react";
import PriceInput from "@/components/shared/PriceInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkout } from "@/utils/@types/checkouts";
import { UpdateCheckout } from "@/services/checkouts.service";
import { toast } from "sonner";
import { queryClient } from "@/app/(main)/layout";
import { centsToString, centsToStringWithCurrencyMark } from "@/utils/centsToString";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { checkoutStatuses, PaymentMethods, paymentStatuses } from "@/utils/constants";
import { BookingPaymentStatusBadge } from "../../common/BookingPaymentStatusBadge";
import { validateCheckoutForm } from "@/utils/validators/update-payment-info";

type CheckoutStatus = "Pendente" | "Concluido" | "Cancelado";
type PaymentStatus = "Pendente" | "Pago" | "Parcial";
type PaymentMode = "AVista" | "Parcelado";
type PaymentMethod = string;
type InstallmentStatus = "Pendente" | "Pago";

export type LocalErrorsType = {
    paymentStatus: string | null;
    paymentInfo: {
        firstPaymentAmount: string | null,
        firstPaymentDate: string | null,
        firstPaymentMethod: string | null,

        secondPaymentAmount: string | null,
        secondPaymentDate: string | null,
        secondPaymentMethod: string | null,

        general?: string | null;
    }
}

export type UpdateCheckoutPayload = {
    checkoutStatus: CheckoutStatus;
    CheckoutPayment: {
        paymentStatus: PaymentStatus;
        paymentMode: PaymentMode;
        firstPaymentAmount: number;
        firstPaymentDate: Date | null;
        firstPaymentMethod: PaymentMethod | null;
        firstPaymentStatus: InstallmentStatus;
        secondPaymentAmount: number;
        secondPaymentDate: Date | null;
        secondPaymentMethod: PaymentMethod | null;
        secondPaymentStatus: InstallmentStatus;
    }
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
    }
};

function getPaymentIcon(method: string) {
    switch (method) {
    case "PIX": return <div className="w-4 h-4 bg-teal-600 rounded-sm flex items-center justify-center text-white text-[10px] font-bold">PIX</div>;
    case "Dinheiro": return <Coins className="h-4 w-4 text-green-600" />;
    case "Transferência bancária": return <Banknote className="h-4 w-4 text-blue-600" />;
    case "Crédito":
    case "Débito": return <CreditCard className="h-4 w-4 text-violet-600" />;
    default: return <CreditCard className="h-4 w-4" />;
    }
}

function getStatusColor(status: string) {
    switch (status) {
    case "Pago": return "bg-green-500";
    case "Parcial": return "bg-yellow-500";
    case "Pendente": return "bg-red-500";
    default: return "bg-gray-500";
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
    setIsCheckoutPaymentMethodDialogOpen
}: CheckoutPaymentMethodDialogProps) {

    const [ checkoutStatus, setCheckoutStatus ] = useState<CheckoutStatus>("Pendente");
    const [ paymentStatus, setPaymentStatus ] = useState<PaymentStatus>("Pendente");
    const [ paymentMode, setPaymentMode ] = useState<PaymentMode>("AVista");

    const [ firstPaymentAmount, setFirstPaymentAmount ] = useState("0,00");
    const [ firstPaymentDate, setFirstPaymentDate ] = useState("");
    const [ firstPaymentMethod, setFirstPaymentMethod ] = useState<PaymentMethod | null>(null);
    const [ firstPaymentStatus, setFirstPaymentStatus ] = useState<InstallmentStatus>("Pendente");

    const [ secondPaymentAmount, setSecondPaymentAmount ] = useState("0,00");
    const [ secondPaymentDate, setSecondPaymentDate ] = useState("");
    const [ secondPaymentMethod, setSecondPaymentMethod ] = useState<PaymentMethod | null>(null);
    const [ secondPaymentStatus, setSecondPaymentStatus ] = useState<InstallmentStatus>("Pendente");

    const [ errors, setErrors ] = useState<LocalErrorsType>(initialErrors);
    const [ isSubmitting, setIsSubmitting ] = useState(false);

    const hasChanged = useMemo(() => {
        if (!selectedCheckout) return false;

        const payment = selectedCheckout.CheckoutPayment;

        // --- Início da Lógica Replicada ---
        // Recrie a lógica EXATA do seu useEffect para os valores de "original"

        // 1. Lógica do secondPaymentAmount
        const originalPendingValue = selectedCheckout.totalPrice - (payment.firstPaymentAmount || 0);
        const originalSecondPaymentAmountValue = payment.paymentMode === "Parcelado" ? originalPendingValue : 0;
        const originalSecondPaymentAmountString = centsToString(originalSecondPaymentAmountValue);

        // 2. Lógica do secondPaymentStatus
        const originalSecondPaymentStatus = payment.secondPaymentStatus ? payment.secondPaymentStatus : "Pendente";
        // --- Fim da Lógica Replicada ---

        // Compara cada campo do estado atual com o valor original
        const isSame =
        checkoutStatus === selectedCheckout.checkoutStatus &&
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
        secondPaymentStatus === originalSecondPaymentStatus; // <--- CORRIGIDO

        // Retorna 'true' se for DIFERENTE (ou seja, se mudou)
        return !isSame;

    }, [
    // Dependências: recalcule sempre que qualquer um desses valores mudar
        selectedCheckout,
        checkoutStatus, paymentStatus, paymentMode,
        firstPaymentAmount, firstPaymentDate, firstPaymentMethod, firstPaymentStatus,
        secondPaymentAmount, secondPaymentDate, secondPaymentMethod, secondPaymentStatus
    ]);

    useEffect(() => {
        if (selectedCheckout && isCheckoutPaymentMethodDialogOpen) {
            const payment = selectedCheckout.CheckoutPayment;
            const pendingValue = selectedCheckout.totalPrice - selectedCheckout?.CheckoutPayment.firstPaymentAmount;
            setCheckoutStatus(selectedCheckout.checkoutStatus);
            setPaymentStatus(payment.paymentStatus);
            setPaymentMode(payment.paymentMode);

            setFirstPaymentAmount(centsToString(payment.firstPaymentAmount || 0));
            setFirstPaymentDate(formatDateForInput(payment.firstPaymentDate));
            setFirstPaymentMethod(payment.firstPaymentMethod);
            setFirstPaymentStatus(payment.firstPaymentStatus);

            const secondPaymentAmountInputDisplayValue = payment.paymentMode === "Parcelado" ? pendingValue : 0;

            setSecondPaymentAmount(centsToString(secondPaymentAmountInputDisplayValue));
            setSecondPaymentDate(formatDateForInput(payment.secondPaymentDate));
            setSecondPaymentMethod(payment.secondPaymentMethod);
            setSecondPaymentStatus(payment.secondPaymentStatus ? payment.secondPaymentStatus : "Pendente");

        }
        setErrors({} as LocalErrorsType);
    }, [ selectedCheckout, isCheckoutPaymentMethodDialogOpen ]);

    useEffect(() => {
        if (paymentStatus === "Pago" && selectedCheckout && paymentMode === "AVista") {
            setFirstPaymentAmount(centsToString(selectedCheckout.totalPrice));
        }
    }, [ setFirstPaymentAmount, selectedCheckout, paymentStatus, paymentMode ]);

    async function handleSave() {
        const isValid = validateCheckoutForm({
            paymentStatus,
            paymentMode,
            firstPaymentAmount,
            firstPaymentDate,
            firstPaymentMethod,
            secondPaymentAmount,
            secondPaymentDate,
            secondPaymentMethod,
            secondPaymentStatus,
            selectedCheckout,
            initialErrors,
            setErrors,
        });
        if (!selectedCheckout || !isValid) {
            return;
        }

        setIsSubmitting(true);

        const payload: UpdateCheckoutPayload = {
            checkoutStatus,
            CheckoutPayment: {
                paymentStatus,
                paymentMode,

                firstPaymentAmount: parseStringToCents(firstPaymentAmount),
                firstPaymentDate: firstPaymentDate ? new Date(firstPaymentDate) : null,
                firstPaymentMethod,
                firstPaymentStatus,

                secondPaymentAmount: parseStringToCents(secondPaymentAmount),
                secondPaymentDate: secondPaymentDate ? new Date(secondPaymentDate) : null,
                secondPaymentMethod,
                secondPaymentStatus,
            }
        };

        try {
            const response = await UpdateCheckout({
                checkoutId: selectedCheckout.checkoutId,
                body: payload
            });

            if (response.statusCode !== 200) {
                toast.warning(response.message || "Erro ao atualizar pagamento.");
            } else {

                const updatedCheckout: Checkout = {
                    ...selectedCheckout,
                    checkoutStatus: payload.checkoutStatus,
                    CheckoutPayment: {
                        ...selectedCheckout.CheckoutPayment,
                        ...payload.CheckoutPayment,
                        firstPaymentDate: payload.CheckoutPayment.firstPaymentDate
                            ? payload.CheckoutPayment.firstPaymentDate.toISOString()
                            : null,
                        secondPaymentDate: payload.CheckoutPayment.secondPaymentDate
                            ? payload.CheckoutPayment.secondPaymentDate.toISOString()
                            : null,
                        firstPaymentStatus: (!secondPaymentMethod && !secondPaymentDate) ? "Pago" : selectedCheckout.CheckoutPayment.firstPaymentStatus,
                        secondPaymentStatus: (secondPaymentMethod && secondPaymentDate) ? "Pago" : selectedCheckout.CheckoutPayment.secondPaymentStatus,
                        paymentMode: paymentStatus === "Parcial" ? "Parcelado" : "AVista",
                        paymentStatus: (secondPaymentMethod && secondPaymentDate) ? "Pago" : paymentStatus,
                    },
                };

                // Atualiza o estado local
                setSelectedCheckout(updatedCheckout);
                queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });

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
        <Dialog open={ isCheckoutPaymentMethodDialogOpen } onOpenChange={ setIsCheckoutPaymentMethodDialogOpen }>
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
                                    onValueChange={ (value: PaymentStatus) => setPaymentStatus(value) }
                                    value={ paymentStatus }
                                >
                                    <SelectTrigger disabled={ selectedCheckout.CheckoutPayment.paymentStatus === "Pago" } className={ errors.paymentStatus ? "border-red-500" : "" }>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentStatuses.map((status) => (
                                            <SelectItem key={ status } value={ status }>
                                                <div className="flex items-center gap-2">
                                                    <div className={ `w-2 h-2 rounded-full ${getStatusColor(status)}` } />
                                                    {status}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.paymentStatus && <p className="text-xs text-red-500">{errors.paymentStatus}</p>}
                            </div>
                        </div>
                        {
                            paymentStatus !== "Pendente" && (
                                <div className="">
                                    <Label>O valor total é: <span>{centsToStringWithCurrencyMark(selectedCheckout.totalPrice)}</span></Label>
                                </div>
                            )
                        }
                    </div>
                    {
                        paymentStatus !== "Pendente" && (

                            <div className={ "bg-muted/30 p-4 rounded-lg border space-y-6" }>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-bold flex items-center gap-2 text-primary">
                                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">1</div>
                                    Primeira Parcela / Entrada
                                        </Label>
                                        <BookingPaymentStatusBadge status={ selectedCheckout.CheckoutPayment.firstPaymentStatus } />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                        <div className="sm:col-span-4">
                                            <Label className="text-xs text-muted-foreground">Valor</Label>
                                            <PriceInput
                                                disabled={ paymentStatus === "Pago" || selectedCheckout?.CheckoutPayment.paymentMode === "Parcelado" }
                                                withLabel={ false }
                                                value={ firstPaymentAmount || "0,00" }
                                                onChange={ (value) => setFirstPaymentAmount(value) }
                                            />
                                            {errors.paymentInfo?.firstPaymentAmount && (
                                                <p className="text-xs text-red-500 mt-1">{errors.paymentInfo.firstPaymentAmount}</p>
                                            )}
                                        </div>

                                        <div className="sm:col-span-4">
                                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3" /> Data do Pagamento
                                            </Label>
                                            <Input
                                                disabled={ selectedCheckout.CheckoutPayment.paymentStatus === "Pago" || selectedCheckout?.CheckoutPayment.paymentMode === "Parcelado"  }
                                                type="date"
                                                value={ firstPaymentDate }
                                                onChange={ (e) => setFirstPaymentDate(e.target.value) }
                                            />
                                            {errors.paymentInfo?.firstPaymentDate && (
                                                <p className="text-xs text-red-500 mt-1">{errors.paymentInfo.firstPaymentDate}</p>
                                            )}
                                        </div>

                                        <div className="sm:col-span-4">
                                            <Label className="text-xs text-muted-foreground">Forma de Pagamento</Label>
                                            <Select
                                                onValueChange={ (value) => setFirstPaymentMethod(value) }
                                                value={ firstPaymentMethod || "" }
                                            >
                                                <SelectTrigger
                                                    disabled={ selectedCheckout.CheckoutPayment.paymentStatus === "Pago" || selectedCheckout?.CheckoutPayment.paymentMode === "Parcelado"  }
                                                    className={ errors.paymentInfo?.firstPaymentMethod ? "border-red-500" : "" }
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
                                                <p className="text-xs text-red-500 mt-1">{errors.paymentInfo.firstPaymentMethod}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {(paymentMode === "Parcelado" || paymentStatus === "Parcial") && (
                                    <>
                                        <div className="h-px bg-border border-dashed" />
                                        <div className="space-y-3 opacity-90">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-bold flex items-center gap-2 text-orange-600">
                                                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-xs">2</div>
                                            Segunda Parcela / Restante
                                                </Label>
                                                <BookingPaymentStatusBadge status={ selectedCheckout.CheckoutPayment.secondPaymentStatus } />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                                <div className="sm:col-span-4">
                                                    <Label className="text-xs text-muted-foreground">Valor Restante</Label>
                                                    <PriceInput
                                                        disabled={ true }
                                                        withLabel={ false }
                                                        value={ secondPaymentAmount || "0,00" }
                                                        onChange={ (value) => setSecondPaymentAmount(value) }
                                                    />
                                                    {errors.paymentInfo?.secondPaymentAmount && (
                                                        <p className="text-xs text-red-500 mt-1">{errors.paymentInfo.secondPaymentAmount}</p>
                                                    )}
                                                </div>

                                                <div className="sm:col-span-4">
                                                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <CalendarIcon className="w-3 h-3" /> Data Prevista
                                                    </Label>
                                                    <Input
                                                        disabled={ selectedCheckout.CheckoutPayment.paymentStatus === "Pendente" || selectedCheckout.CheckoutPayment.secondPaymentStatus === "Pago" }
                                                        type="date"
                                                        value={ secondPaymentDate }
                                                        onChange={ (e) => setSecondPaymentDate(e.target.value) }
                                                    />
                                                    {errors.paymentInfo?.secondPaymentDate && (
                                                        <p className="text-xs text-red-500 mt-1">{errors.paymentInfo.secondPaymentDate}</p>
                                                    )}
                                                </div>

                                                <div className="sm:col-span-4">
                                                    <Label className="text-xs text-muted-foreground">Forma Prevista</Label>
                                                    <Select
                                                        onValueChange={ (value) => setSecondPaymentMethod(value) }
                                                        value={ secondPaymentMethod || "" }
                                                    >
                                                        <SelectTrigger disabled={ selectedCheckout.CheckoutPayment.paymentStatus === "Pendente" || selectedCheckout.CheckoutPayment.secondPaymentStatus === "Pago" } className={ errors.paymentInfo?.secondPaymentMethod ? "border-red-500" : "" }>
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
                                                        <p className="text-xs text-red-500 mt-1">{errors.paymentInfo.secondPaymentMethod}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    }

                    {errors.paymentInfo?.general && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <p>{errors.paymentInfo.general}</p>
                        </div>
                    )}
                </CardContent>

                <DialogFooter>
                    <Button variant="outline" onClick={ () => setIsCheckoutPaymentMethodDialogOpen(false) }>
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