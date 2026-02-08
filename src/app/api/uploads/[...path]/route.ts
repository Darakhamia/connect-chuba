import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filename = path.join("/");

    // Prevent directory traversal
    if (filename.includes("..") || filename.includes("~")) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const mimeType = MIME_TYPES[ext];

    if (!mimeType) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const filePath = join(process.cwd(), "public", "uploads", filename);

    if (!existsSync(filePath)) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const data = await readFile(filePath);

    return new NextResponse(data, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
