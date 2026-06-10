import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export function formatApptDateTime(
  startAt: string,
  endAt: string,
  timezone: string
): { date: string; time: string } {
  const start = toZonedTime(new Date(startAt), timezone);
  const end = toZonedTime(new Date(endAt), timezone);
  return {
    date: format(start, "EEEE, d MMMM yyyy"),
    time: `${format(start, "h:mm")}–${format(end, "h:mm a")}`,
  };
}
