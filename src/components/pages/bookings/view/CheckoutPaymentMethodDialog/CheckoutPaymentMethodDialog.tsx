// "use client";

// import { Dispatch, SetStateAction, useEffect, useState } from "react";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { AlertCircle, Banknote, CheckCircle, CreditCard } from "lucide-react";
// import PriceInput from "@/components/shared/PriceInput";
// import { Button } from "@/components/ui/button";
// import { Checkout } from "@/utils/@types/checkouts";

// interface CheckoutPaymentMethodDialog {
//     selectedCheckout: Checkout;
//     isCheckoutPaymentMethodDialogOpen: boolean;
//     setIsCheckoutPaymentMethodDialogOpen: Dispatch<SetStateAction<boolean>>;
// }

// export function CheckoutPaymentMethodDialog({
//     selectedCheckout,
//     isCheckoutPaymentMethodDialogOpen,
//     setIsCheckoutPaymentMethodDialogOpen
// }: CheckoutPaymentMethodDialog) {
//     // Estados
//     const [ paymentStatus, setPaymentStatus ] = useState("");
//     const [ paymentMode, setPaymentMode ] = useState("");
//     const [ partialPayment, setPartialPayment ] = useState("");

//     // Estados para erros
//     const [ errors, setErrors ] = useState({
//         paymentStatus: "",
//         paymentMode: "",
//         checkoutStatus: "",
//         partialPayment: ""
//     });

//     useEffect(() => {
//         setPaymentStatus(selectedCheckout.paymentStatus);
//         setPaymentMode(selectedCheckout.paymentMode);
//         setPartialPayment(String(selectedCheckout.totalPrice - selectedCheckout.pendingValue));
//     }, [ selectedCheckout ]);

//     function getPaymentIcon(mode: string) {
//         switch (mode) {
//         case "PIX":
//             return (
//                 <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">
//                         P
//                 </div>
//             );
//         case "Transferência bancária":
//             return <Banknote className="h-4 w-4" />;
//         default:
//             return null;
//         }
//     }

//     function getStatusColor(status: string) {
//         switch (status) {
//         case "Pago":
//             return "bg-green-500";
//         case "Parcial":
//             return "bg-yellow-500";
//         case "Pendente":
//             return "bg-red-500";
//         default:
//             return "bg-gray-500";
//         }
//     }

//     // Handler para atualizar o valor parcial
//     const handlePartialPaymentChange = (value: string) => {
//         setPartialPayment(value);
//     };

//     return (
//         <Dialog
//             open={ isCheckoutPaymentMethodDialogOpen }
//             onOpenChange={ setIsCheckoutPaymentMethodDialogOpen }
//         >
//             <DialogContent className="max-h-[90vh] w-[90vw] md:w-[600px] overflow-scroll dark:bg-gray-900">
//                 <DialogHeader>
//                     <DialogTitle className="text-xl">Formas de pagamento</DialogTitle>
//                     <DialogDescription>
//                         Informações de pagamento
//                     </DialogDescription>
//                 </DialogHeader>

//                 <Card className="border-0 shadow-none">
//                     <CardHeader className="pb-4">
//                         {/* ... existing card header code ... */}
//                     </CardHeader>

//                     <CardContent className="space-y-6">
//                         {/* Status de Pagamento */}
//                         <div className="space-y-3">
//                             <div className="flex items-center gap-2">
//                                 <CheckCircle className="h-4 w-4 text-muted-foreground" />
//                                 <Label htmlFor="payment-status" className="text-sm font-medium">
//                                     Status do Pagamento
//                                 </Label>
//                             </div>
//                             <Select onValueChange={ setPaymentStatus } value={ paymentStatus }>
//                                 <SelectTrigger
//                                     id="payment-status"
//                                     className={ `w-full h-11 data-[placeholder]:text-muted-foreground ${
//                                         errors.paymentStatus ? "border-red-500 focus:border-red-500" : ""
//                                     }` }
//                                 >
//                                     <SelectValue placeholder="Selecione o status" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {[ "Pendente", "Parcial", "Pago" ].map((status) => (
//                                         <SelectItem key={ status } value={ status }>
//                                             <div className={ `w-2 h-2 rounded-full ${getStatusColor(status)}` } />
//                                             {status}
//                                         </SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                             {errors.paymentStatus && (
//                                 <div className="flex items-center gap-1 text-red-500 text-sm">
//                                     <AlertCircle className="h-3 w-3" />
//                                     {errors.paymentStatus}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Campo de Valor Parcial */}
//                         {paymentStatus === "Parcial" && (
//                             <div className="space-y-3">
//                                 <div className="flex items-center gap-2">
//                                     <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
//                                         R$
//                                     </div>
//                                     <Label htmlFor="partial-amount" className="text-sm font-medium">
//                                         Valor Pago
//                                     </Label>
//                                 </div>
//                                 <PriceInput
//                                     value={ partialPayment }
//                                     onChange={ (value) => setPartialPayment(value) }

//                                 />
//                                 {errors.partialPayment && (
//                                     <div className="flex items-center gap-1 text-red-500 text-xs">
//                                         <AlertCircle className="h-3 w-3" />
//                                         {errors.partialPayment}
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {/* Forma de Pagamento */}
//                         {paymentStatus !== "Pendente" && (
//                             <div className="space-y-3">
//                                 <div className="flex items-center gap-2">
//                                     <CreditCard className="h-4 w-4 text-muted-foreground" />
//                                     <Label htmlFor="payment-mode" className="text-sm font-medium">
//                                         Forma de Pagamento
//                                     </Label>
//                                 </div>
//                                 <Select onValueChange={ setPaymentMode } value={ paymentMode }>
//                                     <SelectTrigger
//                                         id="payment-mode"
//                                         className={ `w-full h-11 data-[placeholder]:text-muted-foreground ${
//                                             errors.paymentMode ? "border-red-500 focus:border-red-500" : ""
//                                         }` }
//                                     >
//                                         <SelectValue placeholder="Selecione a forma de pagamento" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         {[ "PIX", "Transferência bancária" ].map((mode) => (
//                                             <SelectItem key={ mode } value={ mode }>
//                                                 {mode}
//                                             </SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                         )}
//                     </CardContent>
//                     <div className="ml-auto flex gap-4">

//                         <Button variant={ "outline" }>Cancelar</Button>
//                         <Button>Salvar</Button>
//                     </div>
//                 </Card>
//             </DialogContent>
//         </Dialog>
//     );
// }

"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Banknote, CheckCircle, CreditCard, Calendar, PlusCircle, Trash2 } from "lucide-react";
import PriceInput from "@/components/shared/PriceInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkout } from "@/utils/@types/checkouts";

interface CheckoutPaymentMethodDialog {
    selectedCheckout: Checkout;
    isCheckoutPaymentMethodDialogOpen: boolean;
    setIsCheckoutPaymentMethodDialogOpen: Dispatch<SetStateAction<boolean>>;
}

type PartialPayment = {
    id: string;
    amount: string;
    date: string;
    mode: string;
};

export function CheckoutPaymentMethodDialog({
    selectedCheckout,
    isCheckoutPaymentMethodDialogOpen,
    setIsCheckoutPaymentMethodDialogOpen
}: CheckoutPaymentMethodDialog) {
    const [ paymentStatus, setPaymentStatus ] = useState("");
    const [ paymentMode, setPaymentMode ] = useState("");
    const [ partialPayment, setPartialPayment ] = useState("");
    const [ payments, setPayments ] = useState<PartialPayment[]>([]);
    const [ errors, setErrors ] = useState({
        paymentStatus: "",
        paymentMode: "",
        partialPayment: "",
    });

    useEffect(() => {
        setPaymentStatus(selectedCheckout.paymentStatus);
        setPaymentMode(selectedCheckout.paymentMode);
        setPartialPayment(String(selectedCheckout.totalPrice - selectedCheckout.pendingValue));
        if (selectedCheckout.paymentStatus === "Parcial") {
            setPayments([
                { id: crypto.randomUUID(), amount: "", date: "", mode: "" }
            ]);
        }
    }, [ selectedCheckout ]);

    function getStatusColor(status: string) {
        switch (status) {
        case "Pago": return "bg-green-500";
        case "Parcial": return "bg-yellow-500";
        case "Pendente": return "bg-red-500";
        default: return "bg-gray-500";
        }
    }

    function handleAddPayment() {
        if (payments.length >= 2) return;
        setPayments([ ...payments, { id: crypto.randomUUID(), amount: "", date: "", mode: "" } ]);
    }

    function handleRemovePayment(id: string) {
        setPayments(payments.filter((p) => p.id !== id));
    }

    function handlePaymentChange(id: string, field: keyof PartialPayment, value: string) {
        setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    }

    function handleSave() {
        const hasEmpty = payments.some((p) => !p.amount || !p.date || !p.mode);
        if (paymentStatus === "Parcial" && hasEmpty) {
            setErrors((e) => ({ ...e, partialPayment: "Preencha todos os campos das parcelas." }));
            return;
        }
        setErrors({ paymentStatus: "", paymentMode: "", partialPayment: "" });
        setIsCheckoutPaymentMethodDialogOpen(false);
    }

    return (
        <Dialog open={ isCheckoutPaymentMethodDialogOpen } onOpenChange={ setIsCheckoutPaymentMethodDialogOpen }>
            <DialogContent className="max-h-[90vh] w-[90vw] md:w-[700px] overflow-scroll dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="text-xl">Formas de pagamento</DialogTitle>
                    <DialogDescription>Informações de pagamento</DialogDescription>
                </DialogHeader>

                <Card className="border-0 shadow-none">
                    <CardContent className="space-y-6">
                        {/* Status do Pagamento */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                <Label htmlFor="payment-status" className="text-sm font-medium">
                                    Status do Pagamento
                                </Label>
                            </div>
                            <Select onValueChange={ setPaymentStatus } value={ paymentStatus }>
                                <SelectTrigger id="payment-status">
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[ "Pendente", "Parcial", "Pago" ].map((status) => (
                                        <SelectItem key={ status } value={ status }>
                                            <div className={ `w-2 h-2 rounded-full ${getStatusColor(status)}` } />
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Valor Parcial */}
                        {paymentStatus === "Parcial" && (
                            <>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">R$</div>
                                        <Label className="text-sm font-medium">Valor Pago</Label>
                                    </div>
                                    <PriceInput value={ partialPayment } onChange={ setPartialPayment } />
                                </div>

                                {/* Parcelas (Installments) */}
                                <Card className="border border-muted/30">
                                    <CardHeader className="pb-2 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            <Label className="text-sm font-medium">Parcelas de Pagamento</Label>
                                        </div>
                                        {payments.length < 2 && (
                                            <Button type="button" size="sm" variant="outline" onClick={ handleAddPayment }>
                                                <PlusCircle className="h-4 w-4 mr-1" />
                                                Adicionar parcela
                                            </Button>
                                        )}
                                    </CardHeader>

                                    <CardContent className="space-y-5">
                                        {payments.map((payment, index) => (
                                            <div key={ payment.id } className="p-4 border rounded-xl space-y-3 relative">
                                                {payments.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="absolute right-2 top-2 text-red-500 hover:text-red-600"
                                                        onClick={ () => handleRemovePayment(payment.id) }
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}

                                                <p className="text-sm font-semibold text-muted-foreground">
                                                    Parcela {index + 1}
                                                </p>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                                    <div>
                                                        <Label className="text-sm font-medium">Valor</Label>
                                                        <PriceInput
                                                            value={ payment.amount }
                                                            onChange={ (val) => handlePaymentChange(payment.id, "amount", val) }
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium">Data</Label>
                                                        <div className="relative">
                                                            <Calendar className="w-4 h-4 absolute left-2 top-3 text-muted-foreground" />
                                                            <Input
                                                                type="date"
                                                                className="pl-8"
                                                                value={ payment.date }
                                                                onChange={ (e) =>
                                                                    handlePaymentChange(payment.id, "date", e.target.value)
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium">Forma</Label>
                                                        <Select
                                                            onValueChange={ (val) =>
                                                                handlePaymentChange(payment.id, "mode", val)
                                                            }
                                                            value={ payment.mode }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecionar" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="PIX">PIX</SelectItem>
                                                                <SelectItem value="Transferência bancária">
                                                                    Transferência bancária
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {errors.partialPayment && (
                                            <div className="flex items-center gap-1 text-red-500 text-sm">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.partialPayment}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* Forma de Pagamento */}
                        {paymentStatus !== "Pendente" && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    <Label htmlFor="payment-mode" className="text-sm font-medium">
                                        Forma de Pagamento
                                    </Label>
                                </div>
                                <Select onValueChange={ setPaymentMode } value={ paymentMode }>
                                    <SelectTrigger id="payment-mode">
                                        <SelectValue placeholder="Selecione a forma de pagamento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[ "PIX", "Transferência bancária" ].map((mode) => (
                                            <SelectItem key={ mode } value={ mode }>
                                                {mode}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>

                    <div className="ml-auto flex gap-4 px-6 pb-4">
                        <Button variant="outline" onClick={ () => setIsCheckoutPaymentMethodDialogOpen(false) }>
                            Cancelar
                        </Button>
                        <Button onClick={ handleSave }>Salvar</Button>
                    </div>
                </Card>
            </DialogContent>
        </Dialog>
    );
}
