import { RoomServiceClient } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room");

    if (!room) {
      return new NextResponse("Room missing", { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ participants: [] });
    }

    // Convert wss:// to https:// for the REST API
    const httpUrl = wsUrl.replace("wss://", "https://").replace("ws://", "http://");

    const svc = new RoomServiceClient(httpUrl, apiKey, apiSecret);

    try {
      const participants = await svc.listParticipants(room);
      const result = participants.map((p) => {
        let avatarUrl = "";
        try {
          const meta = JSON.parse(p.metadata || "{}");
          avatarUrl = meta.avatarUrl || "";
        } catch {}

        return {
          identity: p.identity,
          name: p.name || p.identity,
          avatarUrl,
        };
      });

      return NextResponse.json({ participants: result });
    } catch {
      // Room doesn't exist yet = no participants
      return NextResponse.json({ participants: [] });
    }
  } catch (error) {
    console.log("[LIVEKIT_PARTICIPANTS]", error);
    return NextResponse.json({ participants: [] });
  }
}
