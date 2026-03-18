export interface Page {
  id: string;
  title: string;
  icon?: string;
  coverImage?: string;
  content: string;
  parentId?: string;
  children: string[];
  createdAt: string;
  updatedAt: string;
  isDatabase?: boolean;
  databaseSchema?: DatabaseColumn[];
  databaseRows?: DatabaseRow[];
}

export interface DatabaseColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multi-select' | 'date' | 'checkbox' | 'url' | 'email' | 'person' | 'relation';
  options?: SelectOption[];
  width?: number;
}

export interface SelectOption {
  id: string;
  name: string;
  color: string;
}

export interface DatabaseRow {
  id: string;
  cells: Record<string, CellValue>;
  createdAt: string;
}

export type CellValue = string | number | boolean | string[] | null;

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'channel' | 'dm' | 'group';
  members: string[];
  createdAt: string;
  unreadCount: number;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  channelId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: string;
  threadId?: string;
  reactions: Reaction[];
  attachments: Attachment[];
  edited?: boolean;
}

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  icon?: string;
  color: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  projectId: string;
  key: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId?: string;
  assigneeName?: string;
  labels: string[];
  sprintId?: string;
  storyPoints?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  comments: IssueComment[];
}

export type IssueStatus = 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done' | 'cancelled';
export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export interface IssueComment {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  issues: string[];
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'personal' | 'career' | 'health' | 'financial' | 'education' | 'travel' | 'other';
  timeframe: '1-month' | '3-months' | '6-months' | '1-year' | '3-years' | '5-years' | '10-years';
  status: 'not-started' | 'in-progress' | 'completed' | 'paused' | 'abandoned';
  progress: number;
  milestones: Milestone[];
  startDate: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  completedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  color: string;
  type: 'event' | 'reminder' | 'holiday' | 'birthday' | 'meeting' | 'deadline';
  recurrence?: RecurrenceRule;
  reminders: Reminder[];
  location?: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
  daysOfWeek?: number[];
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  type: 'notification' | 'alarm' | 'email';
  completed: boolean;
  recurring?: RecurrenceRule;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  country: string;
  type: 'public' | 'religious' | 'observance' | 'custom';
}

export interface HealthData {
  id: string;
  date: string;
  type: 'sleep' | 'hrv' | 'rhr' | 'strain' | 'recovery' | 'calories' | 'steps' | 'workout';
  value: number;
  unit: string;
  source: 'whoop' | 'manual' | 'apple-health' | 'fitbit' | 'garmin';
  metadata?: Record<string, string | number>;
}

export interface Integration {
  id: string;
  type: 'telegram' | 'discord' | 'github' | 'whoop' | 'google-calendar' | 'slack';
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, string>;
  lastSync?: string;
}

export interface AIAgent {
  id: string;
  name: string;
  description?: string;
  model: 'qwen-2.5-3b' | 'qwen-2.5-7b' | 'custom';
  systemPrompt: string;
  capabilities: AgentCapability[];
  status: 'idle' | 'running' | 'error';
  createdAt: string;
  lastRun?: string;
  logs: AgentLog[];
}

export type AgentCapability = 
  | 'read-pages' 
  | 'write-pages' 
  | 'read-messages' 
  | 'send-messages'
  | 'manage-issues' 
  | 'github-access' 
  | 'create-pr' 
  | 'debug-app'
  | 'dom-access'
  | 'read-calendar'
  | 'manage-goals'
  | 'health-data';

export interface AgentLog {
  id: string;
  timestamp: string;
  type: 'info' | 'action' | 'error' | 'thought';
  message: string;
}

export type AppModule = 'workspace' | 'messaging' | 'projects' | 'planner' | 'calendar' | 'health' | 'integrations' | 'ai-agents' | 'settings';
