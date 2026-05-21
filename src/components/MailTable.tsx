'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail } from '@/types';
import { formatEmailContent, cn } from '@/lib/utils';

const HOLD_MS = 450;

interface MailTableProps {
  mails: Mail[];
  loading: boolean;
  onMailClick: (mail: Mail) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleAll?: () => void;
  onRowHoldSelect?: (mail: Mail) => void;
}

export default function MailTable({
  mails,
  loading,
  onMailClick,
  selectable = false,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onRowHoldSelect,
}: MailTableProps) {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdFired = useRef(false);
  const allSelected = selectable && mails.length > 0 && mails.every((m) => selectedIds?.has(m.id));

  const clearHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const startHold = (mail: Mail) => {
    if (!onRowHoldSelect) return;
    holdFired.current = false;
    clearHold();
    holdTimer.current = setTimeout(() => {
      holdFired.current = true;
      onRowHoldSelect(mail);
    }, HOLD_MS);
  };

  return (
    <div className="overflow-x-auto no-scrollbar">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable ? (
              <TableHead className="w-10">
                {selectedIds?.size || allSelected ? 
                <Checkbox checked={allSelected} onCheckedChange={() => onToggleAll?.()} aria-label="Select all" />
                :null}
              </TableHead>
            ) : null}
            <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-[12px] sm:tracking-widest">Status</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-[12px] sm:tracking-widest">Origin</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-[12px] sm:tracking-widest">Subject</TableHead>
            <TableHead className="hidden text-[10px] uppercase tracking-wider text-muted-foreground md:table-cell sm:text-[12px] sm:tracking-widest">Body</TableHead>
            <TableHead className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:table-cell sm:text-[12px] sm:tracking-widest">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="">
                  {selectable ? (
                    <TableCell>
                      <Skeleton className="h-4 w-4 bg-white/5" />
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <Skeleton className="h-4 w-16 bg-white/5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 bg-white/5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 bg-white/5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 bg-white/5" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-24 bg-white/5" />
                  </TableCell>
                </TableRow>
              ))
            ) : mails.length === 0 ? (
              <TableRow className="border-black/20 hover:bg-transparent">
                <TableCell colSpan={selectable ? 6 : 5} className="h-32 text-center text-[10px] uppercase tracking-wider text-muted-foreground sm:h-48 sm:text-xs sm:tracking-widest">
                  No Mails Found
                </TableCell>
              </TableRow>
            ) : (
              mails.map((mail) => {
                const selected = selectedIds?.has(mail.id) ?? false;
                const isAnyMailSelected = (selectedIds?.size ?? 0) > 0;

                return (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    key={mail.id}
                    className={cn(
                      'group cursor-pointer rounded-xl transition-colors text-black hover:bg-black/3',
                      selected && 'bg-accent/10 hover:bg-accent/10 text-black',
                    )}
                    onPointerDown={() => startHold(mail)}
                    onPointerUp={() => clearHold()}
                    onPointerLeave={() => clearHold()}
                    onPointerCancel={() => clearHold()}
                    onClick={() => {
                      if (holdFired.current) {
                        holdFired.current = false;
                        return;
                      }

                      if (isAnyMailSelected) {
                        onToggleSelect?.(mail.id);
                      } else {
                        onMailClick(mail);
                      }
                    }}
                  >
                    {selectable ? (
                      <TableCell className="py-2 sm:py-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected}
                          className='data-checked:bg-accent data-checked:border-accent'
                          onCheckedChange={() => onToggleSelect?.(mail.id)}
                          aria-label={`Select ${mail.subject}`}
                        />
                      </TableCell>
                    ) : null}
                    <TableCell className="py-2 sm:py-4">
                      <Badge variant={mail.status === 'unread' ? 'failure_light' : 'success_light'} className="px-1.5 py-0 text-[9px] capitalize sm:px-2 sm:text-[10px]">
                        {mail.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[28vw] py-2 text-xs tracking-tight sm:max-w-none sm:py-4 sm:text-sm">
                      <span className="block truncate sm:max-w-[280px]">{mail.sender.split('<')[0]}</span>
                    </TableCell>
                    <TableCell className="max-w-[36vw] py-2 text-xs tracking-tight sm:max-w-none sm:py-4 sm:text-sm">
                      <span className="block truncate sm:max-w-[280px]">{mail.subject}</span>
                    </TableCell>
                    <TableCell className="hidden max-w-[40vw] py-2 text-xs tracking-tight md:table-cell sm:py-4 sm:text-sm sm:max-w-none">
                      <span className="block truncate sm:max-w-[280px]">{formatEmailContent(mail.body)}</span>
                    </TableCell>
                    <TableCell className="hidden py-2 text-right text-[10px] text-muted-foreground sm:table-cell sm:py-4 sm:text-xs">
                      {new Date(mail.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}