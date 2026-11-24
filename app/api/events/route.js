import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { getSession } from "@/lib/session";
import { parseEvent } from "@/lib/validateEvent";
import { serializeEvent } from "@/lib/serializeEvent";

// READ: list all events (soonest first)
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    await connectDB();
    const events = await Event.find()
      .sort({ eventDate: 1 })
      .populate("createdBy", "name")
      .lean();

    return NextResponse.json({ events: events.map(serializeEvent) });
  } catch (err) {
    console.error("List events error:", err);
    return NextResponse.json({ error: "Could not load events." }, { status: 500 });
  }
}

// CREATE: add a new event
export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { data, error } = parseEvent(await request.json());
    if (error) return NextResponse.json({ error }, { status: 400 });

    await connectDB();
    const event = await Event.create({ ...data, createdBy: session.id });
    await event.populate("createdBy", "name");

    return NextResponse.json({ event: serializeEvent(event.toObject()) }, { status: 201 });
  } catch (err) {
    console.error("Create event error:", err);
    return NextResponse.json({ error: "Could not create event." }, { status: 500 });
  }
}
