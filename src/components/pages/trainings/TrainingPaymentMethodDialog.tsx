"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Banknote, CalendarIcon, CheckCircle, Coins, CreditCard, User, GraduationCap } from "lucide-react";
import PriceInput from "@/components/shared/PriceInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { queryClient } from "@/app/(main)/layout";
import { centsToString, centsToStringWithCurrencyMark } from "@/utils/centsToString";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { PaymentMethods, paymentStatuses } from "@/utils/constants";
import { validateCheckoutForm } from "@/utils/validators/update-payment-info";
import { BookingPaymentStatusBadge } from "../bookings/common/BookingPaymentStatusBadge";
import { UpdateTraining } from "@/services/trainings.service";
import { Trainee } from "@/utils/@types/trainee";
import { Address } from "@/utils/@types/address";

// --- TIPOS ---

type PaymentStatuses = "Pendente" | "Pago" | "Parcial";
type PaymentModes = "AVista" | "Parcelado";
export type PayerType = "TRAINEE" | "VOLUNTEER";
type InstallmentStatus = "Pendente" | "Pago";

// Interface do item de pagamento individual (CONTÉM O PRICE AGORA)
export interface CheckoutPayment {
    paymentStatus: PaymentStatuses;
    paymentMode: PaymentModes;
    payerType: PayerType;
    price: number; // <--- PRICE AQUI
    firstPaymentDate: string | null;
    firstPaymentAmount: number;
    firstPaymentMethod: string | null;
    firstPaymentStatus: InstallmentStatus;
    secondPaymentDate: string | null;
    secondPaymentAmount: number;
    secondPaymentMethod: string | null;
    secondPaymentStatus: InstallmentStatus;
}

// Interface do Treinamento completa (SEM PRICE NA RAIZ)
export interface Training {
    trainingId: string;
    hourInMinutes: number;
    trainingStatus: string;
    additionalCost: number;
    additionalCostDescription: string;
    TrainingPayment: CheckoutPayment[];
    Gear: {
        gearId: string;
        gearName: string
    };
    Volunteer: {
        volunteerId: string;
        name: string;
        documentNumber: string;
    };
    Trainee: Trainee;
    dueDate: Date;
    Address: Address;
    createdAt: string;
    updatedAt: string;
}

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

export type UpdateTrainingPayload = {
    trainingStatus: string;
    payerType: PayerType;
    TrainingPayment: {
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

// --- HELPER FUNCTIONS ---

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
    payerType: PayerType;
}

export function TrainingPaymentMethodDialog({
    selectedTraining,
    isTrainingPaymentMethodDialogOpen,
    setIsTrainingPaymentMethodDialogOpen,
    payerType
}: TrainingPaymentMethodDialogProps) {

    const [ trainingStatus, setTrainingStatus ] = useState<string>("Pendente");
    const [ paymentStatus, setPaymentStatus ] = useState<PaymentStatuses>("Pendente");
    const [ paymentMode, setPaymentMode ] = useState<PaymentModes>("AVista");

    const [ firstPaymentAmount, setFirstPaymentAmount ] = useState("0,00");
    const [ firstPaymentDate, setFirstPaymentDate ] = useState("");
    const [ firstPaymentMethod, setFirstPaymentMethod ] = useState<string | null>(null);
    const [ firstPaymentStatus, setFirstPaymentStatus ] = useState<InstallmentStatus>("Pendente");

    const [ secondPaymentAmount, setSecondPaymentAmount ] = useState("0,00");
    const [ secondPaymentDate, setSecondPaymentDate ] = useState("");
    const [ secondPaymentMethod, setSecondPaymentMethod ] = useState<string | null>(null);
    const [ secondPaymentStatus, setSecondPaymentStatus ] = useState<InstallmentStatus>("Pendente");

    const [ errors, setErrors ] = useState<LocalErrorsType>(initialErrors);
    const [ isSubmitting, setIsSubmitting ] = useState(false);

    // 1. Encontrar o pagamento específico para o payerType atual
    const currentPaymentData = useMemo(() => {
        if (!selectedTraining || !payerType) return null;

        const paymentsList = selectedTraining.TrainingPayment;

        if (Array.isArray(paymentsList)) {
            // Retorna o objeto completo, que agora inclui o 'price'
            return paymentsList.find((p) => p.payerType === payerType);
        }

        return null;
    }, [ selectedTraining, payerType ]);

    // Lógica de desabilitação
    const areDetailsDisabled = useMemo(() => {
        const isSavedAsPaid = currentPaymentData?.paymentStatus === "Pago";
        const isLocallyPaid = paymentStatus === "Pago";

        return isSavedAsPaid && isLocallyPaid;
    }, [ currentPaymentData, paymentStatus ]);

    // 2. Detectar mudanças
    const hasChanged = useMemo(() => {
        if (!selectedTraining || !payerType) return false;
        if (!currentPaymentData) return true;

        const payment = currentPaymentData;

        const isSame =
            trainingStatus === selectedTraining.trainingStatus &&
            paymentStatus === payment.paymentStatus &&
            paymentMode === payment.paymentMode &&
            firstPaymentAmount === centsToString(payment.firstPaymentAmount || 0) &&
            firstPaymentDate === formatDateForInput(payment.firstPaymentDate) &&
            firstPaymentMethod === payment.firstPaymentMethod &&
            firstPaymentStatus === (payment.firstPaymentStatus || "Pendente") &&

            secondPaymentAmount === centsToString(payment.secondPaymentAmount || 0) &&
            secondPaymentDate === formatDateForInput(payment.secondPaymentDate) &&
            secondPaymentMethod === payment.secondPaymentMethod &&
            secondPaymentStatus === (payment.secondPaymentStatus || "Pendente");

        return !isSame;

    }, [
        selectedTraining, payerType, currentPaymentData,
        trainingStatus, paymentStatus, paymentMode,
        firstPaymentAmount, firstPaymentDate, firstPaymentMethod, firstPaymentStatus,
        secondPaymentAmount, secondPaymentDate, secondPaymentMethod, secondPaymentStatus
    ]);

    // 3. Preencher formulário ao abrir
    useEffect(() => {
        if (selectedTraining && isTrainingPaymentMethodDialogOpen && payerType) {
            setTrainingStatus(selectedTraining.trainingStatus);

            if (currentPaymentData) {
                // MODO EDIÇÃO
                const payment = currentPaymentData;
                setPaymentStatus(payment.paymentStatus);
                setPaymentMode(payment.paymentMode);

                setFirstPaymentAmount(centsToString(payment.firstPaymentAmount || 0));
                setFirstPaymentDate(formatDateForInput(payment.firstPaymentDate));
                setFirstPaymentMethod(payment.firstPaymentMethod);
                setFirstPaymentStatus(payment.firstPaymentStatus || "Pendente");

                setSecondPaymentAmount(centsToString(payment.secondPaymentAmount || 0));
                setSecondPaymentDate(formatDateForInput(payment.secondPaymentDate));
                setSecondPaymentMethod(payment.secondPaymentMethod);
                setSecondPaymentStatus(payment.secondPaymentStatus || "Pendente");
            } else {
                // MODO CRIAÇÃO (Caso raro se o array vier populado do backend)
                setPaymentStatus("Pendente");
                setPaymentMode("AVista");

                // Tenta pegar o preço do pagamento atual se existir, senão 0
                const suggestedAmount = currentPaymentData?.price || 0;

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
    }, [ selectedTraining, isTrainingPaymentMethodDialogOpen, payerType, currentPaymentData ]);

    // 4. Lógica Automática quando muda para "Pago" (CORRIGIDA)
    useEffect(() => {
        if (paymentStatus === "Pago") {
            setFirstPaymentStatus("Pago");

            // Se o campo estiver zerado e tivermos os dados do pagamento atual
            if (firstPaymentAmount === "0,00" && currentPaymentData) {
                // Pegamos o preço diretamente do objeto de pagamento correspondente
                const amountToFill = currentPaymentData.price;
                setFirstPaymentAmount(centsToString(amountToFill || 0));
            }

            if (!firstPaymentDate) {
                setFirstPaymentDate(new Date().toISOString().split("T")[0]);
            }
        }
    }, [ paymentStatus, currentPaymentData, firstPaymentAmount, firstPaymentDate ]);

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
            selectedTraining: selectedTraining as any,
            initialErrors,
            setErrors,
        });

        if (!selectedTraining || !isValid || !payerType) {
            return;
        }

        setIsSubmitting(true);

        const finalFirstPaymentStatus = paymentStatus === "Pago" ? "Pago" : firstPaymentStatus;

        const payload: UpdateTrainingPayload = {
            trainingStatus: trainingStatus,
            payerType: payerType,
            TrainingPayment: {
                paymentStatus,
                paymentMode,
                firstPaymentAmount: parseStringToCents(firstPaymentAmount),
                firstPaymentDate: firstPaymentDate ? new Date(firstPaymentDate) : null,
                firstPaymentMethod,
                firstPaymentStatus: finalFirstPaymentStatus,
                secondPaymentAmount: parseStringToCents(secondPaymentAmount),
                secondPaymentDate: secondPaymentDate ? new Date(secondPaymentDate) : null,
                secondPaymentMethod,
                secondPaymentStatus,
            }
        };

        try {
            const response = await UpdateTraining({
                trainingId: selectedTraining.trainingId,
                body: payload
            });

            if (response.statusCode !== 200) {
                toast.warning(response.message || "Erro ao atualizar pagamento.");
            } else {
                queryClient.invalidateQueries({ queryKey: [ "get-all-trainings" ] });
                toast.success(`Pagamento do ${payerType === "TRAINEE" ? "Aluno" : "Modelo"} atualizado!`);
                setIsTrainingPaymentMethodDialogOpen(false);
            }
        } catch (error) {
            toast.error("Ocorreu um erro inesperado.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!selectedTraining || !payerType) return null;

    const isTrainee = payerType === "TRAINEE";
    const personName = isTrainee ? selectedTraining.Trainee.name : selectedTraining.Volunteer.name;
    const dialogTitle = isTrainee ? "Pagamento do Aluno" : "Pagamento do Paciente Modelo";
    const Icon = isTrainee ? GraduationCap : User;
    const headerColorClass = isTrainee ? "text-orange-600 bg-orange-50" : "text-blue-600 bg-blue-50";

    // Pega o preço para exibir no label (agora vindo de currentPaymentData)
    const displayPrice = currentPaymentData?.price || 0;

    return (
        <Dialog open={ isTrainingPaymentMethodDialogOpen } onOpenChange={ setIsTrainingPaymentMethodDialogOpen }>
            <DialogContent className="max-h-[90vh] w-[90vw] md:w-[700px] overflow-scroll dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        {dialogTitle}
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="flex flex-col gap-1 pt-2">
                            <span>Gerencie as informações financeiras para:</span>
                            <div className={ `flex items-center gap-2 p-2 rounded-md w-fit border ${headerColorClass}` }>
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
                                    Status do Pagamento
                                </Label>
                                <Select
                                    onValueChange={ (value: PaymentStatuses) => setPaymentStatus(value) }
                                    value={ paymentStatus }
                                >
                                    <SelectTrigger
                                        className={ errors.paymentStatus ? "border-red-500" : "" }
                                    >
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

                        {paymentStatus !== "Pendente" && (
                            <div>
                                {/* Label atualizado para usar displayPrice derivado do item correto */}
                                <Label>Valor total do curso: <span className="font-bold">{centsToStringWithCurrencyMark(displayPrice)}</span></Label>
                                <p className="text-xs text-muted-foreground mt-1">Este valor é a base para o {isTrainee ? "aluno" : "voluntário"}.</p>
                            </div>
                        )}
                    </div>

                    {paymentStatus !== "Pendente" && (
                        <div className="bg-muted/30 p-4 rounded-lg border space-y-6">

                            {/* --- PRIMEIRA PARCELA / ENTRADA --- */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-bold flex items-center gap-2 text-primary">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">1</div>
                                        Primeira Parcela / Entrada
                                    </Label>
                                    <BookingPaymentStatusBadge status={ paymentStatus === "Pago" ? "Pago" : (firstPaymentStatus || "Pendente") } />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                    <div className="sm:col-span-4">
                                        <Label className="text-xs text-muted-foreground">Valor</Label>
                                        <PriceInput
                                            disabled={ areDetailsDisabled || paymentMode === "Parcelado" }
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
                                            type="date"
                                            disabled={ areDetailsDisabled }
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
                                                disabled={ areDetailsDisabled }
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

                            {/* --- SEGUNDA PARCELA (CONDICIONAL) --- */}
                            {(paymentMode === "Parcelado" || paymentStatus === "Parcial") && paymentStatus !== "Pago" && (
                                <>
                                    <div className="h-px bg-border border-dashed" />
                                    <div className="space-y-3 opacity-90">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-bold flex items-center gap-2 text-orange-600">
                                                <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-xs">2</div>
                                                Segunda Parcela / Restante
                                            </Label>
                                            <BookingPaymentStatusBadge status={ secondPaymentStatus || "Pendente" } />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                            <div className="sm:col-span-4">
                                                <Label className="text-xs text-muted-foreground">Valor Restante</Label>
                                                <PriceInput
                                                    disabled={ false }
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
                                                    <SelectTrigger className={ errors.paymentInfo?.secondPaymentMethod ? "border-red-500" : "" }>
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
                    )}

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