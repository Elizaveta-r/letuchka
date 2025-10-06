import { isAfter } from "date-fns/isAfter";
import { parseISO } from "date-fns/parseISO";
import { subDays } from "date-fns/subDays";

export function convertGoDateToISO(goDateStr) {
  const [date, time] = goDateStr.split(" ");
  return `${date}T${time}Z`; // ISO 8601
}

export function formatDateLocal(string) {
  const isoString = convertGoDateToISO(string);
  if (!isoString || isoString.startsWith("0001-01-01")) return "—";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getFormattedDateAndUpdateFlag(goDateStr) {
  const isZeroDate = goDateStr.startsWith("0001-01-01");

  if (isZeroDate) {
    return {
      formattedDate: null,
      wasUpdatedRecently: false,
    };
  }

  const isoString = convertGoDateToISO(goDateStr);
  const parsedDate = parseISO(isoString);

  const sevenDaysAgo = subDays(new Date(), 7);
  const wasUpdatedRecently = isAfter(parsedDate, sevenDaysAgo);

  const formattedDate = parsedDate.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    formattedDate,
    wasUpdatedRecently,
  };
}
