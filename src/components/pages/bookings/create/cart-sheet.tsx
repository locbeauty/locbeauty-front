"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { paymentModes, paymentStatuses } from "@/utils/@types/bookings";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Trash2, Calendar, Clock, Package, User, Scroll, AlertCircle, CreditCard, CheckCircle, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/cart-provider";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { Label } from "@/components/ui/label";
import PriceInput from "@/components/shared/PriceInput";
import { parseStringToCents } from "@/utils/parseStringToCents";

export function CartSheet() {
    const {
        items,
        removeItem,
        clearCart,
        getTotalPrice,
        getTotalItems,
        handleCheckout,
        changePaymentMode,
        changePaymentStatus,
        paymentMode,
        paymentStatus,
        changePartialPaymentValue,
        partialPaymentValue
    } = useCart();
    const [ isOpen, setIsOpen ] = useState(false);
    const [ errorMessage, setErrorMessage ] = useState("");

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

    useEffect(() => {
        console.log("partialPaymentValue: ", partialPaymentValue);
    }, [ partialPaymentValue ]);

    useEffect(() => {
        if(paymentStatus === "Parcial") {
            if(parseStringToCents(partialPaymentValue) >= getTotalPrice()) {
                setErrorMessage("Valor maior que o preço total. Escolha a opção \"Pago\".");
            } else if(parseStringToCents(partialPaymentValue) === 0) {
                setErrorMessage("Valor é obrigatório.");
            } else {
                setErrorMessage("");
            }
        }
    }, [ paymentMode, paymentStatus, getTotalPrice, partialPaymentValue ]);

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

    return (
        <Sheet open={ isOpen } onOpenChange={ setIsOpen }>
            <SheetTrigger asChild>
                <Button variant="outline" className="relative bg-transparent">
                    <ShoppingCart className="h-4 w-4" />
                    {getTotalItems() > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {getTotalItems()}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent aria-describedby={ undefined } className="flex flex-col h-full md:w-[400px] w-[540px]">
                <SheetHeader className="flex-shrink-0">
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
          Carrinho de Reservas
                    </SheetTitle>
                </SheetHeader>

                <div id="espaco-restante" className="flex flex-col flex-1 min-h-0">
                    {items.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center">
                            <div className="text-center text-muted-foreground">
                                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Seu carrinho está vazio</p>
                                <p className="text-sm">Adicione reservas para continuar</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="flex-1 px-1 overflow-y-scroll">
                                <div className="space-y-4 flex flex-col items-center w-full py-2">
                                    {items.map((item) => (
                                        <Card key={ item.gear.gearId } className="relative w-[90%]">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-primary" />
                                                        {item.gear.gearName}
                                                    </CardTitle>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={ () => removeItem(item.gear.gearId) }
                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="md:space-y-3 space-y-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-muted-foreground">Cliente:</span>
                                                    <span className="font-medium">{item.customer.fullname}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Scroll className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-muted-foreground">Documento:</span>
                                                    <span className="font-medium">{item.customer.documentNumber}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-muted-foreground">Data:</span>
                                                    <span className="font-medium">{item.date.toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-muted-foreground">Horário:</span>
                                                    <span className="font-medium">
                                                        {minutesToHHMM(item.startHourInMinutes)} -{" "}
                                                        {minutesToHHMM(item.startHourInMinutes + item.totalDurationInMinutes)}
                                                    </span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {item.totalDurationInMinutes / 60}h
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Package className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-muted-foreground">Quantidade:</span>
                                                    <Badge variant="outline">{item.gearAmount}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <Badge variant={ item.bookingStatus === "Pendente" ? "default" : "secondary" } className="w-fit">
                                                        {item.bookingStatus}
                                                    </Badge>
                                                    <div className="flex items-center">
                                                        <span className="font-semibold text-primary">
                                                            {
                                                                new Intl.NumberFormat("pt-BR", {
                                                                    style: "currency",
                                                                    currency: "BRL"
                                                                }).format(item.price/100)
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                {item.observations && (
                                                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                                        <strong>Observações:</strong> {item.observations}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>

                            <div id="footer" className="flex-shrink-0 border-t p-4 space-y-4 bg-background">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total de itens:</span>
                                    <Badge variant="secondary">{getTotalItems()}</Badge>
                                </div>
                                <Separator />

                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                                <Label htmlFor="payment-status" className="text-sm font-medium">
          Status do Pagamento
                                                </Label>
                                            </div>
                                            <Select onValueChange={ changePaymentStatus } value={ paymentStatus }>
                                                <SelectTrigger className="w-full" id="payment-status">
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
                                        </div>

                                        <div className="flex flex-col flex-1">
                                            {paymentStatus !== "Pendente" && (
                                                <>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                        <Label htmlFor="payment-mode" className="text-sm font-medium">
              Forma de Pagamento
                                                        </Label>
                                                    </div>
                                                    <Select onValueChange={ changePaymentMode } value={ paymentMode }>
                                                        <SelectTrigger className="w-full data-[placeholder]:text-placeholder" id="payment-mode">
                                                            <SelectValue placeholder="Clique para escolher" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {paymentModes.map((mode) => (
                                                                <SelectItem key={ mode } value={ mode as "PIX" | "Crédito" | "Débito" | "Dinheiro" | "Parcial" } className="cursor-pointer">
                                                                    <div className="flex items-center gap-2">
                                                                        {getPaymentIcon(mode)}
                                                                        {mode}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {paymentStatus === "Parcial" && (
                                        <div className="flex flex-col justify-center items-center">
                                            <div className="w-full md:w-2/3">
                                                <div className="flex gap-1 items-center justify-center">
                                                    <DollarSign className="h-4 w-4" />
                                                    <Label htmlFor="partial-payment" className="text-sm font-medium">
                                                        Valor
                                                    </Label>
                                                </div>
                                                <PriceInput
                                                    targetState={ partialPaymentValue }
                                                    setTargetState={ changePartialPaymentValue }
                                                    isUncontrolled={ true }
                                                    withLabel={ false }
                                                />
                                            </div>
                                            {errorMessage !== "" && (
                                                <div className="flex items-center gap-1 w-fit text-red-500 text-xs text-center">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errorMessage}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">Total:</span>
                                    <span className="text-xl font-bold text-primary">
                  R$ {(getTotalPrice() / 100).toFixed(2).replace(".", ",")}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={ clearCart } className="flex-1 bg-transparent">
                  Limpar Carrinho
                                    </Button>
                                    <Button
                                        disabled={
                                            (paymentStatus === "Parcial" && parseStringToCents(partialPaymentValue) === 0) ||
                                            (paymentStatus !== "Pendente" && !paymentMode)
                                        }
                                        onClick={ () => handleCheckout() }
                                        className="flex-1">
                  Finalizar Reservas
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
