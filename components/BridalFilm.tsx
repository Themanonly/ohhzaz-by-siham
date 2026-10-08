'use client';

import {useRef, useEffect, useState} from 'react';
import {Play, Pause, Maximize, RotateCcw, Volume2, VolumeX} from 'lucide-react';

const stamp = (n: number) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;

export default function BridalFilm({locale}: {locale: 'fr' | 'ar'}) {
  const ar = locale === 'ar';
  const ref = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(33.14);
  const [enhanced, setEnhanced] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setEnhanced(true);
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) el.pause();
    });
    observer.observe(el);
    const pause = () => { if (document.hidden) el.pause(); };
    document.addEventListener('visibilitychange', pause);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', pause);
    };
  }, []);

  const toggle = async () => {
    const el = ref.current;
    if (!el) return;
    if (!el.paused) { el.pause(); return; }
    try {
      if (el.ended) el.currentTime = 0;
      await el.play();
      setStarted(true);
      setEnded(false);
      setError('');
    } catch {
      setError(ar ? 'تعذّر التشغيل. حاولي مرة أخرى.' : 'Lecture indisponible. Réessayez.');
    }
  };

  const toggleSound = () => {
    const el = ref.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  const fullscreen = async () => {
    try {
      if (document.fullscreenElement === frame.current) {
        await document.exitFullscreen();
      } else if (frame.current?.requestFullscreen) {
        await frame.current.requestFullscreen();
      } else {
        const el = ref.current as HTMLVideoElement & {webkitEnterFullscreen?: () => void};
        if (el?.webkitEnterFullscreen) el.webkitEnterFullscreen();
        else throw new Error('Fullscreen unavailable');
      }
    } catch {
      setError(ar ? 'العرض الكامل غير متاح في هذا المتصفح.' : 'Le plein écran n’est pas disponible dans ce navigateur.');
    }
  };

  const soundLabel = muted ? (ar ? 'تفعيل الصوت' : 'Activer le son') : (ar ? 'كتم الصوت' : 'Couper le son');

  return (
    <div className={`bridal-film-frame ${playing ? 'is-playing' : ''}`} ref={frame}>
      <div className="bridal-screen">
        <video
          ref={ref}
          controls={!enhanced}
          playsInline
          muted={muted}
          preload="none"
          poster="/media/bridal-film-poster.webp"
          width="576"
          height="1024"
          onPlay={() => { setPlaying(true); setStarted(true); setEnded(false); }}
          onPause={() => setPlaying(false)}
          onEnded={() => { setEnded(true); setPlaying(false); }}
          onTimeUpdate={event => setElapsed(event.currentTarget.currentTime)}
          onVolumeChange={event => setMuted(event.currentTarget.muted)}
          onLoadedMetadata={event => {
            if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration);
          }}
          onError={() => setError(ar ? 'تعذّر تحميل الفيلم.' : 'Le film n’a pas pu être chargé.')}
          aria-label={ar ? 'فيلم تحضير العروس في الصالون' : 'Film de préparation mariée au salon'}
        >
          <source src="/media/bridal-film.mp4" type="video/mp4" />
        </video>
        {enhanced && (!started || ended) && (
          <button type="button" className="bridal-play-cover" onClick={toggle} aria-label={ar ? 'شغّلي فيلم العروس' : 'Lire le film mariée'}>
            <span className="bridal-play-ring">{ended ? <RotateCcw size={28} /> : <Play size={29} fill="currentColor" />}</span>
            <span className="bridal-cover-caption">
              <small>OHH ZAZ · SIHAM</small>
              <strong>{ar ? 'من أول لمسة، إلى لحظة نعم.' : 'Des premiers gestes au grand oui.'}</strong>
              <span>{ar ? 'شغّلي الفيلم · ٣٣ ثانية' : 'LIRE LE FILM · 33 SECONDES'}</span>
            </span>
          </button>
        )}
      </div>
      {enhanced && (
        <div className="bridal-player-controls bridal-player-audio">
          <input
            className="bridal-film-seek"
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={elapsed}
            aria-label={ar ? 'موضع تشغيل الفيلم' : 'Position dans le film'}
            aria-valuetext={`${stamp(elapsed)} / ${stamp(duration)}`}
            onChange={event => {
              const el = ref.current;
              if (el && el.readyState > 0) {
                el.currentTime = Number(event.target.value);
                setElapsed(el.currentTime);
              }
            }}
          />
          <button type="button" onClick={toggle} aria-label={playing ? (ar ? 'إيقاف مؤقت' : 'Mettre le film en pause') : (ar ? 'تشغيل' : 'Lire le film')}>
            {playing ? <Pause size={19} /> : <Play size={19} />}
          </button>
          <span className="bridal-time-pair"><bdi className="film-time">{stamp(elapsed)}</bdi><span aria-hidden="true">/</span><bdi className="film-time">{stamp(duration)}</bdi></span>
          <button type="button" className="bridal-sound-toggle" onClick={toggleSound} aria-label={soundLabel} title={soundLabel} data-muted={muted}>
            {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
          </button>
          <button type="button" aria-label={ar ? 'عرض كامل الشاشة' : 'Afficher le film en plein écran'} onClick={fullscreen}><Maximize size={18} /></button>
        </div>
      )}
      <p className="bridal-film-caption">{ar ? 'من التحضير إلى الإطلالة' : 'De la préparation à l’allure'}</p>
      {error && <p role="status">{error}</p>}
    </div>
  );
}
