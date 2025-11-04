"use client";

import { BookingStatusBadge } from "@/components/pages/bookings/common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../common/BookingPaymentStatusBadge";
import { useAuth } from "@/contexts/auth-provider";
import { Checkout } from "@/utils/@types/checkouts";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";
import { GetAllCheckouts } from "@/services/checkouts.service";
import { BookingDetailsDialog } from "./DetailsDialog/BookingDetailsDialog";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlattenedBooking } from "./WeekView";

export function BookingsTable() {
    const { user } = useAuth();
    const [ isBookingDetailsDialogOpen, setBookingDetailsDialogOpen ] = useState(false);
    const [ selectedCheckout, setSelectedCheckout ] = useState<FlattenedBooking | null>(null);

    const queryParams: Record<string, string> =
  user
      ? user.role === "Gerente"
          ? {}
          : { filialId: user.sourceFilial.filialId }
      : {};

    const { data, isLoading } = useQuery<ApiResponse<Checkout[]>, Error>({
        queryKey: [ "get-all-checkouts", queryParams ],
        queryFn: () => GetAllCheckouts({ queryParams: queryParams || {} }),
        staleTime: 1000 * 60,
        enabled: !!user, // só executa a query quando user estiver disponível
    });

    const checkouts = data?.data;

    const isEmpty = !isLoading && (!checkouts || checkouts.length === 0);

    const openCheckoutDetails = ({ checkoutId }: { checkoutId: string }) => {
        if (!checkouts) return;

        const checkout = checkouts.find(c => c.checkoutId === checkoutId);
        if (!checkout) return;

        const startDate = new Date(checkout.date);
        startDate.setHours(Math.floor(checkout.startHourInMinutes / 60));
        startDate.setMinutes(checkout.startHourInMinutes % 60);

        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + checkout.totalDurationInMinutes);

        const flattenedSelectedBooking: FlattenedBooking = {
            checkoutId: checkout.checkoutId,
            startDate,
            endDate,
            date: checkout.date,
            startHourInMinutes: checkout.startHourInMinutes,
            totalDurationInMinutes: checkout.totalDurationInMinutes,
            observations: checkout.observations,
            customer: checkout.customer,
            sourceFilial: checkout.sourceFilial,
            checkoutStatus: checkout.checkoutStatus,
            paymentStatus: checkout.paymentStatus,
            totalPrice: checkout.totalPrice,
            address: checkout.address,
            bookings: checkout.Bookings.map((booking) => ({
                bookingId: booking.bookingId,
                extraMachineCosts: booking.extraMachineCosts,
                extraMachineCostsDescription: booking.extraMachineCostsDescription,
                individualPrice: booking.individualPrice,
                gearId: booking.gear.gearId,
                gearName: booking.gear.gearName,
            })),
            accountableEmployee: checkout.accountableEmployee,
            basePrice: checkout.basePrice,
            distanceInKm: checkout.distanceInKm,
            foodCost: checkout.foodCost,
            fuelCost: checkout.fuelCost,
            lodgingCost: checkout.lodgingCost,
            pendingValue: checkout.pendingValue,
            additionalTransportCost: checkout.additionalTransportCost,
            paymentMode: checkout.paymentMode,
            driverId: checkout.driverId,
        };

        setSelectedCheckout(flattenedSelectedBooking);
        setBookingDetailsDialogOpen(true);
    };

    return (
        <div className="border rounded-lg max-h-[70vh] lg:w-full w-[89vw] overflow-x-auto">
            <table className="w-full">
                <thead className="bg-muted">
                    <tr>
                        <th className="text-left p-3 font-medium text-sm">Cliente</th>
                        <th className="text-left p-3 font-medium text-sm">Equipamento</th>
                        <th className="text-center p-3 font-medium text-sm">Data</th>
                        <th className="text-center p-3 font-medium text-sm">Horário inicial</th>
                        <th className="text-center p-3 font-medium text-sm">Horário final</th>
                        <th className="p-3 font-medium text-center">Status</th>
                        <th className="p-3 font-medium text-center">Pagamento</th>
                        <th className="p-3 font-medium text-center">Detalhes</th>
                    </tr>
                </thead>
                <tbody>
                    {isEmpty && (
                        <tr>
                            <td className="text-center p-4" colSpan={ 8 }>
                                Nada a mostrar por aqui.
                            </td>
                        </tr>
                    )}
                    {checkouts ? checkouts?.map((checkout) => {

                        return (
                            <tr key={ checkout?.checkoutId } className="border-t hover:bg-muted/50">
                                <td className="p-3 text-sm">{checkout?.customer.fullname}</td>
                                <td className="p-3 text-sm">
                                    {checkout?.Bookings.map((b) => b.gear.gearName).join(", ")}
                                </td>
                                <td className="p-3 text-center text-sm">
                                    {new Date(checkout.date).toLocaleDateString("pt-BR")}
                                </td>
                                <td className="p-3 text-center text-sm">{minutesToHHMM(checkout.startHourInMinutes)}</td>
                                <td className="p-3 text-center text-sm">{minutesToHHMM(checkout.startHourInMinutes + checkout.totalDurationInMinutes)}</td>
                                <td className="p-3 text-center text-sm">
                                    <BookingStatusBadge status={ checkout?.checkoutStatus } />
                                </td>
                                <td className="p-3 text-center">
                                    <BookingPaymentStatusBadge status={ checkout?.paymentStatus } />
                                </td>
                                <td className="p-3 text-center">
                                    <Button onClick={ () => openCheckoutDetails({ checkoutId: checkout.checkoutId }) }>
                                        <Pencil />
                                    </Button>
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan={ 8 } className="p-4 text-center text-muted-foreground">
                                Carregando...
                            </td>
                        </tr>
                    )}

                    <BookingDetailsDialog
                        isBookingDetailsDialogOpen={ isBookingDetailsDialogOpen }
                        setBookingDetailsDialogOpen={ setBookingDetailsDialogOpen }
                        selectedCheckout={ selectedCheckout }
                        setSelectedCheckout={ setSelectedCheckout }
                    />
                </tbody>
            </table>
        </div>
    );
}

