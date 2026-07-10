"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Table, Eye } from "lucide-react";
import { Can } from "@/components/auth/Can";
import Link from "next/link";
import { ROUTES } from "@/utils/routes";
import { useRouter } from "next/navigation";
import { Checkout } from "@/utils/@types/checkouts";
import { CalendarControls } from "@/components/pages/calendar/CalendarControls";
import { CalendarContent } from "@/components/pages/calendar/CalendarContent";
import { CalendarFooter } from "@/components/pages/calendar/CalendarFooter";
import { BookingDetailsDialog } from "@/components/pages/calendar/DetailsDialog/BookingDetailsDialog";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { useScheduleFilters } from "@/hooks/useScheduleFilters";
import type { DateRange } from "react-day-picker";

export default function AgendamentosPage() {
  // Estado para controlar a semana atual
  const [ currentDate, setCurrentDate ] = useState(new Date());
  // Filtros persistidos em localStorage (sobrevivem à navegação e ao reload).
  const {
    hideCanceled,
    setHideCanceled,
    selectedFilialIds,
    setSelectedFilialIds,
    selectedGearIds,
    setSelectedGearIds,
    selectedDateRange,
    setSelectedDateRange,
    viewType,
    setViewType,
  } = useScheduleFilters();
  const [ selectedCheckout, setSelectedCheckout ] = useState<Checkout | null>(
    null,
  );
  const [ isBookingDetailsDialogOpen, setBookingDetailsDialogOpen ] =
    useState(false);
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

  // Ao filtrar por período, navega a agenda para o início do período
  // (senão o usuário seleciona junho olhando julho e vê tudo vazio).
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setSelectedDateRange(range);
    if (range?.from) setCurrentDate(range.from);
  };

  // Mesma regra quando um período salvo é restaurado do localStorage pós-mount
  // (o calendário abre em "hoje", mas o filtro pode apontar para outro mês).
  const appliedRestoredRange = useRef(false);
  useEffect(() => {
    if (appliedRestoredRange.current) return;
    if (selectedDateRange?.from) {
      appliedRestoredRange.current = true;
      setCurrentDate(selectedDateRange.from);
    }
  }, [ selectedDateRange ]);

  return (
    <RouteGuard module={ SYSTEM_MODULES.CALENDAR }>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
              <p className="text-muted-foreground">
                Visualize agendamentos e treinamentos
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Can module={ SYSTEM_MODULES.BOOKINGS } action="canCreate">
              <Button className="flex justify-center items-center" asChild>
                <Link
                  className="flex justify-center items-center"
                  href={ ROUTES.CREATE_BOOKING }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden md:inline">Novo Agendamento</span>
                </Link>
              </Button>
            </Can>
            <Can module={ SYSTEM_MODULES.BOOKINGS } action="canView">
              <Button
                variant="outline"
                className="flex justify-center items-center"
                asChild
              >
                <Link
                  className="flex justify-center items-center"
                  href={ ROUTES.BOOKING_TABLE }
                >
                  <Eye className="mr-2 h-4 w-4" />
                  <span className="hidden md:inline">Visualizar Tabela</span>
                </Link>
              </Button>
            </Can>
          </div>
        </div>

        <CalendarControls
          currentDate={ currentDate }
          setCurrentDate={ setCurrentDate }
          viewType={ viewType }
          setViewType={ setViewType }
          hideCanceled={ hideCanceled }
          setHideCanceled={ setHideCanceled }
          selectedFilialIds={ selectedFilialIds }
          setSelectedFilialIds={ setSelectedFilialIds }
          selectedGearIds={ selectedGearIds }
          setSelectedGearIds={ setSelectedGearIds }
          selectedDateRange={ selectedDateRange }
          setSelectedDateRange={ handleDateRangeChange }
        />
        <CalendarContent
          currentDate={ currentDate }
          openCheckoutDetails={ openCheckoutDetails }
          viewType={ viewType }
          hideCanceled={ hideCanceled }
          selectedFilialIds={ selectedFilialIds }
          selectedGearIds={ selectedGearIds }
          selectedDateRange={ selectedDateRange }
        />
        <CalendarFooter />

        <BookingDetailsDialog
          isOpen={ isBookingDetailsDialogOpen }
          onOpenChange={ setBookingDetailsDialogOpen }
          selectedCheckout={ selectedCheckout }
          setSelectedCheckout={ setSelectedCheckout }
        />
      </div>
    </RouteGuard>
  );
}
