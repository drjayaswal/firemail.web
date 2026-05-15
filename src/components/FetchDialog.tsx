'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CircleMinusIcon, CirclePlusIcon, CloudIcon, DatabaseZapIcon } from 'lucide-react';

interface FetchMailsConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFetchFromCache: () => void;
  onFetchFromCloud: (count: number) => void;
  fetchMailsCount: number;
  setFetchMailsCount: (count: number) => void;
}

export default function FetchMailsConfirmDialog({
  open,
  onOpenChange,
  onFetchFromCache,
  onFetchFromCloud,
  fetchMailsCount,
  setFetchMailsCount,
}: FetchMailsConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl border border-white/20 bg-black sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl tracking-tight text-white">Load inbox</DialogTitle>
          <DialogDescription className="sm:text-[10px] text-[9px] uppercase tracking-widest text-muted-foreground">
            Choose cached emails or fetch emails from Cloud
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2 items-center bg-black border-white/20">
          <div className="flex items-center justify-between w-48 border-white/20 border rounded-2xl pr-2 p-1">
          <Button
            type="button"
            variant="accent"
            onClick={() => {
              onFetchFromCloud(fetchMailsCount);
              onOpenChange(false);
            }}
            >
              <CloudIcon/>
            Cloud
          </Button>
          <div className="flex cursor-pointer items-center gap-2">
            <CircleMinusIcon className={fetchMailsCount == 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} onClick={() => {
              if (fetchMailsCount <= 1) return;
              setFetchMailsCount(fetchMailsCount - 1);
            }}/>
            {fetchMailsCount}
            <CirclePlusIcon className={fetchMailsCount == 10 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} onClick={() => {
              if (fetchMailsCount == 10) return;
              setFetchMailsCount(fetchMailsCount + 1);
            }}/>
          </div>
            </div>
          <Button
            type="button"
            className='justify-self-end'
            variant="no_outline"
            onClick={() => {
              onFetchFromCache();
              onOpenChange(false);
            }}
          >
            <DatabaseZapIcon/>
            Cache
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
