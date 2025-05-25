import { Dispatch, SetStateAction } from "react";

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
} from "lucide-react";
import Link from "next/link";
import {
    formatCurrency,
    formatDate,
    formatTime,
} from "@/components/pages/bookings/view/bookingViewHelpers";
import { BookingStatusBadge } from "@/components/pages/bookings/common/BookingStatusBadge";
import { Agendamento } from "@/app/(main)/bookings/page";
import { BookingPaymentStatusBadge } from "../../common/BookingPaymentStatusBadge";

interface BookingDetailsDialogProps {
  setBookingDetailsDialogOpen: Dispatch<SetStateAction<boolean>>;
  isBookingDetailsDialogOpen: boolean;
  selectedAgendamento: Agendamento | null;
}

export function BookingDetailsDialog({
    isBookingDetailsDialogOpen,
    setBookingDetailsDialogOpen,
    selectedAgendamento,
}: BookingDetailsDialogProps) {
    return (
        <Dialog
            open={ isBookingDetailsDialogOpen }
            onOpenChange={ setBookingDetailsDialogOpen }
        >
            <DialogContent className="max-h-[90vh] w-[90vw] md:w-[600px] overflow-scroll dark:bg-gray-900">
                { selectedAgendamento && (
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
                                        { selectedAgendamento.gear }
                                    </h3>
                                </div>
                                <div className="flex gap-2">
                                    <BookingStatusBadge
                                        status={ selectedAgendamento.bookingStatus }
                                    />
                                    <BookingPaymentStatusBadge
                                        status={ selectedAgendamento.paymentStatus }
                                    />
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
                                        <span>{ selectedAgendamento.customer }</span>
                                    </div>
                                    { selectedAgendamento.customerEmail && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{ selectedAgendamento.customerEmail }</span>
                                        </div>
                                    ) }
                                    { selectedAgendamento.customerCellphone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{ selectedAgendamento.customerCellphone }</span>
                                        </div>
                                    ) }
                                </div>
                            </div>

                            { /* Informações de local */ }
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  LOCAL
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span>{ selectedAgendamento.city }</span>
                                    </div>
                                    { selectedAgendamento.address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{ selectedAgendamento.address }</span>
                                        </div>
                                    ) }
                                </div>
                            </div>

                            { /* Informações de data e hora */ }
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  DATA E HORA
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>{ formatDate(selectedAgendamento.startDate) }</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            { formatTime(selectedAgendamento.startDate) } -{ " " }
                                            { formatTime(selectedAgendamento.endDate) }
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>
                      Duração: { selectedAgendamento.totalDuration } horas
                                        </span>
                                    </div>
                                </div>
                            </div>

                            { /* Informações financeiras */ }
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  INFORMAÇÕES FINANCEIRAS
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span>
                      Valor: { formatCurrency(selectedAgendamento.price) }
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span>
                      Valor por hora:{ " " }
                                            { formatCurrency(
                                                selectedAgendamento.price /
                          selectedAgendamento.totalDuration
                                            ) }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            { /* Observações */ }
                            { selectedAgendamento.observations && (
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-muted-foreground">
                    OBSERVAÇÕES
                                    </h4>
                                    <div className="bg-muted/30 p-3 rounded-md">
                                        <div className="flex items-center gap-2">
                                            <ClipboardList className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                            <span>{ selectedAgendamento.observations }</span>
                                        </div>
                                    </div>
                                </div>
                            ) }
                        </div>

                        <DialogFooter className="flex flex-row gap-3 justify-center sm:justify-center items-center w-full">
                            <Button variant="outline" className="" asChild>
                                <Link
                                    href={ `/dashboard/agendamentos/editar/${selectedAgendamento.id}` }
                                >
                                    <Edit className="" />
                  Editar
                                </Link>
                            </Button>
                            <Button
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
