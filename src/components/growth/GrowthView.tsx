import { useState, useMemo } from 'react';
import { usePlannerStore } from '@/stores/plannerStore';
import { cn } from '@/lib/utils';
import {
  TrendingUp, Trophy, Target, CheckCircle2, Calendar, Flame,
  BarChart3, Star, Award, Zap
} from 'lucide-react';

export function GrowthView() {
  const { goals } = usePlannerStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('all');

  const stats = useMemo(() => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.status === 'completed').length;
    const inProgressGoals = goals.filter((g) => g.status === 'in-progress').length;
    const totalMilestones = goals.reduce((sum, g) => sum + g.milestones.length, 0);
    const completedMilestones = goals.reduce(
      (sum, g) => sum + g.milestones.filter((m) => m.completed).length, 0
    );
    const avgProgress = totalGoals > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
      : 0;

    const categoryBreakdown = goals.reduce((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timeframeBreakdown = goals.reduce((acc, g) => {
      acc[g.timeframe] = (acc[g.timeframe] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalGoals, completedGoals, inProgressGoals, totalMilestones,
      completedMilestones, avgProgress, categoryBreakdown, timeframeBreakdown,
    };
  }, [goals]);

  const completionRate = stats.totalGoals > 0
    ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0;
  const milestoneRate = stats.totalMilestones > 0
    ? Math.round((stats.completedMilestones / stats.totalMilestones) * 100) : 0;

  const categoryColors: Record<string, string> = {
    personal: '#8B5CF6', career: '#3B82F6', health: '#10B981',
    financial: '#F59E0B', education: '#EC4899', travel: '#06B6D4', other: '#6B7280',
  };

  const recentAccomplishments = goals
    .flatMap((g) => g.milestones
      .filter((m) => m.completed && m.completedAt)
      .map((m) => ({ goalTitle: g.title, milestoneTitle: m.title, completedAt: m.completedAt!, category: g.category }))
    )
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp size={24} className="text-primary" />
            Growth & Accomplishments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your progress, celebrate wins, and see how far you have come
          </p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          {(['week', 'month', 'year', 'all'] as const).map((range) => (
            <button key={range} onClick={() => setTimeRange(range)}
              className={cn('px-3 py-1.5 rounded-md text-xs font-medium capitalize',
                timeRange === range ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-blue-500" />
            <span className="text-xs text-muted-foreground">Total Goals</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalGoals}</div>
          <div className="text-xs text-muted-foreground mt-1">{stats.inProgressGoals} in progress</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-yellow-500" />
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <div className="text-3xl font-bold text-green-500">{stats.completedGoals}</div>
          <div className="text-xs text-muted-foreground mt-1">{completionRate}% completion rate</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-xs text-muted-foreground">Milestones Done</span>
          </div>
          <div className="text-3xl font-bold">{stats.completedMilestones}<span className="text-lg text-muted-foreground">/{stats.totalMilestones}</span></div>
          <div className="text-xs text-muted-foreground mt-1">{milestoneRate}% milestone rate</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-purple-500" />
            <span className="text-xs text-muted-foreground">Avg Progress</span>
          </div>
          <div className="text-3xl font-bold">{stats.avgProgress}%</div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${stats.avgProgress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Category breakdown */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Star size={16} className="text-yellow-500" /> Goals by Category</h3>
          <div className="space-y-3">
            {Object.entries(stats.categoryBreakdown).map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: categoryColors[cat] || '#6B7280' }} />
                <span className="text-sm capitalize flex-1">{cat}</span>
                <span className="text-sm font-medium">{count}</span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${(count / stats.totalGoals) * 100}%`,
                    backgroundColor: categoryColors[cat] || '#6B7280',
                  }} />
                </div>
              </div>
            ))}
            {Object.keys(stats.categoryBreakdown).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No goals yet. Create some in Planner & Goals!</p>
            )}
          </div>
        </div>

        {/* Timeframe breakdown */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar size={16} className="text-blue-500" /> Goals by Timeframe</h3>
          <div className="space-y-3">
            {Object.entries(stats.timeframeBreakdown).map(([tf, count]) => (
              <div key={tf} className="flex items-center gap-3">
                <Zap size={14} className="text-muted-foreground flex-shrink-0" />
                <span className="text-sm flex-1">{tf}</span>
                <span className="text-sm font-medium">{count}</span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{
                    width: `${(count / stats.totalGoals) * 100}%`,
                  }} />
                </div>
              </div>
            ))}
            {Object.keys(stats.timeframeBreakdown).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No goals yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Goal progress cards */}
      <div className="bg-card border border-border rounded-lg p-5 mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Flame size={16} className="text-orange-500" /> Goal Progress</h3>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: categoryColors[goal.category] || '#6B7280' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{goal.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">{goal.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all',
                    goal.progress >= 100 ? 'bg-green-500' : goal.progress >= 50 ? 'bg-blue-500' : 'bg-primary'
                  )} style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{
                backgroundColor: (categoryColors[goal.category] || '#6B7280') + '20',
                color: categoryColors[goal.category] || '#6B7280',
              }}>{goal.category}</span>
            </div>
          ))}
          {goals.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No goals to show. Start planning in the Planner!</p>
          )}
        </div>
      </div>

      {/* Recent accomplishments */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Award size={16} className="text-green-500" /> Recent Accomplishments</h3>
        {recentAccomplishments.length > 0 ? (
          <div className="space-y-3">
            {recentAccomplishments.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{a.milestoneTitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    From: {a.goalTitle}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(a.completedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No accomplishments yet</p>
            <p className="text-xs mt-1">Complete milestones in your goals to see them here</p>
          </div>
        )}
      </div>
    </div>
  );
}
