import { Calendar, ChevronDown, Clock, DollarSign, FileText, Loader2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { bookings } from "@/utils/mocks/bookings";
import { useEffect, useState } from "react";
import { BookingPaymentStatusBadge } from "../../bookings/common/BookingPaymentStatusBadge";
import { BookingStatusBadge } from "../../bookings/common/BookingStatusBadge";
import { Button } from "@/components/ui/button";
import { Customer } from "@/utils/mocks/customers";

interface BookingHistoryCardProps {
    isCustomerDetailsModalOpen: boolean,
    selectedCustomer: Customer | null
}

export function BookingHistoryCard({ isCustomerDetailsModalOpen, selectedCustomer }: BookingHistoryCardProps) {

    const BOOKINGS_PER_PAGE = 10;

    const [ visibleBookings, setVisibleBookings ] = useState(10);
    const [ isLoadingMore, setIsLoadingMore ] = useState(false);

    const displayedBookings = bookings.slice(0, visibleBookings);
    const hasMoreBookings = visibleBookings < bookings.length;
    const remainingBookings = bookings.length - visibleBookings;

    useEffect(() => {
        if (isCustomerDetailsModalOpen) {
            setVisibleBookings(BOOKINGS_PER_PAGE);
        }
    }, [ isCustomerDetailsModalOpen, selectedCustomer ]);

    const handleLoadMore = async () => {
        setIsLoadingMore(true);

        await new Promise((resolve) => setTimeout(resolve, 500));

        setVisibleBookings((prev) => prev + BOOKINGS_PER_PAGE);
        setIsLoadingMore(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center md:flex-row md:items-center flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-5 w-5 shrink-0" />
                        Histórico de Agendamentos
                        <Badge variant="secondary">{bookings.length}</Badge>
                    </div>
                    <div className="flex">
                        {visibleBookings < bookings.length && (
                            <Badge variant="outline" className="text-xs">
                    Mostrando {visibleBookings} de {bookings.length}
                            </Badge>
                        )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {bookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum agendamento encontrado</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayedBookings.map((booking) => (
                            <Card key={ booking.id } className="">
                                <CardContent className="pt-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-lg">#{booking.id}</h4>
                                                <div className="flex gap-2">
                                                    <BookingPaymentStatusBadge status={ booking.paymentStatus } />
                                                    <BookingStatusBadge status={ booking.bookingStatus } />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">Equipamento:</span>
                                                <span>{booking.gear}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">Local:</span>
                                                <span>{booking.city}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">Valor:</span>
                                                <span className="font-semibold text-green-600">R$ {booking.price.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">Início:</span>
                                                <span>{booking.startDate.toLocaleString()}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">Fim:</span>
                                                <span>{booking.endDate.toLocaleString()}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">Duração:</span>
                                                <span>{booking.totalDuration}h</span>
                                            </div>

                                            <div className="text-sm">
                                                <span className="font-medium">Endereço:</span>
                                                <p className="text-muted-foreground mt-1">{booking.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {booking.observations && (
                                        <div className="mt-4 pt-4 border-t">
                                            <div className="flex items-start gap-2 text-sm">
                                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <span className="font-medium">Observações:</span>
                                                    <p className="text-muted-foreground mt-1">{booking.observations}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {/* Botão Carregar Mais */}
                        {hasMoreBookings && (
                            <div className="flex flex-col items-center gap-3 pt-4">
                                <div className="text-sm text-muted-foreground">
                                    {remainingBookings} agendamento{remainingBookings !== 1 ? "s" : ""} restante
                                    {remainingBookings !== 1 ? "s" : ""}
                                </div>
                                <Button variant="outline" onClick={ handleLoadMore } disabled={ isLoadingMore } className="gap-2">
                                    {isLoadingMore ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                            Carregando...
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-4 w-4" />
                            Carregar mais {Math.min(BOOKINGS_PER_PAGE, remainingBookings)} agendamentos
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}