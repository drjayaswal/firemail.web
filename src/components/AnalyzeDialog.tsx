'use client';

import { useState } from 'react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Wand2Icon } from 'lucide-react';

interface AnalyzeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onAnalyze: (store: boolean) => void;
}

export default function AnalyzeDialog({ open, onOpenChange, selectedCount, onAnalyze }: AnalyzeDialogProps) {
  const [store, setStore] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(store);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl border border-white/20 bg-black sm:max-w-xs">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl tracking-tight text-white">Analyze selected</DialogTitle>
            <DialogDescription className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {selectedCount} mail{selectedCount === 1 ? '' : 's'} · options derived from selection
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-center space-x-2">
              <Checkbox id="store" checked={store} onCheckedChange={(c) => setStore(c === true)} />
              <div className="flex items-center gap-1.5">
                <Label htmlFor="store" className="cursor-pointer text-sm font-medium text-gray-300">
                  Store Context
                </Label>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 cursor-help text-accent" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[250px] border-border bg-white text-[10px]">
                      <p>Persist results encrypted in the Database</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <DialogFooter className="border-white/20 bg-black">
            <Button type="button" variant="no_outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={selectedCount === 0}>
              <Wand2Icon />
              Analyze
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
