import { useEffect, useRef, useState } from "react";
import { CircleHelp, Pause, Play, Volume2, VolumeX } from "lucide-react";
import welcomeVideo from "@/assets/welcome-mobile.mp4.asset.json";
import welcomePoster from "@/assets/welcome-poster.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// The custom domain does not serve the managed asset endpoint; use the
// verified published asset origin for both media files.
const mediaOrigin = "https://genius-saudi-learn.lovable.app";
const videoSrc = new URL(welcomeVideo.url, mediaOrigin).href;
const posterSrc = new URL(welcomePoster.url, mediaOrigin).href;

interface VideoHeaderProps {
  onGuide: () => void;
  /** Supply a real generated/recorded Arabic male welcome clip when requested. */
  welcomeAudioSrc?: string;
}

export default function VideoHeader({ onGuide, welcomeAudioSrc }: VideoHeaderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [paused, setPaused] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (preference.matches) {
        videoRef.current?.pause();
        setPaused(true);
      }
    };
    sync();
    preference.addEventListener("change", sync);
    const video = videoRef.current;
    const audio = audioRef.current;
    return () => {
      preference.removeEventListener("change", sync);
      video?.pause();
      audio?.pause();
    };
  }, []);

  const toggleVideo = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play().catch(() => setPaused(true));
    else video.pause();
  };

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) await audio.play().catch(() => setAudioPlaying(false));
    else audio.pause();
  };

  return (
    <header className="relative w-full bg-royal-blue" aria-label="منصة الطالب العبقري">
      <div className="relative mx-auto max-w-3xl">
        {failed ? <img src={posterSrc} alt="منصة الطالب العبقري" className="block aspect-video w-full object-contain" /> : <video ref={videoRef} src={videoSrc} poster={posterSrc} autoPlay loop muted playsInline preload="metadata"
          className="block aspect-video w-full object-contain" aria-label="الفيديو الترحيبي للمنصة"
          onPause={() => setPaused(true)} onPlay={() => setPaused(false)} onError={() => setFailed(true)} />}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onGuide} aria-label="دليل استكشاف المنصة"
              className="help-beacon absolute right-3 top-3 h-11 w-11 rounded-full border border-matte-gold bg-royal-blue/90 text-matte-gold hover:bg-royal-blue hover:text-matte-gold [&_svg]:size-6">
              <CircleHelp aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">دليل استكشاف المنصة</TooltipContent>
        </Tooltip>
        {!failed && <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggleVideo} aria-label={paused ? "تشغيل الفيديو" : "إيقاف الفيديو مؤقتاً"}
              className="absolute bottom-2 left-3 h-11 w-11 rounded-full bg-royal-blue/90 text-matte-gold hover:bg-royal-blue hover:text-matte-gold">
              {paused ? <Play /> : <Pause />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{paused ? "تشغيل الفيديو" : "إيقاف الفيديو مؤقتاً"}</TooltipContent>
        </Tooltip>}
        {welcomeAudioSrc && <>
          <audio ref={audioRef} src={welcomeAudioSrc} preload="none" onPlay={() => setAudioPlaying(true)} onPause={() => setAudioPlaying(false)} onEnded={() => setAudioPlaying(false)} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleAudio} aria-label={audioPlaying ? "إيقاف صوت الترحيب" : "استمع إلى الترحيب"}
                className="absolute bottom-2 right-3 h-11 w-11 rounded-full bg-royal-blue/90 text-matte-gold hover:bg-royal-blue hover:text-matte-gold">
                {audioPlaying ? <VolumeX /> : <Volume2 />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{audioPlaying ? "إيقاف صوت الترحيب" : "استمع إلى الترحيب"}</TooltipContent>
          </Tooltip>
        </>}
      </div>
    </header>
  );
}