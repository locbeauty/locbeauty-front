// "use client";

// import { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   CreditCard,
//   Coins,
//   Banknote,
//   Calendar as CalendarIcon,
//   Plus,
//   Trash2,
//   AlertCircle,
//   FileText,
//   DollarSign,
//   History,
//   CheckCircle2,
//   Receipt,
//   Undo2,
//   Loader2,
// } from "lucide-react";
// import { format } from "date-fns";
// import { ptBR } from "date-fns/locale";
// import { Checkout, CheckoutPayment } from "@/utils/@types/checkouts";
// import { PaymentStatuses, PaymentMethodsType } from "@/utils/constants";
// import {
//   UpdateCheckoutPayment,
//   AddCheckoutPayment,
//   DeleteCheckoutPayment,
// } from "@/services/checkouts.service";
// import { toast } from "sonner";
// import { useQueryClient } from "@tanstack/react-query";
// import { BookingPaymentStatusBadge } from "../../bookings/common/BookingPaymentStatusBadge";
// import { cn } from "@/lib/utils";

// interface CheckoutPaymentMethodDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   checkout: Checkout | null;
// }

// function getPaymentIcon(method: string) {
//   switch (method) {
//   case "Dinheiro":
//     return <Coins className="h-4 w-4 text-green-600" />;
//   case "Transferência bancária":
//   case "Transferência":
//     return <Banknote className="h-4 w-4 text-blue-600" />;
//   case "Crédito":
//   case "Débito":
//     return <CreditCard className="h-4 w-4 text-violet-600" />;
//   default:
//     return <CreditCard className="h-4 w-4" />;
//   }
// }

// function getStatusColor(status: string) {
//   switch (status) {
//   case "Pago":
//     return "bg-green-500";
//   case "Parcial":
//     return "bg-yellow-500";
//   case "Pendente":
//     return "bg-red-500";
//   case "Cortesia":
//     return "bg-blue-500";
//   default:
//     return "bg-gray-500";
//   }
// }

// const formatDateForInput = (date: string | Date | null | undefined) => {
//   if (!date) return "";
//   return new Date(date).toISOString().split("T")[0];
// };

// export function CheckoutPaymentMethodDialog({
//   open,
//   onOpenChange,
//   checkout,
// }: CheckoutPaymentMethodDialogProps) {
//   const queryClient = useQueryClient();
//   const [ isSubmitting, setIsSubmitting ] = useState(false);
//   const [ localPayments, setLocalPayments ] = useState<CheckoutPayment[]>([]);

//   // Form states for new payment
//   const [ showAddForm, setShowAddForm ] = useState(false);
//   const [ newPayment, setNewPayment ] = useState({
//     paymentMethod: "Dinheiro" as PaymentMethodsType,
//     paymentStatus: "Pago" as PaymentStatuses,
//     paymentDate: new Date().toISOString().split("T")[0],
//     amount: "",
//     observation: "",
//     transactionId: "",
//   });

//   // Editing state
//   const [ editingPaymentId, setEditingPaymentId ] = useState<string | null>(null);

//   useEffect(() => {
//     if (checkout?.CheckoutPayment) {
//       // If CheckoutPayment is a single object in Checkout but we treat it as an array in the UI,
//       // we need to wrap it in an array or adjust the UI.
//       // Based on the history logic, it seems it should be an array.
//       // However, the type says it's a single object.
//       // I'll cast it to any for now to allow the UI to function as intended if the backend
//       // actually returns an array despite the type definition.
//       // UNLESS the type is correct and the UI should only show one.
//       setLocalPayments(
//         Array.isArray(checkout.CheckoutPayment)
//           ? checkout.CheckoutPayment
//           : [ checkout.CheckoutPayment ],
//       );
//     } else {
//       setLocalPayments([]);
//     }
//   }, [ checkout ]);

//   const totalPaid = localPayments.reduce((acc, p) => acc + (p?.amount || 0), 0);
//   const totalAmount = checkout?.totalPrice || 0;
//   const remainingAmount = Math.max(0, totalAmount - totalPaid);

//   const handleAddPayment = async () => {
//     if (!checkout) return;
//     if (
//       !newPayment.amount ||
//       parseFloat(newPayment.amount.replace(",", ".")) <= 0
//     ) {
//       toast.error("Informe um valor válido");
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const amountInCents = Math.round(
//         parseFloat(newPayment.amount.replace(",", ".")) * 100,
//       );

//       const response = await AddCheckoutPayment({
//         checkoutId: checkout.checkoutId,
//         paymentMethod: newPayment.paymentMethod,
//         paymentStatus: newPayment.paymentStatus,
//         paymentDate: new Date(newPayment.paymentDate),
//         amount: amountInCents,
//         observation: newPayment.observation,
//         transactionId: newPayment.transactionId,
//       });

//       if (response.statusCode === 201) {
//         toast.success("Pagamento adicionado com sucesso");
//         queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
//         queryClient.invalidateQueries({ queryKey: [ "get-checkout-details" ] });
//         setShowAddForm(false);
//         setNewPayment({
//           paymentMethod: "Dinheiro",
//           paymentStatus: "Pago",
//           paymentDate: new Date().toISOString().split("T")[0],
//           amount: "",
//           observation: "",
//           transactionId: "",
//         });
//       } else {
//         toast.error(response.message || "Erro ao adicionar pagamento");
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Erro ao processar pagamento");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleUpdatePayment = async (
//     paymentId: string,
//     updates: Partial<CheckoutPayment>,
//   ) => {
//     if (!checkout) return;
//     setIsSubmitting(true);
//     try {
//       const response = await UpdateCheckoutPayment({
//         checkoutPaymentId: paymentId,
//         ...updates,
//       });

//       if (response.statusCode === 200) {
//         toast.success("Pagamento atualizado");
//         queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
//         queryClient.invalidateQueries({ queryKey: [ "get-checkout-details" ] });
//         setEditingPaymentId(null);
//       } else {
//         toast.error(response.message || "Erro ao atualizar");
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Erro ao atualizar pagamento");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDeletePayment = async (paymentId: string) => {
//     if (!confirm("Tem certeza que deseja excluir este pagamento?")) return;

//     setIsSubmitting(true);
//     try {
//       const response = await DeleteCheckoutPayment(paymentId);
//       if (response.statusCode === 200) {
//         toast.success("Pagamento excluído");
//         queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
//         queryClient.invalidateQueries({ queryKey: [ "get-checkout-details" ] });
//       } else {
//         toast.error(response.message || "Erro ao excluir");
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Erro ao excluir pagamento");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={ open } onOpenChange={ onOpenChange }>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
//             <Receipt className="h-6 w-6 text-primary" />
//             Gestão de Pagamentos
//           </DialogTitle>
//         </DialogHeader>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
//           {/* Resumo Financeiro */}
//           <Card className="md:col-span-3 bg-muted/30 border-none shadow-none">
//             <CardContent className="pt-6">
//               <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
//                 <div className="space-y-1">
//                   <span className="text-xs text-muted-foreground uppercase font-semibold">
//                     Total do Serviço
//                   </span>
//                   <p className="text-2xl font-bold">
//                     R$ {(totalAmount / 100).toFixed(2).replace(".", ",")}
//                   </p>
//                 </div>
//                 <div className="space-y-1">
//                   <span className="text-xs text-muted-foreground uppercase font-semibold">
//                     Total Pago
//                   </span>
//                   <p className="text-2xl font-bold text-green-600">
//                     R$ {(totalPaid / 100).toFixed(2).replace(".", ",")}
//                   </p>
//                 </div>
//                 <div className="space-y-1">
//                   <span className="text-xs text-muted-foreground uppercase font-semibold">
//                     Restante
//                   </span>
//                   <p className="text-2xl font-bold text-red-600">
//                     R$ {(remainingAmount / 100).toFixed(2).replace(".", ",")}
//                   </p>
//                 </div>
//                 <div className="flex items-end">
//                   <BookingPaymentStatusBadge
//                     status={ (checkout as any)?.paymentStatus || "Pendente" }
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Lista de Pagamentos */}
//           <div className="md:col-span-2 space-y-4">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold flex items-center gap-2">
//                 <History className="h-5 w-5 text-muted-foreground" />
//                 Histórico de Lançamentos
//               </h3>
//               <Button
//                 size="sm"
//                 variant={ showAddForm ? "ghost" : "default" }
//                 onClick={ () => setShowAddForm(!showAddForm) }
//                 className="gap-2"
//               >
//                 {showAddForm ? (
//                   <>
//                     <Undo2 className="h-4 w-4" />
//                     Voltar
//                   </>
//                 ) : (
//                   <>
//                     <Plus className="h-4 w-4" />
//                     Novo Pagamento
//                   </>
//                 )}
//               </Button>
//             </div>

//             {showAddForm ? (
//               <Card className="border-primary/20 shadow-sm animate-in slide-in-from-top-2 duration-200">
//                 <CardHeader className="pb-4">
//                   <CardTitle className="text-sm font-bold flex items-center gap-2">
//                     <CheckCircle2 className="h-4 w-4 text-primary" />
//                     Adicionar Novo Lançamento
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label>Forma de Pagamento</Label>
//                       <Select
//                         value={ newPayment.paymentMethod }
//                         onValueChange={ (v) =>
//                           setNewPayment({
//                             ...newPayment,
//                             paymentMethod: v as PaymentMethodsType,
//                           })
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {[
//                             "PIX",
//                             "Transferência",
//                             "Débito",
//                             "Crédito",
//                             "Dinheiro",
//                           ].map((method) => (
//                             <SelectItem key={ method } value={ method }>
//                               <div className="flex items-center gap-2">
//                                 {getPaymentIcon(method)}
//                                 {method}
//                               </div>
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="space-y-2">
//                       <Label>Valor</Label>
//                       <div className="relative">
//                         <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
//                           R$
//                         </span>
//                         <Input
//                           className="pl-8"
//                           placeholder="0,00"
//                           value={ newPayment.amount }
//                           onChange={ (e) =>
//                             setNewPayment({
//                               ...newPayment,
//                               amount: e.target.value,
//                             })
//                           }
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label>Data</Label>
//                       <Input
//                         type="date"
//                         value={ newPayment.paymentDate }
//                         onChange={ (e) =>
//                           setNewPayment({
//                             ...newPayment,
//                             paymentDate: e.target.value,
//                           })
//                         }
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label>Status</Label>
//                       <Select
//                         value={ newPayment.paymentStatus }
//                         onValueChange={ (v) =>
//                           setNewPayment({
//                             ...newPayment,
//                             paymentStatus: v as PaymentStatuses,
//                           })
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="Pago">Pago</SelectItem>
//                           <SelectItem value="Pendente">Pendente</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label>Observação (Opcional)</Label>
//                     <Input
//                       placeholder="Ex: Pago via app, desconto aplicado..."
//                       value={ newPayment.observation }
//                       onChange={ (e) =>
//                         setNewPayment({
//                           ...newPayment,
//                           observation: e.target.value,
//                         })
//                       }
//                     />
//                   </div>

//                   <div className="flex justify-end gap-2 pt-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={ () => setShowAddForm(false) }
//                     >
//                       Cancelar
//                     </Button>
//                     <Button
//                       size="sm"
//                       onClick={ handleAddPayment }
//                       disabled={ isSubmitting }
//                     >
//                       {isSubmitting ? (
//                         <Loader2 className="animate-spin h-4 w-4" />
//                       ) : (
//                         "Confirmar Lançamento"
//                       )}
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="space-y-3">
//                 {localPayments.length === 0 || !localPayments[0] ? (
//                   <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
//                     <Receipt className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
//                     <p className="text-muted-foreground text-sm font-medium">
//                       Nenhum pagamento registrado ainda.
//                     </p>
//                   </div>
//                 ) : (
//                   localPayments
//                     .filter(Boolean)
//                     .map((payment: CheckoutPayment) => (
//                       <Card
//                         key={ payment.checkoutPaymentId }
//                         className="overflow-hidden group hover:border-primary/30 transition-all shadow-sm"
//                       >
//                         <div className="flex h-full">
//                           <div
//                             className={ cn(
//                               "w-1.5",
//                               getStatusColor(payment.paymentStatus),
//                             ) }
//                           />
//                           <CardContent className="flex-1 p-4">
//                             <div className="flex items-center justify-between">
//                               <div className="flex items-center gap-3">
//                                 <div className="bg-muted p-2 rounded-full">
//                                   {getPaymentIcon(payment.paymentMethod || "")}
//                                 </div>
//                                 <div>
//                                   <h4 className="font-bold text-sm">
//                                     {payment.paymentMethod}
//                                   </h4>
//                                   <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
//                                     <CalendarIcon className="h-3 w-3" />
//                                     {payment.paymentDate &&
//                                       format(
//                                         new Date(payment.paymentDate),
//                                         "dd 'de' MMMM",
//                                         { locale: ptBR },
//                                       )}
//                                     {payment.paymentStatus === "Pago" && (
//                                       <Badge
//                                         variant="outline"
//                                         className="text-[10px] h-4 bg-green-50 text-green-700 border-green-200"
//                                       >
//                                         Confirmado
//                                       </Badge>
//                                     )}
//                                   </div>
//                                 </div>
//                               </div>

//                               <div className="text-right flex items-center gap-4">
//                                 <div className="mr-4">
//                                   <p className="text-sm font-extrabold">
//                                     R${" "}
//                                     {((payment.amount || 0) / 100)
//                                       .toFixed(2)
//                                       .replace(".", ",")}
//                                   </p>
//                                   {payment.observation && (
//                                     <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end mt-1">
//                                       <FileText className="h-3 w-3" />
//                                       {payment.observation}
//                                     </div>
//                                   )}
//                                 </div>

//                                 <div className="flex items-center gap-1 invisible group-hover:visible transition-all">
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="h-8 w-8 text-muted-foreground hover:text-primary"
//                                     onClick={ () =>
//                                       setEditingPaymentId(
//                                         payment.checkoutPaymentId,
//                                       )
//                                     }
//                                   >
//                                     <CalendarIcon className="h-4 w-4" />
//                                   </Button>
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="h-8 w-8 text-muted-foreground hover:text-red-600"
//                                     onClick={ () =>
//                                       handleDeletePayment(
//                                         payment.checkoutPaymentId,
//                                       )
//                                     }
//                                   >
//                                     <Trash2 className="h-4 w-4" />
//                                   </Button>
//                                 </div>
//                               </div>
//                             </div>

//                             {editingPaymentId === payment.checkoutPaymentId && (
//                               <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 animate-in fade-in duration-200">
//                                 <div className="space-y-2">
//                                   <Label className="text-xs">
//                                     Data do Pagamento
//                                   </Label>
//                                   <Input
//                                     type="date"
//                                     size="sm"
//                                     value={ formatDateForInput(
//                                       payment.paymentDate,
//                                     ) }
//                                     onChange={ (e) =>
//                                       handleUpdatePayment(
//                                         payment.checkoutPaymentId,
//                                         {
//                                           paymentDate: new Date(e.target.value),
//                                         },
//                                       )
//                                     }
//                                   />
//                                 </div>
//                                 <div className="space-y-2">
//                                   <Label className="text-xs">Status</Label>
//                                   <Select
//                                     value={ payment.paymentStatus }
//                                     onValueChange={ (v) =>
//                                       handleUpdatePayment(
//                                         payment.checkoutPaymentId,
//                                         { paymentStatus: v as PaymentStatuses },
//                                       )
//                                     }
//                                   >
//                                     <SelectTrigger className="h-9">
//                                       <SelectValue />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                       <SelectItem value="Pago">Pago</SelectItem>
//                                       <SelectItem value="Pendente">
//                                         Pendente
//                                       </SelectItem>
//                                     </SelectContent>
//                                   </Select>
//                                 </div>
//                                 <div className="col-span-2 flex justify-end gap-2">
//                                   <Button
//                                     variant="ghost"
//                                     size="sm"
//                                     onClick={ () => setEditingPaymentId(null) }
//                                   >
//                                     Fechar
//                                   </Button>
//                                 </div>
//                               </div>
//                             )}
//                           </CardContent>
//                         </div>
//                       </Card>
//                     ))
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Quick Actions / Info Column */}
//           <div className="space-y-4">
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-sm">Próximos Passos</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50">
//                   <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
//                   <div className="text-xs text-blue-800 dark:text-blue-300">
//                     <p className="font-bold mb-1">Pagamento Parcial</p>O sistema
//                     permite lançamentos múltiplos até que o valor total seja
//                     alcançado.
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Button
//                     variant="outline"
//                     className="w-full justify-start text-xs h-9 gap-2"
//                   >
//                     <DollarSign className="h-4 w-4" />
//                     Gerar Recibo PDF
//                   </Button>
//                   <Button
//                     variant="outline"
//                     className="w-full justify-start text-xs h-9 gap-2"
//                   >
//                     <FileText className="h-4 w-4" />
//                     Ver Detalhes do Checkout
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/50">
//               <CardHeader className="pb-2">
//                 <CardTitle className="text-sm text-green-800 dark:text-green-300">
//                   Segurança
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="text-[10px] text-green-700 dark:text-green-400">
//                 Lançamentos confirmados como &quot;Pago&quot; impactam
//                 diretamente o fluxo de caixa e o status do agendamento.
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         <div className="flex justify-end pt-4 border-t">
//           <Button variant="outline" onClick={ () => onOpenChange(false) }>
//             Fechar Janela
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Banknote,
  CalendarIcon,
  CheckCircle,
  Coins,
  CreditCard,
} from "lucide-react";
import PriceInput from "@/components/shared/PriceInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkout, CheckoutPayment } from "@/utils/@types/checkouts";
import { UpdateCheckout } from "@/services/checkouts.service";
import { toast } from "sonner";
import { queryClient } from "@/app/(main)/layout";
import {
  centsToString,
  centsToStringWithCurrencyMark,
} from "@/utils/centsToString";
import { parseStringToCents } from "@/utils/parseStringToCents";
import {
  CheckoutStatuses,
  checkoutStatuses,
  PaymentMethods,
  PaymentModes,
  PaymentStatuses,
  paymentStatuses,
} from "@/utils/constants";
import { validateCheckoutForm } from "@/utils/validators/update-payment-info";
import { BookingPaymentStatusBadge } from "../../bookings/common/BookingPaymentStatusBadge";
import { InstallmentsEditor } from "@/components/shared/InstallmentsEditor";
import { Installment } from "@/utils/@types/payments";
import {
  buildInstallments,
  deriveStatus,
  fillMissingDueDates,
  sumPaid,
  sumTotal,
} from "@/utils/installments";

// Constrói a lista de parcelas a partir de um pagamento (usa `installments`
// quando existe; senão converte os campos legados first/second). Parcelas
// antigas sem vencimento ganham data derivada da 1ª parcela mês a mês
// (1ª: 01/07 -> 2ª: 01/08...), editável antes de salvar.
function installmentsFromPayment(
  payment: CheckoutPayment | null | undefined,
  totalCents: number,
): Installment[] {
  if (payment?.installments && payment.installments.length > 0) {
    return fillMissingDueDates(payment.installments);
  }
  if (
    payment &&
    (payment.paymentMode === "Parcelado" ||
      (payment.secondPaymentAmount ?? 0) > 0)
  ) {
    return fillMissingDueDates([
      {
        number: 1,
        amount: payment.firstPaymentAmount ?? 0,
        dueDate: payment.firstPaymentDate,
        paymentDate:
          payment.firstPaymentStatus === "Pago"
            ? payment.firstPaymentDate
            : null,
        paymentMethod: payment.firstPaymentMethod,
        paymentStatus: payment.firstPaymentStatus === "Pago" ? "Pago" : "Pendente",
      },
      {
        number: 2,
        amount:
          payment.secondPaymentAmount ??
          Math.max(0, totalCents - (payment.firstPaymentAmount ?? 0)),
        dueDate: payment.secondPaymentDate,
        paymentDate:
          payment.secondPaymentStatus === "Pago"
            ? payment.secondPaymentDate
            : null,
        paymentMethod: payment.secondPaymentMethod,
        paymentStatus:
          payment.secondPaymentStatus === "Pago" ? "Pago" : "Pendente",
      },
    ]);
  }
  return buildInstallments(totalCents, 2);
}

// type CheckoutStatus = "Pendente" | "Concluido" | "Cancelado";
// type PaymentStatus = "Pendente" | "Pago" | "Parcial";
// type PaymentMode = "AVista" | "Parcelado";
type PaymentMethod = string;
type InstallmentStatus = "Pendente" | "Pago";

export type LocalErrorsType = {
  paymentStatus: string | null;
  paymentInfo: {
    firstPaymentAmount: string | null;
    firstPaymentDate: string | null;
    firstPaymentMethod: string | null;

    secondPaymentAmount: string | null;
    secondPaymentDate: string | null;
    secondPaymentMethod: string | null;

    general?: string | null;
  };
};

export type PaymentMethodData = {
  paymentStatus: PaymentStatuses;
  paymentMode: PaymentModes;
  installments?: Installment[];
  installmentsCount?: number;
  firstPaymentAmount: number;
  firstPaymentDate: Date | null;
  firstPaymentMethod: PaymentMethod | null;
  firstPaymentStatus: InstallmentStatus;
  secondPaymentAmount: number;
  secondPaymentDate: Date | null;
  secondPaymentMethod: PaymentMethod | null;
  secondPaymentStatus: InstallmentStatus;
};

export type UpdateCheckoutPayload = {
  checkoutStatus: CheckoutStatuses;
  isCourtesy?: boolean;
  wasRefunded?: boolean;
  cancellationFee?: number;
  refundAmount?: number;
  CheckoutPayment: PaymentMethodData;
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
  },
};

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

function getStatusColor(status: string) {
  switch (status) {
  case "Pago":
    return "bg-green-500";
  case "Parcial":
    return "bg-yellow-500";
  case "Pendente":
    return "bg-red-500";
  case "Cortesia":
    return "bg-blue-500";
  default:
    return "bg-gray-500";
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
  setIsCheckoutPaymentMethodDialogOpen,
}: CheckoutPaymentMethodDialogProps) {
  const [ checkoutStatus, setCheckoutStatus ] =
    useState<CheckoutStatuses>("Pendente");
  const [ paymentStatus, setPaymentStatus ] =
    useState<PaymentStatuses>("Pendente");
  const [ paymentMode, setPaymentMode ] = useState<PaymentModes>("AVista");

  /* REMOVED: isCourtesy, wasRefunded (global), cancellationFee (global state used differently now) */
  // We still need local state for tracking changes, but we will track per-parcel refund status visually
  // Note: Persisted data only has `wasRefunded` and `cancellationFee`.
  // Refactor: Unified refund state for "Parcial" status
  const [ isRefunded, setIsRefunded ] = useState(false);
  const [ refundAmount, setRefundAmount ] = useState("0,00");

  const [ firstPaymentAmount, setFirstPaymentAmount ] = useState("0,00");
  const [ firstPaymentDate, setFirstPaymentDate ] = useState("");
  const [ firstPaymentMethod, setFirstPaymentMethod ] =
    useState<PaymentMethod | null>(null);
  const [ firstPaymentStatus, setFirstPaymentStatus ] =
    useState<InstallmentStatus>("Pendente");

  const [ secondPaymentAmount, setSecondPaymentAmount ] = useState("0,00");
  const [ secondPaymentDate, setSecondPaymentDate ] = useState("");
  const [ secondPaymentMethod, setSecondPaymentMethod ] =
    useState<PaymentMethod | null>(null);
  const [ secondPaymentStatus, setSecondPaymentStatus ] =
    useState<InstallmentStatus>("Pendente");

  // Parcelamento em N parcelas (fonte da verdade quando status === "Parcial").
  const [ installments, setInstallments ] = useState<Installment[]>([]);
  const [ originalInstallmentsKey, setOriginalInstallmentsKey ] = useState("");

  const [ errors, setErrors ] = useState<LocalErrorsType>(initialErrors);
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  const hasChanged = useMemo(() => {
    if (!selectedCheckout) return false;

    const payment = selectedCheckout.CheckoutPayment;
    if (!payment) return false;

    // --- Início da Lógica Replicada ---
    // Recrie a lógica EXATA do seu useEffect para os valores de "original"

    // 1. Lógica do secondPaymentAmount
    const originalPendingValue =
      selectedCheckout.totalPrice - (payment?.firstPaymentAmount || 0);
    const originalSecondPaymentAmountValue =
      payment.paymentMode === "Parcelado" ? originalPendingValue : 0;
    const originalSecondPaymentAmountString = centsToString(
      originalSecondPaymentAmountValue,
    );

    // 2. Lógica do secondPaymentStatus
    const originalSecondPaymentStatus = payment.secondPaymentStatus
      ? payment.secondPaymentStatus
      : "Pendente";
    // --- Fim da Lógica Replicada ---

    // Compara cada campo do estado atual com o valor original
    const isSame =
      checkoutStatus === selectedCheckout.checkoutStatus &&
      // Removed isCourtesy, wasRefunded, cancellationFee from strict comparison here as they are derived/computed now
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
      secondPaymentStatus === originalSecondPaymentStatus &&
      // Parcelamento: detecta edição das parcelas
      JSON.stringify(installments) === originalInstallmentsKey &&
      // Check refund changes
      isRefunded === selectedCheckout.wasRefunded &&
      (isRefunded
        ? refundAmount === centsToString(selectedCheckout.refundAmount || 0)
        : true);
    // Retorna 'true' se for DIFERENTE (ou seja, se mudou)
    return !isSame;
  }, [
    // Dependências: recalcule sempre que qualquer um desses valores mudar
    selectedCheckout,
    checkoutStatus,
    paymentStatus,
    paymentMode,
    firstPaymentAmount,
    firstPaymentDate,
    firstPaymentMethod,
    firstPaymentStatus,
    secondPaymentAmount,
    secondPaymentDate,
    secondPaymentMethod,
    secondPaymentStatus,
    installments,
    originalInstallmentsKey,
    isRefunded,
    refundAmount,
  ]);

  const isRefundedStatus =
    selectedCheckout?.CheckoutPayment?.paymentStatus === "Reembolsado";

  // "É parcelado" não depende só do status "Parcial": um plano parcelado pode
  // estar totalmente pago (status "Pago"). Nesses casos ainda queremos exibir e
  // tratar as N parcelas, e não a visão legada de parcela única.
  const isParcelled =
    paymentStatus === "Parcial" ||
    (paymentMode === "Parcelado" && installments.length > 1);

  useEffect(() => {
    if (selectedCheckout && isCheckoutPaymentMethodDialogOpen) {
      const payment = selectedCheckout.CheckoutPayment;
      if (!payment) return;
      const pendingValue =
        selectedCheckout.totalPrice -
        (selectedCheckout?.CheckoutPayment?.firstPaymentAmount || 0);
      setCheckoutStatus(selectedCheckout.checkoutStatus);
      setPaymentStatus(payment.paymentStatus);
      setPaymentMode(payment.paymentMode);

      // Initialize Refund State
      // Simplified: If wasRefunded is true, we assume it complies with the current single refund input
      const isGlobalRefunded = selectedCheckout.wasRefunded || false;

      if (isGlobalRefunded) {
        setIsRefunded(true);
        setRefundAmount(centsToString(selectedCheckout.refundAmount || 0));
      } else {
        setIsRefunded(false);
        setRefundAmount("0,00");
      }

      setFirstPaymentAmount(centsToString(payment.firstPaymentAmount || 0));
      setFirstPaymentDate(formatDateForInput(payment.firstPaymentDate));
      setFirstPaymentMethod(payment.firstPaymentMethod);
      setFirstPaymentStatus(payment.firstPaymentStatus);

      const secondPaymentAmountInputDisplayValue =
        payment.paymentMode === "Parcelado" ? pendingValue : 0;

      setSecondPaymentAmount(
        centsToString(secondPaymentAmountInputDisplayValue),
      );
      setSecondPaymentDate(formatDateForInput(payment.secondPaymentDate));
      setSecondPaymentMethod(payment.secondPaymentMethod);
      setSecondPaymentStatus(
        payment.secondPaymentStatus ? payment.secondPaymentStatus : "Pendente",
      );

      const loadedInstallments = installmentsFromPayment(
        payment,
        selectedCheckout.totalPrice,
      );
      setInstallments(loadedInstallments);
      setOriginalInstallmentsKey(JSON.stringify(loadedInstallments));
    }
    setErrors({} as LocalErrorsType);
  }, [ selectedCheckout, isCheckoutPaymentMethodDialogOpen ]);

  useEffect(() => {
    if (
      paymentStatus === "Pago" &&
      selectedCheckout &&
      paymentMode === "AVista"
    ) {
      setFirstPaymentAmount(centsToString(selectedCheckout.totalPrice));
    }
  }, [ setFirstPaymentAmount, selectedCheckout, paymentStatus, paymentMode ]);

  // Mantém as parcelas em sincronia com o total quando em modo parcelado.
  // Só re-divide quando o total realmente mudou; caso contrário preserva os
  // valores customizados das parcelas (não sobrescreve ao reabrir).
  useEffect(() => {
    if (
      selectedCheckout &&
      paymentStatus === "Parcial" &&
      installments.length > 0 &&
      sumTotal(installments) !== selectedCheckout.totalPrice
    ) {
      const rebuilt = buildInstallments(
        selectedCheckout.totalPrice,
        installments.length,
        installments,
      );
      const key = JSON.stringify(rebuilt);
      if (key !== JSON.stringify(installments)) {
        setInstallments(rebuilt);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ selectedCheckout?.totalPrice, paymentStatus ]);

  async function handleSave() {
    // Calculate total cancellation fee and wasRefunded status early for validation
    const calculatedWasRefunded = isRefunded;

    if (!selectedCheckout) return;

    // Validação: parcelamento valida as parcelas; demais status usam a
    // validação legada (entrada à vista).
    if (isParcelled && !calculatedWasRefunded) {
      if (sumTotal(installments) !== selectedCheckout.totalPrice) {
        toast.error("A soma das parcelas deve ser igual ao valor total.");
        return;
      }
      // O vencimento guia a inadimplência (parcela vencida + 24h), então toda
      // parcela precisa de data. Forma de pagamento só é exigida nas pagas.
      const missingDueDate = installments.find((i) => !i.dueDate);
      if (missingDueDate) {
        toast.error(
          `Informe a data de vencimento da parcela ${missingDueDate.number}.`,
        );
        return;
      }
      const invalidPaid = installments.find(
        (i) => i.paymentStatus === "Pago" && !i.paymentMethod,
      );
      if (invalidPaid) {
        toast.error(
          `Informe a forma de pagamento da parcela ${invalidPaid.number} (marcada como paga).`,
        );
        return;
      }
      setErrors(initialErrors);
    } else {
      const isValid = validateCheckoutForm({
        paymentStatus,
        paymentMode,
        firstPaymentAmount,
        firstPaymentDate,
        firstPaymentMethod,
        firstPaymentStatus, // Passando o status da 1ª parcela
        secondPaymentAmount,
        secondPaymentDate,
        secondPaymentMethod,
        secondPaymentStatus,
        selectedCheckout,
        initialErrors,
        isRefunded: calculatedWasRefunded,
        setErrors,
      });
      if (!isValid) {
        return;
      }
    }

    // Calculate total cancellation fee
    const calculatedRefundAmount = isRefunded
      ? parseStringToCents(refundAmount)
      : 0;

    // Validate refund amounts locally
    if (isRefunded) {
      const paidAmount = parseStringToCents(firstPaymentAmount);
      // Logic check: Refund usually shouldn't exceed what was paid.
      // In "Parcial" mode, what was paid is the first parcel.
      // In "Pago" mode, what was paid is everything.
      // We'll check against firstPaymentAmount if Parcial, or Total if Pago?
      // Actually, if status is Parcial, we only care about first parcel refund usually.
      const refundVal = parseStringToCents(refundAmount);

      const maxRefund =
        paymentStatus === "Parcial" ? paidAmount : selectedCheckout.totalPrice; //Fallback or other logic for generic refund

      if (refundVal > maxRefund) {
        toast.error(
          `O reembolso não pode ser maior que o valor pago (${centsToStringWithCurrencyMark(
            maxRefund,
          )}).`,
        );
        return;
      }
    }

    // Global cap check
    if (calculatedRefundAmount > selectedCheckout.totalPrice) {
      toast.error("O valor do reembolso não pode ser maior que o valor total.");
      return;
    }

    setIsSubmitting(true);

    // As parcelas são a fonte da verdade. Para Pago/Pendente é uma única
    // parcela; para Parcial, as N parcelas do editor.
    const total = selectedCheckout.totalPrice;
    const todayISO = new Date().toISOString().split("T")[0];

    let effectiveInstallments: Installment[];
    if (isParcelled) {
      effectiveInstallments = installments;
    } else if (paymentStatus === "Pago") {
      effectiveInstallments = [
        {
          number: 1,
          amount: total,
          dueDate: firstPaymentDate || todayISO,
          paymentDate: firstPaymentDate || todayISO,
          paymentMethod: firstPaymentMethod,
          paymentStatus: "Pago",
        },
      ];
    } else {
      effectiveInstallments = [
        {
          number: 1,
          amount: total,
          dueDate: firstPaymentDate || null,
          paymentDate: null,
          paymentMethod: firstPaymentMethod ?? null,
          paymentStatus: "Pendente",
        },
      ];
    }

    const firstInst = effectiveInstallments[0];
    const secondInst = effectiveInstallments[1];

    // Cortesia é um status especial: não é derivado das parcelas. Quando
    // selecionado, marcamos isCourtesy e forçamos o status como "Cortesia".
    const isCourtesySelected = paymentStatus === "Cortesia";

    const checkoutPaymentPayload: PaymentMethodData = {
      paymentStatus: calculatedWasRefunded
        ? "Reembolsado"
        : isCourtesySelected
          ? "Cortesia"
          : deriveStatus(effectiveInstallments),
      paymentMode: effectiveInstallments.length > 1 ? "Parcelado" : "AVista",
      installments: effectiveInstallments,
      installmentsCount: effectiveInstallments.length,
      // Espelho legado (first/second) para leitores antigos.
      firstPaymentAmount: firstInst?.amount ?? 0,
      firstPaymentDate: firstInst?.dueDate ? new Date(firstInst.dueDate) : null,
      firstPaymentMethod: firstInst?.paymentMethod ?? null,
      firstPaymentStatus: firstInst?.paymentStatus ?? "Pendente",
      secondPaymentAmount: Math.max(0, total - (firstInst?.amount ?? 0)),
      secondPaymentDate: secondInst?.dueDate
        ? new Date(secondInst.dueDate)
        : null,
      secondPaymentMethod: secondInst?.paymentMethod ?? null,
      secondPaymentStatus: secondInst?.paymentStatus ?? "Pendente",
    };

    const payload: UpdateCheckoutPayload = {
      checkoutStatus,
      isCourtesy: isCourtesySelected,
      wasRefunded: calculatedWasRefunded,
      refundAmount: calculatedRefundAmount,
      CheckoutPayment: checkoutPaymentPayload,
    };

    try {
      const response = await UpdateCheckout({
        checkoutId: selectedCheckout.checkoutId,
        body: payload,
      });

      if (response.statusCode !== 200) {
        toast.warning(response.message || "Erro ao atualizar pagamento.");
      } else {
        const updatedCheckout: Checkout = {
          ...selectedCheckout,
          checkoutStatus: payload.checkoutStatus,
          isCourtesy: payload.isCourtesy ?? false,
          wasRefunded: payload.wasRefunded ?? false,
          cancellationFee: payload.cancellationFee ?? null,
          refundAmount: payload.refundAmount ?? null,
          CheckoutPayment: {
            ...selectedCheckout.CheckoutPayment,
            ...payload.CheckoutPayment,
            installments: isParcelled
              ? installments
              : (selectedCheckout.CheckoutPayment?.installments ?? null),
            firstPaymentDate: payload.CheckoutPayment.firstPaymentDate
              ? payload.CheckoutPayment.firstPaymentDate.toISOString()
              : null,
            secondPaymentDate: payload.CheckoutPayment.secondPaymentDate
              ? payload.CheckoutPayment.secondPaymentDate.toISOString()
              : null,
            paymentMode: payload.CheckoutPayment.paymentMode,
            paymentStatus: payload.CheckoutPayment.paymentStatus,
          } as CheckoutPayment,
        };

        // Atualiza o estado local
        setSelectedCheckout(updatedCheckout);
        queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-all-goals" ] });

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
    <Dialog
      open={ isCheckoutPaymentMethodDialogOpen }
      onOpenChange={ setIsCheckoutPaymentMethodDialogOpen }
    >
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
                  disabled={ selectedCheckout.checkoutStatus === "Cancelado" }
                  onValueChange={ (value: PaymentStatuses) => {
                    setPaymentStatus(value);
                    if (value === "Parcial") {
                      setPaymentMode("Parcelado");
                      setInstallments((prev) =>
                        buildInstallments(
                          selectedCheckout.totalPrice,
                          prev.length > 1 ? prev.length : 2,
                          prev,
                        ),
                      );
                    } else if (value === "Pago") {
                      setPaymentMode("AVista");
                    }
                  } }
                  value={ paymentStatus }
                >
                  <SelectTrigger
                    disabled={
                      isRefundedStatus ||
                      selectedCheckout.CheckoutPayment?.paymentStatus ===
                        "Pago" ||
                      (paymentStatus === "Parcial" &&
                        firstPaymentStatus === "Pago")
                    }
                    className={ errors.paymentStatus ? "border-red-500" : "" }
                  >
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses
                      .filter((status) => {
                        if (
                          status === "Reembolsado" ||
                          status === "Cancelado"
                        ) {
                          return paymentStatus === status;
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
                {errors.paymentStatus && (
                  <p className="text-xs text-red-500">{errors.paymentStatus}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Checkboxes removed as requested */}
            </div>

            {paymentStatus !== "Pendente" && paymentStatus !== "Cancelado" && (
              <div className="">
                <Label>
                  O valor total é:{" "}
                  <span>
                    {centsToStringWithCurrencyMark(selectedCheckout.totalPrice)}
                  </span>
                </Label>
              </div>
            )}
          </div>
          {paymentStatus !== "Pendente" &&
            paymentStatus !== "Cortesia" &&
            paymentStatus !== "Cancelado" && (
            <div className={ "bg-muted/30 p-4 rounded-lg border space-y-6" }>
              {isParcelled ? (
                <InstallmentsEditor
                  totalCents={ selectedCheckout.totalPrice }
                  installments={ installments }
                  onChange={ setInstallments }
                  disabled={ isRefundedStatus || paymentStatus === "Pago" }
                />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold flex items-center gap-2 text-primary">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        1
                      </div>
                      Primeira Parcela / Entrada
                    </Label>
                    <BookingPaymentStatusBadge
                      status={
                        selectedCheckout.CheckoutPayment?.firstPaymentStatus
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4">
                      <Label className="text-xs text-muted-foreground">
                        Valor
                      </Label>
                      <PriceInput
                        disabled={
                          isRefundedStatus ||
                          paymentStatus === "Pago" ||
                          selectedCheckout?.CheckoutPayment?.paymentMode ===
                            "Parcelado" ||
                          firstPaymentStatus === "Pago"
                        }
                        withLabel={ false }
                        value={ firstPaymentAmount || "0,00" }
                        onChange={ (value) => setFirstPaymentAmount(value) }
                      />
                      {errors.paymentInfo?.firstPaymentAmount && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.paymentInfo.firstPaymentAmount}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-4">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" /> Data do Pagamento
                      </Label>
                      <Input
                        disabled={
                          isRefundedStatus ||
                          selectedCheckout.CheckoutPayment?.paymentStatus ===
                            "Pago" ||
                          selectedCheckout?.CheckoutPayment?.paymentMode ===
                            "Parcelado" ||
                          firstPaymentStatus === "Pago"
                        }
                        type="date"
                        value={ firstPaymentDate }
                        onChange={ (e) => setFirstPaymentDate(e.target.value) }
                      />
                      {errors.paymentInfo?.firstPaymentDate && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.paymentInfo.firstPaymentDate}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-4">
                      <Label className="text-xs text-muted-foreground">
                        Forma de Pagamento
                      </Label>
                      <Select
                        onValueChange={ (value) => setFirstPaymentMethod(value) }
                        value={ firstPaymentMethod || "" }
                      >
                        <SelectTrigger
                          disabled={
                            isRefundedStatus ||
                            selectedCheckout.CheckoutPayment?.paymentStatus ===
                              "Pago" ||
                            selectedCheckout?.CheckoutPayment?.paymentMode ===
                              "Parcelado" ||
                            firstPaymentStatus === "Pago"
                          }
                          className={
                            errors.paymentInfo?.firstPaymentMethod
                              ? "border-red-500"
                              : ""
                          }
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
                        <p className="text-xs text-red-500 mt-1">
                          {errors.paymentInfo.firstPaymentMethod}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Refund Section - Hide when Concluído unless already refunded */}
          {(selectedCheckout.CheckoutPayment?.paymentStatus === "Pago" ||
            selectedCheckout.CheckoutPayment?.firstPaymentStatus === "Pago" ||
            selectedCheckout.CheckoutPayment?.secondPaymentStatus === "Pago") &&
            (checkoutStatus !== "Concluido" ||
              isRefunded ||
              selectedCheckout.wasRefunded) && (
            <div className="bg-red-50/50 p-4 rounded-lg border border-dashed border-red-200 mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="refunded"
                  checked={ isRefunded }
                  disabled={
                    selectedCheckout.CheckoutPayment?.paymentStatus ===
                      "Reembolsado"
                  }
                  onCheckedChange={ (checked) =>
                    setIsRefunded(checked as boolean)
                  }
                />
                <Label
                  htmlFor="refunded"
                  className="text-xs text-red-600 font-medium"
                >
                    Houve Reembolso?
                </Label>
              </div>

              {isRefunded && (
                <div className="pl-6 w-full sm:w-1/2">
                  <Label className="text-xs text-muted-foreground">
                      Valor do Reembolso
                  </Label>
                  <PriceInput
                    disabled={
                      selectedCheckout.CheckoutPayment?.paymentStatus ===
                        "Reembolsado"
                    }
                    value={ refundAmount }
                    onChange={ (value) => setRefundAmount(value) }
                  />
                </div>
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
          <Button
            variant="outline"
            onClick={ () => setIsCheckoutPaymentMethodDialogOpen(false) }
          >
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