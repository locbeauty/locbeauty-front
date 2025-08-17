"use client";

import { BookingStatusBadge } from "@/components/pages/bookings/common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../common/BookingPaymentStatusBadge";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { Checkout } from "@/utils/@types/checkouts";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { fetchWithToken } from "@/utils/fetchWithToken";

export function BookingsTable() {
    const [ checkouts, setCheckouts ] = useState<Checkout[] | null>(null);

    const { user } = useAuth();

    useEffect(() => {
        async function handleGetAllCheckouts() {
            const url = new URL(`${process.env.NEXT_PUBLIC_SERVER_URL}/checkouts`);
            if(user && user?.role !== "Gerente") {
                url.searchParams.append("filialId", user?.sourceFilial.filialId);
            }

            // url.searchParams.append("startDate", new Date().toString());
            // url.searchParams.append("endDate", new Date("08-11-2025").toString());
            const response = await fetchWithToken(url, {
                credentials: "include",
            });
            const { data }: { data: Checkout[] } = await response.json();
            setCheckouts(data);
        }
        handleGetAllCheckouts();
    }, [ user ]);

    return (
        <div className="border rounded-lg max-h-[70vh] lg:w-full w-[89vw] overflow-x-auto">
            <table className="w-full">
                <thead className="bg-muted">
                    <tr>
                        <th className="text-left p-3 font-medium">Cliente</th>
                        <th className="text-left p-3 font-medium">Equipamento</th>
                        <th className="text-center p-3 font-medium">Quantidade</th>
                        <th className=" text-center p-3 font-medium">Data</th>
                        <th className=" text-center p-3 font-medium">Horário inicial</th>
                        <th className=" text-center p-3 font-medium">Horário final</th>
                        <th className="p-3 font-medium text-center">Status</th>
                        <th className="p-3 font-medium text-center">Pagamento</th>
                    </tr>
                </thead>
                <tbody>
                    {(checkouts?.length === 0) && (
                        <tr>
                            <td className="text-center p-4" colSpan={ 8 }>
          Nada a mostrar por aqui.
                            </td>
                        </tr>
                    )}
                    {checkouts ? (checkouts.map((checkout) => {
                        const bookingDates = checkout.Bookings.map((b) =>
                            new Date(b.date).toLocaleDateString("pt-BR" )
                        );
                        const startTimes = checkout.Bookings.map((b) =>
                            minutesToHHMM(b.startHourInMinutes)
                        );
                        const endTimes = checkout.Bookings.map((b) =>
                            minutesToHHMM(b.startHourInMinutes + b.totalDurationInMinutes)
                        );

                        const isSame = (arr: string[]) =>
                            arr.every((val) => val === arr[0]) ? arr[0] : arr.join(", ");

                        return (
                            <tr key={ checkout.checkoutId } className="border-t hover:bg-muted/50">
                                <td className="p-3">{checkout.customer.fullname}</td>
                                <td className="p-3">
                                    {checkout.Bookings.map((b) => b.gear.gearName).join(", ")}
                                </td>
                                <td className="p-3 text-center">
                                    {checkout.Bookings.reduce(
                                        (acc, current) => acc + current.gearAmount,
                                        0
                                    )}
                                </td>
                                <td className="p-3 text-center">{isSame(bookingDates)}</td>
                                <td className="p-3 text-center">{isSame(startTimes)}</td>
                                <td className="p-3 text-center">{isSame(endTimes)}</td>
                                <td className="p-3 text-center">
                                    <BookingStatusBadge status={ checkout.checkoutStatus } />
                                </td>
                                <td className="p-3 text-center">
                                    <BookingPaymentStatusBadge status={ checkout.paymentStatus } />
                                </td>
                            </tr>
                        );
                    })) : (
                        <tr>
                            <td
                                colSpan={ 8 }
                                className="p-4 text-center text-muted-foreground"
                            >
                  Carregando...
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
