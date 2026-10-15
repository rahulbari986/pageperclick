import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const start = Date.now();
    await connectToDatabase();
    const readyState = mongoose.connection.readyState;
    const isConnected = readyState === 1;

    // Optional quick ping
    if (isConnected && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
    }

    const latencyMs = Date.now() - start;

    return NextResponse.json({
      success: true,
      connected: isConnected,
      readyState,
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        connected: false,
        readyState: mongoose.connection.readyState,
        error: error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 503 }
    );
  }
}
