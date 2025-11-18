import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { Event } from "./event.model";

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Booking schema definition
const BookingSchema: Schema<IBooking> = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event reference is required"],
      index: true, // Add index for faster queries
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Pre-save hook to validate event existence
 * - Ensures the referenced event exists before saving booking
 * - Throws error if event is not found
 */
BookingSchema.pre<IBooking>("save", async function (next) {
  try {
    const event = await Event.findById(this.eventId);
    if (!event) {
      throw new Error(`Event with ID ${this.eventId} does not exist`);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Create and export Booking model
export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
