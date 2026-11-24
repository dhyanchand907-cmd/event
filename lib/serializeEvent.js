// Converts a (lean/plain) event document into JSON-safe output.
export function serializeEvent(e) {
  return {
    _id: String(e._id),
    eventName: e.eventName,
    description: e.description,
    eventDate: new Date(e.eventDate).toISOString(),
    venue: e.venue,
    eventType: e.eventType,
    status: e.status,
    createdBy: e.createdBy
      ? { id: String(e.createdBy._id ?? e.createdBy), name: e.createdBy.name ?? "Unknown" }
      : null,
  };
}
