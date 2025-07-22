"use client";

import { BookingStatusBadge } from "@/components/pages/bookings/common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../common/BookingPaymentStatusBadge";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { CheckoutWithRelations } from "@/utils/@types/checkouts";
import { minutesToHHMM } from "@/utils/minutesToHHMM";

export function BookingsTable() {
    const [ checkouts, setCheckouts ] = useState<CheckoutWithRelations[] | null>(null);

    const { user } = useAuth();

    useEffect(() => {
        async function handleGetAllCustomers() {
            // const filialIdIfUserIsNotManager = user?.role === "Gerente" ? undefined : user?.sourceFilial.filialId;
            const url = new URL("http://localhost:3333/api/checkouts/all");
            if(user?.role === "Gerente") {
                url.searchParams.append("filialId", user?.sourceFilial.filialId);
            }
            const response = await fetch(url, {
                credentials: "include",
            });
            const { data }: { data: CheckoutWithRelations[] } = await response.json();
            setCheckouts(data);
        }
        handleGetAllCustomers();
    }, [ user?.sourceFilial.filialId, user?.role ]);

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
                    {checkouts?.map((checkout) => {
                        const bookingDates = checkout.Bookings.map((b) =>
                            new Date(b.date).toLocaleDateString("pt-BR" )
                        );
                        const startTimes = checkout.Bookings.map((b) =>
                            minutesToHHMM(b.startHourInMinutes)
                        );
                        const endTimes = checkout.Bookings.map((b) =>
                            minutesToHHMM(b.startHourInMinutes + b.totalDuration)
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
                                    <BookingStatusBadge status={ checkout.bookingStatus } />
                                </td>
                                <td className="p-3 text-center">
                                    <BookingPaymentStatusBadge status={ checkout.paymentStatus } />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
