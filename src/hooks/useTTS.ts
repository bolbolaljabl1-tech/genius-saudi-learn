import { useCallback, useRef } from "react";
import { createParser } from "eventsource-parser";
import { supabase } from "@/integrations/supabase/client";

// Streams PCM audio (24kHz, 16-bit mono) from the `tts` edge function which
// proxies Lovable AI Gateway's openai/gpt-4o-mini-tts model.
// Falls back to the browser's speechSynthesis only if the network call fails,
// so the teacher voice is used whenever the network allows.
export const useTTS = () => {
  const speakingRef = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    for (const src of scheduledSourcesRef.current) {
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
    }
    scheduledSourcesRef.current = [];
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    speakingRef.current = false;
  }, []);

  const fallbackSpeak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = 1.1;
    utterance.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith("ar"));
    if (arabicVoice) utterance.voice = arabicVoice;
    speakingRef.current = true;
    utterance.onend = () => {
      speakingRef.current = false;
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      const cleaned = text.trim();
      if (!cleaned) return;
      stop();

      const controller = new AbortController();
      abortRef.current = controller;
      speakingRef.current = true;

      try {
        // Reuse a single AudioContext across calls; some browsers cap the number.
        let ctx = ctxRef.current;
        if (!ctx || ctx.state === "closed") {
          ctx = new AudioContext({ sampleRate: 24000 });
          ctxRef.current = ctx;
        }
        if (ctx.state === "suspended") await ctx.resume().catch(() => {});

        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
        const { data: sessionData } = await supabase.auth.getSession();
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
        const bearer = sessionData?.session?.access_token ?? anonKey;
        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/tts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
            Authorization: `Bearer ${bearer}`,
          },
          body: JSON.stringify({ text: cleaned }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error(`tts_${res.status}`);

        let playhead = 0;
        let pending = new Uint8Array(0);

        const playChunk = (incoming: Uint8Array) => {
          if (!ctx) return;
          const bytes = new Uint8Array(pending.length + incoming.length);
          bytes.set(pending);
          bytes.set(incoming, pending.length);
          const usable = bytes.length - (bytes.length % 2);
          pending = bytes.slice(usable);
          if (usable === 0) return;
          const samples = new Int16Array(bytes.buffer, 0, usable / 2);
          const floats = Float32Array.from(samples, (s) => s / 32768);
          const buffer = ctx.createBuffer(1, floats.length, 24000);
          buffer.copyToChannel(floats, 0);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          if (playhead === 0) playhead = ctx.currentTime + 0.05;
          else playhead = Math.max(playhead, ctx.currentTime);
          source.start(playhead);
          playhead += buffer.duration;
          scheduledSourcesRef.current.push(source);
          source.onended = () => {
            scheduledSourcesRef.current = scheduledSourcesRef.current.filter(
              (s) => s !== source,
            );
            if (scheduledSourcesRef.current.length === 0) speakingRef.current = false;
          };
        };

        const parser = createParser({
          onEvent(event) {
            let payload: { type?: string; audio?: string };
            try {
              payload = JSON.parse(event.data);
            } catch {
              return;
            }
            if (payload.type !== "speech.audio.delta" || !payload.audio) return;
            const binary = atob(payload.audio);
            const chunk = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) chunk[i] = binary.charCodeAt(i);
            playChunk(chunk);
          },
        });

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          parser.feed(value);
        }
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        console.warn("[tts] falling back to speechSynthesis:", err);
        fallbackSpeak(cleaned);
      }
    },
    [fallbackSpeak, stop],
  );

  return { speak, stop, isSpeaking: speakingRef };
};
