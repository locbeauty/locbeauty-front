"use client";

import { BookingStatusBadge } from "@/components/pages/bookings/common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../common/BookingPaymentStatusBadge";
import { useAuth } from "@/contexts/auth-provider";
import { Checkout } from "@/utils/@types/checkouts";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { useQuery } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api";
import { GetAllCheckouts } from "@/services/checkouts.service";

export function BookingsTable() {
    const { user } = useAuth();

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
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan={ 8 } className="p-4 text-center text-muted-foreground">
                                Carregando...
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

