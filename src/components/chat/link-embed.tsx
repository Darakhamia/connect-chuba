"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkEmbedProps {
  url: string;
}

interface EmbedData {
  type: "youtube" | "twitter" | "generic";
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  videoId?: string;
  tweetId?: string;
}

// Extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Extract Twitter/X tweet ID
function getTweetId(url: string): string | null {
  const pattern = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

// Determine embed type
function getEmbedType(url: string): EmbedData {
  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) {
    return {
      type: "youtube",
      videoId: youtubeId,
      title: "YouTube видео",
      siteName: "YouTube",
    };
  }

  const tweetId = getTweetId(url);
  if (tweetId) {
    return {
      type: "twitter",
      tweetId,
      title: "Твит",
      siteName: "X (Twitter)",
    };
  }

  return {
    type: "generic",
    title: new URL(url).hostname,
    siteName: new URL(url).hostname,
  };
}

// YouTube Embed
function YouTubeEmbed({ videoId }: { videoId: string }) {
  const [showVideo, setShowVideo] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  if (showVideo) {
    return (
      <div className="relative mt-2 rounded-lg overflow-hidden max-w-md">
        <div className="relative pt-[56.25%]">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <button
          onClick={() => setShowVideo(false)}
          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => setShowVideo(true)}
      className="relative mt-2 rounded-lg overflow-hidden max-w-md cursor-pointer group"
    >
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt="YouTube thumbnail"
          className="w-full h-auto rounded-lg"
          onError={(e) => {
            // Fallback to lower quality thumbnail
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition">
            <Play className="h-8 w-8 text-white fill-white ml-1" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-red-600 flex items-center justify-center">
            <Play className="h-3 w-3 text-white fill-white" />
          </div>
          <span className="text-white text-sm font-medium">YouTube</span>
        </div>
      </div>
    </div>
  );
}

// Generic link preview (with Open Graph data fetch simulation)
function GenericEmbed({ url, data }: { url: string; data: EmbedData }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 block max-w-md rounded-lg border border-border overflow-hidden hover:bg-muted/50 transition group"
    >
      <div className="flex">
        {data.image && (
          <div className="w-20 h-20 flex-shrink-0 bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <ExternalLink className="h-3 w-3" />
            <span className="truncate">{data.siteName}</span>
          </div>
          <p className="text-sm font-medium truncate group-hover:text-blue-500 transition">
            {data.title || url}
          </p>
          {data.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {data.description}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

export function LinkEmbed({ url }: LinkEmbedProps) {
  const [embedData, setEmbedData] = useState<EmbedData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const data = getEmbedType(url);
      setEmbedData(data);
    } catch {
      setError(true);
    }
  }, [url]);

  if (error || !embedData) return null;

  if (embedData.type === "youtube" && embedData.videoId) {
    return <YouTubeEmbed videoId={embedData.videoId} />;
  }

  return <GenericEmbed url={url} data={embedData} />;
}

// Extract URLs from message content
export function extractUrls(content: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  const matches = content.match(urlRegex);
  return matches || [];
}
