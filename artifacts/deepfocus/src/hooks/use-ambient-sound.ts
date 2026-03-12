import { useState, useEffect, useCallback, useRef } from 'react';

export type AmbientSound = 'none' | 'rain' | 'ocean' | 'forest' | 'cafe' | 'fire' | 'white';

export const AMBIENT_OPTIONS: { id: AmbientSound; label: string; emoji: string }[] = [
  { id: 'none',   label: 'None',        emoji: '🔇' },
  { id: 'rain',   label: 'Rain',        emoji: '🌧️' },
  { id: 'ocean',  label: 'Ocean',       emoji: '🌊' },
  { id: 'forest', label: 'Forest',      emoji: '🌿' },
  { id: 'cafe',   label: 'Café',        emoji: '☕' },
  { id: 'fire',   label: 'Fire',        emoji: '🔥' },
  { id: 'white',  label: 'White Noise', emoji: '⬜' },
];

type Startable = AudioBufferSourceNode | OscillatorNode | ConstantSourceNode;

export function useAmbientSound(isTimerActive: boolean) {
  const [selectedSound, setSelectedSound] = useState<AmbientSound>(
    () => (localStorage.getItem('lumino-ambient') as AmbientSound) ?? 'none'
  );
  const [isMuted, setIsMuted] = useState(
    () => localStorage.getItem('lumino-ambient-muted') === 'true'
  );
  const [volume, setVolume] = useState<number>(
    () => Number(localStorage.getItem('lumino-ambient-volume') ?? '70')
  );

  const ctxRef              = useRef<AudioContext | null>(null);
  const activeStartablesRef = useRef<Startable[]>([]);
  const masterGainRef       = useRef<GainNode | null>(null);
  const targetGainRef       = useRef<number>(0.4);
  const noiseBufferRef      = useRef<AudioBuffer | null>(null);
  const previewTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedSoundRef  = useRef(selectedSound);
  const isMutedRef        = useRef(isMuted);
  const volumeRef         = useRef(volume);
  const isTimerActiveRef  = useRef(isTimerActive);

  useEffect(() => { selectedSoundRef.current = selectedSound; }, [selectedSound]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { isTimerActiveRef.current = isTimerActive; }, [isTimerActive]);

  const effectiveGain = (target: number) =>
    isMutedRef.current ? 0 : target * (volumeRef.current / 100);

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const getNoiseBuffer = useCallback((ctx: AudioContext): AudioBuffer => {
    if (noiseBufferRef.current) return noiseBufferRef.current;
    const size   = ctx.sampleRate * 5;
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data   = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    noiseBufferRef.current = buffer;
    return buffer;
  }, []);

  const stopAll = useCallback(() => {
    if (previewTimerRef.current) { clearTimeout(previewTimerRef.current); previewTimerRef.current = null; }
    activeStartablesRef.current.forEach(n => { try { n.stop(); } catch {} });
    activeStartablesRef.current = [];
    masterGainRef.current = null;
  }, []);

  const startSound = useCallback((soundId: AmbientSound) => {
    if (soundId === 'none') return;
    const ctx    = getCtx();
    const buffer = getNoiseBuffer(ctx);

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    const starters: Startable[] = [];

    const noise = () => {
      const s = ctx.createBufferSource();
      s.buffer = buffer;
      s.loop   = true;
      starters.push(s);
      return s;
    };
    const lfo = (freq: number, type: OscillatorType = 'sine') => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      starters.push(o);
      return o;
    };

    let target = 0.4;

    switch (soundId) {
      case 'rain': {
        const src = noise();
        const hp  = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500;
        const lp  = ctx.createBiquadFilter(); lp.type = 'lowpass';  lp.frequency.value = 1400;
        src.connect(hp); hp.connect(lp); lp.connect(master);
        src.start();
        target = 0.45;
        break;
      }
      case 'ocean': {
        const src = noise();
        const lp  = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650;
        const wg  = ctx.createGain(); wg.gain.value = 0.5;
        const mod = lfo(0.12);
        const amp = ctx.createGain(); amp.gain.value = 0.44;
        mod.connect(amp); amp.connect(wg.gain);
        src.connect(lp); lp.connect(wg); wg.connect(master);
        mod.start(); src.start();
        target = 0.55;
        break;
      }
      case 'forest': {
        const src = noise();
        const lp  = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 480;
        const wg  = ctx.createGain(); wg.gain.value = 0.5;
        const mod = lfo(0.055);
        const amp = ctx.createGain(); amp.gain.value = 0.38;
        mod.connect(amp); amp.connect(wg.gain);
        src.connect(lp); lp.connect(wg); wg.connect(master);
        mod.start(); src.start();
        target = 0.4;
        break;
      }
      case 'cafe': {
        const s1  = noise();
        const lp1 = ctx.createBiquadFilter(); lp1.type = 'lowpass'; lp1.frequency.value = 500;
        const g1  = ctx.createGain(); g1.gain.value = 0.38;
        s1.connect(lp1); lp1.connect(g1); g1.connect(master);
        s1.start();

        const s2  = noise();
        const bp  = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 1.3;
        const g2  = ctx.createGain(); g2.gain.value = 0.18;
        s2.connect(bp); bp.connect(g2); g2.connect(master);
        s2.start();

        target = 0.5;
        break;
      }
      case 'fire': {
        const src = noise();
        const lp  = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 750;
        const cg  = ctx.createGain(); cg.gain.value = 0.55;
        const mod = lfo(4.3, 'sawtooth');
        const amp = ctx.createGain(); amp.gain.value = 0.38;
        mod.connect(amp); amp.connect(cg.gain);
        src.connect(lp); lp.connect(cg); cg.connect(master);
        mod.start(); src.start();
        target = 0.42;
        break;
      }
      case 'white': {
        const src = noise();
        const lp  = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 8000;
        src.connect(lp); lp.connect(master);
        src.start();
        target = 0.22;
        break;
      }
    }

    targetGainRef.current = target;
    const vol = effectiveGain(target);
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.5);
    activeStartablesRef.current = starters;
  }, [getCtx, getNoiseBuffer]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isTimerActive && selectedSound !== 'none' && !isMuted) {
      stopAll();
      startSound(selectedSound);
    } else if (!isTimerActive) {
      stopAll();
    }
  }, [isTimerActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSoundWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const cur  = AMBIENT_OPTIONS.findIndex(o => o.id === selectedSoundRef.current);
    const next = (cur + (e.deltaY > 0 ? 1 : -1) + AMBIENT_OPTIONS.length) % AMBIENT_OPTIONS.length;
    const pick = AMBIENT_OPTIONS[next].id;

    setSelectedSound(pick);
    selectedSoundRef.current = pick;
    localStorage.setItem('lumino-ambient', pick);

    stopAll();
    if (pick === 'none' || isMutedRef.current) return;

    startSound(pick);

    if (!isTimerActiveRef.current) {
      previewTimerRef.current = setTimeout(() => stopAll(), 1200);
    }
  }, [stopAll, startSound]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      isMutedRef.current = next;
      localStorage.setItem('lumino-ambient-muted', String(next));

      if (next) {
        if (masterGainRef.current && ctxRef.current) {
          masterGainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.3);
        }
      } else {
        stopAll();
        if (isTimerActiveRef.current && selectedSoundRef.current !== 'none') {
          startSound(selectedSoundRef.current);
        }
      }
      return next;
    });
  }, [stopAll, startSound]);

  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    volumeRef.current = newVol;
    localStorage.setItem('lumino-ambient-volume', String(newVol));

    if (masterGainRef.current && ctxRef.current && !isMutedRef.current) {
      const target = newVol === 0 ? 0 : targetGainRef.current * (newVol / 100);
      masterGainRef.current.gain.linearRampToValueAtTime(
        target,
        ctxRef.current.currentTime + 0.05
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAll();
      ctxRef.current?.close().catch(() => {});
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { selectedSound, isMuted, volume, handleSoundWheel, toggleMute, handleVolumeChange };
}
