import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import type { CalendarEvent, CalendarView } from "@/types";

// Weeks start on Sunday per the SUN-first grid in the visual reference.
export function getMonthGridDays(monthAnchor: Date): Date[] {
  const start = startOfWeek(startOfMonth(monthAnchor));
  const end = endOfWeek(endOfMonth(monthAnchor));
  return eachDayOfInterval({ start, end });
}

export function getWeekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor);
  const end = endOfWeek(anchor);
  return eachDayOfInterval({ start, end });
}

export function shiftAnchor(anchor: Date, view: CalendarView, direction: 1 | -1): Date {
  if (view === "month") return direction === 1 ? addMonths(anchor, 1) : subMonths(anchor, 1);
  if (view === "week") return direction === 1 ? addWeeks(anchor, 1) : subWeeks(anchor, 1);
  return addDays(anchor, direction);
}

export function isCurrentMonth(day: Date, monthAnchor: Date): boolean {
  return isSameMonth(day, monthAnchor);
}

export function isToday(day: Date): boolean {
  return isSameDay(day, new Date());
}

export function eventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events
    .filter((e) => isSameDay(new Date(e.start_time), day))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}

export function formatToolbarLabel(anchor: Date, view: CalendarView): string {
  if (view === "day") return format(anchor, "MMMM d, yyyy");
  if (view === "week") {
    const start = startOfWeek(anchor);
    const end = endOfWeek(anchor);
    const sameMonth = isSameMonth(start, end);
    return sameMonth
      ? `${format(start, "MMM d")} - ${format(end, "d, yyyy")}`
      : `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
  }
  return format(anchor, "MMMM yyyy");
}

export const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}
