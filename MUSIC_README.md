# 🎵 Echo Music System - MVP Implementation Guide

## Overview

Echo теперь поддерживает встроенную музыкальную систему! Пользователи могут слушать музыку вместе в голосовых каналах из различных источников.

## ✨ Features (MVP)

### Implemented
- ✅ YouTube playback (single videos + playlists)
- ✅ Uploaded audio files (mp3, m4a, ogg, wav, flac)
- ✅ Queue management (add, remove, reorder)
- ✅ Playback controls (play/pause, skip, volume, loop, shuffle)
- ✅ Real-time synchronization (<500ms drift correction)
- ✅ DJ permissions system
- ✅ Beautiful UI Music Panel
- ✅ Server-side state management

### Supported Sources (with limitations)
- ✅ **YouTube**: Full support via IFrame Player API
- ⚠️ **Spotify**: Metadata only (playback requires user Premium + OAuth) 
- ⚠️ **Apple Music**: Metadata only (playback requires MusicKit auth)
- 📋 **SoundCloud**: Coming soon
- ✅ **Uploaded Files**: Full support

## 🚀 Setup

### 1. Database Migration

```bash
cd ~/connect-chuba
npx prisma db push
```

Это создаст необходимые таблицы:
- `music_sessions`
- `tracks`
- `queue_items`
- `music_permissions`

### 2. Environment Variables

Добавьте в `.env`:

```env
# Required for YouTube support
YOUTUBE_API_KEY=your_youtube_api_key

# Optional: Spotify metadata
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Optional: Apple Music metadata
APPLE_MUSIC_TEAM_ID=your_team_id
APPLE_MUSIC_KEY_ID=your_key_id
APPLE_MUSIC_PRIVATE_KEY=your_private_key
```

### 3. Get API Keys

#### YouTube Data API v3
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable "YouTube Data API v3"
4. Create credentials (API Key)
5. Restrict key to YouTube Data API v3
6. Copy API key to `.env`

#### Spotify Web API (Optional)
1. Go to [Spotify for Developers](https://developer.spotify.com/dashboard)
2. Create an app
3. Copy Client ID and Client Secret
4. Add to `.env`

### 4. Rebuild & Restart

```bash
npm install --legacy-peer-deps
npm run build
pm2 restart connect-chuba
```

## 📖 Usage

### For Users

1. **Join a voice channel**
2. **Click the Music button** (🎵) in the channel header
3. **Add music**:
   - Paste a YouTube link
   - Upload an audio file
4. **Control playback**:
   - Play/Pause
   - Skip/Back
   - Volume
   - Loop (Off/One/All)
   - Shuffle
5. **Manage queue**:
   - View upcoming tracks
   - Remove tracks
   - Drag to reorder (coming soon)

### Permissions

**Who can control music?**
- Session creator (first person to add music)
- Server admins
- Server moderators
- Users with explicit DJ permission

**DJ Mode** (optional):
- Enable to restrict control to specific users
- Only admins can grant DJ permissions

## 🔧 API Reference

### Resolve URL
```typescript
POST /api/music/resolve
Body: { url: string }
Response: { type: "track" | "playlist", track?: Track, playlist?: Playlist }
```

### Start Session
```typescript
POST /api/music/session/start
Body: { serverId: string, voiceChannelId: string }
Response: MusicSession
```

### Add to Queue
```typescript
POST /api/music/session/:sessionId/queue
Body: { trackId: string } | { trackIds: string[] }
Response: QueueItem[]
```

### Control Playback
```typescript
POST /api/music/session/:sessionId/control
Body: { 
  action: "play" | "pause" | "skip" | "back" | "seek" | "volume" | "loop" | "shuffle",
  value?: number | string 
}
Response: MusicSession
```

### Get State
```typescript
GET /api/music/session/:sessionId/state
Response: MusicSession with currentPositionMs
```

## 🎯 How It Works

### Client-Side Playback
- Each user plays audio **locally** on their device
- NOT injected into voice channel (no audio mixing)
- Server manages state, clients stay synchronized

### Synchronization Strategy

1. **Initial Sync**:
   - Server broadcasts: `{ trackId, startedAt: timestamp, offsetMs }`
   - Client calculates local position: `(now - startedAt) + offsetMs`
   - Client seeks to position and plays

2. **Drift Correction**:
   - Every 5 seconds, client checks position vs expected
   - If drift > 500ms, client re-seeks
   - If drift > 3s, client pauses and resyncs

3. **Control Sync**:
   - User action → Server updates state → Broadcast to all clients
   - Clients apply changes immediately

### Playback Wrappers

**YouTube** (`youtube-player.tsx`):
- Uses YouTube IFrame Player API
- Hidden iframe player
- Full control API (play, pause, seek, volume)

**Uploaded Files** (`music-playback-manager.tsx`):
- Uses HTML5 `<audio>` element
- Signed URLs from UploadThing/S3
- Full control via native API

**Spotify/Apple Music** (stub):
- Currently resolves metadata only
- Playback requires:
  - Spotify: User Premium + OAuth + Web Playback SDK
  - Apple Music: Developer token + User token + MusicKit JS
  - Phase 2 implementation

## 🐛 Troubleshooting

### Music not playing?

1. **Check API keys**: `YOUTUBE_API_KEY` in `.env`
2. **Check console**: Open browser DevTools → Console
3. **YouTube errors**:
   - Error 2: Invalid video ID
   - Error 5: HTML5 player error
   - Error 100: Video not found / private
   - Error 101/150: Embeds disabled by video owner

### Synchronization issues?

1. **Check server time**: Use NTP on server
2. **Client drift**: Check browser console for sync logs
3. **Network latency**: High latency affects sync accuracy

### Queue not updating?

1. **Refresh session state**: API polling every 3 seconds
2. **Check permissions**: User must be in voice channel
3. **Database**: Verify `queue_items` table

## 📋 Roadmap (Phase 2)

- [ ] WebSocket events for real-time updates (currently polling)
- [ ] Spotify user authentication + playback
- [ ] Apple Music user authentication + playback
- [ ] SoundCloud support
- [ ] Search functionality (YouTube, Spotify)
- [ ] Playlists management
- [ ] History & favorites
- [ ] Vote skip system
- [ ] Chat commands (`/play`, `/queue`, etc.)
- [ ] Audio visualization
- [ ] Lyrics display
- [ ] Cross-fade between tracks

## 🛡️ Security & Legal

### Compliance
- ✅ Uses official APIs only
- ✅ No DRM bypass
- ✅ No ToS violations
- ✅ URL allowlist (SSRF prevention)
- ✅ Rate limiting
- ✅ File type validation
- ✅ Size limits

### Privacy
- Track metadata cached server-side
- User listening history NOT tracked (by design)
- Uploaded files owned by uploader

## 💡 Best Practices

### For Server Owners
1. Set appropriate volume limits
2. Configure DJ mode for busy servers
3. Monitor API quota usage (YouTube: 10,000 units/day)
4. Use rate limiting for uploads

### For Users
1. Respect copyright when uploading files
2. Use official links (YouTube, Spotify)
3. Don't spam the queue
4. Vote skip instead of force skip

## 📚 Technical Stack

- **Frontend**: React, TypeScript, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Playback**: YouTube IFrame API, HTML5 Audio
- **Sync**: Server timestamps + client-side drift correction
- **Storage**: UploadThing (for uploaded files)

## 🤝 Contributing

See `MUSIC_ARCHITECTURE.md` for detailed architecture and implementation notes.

---

**Built with ❤️ for Echo** 🎵
