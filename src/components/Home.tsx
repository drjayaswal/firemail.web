'use client';

import { useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { OmegaIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { fetchMailsAction, analyzeMailsAction, syncEncryptedMailsToDb } from '@/app/actions';
import { AnalyzeOptions, Mail } from '@/types';
import { signOut } from 'next-auth/react';
import { readMailsFromCache, writeMailsToCache } from '@/lib/mailCache';
import Header from './Header';
import MailTable from './MailTable';
import MailSheet from './MailSheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import Image from 'next/image';
import FetchDialog from './FetchDialog';
import AnalyzeDialog from './AnalyzeDialog';
import AnalyzedMailsPriorityGraph from './AnalyzedMailsPriorityGraph';
import { apiRequest } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from './ui/button';
import Loader from './Loader';

type SystemStatus = 'Active' | 'Standby' | 'Processing' | 'Offline';

const statusConfig = {
  Active: { color: 'bg-green-500', shadow: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]', animation: 'animate-pulse' },
  Standby: { color: 'bg-amber-500', shadow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]', animation: 'animate-pulse' },
  Processing: { color: 'bg-blue-500', shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]', animation: 'animate-pulse' },
  Offline: { color: 'bg-red-600', shadow: 'shadow-[0_0_10px_rgba(220,38,38,0.5)]', animation: 'animate-pulse' },
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
  const [analyzing, setAnalyzing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [fetchDialogOpen, setFetchDialogOpen] = useState(false);
  const [analyzeDialogOpen, setAnalyzeDialogOpen] = useState(false);
  const [analyzedExistingMails, setAnalyzedExistingMails] = useState<Mail[]>([]);
  const [fetchMailsCount, setFetchMailsCount] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailMail, setDetailMail] = useState<Mail | null>(null);
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

  const handleFetchFromCache = () => {
    const cached = readMailsFromCache(sessionUserEmail);
    if (cached.length === 0) {
      toast.error('No New Message!');
      return;
    }
    setMails(cached);
    toast.success(`${cached.length > 1 ? "Messages" : "Message"} Loaded!`);
  };

  const handleFetchFromCloud = (count: number) => {
    void (async () => {
      setLoading(true);
      setServiceStatus("Standby")
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setServiceStatus("Processing")
        const data = await fetchMailsAction(count);
        setMails(data);
        writeMailsToCache(sessionUserEmail, data);
        if (data.length === 0) {
          toast.error('No New Messages!');
        } else {
          toast.success(`${data.length} ${data.length > 1 ? "Messages" : "Message"} Loaded!`);
        }
      } catch(e) {
        console.log(e)
      } finally {
        setLoading(false);
        setServiceStatus(serviceStatus)
      }
    })();
  };
  const handleSignOut = async () => {
    setLoading(true);
    setSyncing(true);
    setAnalyzing(true);
    setOrchestratorStatus("Standby")
    setServiceStatus("Standby")
    await new Promise((resolve) => setTimeout(resolve, 1000));
    signOut();
    setLoading(false);
    setSyncing(false);
    setAnalyzing(false);
    setOrchestratorStatus(orchestratorStatus)
    setServiceStatus(serviceStatus)
    toast.success("Session Closed!")
  };
  const handleAnalyze = (opts: AnalyzeOptions) => {
    void (async () => {
      setAnalyzing(true);
      setOrchestratorStatus("Standby")
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setOrchestratorStatus("Processing")
        const data = await analyzeMailsAction(opts);
        if (!data.ok) {
          toast.error(data.error ?? 'Analyze failed');
          setAnalyzedExistingMails([]);
          return;
        }
        setAnalyzedExistingMails(data.existingInDb ?? []);
        if (data.missingInDb?.length === 0) {
          toast.success('No New Message!');
        } else {
          toast.success(`${data.missingInDb?.length}/${Number(data.existingInDb?.length) + Number(data.missingInDb?.length)} Mails Ready for Analysis`);
        }
        const analyzeBody = { newMails: data.missingInDb, existingMails: data.existingInDb, options: opts }
        console.log(analyzeBody);
        return
        const toastId = toast.loading("Analyzing...");
        await apiRequest<{ status: number; message: string }>("/analyze/mails", {
          method: "POST",
          body: analyzeBody,
        });
        // setMails(data);
        // writeMailsToCache(sessionUserEmail, data);
        // if (data.length === 0) {
        //   toast.error('No New Messages!');
        // } else {
        //   toast.success('New Messages Synched!');
        // }
        toast.remove(toastId)
      } catch {
        console.error('Protocol failure: Could not retrieve new messages');
      } finally {
        setOrchestratorStatus(orchestratorStatus)
        setAnalyzing(false);
      }
    })();
  };

  const handleSyncDatabase = (count:number) => {
    void (async () => {
      if (!sessionUserId) {
        toast.error('Session not linked to User!');
        return;
      }
      setSyncing(true);
      setServiceStatus("Standby")
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setServiceStatus("Processing")
        const result = await syncEncryptedMailsToDb(count);
        if (!result.ok) {
          toast.error(result.error ?? 'Database sync failed!');
        } else {
          toast.success(`Database Synched!`);
        }
      } finally {
        setSyncing(false);
        setServiceStatus(serviceStatus)
      }
    })();
  };

  const filteredMails = mails.filter(
    (m) =>
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sender.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (appLoading) {
    return <Loader message={"Indexing"} onComplete={() => setAppLoading(false)} />;
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
          analyzing={analyzing}
          loading={loading}
          syncing={syncing}
          onSignOut={handleSignOut}
          onAnalyze={() => setAnalyzeDialogOpen(true)}
          onFetch={() => setFetchDialogOpen(true)}
          onSyncDatabase={handleSyncDatabase}
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
        {analyzedExistingMails.length > 0 && (
          <AnalyzedMailsPriorityGraph mails={analyzedExistingMails} onOpenDetail={setDetailMail} />
        )}
      </motion.div>

      <MailSheet mail={detailMail} onClose={() => setDetailMail(null)} />

      <FetchDialog
        fetchMailsCount={fetchMailsCount}
        setFetchMailsCount={setFetchMailsCount}
        open={fetchDialogOpen}
        onOpenChange={setFetchDialogOpen}
        onFetchFromCache={handleFetchFromCache}
        onFetchFromCloud={handleFetchFromCloud}
      />

      <AnalyzeDialog
        open={analyzeDialogOpen}
        onOpenChange={setAnalyzeDialogOpen}
        onAnalyze={(opts: AnalyzeOptions) => { handleAnalyze(opts); }}
      />

    </div>
  );
}
