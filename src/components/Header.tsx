'use client';

import Image from 'next/image';
import { Search, DeleteIcon, CircleDotDashedIcon, RefreshCw, Mic, User, LogOut, ShellIcon, CloudIcon, CloudUploadIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'next-auth/react';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  loading: boolean;
  syncing: boolean;
  onAnalyze: () => void;
  onVoice: () => void;
  onFetch: () => void;
  onSyncCloud: () => void;
  sessionUserEmail?: string | null;
}

export default function Header({
  searchTerm,
  setSearchTerm,
  loading,
  syncing,
  onAnalyze,
  onVoice,
  onFetch,
  onSyncCloud,
  sessionUserEmail,
}: HeaderProps) {
  return (
    <div className="flex min-w-0 max-w-full flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
      <div className="shrink-0">
        <Image
          src="/text-logo.png"
          alt="Logo"
          width={160}
          height={50}
          className="h-auto max-w-[min(100%,200px)] object-contain sm:max-w-none"
          priority
        />
      </div>

      <div className="flex w-full min-w-0 flex-col items-stretch gap-4 sm:flex-row sm:items-center lg:w-auto">
        <div className="group relative w-full min-w-0 sm:max-w-xs sm:flex-1 lg:w-64 lg:flex-none">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
          <Input
            placeholder="Search inbox..."
            className="pl-9 pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 flex h-11 min-h-11 min-w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:text-red-600"
              aria-label="Clear search"
            >
              <DeleteIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex w-full min-w-0 flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-end">
          <Button
            type="button"
            variant="accent"
            onClick={onAnalyze}
            disabled={true}
            className="shrink-0"
          >
            {loading ? <ShellIcon className="animate-spin" /> : <CircleDotDashedIcon />}
            <span className="hidden sm:inline">Analyze</span>
          </Button>

          <Button type="button" variant="ghost" onClick={onVoice} className="shrink-0">
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Sound</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onSyncCloud}
            disabled={syncing || loading}
            className="shrink-0"
          >
            {syncing ? <CloudIcon className="h-4 w-4 animate-pulse" /> : <CloudUploadIcon className="h-4 w-4" />}
            <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Sync'}</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onFetch}
            disabled={loading}
            className="shrink-0"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="hidden sm:inline">{loading ? 'Fetching...' : 'Fetch'}</span>
          </Button>

          {sessionUserEmail && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost"
                  className="shrink-0">
                  Account
                  <User className="h-4 w-4 fill-muted-foreground text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[min(100vw-2rem,180px)] border border-white/10 bg-background/95 backdrop-blur-xl">
                <p className="truncate px-2 py-1 text-[14px] text-white">{sessionUserEmail}</p>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                  <LogOut className="mr-2 h-3.5 w-3.5 group-hover:text-red-600" /> Close Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
