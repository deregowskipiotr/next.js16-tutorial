import { Event } from "@/database/event.model";
import { v2 as cloudinary } from "cloudinary";
import dbConnect from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    console.log("🟢 [POST /api/events] Starting event creation...");

    const formData = await req.formData();
    let event;

    try {
      event = Object.fromEntries(formData.entries());
      console.log("📦 Form data received:", Object.keys(event));
    } catch (e) {
      console.error("❌ Form data parsing error:", e);
      return NextResponse.json(
        { message: "Invalid JSON data format" },
        { status: 400 }
      );
    }

    const image = formData.get("image");
    console.log("🖼️ Image field analysis:", {
      type: typeof image,
      isFile: image instanceof File,
      isString: typeof image === "string",
      value:
        typeof image === "string"
          ? image.substring(0, 100) + "..."
          : "Not a string",
    });

    // Handle image as URL string
    if (typeof image === "string") {
      console.log("🔗 Using image as URL string");
      event.image = image;
      console.log("📸 Image URL set to:", event.image);
    }
    // Handle image as file upload
    else if (image instanceof File) {
      console.log("📎 Handling image as file upload");
      console.log("📄 File details:", {
        name: image.name,
        type: image.type,
        size: image.size,
      });

      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log("☁️ Uploading to Cloudinary...");
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "image", folder: "DevEvent" },
            (error, result) => {
              if (error) {
                console.error("❌ Cloudinary upload error:", error);
                return reject(error);
              }
              console.log("✅ Cloudinary upload successful");
              resolve(result);
            }
          )
          .end(buffer);
      });

      event.image = (uploadResult as { secure_url: string }).secure_url;
      console.log("🖼️ Cloudinary URL:", event.image);
    } else {
      console.log("❌ No valid image provided");
      return NextResponse.json(
        { message: "Image (file or URL string) is required" },
        { status: 400 }
      );
    }

    // Parse tags and agenda
    const tagsInput = formData.get("tags");
    const agendaInput = formData.get("agenda");

    console.log("🏷️ Tags input:", tagsInput);
    console.log("📋 Agenda input:", agendaInput);

    const tags = tagsInput ? JSON.parse(tagsInput as string) : [];
    const agenda = agendaInput ? JSON.parse(agendaInput as string) : [];

    console.log("🔧 Final event data before creation:", {
      title: event.title,
      image: event.image,
      tagsCount: tags.length,
      agendaCount: agenda.length,
    });

    const createdEvent = await Event.create({
      ...event,
      tags,
      agenda,
    });

    console.log("✅ Event created successfully:", {
      id: createdEvent._id,
      title: createdEvent.title,
      image: createdEvent.image,
      slug: createdEvent.slug,
    });

    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent },
      { status: 201 }
    );
  } catch (e) {
    console.error("❌ [POST /api/events] Critical error:", e);
    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: e instanceof Error ? e.message : "Unknown",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    console.log("🟢 [GET /api/events] Fetching all events...");

    const events = await Event.find().sort({ createdAt: -1 });
    console.log(`📊 Found ${events.length} events in database`);

    // Debug each event's image
    events.forEach((event, index) => {
      console.log(`🎯 Event ${index + 1}:`, {
        title: event.title,
        slug: event.slug,
        image: event.image,
        hasImage: !!event.image,
        imageLength: event.image?.length,
        isHttpUrl: event.image?.startsWith("http"),
        isDataUrl: event.image?.startsWith("data:"),
        imagePreview: event.image
          ? event.image.substring(0, 80) + "..."
          : "NO IMAGE",
      });
    });

    return NextResponse.json(
      { message: "Events fetched successfully", events },
      { status: 200 }
    );
  } catch (e) {
    console.error("❌ [GET /api/events] Error:", e);
    return NextResponse.json(
      { message: "Event fetching failed", error: e },
      { status: 500 }
    );
  }
}
