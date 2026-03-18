import { useState } from 'react';
import { useHealthStore } from '@/stores/healthStore';
import { cn } from '@/lib/utils';
import { HealthData } from '@/types';
import {
  Heart, Moon, Footprints, Activity, Zap, Flame, TrendingUp,
  Plus, Wifi, WifiOff, X
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const metricConfig: Record<string, { icon: React.ElementType; color: string; label: string; unit: string; placeholder: string }> = {
  sleep: { icon: Moon, color: '#8B5CF6', label: 'Sleep', unit: 'hours', placeholder: '7.5' },
  steps: { icon: Footprints, color: '#3B82F6', label: 'Steps', unit: 'steps', placeholder: '10000' },
  rhr: { icon: Heart, color: '#EF4444', label: 'Resting HR', unit: 'bpm', placeholder: '62' },
  hrv: { icon: Activity, color: '#10B981', label: 'HRV', unit: 'ms', placeholder: '45' },
  recovery: { icon: TrendingUp, color: '#F59E0B', label: 'Recovery', unit: '%', placeholder: '75' },
  strain: { icon: Zap, color: '#EC4899', label: 'Strain', unit: 'score', placeholder: '12' },
  calories: { icon: Flame, color: '#F97316', label: 'Calories', unit: 'kcal', placeholder: '2200' },
};

export function HealthView() {
  const { healthData, integrations, updateIntegration, addHealthData, deleteHealthData } = useHealthStore();
  const [selectedMetric, setSelectedMetric] = useState<string>('sleep');
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: 'sleep' as HealthData['type'],
    value: '',
    date: new Date().toISOString().split('T')[0],
  });

  const latestData = Object.entries(metricConfig).map(([type, config]) => {
    const latest = healthData.filter((d) => d.type === type).sort((a, b) => b.date.localeCompare(a.date))[0];
    return { type, ...config, value: latest?.value ?? 0, latestUnit: latest?.unit ?? config.unit };
  });

  const chartData = healthData
    .filter((d) => d.type === selectedMetric)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ date: d.date.slice(5), value: d.value }));

  const whoopIntegration = integrations.find((i) => i.type === 'whoop');

  const handleAddEntry = () => {
    const val = parseFloat(newEntry.value);
    if (!isNaN(val) && newEntry.date) {
      const config = metricConfig[newEntry.type];
      addHealthData({
        date: newEntry.date,
        type: newEntry.type,
        value: val,
        unit: config.unit,
        source: 'manual',
      });
      setNewEntry({ type: 'sleep', value: '', date: new Date().toISOString().split('T')[0] });
      setShowAddEntry(false);
    }
  };

  const recentEntries = healthData
    .filter((d) => d.type === selectedMetric)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart size={24} className="text-red-500" />
            Health & Data
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track your health metrics and connect wearables</p>
        </div>
        <button onClick={() => setShowAddEntry(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
          <Plus size={16} /> Log Entry
        </button>
      </div>

      {/* Manual Entry Form */}
      {showAddEntry && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6 animate-fade-in">
          <h3 className="font-semibold mb-3">Log Health Data</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Metric</label>
              <select value={newEntry.type}
                onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as HealthData['type'] })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm">
                {Object.entries(metricConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label} ({cfg.unit})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Value</label>
              <input type="number" value={newEntry.value}
                onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                placeholder={metricConfig[newEntry.type]?.placeholder}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date</label>
              <input type="date" value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => setShowAddEntry(false)} className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-md">Cancel</button>
            <button onClick={handleAddEntry} disabled={!newEntry.value}
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50">Save</button>
          </div>
        </div>
      )}

      {/* Whoop integration card */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Activity size={20} className="text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">Whoop</h3>
              <p className="text-xs text-muted-foreground">Connect your Whoop band to sync health data</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (whoopIntegration) {
                updateIntegration(whoopIntegration.id, {
                  status: whoopIntegration.status === 'connected' ? 'disconnected' : 'connected'
                });
              }
            }}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
              whoopIntegration?.status === 'connected'
                ? 'bg-green-500/10 text-green-500'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {whoopIntegration?.status === 'connected' ? <><Wifi size={14} /> Connected</> : <><WifiOff size={14} /> Connect</>}
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {latestData.map((metric) => (
          <button key={metric.type} onClick={() => setSelectedMetric(metric.type)}
            className={cn('bg-card border rounded-lg p-4 text-left transition-colors',
              selectedMetric === metric.type ? 'border-primary' : 'border-border hover:border-primary/30')}>
            <div className="flex items-center gap-2 mb-2">
              <metric.icon size={16} style={{ color: metric.color }} />
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: metric.color }}>{metric.value}</div>
            <div className="text-xs text-muted-foreground">{metric.latestUnit}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Chart */}
        <div className="col-span-2 bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">{metricConfig[selectedMetric]?.label} Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Line type="monotone" dataKey="value"
                  stroke={metricConfig[selectedMetric]?.color}
                  strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent entries */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold mb-3">Recent Entries</h3>
          <div className="space-y-2">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-1.5 group">
                <div>
                  <span className="text-sm font-medium">{entry.value} {entry.unit}</span>
                  <span className="text-xs text-muted-foreground ml-2">{entry.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground capitalize">{entry.source}</span>
                  <button onClick={() => deleteHealthData(entry.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
            {recentEntries.length === 0 && (
              <p className="text-sm text-muted-foreground">No data for this metric yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
