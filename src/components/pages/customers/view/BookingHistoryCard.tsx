"use client";

import { Calendar, ChevronDown, Clock, DollarSign, FileText, Fingerprint, Loader2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useEffect, useState } from "react";
import { BookingPaymentStatusBadge } from "../../bookings/common/BookingPaymentStatusBadge";
import { BookingStatusBadge } from "../../bookings/common/BookingStatusBadge";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/utils/@types/customer";
import type { BookingWithCheckout } from "@/utils/@types/bookings";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { format } from "date-fns";
import { fetchWithToken } from "@/utils/fetchWithToken";

interface BookingHistoryCardProps {
  isCustomerDetailsModalOpen: boolean
  selectedCustomer: Customer | null
}

export function BookingHistoryCard({ isCustomerDetailsModalOpen, selectedCustomer }: BookingHistoryCardProps) {
    const BOOKINGS_PER_PAGE = 10;

    const [ visibleBookings, setVisibleBookings ] = useState(10);
    const [ isLoadingMore, setIsLoadingMore ] = useState(false);
    const [ isLoadingBookings, setIsLoadingBookings ] = useState(false);
    const [ allBookings, setAllBookings ] = useState<BookingWithCheckout[]>([]);

    const displayedBookings = allBookings?.slice(0, visibleBookings);
    const hasMoreBookings = visibleBookings < allBookings?.length;
    const remainingBookings = allBookings?.length - visibleBookings;

    useEffect(() => {
        async function GetAllCustomerBookings() {
            setIsLoadingBookings(true);
            try {
                const response = await fetchWithToken(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/bookings/customer?customerId=${selectedCustomer?.customerId}`,
                    {
                        credentials: "include",
                    },
                );

                const book = await response.json();
                setAllBookings(book.data);
            } catch (error) {
                console.error("Erro ao carregar agendamentos:", error);
                setAllBookings([]);
            } finally {
                setIsLoadingBookings(false);
            }
        }
        if (isCustomerDetailsModalOpen) {
            GetAllCustomerBookings();
            setVisibleBookings(BOOKINGS_PER_PAGE);
        }
    }, [ isCustomerDetailsModalOpen, selectedCustomer ]);

    const handleLoadMore = async () => {
        setIsLoadingMore(true);

        await new Promise((resolve) => setTimeout(resolve, 500));

        setVisibleBookings((prev) => prev + BOOKINGS_PER_PAGE);
        setIsLoadingMore(false);
    };

    const isSameCheckoutGroup = (currentIndex: number) => {
        if (currentIndex === 0) return false;
        return displayedBookings[currentIndex].checkoutId === displayedBookings[currentIndex - 1].checkoutId;
    };

    const isFirstInGroup = (currentIndex: number) => {
        if (currentIndex === 0) return true;
        return displayedBookings[currentIndex].checkoutId !== displayedBookings[currentIndex - 1].checkoutId;
    };

    const isLastInGroup = (currentIndex: number) => {
        if (currentIndex === displayedBookings?.length - 1) return true;
        return displayedBookings[currentIndex].checkoutId !== displayedBookings[currentIndex + 1].checkoutId;
    };

    return (
        <Card className="pb-0">
            <CardHeader>
                <CardTitle className="flex items-center md:flex-row md:items-center flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-5 w-5 shrink-0" />
            Histórico de Agendamentos
                        <Badge variant="secondary">{allBookings?.length}</Badge>
                    </div>
                    <div className="flex">
                        {visibleBookings < allBookings?.length && (
                            <Badge variant="outline" className="text-xs">
                Mostrando {visibleBookings} de {allBookings?.length}
                            </Badge>
                        )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {isLoadingBookings ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Carregando agendamentos...</p>
                    </div>
                ) : allBookings?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum agendamento encontrado</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayedBookings?.map((booking, index) => (
                            <div key={ booking.bookingId } className={ `relative ${isSameCheckoutGroup(index) ? "ml-6" : ""}` }>
                                {isSameCheckoutGroup(index) && (
                                    <div
                                        className="absolute left-[-12px] top-0 w-0.5 bg-border"
                                        style={ {
                                            height: isLastInGroup(index) ? "50%" : "100%",
                                        } }
                                    />
                                )}

                                {isFirstInGroup(index) &&
                  index > 0 &&
                  displayedBookings[index + 1]?.checkoutId === booking.checkoutId && (
                                    <div
                                        className="absolute left-[-12px] top-1/2 w-0.5 bg-border"
                                        style={ {
                                            height: "50%",
                                        } }
                                    />
                                )}

                                {isSameCheckoutGroup(index) && (
                                    <div className="absolute left-[-15px] top-1/2 transform -translate-y-1/2 w-3 h-3 bg-background border-2 border-border rounded-full" />
                                )}

                                <Card className="">
                                    <CardContent className="pt-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">Equipamento:</span>
                                                    <span>{booking.gear.gearName}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">Local:</span>
                                                    <span>{booking.address.City.cityName}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">Valor:</span>
                                                    <span className="font-semibold text-green-600">R$ {booking.totalPrice.toFixed(2)}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <Fingerprint className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">ID do agendamento:</span>
                                                    <p className="text-muted-foreground mt-1">{booking.bookingId}</p>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <Fingerprint className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">ID do checkout:</span>
                                                    <p
                                                        className={ `mt-1 ${isSameCheckoutGroup(index) || (!isLastInGroup(index) && displayedBookings[index + 1]?.checkoutId === booking.checkoutId) ? "text-blue-600 font-medium" : "text-muted-foreground"}` }
                                                    >
                                                        {booking.checkoutId}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-2">
                                                        <BookingPaymentStatusBadge status={ booking.paymentStatus } />
                                                        <BookingStatusBadge status={ booking.checkoutStatus } />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">Data:</span>
                                                    <span>{format(new Date(booking.date), "dd/MM/yyyy")}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">Horário:</span>
                                                    <span>
                                                        {minutesToHHMM(booking.startHourInMinutes)} -{" "}
                                                        {minutesToHHMM(booking.startHourInMinutes + booking.totalDurationInMinutes)} (
                                                        {booking.totalDurationInMinutes / 60}h)
                                                    </span>
                                                </div>

                                                <div className="text-sm">
                                                    <span className="font-medium">Endereço:</span>
                                                    <p className="text-muted-foreground mt-1">
                                                        {booking.address.Street.streetName}, {booking.address.Neighborhood.neighborhoodName} -{" "}
                                                        {booking.address.City.cityName}/{booking.address.State.UF}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {booking.observations && (
                                            <div className="mt-4 pt-4">
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
                            </div>
                        ))}

                        {hasMoreBookings && (
                            <div className="flex flex-col items-center gap-3 pt-4">
                                <div className="text-sm text-muted-foreground">
                                    {remainingBookings} agendamento
                                    {remainingBookings !== 1 ? "s" : ""} restante
                                    {remainingBookings !== 1 ? "s" : ""}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={ handleLoadMore }
                                    disabled={ isLoadingMore }
                                    className="gap-2 bg-transparent"
                                >
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