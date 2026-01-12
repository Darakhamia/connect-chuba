import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { resolveUrl } from "@/lib/music/url-resolver";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new NextResponse("URL required", { status: 400 });
    }

    // Resolve URL and get metadata
    const result = await resolveUrl(url);

    if (result.type === "track") {
      // Check if track already exists in cache
      let track = await db.track.findUnique({
        where: {
          source_sourceId: {
            source: result.track.source,
            sourceId: result.track.sourceId,
          },
        },
      });

      // If not, create it
      if (!track) {
        track = await db.track.create({
          data: {
            source: result.track.source,
            sourceId: result.track.sourceId,
            title: result.track.title,
            artist: result.track.artist,
            durationMs: result.track.durationMs,
            thumbnailUrl: result.track.thumbnailUrl,
            originalUrl: result.track.originalUrl,
            metadata: result.track.metadata as any,
          },
        });
      }

      return NextResponse.json({ type: "track", track });
    } else {
      // Playlist - cache all tracks
      const tracks = await Promise.all(
        result.playlist.tracks.map(async (trackData) => {
          let track = await db.track.findUnique({
            where: {
              source_sourceId: {
                source: trackData.source,
                sourceId: trackData.sourceId,
              },
            },
          });

          if (!track) {
            track = await db.track.create({
              data: {
                source: trackData.source,
                sourceId: trackData.sourceId,
                title: trackData.title,
                artist: trackData.artist,
                durationMs: trackData.durationMs,
                thumbnailUrl: trackData.thumbnailUrl,
                originalUrl: trackData.originalUrl,
                metadata: trackData.metadata as any,
              },
            });
          }

          return track;
        })
      );

      return NextResponse.json({
        type: "playlist",
        playlist: {
          title: result.playlist.title,
          tracks,
        },
      });
    }
  } catch (error) {
    console.error("[MUSIC_RESOLVE]", error);
    const message = error instanceof Error ? error.message : "Internal Error";
    return new NextResponse(message, { status: 500 });
  }
}
