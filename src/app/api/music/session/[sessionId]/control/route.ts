import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { canControlMusic } from "@/lib/music/permissions";

type ControlAction = "play" | "pause" | "skip" | "back" | "seek" | "volume" | "loop" | "shuffle";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { sessionId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { action, value }: { action: ControlAction; value?: number | string } = await req.json();

    if (!action) {
      return new NextResponse("Action required", { status: 400 });
    }

    // Get session
    const session = await db.musicSession.findUnique({
      where: { id: sessionId },
      include: {
        queue: {
          include: {
            track: true,
          },
          orderBy: {
            position: "asc",
          },
        },
        currentTrack: true,
      },
    });

    if (!session) {
      return new NextResponse("Session not found", { status: 404 });
    }

    // Check permissions
    const hasPermission = await canControlMusic(sessionId, profile.id, session.serverId);
    if (!hasPermission) {
      return new NextResponse("You don't have permission to control music", { status: 403 });
    }

    // Handle different actions
    let updatedSession;

    switch (action) {
      case "play":
        updatedSession = await db.musicSession.update({
          where: { id: sessionId },
          data: {
            state: "PLAYING",
            startedAt: new Date(),
          },
        });
        break;

      case "pause":
        // Calculate current offset before pausing
        const elapsed = session.startedAt
          ? Date.now() - session.startedAt.getTime()
          : 0;
        updatedSession = await db.musicSession.update({
          where: { id: sessionId },
          data: {
            state: "PAUSED",
            offsetMs: session.offsetMs + elapsed,
          },
        });
        break;

      case "skip":
        // Move to next track in queue
        if (session.queue.length === 0) {
          // No more tracks, stop playback
          updatedSession = await db.musicSession.update({
            where: { id: sessionId },
            data: {
              state: "IDLE",
              currentTrackId: null,
              startedAt: null,
              offsetMs: 0,
            },
          });
        } else {
          const nextTrack = session.queue[0];
          
          // Remove from queue
          await db.queueItem.delete({
            where: { id: nextTrack.id },
          });

          // Update session with new track
          updatedSession = await db.musicSession.update({
            where: { id: sessionId },
            data: {
              currentTrackId: nextTrack.trackId,
              startedAt: new Date(),
              offsetMs: 0,
              state: "PLAYING",
            },
          });

          // Reorder queue
          const remainingQueue = await db.queueItem.findMany({
            where: { sessionId },
            orderBy: { position: "asc" },
          });

          await Promise.all(
            remainingQueue.map((item, index) =>
              db.queueItem.update({
                where: { id: item.id },
                data: { position: index + 1 },
              })
            )
          );
        }
        break;

      case "back":
        // For now, just restart current track
        updatedSession = await db.musicSession.update({
          where: { id: sessionId },
          data: {
            startedAt: new Date(),
            offsetMs: 0,
          },
        });
        break;

      case "seek":
        if (typeof value !== "number") {
          return new NextResponse("Seek value must be a number (milliseconds)", { status: 400 });
        }
        updatedSession = await db.musicSession.update({
          where: { id: sessionId },
          data: {
            offsetMs: value,
            startedAt: new Date(),
          },
        });
        break;

      case "volume":
        if (typeof value !== "number" || value < 0 || value > 100) {
          return new NextResponse("Volume must be between 0-100", { status: 400 });
        }
        updatedSession = await db.musicSession.update({
          where: { id: sessionId },
          data: {
            volume: Math.round(value),
          },
        });
        break;

      case "loop":
        if (value !== "OFF" && value !== "ONE" && value !== "ALL") {
          return new NextResponse("Loop mode must be OFF, ONE, or ALL", { status: 400 });
        }
        updatedSession = await db.musicSession.update({
          where: { id: sessionId },
          data: {
            loopMode: value,
          },
        });
        break;

      case "shuffle":
        updatedSession = await db.musicSession.update({
          where: { id: sessionId },
          data: {
            shuffle: !session.shuffle,
          },
        });
        
        // If shuffle is now ON, randomize queue
        if (!session.shuffle) {
          const queue = await db.queueItem.findMany({
            where: { sessionId },
          });

          // Shuffle array
          const shuffled = [...queue].sort(() => Math.random() - 0.5);

          await Promise.all(
            shuffled.map((item, index) =>
              db.queueItem.update({
                where: { id: item.id },
                data: { position: index + 1 },
              })
            )
          );
        }
        break;

      default:
        return new NextResponse("Invalid action", { status: 400 });
    }

    // Get updated session with relations
    const finalSession = await db.musicSession.findUnique({
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
      },
    });

    return NextResponse.json(finalSession);
  } catch (error) {
    console.error("[MUSIC_CONTROL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
