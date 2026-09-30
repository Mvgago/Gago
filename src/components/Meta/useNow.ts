import { useEffect, useState } from "react";

/** Current time, re-rendering once per second on the second boundary. */
export const useNow = (): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      setNow(new Date());
      interval = window.setInterval(() => setNow(new Date()), 1000);
    }, 1000 - (Date.now() % 1000));
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  return now;
};

const formatters = new Map<string, Intl.DateTimeFormat>();

export const timeIn = (date: Date, timeZone: string, seconds = false): string => {
  const key = `${timeZone}:${seconds}`;
  let fmt = formatters.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: seconds ? "2-digit" : undefined,
      hour12: false,
    });
    formatters.set(key, fmt);
  }
  return fmt.format(date);
};

/** Studio hours: Madrid, Monday–Friday, 09:00–19:00. */
export const isStudioOpen = (date: Date): boolean => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  return !["Sat", "Sun"].includes(weekday) && hour >= 9 && hour < 19;
};
