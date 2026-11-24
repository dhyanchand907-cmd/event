import { STATUSES } from "@/lib/constants";

// Cleans the request body and returns { data } or { error }.
export function parseEvent(body = {}) {
  const data = {
    eventName: String(body.eventName ?? "").trim(),
    description: String(body.description ?? "").trim(),
    eventDate: body.eventDate,
    venue: String(body.venue ?? "").trim(),
    eventType: String(body.eventType ?? "").trim(),
    status: String(body.status ?? "Upcoming").trim(),
  };

  if (!data.eventName) return { error: "Event name is required." };
  if (!data.description) return { error: "Description is required." };

  const date = new Date(data.eventDate);
  if (!data.eventDate || Number.isNaN(date.getTime())) {
    return { error: "A valid event date is required." };
  }
  data.eventDate = date;

  if (!data.venue) return { error: "Venue is required." };
  if (!data.eventType) return { error: "Event type is required." };
  if (!STATUSES.includes(data.status)) {
    return { error: `Status must be one of: ${STATUSES.join(", ")}.` };
  }

  return { data };
}
