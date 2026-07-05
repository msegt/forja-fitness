import { NextRequest, NextResponse } from "next/server";
import { searchYoutubeVideo } from "@/lib/youtube";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const { videoId, thumbnail } = await searchYoutubeVideo(query);
    return NextResponse.json({ videoId, thumbnail, url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : "" });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Unable to fetch video", ...(process.env.NODE_ENV !== "production" ? { detail } : {}) },
      { status: 500 },
    );
  }
}
