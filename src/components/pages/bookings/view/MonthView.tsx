// import { cn } from "@/lib/utils";
// import {
//     formatTime,
//     getMonthDays,
//     isSameDay,
//     isToday,
// } from "./bookingViewHelpers";
// import { CalendarMonthHeader } from "./CalendarMonthHeader";
// import { Booking } from "@/utils/@types/bookings";

// interface MonthViewProps {
//   currentDate: Date;
//   bookings: Booking[];
//   openBookingDetails: (_agendamento: Booking) => void;
// }

// export function MonthView({
//     currentDate,
//     bookings,
//     openBookingDetails,
// }: MonthViewProps) {

//     const daysInCurrentMonth = getMonthDays(currentDate);
//     return (
//         <div className="hidden md:block min-w-full">
//             <CalendarMonthHeader />

//             { /* Grade do mês */ }
//             <div className="grid grid-cols-7">
//                 { daysInCurrentMonth.map((day, index) => {
//                     // Filtrar agendamentos para este dia
//                     const dayBookings = bookings.filter((booking) =>
//                         isSameDay(booking.startDate, day)
//                     );

//                     // Verificar se é do mês atual ou não
//                     const isCurrentMonth = day.getMonth() === currentDate.getMonth();

//                     return (
//                         <div
//                             key={ index }
//                             className={ cn(
//                                 "min-h-[120px] border-r border-b p-1 relative max-h-[100px]",
//                                 dayBookings.length > 3 && "overflow-y-scroll",
//                                 isToday(day) ? "bg-primary/5" : "",
//                                 !isCurrentMonth ? "bg-gray-100 text-red-300" : ""
//                             ) }
//                         >
//                             <div
//                                 className={ cn(
//                                     "text-right p-1 font-medium text-sm",
//                                     isToday(day) ? "text-primary" : ""
//                                 ) }
//                             >
//                                 { day.getDate() }
//                             </div>

//                             <div className="space-y-1 mt-1">
//                                 { dayBookings
//                                     .sort(
//                                         (item1, item2) =>
//                                             item1.startDate.getHours() - item2.startDate.getHours()
//                                     )
//                                     .map((booking) => {
//                                         return (
//                                             <div
//                                                 key={ booking.id }
//                                                 className={ cn(
//                                                     "text-xs p-1 rounded border-l-2 cursor-pointer truncate",
//                                                     // Default colors for bookings with durations different than 4, 6 and 8-12 hours
//                                                     "bg-unknown-duration-background text-unknown-duration-text border-unknown-duration-border",
//                                                     // Colors for 4h bookings duration
//                                                     booking.totalDuration === 4 &&
//                             "bg-4h-duration-background text-4h-duration-text border-4h-duration-border",
//                                                     // Colors for 6h bookings duration
//                                                     booking.totalDuration === 6 &&
//                             "bg-6h-duration-background text-6h-duration-text border-6h-duration-border",
//                                                     // Colors for 8 to 12 hours bookings duration
//                                                     booking.totalDuration >= 8 &&
//                             booking.totalDuration <= 12 &&
//                             "bg-8h-12h-duration-background text-8h-12h-duration-text border-8h-12h-duration-border"
//                                                 ) }
//                                                 onClick={ () => openBookingDetails(booking) }
//                                             >
//                                                 { formatTime(booking.startDate) } - { booking.gear }
//                                             </div>
//                                         );
//                                     }) }
//                             </div>
//                         </div>
//                     );
//                 }) }
//             </div>
//         </div>
//     );
// }

"use client";

import { cn } from "@/lib/utils";
import { formatTime, getMonthDays, isSameDay, isToday } from "./bookingViewHelpers";
import { CalendarMonthHeader } from "./CalendarMonthHeader";
import type { Checkout } from "@/utils/@types/checkouts";
import type { FlattenedBooking } from "./WeekView";
import { MobileMonthView } from "./MobileMonthView";

interface MonthViewProps {
  currentDate: Date
  checkouts: Checkout[]
  openBookingDetails: (booking: FlattenedBooking) => void
}

export function MonthView({ currentDate, checkouts, openBookingDetails }: MonthViewProps) {
    // Flatten bookings from checkouts
    const flattenedBookings: FlattenedBooking[] = checkouts.flatMap((checkout) =>
        checkout.Bookings.map((booking) => {
            // Convert startHourInMinutes to actual start and end dates
            const startDate = new Date(booking.date);
            startDate.setHours(Math.floor(booking.startHourInMinutes / 60));
            startDate.setMinutes(booking.startHourInMinutes % 60);

            const endDate = new Date(startDate);
            endDate.setMinutes(endDate.getMinutes() + booking.totalDurationInMinutes);

            return {
                id: booking.bookingId,
                startDate,
                endDate,
                checkoutId: checkout.checkoutId,
                bookingId: booking.bookingId,
                date: booking.date,
                gearAmount: booking.gearAmount,
                startHourInMinutes: booking.startHourInMinutes,
                totalDurationInMinutes: booking.totalDurationInMinutes,
                price: booking.price / 100,
                observations: booking.observations,
                gear: booking.gear,
                customer: checkout.customer,
                sourceFilial: checkout.sourceFilial,
                bookingStatus: checkout.checkoutStatus,
                paymentStatus: checkout.paymentStatus,
                totalPrice: checkout.totalPrice / 100,
                address: checkout.address
            };
        }),
    );

    const daysInCurrentMonth = getMonthDays(currentDate);

    return (
        <>
            <MobileMonthView bookings={ checkouts } currentDate={ currentDate } openBookingDetails={ openBookingDetails } />
            <div className="hidden md:block min-w-full">
                <CalendarMonthHeader />

                {/* Month grid */}
                <div className="grid grid-cols-7">
                    {daysInCurrentMonth.map((day, index) => {
                    // Filter bookings for this day
                        const dayBookings = flattenedBookings.filter((booking) => isSameDay(booking.startDate, day));

                        // Check if it's from the current month or not
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                        return (
                            <div
                                key={ index }
                                className={ cn(
                                    "min-h-[120px] border-r border-b p-1 relative max-h-[100px]",
                                    dayBookings.length > 3 && "overflow-y-scroll",
                                    isToday(day) ? "bg-primary/90" : "",
                                    !isCurrentMonth ? "bg-gray-100 text-red-300" : "",
                                ) }
                            >
                                <div className={ cn("text-right p-1 font-medium text-sm", isToday(day) ? "text-white font-extrabold" : "") }>
                                    {day.getDate()}
                                </div>

                                <div className="space-y-1 mt-1">
                                    {dayBookings
                                        .sort((item1, item2) => item1.startDate.getHours() - item2.startDate.getHours())
                                        .map((booking) => {
                                        // Convert totalDuration from minutes to hours for styling logic
                                            const durationInHours = booking.totalDurationInMinutes / 60;

                                            return (
                                                <div
                                                    key={ booking.id }
                                                    className={ cn(
                                                        "text-xs p-1 rounded border-l-2 cursor-pointer truncate",
                                                        // Default colors for bookings with durations different than 4, 6 and 8-12 hours
                                                        "bg-unknown-duration-background text-unknown-duration-text border-unknown-duration-border",
                                                        // Colors for 4h bookings duration
                                                        durationInHours === 4 &&
                            "bg-4h-duration-background text-4h-duration-text border-4h-duration-border",
                                                        // Colors for 6h bookings duration
                                                        durationInHours === 6 &&
                            "bg-6h-duration-background text-6h-duration-text border-6h-duration-border",
                                                        // Colors for 8 to 12 hours bookings duration
                                                        durationInHours >= 8 &&
                            durationInHours <= 12 &&
                            "bg-8h-12h-duration-background text-8h-12h-duration-text border-8h-12h-duration-border",
                                                    ) }
                                                    onClick={ () => openBookingDetails(booking) }
                                                >
                                                    {formatTime(booking.startDate)} - {booking.gear.gearName}
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>

    );
}
