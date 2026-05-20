'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { fetchMailsAction, analyzeMailsAction, syncEncryptedMailsToDb, loadMailsFromDatabaseAction } from '@/app/actions';
import { FetchOptions, LoadOptions, Mail } from '@/types';
import { signOut } from 'next-auth/react';
import { buildAnalyzePayload, mergeAnalyzedMails } from '@/lib/analyze-payload';
import { deriveAnalyzeOptionsFromMails } from '@/lib/derive-analyze-options';
import Header from './Header';
import MailTable from './MailTable';
import MailSheet from './MailSheet';
import MailInboxTabs, { type MailInboxTab } from './MailInboxTabs';
import FetchDialog from './FetchDialog';
import AnalyzeDialog from './AnalyzeDialog';
import AnalyzedMailsPriorityGraph from './AnalyzedMailsPriorityGraph';
import { apiRequest } from '@/lib/api';
import { toast } from '@/lib/toast';
import Loader from './Loader';
import LoadDialog from './LoadDialog';

type SystemStatus = 'Active' | 'Standby' | 'Processing' | 'Offline';

export function toggleInSet(prev: Set<string>, id: string): Set<string> {
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
  const [selectedEncryptedIds, setSelectedEncryptedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetchDialogOpen, setFetchDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [analyzeDialogOpen, setAnalyzeDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailMail, setDetailMail] = useState<Mail | null>(null);
  const [encryptedMails, setEncryptedMails] = useState<Mail[]>([]);
  const [orchestratorStatus, setOrchestratorStatus] = useState<SystemStatus>('Offline');

  const handleFetchFromCloud = (opts: FetchOptions) => {
    void (async () => {
      setLoading(true);
      try {
        const result = await fetchMailsAction(opts);
        if (!result.ok || !result.mails) {
          toast.error(result.error ?? 'Fetch failed');
          return;
        }
        setFetchedMails(result.mails);
        setActiveTab('fetched');
        toast.success(`${result.mails.length > 0 ? result.mails.length : 'No'} Messages Fetched`);
      } finally {
        setLoading(false);
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
  const handleLoadFromDatabase = (opts: LoadOptions) => {
    void (async () => {
      setLoading(true);
      try {
        const result = await loadMailsFromDatabaseAction(opts);
        if (!result.ok || !result.mails) {
          toast.error(result.error ?? 'Load failed');
          return;
        }
        setEncryptedMails(result.mails);
        setActiveTab('encrypted');
        toast.success(`${result.mails.length > 0 ? result.mails.length : 'No'} Messages Loaded`);
      } finally {
        setLoading(false);
      }
    })();
  }
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

  const tabMails = useMemo(() => {
    if (activeTab === 'fetched') return fetchedMails;
    if (activeTab === 'encrypted') return encryptedMails;
    return analyzedMails;
  }, [activeTab, fetchedMails, encryptedMails, analyzedMails]);

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
  const toggleAllEncrypted = () => {
    setSelectedEncryptedIds((prev) => {
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
    <div className="min-h-0 p-3 sm:p-8 lg:p-12">
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
          onLoadDataFromDatabase={() => setLoadDialogOpen(true)}
          sessionUserEmail={sessionUserEmail}
        />
        <Card className="min-w-0 bg-white border-black/20 m-0! overflow-hidden">
          <CardHeader className="flex min-w-0 flex-col gap-4 border-black/20 sm:flex-row sm:items-center sm:justify-between">
            <MailInboxTabs
              active={activeTab}
              currentStatus={orchestratorStatus}
              fetchedCount={fetchedMails.length}
              analyzedCount={analyzedMails.length}
              encryptedCount={encryptedMails.length}
              onChange={setActiveTab}
            />
          </CardHeader>
          <CardContent className="min-w-0 border-black/20 px-3 sm:px-4">
            <MailTable
              mails={filteredMails}
              loading={loading && (activeTab === 'fetched' || activeTab === 'encrypted')}
              onMailClick={setDetailMail}
              selectable
              selectedIds={activeTab === 'fetched' ? selectedFetchedIds : activeTab === 'encrypted' ? selectedEncryptedIds : selectedAnalyzedIds}
              onToggleSelect={(id) =>
                activeTab === 'fetched'
                  ? setSelectedFetchedIds((p) => toggleInSet(p, id))
                  : activeTab === 'encrypted'
                    ? setSelectedEncryptedIds((p) => toggleInSet(p, id))
                    : setSelectedAnalyzedIds((p) => toggleInSet(p, id))
              }
              onToggleAll={activeTab === 'fetched' ? toggleAllFetched : activeTab === 'encrypted' ? toggleAllEncrypted : toggleAllAnalyzed}
              onRowHoldSelect={(mail) =>
                activeTab === 'fetched'
                  ? setSelectedFetchedIds((p) => toggleInSet(p, mail.id))
                  : activeTab === 'encrypted'
                    ? setSelectedEncryptedIds((p) => toggleInSet(p, mail.id))
                    : setSelectedAnalyzedIds((p) => toggleInSet(p, mail.id))
              }
            />
          </CardContent>
        </Card>
        {activeTab === 'encrypted' && encryptedMails.length > 0 ? (
          <AnalyzedMailsPriorityGraph mails={encryptedMails} onOpenDetail={setDetailMail} />
        ) : null}
      </motion.div>
      <MailSheet mail={detailMail} onClose={() => setDetailMail(null)} />
      <FetchDialog
        open={fetchDialogOpen}
        onOpenChange={setFetchDialogOpen}
        onFetchFromCloud={handleFetchFromCloud}
      />
      <LoadDialog
        sessionUserId={sessionUserId}
        open={loadDialogOpen}
        onOpenChange={setLoadDialogOpen}
        onLoadFromDatabase={handleLoadFromDatabase}
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
