// "use client";

// import { cn } from "@/lib/utils";
// import { formatCurrency, formatDayName, formatTime, isSameDay, isToday } from "./bookingViewHelpers";
// import { Clock, DollarSign, MapPin, User } from "lucide-react";
// import { BookingStatusBadge } from "../common/BookingStatusBadge";
// import { BookingPaymentStatusBadge } from "../common/BookingPaymentStatusBadge";
// import type { Checkout } from "@/utils/@types/checkouts";
// import type { FlattenedBooking } from "./WeekView";

// interface MobileDayViewProps {
//   currentDate: Date
//   checkouts: Checkout[]
//   openBookingDetails: (_booking: FlattenedBooking) => void
// }

// export function MobileDayView({ checkouts, currentDate, openBookingDetails }: MobileDayViewProps) {
//     // Flatten bookings from checkouts
//     const flattenedBookings: FlattenedBooking[] = checkouts.flatMap((checkout) =>
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
//                 price: booking.price,
//                 observations: booking.observations,
//                 gear: booking.gear,
//                 customer: checkout.customer,
//                 sourceFilial: checkout.sourceFilial,
//                 bookingStatus: booking.bookingStatus,
//                 paymentStatus: checkout.paymentStatus,
//                 totalPrice: checkout.totalPrice,
//                 address: checkout.address
//             };
//         }),
//     );

//     // Filter bookings for the current day
//     const dayBookings = flattenedBookings.filter((booking) => {
//         return isSameDay(booking.startDate, currentDate);
//     });

//     return (
//         <div className="md:hidden block min-w-full">
//             {/* Header with the day */}
//             <div className="grid grid-cols-1 border-b">
//                 <div className={ cn("p-2 text-center font-medium", isToday(currentDate) ? "bg-primary/10" : "bg-muted/50") }>
//                     <div>{formatDayName(currentDate)}</div>
//                     <div className={ cn("text-lg", isToday(currentDate) ? "text-primary font-bold" : "") }>
//                         {currentDate.getDate()}
//                     </div>
//                 </div>
//             </div>

//             {/* List of bookings for the day */}
//             <div className="divide-y">
//                 {dayBookings.length === 0 ? (
//                     <div className="p-4 text-center text-muted-foreground">Nenhum agendamento para este dia</div>
//                 ) : (
//                     dayBookings.map((booking) => {
//                         // Convert totalDuration from minutes to hours for styling and display
//                         const durationInHours = booking.totalDurationInMinutes / 60;

//                         return (
//                             <div
//                                 key={ booking.id }
//                                 className={ cn(
//                                     "p-3 border-l-4 cursor-pointer hover:bg-muted/20 transition-colors",
//                                     // Default colors for bookings with durations different than 4, 6 and 8-12 hours
//                                     "bg-unknown-duration-background text-unknown-duration-text border-unknown-duration-border",
//                                     // Colors for 4h bookings duration
//                                     durationInHours === 4 && "bg-4h-duration-background text-4h-duration-text border-4h-duration-border",
//                                     // Colors for 6h bookings duration
//                                     durationInHours === 6 && "bg-6h-duration-background text-6h-duration-text border-6h-duration-border",
//                                     // Colors for 8 to 12 hours bookings duration
//                                     durationInHours >= 8 &&
//                     durationInHours <= 12 &&
//                     "bg-8h-12h-duration-background text-8h-12h-duration-text border-8h-12h-duration-border",
//                                 ) }
//                                 onClick={ () => openBookingDetails(booking) }
//                             >
//                                 <div className="font-medium">{booking.gear.gearName}</div>

//                                 <div className="text-sm text-muted-foreground mt-1 dark:text-muted">
//                                     <div className="flex items-center gap-1">
//                                         <Clock className="h-3.5 w-3.5" />
//                                         {formatTime(booking.startDate)} - {formatTime(booking.endDate)}
//                                     </div>

//                                     <div className="flex items-center gap-1 mt-1 max-w-[80vw]">
//                                         <User className="h-3.5 w-3.5 shrink-0" />
//                                         <span className="truncate whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
//                                             {booking.customer.fullname}
//                                         </span>
//                                     </div>

//                                     <div className="flex items-center gap-1 mt-1">
//                                         <MapPin className="h-3.5 w-3.5" />
//                                         {booking.sourceFilial.description}
//                                     </div>

//                                     <div className="flex items-center gap-1 mt-1">
//                                         <DollarSign className="h-3.5 w-3.5" />
//                                         {formatCurrency(booking.price)}
//                                     </div>
//                                 </div>

//                                 <div className="mt-2 flex justify-between items-center">
//                                     <div className="flex gap-2">
//                                         <BookingStatusBadge status={ booking.bookingStatus } />
//                                         <BookingPaymentStatusBadge status={ booking.paymentStatus } />
//                                     </div>
//                                     <span className="text-xs text-muted-foreground dark:text-muted">{durationInHours}h</span>
//                                 </div>
//                             </div>
//                         );
//                     })
//                 )}
//             </div>
//         </div>
//     );
// }

"use client";

import { cn } from "@/lib/utils";
import { formatCurrency, formatDayName, formatTime, isSameDay, isToday } from "./bookingViewHelpers";
import { Clock, DollarSign, MapPin, User } from "lucide-react";
import { BookingStatusBadge } from "../common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../common/BookingPaymentStatusBadge";
import type { Checkout } from "@/utils/@types/checkouts";
import { centsToStringWithCurrencyMark } from "@/utils/centsToString";

interface MobileDayViewProps {
  currentDate: Date;
  checkouts: Checkout[];
  openCheckoutDetails: (_booking: Checkout) => void;
}

export function MobileDayView({ checkouts, currentDate, openCheckoutDetails }: MobileDayViewProps) {
    const dayBookings = checkouts.filter((checkout) => isSameDay(new Date(checkout.date), currentDate));

    const getBookingClassNames = (durationInHours: number) =>
        cn(
            "p-3 border-l-4 cursor-pointer hover:bg-muted/20 transition-colors",
            "bg-unknown-duration-background text-unknown-duration-text border-unknown-duration-border",
            durationInHours === 4 && "bg-4h-duration-background text-4h-duration-text border-4h-duration-border",
            durationInHours === 6 && "bg-6h-duration-background text-6h-duration-text border-6h-duration-border",
            durationInHours >= 8 &&
        durationInHours <= 12 &&
        "bg-8h-12h-duration-background text-8h-12h-duration-text border-8h-12h-duration-border"
        );

    return (
        <div className="md:hidden block min-w-full">
            <div className="grid grid-cols-1 border-b">
                <div className={ cn("p-2 text-center font-medium", isToday(currentDate) ? "bg-primary/10" : "bg-muted/50") }>
                    <div>{formatDayName(currentDate)}</div>
                    <div className={ cn("text-lg", isToday(currentDate) ? "text-primary font-bold" : "") }>
                        {currentDate.getDate()}
                    </div>
                </div>
            </div>

            <div className="divide-y">
                {dayBookings.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">Nenhum agendamento para este dia</div>
                ) : (
                    dayBookings.map((checkout) => {
                        const durationInHours = checkout.totalDurationInMinutes / 60;
                        const startDate = new Date(checkout.date);
                        startDate.setHours(Math.floor(checkout.startHourInMinutes / 60));
                        startDate.setMinutes(checkout.startHourInMinutes % 60);

                        const endDate = new Date(startDate);
                        endDate.setMinutes(endDate.getMinutes() + checkout.totalDurationInMinutes);

                        return (
                            <div
                                key={ checkout.checkoutId }
                                className={ getBookingClassNames(durationInHours) }
                                onClick={ () => openCheckoutDetails(checkout) }
                            >
                                <div className="font-medium">
                                    {checkout.Bookings.filter((b) => b.status === "ACTIVE").map((b) => b.Gear.gearName).join(", ")}
                                </div>

                                <div className="text-sm text-muted-foreground mt-1 dark:text-muted">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatTime(startDate)} - {formatTime(endDate)}
                                    </div>

                                    <div className="flex items-center gap-1 mt-1 max-w-[80vw]">
                                        <User className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
                                            {checkout.Customer.fullname}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 mt-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {checkout.SourceFilial.filialName}
                                    </div>

                                    <div className="flex items-center gap-1 mt-1">
                                        <DollarSign className="h-3.5 w-3.5" />
                                        {centsToStringWithCurrencyMark(checkout.totalPrice)}
                                    </div>
                                </div>

                                <div className="mt-2 flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <BookingStatusBadge status={ checkout.checkoutStatus } />
                                        {/* <BookingPaymentStatusBadge status={ checkout.paymentStatus } /> */}
                                    </div>
                                    <span className="text-xs text-muted-foreground dark:text-muted">{durationInHours}h</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
