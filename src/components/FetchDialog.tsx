'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CloudDownloadIcon, CloudIcon } from 'lucide-react';
import MailQueryFields, { buildMailQueryOptions } from '@/components/MailQueryFields';
import type { FetchOptions } from '@/types';

interface FetchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFetchFromCloud: (opts: FetchOptions) => void;
}

export default function FetchDialog({
  open,
  onOpenChange,
  onFetchFromCloud,
}: FetchDialogProps) {
  const [unread, setUnread] = useState(true);
  const [days, setDays] = useState(1);
  const [count, setCount] = useState(1);
  const [important, setImportant] = useState(false);
  const [starred, setStarred] = useState(false);
  const fields = { unread, setUnread, days, setDays, count, setCount, important, setImportant, starred, setStarred };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-xl border border-white/20 bg-black sm:max-w-xs">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl tracking-tight text-white">Fetch mails</DialogTitle>
          <DialogDescription className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Query Gmail with filters below
          </DialogDescription>
        </DialogHeader>
        <MailQueryFields {...fields} />
        <DialogFooter className="grid grid-cols-2 gap-2 border-white/20 bg-black">
          <Button
            type="button"
            variant="accent"
            className='w-fit!'
            onClick={() => {
              onFetchFromCloud(buildMailQueryOptions(fields));
              onOpenChange(false);
            }}
          >
            <CloudDownloadIcon />
            Fetch Mails
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
