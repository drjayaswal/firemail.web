'use client';

import { Button } from './ui/button';

export type MailInboxTab = 'fetched' | 'analyzed';

type Props = {
  active: MailInboxTab;
  fetchedCount: number;
  analyzedCount: number;
  onChange: (tab: MailInboxTab) => void;
};

export default function MailInboxTabs({ active, fetchedCount, analyzedCount, onChange }: Props) {
  const tabs: { id: MailInboxTab; label: string; count: number }[] = [
    { id: 'fetched', label: 'Fetched', count: fetchedCount },
    { id: 'analyzed', label: 'Analyzed', count: analyzedCount },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = active === tab.id;

        return (
          <Button
            key={tab.id}
            type="button"
            variant={isActive ? "accent" : "outline"}
            onClick={() => onChange(tab.id)}
          >
            <span className="relative z-10">
              {tab.label}
              {tab.count == 0 || <span className="absolute -top-2.5 -right-3.5 p-1 rounded-4xl bg-green-600"/>}
            </span>
          </Button>
        );
      })}
    </div>
  );
}