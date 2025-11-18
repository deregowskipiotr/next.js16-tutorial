// app/api/test-db/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();

    return NextResponse.json({
      success: true,
      dbState: {
        readyState: mongoose.connection.readyState,
        dbName: mongoose.connection.db?.databaseName,
        host: mongoose.connection.host,
      },
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
