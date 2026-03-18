import { useState } from 'react';
import { usePlannerStore } from '@/stores/plannerStore';
import { cn, categoryColors, formatDate } from '@/lib/utils';
import { Goal } from '@/types';
import {
  Target, Plus, CheckCircle2, Circle, Clock, Pause, X,
  ChevronDown, TrendingUp, Calendar
} from 'lucide-react';

const timeframes = [
  { value: 'all', label: 'All Goals' },
  { value: '1-month', label: '1 Month' },
  { value: '3-months', label: '3 Months' },
  { value: '6-months', label: '6 Months' },
  { value: '1-year', label: '1 Year' },
  { value: '3-years', label: '3 Years' },
  { value: '5-years', label: '5 Years' },
  { value: '10-years', label: '10 Years' },
];

const statusIcons: Record<string, React.ReactNode> = {
  'not-started': <Circle size={16} className="text-gray-500" />,
  'in-progress': <TrendingUp size={16} className="text-blue-500" />,
  'completed': <CheckCircle2 size={16} className="text-green-500" />,
  'paused': <Pause size={16} className="text-yellow-500" />,
  'abandoned': <X size={16} className="text-red-500" />,
};

export function PlannerView() {
  const {
    goals, currentTimeframe, setCurrentTimeframe, addGoal,
    updateGoal, deleteGoal, addMilestone, toggleMilestone, deleteMilestone, getGoalsByTimeframe
  } = usePlannerStore();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', category: 'personal' as Goal['category'], timeframe: '1-year' as Goal['timeframe'] });
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState('');

  const filteredGoals = getGoalsByTimeframe(currentTimeframe);

  const handleAddGoal = () => {
    if (newGoal.title.trim()) {
      const targetDate = new Date();
      const months: Record<string, number> = { '1-month': 1, '3-months': 3, '6-months': 6, '1-year': 12, '3-years': 36, '5-years': 60, '10-years': 120 };
      targetDate.setMonth(targetDate.getMonth() + (months[newGoal.timeframe] || 12));
      addGoal(newGoal.title.trim(), newGoal.category, newGoal.timeframe, targetDate.toISOString());
      setNewGoal({ title: '', category: 'personal', timeframe: '1-year' });
      setShowAddGoal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target size={24} className="text-primary" />
            Goals & Planner
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Plan and track your goals across any timeframe</p>
        </div>
        <button onClick={() => setShowAddGoal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
          <Plus size={16} /> New Goal
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {timeframes.map((tf) => (
          <button key={tf.value} onClick={() => setCurrentTimeframe(tf.value)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              currentTimeframe === tf.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {showAddGoal && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6 animate-fade-in">
          <input value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            placeholder="What do you want to achieve?" className="w-full text-lg bg-transparent border-none outline-none mb-3" autoFocus
          />
          <div className="flex gap-3 items-center">
            <select value={newGoal.category} onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as Goal['category'] })}
              className="bg-muted border border-border rounded-md px-3 py-1.5 text-sm">
              <option value="personal">Personal</option>
              <option value="career">Career</option>
              <option value="health">Health</option>
              <option value="financial">Financial</option>
              <option value="education">Education</option>
              <option value="travel">Travel</option>
              <option value="other">Other</option>
            </select>
            <select value={newGoal.timeframe} onChange={(e) => setNewGoal({ ...newGoal, timeframe: e.target.value as Goal['timeframe'] })}
              className="bg-muted border border-border rounded-md px-3 py-1.5 text-sm">
              {timeframes.filter((t) => t.value !== 'all').map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <div className="ml-auto flex gap-2">
              <button onClick={() => setShowAddGoal(false)} className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-md">Cancel</button>
              <button onClick={handleAddGoal} className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm">Create</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredGoals.map((goal) => (
          <div key={goal.id} className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 cursor-pointer hover:bg-muted/30" onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}>
              <div className="flex items-center gap-3">
                {statusIcons[goal.status]}
                <div className="flex-1">
                  <h3 className="font-semibold">{goal.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: categoryColors[goal.category] + '20', color: categoryColors[goal.category] }}>
                      {goal.category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={12} /> {goal.timeframe}
                    </span>
                    <span className="text-xs text-muted-foreground">Target: {formatDate(goal.targetDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
                    </div>
                  </div>
                  <ChevronDown size={16} className={cn('text-muted-foreground transition-transform', expandedGoal === goal.id && 'rotate-180')} />
                </div>
              </div>
            </div>

            {expandedGoal === goal.id && (
              <div className="px-4 pb-4 border-t border-border pt-3 animate-fade-in">
                {goal.description && <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>}
                <h4 className="text-sm font-medium mb-2">Milestones</h4>
                <div className="space-y-2">
                  {goal.milestones.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 group">
                      <button onClick={() => toggleMilestone(goal.id, m.id)}>
                        {m.completed ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-muted-foreground" />}
                      </button>
                      <span className={cn('text-sm flex-1', m.completed && 'line-through text-muted-foreground')}>{m.title}</span>
                      {m.dueDate && <span className="text-xs text-muted-foreground">{formatDate(m.dueDate)}</span>}
                      <button onClick={() => deleteMilestone(goal.id, m.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && newMilestone.trim()) { addMilestone(goal.id, newMilestone.trim()); setNewMilestone(''); } }}
                      placeholder="Add milestone..." className="flex-1 text-sm bg-transparent border-none outline-none text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                  <select value={goal.status} onChange={(e) => updateGoal(goal.id, { status: e.target.value as Goal['status'] })}
                    className="bg-muted border border-border rounded px-2 py-1 text-xs">
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="abandoned">Abandoned</option>
                  </select>
                  <button onClick={() => deleteGoal(goal.id)} className="ml-auto text-xs text-destructive hover:text-destructive/80">Delete goal</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredGoals.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Target size={48} className="mx-auto mb-3 opacity-30" />
            <p>No goals for this timeframe yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
