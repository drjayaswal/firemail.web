'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Info, ArrowRightToLineIcon, Wand2Icon } from 'lucide-react';
import { AnalyzeOptions } from '@/types';

interface AnalyzeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalyze: (data: AnalyzeOptions) => void;
}

export default function AnalyzeDialog({
  open,
  onOpenChange,
  onAnalyze,
}: AnalyzeDialogProps) {
  const [unread, setUnread] = useState(true);
  const [store, setStore] = useState(false);
  const [days, setDays] = useState(1);
  const [count, setCount] = useState(1);

  const [important, setImportant] = useState(false);
  const [starred, setStarred] = useState(false);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    onAnalyze({ unread, days, store, count, important, starred });
    onOpenChange(false);
  };

  const infoTexts = {
    store: "If you select, your mails will be stored after analysis and thus will needed not to be analysed again. If you don't, they will not be stored and this analysis will be covert.",
    important: "emails that generally considered important.",
    starred: "emails you have manually starred.",
  };

  const CheckboxItem = ({ id, label, checked, onCheckedChange, tooltip }: any) => (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="text-sm font-medium text-gray-300 cursor-pointer">
          {label}
        </Label>
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-accent cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[280px] text-[10px] bg-white border-border">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl border border-white/20 bg-black sm:max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl tracking-tight text-white">Analyze Mails</DialogTitle>
            <DialogDescription className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Configure parameters for your email analysis
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] text-gray-400">Emails Count</Label>
                <div className="flex items-center gap-3 bg-muted/20 p-1">
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 disabled:border-transparent border-0 text-white" onClick={() => setCount(1)} disabled={count == 1}><ArrowRightToLineIcon className='rotate-180'/></Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 disabled:border-transparent rounded-4xl text-white" onClick={() => setCount(Math.max(1, count - 1))} disabled={count <= 1}><Minus className="h-3 w-3" /></Button>
                  <span className="text-sm font-medium text-white">{count}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 disabled:border-transparent rounded-4xl text-white" onClick={() => setCount(Math.min(10, count + 1))} disabled={count >= 10}><Plus className="h-3 w-3" /></Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 disabled:border-transparent border-0 text-white" onClick={() => setCount(10)} disabled={count == 10}><ArrowRightToLineIcon/></Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] text-gray-400">Lookback Days</Label>
                <div className="flex items-center gap-3 bg-muted/20 p-1">
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 disabled:border-transparent border-0 text-white" onClick={() => setDays(1)} disabled={days == 1}><ArrowRightToLineIcon className='rotate-180'/></Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 disabled:border-transparent rounded-4xl text-white" onClick={() => setDays(Math.max(1, days - 1))} disabled={days <= 1}><Minus className="h-3 w-3" /></Button>
                  <span className="text-sm font-medium text-white">{days}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 disabled:border-transparent rounded-4xl text-white" onClick={() => setDays(Math.min(7, days + 1))} disabled={days >= 7}><Plus className="h-3 w-3" /></Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 disabled:border-transparent border-0 text-white" onClick={() => setDays(7)} disabled={days == 7}><ArrowRightToLineIcon/></Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Status & Flags</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="unread" checked={unread} onCheckedChange={(c) => setUnread(c as boolean)} />
                  <Label htmlFor="unread" className="text-sm font-medium text-gray-300">Unread</Label>
                </div>
                <CheckboxItem id="important" label="Important" checked={important} onCheckedChange={(c: any) => setImportant(c)} tooltip={infoTexts.important} />
                <CheckboxItem id="starred" label="Starred" checked={starred} onCheckedChange={(c: any) => setStarred(c)} tooltip={infoTexts.starred} />
                <CheckboxItem id="store" label="Store" checked={store} onCheckedChange={(c: any) => setStore(c)} tooltip={infoTexts.store} />
              </div>
            </div>

            <div className="sm:hidden sm:border-t sm:border-border sm:pt-4">
                {store && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-2 text-[10px] text-yellow-500 bg-yellow-500/5 rounded border border-yellow-500/10 mb-2">
                    {infoTexts.store}
                  </motion.div>
                )}
                {starred && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-2 text-[10px] text-yellow-500 bg-yellow-500/5 rounded border border-yellow-500/10 mb-2">
                    {infoTexts.starred}
                  </motion.div>
                )}
                {important && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-2 text-[10px] text-yellow-500 bg-yellow-500/5 rounded border border-yellow-500/10 mb-2">
                    {infoTexts.important}
                  </motion.div>
                )}
            </div>
          </div>

          <DialogFooter className="bg-black flex items-center justify-between! border-white/20">
            <Button type="submit" variant="accent"><Wand2Icon/>Analyze</Button>
            <Button type="button" variant="no_outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}