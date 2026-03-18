import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { Lock, Shield } from 'lucide-react';

export function LockScreen() {
  const { unlock } = useAppStore();
  const [password, setPassword] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length > 0) {
      unlock(password);
    }
  };

  return (
    <div className="h-screen w-screen bg-background flex items-center justify-center">
      <div className="w-80 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">NBOTION</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter your password to unlock</p>
        <form onSubmit={handleUnlock}>
          <div className="relative mb-4">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Unlock
          </button>
        </form>
        <p className="text-xs text-muted-foreground mt-4">
          All data is encrypted with AES-256-GCM
        </p>
      </div>
    </div>
  );
}
