"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
import { centsToString } from "@/utils/centsToString";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { checkoutStatuses, PaymentMethods, paymentStatuses } from "@/utils/constants";
import { BookingPaymentStatusBadge } from "../../common/BookingPaymentStatusBadge";

// --- Helpers (copiados) ---

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

// --- Interface ---

interface CheckoutPaymentMethodDialogProps {
    selectedCheckout: Checkout | null;
    isCheckoutPaymentMethodDialogOpen: boolean;
    setIsCheckoutPaymentMethodDialogOpen: Dispatch<SetStateAction<boolean>>;
}

export function CheckoutPaymentMethodDialog({
    selectedCheckout,
    isCheckoutPaymentMethodDialogOpen,
    setIsCheckoutPaymentMethodDialogOpen
}: CheckoutPaymentMethodDialogProps) {

    // --- Estados ---
    const [ checkoutStatus, setCheckoutStatus ] = useState<"Pendente" | "Concluido" | "Cancelado">("Pendente");
    const [ paymentStatus, setPaymentStatus ] = useState<"Pendente" | "Pago" | "Parcial">("Pendente");
    const [ paymentMode, setPaymentMode ] = useState<"AVista" | "Parcelado">("AVista");

    // 1ª Parcela
    const [ firstPaymentAmount, setFirstPaymentAmount ] = useState("0,00");
    const [ firstPaymentDate, setFirstPaymentDate ] = useState("");
    const [ firstPaymentMethod, setFirstPaymentMethod ] = useState<string | undefined>(undefined);
    const [ firstPaymentStatus, setFirstPaymentStatus ] = useState<"Pendente" | "Pago" | undefined>("Pendente");

    // 2ª Parcela
    const [ secondPaymentAmount, setSecondPaymentAmount ] = useState("0,00");
    const [ secondPaymentDate, setSecondPaymentDate ] = useState("");
    const [ secondPaymentMethod, setSecondPaymentMethod ] = useState<string | undefined>(undefined);
    const [ secondPaymentStatus, setSecondPaymentStatus ] = useState<"Pendente" | "Pago" | undefined>(undefined);

    const [ errors, setErrors ] = useState<any>({});
    const [ isSubmitting, setIsSubmitting ] = useState(false);

    // --- Lógica de Inicialização ---
    useEffect(() => {
        if (selectedCheckout) {
            console.log("selectedCheckout: ", selectedCheckout);
            const payment = selectedCheckout.CheckoutPayment;

            setCheckoutStatus(selectedCheckout.checkoutStatus as any);
            setPaymentStatus(payment.paymentStatus as any);
            setPaymentMode(payment.paymentMode as any);

            setFirstPaymentAmount(selectedCheckout.CheckoutPayment.paymentStatus !== "Parcial" ? centsToString(selectedCheckout.totalPrice) : "0");
            setFirstPaymentDate(formatDateForInput(payment.firstPaymentDate));
            setFirstPaymentMethod(payment.firstPaymentMethod as any);
            setFirstPaymentStatus(payment.firstPaymentStatus as any);

            setSecondPaymentAmount(centsToString(payment.secondPaymentAmount));
            setSecondPaymentDate(formatDateForInput(payment.secondPaymentDate));
            setSecondPaymentMethod(payment.secondPaymentMethod as any);
            setSecondPaymentStatus(payment.secondPaymentStatus ? payment.secondPaymentStatus as any : undefined);

            setErrors({});
        }
    }, [ selectedCheckout ]);

    // --- Validação e Salvamento ---

    function validateForm(): boolean {
        const newErrors: any = { paymentInfo: {} };
        let isValid = true;

        if (firstPaymentStatus === "Pago") {
            if (parseStringToCents(firstPaymentAmount) === 0) {
                newErrors.paymentInfo.firstPaymentAmount = "O valor da 1ª parcela é obrigatório.";
                isValid = false;
            }
            if (!firstPaymentDate) {
                newErrors.paymentInfo.firstPaymentDate = "A data da 1ª parcela é obrigatória.";
                isValid = false;
            }
            if (!firstPaymentMethod) {
                newErrors.paymentInfo.firstPaymentMethod = "A forma da 1ª parcela é obrigatória.";
                isValid = false;
            }
        }

        if (paymentMode === "Parcelado" && secondPaymentStatus === "Pago") {
            if (parseStringToCents(secondPaymentAmount) === 0) {
                newErrors.paymentInfo.secondPaymentAmount = "O valor da 2ª parcela é obrigatório.";
                isValid = false;
            }
            if (!secondPaymentDate) {
                newErrors.paymentInfo.secondPaymentDate = "A data da 2ª parcela é obrigatória.";
                isValid = false;
            }
            if (!secondPaymentMethod) {
                newErrors.paymentInfo.secondPaymentMethod = "A forma da 2ª parcela é obrigatória.";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    }

    async function handleSave() {
        if (!selectedCheckout) {
            return;
        }

        setIsSubmitting(true);

        const payload = {
            checkoutStatus,
            paymentStatus,
            paymentMode,
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
        console.log("payload: ", payload);

        try {
            const response = await UpdateCheckout({
                checkoutId: selectedCheckout.checkoutId,
                body: payload as any
            });

            if (response.statusCode !== 200) {
                toast.warning(response.message || "Erro ao atualizar pagamento.");
            } else {
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
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                Status do Pagamento
                            </Label>
                            <Select
                                onValueChange={ (value: "Pendente" | "Pago" | "Parcial") => setPaymentStatus(value) }
                                value={ paymentStatus }
                            >
                                <SelectTrigger className={ errors.paymentStatus ? "border-red-500" : "" }>
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

                        {/* <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                Status da Reserva
                            </Label>
                            <Select
                                onValueChange={ (value: any) => setCheckoutStatus(value) }
                                value={ checkoutStatus }
                            >
                                <SelectTrigger className={ errors.checkoutStatus ? "border-red-500" : "" }>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {checkoutStatuses.map((status) => (
                                        <SelectItem key={ status } value={ status }>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.checkoutStatus && <p className="text-xs text-red-500">{errors.checkoutStatus}</p>}
                        </div> */}
                    </div>

                    {/* <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            Modo de Pagamento
                        </Label>
                        <Select
                            onValueChange={ (value: any) => setPaymentMode(value) }
                            value={ paymentMode }
                        >
                            <SelectTrigger className={ errors.paymentMode ? "border-red-500" : "" }>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AVista">À Vista</SelectItem>
                                <SelectItem value="Parcelado">Parcelado</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.paymentMode && <p className="text-xs text-red-500">{errors.paymentMode}</p>}
                    </div> */}

                    <div className={ "bg-muted/30 p-4 rounded-lg border space-y-6" }>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold flex items-center gap-2 text-primary">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">1</div>
                                    Primeira Parcela / Entrada
                                </Label>
                                <BookingPaymentStatusBadge status={ selectedCheckout.CheckoutPayment.firstPaymentStatus } />

                                {/* <Select
                                    onValueChange={ (value: any) => setFirstPaymentStatus(value) }
                                    value={ firstPaymentStatus || "Pendente" }
                                >
                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pago">Pago</SelectItem>
                                        <SelectItem value="Pendente">Pendente</SelectItem>
                                    </SelectContent>
                                </Select> */}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                <div className="sm:col-span-4">
                                    <Label className="text-xs text-muted-foreground">Valor</Label>
                                    <PriceInput
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
                                        <SelectTrigger className={ errors.paymentInfo?.firstPaymentMethod ? "border-red-500" : "" }>
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
                                        {/* <Select
                                            onValueChange={ (value: any) => setSecondPaymentStatus(value) }
                                            value={ secondPaymentStatus || "Pendente" }
                                        >
                                            <SelectTrigger className="w-[120px] h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pago">Pago</SelectItem>
                                                <SelectItem value="Pendente">Pendente</SelectItem>
                                            </SelectContent>
                                        </Select> */}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                        <div className="sm:col-span-4">
                                            <Label className="text-xs text-muted-foreground">Valor Restante</Label>
                                            <PriceInput
                                                withLabel={ false }
                                                value={ secondPaymentAmount || "0,00" }
                                                onChange={ (value) => setSecondPaymentAmount(value) }
                                                // 2ª parcela pode ser editável se necessário, ou desabilitada
                                                // disabled={true}
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
                    <Button onClick={ handleSave } disabled={ isSubmitting }>
                        {isSubmitting ? "Salvando..." : "Salvar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}