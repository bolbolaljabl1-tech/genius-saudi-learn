import { useCallback, useRef } from "react";

export const useTTS = () => {
  const speakingRef = useRef(false);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    
    // Try to find Arabic voice
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith("ar"));
    if (arabicVoice) utterance.voice = arabicVoice;
    
    speakingRef.current = true;
    utterance.onend = () => { speakingRef.current = false; };
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    speakingRef.current = false;
  }, []);

  return { speak, stop, isSpeaking: speakingRef };
};
