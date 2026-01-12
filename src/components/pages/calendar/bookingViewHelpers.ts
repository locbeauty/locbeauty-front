import { Dispatch, SetStateAction } from "react";
import { Checkout } from "@/utils/@types/checkouts";
import { Training } from "@/utils/@types/training";
import { BirthdayEvent } from "@/utils/@types/birthday";

export type CalendarEvent = Checkout | Training | BirthdayEvent;

//
// ─── NAVEGAÇÃO DE DATAS ──────────────────────────────────────────────────────────
//

export const nextDay = (
  currentDate: Date,
  setCurrentDate: Dispatch<SetStateAction<Date>>
) => {
  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + 1);
  setCurrentDate(nextDate);
};

export const prevDay = (
  currentDate: Date,
  setCurrentDate: Dispatch<SetStateAction<Date>>
) => {
  const prevDate = new Date(currentDate);
  prevDate.setDate(currentDate.getDate() - 1);
  setCurrentDate(prevDate);
};

export const nextWeek = (
  currentDate: Date,
  setCurrentDate: Dispatch<SetStateAction<Date>>
) => {
  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + 7);
  setCurrentDate(nextDate);
};

export const prevWeek = (
  currentDate: Date,
  setCurrentDate: Dispatch<SetStateAction<Date>>
) => {
  const prevDate = new Date(currentDate);
  prevDate.setDate(currentDate.getDate() - 7);
  setCurrentDate(prevDate);
};

export const nextMonth = (
  currentDate: Date,
  setCurrentDate: Dispatch<SetStateAction<Date>>
) => {
  const nextDate = new Date(currentDate);
  nextDate.setMonth(nextDate.getMonth() + 1);
  setCurrentDate(nextDate);
};

export const prevMonth = (
  currentDate: Date,
  setCurrentDate: Dispatch<SetStateAction<Date>>
) => {
  const prevDate = new Date(currentDate);
  prevDate.setMonth(prevDate.getMonth() - 1);
  setCurrentDate(prevDate);
};

export const goToToday = (setCurrentDate: Dispatch<SetStateAction<Date>>) => {
  setCurrentDate(new Date());
};

//
// ─── CÁLCULOS DE DATAS E SEMANAS ──────────────────────────────────────────────────
//

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return isSameDay(date, today);
}

export function getMonthDays(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Get first day of the month
  const firstDayOfMonth = new Date(year, month, 1);

  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Calculate how many days from previous month to show
  // Calculate how many days from previous month to show
  // Sunday start (0 = Sunday is 0 days from prev month)
  const daysFromPrevMonth = firstDayOfWeek;

  // Calculate start date (first day to show in the calendar)
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - daysFromPrevMonth);

  const days: Date[] = [];
  const current = new Date(startDate);

  // Always generate exactly 6 weeks (42 days) for consistent layout
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function getWeekDays(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const monday = new Date(date);
  monday.setDate(diff);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    weekDays.push(nextDay);
  }
  return weekDays;
}

export function getDayIndex(bookingDate: Date, weekDays: Date[]): number {
  const bookingDay = bookingDate.toDateString();
  return weekDays.findIndex((day) => day.toDateString() === bookingDay);
}

export function isAgendamentoInWeek(
  booking: CalendarEvent,
  weekDays: Date[]
): boolean {
  const date = "date" in booking ? booking.date : new Date(booking.dueDate);
  const bookingDate = new Date(date);
  bookingDate.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(weekDays[0]);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(weekDays[6]);
  endOfWeek.setHours(23, 59, 59, 999);

  return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
}

//
// ─── FORMATAÇÕES ──────────────────────────────────────────────────────────────────
//

export function formatDayName(date: Date): string {
  return (
    date
      .toLocaleDateString("pt-BR", { weekday: "short" })
      .charAt(0)
      .toUpperCase() +
    date.toLocaleDateString("pt-BR", { weekday: "short" }).slice(1, 3)
  );
}

export function formatMonthYear(date: Date): string {
  return (
    date
      .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
      .charAt(0)
      .toUpperCase() +
    date
      .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
      .slice(1)
  );
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

//
// ─── EVENTOS ──────────────────────────────────────────────────────────────────────
//

export function doEventsOverlap(
  event1: CalendarEvent,
  event2: CalendarEvent
): boolean {
  const isTraining1 = "trainingId" in event1;
  const isTraining2 = "trainingId" in event2;

  const date1 = isTraining1
    ? new Date((event1 as Training).dueDate)
    : new Date((event1 as Checkout).date);
  const startHour1 = isTraining1
    ? (event1 as Training).hourInMinutes
    : (event1 as Checkout).startHourInMinutes;
  const duration1 = isTraining1
    ? 120
    : (event1 as Checkout).totalDurationInMinutes; // Assume 2h for training

  const date2 = isTraining2
    ? new Date((event2 as Training).dueDate)
    : new Date((event2 as Checkout).date);
  const startHour2 = isTraining2
    ? (event2 as Training).hourInMinutes
    : (event2 as Checkout).startHourInMinutes;
  const duration2 = isTraining2
    ? 120
    : (event2 as Checkout).totalDurationInMinutes; // Assume 2h for training

  const start1 = new Date(date1);
  start1.setHours(Math.floor(startHour1 / 60));
  start1.setMinutes(startHour1 % 60);

  const end1 = new Date(start1);
  end1.setMinutes(end1.getMinutes() + duration1);

  const start2 = new Date(date2);
  start2.setHours(Math.floor(startHour2 / 60));
  start2.setMinutes(startHour2 % 60);

  const end2 = new Date(start2);
  end2.setMinutes(end2.getMinutes() + duration2);

  return start1 < end2 && start2 < end1;
}

export function groupOverlappingEvents(
  events: CalendarEvent[]
): CalendarEvent[][] {
  if (events.length === 0) return [];

  const sortedEvents = [ ...events ].sort((a, b) => {
    const isTrainingA = "trainingId" in a;
    const isTrainingB = "trainingId" in b;

    const dateA = isTrainingA
      ? new Date((a as Training).dueDate)
      : new Date((a as Checkout).date);
    const startHourA = isTrainingA
      ? (a as Training).hourInMinutes
      : (a as Checkout).startHourInMinutes;
    const durationA = isTrainingA
      ? 120
      : (a as Checkout).totalDurationInMinutes;

    const dateB = isTrainingB
      ? new Date((b as Training).dueDate)
      : new Date((b as Checkout).date);
    const startHourB = isTrainingB
      ? (b as Training).hourInMinutes
      : (b as Checkout).startHourInMinutes;
    const durationB = isTrainingB
      ? 120
      : (b as Checkout).totalDurationInMinutes;

    const aStart = new Date(dateA);
    aStart.setHours(Math.floor(startHourA / 60));
    aStart.setMinutes(startHourA % 60);

    const bStart = new Date(dateB);
    bStart.setHours(Math.floor(startHourB / 60));
    bStart.setMinutes(startHourB % 60);

    return aStart.getTime() - bStart.getTime() || durationA - durationB;
  });

  const groups: CalendarEvent[][] = [];

  sortedEvents.forEach((event) => {
    let foundGroup = false;

    for (const group of groups) {
      const overlapsWithGroup = group.some((groupEvent) =>
        doEventsOverlap(event, groupEvent)
      );

      if (overlapsWithGroup) {
        group.push(event);
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      groups.push([ event ]);
    }
  });

  return groups;
}

//
// ─── EXIBIÇÃO DO CALENDÁRIO ───────────────────────────────────────────────────────
//

const hourHeighInPixels = 64;
const firstHourOfTheDay = 5;
const lastHourOfTheDay = 22;
const workingHoursLength = lastHourOfTheDay - firstHourOfTheDay + 1;

export const workingHours = Array.from(
  { length: workingHoursLength },
  (_, i) => i + firstHourOfTheDay
);

export function getDistanceFromTop(hour: number, minute: number): number {
  const hourHeight = hourHeighInPixels;
  const hoursFromStart = hour - workingHours[0];
  return hoursFromStart * hourHeight + (minute / 60) * hourHeight;
}

export function getEventBoxHeigh(durationInHours: number) {
  return durationInHours * hourHeighInPixels;
}

//
// ─── UTILITÁRIOS ───────────────────────────────────────────────────────────────────
//

export function getEventBasicInfo(event: CalendarEvent) {
  const isTraining = "trainingId" in event;
  const isBirthday =
    "type" in event && (event.type === "CUSTOMER" || event.type === "EMPLOYEE");
  let id = "";
  let title = "";
  let durationInHours = 0;
  let startDate: Date;

  if (isTraining) {
    const training = event as Training;
    id = training.trainingId;
    title = training.Gear.gearName;
    // Default duration 2h for training as per existing logic
    durationInHours = 2;
    startDate = new Date(training.dueDate);
    startDate.setHours(Math.floor(training.hourInMinutes / 60));
    startDate.setMinutes(training.hourInMinutes % 60);
  } else if (isBirthday) {
    const birthday = event as BirthdayEvent;
    id = birthday.id;
    title = `${birthday.title} (${birthday.role})`;
    durationInHours = 1; // Arbitrary duration for birthday view
    startDate = new Date(birthday.date);
  } else {
    const checkout = event as Checkout;
    id = checkout.checkoutId;
    title = checkout.Bookings.filter((b) => b.status === "ACTIVE")
      .sort((a, b) => a.Gear.gearName.localeCompare(b.Gear.gearName))
      .map((b) => b.Gear.gearName)
      .join(", ");
    durationInHours = checkout.totalDurationInMinutes / 60;
    startDate = new Date(checkout.date);
    startDate.setHours(Math.floor(checkout.startHourInMinutes / 60));
    startDate.setMinutes(checkout.startHourInMinutes % 60);
  }

  return { isTraining, isBirthday, id, title, durationInHours, startDate };
}
