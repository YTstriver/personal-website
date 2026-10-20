import { useCallback, useEffect, useRef, useState } from 'react';
import WakeSlider from './WakeSlider';
import './StudioMusic.css';

const MUSIC_SRC = `${import.meta.env.BASE_URL}audio/inner-light.mp3`;

export default function StudioMusic({ suspended = false }: { suspended?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [waitingForInteraction, setWaitingForInteraction] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const keyboardInput = useRef(false);
  const [volume, setVolume] = useState(35);
  const [error, setError] = useState('');

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.paused) return;
    setWaitingForInteraction(false);
    void audio.play().catch((reason: unknown) => {
      // Switching off or opening a work can cancel a pending play request.
      if (reason instanceof DOMException && reason.name === 'AbortError') return;
      if (audioRef.current !== audio) return;
      if (reason instanceof DOMException && reason.name === 'NotAllowedError') {
        setWaitingForInteraction(true);
        return;
      }
      setEnabled(false);
      setError('音乐暂时无法播放，请点击重试');
    });
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const sync = () => {
      if (!enabled || suspended || document.hidden) audioRef.current?.pause();
      else play();
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [enabled, suspended, play]);

  useEffect(() => {
    if (!enabled || !waitingForInteraction || suspended) return;
    const unlock = (event: PointerEvent | KeyboardEvent) => {
      if (!event.isTrusted || document.hidden) return;
      // The switch handles its own click so unlocking cannot immediately turn it off.
      if (event.target instanceof Element && event.target.closest('.studio-music__toggle')) return;
      play();
    };
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
    return () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    };
  }, [enabled, waitingForInteraction, suspended, play]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  useEffect(() => {
    const pointer = () => { keyboardInput.current = false; setKeyboardFocus(false); };
    const keyboard = (event: KeyboardEvent) => {
      keyboardInput.current = true;
      if (event.target instanceof Element && event.target.closest('.studio-music')) setKeyboardFocus(true);
    };
    document.addEventListener('pointerdown', pointer, true);
    document.addEventListener('keydown', keyboard, true);
    return () => {
      document.removeEventListener('pointerdown', pointer, true);
      document.removeEventListener('keydown', keyboard, true);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setError('');
    if (enabled && !waitingForInteraction) {
      setEnabled(false);
      audio.pause();
    } else {
      if (audio.error) audio.load();
      audio.volume = volume / 100;
      setEnabled(true);
      if (!suspended && !document.hidden) play();
    }
  };

  return (
    <div className="studio-music" role="group" aria-label="背景音乐控制" data-playing={playing}
      data-enabled={enabled} data-waiting={waitingForInteraction} data-dragging={dragging} data-keyboard-focus={keyboardFocus}
      onFocusCapture={() => setKeyboardFocus(keyboardInput.current)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardFocus(false); }}
      onPointerDownCapture={event => {
        if (event.button === 0 && event.target instanceof Element && event.target.closest('.wake-slider')) setDragging(true);
      }}
      onPointerUpCapture={() => setDragging(false)} onPointerCancelCapture={() => setDragging(false)}
      onLostPointerCapture={() => setDragging(false)}>
      <audio ref={audioRef} id="studio-bgm" src={MUSIC_SRC} preload="none" loop playsInline aria-hidden="true"
        onPlaying={() => { setPlaying(true); setWaitingForInteraction(false); }} onPause={() => setPlaying(false)}
        onError={() => { setEnabled(false); setError('音乐加载失败，请点击重试'); }} />
      <button type="button" className="studio-music__toggle" onClick={toggle}
        aria-label={enabled && !waitingForInteraction ? '关闭背景音乐' : '开启背景音乐'} aria-pressed={enabled && !waitingForInteraction}
        title={`${enabled && !waitingForInteraction ? '关闭' : '开启'}背景音乐 · Inner Light`}>
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 5 6 9H3v6h3l5 4z" />
          {enabled && !waitingForInteraction && volume > 0 ? <><path d="M15 8a6 6 0 0 1 0 8" /><path d="M18 5a10 10 0 0 1 0 14" /></> : <><path d="m16 9 5 6" /><path d="m21 9-5 6" /></>}
        </svg>
      </button>
      <div className="studio-music__controls">
        <WakeSlider value={volume} onChange={setVolume} className="studio-music__slider" />
        <span className="studio-music__volume" aria-hidden="true">{volume}%</span>
      </div>
      <span className={error ? 'studio-music__error' : 'studio-sr-only'} role="status">
        {error || (enabled ? suspended ? '播放作品时背景音乐已暂停' : waitingForInteraction ? '首次点击页面或按键后开始播放背景音乐' : '背景音乐已开启' : '背景音乐已关闭')}
      </span>
    </div>
  );
}
