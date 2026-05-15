'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, Reply, Forward, Trash2 } from 'lucide-react';
import { Mail } from '@/types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { formatEmailContent } from '@/lib/utils';

interface MailDetailSheetProps {
  mail: Mail | null;
  onClose: () => void;
}

export default function MailSheet({ mail, onClose }: MailDetailSheetProps) {
  useBodyScrollLock(!!mail);

  const initials = mail?.sender
    ? mail.sender.split('@')[0].slice(0, 2).toUpperCase()
    : '??';

  const formattedDate = mail
    ? new Date(mail.createdAt).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <AnimatePresence>
      {mail && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-70 flex max-h-[88dvh] flex-col rounded-t-2xl border border-b-0 border-border/50 bg-background shadow-2xl"
          >
            <div className="flex shrink-0 justify-center pt-3 pb-1">
              <div className="h-1 w-8 rounded-full bg-muted-foreground/25" />
            </div>
            <div className="shrink-0 px-4 sm:px-5 pt-2 pb-3 border-b border-border/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-semibold text-primary">{initials}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground truncate max-w-[160px] sm:max-w-xs">
                        {mail.sender}
                      </p>
                      <Badge
                        variant={mail.status === 'unread' ? 'failure_light' : 'success_light'}
                        className="capitalize text-[10px] px-2 py-0 h-4 shrink-0"
                      >
                        {mail.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                      <p className="text-[11px] text-muted-foreground truncate">{formattedDate}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {mail.recipient && (
                <div className="mt-2.5 flex items-center gap-1.5">
                  <User className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                  <span className="text-[11px] text-muted-foreground">To:</span>
                  <span className="text-[11px] text-muted-foreground/80 truncate">{mail.recipient}</span>
                </div>
              )}
            </div>
            <div className="shrink-0 px-4 sm:px-5 py-3 border-b border-border/30 bg-muted/20">
              <h2 className="text-base sm:text-lg font-semibold leading-snug text-foreground wrap-break-word">
                {mail.subject}
              </h2>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4">
              <div className="max-w-none">
                <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap wrap-break-word">
                  {formatEmailContent(mail.body) || 'No content.'}
                </p>
              </div>
            </div>
            <div className="shrink-0 px-4 sm:px-5 py-3 border-t border-border/50 bg-muted/10">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-1.5 text-xs h-8">
                  <Reply className="h-3.5 w-3.5" />
                  Reply
                </Button>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-1.5 text-xs h-8">
                  <Forward className="h-3.5 w-3.5" />
                  Forward
                </Button>
                <div className="flex-1 sm:hidden" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}