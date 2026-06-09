"use client";

import { Megaphone } from "lucide-react";
import { CalendarEvent, isDateInRange } from "./bookingViewHelpers";
import { Notice } from "@/utils/@types/notice";

interface CalendarNoticesBandProps {
  days: Date[];
  notices: Notice[];
  openDetails: (_event: CalendarEvent) => void;
  totalColumns: number;
}

/**
 * Faixa de "Avisos" exibida no topo das colunas de dia (semana/dia), fora da
 * grade de horários. Evita que avisos longos (ex.: dia inteiro) ocupem toda a
 * coluna e escondam os agendamentos.
 */
export function CalendarNoticesBand({
  days,
  notices,
  openDetails,
  totalColumns,
}: CalendarNoticesBandProps) {
  const noticesByDay = days.map((day) =>
    notices.filter((notice) =>
      isDateInRange(day, new Date(notice.startDate), new Date(notice.endDate)),
    ),
  );

  // Não renderiza a faixa se nenhum dia visível tiver avisos.
  if (noticesByDay.every((dayNotices) => dayNotices.length === 0)) {
    return null;
  }

  return (
    <div
      className="grid border-b"
      style={ { gridTemplateColumns: `100px repeat(${totalColumns}, 1fr)` } }
    >
      <div className="flex items-center gap-1 border-r bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
        <Megaphone className="h-3.5 w-3.5 shrink-0" />
        Avisos
      </div>
      {days.map((day, index) => (
        <div key={ index } className="space-y-1 border-r p-1">
          {noticesByDay[index].map((notice) => (
            <button
              key={ notice.noticeId }
              type="button"
              onClick={ () => openDetails(notice) }
              title={ notice.description }
              className="flex w-full items-center gap-1 rounded bg-blue-800 px-2 py-1 text-left text-xs text-white transition-colors hover:bg-blue-900"
            >
              <Megaphone className="h-3 w-3 shrink-0" />
              <span className="truncate">{notice.description}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
