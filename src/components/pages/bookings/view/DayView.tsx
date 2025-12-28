"use client";

import {
    workingHours,
    groupOverlappingEvents,
    isSameDay,
} from "./bookingViewHelpers";
import { MobileDayView } from "./MobileDayView";
import { CalendarDayHeader } from "./CalendarDayHeader";
import type { Checkout } from "@/utils/@types/checkouts";
import { SingleEventBox } from "./SingleEventBox";
import { MultipleEventBox } from "./MultipleEventBox";

interface DayViewProps {
    currentDate: Date;
    checkouts: Checkout[];
    openCheckoutDetails: (_booking: Checkout) => void;
}

export function DayView({ currentDate, checkouts, openCheckoutDetails }: DayViewProps) {
    const dayBookings = checkouts.filter((checkout) => isSameDay(new Date(checkout.date), currentDate));
    const bookingGroups = groupOverlappingEvents(dayBookings);

    return (
        <>
            <MobileDayView checkouts={ checkouts } currentDate={ currentDate } openCheckoutDetails={ openCheckoutDetails } />

            <div className="hidden md:block min-w-full">
                <CalendarDayHeader currentDate={ currentDate } />

                <div className="relative">
                    {workingHours.map((hour) => (
                        <div
                            key={ hour }
                            className="grid grid-cols-2 border-b h-[64px]"
                            style={ { gridTemplateColumns: "100px repeat(1, 1fr)" } }
                        >
                            <div className="p-2 border-r text-xs text-muted-foreground text-right pr-2">{`${hour}:00`}</div>
                            <div className="h-16 border-r relative"></div>
                        </div>
                    ))}

                    {bookingGroups.flatMap((group) => {
                        return (
                            group.length === 1 ? (
                                <SingleEventBox
                                    eventType="checkout"
                                    key={ group[0].checkoutId }
                                    dayIndex={ 0 }
                                    group={ group }
                                    openCheckoutDetails={ openCheckoutDetails }
                                    totalColumns={ 1 }
                                />
                            ) : (
                                <MultipleEventBox
                                    key={ group[0].checkoutId }
                                    dayIndex={ 0 }
                                    group={ group }
                                    openCheckoutDetails={ openCheckoutDetails }
                                    totalColumns={ 1 }
                                />
                            )
                        );
                    })}
                </div>
            </div>
        </>
    );
}
