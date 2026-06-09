"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetAllCheckouts } from "@/services/checkouts.service";
import { Checkout } from "@/utils/@types/checkouts";

/**
 * Retorna os ids dos equipamentos que estão indisponíveis para o agendamento
 * informado, por já estarem em outro agendamento que se sobrepõe no horário.
 */
export function useUnavailableGearIds(
  selectedCheckout: Checkout | null,
  enabled: boolean,
) {
  const { data: checkoutsData } = useQuery({
    queryKey: [
      "get-all-checkouts-for-availability",
      selectedCheckout?.date,
      selectedCheckout?.SourceFilial?.filialId,
    ],
    queryFn: () =>
      GetAllCheckouts({
        queryParams: {
          date: selectedCheckout?.date,
          filialIds: selectedCheckout?.SourceFilial?.filialId
            ? [ selectedCheckout.SourceFilial.filialId ]
            : undefined,
        },
      }),
    enabled:
      !!selectedCheckout?.date &&
      !!selectedCheckout?.SourceFilial?.filialId &&
      enabled,
  });

  return useMemo(() => {
    if (!checkoutsData?.data?.items || !selectedCheckout) return [];

    const otherCheckouts = checkoutsData.data.items.filter(
      (c) =>
        c.checkoutId !== selectedCheckout.checkoutId &&
        c.checkoutStatus !== "Cancelado",
    );

    const currentStart = selectedCheckout.startHourInMinutes;
    const currentEnd =
      selectedCheckout.startHourInMinutes +
      selectedCheckout.totalDurationInMinutes;

    const unavailable = new Set<string>();

    otherCheckouts.forEach((checkout) => {
      const start = checkout.startHourInMinutes;
      const end = checkout.startHourInMinutes + checkout.totalDurationInMinutes;

      // Verifica sobreposição: (StartA < EndB) e (EndA > StartB)
      if (currentStart < end && currentEnd > start) {
        checkout.Bookings.forEach((booking) => {
          if (booking.status === "ACTIVE") {
            unavailable.add(booking.Gear.gearId);
          }
        });
      }
    });

    return Array.from(unavailable);
  }, [ checkoutsData, selectedCheckout ]);
}
