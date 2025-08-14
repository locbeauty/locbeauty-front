"use client";

import { Dispatch, SetStateAction } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { paymentModes, paymentStatuses } from "@/utils/@types/bookings";
import { CreateBookingFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import { Label } from "@/components/ui/label";
import { PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Controller, useFormContext } from "react-hook-form";
import PriceInput from "@/components/shared/PriceInput";
import { parseStringToCents } from "@/utils/parseStringToCents";

interface QuickBookingPaymentModePopoverProps {
  setQuickBookingPaymentModeDialogOpen: Dispatch<SetStateAction<boolean>>;
  handleAddToCart: (formData: CreateBookingFormSchemaType) => void
  setShouldCheckout: Dispatch<SetStateAction<boolean>>;
}

export function QuickBookingPaymentModePopover({
    handleAddToCart,
    setQuickBookingPaymentModeDialogOpen,
    setShouldCheckout
}: QuickBookingPaymentModePopoverProps) {
    const { handleSubmit, setValue, reset, control, register, watch, formState: { errors, isSubmitting } } = useFormContext<CreateBookingFormSchemaType>();

    const watchedPaymentStatus = watch("paymentStatus");

    const handleQuickBooking = (formData: CreateBookingFormSchemaType) => {
        const formDataWithCents = {
            ...formData,
            partialPayment:
            formData.partialPayment && formData.partialPayment.trim() !== ""
                ? parseStringToCents(formData.partialPayment)
                : undefined,
        };

        handleAddToCart(formDataWithCents as CreateBookingFormSchemaType);
        setQuickBookingPaymentModeDialogOpen(false);
        setShouldCheckout(true);
        reset();
    };

    function getPaymentIcon(mode: string) {
        switch (mode) {
        case "PIX":
            return (
                <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">
            P
                </div>
            );
        case "Crédito":
        case "Débito":
            return <CreditCard className="h-4 w-4" />;
        case "Dinheiro":
            return (
                <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">$</div>
            );
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
        <PopoverContent className="w-96 p-0" align="end">
            <Card className="border-0 shadow-none">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Finalizar Reserva</CardTitle>
                            <CardDescription className="text-sm">Configure o pagamento e status da reserva</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <form onSubmit={ handleSubmit(handleQuickBooking) }>
                    <CardContent className="space-y-6">
                        {/* Status de Pagamento */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="payment-status" className="text-sm font-medium">
                  Status do Pagamento
                                </Label>
                            </div>
                            <Controller
                                name="paymentStatus"
                                control={ control }
                                render={ ({ field }) => (
                                    <Select onValueChange={ field.onChange } value={ field.value }>
                                        <SelectTrigger
                                            id="payment-status"
                                            className={ `w-full h-11 data-[placeholder]:text-muted-foreground ${
                                                errors.paymentStatus ? "border-red-500 focus:border-red-500" : ""
                                            }` }
                                        >
                                            <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentStatuses.map((status) => (
                                                <SelectItem key={ status } value={ status } className="cursor-pointer">
                                                    <div className="flex items-center gap-2">
                                                        <div className={ `w-2 h-2 rounded-full ${getStatusColor(status)}` } />
                                                        {status}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) }
                            />
                            {errors.paymentStatus && (
                                <div className="flex items-center gap-1 text-red-500 text-sm">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.paymentStatus.message}
                                </div>
                            )}
                        </div>

                        {/* Campo de Valor Parcial - aparece apenas quando status é "Parcial" */}
                        {watchedPaymentStatus === "Parcial" && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    R$
                                    </div>
                                    <Label htmlFor="partial-amount" className="text-sm font-medium">
                    Valor Pago
                                    </Label>
                                </div>
                                <PriceInput register={ register("partialPayment") } setValue={ setValue } name="partialPayment" />
                                {errors.partialPayment && (
                                    <div className="flex items-center gap-1 text-red-500 text-xs">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.partialPayment.message}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Forma de Pagamento */}
                        {watchedPaymentStatus !== "Pendente" && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    <Label htmlFor="payment-mode" className="text-sm font-medium">
                  Forma de Pagamento
                                    </Label>
                                </div>
                                <Controller
                                    name="paymentMode"
                                    control={ control }
                                    render={ ({ field }) => (
                                        <Select onValueChange={ field.onChange } value={ field.value }>
                                            <SelectTrigger
                                                id="payment-mode"
                                                className={ `w-full h-11 data-[placeholder]:text-muted-foreground ${
                                                    errors.paymentMode ? "border-red-500 focus:border-red-500" : ""
                                                }` }
                                            >
                                                <SelectValue placeholder="Selecione a forma de pagamento" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {paymentModes.map((mode) => {
                                                    if(!mode) return;
                                                    return (
                                                        <SelectItem key={ mode } value={ mode } className="cursor-pointer">
                                                            <div className="flex items-center gap-2">
                                                                {getPaymentIcon(mode)}
                                                                {mode}
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    ) }
                                />
                                {errors.paymentMode && (
                                    <div className="flex items-center gap-1 text-red-500 text-xs">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.paymentMode.message}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Botões de Ação */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={ () => setQuickBookingPaymentModeDialogOpen(false) }
                                className="flex-1"
                                disabled={ isSubmitting }
                            >
                Cancelar
                            </Button>
                            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={ isSubmitting }>
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Reserva
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </PopoverContent>
    );
}