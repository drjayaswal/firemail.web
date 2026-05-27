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
import { DatabaseZapIcon } from 'lucide-react';
import type { LoadOptions } from '@/types';
import { buildDatabaseQueryOptions, DatabaseQueryFields } from './QueryFields';

interface LoadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionUserId: string | null | undefined;
  onLoadFromDatabase: (opts: LoadOptions) => void;
}

export default function LoadDialog({
  open,
  onOpenChange,
  sessionUserId,
  onLoadFromDatabase,
}: LoadDialogProps) {
  const [count, setCount] = useState(1);
  const fields = { count, setCount, sessionUserId };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200/75 bg-white sm:max-w-xs max-w-xs p-5">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl tracking-tight text-black">Load mails</DialogTitle>
          <DialogDescription className="text-[10px] uppercase tracking-widest text-black/60">
            Query Encrypted mails from Database
          </DialogDescription>
        </DialogHeader>
        <DatabaseQueryFields {...fields} />
        <DialogFooter className="grid grid-cols-2 gap-2 border-t-gray-200/75 bg-white">
          <Button
            type="button"
            variant="accent"
            className='w-fit!'
            onClick={() => {
              onLoadFromDatabase(buildDatabaseQueryOptions(fields, sessionUserId!));
              onOpenChange(false);
            }}
          >
            <DatabaseZapIcon />
            Load Mails
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
