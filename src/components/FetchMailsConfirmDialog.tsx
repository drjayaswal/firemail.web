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

interface FetchMailsConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseCached: () => void;
  onFetchFromGmail: () => void;
}

export default function FetchMailsConfirmDialog({
  open,
  onOpenChange,
  onUseCached,
  onFetchFromGmail,
}: FetchMailsConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl border border-white/10 bg-background/95 backdrop-blur-2xl sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl tracking-tight text-white">Load inbox</DialogTitle>
          <DialogDescription className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Choose cached index or live Gmail sync
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex gap-3 justify-center items-center">
          <Button
            type="button"
            variant="accent"
            onClick={() => {
              onFetchFromGmail();
              onOpenChange(false);
            }}
          >
            Fetch from Gmail
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onUseCached();
              onOpenChange(false);
            }}
          >
            Use cached
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
