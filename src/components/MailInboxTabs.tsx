'use client';

import { Button } from './ui/button';

export type MailInboxTab = 'fetched' | 'analyzed' | 'encrypted';

const statusConfig = {
  Active: { color: 'bg-green-600' },
  Standby: { color: 'bg-amber-600' },
  Processing: { color: 'bg-blue-600 animate-pulse' },
  Offline: { color: 'bg-red-600' },
} as const;

type Props = {
  active: MailInboxTab;
  fetchedCount: number;
  analyzedCount: number;
  encryptedCount: number;
  currentStatus?: 'Active' | 'Standby' | 'Processing' | 'Offline';
  onChange: (tab: MailInboxTab) => void;
};

export default function MailInboxTabs({ active, fetchedCount, analyzedCount, encryptedCount, currentStatus = 'Active', onChange }: Props) {
  const tabs: { id: MailInboxTab; label: string; count: number }[] = [
    { id: 'fetched', label: 'Fetched', count: fetchedCount },
    { id: 'analyzed', label: 'Analyzed', count: analyzedCount },
    { id: 'encrypted', label: 'Encrypted', count: encryptedCount },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = active === tab.id;

          return (
            <Button
              key={tab.id}
              type="button"
              variant={isActive ? "accent" : "light"}
              onClick={() => onChange(tab.id)}
            >
              <span className="relative z-10">
                {tab.label}
                {tab.count === 0 || <span className="absolute -top-2.5 -right-3.5 p-1 rounded-full bg-green-600" />}
              </span>
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-1 sm:border-l sm:border-gray-200/75 pl-2 h-6">
        {(['Active', 'Standby', 'Processing', 'Offline'] as const).map((s) => {
          const isCurrent = currentStatus === s;
          return (
            <div
              key={s}
              className={`flex items-center gap-2 px-2 py-1 select-none transition-opacity ${isCurrent ? 'opacity-100 font-medium text-black' : 'opacity-40 text-gray-500'
                }`}
            >
              <div className={`h-2 w-2 rounded-full ${statusConfig[s].color}`} />
              <span className="sm:text-xs text-[9px]">{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}