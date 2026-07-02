export async function searchYoutubeVideo(query: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return { videoId: "", thumbnail: "" };
  }

  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    type: "video",
    maxResults: "1",
    q: query,
    relevanceLanguage: "en",
  });

  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch YouTube video");
  }

  const data = (await response.json()) as {
    items?: Array<{ id?: { videoId?: string }; snippet?: { thumbnails?: { medium?: { url?: string } } } }>;
  };

  const firstItem = data.items?.[0];
  return {
    videoId: firstItem?.id?.videoId ?? "",
    thumbnail: firstItem?.snippet?.thumbnails?.medium?.url ?? "",
  };
}
