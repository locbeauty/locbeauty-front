"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Coins,
  Banknote,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  DollarSign,
  History,
  CheckCircle2,
  Receipt,
  Undo2,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkout, CheckoutPayment } from "@/utils/@types/checkouts";
import { PaymentStatuses, PaymentMethodsType } from "@/utils/constants";
import {
  UpdateCheckoutPayment,
  AddCheckoutPayment,
  DeleteCheckoutPayment,
} from "@/services/checkouts.service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BookingPaymentStatusBadge } from "../../bookings/common/BookingPaymentStatusBadge";
import { cn } from "@/lib/utils";

interface CheckoutPaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkout: Checkout | null;
}

function getPaymentIcon(method: string) {
  switch (method) {
  case "Dinheiro":
    return <Coins className="h-4 w-4 text-green-600" />;
  case "Transferência bancária":
  case "Transferência":
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

export function CheckoutPaymentMethodDialog({
  open,
  onOpenChange,
  checkout,
}: CheckoutPaymentMethodDialogProps) {
  const queryClient = useQueryClient();
  const [ isSubmitting, setIsSubmitting ] = useState(false);
  const [ localPayments, setLocalPayments ] = useState<CheckoutPayment[]>([]);

  // Form states for new payment
  const [ showAddForm, setShowAddForm ] = useState(false);
  const [ newPayment, setNewPayment ] = useState({
    paymentMethod: "Dinheiro" as PaymentMethodsType,
    paymentStatus: "Pago" as PaymentStatuses,
    paymentDate: new Date().toISOString().split("T")[0],
    amount: "",
    observation: "",
    transactionId: "",
  });

  // Editing state
  const [ editingPaymentId, setEditingPaymentId ] = useState<string | null>(null);

  useEffect(() => {
    if (checkout?.CheckoutPayment) {
      // If CheckoutPayment is a single object in Checkout but we treat it as an array in the UI,
      // we need to wrap it in an array or adjust the UI.
      // Based on the history logic, it seems it should be an array.
      // However, the type says it's a single object.
      // I'll cast it to any for now to allow the UI to function as intended if the backend
      // actually returns an array despite the type definition.
      // UNLESS the type is correct and the UI should only show one.
      setLocalPayments(
        Array.isArray(checkout.CheckoutPayment)
          ? checkout.CheckoutPayment
          : [ checkout.CheckoutPayment ],
      );
    } else {
      setLocalPayments([]);
    }
  }, [ checkout ]);

  const totalPaid = localPayments.reduce((acc, p) => acc + (p?.amount || 0), 0);
  const totalAmount = checkout?.totalPrice || 0;
  const remainingAmount = Math.max(0, totalAmount - totalPaid);

  const handleAddPayment = async () => {
    if (!checkout) return;
    if (
      !newPayment.amount ||
      parseFloat(newPayment.amount.replace(",", ".")) <= 0
    ) {
      toast.error("Informe um valor válido");
      return;
    }

    setIsSubmitting(true);
    try {
      const amountInCents = Math.round(
        parseFloat(newPayment.amount.replace(",", ".")) * 100,
      );

      const response = await AddCheckoutPayment({
        checkoutId: checkout.checkoutId,
        paymentMethod: newPayment.paymentMethod,
        paymentStatus: newPayment.paymentStatus,
        paymentDate: new Date(newPayment.paymentDate),
        amount: amountInCents,
        observation: newPayment.observation,
        transactionId: newPayment.transactionId,
      });

      if (response.statusCode === 201) {
        toast.success("Pagamento adicionado com sucesso");
        queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-checkout-details" ] });
        setShowAddForm(false);
        setNewPayment({
          paymentMethod: "Dinheiro",
          paymentStatus: "Pago",
          paymentDate: new Date().toISOString().split("T")[0],
          amount: "",
          observation: "",
          transactionId: "",
        });
      } else {
        toast.error(response.message || "Erro ao adicionar pagamento");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar pagamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePayment = async (
    paymentId: string,
    updates: Partial<CheckoutPayment>,
  ) => {
    if (!checkout) return;
    setIsSubmitting(true);
    try {
      const response = await UpdateCheckoutPayment({
        checkoutPaymentId: paymentId,
        ...updates,
      });

      if (response.statusCode === 200) {
        toast.success("Pagamento atualizado");
        queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-checkout-details" ] });
        setEditingPaymentId(null);
      } else {
        toast.error(response.message || "Erro ao atualizar");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar pagamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Tem certeza que deseja excluir este pagamento?")) return;

    setIsSubmitting(true);
    try {
      const response = await DeleteCheckoutPayment(paymentId);
      if (response.statusCode === 200) {
        toast.success("Pagamento excluído");
        queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
        queryClient.invalidateQueries({ queryKey: [ "get-checkout-details" ] });
      } else {
        toast.error(response.message || "Erro ao excluir");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir pagamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Receipt className="h-6 w-6 text-primary" />
            Gestão de Pagamentos
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Resumo Financeiro */}
          <Card className="md:col-span-3 bg-muted/30 border-none shadow-none">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">
                    Total do Serviço
                  </span>
                  <p className="text-2xl font-bold">
                    R$ {(totalAmount / 100).toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">
                    Total Pago
                  </span>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {(totalPaid / 100).toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">
                    Restante
                  </span>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {(remainingAmount / 100).toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <div className="flex items-end">
                  <BookingPaymentStatusBadge
                    status={ (checkout as any)?.paymentStatus || "Pendente" }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Pagamentos */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                Histórico de Lançamentos
              </h3>
              <Button
                size="sm"
                variant={ showAddForm ? "ghost" : "default" }
                onClick={ () => setShowAddForm(!showAddForm) }
                className="gap-2"
              >
                {showAddForm ? (
                  <>
                    <Undo2 className="h-4 w-4" />
                    Voltar
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Novo Pagamento
                  </>
                )}
              </Button>
            </div>

            {showAddForm ? (
              <Card className="border-primary/20 shadow-sm animate-in slide-in-from-top-2 duration-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Adicionar Novo Lançamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Forma de Pagamento</Label>
                      <Select
                        value={ newPayment.paymentMethod }
                        onValueChange={ (v) =>
                          setNewPayment({
                            ...newPayment,
                            paymentMethod: v as PaymentMethodsType,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "PIX",
                            "Transferência",
                            "Débito",
                            "Crédito",
                            "Dinheiro",
                          ].map((method) => (
                            <SelectItem key={ method } value={ method }>
                              <div className="flex items-center gap-2">
                                {getPaymentIcon(method)}
                                {method}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                          R$
                        </span>
                        <Input
                          className="pl-8"
                          placeholder="0,00"
                          value={ newPayment.amount }
                          onChange={ (e) =>
                            setNewPayment({
                              ...newPayment,
                              amount: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={ newPayment.paymentDate }
                        onChange={ (e) =>
                          setNewPayment({
                            ...newPayment,
                            paymentDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={ newPayment.paymentStatus }
                        onValueChange={ (v) =>
                          setNewPayment({
                            ...newPayment,
                            paymentStatus: v as PaymentStatuses,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pago">Pago</SelectItem>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Observação (Opcional)</Label>
                    <Input
                      placeholder="Ex: Pago via app, desconto aplicado..."
                      value={ newPayment.observation }
                      onChange={ (e) =>
                        setNewPayment({
                          ...newPayment,
                          observation: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={ () => setShowAddForm(false) }
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={ handleAddPayment }
                      disabled={ isSubmitting }
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        "Confirmar Lançamento"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {localPayments.length === 0 || !localPayments[0] ? (
                  <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
                    <Receipt className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm font-medium">
                      Nenhum pagamento registrado ainda.
                    </p>
                  </div>
                ) : (
                  localPayments
                    .filter(Boolean)
                    .map((payment: CheckoutPayment) => (
                      <Card
                        key={ payment.checkoutPaymentId }
                        className="overflow-hidden group hover:border-primary/30 transition-all shadow-sm"
                      >
                        <div className="flex h-full">
                          <div
                            className={ cn(
                              "w-1.5",
                              getStatusColor(payment.paymentStatus),
                            ) }
                          />
                          <CardContent className="flex-1 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="bg-muted p-2 rounded-full">
                                  {getPaymentIcon(payment.paymentMethod || "")}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm">
                                    {payment.paymentMethod}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                    <CalendarIcon className="h-3 w-3" />
                                    {payment.paymentDate &&
                                      format(
                                        new Date(payment.paymentDate),
                                        "dd 'de' MMMM",
                                        { locale: ptBR },
                                      )}
                                    {payment.paymentStatus === "Pago" && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] h-4 bg-green-50 text-green-700 border-green-200"
                                      >
                                        Confirmado
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right flex items-center gap-4">
                                <div className="mr-4">
                                  <p className="text-sm font-extrabold">
                                    R${" "}
                                    {((payment.amount || 0) / 100)
                                      .toFixed(2)
                                      .replace(".", ",")}
                                  </p>
                                  {payment.observation && (
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end mt-1">
                                      <FileText className="h-3 w-3" />
                                      {payment.observation}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 invisible group-hover:visible transition-all">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={ () =>
                                      setEditingPaymentId(
                                        payment.checkoutPaymentId,
                                      )
                                    }
                                  >
                                    <CalendarIcon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                    onClick={ () =>
                                      handleDeletePayment(
                                        payment.checkoutPaymentId,
                                      )
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {editingPaymentId === payment.checkoutPaymentId && (
                              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                                <div className="space-y-2">
                                  <Label className="text-xs">
                                    Data do Pagamento
                                  </Label>
                                  <Input
                                    type="date"
                                    size="sm"
                                    value={ formatDateForInput(
                                      payment.paymentDate,
                                    ) }
                                    onChange={ (e) =>
                                      handleUpdatePayment(
                                        payment.checkoutPaymentId,
                                        {
                                          paymentDate: new Date(e.target.value),
                                        },
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs">Status</Label>
                                  <Select
                                    value={ payment.paymentStatus }
                                    onValueChange={ (v) =>
                                      handleUpdatePayment(
                                        payment.checkoutPaymentId,
                                        { paymentStatus: v as PaymentStatuses },
                                      )
                                    }
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Pago">Pago</SelectItem>
                                      <SelectItem value="Pendente">
                                        Pendente
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-2 flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={ () => setEditingPaymentId(null) }
                                  >
                                    Fechar
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </div>
                      </Card>
                    ))
                )}
              </div>
            )}
          </div>

          {/* Quick Actions / Info Column */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Próximos Passos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800 dark:text-blue-300">
                    <p className="font-bold mb-1">Pagamento Parcial</p>O sistema
                    permite lançamentos múltiplos até que o valor total seja
                    alcançado.
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-xs h-9 gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    Gerar Recibo PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-xs h-9 gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Ver Detalhes do Checkout
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-800 dark:text-green-300">
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[10px] text-green-700 dark:text-green-400">
                Lançamentos confirmados como &quot;Pago&quot; impactam
                diretamente o fluxo de caixa e o status do agendamento.
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={ () => onOpenChange(false) }>
            Fechar Janela
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
