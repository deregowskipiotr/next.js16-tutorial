// app/api/events/debug/all/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Event } from "@/database";

export async function GET() {
  try {
    await dbConnect();

    const events = await Event.find()
      .select("title slug createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      totalEvents: events.length,
      events: events.map((event) => ({
        title: event.title,
        slug: event.slug,
        id: event._id,
        createdAt: event.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}

