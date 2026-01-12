import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { isInVoiceChannel } from "@/lib/music/permissions";

// GET queue for a session
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

    if (!session) {
      return new NextResponse("Session not found", { status: 404 });
    }

    return NextResponse.json(session.queue);
  } catch (error) {
    console.error("[MUSIC_QUEUE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST add track(s) to queue
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

    const body = await req.json();
    const trackIds = Array.isArray(body.trackIds) ? body.trackIds : [body.trackId];

    if (!trackIds.length) {
      return new NextResponse("Track ID(s) required", { status: 400 });
    }

    // Get session
    const session = await db.musicSession.findUnique({
      where: { id: sessionId },
      include: {
        queue: true,
      },
    });

    if (!session) {
      return new NextResponse("Session not found", { status: 404 });
    }

    // Verify user is in voice channel
    const inVC = await isInVoiceChannel(session.voiceChannelId, profile.id);
    if (!inVC) {
      return new NextResponse("You must be in the voice channel", { status: 403 });
    }

    // Get current max position
    const maxPosition = session.queue.reduce(
      (max, item) => Math.max(max, item.position),
      0
    );

    // Add tracks to queue
    const queueItems = await Promise.all(
      trackIds.map((trackId, index) =>
        db.queueItem.create({
          data: {
            sessionId,
            trackId,
            addedById: profile.id,
            position: maxPosition + index + 1,
          },
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
        })
      )
    );

    // If session is IDLE and we just added tracks, auto-start playing
    if (session.state === "IDLE" && queueItems.length > 0) {
      const firstTrack = queueItems[0];
      await db.musicSession.update({
        where: { id: sessionId },
        data: {
          state: "PLAYING",
          currentTrackId: firstTrack.trackId,
          startedAt: new Date(),
          offsetMs: 0,
        },
      });

      // Remove from queue since it's now playing
      await db.queueItem.delete({
        where: { id: firstTrack.id },
      });
    }

    return NextResponse.json(queueItems);
  } catch (error) {
    console.error("[MUSIC_QUEUE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE remove track from queue
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { sessionId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queueItemId = searchParams.get("itemId");

    if (!queueItemId) {
      return new NextResponse("Queue item ID required", { status: 400 });
    }

    // Get queue item
    const queueItem = await db.queueItem.findUnique({
      where: { id: queueItemId },
      include: {
        session: true,
      },
    });

    if (!queueItem || queueItem.sessionId !== sessionId) {
      return new NextResponse("Queue item not found", { status: 404 });
    }

    // Verify user is in voice channel
    const inVC = await isInVoiceChannel(queueItem.session.voiceChannelId, profile.id);
    if (!inVC) {
      return new NextResponse("You must be in the voice channel", { status: 403 });
    }

    // Only the user who added the track (or DJ/admin) can remove it
    // For now, allow anyone in VC to remove (can add permission check later)

    // Delete queue item
    await db.queueItem.delete({
      where: { id: queueItemId },
    });

    // Reorder remaining items
    const remainingItems = await db.queueItem.findMany({
      where: { sessionId },
      orderBy: { position: "asc" },
    });

    await Promise.all(
      remainingItems.map((item, index) =>
        db.queueItem.update({
          where: { id: item.id },
          data: { position: index + 1 },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MUSIC_QUEUE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
