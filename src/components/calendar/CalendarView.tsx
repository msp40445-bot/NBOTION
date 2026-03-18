import { useState, useMemo } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';
import { cn, formatDate } from '@/lib/utils';
import { CalendarEvent } from '@/types';
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Clock, Bell,
  MapPin, X, Check
} from 'lucide-react';

const eventColors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];
const eventTypes: { value: CalendarEvent['type']; label: string }[] = [
  { value: 'event', label: 'Event' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'holiday', label: 'Holiday' },
];

export function CalendarView() {
  const {
    events, reminders, holidays, currentDate,
    setCurrentDate, addEvent, deleteEvent,
    addReminder, toggleReminder, deleteReminder
  } = useCalendarStore();
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '', date: '', time: '', endTime: '',
    type: 'event' as CalendarEvent['type'],
    color: '#8B5CF6', location: '',
  });
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

  const getEventsForDay = (dateStr: string) => events.filter((e) => e.startDate.split('T')[0] === dateStr);
  const getHolidaysForDay = (dateStr: string) => holidays.filter((h) => h.date === dateStr);

  const handleAddEvent = () => {
    if (newEvent.title.trim() && newEvent.date) {
      const startDate = newEvent.time ? `${newEvent.date}T${newEvent.time}:00` : `${newEvent.date}T00:00:00`;
      const endDate = newEvent.endTime ? `${newEvent.date}T${newEvent.endTime}:00` : startDate;
      addEvent({
        title: newEvent.title, startDate, endDate,
        allDay: !newEvent.time, color: newEvent.color, type: newEvent.type,
        reminders: [], location: newEvent.location || undefined,
      });
      setNewEvent({ title: '', date: '', time: '', endTime: '', type: 'event', color: '#8B5CF6', location: '' });
      setShowAddEvent(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

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
          <button onClick={() => { setShowAddEvent(true); setNewEvent((e) => ({ ...e, date: selectedDay || today })); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
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
              <div className="flex gap-2">
                <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  placeholder="Start" className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-sm" />
                <input type="time" value={newEvent.endTime} onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  placeholder="End" className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-sm" />
              </div>
              <select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent['type'] })}
                className="px-3 py-2 bg-muted border border-border rounded-md text-sm">
                {eventTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Location (optional)" className="px-3 py-2 bg-muted border border-border rounded-md text-sm" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">Color:</span>
              {eventColors.map((c) => (
                <button key={c} onClick={() => setNewEvent({ ...newEvent, color: c })}
                  className={cn('w-5 h-5 rounded-full transition-transform', newEvent.color === c && 'ring-2 ring-offset-2 ring-primary scale-110')}
                  style={{ backgroundColor: c }} />
              ))}
              <div className="ml-auto flex gap-2">
                <button onClick={() => setShowAddEvent(false)} className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-md">Cancel</button>
                <button onClick={handleAddEvent} className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm">Add</button>
              </div>
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
            const isSelected = d.date === selectedDay;
            return (
              <div key={i} onClick={() => d.day > 0 && setSelectedDay(d.date)}
                className={cn('bg-card min-h-24 p-1 cursor-pointer transition-colors',
                  !d.day && 'bg-muted/20 cursor-default',
                  isSelected && 'ring-2 ring-inset ring-primary/50')}>
                {d.day > 0 && (
                  <>
                    <span className={cn('inline-flex items-center justify-center w-6 h-6 text-xs rounded-full',
                      isToday ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground')}>
                      {d.day}
                    </span>
                    {dayHolidays.map((h) => (
                      <div key={h.id} className="text-xs px-1 py-0.5 mt-0.5 bg-red-500/10 text-red-500 rounded truncate">{h.name}</div>
                    ))}
                    {dayEvents.slice(0, 3).map((e) => (
                      <div key={e.id} className="text-xs px-1 py-0.5 mt-0.5 rounded truncate group flex items-center gap-1"
                        style={{ backgroundColor: e.color + '20', color: e.color }}>
                        <span className="truncate flex-1">{e.title}</span>
                        <button onClick={(ev) => { ev.stopPropagation(); deleteEvent(e.id); }}
                          className="opacity-0 group-hover:opacity-100 flex-shrink-0"><X size={10} /></button>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1 mt-0.5">+{dayEvents.length - 3} more</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-72 border-l border-border p-4 bg-card/50 flex flex-col">
        {/* Selected day events */}
        {selectedDay && (
          <div className="mb-6">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Calendar size={16} />
              {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            {selectedDayEvents.length > 0 ? (
              <div className="space-y-2">
                {selectedDayEvents.map((e) => (
                  <div key={e.id} className="p-2 rounded-lg border border-border group">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                      <span className="text-sm font-medium flex-1 truncate">{e.title}</span>
                      <button onClick={() => deleteEvent(e.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><X size={12} /></button>
                    </div>
                    {!e.allDay && (
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1 ml-4">
                        <Clock size={10} />
                        {e.startDate.split('T')[1]?.slice(0, 5)}
                        {e.endDate !== e.startDate && ` - ${e.endDate.split('T')[1]?.slice(0, 5)}`}
                      </div>
                    )}
                    {e.location && (
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 ml-4">
                        <MapPin size={10} />{e.location}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground ml-4 capitalize">{e.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No events on this day</p>
            )}
          </div>
        )}

        {/* Reminders */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2"><Bell size={16} /> Reminders</h3>
          </div>
          <div className="space-y-2 mb-3">
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
        </div>

        {/* Upcoming Holidays */}
        <div>
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
