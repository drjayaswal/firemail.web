'use client';

import { useMemo, useState } from 'react';
import type { Mail } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatEmailContent } from '@/lib/utils';
import { formatMailPriorityDisplay, parseMailPriority } from '@/lib/mail-priority';

type Props = {
  mails: Mail[];
  onOpenDetail: (mail: Mail) => void;
};

function hashToSpreadY(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = Math.imul(31, h) + id.charCodeAt(i);
  const n = (h >>> 0) % 10_000;
  return (n / 9_999) * 2 - 1;
}

function priorityToX(priority: number, minP: number, maxP: number): number {
  if (maxP === minP) return 0;
  return ((priority - minP) / (maxP - minP)) * 2 - 1;
}

function positionInPlot(xNorm: number, yNorm: number): { left: string; top: string } {
  const left = 10 + ((xNorm + 1) / 2) * 80;
  const top = 10 + ((1 - (yNorm + 1) / 2) * 80);
  return { left: `${left}%`, top: `${top}%` };
}

export default function AnalyzedMailsPriorityGraph({ mails, onOpenDetail }: Props) {
  const [preview, setPreview] = useState<Mail | null>(null);

  const layout = useMemo(() => {
    if (mails.length === 0) return [];
    const priorities = mails.map((m) => parseMailPriority(m.priority));
    const minP = Math.min(...priorities);
    const maxP = Math.max(...priorities);
    return mails.map((mail) => {
      const p = parseMailPriority(mail.priority);
      const x = priorityToX(p, minP, maxP);
      const y = hashToSpreadY(mail.id);
      return { mail, x, y, minP, maxP };
    });
  }, [mails]);

  if (mails.length === 0) return null;

  const batchMinP = Math.min(...mails.map((m) => parseMailPriority(m.priority)));
  const batchMaxP = Math.max(...mails.map((m) => parseMailPriority(m.priority)));
  const previewNormalized =
    preview != null
      ? priorityToX(parseMailPriority(preview.priority), batchMinP, batchMaxP)
      : null;

  return (
    <>
      <section className="p-4 sm:p-6">
        <h3 className="mb-1 text-sm font-medium text-foreground">Analyzed mails</h3>
        <TooltipProvider delayDuration={200}>
          <div className="relative mx-auto aspect-4/3 w-full max-w-2xl min-h-[220px] select-none sm:min-h-[280px]">
            <div className="absolute inset-0">
              <div className="absolute bottom-2 left-[10%] right-[10%] flex justify-between text-base tabular-nums text-white/50">
                <span>-1</span>
                <span>0</span>
                <span>1</span>
              </div>
              <div className="pointer-events-none absolute inset-[10%] border-b border-white/50" />
              <div className="pointer-events-none absolute left-[10%] right-[10%] top-1/2 border-t border-dashed border-white/5" />
              <div className="pointer-events-none absolute left-1/2 top-[10%] bottom-[10%] border-l border-dashed border-white/5" />
            </div>

            {layout.map(({ mail, x, y }) => {
              const { left, top } = positionInPlot(x, y);
              const cats = mail.categories?.filter(Boolean) ?? [];
              return (
                <Tooltip key={mail.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Analyzed mail: ${mail.subject}`}
                      className={cn(
                        'absolute z-10 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full',
                        'bg-white/50 cursor-pointer',
                        'transition-transform hover:scale-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                      )}
                      style={{ left, top }}
                      onClick={() => setPreview(mail)}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="w-fit! flex items-center gap-2 bg-transparent">
                    {cats.length > 0 ? (
                      cats.map((cat, idx) => (
                        <div key={idx} className="mt-1 text-[11px] bg-blue-600 text-white py-1 px-2 rounded-md">
                          {cat}
                        </div>
                      ))
                    ) : (
                      <div className="mt-1 text-[11px] opacity-90">No categories</div>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </section>

      {preview ? (
      <Dialog open onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="sm:max-w-md" showCloseButton>
            <>
              <DialogHeader>
                <DialogTitle className="line-clamp-2 pr-8">{preview.sender.split("<")[0]}</DialogTitle>
                <DialogDescription className="space-y-2 pt-1 text-left">
                  <span className="block text-xs">
                    {new Date(preview.createdAt).toLocaleString()}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide truncate text-muted-foreground">Priority</span>
                  <p className="mt-0.5 tabular-nums">
                    {formatMailPriorityDisplay(preview.priority)}
                    {previewNormalized != null && (
                      <span className="text-muted-foreground">
                        {' '}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Categories</span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {(preview.categories?.filter(Boolean).length ?? 0) > 0 ? (
                      preview.categories!.filter(Boolean).map((c, i) => (
                        <Badge key={`${c}-${i}`} variant="outline" className="text-xs bg-blue-600 text-white rounded-md! font-normal">
                          {c}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
                <p className="line-clamp-3 text-xs text-muted-foreground">
                  {formatEmailContent(preview.body).slice(0, 220)}
                  {(preview.body?.length ?? 0) > 220 ? '...' : ''}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="accent"
                  type="button"
                  onClick={() => {
                    onOpenDetail(preview);
                    setPreview(null);
                  }}
                >
                  Open Mail
                </Button>
              </div>
            </>
        </DialogContent>
      </Dialog>
      ) : null}
    </>
  );
}
