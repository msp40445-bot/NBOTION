import { useState } from 'react';
import { useMessagingStore } from '@/stores/messagingStore';
import { cn, formatRelativeTime, getInitials } from '@/lib/utils';
import { Hash, Plus, Send, Smile, AtSign, Paperclip, Search, Users } from 'lucide-react';

export function MessagingView() {
  const {
    channels, currentChannelId, messages, setCurrentChannel,
    sendMessage, addChannel, addReaction
  } = useMessagingStore();
  const [messageInput, setMessageInput] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);

  const currentChannel = channels.find((c) => c.id === currentChannelId);
  const channelMessages = currentChannelId ? (messages[currentChannelId] || []) : [];

  const handleSend = () => {
    if (messageInput.trim() && currentChannelId) {
      sendMessage(currentChannelId, messageInput.trim());
      setMessageInput('');
    }
  };

  const handleCreateChannel = () => {
    if (newChannelName.trim()) {
      const ch = addChannel(newChannelName.trim(), 'channel');
      setCurrentChannel(ch.id);
      setNewChannelName('');
      setShowNewChannel(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Channel list */}
      <div className="w-60 border-r border-border flex flex-col bg-card/50">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Channels</span>
            <button onClick={() => setShowNewChannel(!showNewChannel)} className="p-1 rounded hover:bg-muted text-muted-foreground">
              <Plus size={16} />
            </button>
          </div>
          {showNewChannel && (
            <div className="flex gap-1">
              <input
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateChannel()}
                placeholder="channel-name"
                className="flex-1 px-2 py-1 bg-muted border border-border rounded text-sm"
                autoFocus
              />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-0.5">
          {channels.filter((c) => c.type === 'channel').map((channel) => (
            <button
              key={channel.id}
              onClick={() => setCurrentChannel(channel.id)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
                currentChannelId === channel.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Hash size={14} />
              <span className="truncate">{channel.name}</span>
              {channel.unreadCount > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {channel.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-border">
          <span className="text-xs text-muted-foreground font-medium uppercase">Direct Messages</span>
          {channels.filter((c) => c.type === 'dm').map((channel) => (
            <button
              key={channel.id}
              onClick={() => setCurrentChannel(channel.id)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm mt-1',
                currentChannelId === channel.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Users size={14} />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {currentChannel ? (
          <>
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Hash size={18} className="text-muted-foreground" />
              <span className="font-semibold">{currentChannel.name}</span>
              {currentChannel.description && (
                <span className="text-sm text-muted-foreground ml-2">{currentChannel.description}</span>
              )}
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {channelMessages.map((msg) => (
                <div key={msg.id} className="flex gap-3 group hover:bg-muted/30 rounded-lg p-2 -mx-2">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary">{getInitials(msg.authorName)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm">{msg.authorName}</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(msg.timestamp)}</span>
                    </div>
                    <p className="text-sm mt-0.5 whitespace-pre-wrap">{msg.content}</p>
                    {msg.reactions.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {msg.reactions.map((r, i) => (
                          <button key={i} onClick={() => addReaction(msg.channelId, msg.id, r.emoji)}
                            className="px-2 py-0.5 bg-muted rounded-full text-xs hover:bg-muted/80 flex items-center gap-1">
                            <span>{r.emoji}</span>
                            <span className="text-muted-foreground">{r.users.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex items-start gap-1">
                    <button onClick={() => addReaction(msg.channelId, msg.id, '👍')} className="p-1 rounded hover:bg-muted text-muted-foreground">
                      <Smile size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <button className="text-muted-foreground hover:text-foreground"><Paperclip size={18} /></button>
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder={`Message #${currentChannel.name}`}
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                />
                <button className="text-muted-foreground hover:text-foreground"><AtSign size={18} /></button>
                <button className="text-muted-foreground hover:text-foreground"><Smile size={18} /></button>
                <button onClick={handleSend} className="p-1.5 bg-primary rounded-md text-primary-foreground hover:bg-primary/90">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a channel to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
