'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';
import { UserIcon, MailIcon, CalendarIcon, ChevronsRightIcon, CircleUserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchUserDetails } from '@/app/actions';

interface AccountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSignOut: () => void;
}

export default function AccountDialog({ open, onOpenChange, onSignOut }: AccountDialogProps) {
    const [data, setData] = useState<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [maxSwipe, setMaxSwipe] = useState(250);
    const x = useMotionValue(0);

    const bg = useTransform(x, [0, maxSwipe], ["#ffffff", "#ff3131"]);
    const iconColor = useTransform(x, [0, maxSwipe], ["#ff3131", "#ffffff"]);

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > maxSwipe * 0.8) {
            onSignOut();
        }
        x.set(0);
    };
    useEffect(() => {
        async function loadData() {
            if (open) {
                const result = await fetchUserDetails();
                if (result.ok && result.data) {
                    setData(result.data);
                }
            }
        }
        loadData();
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} className="rounded-xl border border-black/20 bg-white p-5 sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle className="text-xl tracking-tight text-black">Account</DialogTitle>
                    {data ? (
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3 text-sm text-black">
                                <UserIcon size={16} className="text-zinc-400" />
                                <span className="truncate">{data.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-black">
                                <MailIcon size={16} className="text-zinc-400" />
                                <span>{data.totalEncryptedMails} Encrypted Mails</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-black">
                                <CalendarIcon size={16} className="text-zinc-400" />
                                <span>Joined {new Date(data.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-2 animate-pulse bg-zinc-100 rounded-lg" />
                    )}
                </DialogHeader>
                <Button
                    type="button"
                    variant="light"
                    size="sm"
                    className="h-9 w-full text-xs"
                    asChild
                >
                    <Link href="/profile" onClick={() => onOpenChange(false)}>
                        <CircleUserIcon className="h-3.5 w-3.5" />
                        View profile
                    </Link>
                </Button>
                <DialogFooter className="bg-white border-t border-black/10">
                    <div
                        ref={containerRef}
                        className="relative w-full h-12 rounded-full overflow-hidden border border-black/5 shadow-inner bg-gray-100 flex items-center p-1">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-black text-sm">
                                Slide to Disconnect
                            </span>
                        </div>
                        <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 220 }}
                            dragElastic={0.1}
                            onDragEnd={handleDragEnd}
                            style={{ x, backgroundColor: bg }}
                            className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing"
                        >
                            <motion.div style={{ color: iconColor }}>
                                <ChevronsRightIcon size={18} strokeWidth={2.5} />
                            </motion.div>
                        </motion.div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}