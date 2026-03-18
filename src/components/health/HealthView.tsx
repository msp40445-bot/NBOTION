import { useState } from 'react';
import { useHealthStore } from '@/stores/healthStore';
import { cn } from '@/lib/utils';
import {
  Heart, Moon, Footprints, Activity, Zap, Flame, TrendingUp,
  Plus, Wifi, WifiOff
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const metricConfig = {
  sleep: { icon: Moon, color: '#8B5CF6', label: 'Sleep' },
  steps: { icon: Footprints, color: '#3B82F6', label: 'Steps' },
  rhr: { icon: Heart, color: '#EF4444', label: 'Resting HR' },
  hrv: { icon: Activity, color: '#10B981', label: 'HRV' },
  recovery: { icon: TrendingUp, color: '#F59E0B', label: 'Recovery' },
  strain: { icon: Zap, color: '#EC4899', label: 'Strain' },
  calories: { icon: Flame, color: '#F97316', label: 'Calories' },
};

export function HealthView() {
  const { healthData, integrations, updateIntegration } = useHealthStore();
  const [selectedMetric, setSelectedMetric] = useState<string>('sleep');

  const latestData = Object.entries(metricConfig).map(([type, config]) => {
    const latest = healthData.filter((d) => d.type === type).sort((a, b) => b.date.localeCompare(a.date))[0];
    return { type, ...config, value: latest?.value ?? 0, unit: latest?.unit ?? '' };
  });

  const chartData = healthData
    .filter((d) => d.type === selectedMetric)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ date: d.date.slice(5), value: d.value }));

  const whoopIntegration = integrations.find((i) => i.type === 'whoop');

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
      </div>

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
          <button
            key={metric.type}
            onClick={() => setSelectedMetric(metric.type)}
            className={cn(
              'bg-card border rounded-lg p-4 text-left transition-colors',
              selectedMetric === metric.type ? 'border-primary' : 'border-border hover:border-primary/30'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <metric.icon size={16} style={{ color: metric.color }} />
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: metric.color }}>{metric.value}</div>
            <div className="text-xs text-muted-foreground">{metric.unit}</div>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">{metricConfig[selectedMetric as keyof typeof metricConfig]?.label} Trend</h3>
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
              <Line
                type="monotone"
                dataKey="value"
                stroke={metricConfig[selectedMetric as keyof typeof metricConfig]?.color}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
