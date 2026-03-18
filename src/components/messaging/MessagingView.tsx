import { useState, useRef, useEffect } from 'react';
import { useMessagingStore } from '@/stores/messagingStore';
import { cn, formatRelativeTime, getInitials } from '@/lib/utils';
import { Message } from '@/types';
import {
  Hash, Plus, Send, Smile, AtSign, Paperclip, Users,
  Trash2, Edit3, Reply, X, Check
} from 'lucide-react';

const EMOJI_SHORTCUTS = ['👍', '❤️', '😂', '🎉', '🔥', '👀', '💯', '🙌'];

export function MessagingView() {
  const {
    channels, currentChannelId, messages, setCurrentChannel,
    sendMessage, addChannel, addReaction, deleteMessage, editMessage
  } = useMessagingStore();
  const [messageInput, setMessageInput] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChannel = channels.find((c) => c.id === currentChannelId);
  const channelMessages = currentChannelId ? (messages[currentChannelId] || []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  const handleSend = () => {
    if (messageInput.trim() && currentChannelId) {
      sendMessage(currentChannelId, messageInput.trim());
      setMessageInput('');
      setReplyTo(null);
    }
  };

  const handleEditSave = () => {
    if (editingMessage && editingMessage.content.trim() && currentChannelId) {
      editMessage(currentChannelId, editingMessage.id, editingMessage.content.trim());
      setEditingMessage(null);
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

  const handleDelete = (msgId: string) => {
    if (currentChannelId && confirm('Delete this message?')) {
      deleteMessage(currentChannelId, msgId);
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
              <input value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateChannel()}
                placeholder="channel-name" className="flex-1 px-2 py-1 bg-muted border border-border rounded text-sm" autoFocus />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-0.5">
          {channels.filter((c) => c.type === 'channel').map((channel) => (
            <button key={channel.id} onClick={() => setCurrentChannel(channel.id)}
              className={cn('w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm',
                currentChannelId === channel.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')}>
              <Hash size={14} />
              <span className="truncate">{channel.name}</span>
              {channel.unreadCount > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">{channel.unreadCount}</span>
              )}
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-border">
          <span className="text-xs text-muted-foreground font-medium uppercase">Direct Messages</span>
          {channels.filter((c) => c.type === 'dm').map((channel) => (
            <button key={channel.id} onClick={() => setCurrentChannel(channel.id)}
              className={cn('w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm mt-1',
                currentChannelId === channel.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')}>
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
              <span className="ml-auto text-xs text-muted-foreground">{channelMessages.length} messages</span>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-1">
              {channelMessages.map((msg) => (
                <div key={msg.id} className="flex gap-3 group hover:bg-muted/30 rounded-lg p-2 -mx-2 relative">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary">{getInitials(msg.authorName)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm">{msg.authorName}</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(msg.timestamp)}</span>
                      {msg.edited && <span className="text-xs text-muted-foreground">(edited)</span>}
                    </div>

                    {msg.replyTo && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 mb-1 pl-2 border-l-2 border-primary/30">
                        <Reply size={10} />
                        <span className="font-medium">{msg.replyToAuthor}</span>
                        <span className="truncate max-w-xs">{msg.replyToContent}</span>
                      </div>
                    )}

                    {editingMessage?.id === msg.id ? (
                      <div className="mt-1">
                        <input value={editingMessage.content}
                          onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') setEditingMessage(null); }}
                          className="w-full px-2 py-1 bg-muted border border-border rounded text-sm" autoFocus />
                        <div className="flex gap-1 mt-1">
                          <button onClick={handleEditSave} className="text-xs text-primary hover:underline flex items-center gap-0.5"><Check size={10} /> Save</button>
                          <button onClick={() => setEditingMessage(null)} className="text-xs text-muted-foreground hover:underline flex items-center gap-0.5"><X size={10} /> Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm mt-0.5 whitespace-pre-wrap">{msg.content}</p>
                    )}

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

                  {/* Message actions */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-start gap-0.5 absolute right-1 top-1 bg-card border border-border rounded-md shadow-sm p-0.5">
                    <button onClick={() => setReplyTo(msg)} title="Reply"
                      className="p-1 rounded hover:bg-muted text-muted-foreground"><Reply size={13} /></button>
                    <button onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)} title="React"
                      className="p-1 rounded hover:bg-muted text-muted-foreground"><Smile size={13} /></button>
                    {msg.authorId === 'user-1' && (
                      <>
                        <button onClick={() => setEditingMessage({ id: msg.id, content: msg.content })} title="Edit"
                          className="p-1 rounded hover:bg-muted text-muted-foreground"><Edit3 size={13} /></button>
                        <button onClick={() => handleDelete(msg.id)} title="Delete"
                          className="p-1 rounded hover:bg-muted text-destructive"><Trash2 size={13} /></button>
                      </>
                    )}
                  </div>

                  {/* Emoji picker */}
                  {showEmojiPicker === msg.id && (
                    <div className="absolute right-0 top-8 bg-card border border-border rounded-lg shadow-lg p-2 flex gap-1 z-10">
                      {EMOJI_SHORTCUTS.map((emoji) => (
                        <button key={emoji} onClick={() => { addReaction(msg.channelId, msg.id, emoji); setShowEmojiPicker(null); }}
                          className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded text-sm">{emoji}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply indicator */}
            {replyTo && (
              <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center gap-2">
                <Reply size={14} className="text-primary" />
                <span className="text-xs text-muted-foreground">Replying to</span>
                <span className="text-xs font-medium">{replyTo.authorName}</span>
                <span className="text-xs text-muted-foreground truncate flex-1">{replyTo.content}</span>
                <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
              </div>
            )}

            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <button className="text-muted-foreground hover:text-foreground"><Paperclip size={18} /></button>
                <input value={messageInput} onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder={`Message #${currentChannel.name}`}
                  className="flex-1 bg-transparent border-none outline-none text-sm" />
                <button className="text-muted-foreground hover:text-foreground"><AtSign size={18} /></button>
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
