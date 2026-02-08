import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    
    const room = searchParams.get("room");
    const username = searchParams.get("username");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!room) {
      return new NextResponse("Room missing", { status: 400 });
    }

    if (!username) {
      return new NextResponse("Username missing", { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return new NextResponse("LiveKit not configured", { status: 500 });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      metadata: JSON.stringify({ avatarUrl: profile.imageUrl }),
      ttl: "10m",
    });

    at.addGrant({
      roomJoin: true,
      room: room,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({ token, url: wsUrl });
  } catch (error) {
    console.log("[LIVEKIT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

