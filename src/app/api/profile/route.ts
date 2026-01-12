import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// PATCH - Обновить профиль
export async function PATCH(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, bio, imageUrl } = await req.json();

    // Валидация имени
    if (name && (name.length < 2 || name.length > 32)) {
      return new NextResponse("Name must be between 2 and 32 characters", { status: 400 });
    }

    // Валидация bio
    if (bio && bio.length > 190) {
      return new NextResponse("Bio must be less than 190 characters", { status: 400 });
    }

    const updatedProfile = await db.profile.update({
      where: { id: profile.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(imageUrl && { imageUrl }),
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// GET - Получить текущий профиль
export async function GET() {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
