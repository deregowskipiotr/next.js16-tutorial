'use server';

import { Booking } from "../../database/booking.model";
import dbConnect from "../mongodb";

export const createBooking = async ({ eventId, slug, email }: { eventId: string; slug: string; email: string }) => {
  try {
    await dbConnect();
    
    await Booking.create({ eventId, slug, email });

    return { success: true };
  } catch (e) {
    console.log('createBooking error:', e);
    return { success: false };
  }
}