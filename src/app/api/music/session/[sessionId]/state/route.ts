import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { sessionId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const session = await db.musicSession.findUnique({
      where: { id: sessionId },
      include: {
        currentTrack: true,
        queue: {
          include: {
            track: true,
            addedBy: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            position: "asc",
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        permissions: {
          include: {
            profile: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return new NextResponse("Session not found", { status: 404 });
    }

    // Calculate current playback position if playing
    let currentPositionMs = session.offsetMs;
    if (session.state === "PLAYING" && session.startedAt) {
      const elapsed = Date.now() - session.startedAt.getTime();
      currentPositionMs = session.offsetMs + elapsed;
    }

    return NextResponse.json({
      ...session,
      currentPositionMs,
      serverTime: Date.now(),
    });
  } catch (error) {
    console.error("[MUSIC_STATE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
