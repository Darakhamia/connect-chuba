# 🎵 Echo Music System Architecture

## Overview
Built-in music playback system for Echo that allows users to play synchronized music in voice channels from multiple sources (YouTube, Spotify, Apple Music, SoundCloud, uploaded files).

## Core Principles
1. **Legal Compliance**: Use official APIs/SDKs only. No DRM bypass or ToS violations.
2. **Client-Side Playback**: Audio plays locally on each client (not streamed through voice).
3. **Server as Source of Truth**: Backend manages state, queue, and synchronization.
4. **Real-Time Sync**: WebSocket events keep all clients in sync with <500ms drift.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Music Panel UI  │  Voice Channel View  │  Chat Commands    │
│  - Input/Upload  │  - Now Playing Pill  │  - /play, /queue  │
│  - Queue List    │  - Quick Controls    │  - /skip, /pause  │
│  - Controls      │                      │                   │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
               ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     PLAYBACK LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  YouTube    │  Spotify   │  Apple     │ SoundCloud │ Audio │
│  Wrapper    │  Wrapper   │  Wrapper   │  Wrapper   │ File  │
│  (IFrame)   │  (SDK)     │  (MusicKit)│  (Widget)  │ (HTML5)│
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
               ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    WEBSOCKET LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Events: session_state, queue_updated, now_playing,        │
│          control_ack, sync_ping, error                      │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  /api/music/resolve          - URL metadata resolver       │
│  /api/music/upload           - Audio file upload           │
│  /api/music/session/start    - Create music session        │
│  /api/music/session/:id/queue - Manage queue               │
│  /api/music/session/:id/control - Playback controls        │
│  /api/music/session/:id/state - Get current state          │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  MusicSessionService  │  URLResolverService  │  QueueService│
│  - Session lifecycle  │  - YouTube resolver  │  - Add track │
│  - Permissions        │  - Spotify resolver  │  - Reorder   │
│  - State management   │  - Apple resolver    │  - Remove    │
│                       │  - SoundCloud resolver│             │
│                       │  - Metadata cache     │             │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL (Prisma)          │  Redis (Optional)           │
│  - MusicSession               │  - Pub/Sub for multi-node   │
│  - Track (metadata cache)     │  - Session state cache      │
│  - QueueItem                  │                             │
│  - MusicPermission            │                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Models

### MusicSession
```prisma
model MusicSession {
  id              String   @id @default(uuid())
  serverId        String
  voiceChannelId  String
  createdById     String
  state           MusicSessionState @default(IDLE)
  currentTrackId  String?
  startedAt       DateTime?
  offsetMs        Int      @default(0)
  loopMode        LoopMode @default(OFF)
  shuffle         Boolean  @default(false)
  volume          Int      @default(100)
  djMode          Boolean  @default(false)
  
  server          Server   @relation(...)
  channel         Channel  @relation(...)
  createdBy       Profile  @relation(...)
  currentTrack    Track?   @relation(...)
  queue           QueueItem[]
  permissions     MusicPermission[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum MusicSessionState {
  IDLE
  PLAYING
  PAUSED
  LOADING
}

enum LoopMode {
  OFF
  ONE
  ALL
}
```

### Track
```prisma
model Track {
  id            String   @id @default(uuid())
  source        TrackSource
  sourceId      String   // YouTube video ID, Spotify URI, etc.
  title         String
  artist        String?
  durationMs    Int
  thumbnailUrl  String?
  originalUrl   String
  metadata      Json?    // Extra metadata
  
  uploadedFile  String?  // S3 key for uploaded files
  uploadedById  String?
  uploadedBy    Profile? @relation(...)
  
  createdAt     DateTime @default(now())
  
  @@unique([source, sourceId])
}

enum TrackSource {
  YOUTUBE
  SPOTIFY
  APPLE_MUSIC
  SOUNDCLOUD
  UPLOADED
}
```

### QueueItem
```prisma
model QueueItem {
  id         String   @id @default(uuid())
  sessionId  String
  trackId    String
  addedById  String
  position   Int
  
  session    MusicSession @relation(...)
  track      Track        @relation(...)
  addedBy    Profile      @relation(...)
  
  createdAt  DateTime @default(now())
  
  @@index([sessionId, position])
}
```

### MusicPermission
```prisma
model MusicPermission {
  id         String   @id @default(uuid())
  sessionId  String
  profileId  String
  canControl Boolean  @default(true)
  
  session    MusicSession @relation(...)
  profile    Profile      @relation(...)
  
  createdAt  DateTime @default(now())
  
  @@unique([sessionId, profileId])
}
```

## API Endpoints

### POST /api/music/resolve
**Purpose**: Resolve URL and fetch metadata
**Body**: `{ url: string }`
**Response**: `{ track: Track, playlist?: Track[] }`
**Logic**:
1. Detect source by URL pattern
2. Call appropriate resolver (YouTube API, Spotify API, etc.)
3. Cache metadata in Track table
4. Return normalized data

### POST /api/music/upload
**Purpose**: Initialize audio file upload
**Body**: `{ filename: string, size: number, mimeType: string }`
**Response**: `{ uploadUrl: string, trackId: string }`
**Logic**:
1. Validate file type and size
2. Generate signed upload URL (S3/UploadThing)
3. Create Track record with UPLOADED source
4. Return upload URL

### POST /api/music/session/start
**Purpose**: Create or get music session for voice channel
**Body**: `{ serverId: string, voiceChannelId: string }`
**Response**: `{ session: MusicSession }`
**Logic**:
1. Check if session exists for VC
2. If not, create new session
3. Set creator as DJ
4. Return session

### POST /api/music/session/:id/queue/add
**Purpose**: Add track(s) to queue
**Body**: `{ trackId: string } | { trackIds: string[] }`
**Response**: `{ queue: QueueItem[] }`
**Logic**:
1. Verify user is in voice channel
2. Add track(s) to queue
3. Emit queue_updated event
4. If session idle, auto-start

### POST /api/music/session/:id/control
**Purpose**: Control playback (play/pause/skip/seek)
**Body**: `{ action: 'play' | 'pause' | 'skip' | 'back' | 'seek', value?: number }`
**Response**: `{ session: MusicSession }`
**Logic**:
1. Verify user has control permission
2. Update session state
3. Emit control event with sync data
4. Return updated session

### GET /api/music/session/:id/state
**Purpose**: Get current session state
**Response**: `{ session: MusicSession, queue: QueueItem[] }`

## WebSocket Events

### Server → Client

#### `music:session_state`
```typescript
{
  sessionId: string;
  state: MusicSessionState;
  currentTrack: Track | null;
  startedAt: number; // Server timestamp
  offsetMs: number;
  volume: number;
  loopMode: LoopMode;
  shuffle: boolean;
}
```

#### `music:queue_updated`
```typescript
{
  sessionId: string;
  queue: QueueItem[];
}
```

#### `music:now_playing`
```typescript
{
  sessionId: string;
  track: Track;
  startedAt: number;
  offsetMs: number;
}
```

#### `music:sync_ping`
```typescript
{
  sessionId: string;
  serverTime: number;
  expectedOffset: number;
}
```

### Client → Server

#### `music:join_session`
```typescript
{
  sessionId: string;
}
```

#### `music:heartbeat`
```typescript
{
  sessionId: string;
  clientOffset: number;
  drift: number;
}
```

## Playback Synchronization Strategy

1. **Initial Sync**:
   - Server emits `now_playing` with `startedAt` (server timestamp) and `offsetMs`
   - Client calculates local offset: `localOffset = (Date.now() - startedAt) + offsetMs`
   - Client seeks to `localOffset` and starts playback

2. **Drift Correction**:
   - Every 5 seconds, server emits `sync_ping` with expected offset
   - Client compares actual position with expected
   - If drift > 500ms, client seeks to correct position
   - If drift > 3s, client pauses and resyncs

3. **Control Sync**:
   - Play/Pause/Seek commands update server state first
   - Server broadcasts new state to all clients
   - Clients adjust immediately

## URL Resolver Implementation

### YouTube
- Pattern: `youtube.com/watch?v=`, `youtu.be/`
- API: YouTube Data API v3
- Endpoint: `videos?id={videoId}&part=snippet,contentDetails`
- Extract: title, duration, thumbnail, channel

### Spotify
- Pattern: `open.spotify.com/track/`, `open.spotify.com/playlist/`
- API: Spotify Web API
- Auth: Client Credentials flow
- Extract: track name, artist, duration, album art, URI

### Apple Music
- Pattern: `music.apple.com/`
- API: Apple Music API
- Auth: Developer token (JWT)
- Extract: title, artist, duration, artwork

### SoundCloud
- Pattern: `soundcloud.com/`
- API: SoundCloud API v2 / oEmbed
- Extract: title, duration, artwork, user

## Security Considerations

1. **SSRF Prevention**: Whitelist domains in URL resolver
2. **Rate Limiting**: Per-user limits on resolve, upload, queue operations
3. **File Upload Safety**: 
   - Max 50MB per file
   - Validate MIME types
   - Scan with AV (optional hook)
4. **Permission Checks**: Verify user is in voice channel before any operation
5. **XSS Prevention**: Sanitize all metadata displayed in UI

## Environment Variables

```env
# YouTube
YOUTUBE_API_KEY=your_key

# Spotify
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# Apple Music
APPLE_MUSIC_TEAM_ID=your_team_id
APPLE_MUSIC_KEY_ID=your_key_id
APPLE_MUSIC_PRIVATE_KEY=your_private_key

# File Storage
UPLOADTHING_SECRET=your_secret
UPLOADTHING_APP_ID=your_app_id

# Redis (optional, for multi-instance)
REDIS_URL=redis://localhost:6379
```

## MVP Scope (Phase 1)

✅ **Must Have**:
- YouTube support (links only, no search yet)
- Uploaded audio files (mp3, m4a, ogg)
- Basic queue management (add, remove, reorder)
- Play/pause/skip controls
- Music Panel UI
- Real-time sync for all clients in VC
- DJ permissions (creator + admins/mods)

📋 **Nice to Have** (Phase 2):
- Spotify integration (requires user OAuth)
- Apple Music integration
- SoundCloud support
- Playlist support (YouTube, Spotify)
- Search functionality
- Vote skip
- Audio visualization
- History/favorites

## Implementation Order

1. Database models (Prisma schema)
2. URL resolver service (YouTube + basic structure)
3. Backend API endpoints
4. WebSocket event handlers
5. Audio file upload (UploadThing)
6. Music Panel UI component
7. YouTube playback wrapper
8. Uploaded audio playback wrapper
9. Sync logic + drift correction
10. Chat commands integration
11. Testing + polish
