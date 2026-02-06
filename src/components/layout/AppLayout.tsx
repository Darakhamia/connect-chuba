'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MessageList } from '../chat/MessageList';
import { VoiceChannel } from '../voice/VoiceChannel';

const MOCK_CHANNELS = [
  { id: '1', name: 'general', type: 'text' as const },
  { id: '2', name: 'random', type: 'text' as const },
  { id: '3', name: 'Voice Chat', type: 'voice' as const },
  { id: '4', name: 'Video Room', type: 'video' as const },
];

export function AppLayout() {
  const [activeChannelId, setActiveChannelId] = useState('1');

  const activeChannel = MOCK_CHANNELS.find(c => c.id === activeChannelId);

  return (
    <div className="flex h-screen bg-chuba-dark">
      <Sidebar
        channels={MOCK_CHANNELS}
        activeChannelId={activeChannelId}
        onChannelSelect={setActiveChannelId}
      />

      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        <div className="h-12 px-4 flex items-center border-b border-chuba-border">
          <h1 className="font-semibold text-chuba-text">
            {activeChannel?.type === 'text' && '#'}
            {activeChannel?.name}
          </h1>
        </div>

        {/* Channel Content */}
        <div className="flex-1 overflow-hidden">
          {activeChannel?.type === 'text' && (
            <MessageList channelId={activeChannelId} />
          )}
          {activeChannel?.type === 'voice' && (
            <VoiceChannel
              channelId={activeChannelId}
              channelName={activeChannel.name}
              type="audio"
            />
          )}
          {activeChannel?.type === 'video' && (
            <VoiceChannel
              channelId={activeChannelId}
              channelName={activeChannel.name}
              type="video"
            />
          )}
        </div>
      </div>
    </div>
  );
}
