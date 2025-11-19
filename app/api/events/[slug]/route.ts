import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Event } from "@/database";

// Type for API response
type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * GET /api/events/[slug]
 * Fetches event details by slug
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  console.log("🔍 [1] Starting GET /api/events/[slug]");

  try {
    // Step 1: Database connection
    console.log("🔍 [2] Attempting database connection...");
    await dbConnect();
    console.log("✅ [3] Database connected successfully");

    // Step 2: Extract params
    console.log("🔍 [4] Extracting params...");
    const { slug } = await params;
    console.log("✅ [5] Params extracted, slug:", slug);

    // Validate slug parameter
    console.log("🔍 [6] Validating slug...");
    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      console.log("❌ [7] Slug validation failed");
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing slug parameter",
        },
        { status: 400 }
      );
    }
    console.log("✅ [7] Slug validation passed");

    // Normalize slug (trim and lowercase for consistency)
    const normalizedSlug = slug.trim().toLowerCase();
    console.log("🔧 [8] Normalized slug:", normalizedSlug);

    // Step 3: Database query
    console.log("🔍 [9] Starting database query...");
    console.log("🔍 [10] Event model:", Event ? "defined" : "undefined");

    const event = await Event.findOne({ slug: normalizedSlug })
      .select("-__v")
      .lean()
      .exec();

    console.log("✅ [11] Database query completed");
    console.log(
      "📊 [12] Query result:",
      event ? "Event found" : "Event not found"
    );
    console.log("📋 [13] Event data:", event);

    // Handle event not found
    if (!event) {
      console.log("❌ [14] Event not found in database");
      return NextResponse.json(
        {
          success: false,
          error: `Event with slug '${normalizedSlug}' not found`,
        },
        { status: 404 }
      );
    }

    console.log("✅ [14] Event found, returning response");

    // Return successful response with event data
    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    // Detailed error logging
    console.error("🚨 [ERROR] Caught in catch block:");
    console.error(
      "📍 Error name:",
      error instanceof Error ? error.name : "Unknown"
    );
    console.error(
      "📍 Error message:",
      error instanceof Error ? error.message : error
    );
    console.error(
      "📍 Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );

    // Check if it's a Mongoose error
    if (error instanceof Error && error.name === "MongooseError") {
      console.error("📍 This is a Mongoose error");
    }

    // Return generic error message to client
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
