import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    Clock,
    MapPin,
    DollarSign,
    User,
    Calendar,
    ClipboardList,
    Package,
    Building,
    Phone,
    Mail,
    Edit,
    Trash2,
    CircleEllipsis,
    Wrench,
    Plus,
    Text,
    Coins,
    CoinsIcon,
    ContrastIcon,
    FileText,
    Pencil,
} from "lucide-react";
import Link from "next/link";
import {
    formatCurrency,
    formatDate,
    formatTime,
} from "@/components/pages/bookings/view/bookingViewHelpers";
import { BookingStatusBadge } from "@/components/pages/bookings/common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../../common/BookingPaymentStatusBadge";
import { FlattenedBooking } from "../WeekView";
import { toast } from "sonner";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { MachineExtraCostsDialog } from "../MachineExtraCostsDialog/MachineExtraCostsDialog";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Booking } from "@/utils/@types/bookings";
import { GetBookingById } from "@/services/bookings.service";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { centsToString } from "@/utils/centsToString";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkout } from "@/utils/@types/checkouts";

interface BookingDetailsDialogProps {
  setBookingDetailsDialogOpen: Dispatch<SetStateAction<boolean>>;
  isBookingDetailsDialogOpen: boolean;
  selectedCheckout: Checkout | null;
  setSelectedCheckout: Dispatch<SetStateAction<Checkout | null>>
}

export function BookingDetailsDialog({
    isBookingDetailsDialogOpen,
    setBookingDetailsDialogOpen,
    selectedCheckout,
    setSelectedCheckout
}: BookingDetailsDialogProps) {

    const [ selectedBookingIdForExtraCosts, setSelectedBookingIdForExtraCosts ] = useState<string | null>(null);

    async function handleMarkAsConcluded(bookingId: string) {
        const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_SERVER_URL}/bookings/config/concluded?bookingId=${bookingId}&date=${selectedCheckout?.date.toString()}`, { credentials: "include" });

        if(!response.ok) {
            toast.warning("Erro ao marcar agendamento como concluído.", { style: { fontSize: "1rem" } });
        } else {
            toast.success("Agendamento marcado como concluído!", { style: { fontSize: "1rem" } });
            setBookingDetailsDialogOpen(false);
        }
    }
    if(!selectedCheckout) return null;

    const startDate = new Date(selectedCheckout.date);
    startDate.setHours(Math.floor(selectedCheckout.startHourInMinutes / 60));
    startDate.setMinutes(selectedCheckout.startHourInMinutes % 60);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + selectedCheckout.totalDurationInMinutes);

    return (
        <Dialog
            open={ isBookingDetailsDialogOpen }
            onOpenChange={ setBookingDetailsDialogOpen }
        >
            <DialogContent className="max-h-[90vh] w-[90vw] md:w-[600px] overflow-scroll dark:bg-gray-900">
                { selectedCheckout && (
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
                            { /* Cabeçalho com informações principais */ }
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">
                                        {selectedCheckout.Bookings.sort((a, b) => a.gear.gearName.localeCompare(b.gear.gearName)).map(item => item.gear.gearName).join(", ")}
                                    </h3>
                                </div>
                                <div className="flex gap-2">
                                    <BookingStatusBadge
                                        status={ selectedCheckout.checkoutStatus }
                                    />
                                    <BookingPaymentStatusBadge
                                        status={ selectedCheckout.paymentStatus }
                                    />
                                </div>
                            </div>

                            <Separator />

                            { /* Informações do funcionário */ }
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  FUNCIONÁRIO RESPONSÁVEL
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span>{ selectedCheckout.accountableEmployee.fullname }</span>
                                    </div>
                                    { selectedCheckout.customer.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{ selectedCheckout.accountableEmployee.documentNumber }</span>
                                        </div>
                                    ) }
                                </div>
                            </div>

                            <Separator />
                            { /* Informações do cliente */ }
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  CLIENTE
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span>{ selectedCheckout.customer.fullname }</span>
                                    </div>
                                    { selectedCheckout.customer.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{ selectedCheckout.customer.email }</span>
                                        </div>
                                    ) }
                                    { selectedCheckout.customer.documentNumber && (
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span>{ selectedCheckout.customer.documentNumber }</span>
                                        </div>
                                    ) }
                                    { selectedCheckout.customer.cellphone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{ selectedCheckout.customer.cellphone }</span>
                                        </div>
                                    ) }
                                </div>
                            </div>

                            <Separator />

                            { /* Informações de local */ }
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  LOCAL
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span>{ selectedCheckout.address.city.cityName }</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {selectedCheckout.address.neighborhood.neighborhoodName},{" "}
                                            {selectedCheckout.address.street.streetName},{" "}
                                            {selectedCheckout.address.buildingNumber}
                                        </span>
                                    </div>
                                    {
                                        selectedCheckout.address.addressComplement && (
                                            <div className="flex items-center gap-2">
                                                <CircleEllipsis className="h-4 w-4 text-muted-foreground" />
                                                <span>{ selectedCheckout.address.addressComplement }</span>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>

                            <Separator />

                            { /* Informações de data e hora */ }
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  DATA E HORA
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>{ formatDate(selectedCheckout.date) }</span>
                                        {/* <span>{ selectedCheckout.date.toString() }</span> */}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            { formatTime(startDate) } -{ " " }
                                            { formatTime(endDate) }
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>
                      Duração: { selectedCheckout.totalDurationInMinutes / 60 } horas
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            { /* Informações financeiras */ }
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
        INFORMAÇÕES FINANCEIRAS
                                </h4>
                                <Card>
                                    <CardContent>
                                        { /* Informações individuais de cada booking */ }
                                        {selectedCheckout.Bookings
                                            .sort((a, b) => a.gear.gearName.localeCompare(b.gear.gearName))
                                            .map((booking, index, arr) => {
                                                const isLast = index === arr.length - 1;
                                                return (
                                                    <div
                                                        key={ booking.bookingId }
                                                        className={ `grid grid-cols-12 gap-2 py-2 ${isLast ? "" : "border-b"}` }
                                                    >
                                                        <div className="flex items-center gap-2 col-span-3">
                                                            <Package className="h-4 w-4 text-muted-foreground" />
                                                            <span>{booking.gear.gearName}</span>
                                                        </div>

                                                        <div className="flex flex-col gap-2 col-span-7">
                                                            <div className="flex items-center gap-2">
                                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                                <span><span className="font-bold">Valor:</span> {centsToString(booking.individualPrice)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm"><span className="font-bold">Custo extra máquina:</span> {centsToString(booking.extraMachineCosts)}</span>
                                                            </div>
                                                            {booking.extraMachineCostsDescription && (
                                                                <div className="flex items-center gap-2">
                                                                    <Text className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                                    <span className="text-sm text-wrap"><span className="font-bold">Descrição:</span> {booking.extraMachineCostsDescription}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-end col-span-2">
                                                            <Tooltip defaultOpen={ false }>
                                                                <TooltipTrigger defaultChecked={ false } asChild>
                                                                    <Button variant="outline" size="xs" className="size-8" onClick={ () => setSelectedBookingIdForExtraCosts(booking.bookingId) }>
                                                                        <Pencil />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Adicionar ou editar custos extras</p>
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <MachineExtraCostsDialog
                                                                setBookingDetailsDialogOpen={ setBookingDetailsDialogOpen }
                                                                setSelectedCheckout={ setSelectedCheckout }
                                                                selectedBookingId={ selectedBookingIdForExtraCosts }
                                                                isMachineExtraCostsDialogOpen={ !!selectedBookingIdForExtraCosts }
                                                                setMachineExtraCostsDialogOpen={ () => setSelectedBookingIdForExtraCosts(null) }
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                        <Separator className="my-6" />

                                        { /* Informações do checkout em geral */ }
                                        <div className="flex flex-col gap-4 text-sm text-muted-foreground mb-4">
                                            {selectedCheckout.basePrice > 0 && (
                                                <div><span className="font-bold">Preço base:</span> {centsToString(selectedCheckout.basePrice)}</div>
                                            )}
                                            {selectedCheckout.distanceInKm > 0 && (
                                                <div><span className="font-bold">Distância (km):</span> {selectedCheckout.distanceInKm}</div>
                                            )}
                                            {selectedCheckout.fuelCost > 0 && (
                                                <div><span className="font-bold">Preço combustível:</span> {centsToString(selectedCheckout.fuelCost)}</div>
                                            )}
                                            {selectedCheckout.foodCost > 0 && (
                                                <div><span className="font-bold">Alimentação:</span> {centsToString(selectedCheckout.foodCost)}</div>
                                            )}
                                            {selectedCheckout.lodgingCost > 0 && (
                                                <div><span className="font-bold">Hospedagem:</span> {centsToString(selectedCheckout.lodgingCost)}</div>
                                            )}
                                            {selectedCheckout.pendingValue > 0 && (
                                                <div><span className="font-bold">Valor pendente:</span> {centsToString(selectedCheckout.pendingValue)}</div>
                                            )}
                                            {selectedCheckout.additionalTransportCost > 0 && (
                                                <div><span className="font-bold">Valores adicionais de transporte:</span> {centsToString(selectedCheckout.additionalTransportCost)}</div>
                                            )}
                                            {selectedCheckout.paymentMode && (
                                                <div><span className="font-bold">Modo de pagamento:</span> {selectedCheckout.paymentMode}</div>
                                            )}
                                            {/* {selectedCheckout.driverId && ( */}
                                            <div><span className="font-bold">Motorista:</span> {selectedCheckout.driverId || "A definir"}</div>
                                            {/* )} */}
                                        </div>
                                        <Separator className="my-6" />

                                        <div className="flex items-center gap-2 mt-2">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            <span><span className="font-bold">Total do checkout: </span>{centsToString(selectedCheckout.totalPrice)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            { /* Observações */ }
                            { selectedCheckout.observations && (
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-muted-foreground">
                    OBSERVAÇÕES
                                    </h4>
                                    <div className="bg-muted/30 p-3 rounded-md">
                                        <div className="flex items-center gap-2">
                                            <ClipboardList className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                            <span>{ selectedCheckout.observations }</span>
                                        </div>
                                    </div>
                                </div>
                            ) }
                        </div>

                        <DialogFooter className="flex flex-row gap-3 justify-center sm:justify-center items-center w-full">
                            <Button variant="outline" className="" asChild>
                                <Link
                                    href={ `/dashboard/agendamentos/editar/${selectedCheckout.checkoutId}` }
                                >
                                    <Edit className="" />
                  Editar
                                </Link>
                            </Button>
                            <Button
                                variant="default"
                                className="flex items-center justify-center cursor-pointer"
                                // onClick={ () => handleMarkAsConcluded() }
                                disabled={ selectedCheckout.checkoutStatus === "Concluido" }
                            >
                                <Trash2 className="" />
                                <span className="md:block hidden">Marcar como concluído</span>
                            </Button>
                            <Button
                                disabled={ selectedCheckout.checkoutStatus === "Concluido" }
                                variant="destructive"
                                className="flex items-center justify-center cursor-pointer"
                            >
                                <Trash2 className="" />
                                <span className="md:block hidden">Cancelar Agendamento</span>
                            </Button>
                        </DialogFooter>
                    </>
                ) }
            </DialogContent>
        </Dialog>
    );
}