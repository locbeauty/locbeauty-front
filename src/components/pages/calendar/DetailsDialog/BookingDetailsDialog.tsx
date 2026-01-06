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
                        cancellationFee,
                    },
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
            <DialogContent className="max-h-[90vh] w-[80vw] overflow-scroll dark:bg-gray-900">
                {selectedCheckout && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                Detalhes do Agendamento
                            </DialogTitle>
                            <DialogDescription>
                Informações completas sobre a locação do equipamento
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Cabeçalho com informações principais */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">
                                        {selectedCheckout.Bookings.filter(
                                            (booking) => booking.status === "ACTIVE"
                                        )
                                            .sort((a, b) =>
                                                a.Gear.gearName.localeCompare(b.Gear.gearName)
                                            )
                                            .map((item) => item.Gear.gearName)
                                            .join(", ")}
                                    </h3>
                                </div>
                                <div className="flex gap-2">
                                    <BookingStatusBadge
                                        status={ selectedCheckout.checkoutStatus }
                                    />
                                    <BookingPaymentStatusBadge
                                        status={ selectedCheckout.CheckoutPayment.paymentStatus }
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Informações do funcionário */}
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  FUNCIONÁRIO RESPONSÁVEL
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span>{selectedCheckout.AccountableEmployee.fullname}</span>
                                    </div>
                                    {selectedCheckout.Customer.email && (
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {selectedCheckout.AccountableEmployee.documentNumber}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />
                            {/* Informações do cliente */}
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  CLIENTE
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span>{selectedCheckout.Customer.fullname}</span>
                                    </div>
                                    {selectedCheckout.Customer.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{selectedCheckout.Customer.email}</span>
                                        </div>
                                    )}
                                    {selectedCheckout.Customer.documentNumber && (
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span>{selectedCheckout.Customer.documentNumber}</span>
                                        </div>
                                    )}
                                    {selectedCheckout.Customer.cellphone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{selectedCheckout.Customer.cellphone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Informações de local */}
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  LOCAL
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedCheckout.Address.City.cityName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {selectedCheckout.Address.Neighborhood.neighborhoodName},{" "}
                                            {selectedCheckout.Address.Street.streetName},{" "}
                                            {selectedCheckout.Address.buildingNumber}
                                        </span>
                                    </div>
                                    {selectedCheckout.Address.addressComplement && (
                                        <div className="flex items-center gap-2">
                                            <CircleEllipsis className="h-4 w-4 text-muted-foreground" />
                                            <span>{selectedCheckout.Address.addressComplement}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Informações de data e hora */}
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  DATA E HORA
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>{formatDate(selectedCheckout.date)}</span>
                                        {/* <span>{ selectedCheckout.date.toString() }</span> */}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {formatTime(startDate)} - {formatTime(endDate)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>
                      Duração: {selectedCheckout.totalDurationInMinutes / 60}{" "}
                      horas
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  MOTORISTA
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>{selectedCheckout.driverId || "A definir"}</div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            {/* Informações financeiras */}
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <h4 className="font-medium text-sm text-muted-foreground text-nowrap">
                    INFORMAÇÕES FINANCEIRAS
                                    </h4>
                                    <div className="flex w-full justify-end mb-4">
                                        {selectedCheckout.Bookings.filter(
                                            (booking) => booking.status === "ACTIVE"
                                        ).length < 3 &&
                      checkoutCanBeUpdated && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={ () => setIsAddGearDialogOpen(true) }
                                                    className="flex items-center gap-2"
                                                >
                                                    <Package className="h-4 w-4" />
                            Adicionar equipamento
                                                </Button>
                                                <AddGearToCheckoutDialog
                                                    selectedCheckout={ selectedCheckout }
                                                    setSelectedCheckout={ setSelectedCheckout }
                                                    isOpen={ isAddGearDialogOpen }
                                                    setIsOpen={ setIsAddGearDialogOpen }
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <Card>
                                    <CardContent>
                                        {/* Informações individuais de cada booking */}
                                        {selectedCheckout.Bookings.sort((a, b) =>
                                            a.Gear.gearName.localeCompare(b.Gear.gearName)
                                        ).map((booking, index, arr) => {
                                            if (booking.status === "INACTIVE") return;
                                            const isLast = index === arr.length - 1;

                                            return (
                                                <div
                                                    key={ booking.bookingId }
                                                    className={ `grid grid-cols-12 gap-2 py-2 ${
                                                        isLast ? "" : "border-b"
                                                    }` }
                                                >
                                                    <div className="flex items-center gap-2 col-span-3">
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                        <span>{booking.Gear.gearName}</span>
                                                    </div>

                                                    <div className="flex flex-col gap-2 col-span-7">
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                            <span>
                                                                <span className="font-bold">Valor:</span>{" "}
                                                                {centsToStringWithCurrencyMark(
                                                                    booking.individualPrice
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">
                                                                <span className="font-bold">
                                  Custo extra máquina:
                                                                </span>{" "}
                                                                {centsToStringWithCurrencyMark(
                                                                    booking.extraMachineCosts
                                                                )}
                                                            </span>
                                                        </div>
                                                        {booking.extraMachineCostsDescription && (
                                                            <div className="flex items-center gap-2">
                                                                <Text className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                                <span className="text-sm text-wrap">
                                                                    <span className="font-bold">Descrição:</span>{" "}
                                                                    {booking.extraMachineCostsDescription}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {checkoutCanBeUpdated && (
                                                        <div className="flex items-center justify-end col-span-2 gap-4">
                                                            <Tooltip defaultOpen={ false }>
                                                                <TooltipTrigger defaultChecked={ false } asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="xs"
                                                                        className="size-8"
                                                                        onClick={ () =>
                                                                            setSelectedBookingIdForExtraCosts(
                                                                                booking.bookingId
                                                                            )
                                                                        }
                                                                    >
                                                                        <Pencil />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Adicionar ou editar custos extras</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip defaultOpen={ false }>
                                                                <TooltipTrigger defaultChecked={ false } asChild>
                                                                    <Button
                                                                        disabled={
                                                                            selectedCheckout.Bookings.filter(
                                                                                (item) => item.status === "ACTIVE"
                                                                            ).length < 2
                                                                        }
                                                                        variant="destructive"
                                                                        size="xs"
                                                                        className="size-8"
                                                                        onClick={ () =>
                                                                            handleRemoveGearFromCheckout(booking)
                                                                        }
                                                                    >
                                                                        <X />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Remover equipamento do agendamento.</p>
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <MachineExtraCostsDialog
                                                                setBookingDetailsDialogOpen={
                                                                    setBookingDetailsDialogOpen
                                                                }
                                                                setSelectedCheckout={ setSelectedCheckout }
                                                                selectedBookingId={
                                                                    selectedBookingIdForExtraCosts
                                                                }
                                                                isMachineExtraCostsDialogOpen={
                                                                    !!selectedBookingIdForExtraCosts
                                                                }
                                                                setMachineExtraCostsDialogOpen={ () =>
                                                                    setSelectedBookingIdForExtraCosts(null)
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        <Separator className="my-6" />

                                        {/* Informações do checkout em geral */}
                                        <div className="flex flex-col gap-4 text-sm text-muted-foreground mb-4">
                                            {selectedCheckout.basePrice > 0 && (
                                                <div>
                                                    <span className="font-bold">Preço base:</span>{" "}
                                                    {centsToStringWithCurrencyMark(
                                                        selectedCheckout.basePrice
                                                    )}
                                                </div>
                                            )}
                                            {selectedCheckout.basePrice > 0 && (
                                                <div>
                                                    <span className="font-bold">Extras:</span>{" "}
                                                    {centsToStringWithCurrencyMark(
                                                        selectedCheckout.Bookings.filter(
                                                            (a) => a.status === "ACTIVE"
                                                        ).reduce(
                                                            (acc, current) => acc + current.extraMachineCosts,
                                                            0
                                                        )
                                                    )}
                                                </div>
                                            )}
                                            {selectedCheckout.distanceInKm > 0 && (
                                                <div>
                                                    <span className="font-bold">Distância (km):</span>{" "}
                                                    {selectedCheckout.distanceInKm}
                                                </div>
                                            )}
                                            {selectedCheckout.fuelCost > 0 && (
                                                <div>
                                                    <span className="font-bold">Preço combustível:</span>{" "}
                                                    {centsToStringWithCurrencyMark(
                                                        selectedCheckout.fuelCost
                                                    )}
                                                </div>
                                            )}
                                            {selectedCheckout.foodCost > 0 && (
                                                <div>
                                                    <span className="font-bold">Alimentação:</span>{" "}
                                                    {centsToStringWithCurrencyMark(
                                                        selectedCheckout.foodCost
                                                    )}
                                                </div>
                                            )}
                                            {selectedCheckout.lodgingCost > 0 && (
                                                <div>
                                                    <span className="font-bold">Hospedagem:</span>{" "}
                                                    {centsToStringWithCurrencyMark(
                                                        selectedCheckout.lodgingCost
                                                    )}
                                                </div>
                                            )}
                                            {selectedCheckout.additionalTransportCost > 0 && (
                                                <div>
                                                    <span className="font-bold">
                            Valores adicionais de transporte:
                                                    </span>{" "}
                                                    {centsToStringWithCurrencyMark(
                                                        selectedCheckout.additionalTransportCost
                                                    )}
                                                </div>
                                            )}
                                            {checkoutCanBeUpdated && (
                                                <div className="flex items-center justify-end col-span-2">
                                                    <Tooltip defaultOpen={ false }>
                                                        <TooltipTrigger defaultChecked={ false } asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="xs"
                                                                className="size-8"
                                                                onClick={ () =>
                                                                    setAdditionalCostsDialogOpen(true)
                                                                }
                                                            >
                                                                <Pencil />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Adicionar ou editar custos extras</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <UpdateAdditionalCostsDialog
                                                        selectedCheckout={ selectedCheckout }
                                                        setAdditionalCostsDialogOpen={
                                                            setAdditionalCostsDialogOpen
                                                        }
                                                        isAdditionalCostsDialogOpen={
                                                            isAdditionalCostsDialogOpen
                                                        }
                                                        setSelectedCheckout={ setSelectedCheckout }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <Separator className="my-6" />

                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2 items-center">
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    <span className="font-bold">Total do checkout: </span>
                                                    {centsToStringWithCurrencyMark(
                                                        selectedCheckout.totalPrice
                                                    )}
                                                </span>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                type="button"
                                                onClick={ () => {
                                                    if (!selectedCheckout) return;

                                                    const lines = [
                                                        `Equipamento${
                                                            selectedCheckout.Bookings.length > 1 ? "s" : ""
                                                        }: ${selectedCheckout.Bookings.map(
                                                            (item) => item.Gear.gearName
                                                        ).join(", ")}`,
                                                        `Data: ${new Date(
                                                            selectedCheckout.date
                                                        ).toLocaleDateString("pt-BR")}`,
                                                        `Horário: ${formatTime(startDate)} - ${formatTime(
                                                            endDate
                                                        )}`,
                                                        `Duração: ${
                                                            selectedCheckout.totalDurationInMinutes / 60
                                                        }h`,
                                                        `Preço total: ${centsToStringWithCurrencyMark(
                                                            selectedCheckout.totalPrice
                                                        )}`,
                                                        `Cliente: ${selectedCheckout.Customer.fullname} - ${
                                                            selectedCheckout.Customer.documentNumber ||
                              "Sem documento"
                                                        }`,
                                                        `Contato: ${
                                                            selectedCheckout.Customer.cellphone ||
                              "Sem telefone"
                                                        }`,
                                                        `Endereço: ${selectedCheckout.Address.Street.streetName}, ${selectedCheckout.Address.buildingNumber} - ${selectedCheckout.Address.Neighborhood.neighborhoodName}, ${selectedCheckout.Address.City.cityName}`,
                                                        `Motorista: ${
                                                            selectedCheckout.driverId || "A definir"
                                                        }`,
                                                        selectedCheckout.foodCost > 0 &&
                              `Alimentação: ${centsToStringWithCurrencyMark(
                                  selectedCheckout.foodCost
                              )}`,
                                                        selectedCheckout.fuelCost > 0 &&
                              `Combustível: ${centsToStringWithCurrencyMark(
                                  selectedCheckout.fuelCost
                              )}`,
                                                        selectedCheckout.lodgingCost > 0 &&
                              `Hospedagem: ${centsToStringWithCurrencyMark(
                                  selectedCheckout.lodgingCost
                              )}`,
                                                        selectedCheckout.additionalTransportCost > 0 &&
                              `Custos adicionais de transporte: ${centsToStringWithCurrencyMark(
                                  selectedCheckout.additionalTransportCost
                              )}`,
                                                        selectedCheckout.observations &&
                              selectedCheckout.observations.trim().length > 0 &&
                              `Observações: ${selectedCheckout.observations}`,
                                                    ].filter(Boolean); // remove falsy (undefined/false) linhas

                                                    const textToCopy = lines.join("\n");

                                                    navigator.clipboard.writeText(textToCopy);
                                                    toast.success(
                                                        "Resumo copiado para a área de transferência."
                                                    );
                                                } }
                                            >
                                                <Copy className="w-4 h-4 text-primary" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Observações */}
                            <Card>
                                <CardHeader>
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-muted-foreground">
                      OBSERVAÇÕES
                                        </h4>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-end gap-3">
                                        <Textarea
                                            disabled={ !checkoutCanBeUpdated }
                                            placeholder="Adicione uma observação"
                                            value={ checkoutObservations }
                                            onChange={ (e) => setCheckoutObservations(e.target.value) }
                                            className="max-h-[150px]"
                                            maxLength={ 100 }
                                        />
                                        <Button
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

                        <DialogFooter className="flex flex-row gap-3 justify-center sm:justify-center items-center w-full">
                            <Button
                                className="flex items-center justify-center cursor-pointer"
                                variant={ "outline" }
                                onClick={ () => setIsCheckoutPaymentMethodDialogOpen(true) }
                            >
                                <DollarSign className="" />
                                <span className="md:block hidden">Gerenciar pagamento</span>
                            </Button>
                            <Button
                                variant="default"
                                className="flex items-center justify-center cursor-pointer"
                                onClick={ () =>
                                    handleChangeCheckoutStatus(
                                        selectedCheckout.checkoutId,
                                        "Concluido"
                                    )
                                }
                                disabled={
                                    selectedCheckout.checkoutStatus === "Concluido" ||
                  selectedCheckout.checkoutStatus === "Cancelado" ||
                  selectedCheckout.CheckoutPayment.paymentStatus !== "Pago"
                                }
                            >
                                <Check className="" />
                                <span className="md:block hidden">Marcar como concluído</span>
                            </Button>
                            <Button
                                disabled={ selectedCheckout.checkoutStatus !== "Pendente" }
                                variant="destructive"
                                onClick={ () => setCancelBookingConfirmationDialogOpen(true) }
                                className="flex items-center justify-center cursor-pointer"
                            >
                                <Trash2 className="" />
                                <span className="md:block hidden">Cancelar Agendamento</span>
                            </Button>
                        </DialogFooter>
                    </>
                )}

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

                    {somePaymentIsDone && (
                        <div className="flex items-center space-x-2 justify-center mt-4">
                            <Checkbox
                                id="refunded"
                                checked={ wasRefunded }
                                onCheckedChange={ (checked) =>
                                    setWasRefunded(checked as boolean)
                                }
                            />
                            <Label
                                htmlFor="refunded"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                Foi reembolsado?
                            </Label>
                        </div>
                    )}

                    {hasFee && (
                        <div className="flex flex-col gap-2 mt-4 w-full px-10">
                            <Label className="text-sm font-medium">
                Taxa de cancelamento
                            </Label>
                            <PriceInput
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
