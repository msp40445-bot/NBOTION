import { create } from 'zustand';
import { Channel, Message } from '@/types';
import { generateId } from '@/lib/utils';

interface MessagingState {
  channels: Channel[];
  currentChannelId: string | null;
  messages: Record<string, Message[]>;
  addChannel: (name: string, type: Channel['type']) => Channel;
  deleteChannel: (id: string) => void;
  setCurrentChannel: (id: string | null) => void;
  sendMessage: (channelId: string, content: string, authorName?: string) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  editMessage: (channelId: string, messageId: string, content: string) => void;
  addReaction: (channelId: string, messageId: string, emoji: string) => void;
}

export const useMessagingStore = create<MessagingState>((set) => ({
  channels: [
    {
      id: 'general',
      name: 'general',
      description: 'General discussion',
      type: 'channel',
      members: ['user-1'],
      createdAt: new Date().toISOString(),
      unreadCount: 0,
    },
    {
      id: 'random',
      name: 'random',
      description: 'Random chatter',
      type: 'channel',
      members: ['user-1'],
      createdAt: new Date().toISOString(),
      unreadCount: 0,
    },
    {
      id: 'dev',
      name: 'development',
      description: 'Dev talk',
      type: 'channel',
      members: ['user-1'],
      createdAt: new Date().toISOString(),
      unreadCount: 0,
    },
  ],
  currentChannelId: 'general',
  messages: {
    general: [
      {
        id: 'msg-1',
        channelId: 'general',
        content: 'Welcome to NBOTION messaging! This is your encrypted, private communication hub.',
        authorId: 'system',
        authorName: 'NBOTION',
        timestamp: new Date().toISOString(),
        reactions: [],
        attachments: [],
      },
    ],
  },

  addChannel: (name, type) => {
    const channel: Channel = {
      id: generateId(),
      name,
      type,
      members: ['user-1'],
      createdAt: new Date().toISOString(),
      unreadCount: 0,
    };
    set((state) => ({
      channels: [...state.channels, channel],
      messages: { ...state.messages, [channel.id]: [] },
    }));
    return channel;
  },

  deleteChannel: (id) => {
    set((state) => ({
      channels: state.channels.filter((c) => c.id !== id),
      currentChannelId: state.currentChannelId === id ? state.channels[0]?.id ?? null : state.currentChannelId,
    }));
  },

  setCurrentChannel: (id) => set({ currentChannelId: id }),

  sendMessage: (channelId, content, authorName = 'You') => {
    const message: Message = {
      id: generateId(),
      channelId,
      content,
      authorId: 'user-1',
      authorName,
      timestamp: new Date().toISOString(),
      reactions: [],
      attachments: [],
    };
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: [...(state.messages[channelId] ?? []), message],
      },
    }));
  },

  deleteMessage: (channelId, messageId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] ?? []).filter((m) => m.id !== messageId),
      },
    }));
  },

  editMessage: (channelId, messageId, content) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] ?? []).map((m) =>
          m.id === messageId ? { ...m, content, edited: true } : m
        ),
      },
    }));
  },

  addReaction: (channelId, messageId, emoji) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] ?? []).map((m) =>
          m.id === messageId
            ? {
                ...m,
                reactions: m.reactions.some((r) => r.emoji === emoji)
                  ? m.reactions.map((r) =>
                      r.emoji === emoji
                        ? { ...r, users: r.users.includes('user-1') ? r.users.filter((u) => u !== 'user-1') : [...r.users, 'user-1'] }
                        : r
                    )
                  : [...m.reactions, { emoji, users: ['user-1'] }],
              }
            : m
        ),
      },
    }));
  },
}));
