'use client';

import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { OmegaIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { fetchMailsAction, analyzeMailsAction, syncEncryptedMailsToDb } from '@/app/actions';
import { FetchOptions, Mail } from '@/types';
import { signOut } from 'next-auth/react';
import { buildAnalyzePayload, mergeAnalyzedMails } from '@/lib/analyze-payload';
import { deriveAnalyzeOptionsFromMails } from '@/lib/derive-analyze-options';
import Header from './Header';
import MailTable from './MailTable';
import MailSheet from './MailSheet';
import MailInboxTabs, { type MailInboxTab } from './MailInboxTabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import Image from 'next/image';
import FetchDialog from './FetchDialog';
import AnalyzeDialog from './AnalyzeDialog';
import AnalyzedMailsPriorityGraph from './AnalyzedMailsPriorityGraph';
import { apiRequest } from '@/lib/api';
import { toast } from '@/lib/toast';
import Loader from './Loader';

type SystemStatus = 'Active' | 'Standby' | 'Processing' | 'Offline';

const statusConfig = {
  Active: { color: 'bg-green-500', shadow: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]', animation: 'animate-pulse' },
  Standby: { color: 'bg-amber-500', shadow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]', animation: 'animate-pulse' },
  Processing: { color: 'bg-blue-500', shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]', animation: 'animate-pulse' },
  Offline: { color: 'bg-red-600', shadow: 'shadow-[0_0_10px_rgba(220,38,38,0.5)]', animation: 'animate-pulse' },
};

function toggleInSet(prev: Set<string>, id: string): Set<string> {
  const next = new Set(prev);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export default function Home({
  sessionUserEmail,
  sessionUserId,
}: {
  sessionUserEmail?: string | null;
  sessionUserId?: string | null;
}) {
  const [appLoading, setAppLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MailInboxTab>('fetched');
  const [fetchedMails, setFetchedMails] = useState<Mail[]>([]);
  const [analyzedMails, setAnalyzedMails] = useState<Mail[]>([]);
  const [selectedFetchedIds, setSelectedFetchedIds] = useState<Set<string>>(new Set());
  const [selectedAnalyzedIds, setSelectedAnalyzedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetchDialogOpen, setFetchDialogOpen] = useState(false);
  const [analyzeDialogOpen, setAnalyzeDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailMail, setDetailMail] = useState<Mail | null>(null);
  const [serviceStatus, setServiceStatus] = useState<SystemStatus>('Active');
  const [orchestratorStatus, setOrchestratorStatus] = useState<SystemStatus>('Offline');

  const handleFetchFromCloud = (opts: FetchOptions) => {
    void (async () => {
      setLoading(true);
      setServiceStatus('Standby');
      try {
        const result = await fetchMailsAction(opts);
        if (!result.ok || !result.mails) {
          toast.error(result.error ?? 'Fetch failed');
          return;
        }
        setFetchedMails(result.mails);
        setActiveTab('fetched');
        toast.success(`${result.mails.length} fetched`);
      } finally {
        setLoading(false);
        setServiceStatus('Active');
      }
    })();
  };

  const handleSignOut = async () => {
    setLoading(true);
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 400));
    signOut();
    setLoading(false);
    setAnalyzing(false);
    toast.success('Session closed');
  };

  const selectedFetchedMails = useMemo(
    () => fetchedMails.filter((m) => selectedFetchedIds.has(m.id)),
    [fetchedMails, selectedFetchedIds],
  );

  const openAnalyzeDialog = () => {
    if (activeTab !== 'fetched') {
      setActiveTab('fetched');
    }
    if (selectedFetchedIds.size === 0) {
      toast.error('Select fetched mails to analyze');
      return;
    }
    setAnalyzeDialogOpen(true);
  };

  const handleAnalyzeSelected = (store: boolean) => {
    void (async () => {
      const selection = selectedFetchedMails;
      if (selection.length === 0) {
        toast.error('Select fetched mails to analyze');
        return;
      }
      setAnalyzing(true);
      setOrchestratorStatus('Processing');
      try {
        const data = await analyzeMailsAction(selection, store);
        if (!data.ok) {
          toast.error(data.error ?? 'Analyze failed');
          return;
        }
        const mails = data.missingInDb ?? [];
        const options = data.options ?? deriveAnalyzeOptionsFromMails(selection, store);
        const payload = buildAnalyzePayload(mails, options);
        if (payload.mails.length === 0) {
          toast.error('No mails in selection');
          return;
        }
        const toastId = toast.loading('Analyzing');
        const aiRes = await apiRequest<{ analyzedMails?: Mail[]; mails?: Mail[]; existingMails?: Mail[] }>(
          '/analyze/mails',
          { method: 'POST', body: payload },
        );
        toast.remove(toastId);
        const merged = mergeAnalyzedMails(
          [...payload.mails],
          aiRes.analyzedMails ?? [...(aiRes.mails ?? []), ...(aiRes.existingMails ?? [])],
        );
        setAnalyzedMails((prev) => mergeAnalyzedMails(prev, merged));
        setSelectedFetchedIds(new Set());
        setActiveTab('analyzed');
        toast.success(`${merged.length} analyzed`);
        if (store) {
          const syncResult = await syncEncryptedMailsToDb(merged);
          if (syncResult.ok) toast.success(`${syncResult.count ?? merged.length} stored encrypted`);
          else toast.error(syncResult.error ?? 'Store failed');
        }
      } catch {
        toast.error('Analyze failed');
      } finally {
        setOrchestratorStatus('Offline');
        setAnalyzing(false);
      }
    })();
  };

  const tabMails = activeTab === 'fetched' ? fetchedMails : analyzedMails;
  const filteredMails = useMemo(
    () =>
      tabMails.filter(
        (m) =>
          m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.sender.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [tabMails, searchTerm],
  );

  const toggleAllFetched = () => {
    setSelectedFetchedIds((prev) => {
      if (filteredMails.every((m) => prev.has(m.id))) return new Set();
      return new Set(filteredMails.map((m) => m.id));
    });
  };

  const toggleAllAnalyzed = () => {
    if (activeTab !== 'analyzed') return;
    setSelectedAnalyzedIds((prev) => {
      if (filteredMails.every((m) => prev.has(m.id))) return new Set();
      return new Set(filteredMails.map((m) => m.id));
    });
  };

  if (appLoading) {
    return <Loader message="Indexing" onComplete={() => setAppLoading(false)} />;
  }

  return (
    <div className="min-h-0 bg-background p-3 text-foreground selection:bg-accent/30 selection:text-white sm:p-8 lg:p-12">
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
          onSignOut={handleSignOut}
          onAnalyze={openAnalyzeDialog}
          analyzeDisabled={selectedFetchedIds.size === 0}
          onFetch={() => setFetchDialogOpen(true)}
          sessionUserEmail={sessionUserEmail}
        />
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <MailInboxTabs
              active={activeTab}
              fetchedCount={fetchedMails.length}
              analyzedCount={analyzedMails.length}
              onChange={setActiveTab}
            />
            <div className="flex min-w-0 items-center gap-3">
              <div className="shrink-0 rounded-lg bg-white/15 p-1 sm:p-2">
                <Image src="/orchestrator.svg" alt="Orchestrator" width={30} height={30} className="invert" priority />
              </div>
              <div className="min-w-0">
                <span className="text-sm text-white">Orchestrator</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="mt-0.5 flex w-fit cursor-pointer items-center justify-center rounded-4xl border border-border px-2 py-1 outline-none">
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <div className={`h-2 w-2 rounded-full ${statusConfig[orchestratorStatus].color} ${statusConfig[orchestratorStatus].shadow}`} />
                        {statusConfig[orchestratorStatus].animation ? (
                          <div className={`absolute inset-0 h-2 w-2 rounded-full ${statusConfig[orchestratorStatus].color} ${statusConfig[orchestratorStatus].animation} opacity-75`} />
                        ) : null}
                      </div>
                      <span className="text-xs">{orchestratorStatus}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {(['Active', 'Standby', 'Processing', 'Offline'] as const).map((s) => (
                      <div key={s} onClick={() => setOrchestratorStatus(s)} className="flex cursor-pointer items-center gap-2 px-2 py-1">
                        <div className={`h-2 w-2 rounded-full ${statusConfig[s].color}`} />
                        <span className="text-xs">{s}</span>
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="min-w-0 px-3 sm:px-4">
            <MailTable
              mails={filteredMails}
              loading={loading && activeTab === 'fetched'}
              onMailClick={setDetailMail}
              selectable
              selectedIds={activeTab === 'fetched' ? selectedFetchedIds : selectedAnalyzedIds}
              onToggleSelect={(id) =>
                activeTab === 'fetched'
                  ? setSelectedFetchedIds((p) => toggleInSet(p, id))
                  : setSelectedAnalyzedIds((p) => toggleInSet(p, id))
              }
              onToggleAll={activeTab === 'fetched' ? toggleAllFetched : toggleAllAnalyzed}
              onRowHoldSelect={(mail) =>
                activeTab === 'fetched'
                  ? setSelectedFetchedIds((p) => toggleInSet(p, mail.id))
                  : setSelectedAnalyzedIds((p) => toggleInSet(p, mail.id))
              }
            />
          </CardContent>
        </Card>
        {activeTab === 'analyzed' && analyzedMails.length > 0 ? (
          <AnalyzedMailsPriorityGraph mails={analyzedMails} onOpenDetail={setDetailMail} />
        ) : null}
      </motion.div>
      <MailSheet mail={detailMail} onClose={() => setDetailMail(null)} />
      <FetchDialog
        open={fetchDialogOpen}
        onOpenChange={setFetchDialogOpen}
        onFetchFromCloud={handleFetchFromCloud}
      />
      <AnalyzeDialog
        open={analyzeDialogOpen}
        onOpenChange={setAnalyzeDialogOpen}
        selectedCount={selectedFetchedIds.size}
        onAnalyze={handleAnalyzeSelected}
      />
    </div>
  );
}
