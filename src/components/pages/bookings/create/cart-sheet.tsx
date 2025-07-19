"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Trash2, Calendar, Clock, Package, User, DollarSign, Scroll } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/cart-provider";
import { minutesToHHMM } from "@/utils/minutesToHHMM";

export function CartSheet() {
    const { items, removeItem, clearCart, getTotalPrice, getTotalItems } = useCart();
    const [ isOpen, setIsOpen ] = useState(false);

    const handleCheckout = () => {
    // Implementar lógica de checkout aqui
        console.log("Processando checkout...", items);
    // clearCart()
    // setIsOpen(false)
    };

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

            <SheetContent className="md:w-[400px] w-[540px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
            Carrinho de Reservas
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-full mt-6 w-full">
                    {items.length === 0 ? (
                        <div className="flex h-[80%] items-center justify-center">
                            <div className="text-center text-muted-foreground">
                                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Seu carrinho está vazio</p>
                                <p className="text-sm">Adicione reservas para continuar</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="flex-1 max-h-[70%]">
                                <div className="space-y-4 flex flex-col items-center w-full">
                                    {items.map((item) => (
                                        <Card key={ item.gear.gearId } className="relative w-[90%]">
                                            <CardHeader className="pb-3">
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

                                            <CardContent className="space-y-3">
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
                                                        {minutesToHHMM(item.startHourInMinutes)} - {minutesToHHMM(item.startHourInMinutes + item.totalDuration)}
                                                    </span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {item.totalDuration/60}h
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Package className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Quantidade:</span>
                                                        <Badge variant="outline">{item.gearAmount}</Badge>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                                                        <span className="font-semibold text-primary">
                                                            {item.price}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Badge variant={ item.paymentStatus === "Pago" ? "default" : "secondary" } className="w-fit">
                                                    {item.paymentStatus}
                                                </Badge>

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

                            <div className="border-t p-4 mt-4 space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Total de itens:</span>
                                    <Badge variant="secondary">{getTotalItems()}</Badge>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">Total:</span>
                                    <span className="text-xl font-bold text-primary">R${getTotalPrice()/100}</span>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={ clearCart } className="flex-1 bg-transparent">
                    Limpar Carrinho
                                    </Button>
                                    <Button onClick={ handleCheckout } className="flex-1">
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
