import mongoose from "mongoose";
import { STATUSES } from "@/lib/constants";

const EventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true },
    venue: { type: String, required: true, trim: true },
    eventType: { type: String, required: true, trim: true },
    status: { type: String, enum: STATUSES, default: "Upcoming" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
