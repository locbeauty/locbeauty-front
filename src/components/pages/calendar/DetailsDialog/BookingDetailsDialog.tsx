import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  MapPin,
  DollarSign,
  User,
  Calendar,
  Package,
  Building,
  Phone,
  Mail,
  Trash2,
  CircleEllipsis,
  Text,
  FileText,
  Pencil,
  Copy,
  Check,
  X,
} from "lucide-react";
import { BookingStatusBadge } from "@/components/pages/bookings/common/BookingStatusBadge";
import { toast } from "sonner";
import { MachineExtraCostsDialog } from "../MachineExtraCostsDialog/MachineExtraCostsDialog";
import { centsToStringWithCurrencyMark } from "@/utils/centsToString";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkout } from "@/utils/@types/checkouts";
import { UpdateAdditionalCostsDialog } from "../AdditionalCostsDialog/UpdateAdditionalCostsDialog";
import { Textarea } from "@/components/ui/textarea";
import {
  UpdateCheckout,
  UpdateCheckoutStatus,
} from "@/services/checkouts.service";
import { queryClient } from "@/app/(main)/layout";
import { CheckoutPaymentMethodDialog } from "../CheckoutPaymentMethodDialog/CheckoutPaymentMethodDialog";
import { AddGearToCheckoutDialog } from "./AddGearToCheckoutDialog";
import { RemoveBookingFromCheckout } from "@/services/bookings.service";
import { BookingPaymentStatusBadge } from "../../bookings/common/BookingPaymentStatusBadge";
import { formatDate, formatTime } from "../bookingViewHelpers";
import PriceInput from "@/components/shared/PriceInput";
import { parseStringToCents } from "@/utils/parseStringToCents";

interface BookingDetailsDialogProps {
  setBookingDetailsDialogOpen: Dispatch<SetStateAction<boolean>>;
  isBookingDetailsDialogOpen: boolean;
  selectedCheckout: Checkout | null;
  setSelectedCheckout: Dispatch<SetStateAction<Checkout | null>>;
}

export function BookingDetailsDialog({
  isBookingDetailsDialogOpen,
  setBookingDetailsDialogOpen,
  selectedCheckout,
  setSelectedCheckout,
}: BookingDetailsDialogProps) {
  const [ checkoutObservations, setCheckoutObservations ] = useState("");
  const [ selectedBookingIdForExtraCosts, setSelectedBookingIdForExtraCosts ] =
    useState<string | null>(null);
  const [ isAdditionalCostsDialogOpen, setAdditionalCostsDialogOpen ] =
    useState(false);
  const [
    isCheckoutPaymentMethodDialogOpen,
    setIsCheckoutPaymentMethodDialogOpen,
  ] = useState(false);
  const [ isAddGearDialogOpen, setIsAddGearDialogOpen ] = useState(false);
  const [
    isCancelBookingConfirmationDialogOpen,
    setCancelBookingConfirmationDialogOpen,
  ] = useState(false);
  const [ checkoutCanBeUpdated, setCheckoutCanBeUpdated ] = useState(true);

  useEffect(() => {
    setCheckoutObservations(selectedCheckout?.observations || "");
  }, [ selectedCheckout ]);

  useEffect(() => {
    if (!selectedCheckout) return;

    const isPaid = selectedCheckout.CheckoutPayment.paymentStatus === "Pago";
    const isPast = selectedCheckout.date <= new Date();
    const isNotPending = selectedCheckout.checkoutStatus !== "Pendente";

    setCheckoutCanBeUpdated(!(isPaid || isPast || isNotPending));
  }, [ selectedCheckout ]);

  async function handleUpdateCheckoutObservations() {
    const response = await UpdateCheckout({
      body: {
        observations: checkoutObservations,
      },
      checkoutId: selectedCheckout!.checkoutId,
    });

    if (response.statusCode !== 200) {
      toast.warning(response.message, { style: { fontSize: "1rem" } });
      window.scroll({ top: 0 });
      return;
    }

    toast.success(response.message, { style: { fontSize: "1rem" } });

    setSelectedCheckout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        observations: checkoutObservations,
      };
    });

    queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
  }

  async function handleRemoveGearFromCheckout(
    booking: Checkout["Bookings"][number]
  ) {
    if (!selectedCheckout) return;
    if (selectedCheckout.Bookings.length < 2) return;

    const bookingId = booking.bookingId;

    const response = await RemoveBookingFromCheckout({
      checkoutId: selectedCheckout!.checkoutId,
      bookingId,
    });

    if (response.statusCode !== 200) {
      toast.warning(response.message, { style: { fontSize: "1rem" } });
      window.scroll({ top: 0 });
      return;
    }

    toast.success(response.message, { style: { fontSize: "1rem" } });

    setSelectedCheckout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        observations: checkoutObservations,
        Bookings: prev.Bookings?.filter((b) => b.bookingId !== bookingId) ?? [],
        basePrice: selectedCheckout.basePrice - booking.individualPrice,
        totalPrice:
          selectedCheckout.totalPrice -
          booking.individualPrice -
          booking.extraMachineCosts,
      };
    });

    queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
  }

  async function handleChangeCheckoutStatus(
    checkoutId: string,
    checkoutStatus: "Concluido" | "Cancelado",
    wasRefunded: boolean = false,
    cancellationFee: number | null = null
  ) {
    let response;

    if (wasRefunded && checkoutStatus === "Cancelado") {
      const payment = selectedCheckout!.CheckoutPayment;
      response = await UpdateCheckout({
        checkoutId,
        body: {
          checkoutStatus: "Cancelado",
          CheckoutPayment: {
            paymentStatus: "Reembolsado",
            paymentMode: payment.paymentMode,
            firstPaymentAmount: payment.firstPaymentAmount,
            firstPaymentDate: payment.firstPaymentDate
              ? new Date(payment.firstPaymentDate)
              : null,
            firstPaymentMethod: payment.firstPaymentMethod,
            firstPaymentStatus: payment.firstPaymentStatus,
            secondPaymentAmount: payment.secondPaymentAmount,
            secondPaymentDate: payment.secondPaymentDate
              ? new Date(payment.secondPaymentDate)
              : null,
            secondPaymentMethod: payment.secondPaymentMethod,
            secondPaymentStatus: payment.secondPaymentStatus,
          },
          cancellationFee: cancellationFee ?? undefined,
        },
      });
    } else {
      response = await UpdateCheckoutStatus({
        checkoutId,
        date: selectedCheckout!.date.toString(),
        checkoutStatus,
      });
    }

    if (response.statusCode !== 200) {
      toast.warning(
        checkoutStatus === "Cancelado"
          ? "Erro ao cancelar agendamento."
          : "Erro ao marcar agendamento como concluído.",
        { style: { fontSize: "1rem" } }
      );
    } else {
      toast.success(
        checkoutStatus === "Cancelado"
          ? "Agendamento cancelado com sucesso."
          : "Agendamento marcado como concluído.",
        { style: { fontSize: "1rem" } }
      );

      setSelectedCheckout((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          checkoutStatus,
          CheckoutPayment: wasRefunded
            ? {
              ...prev.CheckoutPayment,
              paymentStatus: "Reembolsado",
            }
            : prev.CheckoutPayment,
        };
      });

      queryClient.invalidateQueries({ queryKey: [ "get-all-goals" ] });
      queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
    }
  }

  if (!selectedCheckout) return null;

  const startDate = new Date(selectedCheckout.date);
  startDate.setHours(Math.floor(selectedCheckout.startHourInMinutes / 60));
  startDate.setMinutes(selectedCheckout.startHourInMinutes % 60);

  const endDate = new Date(startDate);
  endDate.setMinutes(
    endDate.getMinutes() + selectedCheckout.totalDurationInMinutes
  );

  return (
    <Dialog
      open={ isBookingDetailsDialogOpen }
      onOpenChange={ setBookingDetailsDialogOpen }
    >
      <DialogContent className="max-h-[95vh] w-full max-w-5xl overflow-y-auto dark:bg-gray-900 p-0 gap-0">
        {selectedCheckout && (
          <>
            {/* Header Sticked */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <DialogTitle>
                  <div className="flex items-center gap-2 text-primary">
                    <Package className="h-5 w-5" />
                    <h2 className="text-xl font-bold leading-none tracking-tight">
                      {selectedCheckout.Bookings.filter(
                        (booking) => booking.status === "ACTIVE"
                      )
                        .sort((a, b) =>
                          a.Gear.gearName.localeCompare(b.Gear.gearName)
                        )
                        .map((item) => item.Gear.gearName)
                        .join(", ")}
                    </h2>
                  </div>
                </DialogTitle>
                <span className="text-sm text-muted-foreground">
                  Agendamento em {formatDate(selectedCheckout.date)} • ID:{" "}
                  <span className="font-mono text-xs">
                    {selectedCheckout.checkoutId}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <BookingStatusBadge status={ selectedCheckout.checkoutStatus } />
                <BookingPaymentStatusBadge
                  status={ selectedCheckout.CheckoutPayment.paymentStatus }
                  isCourtesy={ selectedCheckout.isCourtesy }
                  wasRefunded={ selectedCheckout.wasRefunded }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={ () => setBookingDetailsDialogOpen(false) }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6 bg-muted/10">
              {/* Cliente */}
              <Card className="shadow-sm border-l-4 border-l-primary/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide">
                      Cliente
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex flex-col">
                    <span className="font-medium text-lg">
                      {selectedCheckout.Customer.fullname}
                    </span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                      {selectedCheckout.Customer.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {selectedCheckout.Customer.email}
                        </div>
                      )}
                      {selectedCheckout.Customer.cellphone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {selectedCheckout.Customer.cellphone}
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="block text-xs text-muted-foreground">
                        Documento
                      </span>
                      <span>
                        {selectedCheckout.Customer.documentNumber || "—"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Localização */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide">
                      Localização
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 text-sm">
                  <div className="font-medium">
                    {selectedCheckout.Address.Street.streetName},{" "}
                    {selectedCheckout.Address.buildingNumber}
                  </div>
                  <div className="text-muted-foreground">
                    {selectedCheckout.Address.Neighborhood.neighborhoodName},{" "}
                    {selectedCheckout.Address.City.cityName}
                  </div>
                  {selectedCheckout.Address.addressComplement && (
                    <div className="flex items-center gap-1 text-muted-foreground bg-muted p-2 rounded-md mt-2">
                      <CircleEllipsis className="h-3.5 w-3.5 shrink-0" />
                      <span className="italic">
                        {selectedCheckout.Address.addressComplement}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Data e Hora */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide">
                      Agendamento
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Calendar className="h-3 w-3" /> Data
                    </div>
                    <div className="font-medium">
                      {formatDate(selectedCheckout.date)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Clock className="h-3 w-3" /> Horário
                    </div>
                    <div className="font-medium">
                      {formatTime(startDate)} - {formatTime(endDate)}
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1 border-t pt-3 mt-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Clock className="h-3 w-3" /> Duração Total
                    </div>
                    <div className="font-medium">
                      {selectedCheckout.totalDurationInMinutes / 60} horas
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Funcionário & Motorista */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                        Filial
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm font-medium">
                    {selectedCheckout.SourceFilial.filialName}
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                        Funcionário responsável
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm font-medium">
                    {selectedCheckout.AccountableEmployee.fullname}
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                        Motorista
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm font-medium">
                    {selectedCheckout.driverId || (
                      <span className="text-muted-foreground italic">
                        A definir
                      </span>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Financeiro */}
              <Card className="shadow-sm border-t-4 border-t-green-500">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide">
                      Financeiro
                    </h3>
                  </div>
                  {selectedCheckout.Bookings.filter(
                    (booking) => booking.status === "ACTIVE"
                  ).length < 3 &&
                    checkoutCanBeUpdated && (
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={ () => setIsAddGearDialogOpen(true) }
                      className="flex items-center gap-1 h-7 text-xs"
                    >
                      <Package className="h-3 w-3" />
                        Add Equip.
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {/* Lista de Equipamentos e Custos Individuais */}
                  <div className="space-y-3">
                    {selectedCheckout.Bookings.sort((a, b) =>
                      a.Gear.gearName.localeCompare(b.Gear.gearName)
                    ).map((booking) => {
                      if (booking.status === "INACTIVE") return null;

                      return (
                        <div
                          key={ booking.bookingId }
                          className="bg-muted/30 p-3 rounded-md text-sm space-y-2 border"
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-semibold flex items-center gap-2">
                              <Package className="h-3.5 w-3.5 text-muted-foreground" />
                              {booking.Gear.gearName}
                            </span>
                            <span className="font-medium">
                              {centsToStringWithCurrencyMark(
                                booking.individualPrice
                              )}
                            </span>
                          </div>

                          {booking.extraMachineCosts > 0 && (
                            <div className="flex flex-col gap-0.5 text-muted-foreground text-xs pl-5 border-l-2 ml-1">
                              <span>Extras:</span>
                              <span className="font-semibold">
                                {centsToStringWithCurrencyMark(
                                  booking.extraMachineCosts
                                )}
                              </span>
                              {booking.extraMachineCostsDescription && (
                                <span className="italic opacity-80">
                                  {booking.extraMachineCostsDescription}
                                </span>
                              )}
                            </div>
                          )}

                          {checkoutCanBeUpdated && (
                            <div className="flex justify-end gap-2 pt-1">
                              <Button
                                variant="ghost"
                                size="xs"
                                className="h-6 w-6 p-0"
                                onClick={ () =>
                                  setSelectedBookingIdForExtraCosts(
                                    booking.bookingId
                                  )
                                }
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              {selectedCheckout.Bookings.filter(
                                (b) => b.status === "ACTIVE"
                              ).length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  onClick={ () =>
                                    handleRemoveGearFromCheckout(booking)
                                  }
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  {/* Custos Adicionais Gerais */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center text-muted-foreground p-1 hover:bg-muted/20 rounded">
                      <span>Preço Base</span>
                      <span>
                        {centsToStringWithCurrencyMark(
                          selectedCheckout.basePrice
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-muted-foreground p-1 hover:bg-muted/20 rounded">
                      <span className="flex items-center gap-1">
                        Combustível{" "}
                        <span className="text-xs opacity-70">
                          ({selectedCheckout.distanceInKm} km)
                        </span>
                      </span>
                      <span>
                        {centsToStringWithCurrencyMark(
                          selectedCheckout.fuelCost
                        )}
                      </span>
                    </div>

                    {(selectedCheckout.lodgingCost > 0 ||
                      selectedCheckout.foodCost > 0 ||
                      selectedCheckout.additionalTransportCost > 0) && (
                      <div className="pl-2 border-l-2 border-muted space-y-1 my-1">
                        {selectedCheckout.lodgingCost > 0 && (
                          <div className="flex justify-between items-center text-muted-foreground text-xs">
                            <span>Hospedagem</span>
                            <span>
                              {centsToStringWithCurrencyMark(
                                selectedCheckout.lodgingCost
                              )}
                            </span>
                          </div>
                        )}
                        {selectedCheckout.foodCost > 0 && (
                          <div className="flex justify-between items-center text-muted-foreground text-xs">
                            <span>Alimentação</span>
                            <span>
                              {centsToStringWithCurrencyMark(
                                selectedCheckout.foodCost
                              )}
                            </span>
                          </div>
                        )}
                        {selectedCheckout.additionalTransportCost > 0 && (
                          <div className="flex justify-between items-center text-muted-foreground text-xs">
                            <span>Outros transportes</span>
                            <span>
                              {centsToStringWithCurrencyMark(
                                selectedCheckout.additionalTransportCost
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {checkoutCanBeUpdated && (
                      <div className="flex justify-end pt-2">
                        <Button
                          variant="outline"
                          size="xs"
                          className="flex items-center gap-1 h-7"
                          onClick={ () => setAdditionalCostsDialogOpen(true) }
                        >
                          <Pencil className="h-3 w-3" /> Editar Custos Extras
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="bg-primary/5 p-4 rounded-lg flex items-center justify-between">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-primary">
                      {centsToStringWithCurrencyMark(
                        selectedCheckout.totalPrice
                      )}
                    </span>
                  </div>

                  {/* Copy Button */}
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={ () => {
                      const lines = [
                        "*Resumo do Agendamento*",
                        `Máquina: ${selectedCheckout.Bookings.map(
                          (b) => b.Gear.gearName
                        ).join(", ")}`,
                        `Data: ${new Date(
                          selectedCheckout.date
                        ).toLocaleDateString("pt-BR")}`,
                        `Horário: ${formatTime(startDate)} - ${formatTime(
                          endDate
                        )}`,
                        `Valor: ${centsToStringWithCurrencyMark(
                          selectedCheckout.totalPrice
                        )}`,
                        "(Pagamento de locação somente por pix ou transferência bancária).",
                        `Cliente: ${selectedCheckout.Customer.fullname}`,
                        `Contato: ${selectedCheckout.Customer.cellphone}`,
                        `Endereço: ${selectedCheckout.Address.Street.streetName}, ${selectedCheckout.Address.buildingNumber} - ${selectedCheckout.Address.Neighborhood.neighborhoodName}, ${selectedCheckout.Address.City.cityName}`,
                        `Estado: ${selectedCheckout.Address.State.stateName}`,
                        `CPF/CNPJ: ${
                          selectedCheckout.Customer.documentNumber || "—"
                        }`,
                        `MOTORISTA: ${
                          selectedCheckout.driverId || "A definir"
                        }`,
                      ];
                      navigator.clipboard.writeText(lines.join("\n"));
                      toast.success("Resumo copiado!");
                    } }
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copiar Resumo Curto
                  </Button>
                </CardContent>
              </Card>

              {/* Observações */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Observações
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <Textarea
                    disabled={ !checkoutCanBeUpdated }
                    placeholder="Adicione uma observação"
                    value={ checkoutObservations }
                    onChange={ (e) => setCheckoutObservations(e.target.value) }
                    className="min-h-[100px] resize-none"
                    maxLength={ 500 }
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={ () => handleUpdateCheckoutObservations() }
                      disabled={
                        checkoutObservations === selectedCheckout.observations
                      }
                    >
                      Salvar observação
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Footer Sticked */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t p-4 flex flex-col sm:flex-row gap-3 justify-end z-10">
              <Button
                variant="outline"
                onClick={ () => setIsCheckoutPaymentMethodDialogOpen(true) }
                className="sm:w-auto w-full"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Gerenciar Pagamento
              </Button>

              <Button
                onClick={ () => {
                  handleChangeCheckoutStatus(
                    selectedCheckout.checkoutId,
                    "Concluido"
                  );
                } }
                disabled={
                  selectedCheckout.checkoutStatus === "Concluido" ||
                  selectedCheckout.checkoutStatus === "Cancelado"
                }
                className="sm:w-auto w-full"
              >
                <Check className="mr-2 h-4 w-4" />
                Concluir Agendamento
              </Button>

              {selectedCheckout.checkoutStatus === "Pendente" && (
                <Button
                  variant="destructive"
                  onClick={ () => setCancelBookingConfirmationDialogOpen(true) }
                  className="sm:w-auto w-full"
                >
                  Cancelamento
                </Button>
              )}
            </div>
          </>
        )}

        {/* Dialogs Components Rendered inside content but functionally independent */}
        <CheckoutPaymentMethodDialog
          selectedCheckout={ selectedCheckout }
          setSelectedCheckout={ setSelectedCheckout }
          isCheckoutPaymentMethodDialogOpen={ isCheckoutPaymentMethodDialogOpen }
          setIsCheckoutPaymentMethodDialogOpen={
            setIsCheckoutPaymentMethodDialogOpen
          }
        />

        <CancelBookingConfirmationDialog
          handleChangeCheckoutStatus={ handleChangeCheckoutStatus }
          selectedCheckout={ selectedCheckout }
          setSelectedCheckout={ setSelectedCheckout }
          setCancelBookingConfirmationDialogOpen={
            setCancelBookingConfirmationDialogOpen
          }
          isCancelBookingConfirmationDialogOpen={
            isCancelBookingConfirmationDialogOpen
          }
        />

        <UpdateAdditionalCostsDialog
          selectedCheckout={ selectedCheckout }
          setAdditionalCostsDialogOpen={ setAdditionalCostsDialogOpen }
          isAdditionalCostsDialogOpen={ isAdditionalCostsDialogOpen }
          setSelectedCheckout={ setSelectedCheckout }
        />

        <MachineExtraCostsDialog
          setBookingDetailsDialogOpen={ setBookingDetailsDialogOpen }
          setSelectedCheckout={ setSelectedCheckout }
          selectedBookingId={ selectedBookingIdForExtraCosts }
          isMachineExtraCostsDialogOpen={ !!selectedBookingIdForExtraCosts }
          setMachineExtraCostsDialogOpen={ () =>
            setSelectedBookingIdForExtraCosts(null)
          }
        />

        <AddGearToCheckoutDialog
          selectedCheckout={ selectedCheckout }
          setSelectedCheckout={ setSelectedCheckout }
          isOpen={ isAddGearDialogOpen }
          setIsOpen={ setIsAddGearDialogOpen }
        />
      </DialogContent>
    </Dialog>
  );
}

interface CancelBookingConfirmationDialogProps {
  selectedCheckout: Checkout | null;
  setSelectedCheckout: Dispatch<SetStateAction<Checkout | null>>;
  setCancelBookingConfirmationDialogOpen: Dispatch<SetStateAction<boolean>>;
  isCancelBookingConfirmationDialogOpen: boolean;
  handleChangeCheckoutStatus: (
    checkoutId: string,
    checkoutStatus: "Concluido" | "Cancelado",
    wasRefunded?: boolean,
    cancellationFee?: number | null
  ) => void;
}

export function CancelBookingConfirmationDialog({
  selectedCheckout,
  setSelectedCheckout,
  isCancelBookingConfirmationDialogOpen,
  setCancelBookingConfirmationDialogOpen,
  handleChangeCheckoutStatus,
}: CancelBookingConfirmationDialogProps) {
  const [ wasRefunded, setWasRefunded ] = useState(false);
  const [ cancellationFee, setCancellationFee ] = useState<string>("0,00");

  if (!selectedCheckout) return null;

  const bookingDate = new Date(selectedCheckout.date);
  const today = new Date();
  const daysUntilBooking = differenceInCalendarDays(bookingDate, today);
  const hasFee = daysUntilBooking < 7;
  const somePaymentIsDone =
    selectedCheckout.CheckoutPayment.firstPaymentStatus === "Pago" ||
    selectedCheckout.CheckoutPayment.secondPaymentStatus === "Pago";

  return (
    <Dialog
      open={ isCancelBookingConfirmationDialogOpen }
      onOpenChange={ setCancelBookingConfirmationDialogOpen }
    >
      <DialogContent className="max-h-[90vh] w-[90vw] md:w-[500px] overflow-hidden dark:bg-gray-900">
        <DialogHeader className="space-y-2 text-center">
          <DialogTitle className="text-2xl font-semibold text-red-600">
            Confirmar cancelamento
          </DialogTitle>
          <DialogDescription className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            Este agendamento está previsto para acontecer{" "}
            {daysUntilBooking === 0
              ? "hoje"
              : daysUntilBooking === 1
                ? "amanhã"
                : `daqui a ${daysUntilBooking} dias`}
            . Cancelamentos realizados com{" "}
            <span className="font-semibold text-red-500">menos de 7 dias</span>{" "}
            de antecedência{" "}
            {hasFee ? (
              <>
                <span className="font-semibold">
                  geram uma taxa de cancelamento
                </span>
                . Deseja prosseguir mesmo assim?
              </>
            ) : (
              <>
                <span className="font-semibold text-green-600">
                  não geram taxa
                </span>
                . Deseja confirmar o cancelamento?
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <CardContent className="mt-6 flex flex-col items-center justify-center space-y-2">
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {(selectedCheckout.Customer?.fullname ||
              selectedCheckout.Customer?.companyName) && (
              <p>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  Cliente:
                </span>{" "}
                {selectedCheckout.Customer.fullname ||
                  selectedCheckout.Customer.companyName}
              </p>
            )}
            {selectedCheckout.date && (
              <p>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  Data do agendamento:
                </span>{" "}
                {bookingDate.toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>

          {hasFee && (
            <div className="flex flex-col gap-2 mt-4 w-full px-10">
              <Label className="text-sm font-medium">
                Taxa de cancelamento
              </Label>
              <PriceInput
                withLabel={ false }
                value={ cancellationFee }
                onChange={ (value) => setCancellationFee(value) }
              />
            </div>
          )}
        </CardContent>

        <DialogFooter className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={ () => setCancelBookingConfirmationDialogOpen(false) }
          >
            Voltar
          </Button>
          <Button
            variant={ hasFee ? "destructive" : "default" }
            onClick={ () => {
              handleChangeCheckoutStatus(
                selectedCheckout.checkoutId,
                "Cancelado",
                wasRefunded,
                parseStringToCents(cancellationFee)
              );
              setCancelBookingConfirmationDialogOpen(false);
            } }
          >
            {hasFee ? "Cancelar mesmo assim" : "Confirmar cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
