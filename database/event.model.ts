import mongoose, { Schema, Document, Model } from "mongoose";

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Event schema definition
const EventSchema: Schema<IEvent> = new Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      minlength: [1, "Description cannot be empty"],
    },
    overview: {
      type: String,
      required: [true, "Event overview is required"],
      minlength: [1, "Overview cannot be empty"],
    },
    image: {
      type: String,
      required: [true, "Event image URL is required"],
    },
    venue: {
      type: String,
      required: [true, "Event venue is required"],
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
    },
    date: {
      type: String,
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
    },
    mode: {
      type: String,
      required: [true, "Event mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be either online, offline, or hybrid",
      },
    },
    audience: {
      type: String,
      required: [true, "Event audience is required"],
    },
    agenda: {
      type: [String],
      required: [true, "Event agenda is required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Agenda must have at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Event organizer is required"],
    },
    tags: {
      type: [String],
      required: [true, "Event tags are required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Tags must have at least one item",
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Pre-save hook for slug generation and date normalization
 * - Generates URL-friendly slug from title if title is modified
 * - Normalizes date to ISO format and time to consistent format
 */
EventSchema.pre<IEvent>("save", function (next) {
  // Generate slug from title if title is modified or slug doesn't exist
  if (this.isModified("title") || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
  }

  // Normalize date to ISO format if it's a valid date string
  if (this.date) {
    const parsedDate = new Date(this.date);
    if (!isNaN(parsedDate.getTime())) {
      this.date = parsedDate.toISOString().split("T")[0]; // YYYY-MM-DD format
    }
  }

  // Normalize time format (remove extra spaces, convert to lowercase)
  if (this.time) {
    this.time = this.time.toLowerCase().trim();
  }

  next();
});

// Create and export Event model
export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
