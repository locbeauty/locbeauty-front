import type { Checkout } from "@/utils/@types/checkouts";
import {
    getDayIndex,
    getWeekDays,
    groupOverlappingEvents,
    isAgendamentoInWeek,
    workingHours,
} from "./bookingViewHelpers";
import { CalendarWeekHeader } from "./CalendarWeekHeader";
import { MultipleEventBox } from "./MultipleEventBox";
import { SingleEventBox } from "./SingleEventBox";
import { MobileWeekView } from "./MobileWeekView";
import { Address } from "@/utils/@types/address";
import { CheckoutStatuses, PaymentStatuses } from "@/utils/constants";

export type FlattenedBooking = {
    checkoutId: string;
    startDate: Date;
    endDate: Date;
    date: Date;
    startHourInMinutes: number;
    totalDurationInMinutes: number;
    observations: string | null;
    basePrice: number,
    distanceInKm: number,
    foodCost: number,
    fuelCost: number,
    lodgingCost: number,
    pendingValue: number,
    additionalTransportCost: number,
    paymentMode: string,
    driverId: string,
    accountableEmployee: {
        employeeId: string,
        fullname: string,
        documentNumber: string
    },
    bookings: {
        bookingId: string;
        gearId: string;
        gearName: string;
        extraMachineCosts: number;
        extraMachineCostsDescription: string;
        individualPrice: number;
    }[];
    customer: {
        customerId: string;
        fullname: string;
        documentNumber: string;
        email: string;
        instagram: string;
        cellphone: string;
        birthdate: string;
        companyName: string;
        customerStatus: string;
        lastBooking: Date;
    };
    sourceFilial: {
        filialId: string;
        filialName: string;
    };
    address: Address;
    checkoutStatus: CheckoutStatuses;
    paymentStatus: PaymentStatuses;
    totalPrice: number;
};

interface WeekViewProps {
    currentDate: Date;
    checkouts: Checkout[];
    openCheckoutDetails: (checkout: Checkout) => void;
}

export function WeekView({ currentDate, checkouts, openCheckoutDetails }: WeekViewProps) {
    const weekDays = getWeekDays(currentDate);

    return (
        <>
            <MobileWeekView bookings={ checkouts } currentDate={ currentDate } openCheckoutDetails={ openCheckoutDetails } />
            <div className="hidden md:block min-w-full">
                <CalendarWeekHeader weekDays={ weekDays } />

                <div className="relative">
                    {workingHours.map((hour) => (
                        <div
                            key={ hour }
                            className="grid border-b h-[64px]"
                            style={ { gridTemplateColumns: "100px repeat(7, 1fr)" } }
                        >
                            <div className="p-2 border-r text-xs text-muted-foreground text-right pr-2">{`${hour}:00`}</div>
                            {weekDays.map((_, dayIndex) => (
                                <div key={ dayIndex } className="h-16 border-r relative" />
                            ))}
                        </div>
                    ))}

                    {(() => {
                        // Agrupa bookings por dia
                        const bookingsByDay: Record<number, Checkout[]> = {};
                        checkouts.forEach((checkout) => {

                            if (!isAgendamentoInWeek(checkout, weekDays)) return;
                            const dayIndex = getDayIndex(checkout.date, weekDays);
                            if (dayIndex === -1) return;

                            if (!bookingsByDay[dayIndex]) bookingsByDay[dayIndex] = [];
                            bookingsByDay[dayIndex].push(checkout);
                        });

                        return Object.entries(bookingsByDay).flatMap(([ dayIndexStr, dayBookings ]) => {
                            const dayIndex = Number(dayIndexStr);

                            // Agrupa eventos sobrepostos
                            const bookingGroups = groupOverlappingEvents(dayBookings);
                            return bookingGroups?.flatMap((group) => {
                                return (
                                    group.length === 1 ? (
                                        <SingleEventBox
                                            eventType="checkout"
                                            key={ group[0].checkoutId }
                                            dayIndex={ dayIndex }
                                            group={ group }
                                            openCheckoutDetails={ openCheckoutDetails }
                                        />
                                    ) : (
                                        <MultipleEventBox
                                            key={ group[0].checkoutId }
                                            dayIndex={ dayIndex }
                                            group={ group }
                                            openCheckoutDetails={ openCheckoutDetails }
                                        />
                                    )
                                );
                            }
                            );
                        });
                    })()}
                </div>

            </div>
        </>
    );
}
