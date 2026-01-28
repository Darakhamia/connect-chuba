"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { LinkEmbed, extractUrls } from "./link-embed";

interface MessageContentProps {
  content: string;
  className?: string;
  showEmbeds?: boolean;
}

// Simple Markdown parser
function parseMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let key = 0;

  // Combined regex for all markdown patterns
  const patterns = [
    // Code blocks (must be first to prevent inner parsing)
    { regex: /```([\s\S]*?)```/g, type: "codeblock" },
    // Inline code
    { regex: /`([^`]+)`/g, type: "code" },
    // Spoilers
    { regex: /\|\|([^|]+)\|\|/g, type: "spoiler" },
    // Bold
    { regex: /\*\*([^*]+)\*\*/g, type: "bold" },
    // Italic (asterisk)
    { regex: /\*([^*]+)\*/g, type: "italic" },
    // Italic (underscore)
    { regex: /_([^_]+)_/g, type: "italic" },
    // Strikethrough
    { regex: /~~([^~]+)~~/g, type: "strike" },
    // Links
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: "link" },
    // URLs (auto-link)
    { regex: /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g, type: "url" },
    // Mentions
    { regex: /@(\w+)/g, type: "mention" },
  ];

  // Simple tokenizer
  let remaining = text;
  let lastIndex = 0;

  // First, handle code blocks separately
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const parts: { type: string; content: string; lang?: string; start: number; end: number }[] = [];
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    parts.push({
      type: "codeblock",
      content: match[2],
      lang: match[1] || undefined,
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  // Process text between code blocks
  let currentIndex = 0;
  const processedParts: React.ReactNode[] = [];

  for (const part of parts) {
    if (currentIndex < part.start) {
      // Process text before code block
      const textBefore = text.slice(currentIndex, part.start);
      processedParts.push(...parseInlineMarkdown(textBefore, key));
      key += 100;
    }

    // Add code block
    processedParts.push(
      <pre
        key={`codeblock-${key++}`}
        className="bg-zinc-900 text-zinc-100 rounded-md p-3 my-2 overflow-x-auto text-sm font-mono"
      >
        {part.lang && (
          <div className="text-xs text-zinc-500 mb-2">{part.lang}</div>
        )}
        <code>{part.content}</code>
      </pre>
    );

    currentIndex = part.end;
  }

  // Process remaining text after last code block
  if (currentIndex < text.length) {
    const remainingText = text.slice(currentIndex);
    processedParts.push(...parseInlineMarkdown(remainingText, key));
  }

  return processedParts.length > 0 ? processedParts : [text];
}

function parseInlineMarkdown(text: string, startKey: number): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let key = startKey;

  // Tokenize the text
  const tokenRegex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(_[^_]+_)|(~~[^~]+~~)|(\|\|[^|]+\|\|)|(\[([^\]]+)\]\(([^)]+)\))|(https?:\/\/[^\s<]+[^<.,:;"')\]\s])|(@\w+)/g;

  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const fullMatch = match[0];

    if (fullMatch.startsWith("`") && !fullMatch.startsWith("```")) {
      // Inline code
      nodes.push(
        <code
          key={`code-${key++}`}
          className="bg-zinc-800 text-zinc-100 px-1.5 py-0.5 rounded text-sm font-mono"
        >
          {fullMatch.slice(1, -1)}
        </code>
      );
    } else if (fullMatch.startsWith("**")) {
      // Bold
      nodes.push(
        <strong key={`bold-${key++}`} className="font-bold">
          {fullMatch.slice(2, -2)}
        </strong>
      );
    } else if (fullMatch.startsWith("*") || fullMatch.startsWith("_")) {
      // Italic
      nodes.push(
        <em key={`italic-${key++}`} className="italic">
          {fullMatch.slice(1, -1)}
        </em>
      );
    } else if (fullMatch.startsWith("~~")) {
      // Strikethrough
      nodes.push(
        <del key={`strike-${key++}`} className="line-through text-muted-foreground">
          {fullMatch.slice(2, -2)}
        </del>
      );
    } else if (fullMatch.startsWith("||")) {
      // Spoiler
      nodes.push(<SpoilerText key={`spoiler-${key++}`} text={fullMatch.slice(2, -2)} />);
    } else if (fullMatch.startsWith("[")) {
      // Link with text
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(fullMatch);
      if (linkMatch) {
        nodes.push(
          <a
            key={`link-${key++}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {linkMatch[1]}
          </a>
        );
      }
    } else if (fullMatch.startsWith("http")) {
      // Auto-linked URL
      nodes.push(
        <a
          key={`url-${key++}`}
          href={fullMatch}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline break-all"
        >
          {fullMatch}
        </a>
      );
    } else if (fullMatch.startsWith("@")) {
      // Mention
      nodes.push(
        <span
          key={`mention-${key++}`}
          className="bg-blue-500/20 text-blue-400 px-1 rounded cursor-pointer hover:bg-blue-500/30 transition"
        >
          {fullMatch}
        </span>
      );
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

// Spoiler component with reveal on click
function SpoilerText({ text }: { text: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <span
      onClick={() => setRevealed(!revealed)}
      className={cn(
        "px-1 rounded cursor-pointer transition-all duration-200",
        revealed
          ? "bg-zinc-700/50"
          : "bg-zinc-700 text-transparent hover:bg-zinc-600 select-none"
      )}
      title={revealed ? "Нажмите чтобы скрыть" : "Нажмите чтобы показать"}
    >
      {text}
    </span>
  );
}

export function MessageContent({ content, className, showEmbeds = true }: MessageContentProps) {
  const parsedContent = useMemo(() => parseMarkdown(content), [content]);
  const urls = useMemo(() => (showEmbeds ? extractUrls(content) : []), [content, showEmbeds]);

  return (
    <div className={cn("whitespace-pre-wrap break-words", className)}>
      <span>{parsedContent}</span>
      {/* Link embeds */}
      {urls.length > 0 && (
        <div className="mt-1 space-y-2">
          {urls.slice(0, 3).map((url, index) => (
            <LinkEmbed key={`${url}-${index}`} url={url} />
          ))}
        </div>
      )}
    </div>
  );
}
