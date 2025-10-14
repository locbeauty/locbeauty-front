// import type { Checkout } from "@/utils/@types/checkouts";
// import {
//     getDayIndex,
//     getWeekDays,
//     groupOverlappingEvents,
//     isAgendamentoInWeek,
//     workingHours,
// } from "./bookingViewHelpers";
// import { CalendarWeekHeader } from "./CalendarWeekHeader";
// import { MultipleEventBox } from "./MultipleEventBox";
// import { SingleEventBox } from "./SingleEventBox";
// import { BookingStatuses, PaymentStatuses } from "@/utils/@types/bookings";
// import { MobileWeekView } from "./MobileWeekView";
// import { Address } from "@/utils/@types/address";

// export type FlattenedBooking = {
//   id: string
//   startDate: Date
//   endDate: Date
//   checkoutId: string
//   bookingId: string
//   date: Date
//   gearAmount: number
//   startHourInMinutes: number
//   totalDurationInMinutes: number
//   price: number
//   observations: string | null
//   gear: {
//     gearId: string
//     gearName: string
//   }
//   customer: {
//     customerId: string
//     fullname: string
//     documentNumber: string
//     email: string,
//     instagram: string,
//     cellphone: string,
//     birthdate: string,
//     companyName: string,
//     customerStatus: string,
//     lastBooking: Date,
//   }
//   sourceFilial: {
//     filialId: string
//     description: string
//   }
//   address: Address
//   bookingStatus: BookingStatuses
//   paymentStatus: PaymentStatuses
//   totalPrice: number
// }

// interface WeekViewProps {
//   currentDate: Date
//   checkouts: Checkout[]
//   openBookingDetails: (booking: FlattenedBooking) => void
// }

// export function WeekView({ currentDate, checkouts, openBookingDetails }: WeekViewProps) {
//     // Generate week days from current date
//     const weekDays = getWeekDays(currentDate);

//     // Flatten bookings from checkouts
//     const flattenedBookings: FlattenedBooking[] = checkouts?.flatMap((checkout) =>
//         checkout.Bookings.map((booking) => {
//             // Convert startHourInMinutes to actual start and end dates
//             const startDate = new Date(booking.date);
//             startDate.setHours(Math.floor(booking.startHourInMinutes / 60));
//             startDate.setMinutes(booking.startHourInMinutes % 60);

//             const endDate = new Date(startDate);
//             endDate.setMinutes(endDate.getMinutes() + booking.totalDurationInMinutes);

//             return {
//                 id: booking.bookingId,
//                 startDate,
//                 endDate,
//                 checkoutId: checkout.checkoutId,
//                 bookingId: booking.bookingId,
//                 date: booking.date,
//                 gearAmount: booking.gearAmount,
//                 startHourInMinutes: booking.startHourInMinutes,
//                 totalDurationInMinutes: booking.totalDurationInMinutes,
//                 price: booking.price / 100,
//                 observations: booking.observations,
//                 gear: booking.gear,
//                 customer: checkout.customer,
//                 sourceFilial: checkout.sourceFilial,
//                 bookingStatus: booking.bookingStatus,
//                 paymentStatus: checkout.paymentStatus,
//                 totalPrice: checkout.totalPrice / 100,
//                 address: checkout.address
//             };
//         }),
//     );

//     return (
//         <>
//             <MobileWeekView bookings={ checkouts } currentDate={ currentDate } openBookingDetails={ openBookingDetails } />
//             <div className="hidden md:block min-w-full">
//                 {/* Header with week days */}
//                 <CalendarWeekHeader weekDays={ weekDays } />

//                 {/* Time grid */}
//                 <div className="relative">
//                     {/* Hour lines */}
//                     {workingHours.map((hour) => (
//                         <div key={ hour } className="grid border-b h-[64px]" style={ { gridTemplateColumns: "100px repeat(7, 1fr)" } }>
//                             <div className="p-2 border-r text-xs text-muted-foreground text-right pr-2">{`${hour}:00`}</div>
//                             {weekDays.map((_, dayIndex) => (
//                                 <div key={ dayIndex } className="h-16 border-r relative" />
//                             ))}
//                         </div>
//                     ))}

//                     {/* Bookings */}
//                     {(() => {
//                     // Group bookings by day
//                         const bookingsByDay: Record<number, FlattenedBooking[]> = {};

//                         flattenedBookings?.forEach((booking) => {
//                             if (!isAgendamentoInWeek(booking, weekDays)) return;

//                             const dayIndex = getDayIndex(booking.startDate, weekDays);
//                             if (dayIndex === -1) return;

//                             if (!bookingsByDay[dayIndex]) {
//                                 bookingsByDay[dayIndex] = [];
//                             }
//                             bookingsByDay[dayIndex].push(booking);
//                         });

//                         // Render bookings for each day
//                         return Object.entries(bookingsByDay).flatMap(([ dayIndexStr, dayBookings ]) => {
//                             const dayIndex = Number.parseInt(dayIndexStr);

//                             // Group overlapping bookings for this day
//                             const bookingGroups = groupOverlappingEvents(dayBookings);

//                             return bookingGroups.flatMap((group) => {
//                             // When there is only one booking starting at the time, show it with full event box width
//                                 if (group.length === 1) {
//                                     return (
//                                         <SingleEventBox
//                                             key={ group[0].bookingId }
//                                             dayIndex={ dayIndex }
//                                             group={ group }
//                                             openBookingDetails={ openBookingDetails }
//                                         />
//                                     );
//                                 } else {
//                                 // When there is more than one booking starting in the same time, show them side by side
//                                     return (
//                                         <MultipleEventBox
//                                             key={ group[0].bookingId }
//                                             dayIndex={ dayIndex }
//                                             group={ group }
//                                             openBookingDetails={ openBookingDetails }
//                                         />
//                                     );
//                                 }
//                             });
//                         });
//                     })()}
//                 </div>
//             </div>
//         </>
//     );
// }

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
import { CheckoutStatuses, PaymentStatuses } from "@/utils/@types/bookings";
import { MobileWeekView } from "./MobileWeekView";
import { Address } from "@/utils/@types/address";

export type FlattenedBooking = {
    id: string;
    startDate: Date;
    endDate: Date;
    checkoutId: string;
    bookingId: string;
    date: Date;
    gearAmount: number;
    startHourInMinutes: number;
    totalDurationInMinutes: number;
    price: number;
    observations: string | null;
    gear: {
        gearId: string;
        gearName: string;
    };
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
        description: string;
    };
    address: Address;
    bookingStatus: CheckoutStatuses;
    paymentStatus: PaymentStatuses;
    totalPrice: number;
};

interface WeekViewProps {
    currentDate: Date;
    checkouts: Checkout[];
    openBookingDetails: (booking: FlattenedBooking) => void;
}

export function WeekView({ currentDate, checkouts, openBookingDetails }: WeekViewProps) {
    const weekDays = getWeekDays(currentDate);

    const flattenedBookings: FlattenedBooking[] = checkouts.flatMap((checkout) =>
        checkout.Bookings.map((booking) => {
            const startDate = new Date(checkout.date);
            startDate.setHours(Math.floor(checkout.startHourInMinutes / 60));
            startDate.setMinutes(checkout.startHourInMinutes % 60);

            const endDate = new Date(startDate);
            endDate.setMinutes(endDate.getMinutes() + checkout.totalDurationInMinutes);

            return {
                id: booking.bookingId,
                startDate,
                endDate,
                checkoutId: checkout.checkoutId,
                bookingId: booking.bookingId,
                date: checkout.date,
                gearAmount: 1, // cada booking é uma gear
                startHourInMinutes: checkout.startHourInMinutes,
                totalDurationInMinutes: checkout.totalDurationInMinutes,
                price: checkout.totalPrice / 100,
                observations: checkout.observations,
                gear: booking.gear,
                customer: checkout.customer,
                sourceFilial: checkout.sourceFilial,
                bookingStatus: checkout.checkoutStatus,
                paymentStatus: checkout.paymentStatus,
                totalPrice: checkout.totalPrice / 100,
                address: checkout.address,
            };
        })
    );

    return (
        <>
            <MobileWeekView bookings={ checkouts } currentDate={ currentDate } openBookingDetails={ openBookingDetails } />
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
                        const bookingsByDay: Record<number, FlattenedBooking[]> = {};

                        flattenedBookings.forEach((booking) => {
                            if (!isAgendamentoInWeek(booking, weekDays)) return;

                            const dayIndex = getDayIndex(booking.startDate, weekDays);
                            if (dayIndex === -1) return;

                            if (!bookingsByDay[dayIndex]) bookingsByDay[dayIndex] = [];
                            bookingsByDay[dayIndex].push(booking);
                        });

                        return Object.entries(bookingsByDay).flatMap(([ dayIndexStr, dayBookings ]) => {
                            const dayIndex = Number(dayIndexStr);
                            const bookingGroups = groupOverlappingEvents(dayBookings);

                            return bookingGroups.flatMap((group) =>
                                group.length === 1 ? (
                                    <SingleEventBox
                                        key={ group[0].bookingId }
                                        dayIndex={ dayIndex }
                                        group={ group }
                                        openBookingDetails={ openBookingDetails }
                                    />
                                ) : (
                                    <MultipleEventBox
                                        key={ group[0].bookingId }
                                        dayIndex={ dayIndex }
                                        group={ group }
                                        openBookingDetails={ openBookingDetails }
                                    />
                                )
                            );
                        });
                    })()}
                </div>
            </div>
        </>
    );
}
