import { TrackSource } from "@prisma/client";

export interface ResolvedTrack {
  source: TrackSource;
  sourceId: string;
  title: string;
  artist?: string;
  durationMs: number;
  thumbnailUrl?: string;
  originalUrl: string;
  metadata?: Record<string, unknown>;
}

export interface ResolvedPlaylist {
  title: string;
  tracks: ResolvedTrack[];
}

export type ResolveResult = 
  | { type: "track"; track: ResolvedTrack }
  | { type: "playlist"; playlist: ResolvedPlaylist };

/**
 * URL patterns for different music sources
 */
const URL_PATTERNS = {
  youtube: [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
  ],
  spotify: [
    /spotify\.com\/track\/([a-zA-Z0-9]+)/,
    /spotify\.com\/playlist\/([a-zA-Z0-9]+)/,
    /spotify\.com\/album\/([a-zA-Z0-9]+)/,
  ],
  appleMusic: [
    /music\.apple\.com\/[a-z]{2}\/song\/[^/]+\/(\d+)/,
    /music\.apple\.com\/[a-z]{2}\/playlist\/[^/]+\/(pl\.[a-zA-Z0-9]+)/,
    /music\.apple\.com\/[a-z]{2}\/album\/[^/]+\/(\d+)/,
  ],
  soundcloud: [
    /soundcloud\.com\/[^/]+\/[^/]+/,
    /soundcloud\.com\/[^/]+\/sets\/[^/]+/,
  ],
};

/**
 * Detect source from URL
 */
export function detectSource(url: string): TrackSource | null {
  const lowerUrl = url.toLowerCase();

  for (const pattern of URL_PATTERNS.youtube) {
    if (pattern.test(lowerUrl)) {
      return TrackSource.YOUTUBE;
    }
  }

  for (const pattern of URL_PATTERNS.spotify) {
    if (pattern.test(lowerUrl)) {
      return TrackSource.SPOTIFY;
    }
  }

  for (const pattern of URL_PATTERNS.appleMusic) {
    if (pattern.test(lowerUrl)) {
      return TrackSource.APPLE_MUSIC;
    }
  }

  for (const pattern of URL_PATTERNS.soundcloud) {
    if (pattern.test(lowerUrl)) {
      return TrackSource.SOUNDCLOUD;
    }
  }

  return null;
}

/**
 * YouTube resolver using YouTube Data API v3
 */
export async function resolveYoutube(url: string): Promise<ResolveResult> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) {
    throw new Error("YouTube API key not configured");
  }

  // Check if it's a playlist
  const playlistMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (playlistMatch) {
    return resolveYoutubePlaylist(playlistMatch[1], API_KEY);
  }

  // Otherwise it's a single video
  const videoMatch = url.match(/(?:v=|\/|be\/)([a-zA-Z0-9_-]{11})/);
  if (!videoMatch) {
    throw new Error("Invalid YouTube URL");
  }

  const videoId = videoMatch[1];
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${API_KEY}`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error("Video not found");
  }

  const video = data.items[0];
  const durationMs = parseDuration(video.contentDetails.duration);

  return {
    type: "track",
    track: {
      source: TrackSource.YOUTUBE,
      sourceId: videoId,
      title: video.snippet.title,
      artist: video.snippet.channelTitle,
      durationMs,
      thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
      originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
      metadata: {
        channelId: video.snippet.channelId,
        publishedAt: video.snippet.publishedAt,
      },
    },
  };
}

/**
 * Resolve YouTube playlist
 */
async function resolveYoutubePlaylist(
  playlistId: string,
  apiKey: string
): Promise<ResolveResult> {
  const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet,contentDetails&maxResults=50&key=${apiKey}`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error("Playlist is empty or not found");
  }

  // Fetch video durations (requires separate API call)
  const videoIds = data.items.map((item: any) => item.contentDetails.videoId).join(",");
  const videosUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoIds}&part=contentDetails&key=${apiKey}`;
  
  const videosResponse = await fetch(videosUrl);
  const videosData = await videosResponse.json();
  
  const durationsMap = new Map();
  videosData.items?.forEach((video: any) => {
    durationsMap.set(video.id, parseDuration(video.contentDetails.duration));
  });

  const tracks: ResolvedTrack[] = data.items.map((item: any) => ({
    source: TrackSource.YOUTUBE,
    sourceId: item.contentDetails.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    durationMs: durationsMap.get(item.contentDetails.videoId) || 0,
    thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    originalUrl: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`,
  }));

  return {
    type: "playlist",
    playlist: {
      title: data.items[0]?.snippet?.channelTitle || "YouTube Playlist",
      tracks,
    },
  };
}

/**
 * Parse ISO 8601 duration to milliseconds (PT1H2M10S -> ms)
 */
function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

/**
 * Spotify resolver (MVP: basic track info)
 * Note: Requires Spotify API credentials
 */
export async function resolveSpotify(url: string): Promise<ResolveResult> {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Spotify API credentials not configured");
  }

  // Get access token
  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to get Spotify access token");
  }

  const { access_token } = await tokenResponse.json();

  // Parse URL to get track/playlist ID
  const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/);
  if (trackMatch) {
    return resolveSpotifyTrack(trackMatch[1], access_token);
  }

  const playlistMatch = url.match(/playlist\/([a-zA-Z0-9]+)/);
  if (playlistMatch) {
    return resolveSpotifyPlaylist(playlistMatch[1], access_token);
  }

  throw new Error("Invalid Spotify URL");
}

async function resolveSpotifyTrack(trackId: string, token: string): Promise<ResolveResult> {
  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Spotify track");
  }

  const track = await response.json();

  return {
    type: "track",
    track: {
      source: TrackSource.SPOTIFY,
      sourceId: track.id,
      title: track.name,
      artist: track.artists.map((a: any) => a.name).join(", "),
      durationMs: track.duration_ms,
      thumbnailUrl: track.album.images[0]?.url,
      originalUrl: track.external_urls.spotify,
      metadata: {
        album: track.album.name,
        releaseDate: track.album.release_date,
        uri: track.uri,
      },
    },
  };
}

async function resolveSpotifyPlaylist(playlistId: string, token: string): Promise<ResolveResult> {
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Spotify playlist");
  }

  const playlist = await response.json();
  const tracks: ResolvedTrack[] = playlist.tracks.items.map((item: any) => ({
    source: TrackSource.SPOTIFY,
    sourceId: item.track.id,
    title: item.track.name,
    artist: item.track.artists.map((a: any) => a.name).join(", "),
    durationMs: item.track.duration_ms,
    thumbnailUrl: item.track.album.images[0]?.url,
    originalUrl: item.track.external_urls.spotify,
    metadata: {
      uri: item.track.uri,
    },
  }));

  return {
    type: "playlist",
    playlist: {
      title: playlist.name,
      tracks,
    },
  };
}

/**
 * Main resolver function
 */
export async function resolveUrl(url: string): Promise<ResolveResult> {
  const source = detectSource(url);

  if (!source) {
    throw new Error("Unsupported URL or invalid format");
  }

  switch (source) {
    case TrackSource.YOUTUBE:
      return resolveYoutube(url);
    case TrackSource.SPOTIFY:
      return resolveSpotify(url);
    case TrackSource.APPLE_MUSIC:
      throw new Error("Apple Music support coming soon");
    case TrackSource.SOUNDCLOUD:
      throw new Error("SoundCloud support coming soon");
    default:
      throw new Error("Unsupported source");
  }
}
