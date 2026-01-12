import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const profile = await currentProfile();
    const { serverId } = await params;

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
      name,
      description,
      imageUrl,
      bannerUrl,
      region,
      verificationLevel,
      explicitContentFilter,
      defaultNotifications,
      autoModEnabled,
      antiSpamEnabled,
      antiRaidEnabled,
      filterWords,
    } = await req.json();

    // Check if user is the owner of the server
    const server = await db.server.findFirst({
      where: {
        id: serverId,
        profileId: profile.id,
      },
    });

    if (!server) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Update server settings
    const updatedServer = await db.server.update({
      where: {
        id: serverId,
      },
      data: {
        name,
        description,
        imageUrl,
        bannerUrl,
        region,
        verificationLevel,
        explicitContentFilter,
        defaultNotifications,
        autoModEnabled,
        antiSpamEnabled,
        antiRaidEnabled,
        filterWords,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        serverId,
        userId: profile.userId,
        action: "SERVER_SETTINGS_UPDATE",
        targetType: "SERVER",
        targetId: serverId,
        changes: {
          before: server,
          after: updatedServer,
        },
      },
    });

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.error("[SERVER_SETTINGS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
