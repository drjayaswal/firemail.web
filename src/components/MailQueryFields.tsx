'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRightToLineIcon, Info, Minus, Plus } from 'lucide-react';
import type { MailQueryOptions } from '@/types';

export type MailQueryFieldsProps = {
  unread: boolean;
  setUnread: (v: boolean) => void;
  days: number;
  setDays: (v: number) => void;
  count: number;
  setCount: (v: number) => void;
  important: boolean;
  setImportant: (v: boolean) => void;
  starred: boolean;
  setStarred: (v: boolean) => void;
};

function FlagRow({
  id,
  label,
  checked,
  onCheckedChange,
  tip,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (c: boolean) => void;
  tip?: string;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(c) => onCheckedChange(c === true)} />
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="cursor-pointer text-sm font-medium text-gray-300">
          {label}
        </Label>
        {tip ? (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 cursor-help text-accent" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[280px] border-border bg-white text-[10px]">
                <p>{tip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
    </div>
  );
}

export function buildMailQueryOptions(p: MailQueryFieldsProps): MailQueryOptions {
  return {
    unread: p.unread,
    days: p.days,
    count: p.count,
    important: p.important,
    starred: p.starred,
  };
}

function Counter({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-muted/20 p-1">
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 border-0 text-white disabled:border-transparent" onClick={() => onChange(min)} disabled={value === min}>
        <ArrowRightToLineIcon className="rotate-180" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-4xl text-white disabled:border-transparent" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        <Minus className="h-3 w-3" />
      </Button>
      <span className="text-sm font-medium text-white">{value}</span>
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-4xl text-white disabled:border-transparent" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
        <Plus className="h-3 w-3" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 border-0 text-white disabled:border-transparent" onClick={() => onChange(max)} disabled={value === max}>
        <ArrowRightToLineIcon />
      </Button>
    </div>
  );
}

export default function MailQueryFields(p: MailQueryFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label className="text-[11px] text-gray-400">Emails Count</Label>
          <Counter value={p.count} min={1} max={10} onChange={p.setCount} />
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] text-gray-400">Lookback Days</Label>
          <Counter value={p.days} min={1} max={7} onChange={p.setDays} />
        </div>
      </div>
      <div className="space-y-4">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Status & Flags</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="unread" checked={p.unread} onCheckedChange={() => p.setUnread(true)} />
            <Label htmlFor="unread" className="text-sm font-medium text-gray-300">
              Unread
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="read" checked={!p.unread} onCheckedChange={() => p.setUnread(false)} />
            <Label htmlFor="read" className="text-sm font-medium text-gray-300">
              Read
            </Label>
          </div>
          <FlagRow id="important" label="Important" checked={p.important} onCheckedChange={p.setImportant} tip="Emails marked important" />
          <FlagRow id="starred" label="Starred" checked={p.starred} onCheckedChange={p.setStarred} tip="Emails you ★ starred" />
        </div>
      </div>
    </div>
  );
}
