"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Table } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/utils/routes";
import { useRouter } from "next/navigation";
import { CalendarContent } from "@/components/pages/bookings/view/CalendarContent";
import { CalendarFooter } from "@/components/pages/bookings/view/CalendarFooter";
import { CalendarControls } from "@/components/pages/bookings/view/CalendarControls";
// import { BookingDetailsDialog } from "@/components/pages/bookings/view/DetailsDialog/BookingDetailsDialog";
import { FlattenedBooking } from "@/components/pages/bookings/view/WeekView";
import { BookingDetailsDialog } from "@/components/pages/bookings/view/DetailsDialog/BookingDetailsDialog";

export default function AgendamentosPage() {
    // Estado para controlar a semana atual
    const [ currentDate, setCurrentDate ] = useState(new Date());
    const [ selectedBooking, setSelectedBooking ] = useState<FlattenedBooking | null>(null);
    const [ isBookingDetailsDialogOpen, setBookingDetailsDialogOpen ] = useState(false);
    const [ viewType, setViewType ] = useState<"dia" | "semana" | "mes">("semana");
    const [ isMobile, setIsMobile ] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIfMobile();

        window.addEventListener("resize", checkIfMobile);

        return () => window.removeEventListener("resize", checkIfMobile);
    }, []);

    useEffect(() => {
        if (isMobile) {
            setViewType("mes");
        } else {
            setViewType("semana");
        }
    }, [ isMobile ]);

    const router = useRouter();

    const openBookingDetails = (booking: FlattenedBooking) => {
        setSelectedBooking(booking);
        setBookingDetailsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button onClick={ () => router.back() } variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
                        <p className="text-muted-foreground">
              Visualize os agendamentos de locações
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <Button className="flex justify-center items-center" asChild>
                        <Link
                            className="flex justify-center items-center"
                            href={ ROUTES.CREATE_BOOKING }
                        >
                            <Plus className="" />
                            <span className="hidden md:inline">Novo Agendamento</span>
                        </Link>
                    </Button>
                    <Button className="flex justify-center items-center" variant="outline" asChild>
                        <Link
                            className="flex justify-center items-center"
                            href={ ROUTES.BOOKING_TABLE }
                        >
                            <Table className="" />
                            {/* <span className="hidden md:inline">Tabela de agendamentos</span> */}
                        </Link>
                    </Button>
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
                openBookingDetails={ openBookingDetails }
                viewType={ viewType }
            />
            <CalendarFooter />

            <BookingDetailsDialog
                isBookingDetailsDialogOpen={ isBookingDetailsDialogOpen }
                setBookingDetailsDialogOpen={ setBookingDetailsDialogOpen }
                selectedAgendamento={ selectedBooking }
            />
        </div>
    );
}
