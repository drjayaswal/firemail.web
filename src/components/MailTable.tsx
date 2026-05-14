'use client';

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
import { Mail } from '@/types';
import { formatEmailContent } from '@/lib/utils';

interface MailTableProps {
  mails: Mail[];
  loading: boolean;
  onMailClick: (mail: Mail) => void;
}

export default function MailTable({
  mails,
  loading,
  onMailClick,
}: MailTableProps) {
  return (
    <div className="overflow-x-auto no-scrollbar">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground">Status</TableHead>
            <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground">Origin</TableHead>
            <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground">Subject</TableHead>
            <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground">Body</TableHead>
            <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground">Timestamp</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="border-white/5">
                  <TableCell><Skeleton className="h-4 w-16 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 bg-white/5" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto bg-white/5" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full bg-white/5" /></TableCell>
                </TableRow>
              ))
            ) : mails.length === 0 ? (
              <TableRow className="border-transparent hover:bg-transparent">
                <TableCell colSpan={4} className="h-48 text-center text-muted-foreground  text-xs uppercase tracking-widest">
                  No telemetry data found
                </TableCell>
              </TableRow>
            ) : (
              mails.map((mail) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  key={mail.id}
                  onClick={() => onMailClick(mail)}
                  className="group hover:bg-white/3 cursor-pointer transition-colors border-white/5"
                >
                  <TableCell className="py-4">
                    <Badge variant={mail.status === 'unread' ? 'failure_light' : 'success_light'} className="capitalize text-[10px] px-2 py-0">
                      {mail.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[40vw] py-4 text-sm tracking-tight sm:max-w-none">
                    <span className="block truncate sm:max-w-[280px]">{mail.sender.split("<")[0]}</span>
                  </TableCell>
                  <TableCell className="max-w-[40vw] py-4 text-sm tracking-tight sm:max-w-none">
                    <span className="block truncate sm:max-w-[280px]">{mail.subject}</span>
                  </TableCell>
                  <TableCell className="max-w-[40vw] py-4 text-sm tracking-tight sm:max-w-none">
                    <span className="block truncate sm:max-w-[280px]">{formatEmailContent(mail.body)}</span>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground  py-4">
                    {new Date(mail.createdAt).toLocaleDateString()}
                  </TableCell>
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
