import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { UserStatus } from "@prisma/client";

export async function PATCH(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await req.json();

    // Validate status
    const validStatuses: UserStatus[] = ["ONLINE", "IDLE", "DND", "INVISIBLE", "OFFLINE"];
    if (!validStatuses.includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const updatedProfile = await db.profile.update({
      where: { id: profile.id },
      data: { status },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("[PROFILE_STATUS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
