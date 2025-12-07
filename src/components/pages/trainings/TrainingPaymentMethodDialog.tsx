"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Banknote, CalendarIcon, CheckCircle, Coins, CreditCard } from "lucide-react";
import PriceInput from "@/components/shared/PriceInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { UpdateCheckout } from "@/services/checkouts.service"; // Substitua pelo serviço de Training
import { toast } from "sonner";
import { queryClient } from "@/app/(main)/layout";
import { centsToString, centsToStringWithCurrencyMark } from "@/utils/centsToString";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { PaymentMethods, paymentStatuses } from "@/utils/constants";
import { validateCheckoutForm } from "@/utils/validators/update-payment-info"; // Você pode querer renomear este validador para ser genérico ou criar um validateTrainingForm
import { Training } from "@/utils/@types/training";
import { BookingPaymentStatusBadge } from "../bookings/common/BookingPaymentStatusBadge";

// Tipos auxiliares locais
type TrainingStatus = "Pendente" | "Concluido" | "Cancelado";
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

// Payload adaptado para Training
export type UpdateTrainingPayload = {
    trainingStatus: TrainingStatus;
    TrainingPayment: {
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

interface TrainingPaymentMethodDialogProps {
    selectedTraining: Training | null;
    isTrainingPaymentMethodDialogOpen: boolean;
    setIsTrainingPaymentMethodDialogOpen: Dispatch<SetStateAction<boolean>>;
}

export function TrainingPaymentMethodDialog({
    selectedTraining,
    isTrainingPaymentMethodDialogOpen,
    setIsTrainingPaymentMethodDialogOpen
}: TrainingPaymentMethodDialogProps) {

    const [ trainingStatus, setTrainingStatus ] = useState<TrainingStatus>("Pendente");
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
        if (!selectedTraining) return false;

        // ADAPTAÇÃO: Acessando TrainingPayment ao invés de CheckoutPayment
        const payment = selectedTraining.TrainingPayment;

        // ADAPTAÇÃO: Acessando price ao invés de totalPrice
        const originalPendingValue = selectedTraining.price - (payment.firstPaymentAmount || 0);
        const originalSecondPaymentAmountValue = payment.paymentMode === "Parcelado" ? originalPendingValue : 0;
        const originalSecondPaymentAmountString = centsToString(originalSecondPaymentAmountValue);

        const originalSecondPaymentStatus = payment.secondPaymentStatus ? payment.secondPaymentStatus : "Pendente";

        // Compara cada campo do estado atual com o valor original
        // ADAPTAÇÃO: Usando trainingStatus
        const isSame =
        trainingStatus === selectedTraining.trainingStatus &&
        paymentStatus === payment.paymentStatus &&
        paymentMode === payment.paymentMode &&
        firstPaymentAmount === centsToString(payment.firstPaymentAmount || 0) &&
        firstPaymentDate === formatDateForInput(payment.firstPaymentDate) &&
        firstPaymentMethod === payment.firstPaymentMethod &&
        firstPaymentStatus === payment.firstPaymentStatus &&

        secondPaymentAmount === originalSecondPaymentAmountString &&
        secondPaymentDate === formatDateForInput(payment.secondPaymentDate) &&
        secondPaymentMethod === payment.secondPaymentMethod &&
        secondPaymentStatus === originalSecondPaymentStatus;

        return !isSame;

    }, [
        selectedTraining,
        trainingStatus, paymentStatus, paymentMode,
        firstPaymentAmount, firstPaymentDate, firstPaymentMethod, firstPaymentStatus,
        secondPaymentAmount, secondPaymentDate, secondPaymentMethod, secondPaymentStatus
    ]);

    useEffect(() => {
        if (selectedTraining && isTrainingPaymentMethodDialogOpen) {
            // ADAPTAÇÃO: Mapeamento de propriedades
            const payment = selectedTraining.TrainingPayment;
            const pendingValue = selectedTraining.price - selectedTraining?.TrainingPayment.firstPaymentAmount;

            setTrainingStatus(selectedTraining.trainingStatus as TrainingStatus);
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
    }, [ selectedTraining, isTrainingPaymentMethodDialogOpen ]);

    // Auto-preencher valor total se for Pagamento À Vista e Status Pago
    useEffect(() => {
        if (paymentStatus === "Pago" && selectedTraining && paymentMode === "AVista") {
            // ADAPTAÇÃO: Usando price
            setFirstPaymentAmount(centsToString(selectedTraining.price));
        }
    }, [ setFirstPaymentAmount, selectedTraining, paymentStatus, paymentMode ]);

    async function handleSave() {
        // Observação: validateCheckoutForm pode precisar de adaptação se ele verificar propriedades específicas de "Checkout"
        // como "totalPrice". Se ele só valida os campos de pagamento soltos passados abaixo, vai funcionar.
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
            selectedTraining: selectedTraining,
            initialErrors,
            setErrors,
        });

        if (!selectedTraining || !isValid) {
            return;
        }

        setIsSubmitting(true);

        const payload: UpdateTrainingPayload = {
            trainingStatus: trainingStatus,
            TrainingPayment: {
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

        // try {
        //     // ADAPTAÇÃO: Chamada ao serviço de Training
        //     const response = await UpdateTraining({
        //         trainingId: selectedTraining.trainingId,
        //         body: payload
        //     });

        //     if (response.statusCode !== 200) {
        //         toast.warning(response.message || "Erro ao atualizar pagamento.");
        //     } else {

        //         // Atualizando o objeto local com a resposta/payload
        //         const updatedTraining: Training = {
        //             ...selectedTraining,
        //             trainingStatus: payload.trainingStatus as any, // Cast se os enums forem ligeiramente diferentes no TS
        //             TrainingPayment: {
        //                 ...selectedTraining.TrainingPayment,
        //                 ...payload.TrainingPayment,
        //                 firstPaymentDate: payload.TrainingPayment.firstPaymentDate
        //                     ? payload.TrainingPayment.firstPaymentDate.toISOString()
        //                     : null,
        //                 secondPaymentDate: payload.TrainingPayment.secondPaymentDate
        //                     ? payload.TrainingPayment.secondPaymentDate.toISOString()
        //                     : null,
        //                 // Lógica para definir status 'Pago' automaticamente se não houver segunda parcela
        //                 firstPaymentStatus: (!secondPaymentMethod && !secondPaymentDate) ? "Pago" : selectedTraining.TrainingPayment.firstPaymentStatus,
        //                 secondPaymentStatus: (secondPaymentMethod && secondPaymentDate) ? "Pago" : selectedTraining.TrainingPayment.secondPaymentStatus,
        //                 paymentMode: paymentStatus === "Parcial" ? "Parcelado" : "AVista",
        //                 paymentStatus: (secondPaymentMethod && secondPaymentDate) ? "Pago" : paymentStatus,
        //             },
        //         };

        //         // Atualiza o estado local
        //         setSelectedTraining(updatedTraining);

        //         // ADAPTAÇÃO: Invalidando queries de Training
        //         queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });

        //         toast.success("Pagamento de treino atualizado com sucesso!");
        //         setIsTrainingPaymentMethodDialogOpen(false);
        //     }
        // } catch (error) {
        //     toast.error("Ocorreu um erro inesperado.");
        //     console.error(error);
        // } finally {
        //     setIsSubmitting(false);
        // }
    }

    if (!selectedTraining) return null;

    return (
        <Dialog open={ isTrainingPaymentMethodDialogOpen } onOpenChange={ setIsTrainingPaymentMethodDialogOpen }>
            <DialogContent className="max-h-[90vh] w-[90vw] md:w-[700px] overflow-scroll dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="text-xl">Gerenciar Pagamento do Treino</DialogTitle>
                    <DialogDescription>
                        Atualize o status do pagamento e do treino.
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
                                    <SelectTrigger disabled={ selectedTraining.TrainingPayment.paymentStatus === "Pago" } className={ errors.paymentStatus ? "border-red-500" : "" }>
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
                                    <Label>O valor total é: <span>{centsToStringWithCurrencyMark(selectedTraining.price)}</span></Label>
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
                                        {/* Assumindo que você usa o mesmo componente visual de badge */}
                                        <BookingPaymentStatusBadge status={ selectedTraining.TrainingPayment.firstPaymentStatus } />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                        <div className="sm:col-span-4">
                                            <Label className="text-xs text-muted-foreground">Valor</Label>
                                            <PriceInput
                                                disabled={ paymentStatus === "Pago" || selectedTraining?.TrainingPayment.paymentMode === "Parcelado" }
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
                                                disabled={ selectedTraining.TrainingPayment.paymentStatus === "Pago" || selectedTraining?.TrainingPayment.paymentMode === "Parcelado"  }
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
                                                    disabled={ selectedTraining.TrainingPayment.paymentStatus === "Pago" || selectedTraining?.TrainingPayment.paymentMode === "Parcelado"  }
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
                                                <BookingPaymentStatusBadge status={ selectedTraining.TrainingPayment.secondPaymentStatus } />
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
                                                        disabled={ selectedTraining.TrainingPayment.paymentStatus === "Pendente" || selectedTraining.TrainingPayment.secondPaymentStatus === "Pago" }
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
                                                        <SelectTrigger disabled={ selectedTraining.TrainingPayment.paymentStatus === "Pendente" || selectedTraining.TrainingPayment.secondPaymentStatus === "Pago" } className={ errors.paymentInfo?.secondPaymentMethod ? "border-red-500" : "" }>
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
                    <Button variant="outline" onClick={ () => setIsTrainingPaymentMethodDialogOpen(false) }>
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