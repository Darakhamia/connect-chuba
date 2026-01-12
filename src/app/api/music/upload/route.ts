import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { TrackSource } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { fileUrl, filename, durationMs } = await req.json();

    if (!fileUrl || !filename) {
      return new NextResponse("File URL and filename required", { status: 400 });
    }

    // Validate file type
    const ext = filename.toLowerCase().split(".").pop();
    const allowedTypes = ["mp3", "m4a", "ogg", "wav", "flac"];
    
    if (!ext || !allowedTypes.includes(ext)) {
      return new NextResponse("Invalid file type. Allowed: mp3, m4a, ogg, wav, flac", { status: 400 });
    }

    // Create track record
    const track = await db.track.create({
      data: {
        source: TrackSource.UPLOADED,
        sourceId: fileUrl.split("/").pop() || fileUrl, // Use filename as sourceId
        title: filename.replace(/\.[^/.]+$/, ""), // Remove extension
        durationMs: durationMs || 0,
        originalUrl: fileUrl,
        uploadedFileUrl: fileUrl,
        uploadedById: profile.id,
      },
    });

    return NextResponse.json({ track });
  } catch (error) {
    console.error("[MUSIC_UPLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
