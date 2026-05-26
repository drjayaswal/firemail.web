'use client';

import {
  Search,
  DeleteIcon,
  RefreshCw,
  User,
  DatabaseBackupIcon,
  CloudDownloadIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  analyzing: boolean;
  loading: boolean;
  onAnalyze: () => void;
  onLoadDataFromDatabase: () => void;
  analyzeDisabled?: boolean;
  onFetch: () => void;
  onAccount: () => void;
  sessionUserEmail?: string | null;
}

export default function Header({
  searchTerm,
  setSearchTerm,
  analyzing,
  loading,
  onAnalyze,
  onLoadDataFromDatabase,
  analyzeDisabled = false,
  onAccount,
  onFetch,
  sessionUserEmail,
}: HeaderProps) {
  return (
    <header className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <div className="relative w-full sm:max-w-[240px] lg:max-w-[300px]">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors focus-within:text-foreground" />
        <Input
          placeholder="Search Firebox..."
          className="w-full pl-8 pr-8 sm:h-8 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center cursor-pointer justify-center text-muted-foreground transition-colors hover:text-red-600 sm:h-6 sm:w-6"
            aria-label="Clear search"
          >
            <DeleteIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 sm:w-auto">
        <Button
          type="button"
          variant="accent"
          size="sm"
          onClick={onAnalyze}
          disabled={analyzing || analyzeDisabled}
          className="flex-1 gap-2 sm:flex-none"
          title="Analyze"
        >
          <span>Analyze</span>
        </Button>

        <Button
          type="button"
          variant="light"
          size="sm"
          onClick={onFetch}
          disabled={loading}
          title="Fetch from Gmail"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <CloudDownloadIcon className="h-4 w-4 shrink-0" />
          )}
          <span className="hidden sm:inline-block">
            {loading ? '...' : 'Fetch'}
          </span>
        </Button>

        <Button
          type="button"
          variant="light"
          size="sm"
          onClick={onLoadDataFromDatabase}
          disabled={loading}
          title="Load from database"
        >
          <DatabaseBackupIcon
            className={`h-4 w-4 shrink-0 ${loading ? 'animate-pulse' : ''}`}
          />
          <span className="hidden sm:inline-block">
            {loading ? '...' : 'Load'}
          </span>
        </Button>

        {sessionUserEmail && (
          <div className="ml-auto flex shrink-0 sm:ml-0">
            <Button
              type="button"
              variant="light"
              size="sm"
              onClick={onAccount}
              title={sessionUserEmail}
            >
              <User className="h-4 w-4 shrink-0 text-black" />
              <span className="hidden max-w-[140px] truncate sm:inline-block">
                Account
              </span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}