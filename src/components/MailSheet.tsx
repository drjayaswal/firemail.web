'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Mail } from '@/types';
import { Badge } from './ui/badge';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { formatEmailContent } from '@/lib/utils';

interface MailDetailSheetProps {
  mail: Mail | null;
  onClose: () => void;
}

export default function MailSheet({
  mail,
  onClose,
}: MailDetailSheetProps) {
  useBodyScrollLock(!!mail);

  return (
    <AnimatePresence>
      {mail && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-70 flex max-h-[85dvh] flex-col rounded-t-3xl border border-b-0 border-white/20 bg-black"
          >
            <div className="flex shrink-0 justify-center py-3">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-4 pb-8 pt-2">
              <div className="mb-4 flex shrink-0 items-center justify-between">
                <div className="flex min-w-0 items-center gap-2 space-y-0.5">
                  <p className="truncate text-sm font-medium">{mail.sender}</p>
                  <Badge variant={mail.status === 'unread' ? 'failure_light' : 'success_light'} className="shrink-0 capitalize px-3">
                    {mail.status}
                  </Badge>
                </div>
                <button type="button" onClick={onClose} className="shrink-0 rounded-full p-2 transition-colors hover:bg-white/5">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 shrink-0">
                <h2 className="text-xl font-semibold leading-tight wrap-break-word">{mail.subject}</h2>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(mail.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar">
                <div className="p-1 pb-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                    {formatEmailContent(mail.body) || "No content."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}