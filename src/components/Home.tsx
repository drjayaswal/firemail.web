'use client';

import { useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { OmegaIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { fetchMailsAction, syncEncryptedMailsToDb } from '@/app/actions';
import { Mail } from '@/types';
import { toast } from 'sonner';
import { readMailsFromCache, writeMailsToCache } from '@/lib/mailCache';

import SiphonLoader from './Loader';
import Header from './Header';
import MailTable from './MailTable';
import MailSheet from './MailSheet';
import VoiceModal from './VoiceModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import Image from 'next/image';
import FetchMailsConfirmDialog from './FetchMailsConfirmDialog';

type SystemStatus = 'Active' | 'Standby' | 'Processing' | 'Offline';

const statusConfig = {
  Active: { color: 'bg-green-500', shadow: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]', animation: 'animate-ping' },
  Standby: { color: 'bg-amber-500', shadow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]', animation: '' },
  Processing: { color: 'bg-blue-500', shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]', animation: 'animate-pulse' },
  Offline: { color: 'bg-red-600', shadow: 'shadow-[0_0_10px_rgba(220,38,38,0.5)]', animation: '' },
};

export default function Home({
  sessionUserEmail,
  sessionUserId,
  initialMails = [],
}: {
  sessionUserEmail?: string | null;
  sessionUserId?: string | null;
  initialMails?: Mail[];
}) {
  const [appLoading, setAppLoading] = useState(true);
  const [mails, setMails] = useState<Mail[]>(initialMails);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [fetchDialogOpen, setFetchDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [detailMail, setDetailMail] = useState<Mail | null>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<SystemStatus>('Active');
  const [orchestratorStatus, setOrchestratorStatus] = useState<SystemStatus>('Offline');

  useLayoutEffect(() => {
    queueMicrotask(() => {
      const cached = readMailsFromCache(sessionUserEmail);
      if (cached.length > 0) {
        setMails(cached);
      }
    });
  }, [sessionUserEmail]);

  const handleUseCached = () => {
    const cached = readMailsFromCache(sessionUserEmail);
    if (cached.length === 0) {
      toast.error('No Cache found!');
      return;
    }
    setMails(cached);
    toast.success('Loaded Cache!');
  };

  const handleFetchFromGmail = () => {
    void (async () => {
      setLoading(true);
      try {
        const data = await fetchMailsAction();
        setMails(data);
        writeMailsToCache(sessionUserEmail, data);
        if (data.length === 0) {
          toast.error('No New Messages!');
        } else {
          toast.success('New Messages Synched!');
        }
      } catch {
        toast.error('Protocol failure: Could not retrieve new messages');
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleSyncCloud = () => {
    void (async () => {
      if (!sessionUserId) {
        toast.error('Session not linked to User!');
        return;
      }
      setSyncing(true);
      try {
        const result = await syncEncryptedMailsToDb();
        if (!result.ok) {
          toast.error(result.error ?? 'Cloud sync failed!');
        } else {
          toast.success(`Cloud Synched with ${result.count ?? 0} Messages!`);
        }
      } finally {
        setSyncing(false);
      }
    })();
  };

  const filteredMails = mails.filter(
    (m) =>
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sender.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (appLoading) {
    return <SiphonLoader onComplete={() => setAppLoading(false)} />;
  }

  return (
    <div className="min-h-0 bg-background text-foreground p-3 selection:bg-accent/30 selection:text-white sm:p-8 lg:p-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto min-w-0 max-w-7xl space-y-8 sm:space-y-12"
      >
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          loading={loading}
          syncing={syncing}
          onAnalyze={() => undefined}
          onVoice={() => setVoiceOpen(true)}
          onFetch={() => setFetchDialogOpen(true)}
          onSyncCloud={handleSyncCloud}
          sessionUserEmail={sessionUserEmail}
        />
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex min-w-0 gap-4 sm:items-center justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="shrink-0 rounded-lg bg-white/15 p-1 sm:p-2">
                <Image src="/orchestrator.svg" alt="Orchestrator" width={30} height={30} className="invert" />
              </div>
              <div className="min-w-0">
                <span className="text-sm text-white">Orchestrator</span>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    className="mt-0.5 flex w-fit cursor-pointer items-center justify-center rounded-4xl border border-border px-2 py-1 outline-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <div
                          className={`h-2 w-2 rounded-full ${statusConfig[orchestratorStatus].color} ${statusConfig[orchestratorStatus].shadow}`}
                        />
                        {statusConfig[orchestratorStatus].animation && (
                          <div
                            className={`absolute inset-0 h-2 w-2 rounded-full ${statusConfig[orchestratorStatus].color} ${statusConfig[orchestratorStatus].animation} opacity-75`}
                          />
                        )}
                      </div>
                      <span className="text-xs">{orchestratorStatus}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <div onClick={() => setOrchestratorStatus('Active')} className="flex items-center gap-2 px-2 py-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      <span className="text-xs">Active</span>
                    </div>
                    <div onClick={() => setOrchestratorStatus('Standby')} className="flex items-center gap-2 px-2 py-1">
                      <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                      <span className="text-xs">Standby</span>
                    </div>
                    <div onClick={() => setOrchestratorStatus('Processing')} className="flex items-center gap-2 px-2 py-1">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                      <span className="text-xs">Processing</span>
                    </div>
                    <div onClick={() => setOrchestratorStatus('Offline')} className="flex items-center gap-2 px-2 py-1">
                      <div className="h-2 w-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
                      <span className="text-xs">Offline</span>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-3 sm:justify-end">
              <div className="min-w-0">
                <span className="text-sm text-white">Microservices</span>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    className="mt-0.5 flex w-fit cursor-pointer items-center justify-center rounded-4xl border border-border px-2 py-1 outline-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <div
                          className={`h-2 w-2 rounded-full ${statusConfig[serviceStatus].color} ${statusConfig[serviceStatus].shadow}`}
                        />
                        {statusConfig[serviceStatus].animation && (
                          <div
                            className={`absolute inset-0 h-2 w-2 rounded-full ${statusConfig[serviceStatus].color} ${statusConfig[serviceStatus].animation} opacity-75`}
                          />
                        )}
                      </div>
                      <span className="text-xs">{serviceStatus}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <div onClick={() => setServiceStatus('Active')} className="flex items-center gap-2 px-2 py-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      <span className="text-xs">Active</span>
                    </div>
                    <div onClick={() => setServiceStatus('Standby')} className="flex items-center gap-2 px-2 py-1">
                      <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                      <span className="text-xs">Standby</span>
                    </div>
                    <div onClick={() => setServiceStatus('Processing')} className="flex items-center gap-2 px-2 py-1">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                      <span className="text-xs">Processing</span>
                    </div>
                    <div onClick={() => setServiceStatus('Offline')} className="flex items-center gap-2 px-2 py-1">
                      <div className="h-2 w-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
                      <span className="text-xs">Offline</span>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="shrink-0 rounded-lg bg-white/15 p-1 sm:p-2">
                <OmegaIcon className="h-7.5 w-7.5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="min-w-0 px-3 sm:px-4">
            <MailTable
              mails={filteredMails}
              loading={loading}
              onMailClick={setDetailMail}
            />
          </CardContent>
        </Card>
      </motion.div>

      <MailSheet mail={detailMail} onClose={() => setDetailMail(null)} />

      <FetchMailsConfirmDialog
        open={fetchDialogOpen}
        onOpenChange={setFetchDialogOpen}
        onUseCached={handleUseCached}
        onFetchFromGmail={handleFetchFromGmail}
      />

      <VoiceModal open={voiceOpen} onClose={() => setVoiceOpen(false)} onResult={(text) => setSearchTerm(text)} />
    </div>
  );
}
