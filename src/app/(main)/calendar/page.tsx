"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Table } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/utils/routes";
import { useRouter } from "next/navigation";
// import { CalendarContent } from "@/components/pages/bookings/view/CalendarContent";
// import { CalendarFooter } from "@/components/pages/bookings/view/CalendarFooter";
// import { CalendarControls } from "@/components/pages/bookings/view/CalendarControls";
// import { BookingDetailsDialog } from "@/components/pages/bookings/view/DetailsDialog/BookingDetailsDialog";
import { Checkout } from "@/utils/@types/checkouts";
import { CalendarControls } from "@/components/pages/calendar/CalendarControls";
import { CalendarContent } from "@/components/pages/calendar/CalendarContent";
import { CalendarFooter } from "@/components/pages/calendar/CalendarFooter";
import { BookingDetailsDialog } from "@/components/pages/calendar/DetailsDialog/BookingDetailsDialog";

export default function AgendamentosPage() {
    // Estado para controlar a semana atual
    const [ currentDate, setCurrentDate ] = useState(new Date());
    const [ selectedCheckout, setSelectedCheckout ] = useState<Checkout | null>(null);
    const [ isBookingDetailsDialogOpen, setBookingDetailsDialogOpen ] = useState(false);
    const [ viewType, setViewType ] = useState<"dia" | "semana" | "mes">("mes");
    const [ isMobile, setIsMobile ] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIfMobile();

        window.addEventListener("resize", checkIfMobile);

        return () => window.removeEventListener("resize", checkIfMobile);
    }, []);

    const router = useRouter();

    const openCheckoutDetails = (booking: Checkout) => {
        setSelectedCheckout(booking);
        setBookingDetailsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
                        <p className="text-muted-foreground">
              Visualize agendamentos e treinamentos
                        </p>
                    </div>
                </div>

            </div>

            <CalendarControls
                currentDate={ currentDate }
                setCurrentDate={ setCurrentDate }
                viewType={ viewType }
                setViewType={ setViewType }
            />
            <CalendarContent
                currentDate={ currentDate }
                openCheckoutDetails={ openCheckoutDetails }
                viewType={ viewType }
            />
            <CalendarFooter />

            <BookingDetailsDialog
                isBookingDetailsDialogOpen={ isBookingDetailsDialogOpen }
                setBookingDetailsDialogOpen={ setBookingDetailsDialogOpen }
                selectedCheckout={ selectedCheckout }
                setSelectedCheckout={ setSelectedCheckout }
            />
        </div>
    );
}
