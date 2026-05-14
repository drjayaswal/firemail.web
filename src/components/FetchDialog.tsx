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
import { CloudDownloadIcon, DatabaseBackupIcon, DatabaseZapIcon } from 'lucide-react';

interface FetchMailsConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFetchFromCache: () => void;
  onFetchFromCloud: () => void;
}

export default function FetchMailsConfirmDialog({
  open,
  onOpenChange,
  onFetchFromCache,
  onFetchFromCloud,
}: FetchMailsConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl border border-white/10 bg-background/95 backdrop-blur-2xl sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl tracking-tight text-white">Load inbox</DialogTitle>
          <DialogDescription className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Choose cached emails or fetch emails from Cloud
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 justify-center items-center">
          <Button
            type="button"
            variant="accent"
            onClick={() => {
              onFetchFromCloud();
              onOpenChange(false);
            }}
          >
            <CloudDownloadIcon/>
            Cloud
          </Button>
          <Button
            type="button"
            variant="no_outline"
            onClick={() => {
              onFetchFromCache();
              onOpenChange(false);
            }}
          >
            <DatabaseZapIcon className=''/>
            Cache
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
