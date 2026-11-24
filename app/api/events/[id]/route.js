import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { getSession } from "@/lib/session";
import { parseEvent } from "@/lib/validateEvent";
import { serializeEvent } from "@/lib/serializeEvent";

// Shared checks: logged in, valid id, event exists, and the user owns it.
async function loadOwnedEvent(params) {
  const { id } = await params;

  const session = await getSession();
  if (!session) {
    return { response: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };
  }
  if (!mongoose.isValidObjectId(id)) {
    return { response: NextResponse.json({ error: "Invalid event id." }, { status: 400 }) };
  }

  await connectDB();
  const event = await Event.findById(id);
  if (!event) {
    return { response: NextResponse.json({ error: "Event not found." }, { status: 404 }) };
  }
  if (String(event.createdBy) !== session.id) {
    return {
      response: NextResponse.json(
        { error: "You can only change events you created." },
        { status: 403 }
      ),
    };
  }
  return { event };
}

// UPDATE: edit event details
export async function PUT(request, { params }) {
  try {
    const { event, response } = await loadOwnedEvent(params);
    if (response) return response;

    const { data, error } = parseEvent(await request.json());
    if (error) return NextResponse.json({ error }, { status: 400 });

    Object.assign(event, data);
    await event.save();
    await event.populate("createdBy", "name");

    return NextResponse.json({ event: serializeEvent(event.toObject()) });
  } catch (err) {
    console.error("Update event error:", err);
    return NextResponse.json({ error: "Could not update event." }, { status: 500 });
  }
}

// DELETE: remove an event
export async function DELETE(_request, { params }) {
  try {
    const { event, response } = await loadOwnedEvent(params);
    if (response) return response;

    await event.deleteOne();
    return NextResponse.json({ message: "Event deleted." });
  } catch (err) {
    console.error("Delete event error:", err);
    return NextResponse.json({ error: "Could not delete event." }, { status: 500 });
  }
}
