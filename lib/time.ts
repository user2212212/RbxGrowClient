import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "Now",
    m: "1m ago",
    mm: "%dm ago",
    h: "1h",
    hh: "%dh",
    d: "1day",
    dd: "%dday",
    M: "1mo",
    MM: "%dmo",
    y: "1y",
    yy: "%dy",
  },
});

export function timeAgo(dateStr: string): string {
  return dayjs(dateStr).fromNow();
}