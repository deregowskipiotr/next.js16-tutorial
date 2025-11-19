"use server";

import { Event } from "@/database/event.model";
import dbConnect from "../mongodb";


export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await dbConnect();
    const event = await Event.findOne({ slug });

    if (!event) {
      return []; // no event with this slug, so no similar events
    }

    return await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean();
  } catch (error) {
    console.error("getSimilarEventsBySlug error:", error);
    return [];
  }
};

/*export const getSimilarEventsBySlug = async (slug: string): Promise<unknown[]> => {
  try {
    await dbConnect();

    const event = await Event.findOne({ slug }).lean();
    if (!event) return [];

    return await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags }
    }).lean();
  } catch (err) {
    console.error('getSimilarEventsBySlug error:', err);
    return [];
  }
} */
