import { useState, useMemo } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';
import { cn, formatDate } from '@/lib/utils';
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Clock, Bell,
  MapPin, X, Check
} from 'lucide-react';

export function CalendarView() {
  const {
    events, reminders, holidays, currentDate, currentView,
    setCurrentDate, setCurrentView, addEvent, deleteEvent,
    addReminder, toggleReminder, deleteReminder
  } = useCalendarStore();
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', type: 'event' as const });
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('09:00');

  const date = new Date(currentDate);
  const year = date.getFullYear();
  const month = date.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: 0, date: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, date: dateStr });
    }
    return days;
  }, [year, month, daysInMonth, firstDayOfWeek]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };
  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const getEventsForDay = (dateStr: string) => {
    return events.filter((e) => e.startDate.split('T')[0] === dateStr);
  };
  const getHolidaysForDay = (dateStr: string) => {
    return holidays.filter((h) => h.date === dateStr);
  };

  const handleAddEvent = () => {
    if (newEvent.title.trim() && newEvent.date) {
      const startDate = newEvent.time ? `${newEvent.date}T${newEvent.time}:00` : `${newEvent.date}T00:00:00`;
      addEvent({
        title: newEvent.title, startDate, endDate: startDate,
        allDay: !newEvent.time, color: '#8B5CF6', type: newEvent.type, reminders: [],
      });
      setNewEvent({ title: '', date: '', time: '', type: 'event' });
      setShowAddEvent(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-muted"><ChevronLeft size={18} /></button>
            <h2 className="text-xl font-semibold">{monthNames[month]} {year}</h2>
            <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-muted"><ChevronRight size={18} /></button>
            <button onClick={() => setCurrentDate(today)} className="ml-2 px-3 py-1 text-xs bg-muted rounded-md hover:bg-muted/80">Today</button>
          </div>
          <button onClick={() => setShowAddEvent(true)} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
            <Plus size={14} /> Add Event
          </button>
        </div>

        {showAddEvent && (
          <div className="bg-card border border-border rounded-lg p-4 mb-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Event title" className="col-span-2 px-3 py-2 bg-muted border border-border rounded-md text-sm" autoFocus />
              <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="px-3 py-2 bg-muted border border-border rounded-md text-sm" />
              <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="px-3 py-2 bg-muted border border-border rounded-md text-sm" />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setShowAddEvent(false)} className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-md">Cancel</button>
              <button onClick={handleAddEvent} className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm">Add</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden flex-1">
          {dayNames.map((d) => (
            <div key={d} className="bg-muted/50 px-2 py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
          ))}
          {calendarDays.map((d, i) => {
            const dayEvents = d.date ? getEventsForDay(d.date) : [];
            const dayHolidays = d.date ? getHolidaysForDay(d.date) : [];
            const isToday = d.date === today;
            return (
              <div key={i} className={cn('bg-card min-h-24 p-1', !d.day && 'bg-muted/20')}>
                {d.day > 0 && (
                  <>
                    <span className={cn('inline-flex items-center justify-center w-6 h-6 text-xs rounded-full',
                      isToday ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground'
                    )}>
                      {d.day}
                    </span>
                    {dayHolidays.map((h) => (
                      <div key={h.id} className="text-xs px-1 py-0.5 mt-0.5 bg-red-500/10 text-red-500 rounded truncate">{h.name}</div>
                    ))}
                    {dayEvents.map((e) => (
                      <div key={e.id} className="text-xs px-1 py-0.5 mt-0.5 rounded truncate group flex items-center gap-1"
                        style={{ backgroundColor: e.color + '20', color: e.color }}>
                        <span className="truncate flex-1">{e.title}</span>
                        <button onClick={() => deleteEvent(e.id)} className="opacity-0 group-hover:opacity-100 flex-shrink-0">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reminders sidebar */}
      <div className="w-72 border-l border-border p-4 bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2"><Bell size={16} /> Reminders</h3>
        </div>
        <div className="space-y-2 mb-4">
          {reminders.map((r) => (
            <div key={r.id} className="flex items-center gap-2 group">
              <button onClick={() => toggleReminder(r.id)}>
                {r.completed ? <Check size={14} className="text-green-500" /> : <Clock size={14} className="text-muted-foreground" />}
              </button>
              <span className={cn('text-sm flex-1', r.completed && 'line-through text-muted-foreground')}>{r.title}</span>
              <span className="text-xs text-muted-foreground">{r.time}</span>
              <button onClick={() => deleteReminder(r.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newReminderTitle} onChange={(e) => setNewReminderTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && newReminderTitle.trim()) { addReminder(newReminderTitle.trim(), newReminderTime); setNewReminderTitle(''); } }}
            placeholder="New reminder..." className="flex-1 text-sm bg-muted border border-border rounded px-2 py-1" />
          <input type="time" value={newReminderTime} onChange={(e) => setNewReminderTime(e.target.value)}
            className="w-20 text-xs bg-muted border border-border rounded px-2 py-1" />
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Calendar size={16} /> Upcoming Holidays</h3>
          <div className="space-y-2">
            {holidays.filter((h) => h.date >= today).slice(0, 5).map((h) => (
              <div key={h.id} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <span className="flex-1 truncate">{h.name}</span>
                <span className="text-xs text-muted-foreground">{formatDate(h.date)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
