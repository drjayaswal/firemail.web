'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, SearchCheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';

const BAR_W = 2;
const BAR_GAP = 1;
const BAR_COUNT = 38;

type SpeechRecognitionResultEvent = {
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((ev: SpeechRecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type WindowWithSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

function WaveformTimeline({
  isListening,
  amplitudeRef,
}: {
  isListening: boolean;
  amplitudeRef: React.RefObject<number>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<number[]>([]);
  const frameRef = useRef<number>(0);
  const lastPushRef = useRef<number>(0);
  const dprRef = useRef<number>(1);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    const cssW = container.clientWidth;
    const cssH = container.clientHeight;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
  }, []);

  useEffect(() => {
    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = (ts: number) => {
      frameRef.current = requestAnimationFrame(draw);
      const W = canvas.width;
      const H = canvas.height;
      const dpr = dprRef.current;
      const bw = BAR_W * dpr;
      const gap = BAR_GAP * dpr;
      const stride = bw + gap;
      const maxBars = Math.floor(W / stride);

      if (ts - lastPushRef.current > 40) {
        lastPushRef.current = ts;
        const val = isListening ? Math.max(0.04, amplitudeRef.current) : 0;
        historyRef.current.push(val);
        if (historyRef.current.length > maxBars) historyRef.current.shift();
      }

      ctx.clearRect(0, 0, W, H);

      const history = historyRef.current;
      const centerY = H / 2;
      const minH = 3 * dpr;
      const maxH = H * 0.82;

      history.forEach((amp, i) => {
        const x = i * stride;
        const ageFactor = i / Math.max(1, history.length - 1);
        const rawH = minH + Math.pow(amp, 0.6) * (maxH - minH);
        const barH = Math.min(rawH, maxH);
        const alpha = 0.2 + ageFactor * 0.8;

        if (isListening) {
          ctx.fillStyle = `rgba(239,68,68,${alpha})`;
        } else {
          ctx.fillStyle = `rgba(156,163,175,${0.22 + ageFactor * 0.38})`;
        }

        const r = bw / 2;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barH / 2, bw, barH, r);
        ctx.fill();
      });
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isListening, amplitudeRef]);

  useEffect(() => {
    if (!isListening) historyRef.current = [];
  }, [isListening]);

  return (
    <div
      ref={containerRef}
      className="w-full h-16 sm:h-20"
    >
      <canvas ref={canvasRef} className="block mx-auto" />
    </div>
  );
}

export default function VoiceModal({
  open,
  onClose,
  onResult,
}: {
  open: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
}) {
  const [, setBars] = useState<number[]>(Array(BAR_COUNT).fill(2));
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [, setStatus] = useState<'idle' | 'listening' | 'done'>('idle');
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const amplitudeRef = useRef<number>(0);

  useBodyScrollLock(open);

  const stopAll = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    recognitionRef.current?.stop();
    setIsListening(false);
    setBars(Array(BAR_COUNT).fill(2));
    amplitudeRef.current = 0;
  }, []);

  const startListening = useCallback(async () => {
    setTranscript('');
    setStatus('listening');
    setIsListening(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const animate = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length / 255;
        amplitudeRef.current = avg;
        const newBars = Array.from({ length: BAR_COUNT }, (_, i) => {
          const idx = Math.floor((i / BAR_COUNT) * data.length);
          return Math.max(2, (data[idx] / 255) * 100);
        });
        setBars(newBars);
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    } catch {
      toast.error('Microphone access denied!');
      setStatus('idle');
      setIsListening(false);
      return;
    }

    const win = window as WindowWithSpeech;
    const SpeechRecognition = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser!');
      stopAll();
      setStatus('idle');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    recognitionRef.current = rec;

    rec.onresult = (e: SpeechRecognitionResultEvent) => {
      let final = '';
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final) setTranscript(final);
    };

    rec.onend = () => {
      stopAll();
      setStatus('done');
    };

    rec.start();
  }, [stopAll]);

  const handleStop = useCallback(() => {
    stopAll();
    setStatus(transcript ? 'done' : 'idle');
  }, [stopAll, transcript]);

  const handleUse = () => {
    if (transcript) {
      onResult(transcript);
      onClose();
    }
  };

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => {
        stopAll();
        setTranscript('');
        setStatus('idle');
      });
    }
  }, [open, stopAll]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-70 max-h-[min(60dvh,90svh)] rounded-t-[30px] border border-b-0 border-white/20 bg-background/95 pt-2 pb-6 shadow-2xl backdrop-blur-2xl sm:pt-2 sm:pb-6"
          >
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto" />
            <div className="flex flex-col items-center gap-3">
              <WaveformTimeline isListening={isListening} amplitudeRef={amplitudeRef} />

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={isListening ? handleStop : startListening}
                className={`relative flex items-center justify-center cursor-pointer w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-colors ${isListening
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'border border-white/20 hover:bg-white/20'
                  }`}
              >
                {isListening && (
                  <motion.span
                    animate={{ scale: [1, 1.35, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-red-600/30"
                  />
                )}
                <Mic className={`${isListening ? "text-white" : "text-foreground"}`} />
              </motion.button>

              <AnimatePresence>
                {transcript && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full max-w-xs sm:max-w-sm text-center"
                  >
                    <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2 px-2">
                      <span className="text-muted-foreground">&ldquo;</span>
                      {transcript}
                      <span className="text-muted-foreground">&rdquo;</span>
                    </p>
                    <Button variant="ghost" className="mt-2 mx-auto flex items-center gap-2" onClick={handleUse}>
                      <SearchCheckIcon className="w-4 h-4" />
                      Use
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
