// "use client";

// import { cn } from "@/lib/utils";
// import { formatTime, getMonthDays, isSameDay, isToday } from "./bookingViewHelpers";
// import { CalendarMonthHeader } from "./CalendarMonthHeader";
// import type { Checkout } from "@/utils/@types/checkouts";
// import type { FlattenedBooking } from "./WeekView";

// interface MobileMonthViewProps {
//   currentDate: Date
//   bookings: Checkout[]
//   openBookingDetails: (_booking: FlattenedBooking) => void
// }

// export function MobileMonthView({ currentDate, bookings, openBookingDetails }: MobileMonthViewProps) {
//     // Flatten bookings from checkouts
//     const flattenedBookings: FlattenedBooking[] = bookings.flatMap((checkout) =>
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

//     const daysInCurrentMonth = getMonthDays(currentDate);
//     return (
//         <div className="md:hidden block min-w-full">
//             <CalendarMonthHeader />

//             {/* Mobile Month Grid */}
//             <div className="grid grid-cols-7 gap-px bg-gray-200">
//                 {daysInCurrentMonth.map((day, index) => {
//                     // Filter bookings for this day
//                     const dayBookings = flattenedBookings.filter((booking) => isSameDay(booking.startDate, day));

//                     // Check if it's from the current month or not
//                     const isCurrentMonth = day.getMonth() === currentDate.getMonth();

//                     return (
//                         <div
//                             key={ index }
//                             className={ cn(
//                                 "bg-white min-h-[80px] p-1 relative flex flex-col",
//                                 isToday(day) ? "bg-primary/5" : "",
//                                 !isCurrentMonth ? "bg-gray-50 text-gray-400" : "",
//                             ) }
//                         >
//                             {/* Day number */}
//                             <div
//                                 className={ cn(
//                                     "text-xs font-medium mb-1 text-center",
//                                     isToday(day) ? "text-primary font-bold" : "",
//                                     !isCurrentMonth ? "text-gray-400" : "",
//                                 ) }
//                             >
//                                 {day.getDate()}
//                             </div>

//                             {/* Bookings indicators */}
//                             <div className="flex-1 space-y-0.5">
//                                 {dayBookings.length > 0 && (
//                                     <>
//                                         {/* Show first 2 bookings as small bars */}
//                                         {dayBookings.slice(0, 2).map((booking) => {
//                                             const durationInHours = booking.totalDurationInMinutes / 60;

//                                             return (
//                                                 <div
//                                                     key={ booking.id }
//                                                     className={ cn(
//                                                         "h-1.5 rounded-full cursor-pointer transition-all hover:h-2",
//                                                         // Default colors for bookings with durations different than 4, 6 and 8-12 hours
//                                                         "bg-gray-400",
//                                                         // Colors for 4h bookings duration
//                                                         durationInHours === 4 && "bg-blue-400",
//                                                         // Colors for 6h bookings duration
//                                                         durationInHours === 6 && "bg-green-400",
//                                                         // Colors for 8 to 12 hours bookings duration
//                                                         durationInHours >= 8 && durationInHours <= 12 && "bg-purple-400",
//                                                     ) }
//                                                     onClick={ () => openBookingDetails(booking) }
//                                                     title={ `${formatTime(booking.startDate)} - ${booking.gear.gearName}` }
//                                                 />
//                                             );
//                                         })}

//                                         {/* Show count if more than 2 bookings */}
//                                         {dayBookings.length > 2 && (
//                                             <div className="text-[10px] text-gray-500 text-center font-medium">
//                         +{dayBookings.length - 2} mais
//                                             </div>
//                                         )}
//                                     </>
//                                 )}

//                                 {/* Show booking count as dots for very small screens */}
//                                 {dayBookings.length > 0 && (
//                                     <div className="sm:hidden flex justify-center mt-1">
//                                         <div className="flex space-x-0.5">
//                                             {Array.from({ length: Math.min(dayBookings.length, 4) }).map((_, i) => (
//                                                 <div
//                                                     key={ i }
//                                                     className={ cn("w-1 h-1 rounded-full", dayBookings[i] ? "bg-primary" : "bg-gray-300") }
//                                                 />
//                                             ))}
//                                             {dayBookings.length > 4 && <div className="text-[8px] text-gray-500 ml-1">+</div>}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* Legend */}
//             <div className="mt-4 px-4 py-2 bg-gray-50 rounded-lg">
//                 <div className="text-xs font-medium text-gray-700 mb-2">Legenda:</div>
//                 <div className="flex flex-wrap gap-3 text-xs">
//                     <div className="flex items-center gap-1">
//                         <div className="w-3 h-1.5 bg-blue-400 rounded-full"></div>
//                         <span className="text-gray-600">4h</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                         <div className="w-3 h-1.5 bg-green-400 rounded-full"></div>
//                         <span className="text-gray-600">6h</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                         <div className="w-3 h-1.5 bg-purple-400 rounded-full"></div>
//                         <span className="text-gray-600">8-12h</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                         <div className="w-3 h-1.5 bg-gray-400 rounded-full"></div>
//                         <span className="text-gray-600">Outros</span>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

"use client";

import { cn } from "@/lib/utils";
import { formatTime, getMonthDays, isSameDay, isToday } from "./bookingViewHelpers";
import { CalendarMonthHeader } from "./CalendarMonthHeader";
import type { Checkout } from "@/utils/@types/checkouts";

interface MobileMonthViewProps {
  currentDate: Date;
  bookings: Checkout[];
  openCheckoutDetails: (_booking: Checkout) => void;
}

export function MobileMonthView({ currentDate, bookings, openCheckoutDetails }: MobileMonthViewProps) {
    const daysInCurrentMonth = getMonthDays(currentDate);

    return (
        <div className="md:hidden block min-w-full">
            <CalendarMonthHeader />

            <div className="grid grid-cols-7 gap-px bg-gray-200">
                {daysInCurrentMonth.map((day, index) => {
                    const dayBookings = bookings.filter((checkout) => isSameDay(new Date(checkout.date), day));
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    return (
                        <div
                            key={ index }
                            className={ cn(
                                "bg-white min-h-[80px] p-1 relative flex flex-col",
                                isToday(day) && "bg-primary/5",
                                !isCurrentMonth && "bg-gray-50 text-gray-400",
                            ) }
                        >
                            <div
                                className={ cn(
                                    "text-xs font-medium mb-1 text-center",
                                    isToday(day) && "text-primary font-bold",
                                    !isCurrentMonth && "text-gray-400",
                                ) }
                            >
                                {day.getDate()}
                            </div>

                            <div className="flex-1 space-y-0.5">
                                {dayBookings.length > 0 && (
                                    <>
                                        {dayBookings.slice(0, 2).map((checkout) => {
                                            const durationInHours = checkout.totalDurationInMinutes / 60;
                                            const bookingDate = new Date(checkout.date);
                                            bookingDate.setHours(Math.floor(checkout.startHourInMinutes / 60));
                                            bookingDate.setMinutes(checkout.startHourInMinutes % 60);

                                            return (
                                                <div
                                                    key={ checkout.checkoutId }
                                                    className={ cn(
                                                        "h-1.5 rounded-full cursor-pointer transition-all hover:h-2",
                                                        "bg-gray-400",
                                                        durationInHours === 4 && "bg-blue-400",
                                                        durationInHours === 6 && "bg-green-400",
                                                        durationInHours >= 8 && durationInHours <= 12 && "bg-purple-400",
                                                    ) }
                                                    onClick={ () => openCheckoutDetails(checkout) }
                                                    title={ `${formatTime(bookingDate)} - ${checkout.Bookings.filter(b => b.status === "ACTIVE").map(b => b.Gear.gearName).join(", ")}` }
                                                />
                                            );
                                        })}

                                        {dayBookings.length > 2 && (
                                            <div className="text-[10px] text-gray-500 text-center font-medium">
                        +{dayBookings.length - 2} mais
                                            </div>
                                        )}
                                    </>
                                )}

                                {dayBookings.length > 0 && (
                                    <div className="sm:hidden flex justify-center mt-1">
                                        <div className="flex space-x-0.5">
                                            {Array.from({ length: Math.min(dayBookings.length, 4) }).map((_, i) => (
                                                <div
                                                    key={ i }
                                                    className={ cn("w-1 h-1 rounded-full", dayBookings[i] ? "bg-primary" : "bg-gray-300") }
                                                />
                                            ))}
                                            {dayBookings.length > 4 && <div className="text-[8px] text-gray-500 ml-1">+</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-700 mb-2">Legenda:</div>
                <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-1.5 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-600">4h</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="text-gray-600">6h</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-1.5 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-600">8-12h</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-1.5 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-600">Outros</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
