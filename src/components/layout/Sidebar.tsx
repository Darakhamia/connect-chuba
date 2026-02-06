'use client';

import { motion } from 'framer-motion';
import { Hash, Volume2, Video } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'video';
}

interface SidebarProps {
  channels: Channel[];
  activeChannelId?: string;
  onChannelSelect: (channelId: string) => void;
}

export function Sidebar({ channels, activeChannelId, onChannelSelect }: SidebarProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return <Volume2 className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-60 bg-chuba-grey h-full flex flex-col">
      {/* Server Header */}
      <div className="h-12 px-4 flex items-center border-b border-chuba-border">
        <h2 className="font-semibold text-chuba-text">Connect Chuba</h2>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="text-xs font-semibold text-chuba-text-muted uppercase mb-2 px-2">
          Channels
        </div>

        {channels.map((channel) => (
          <motion.button
            key={channel.id}
            onClick={() => onChannelSelect(channel.id)}
            className={`
              w-full flex items-center gap-2 px-2 py-1.5 rounded
              transition-colors group
              ${activeChannelId === channel.id
                ? 'bg-chuba-grey-light text-chuba-text'
                : 'text-chuba-text-muted hover:bg-chuba-grey-light hover:text-chuba-text'
              }
            `}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className={`
              ${activeChannelId === channel.id ? 'text-chuba-accent' : 'text-chuba-text-muted group-hover:text-chuba-text'}
            `}>
              {getIcon(channel.type)}
            </span>
            <span className="text-sm">{channel.name}</span>
          </motion.button>
        ))}
      </div>

      {/* User Panel */}
      <div className="h-14 px-2 flex items-center bg-chuba-dark border-t border-chuba-border">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-chuba-accent flex items-center justify-center">
              <span className="text-sm font-semibold">D</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-chuba-dark" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-chuba-text">David</div>
            <div className="text-xs text-chuba-text-muted">Online</div>
          </div>
        </div>
      </div>
    </div>
  );
}
