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

const LS = {
  sound:  'deepnook-ambient',
  muted:  'deepnook-muted',
  volume: 'deepnook-volume',
};

export function useAmbientSound(isTimerActive: boolean) {
  const [selectedSound, setSelectedSound] = useState<AmbientSound>(
    () => (localStorage.getItem(LS.sound) as AmbientSound) ?? 'none'
  );
  const [isMuted, setIsMuted] = useState(
    () => localStorage.getItem(LS.muted) === 'true'
  );
  const [volume, setVolume] = useState<number>(
    () => Number(localStorage.getItem(LS.volume) ?? '70')
  );

  // Audio refs — never trigger re-renders
  const ctxRef         = useRef<AudioContext | null>(null);
  const nodesRef       = useRef<(AudioBufferSourceNode | OscillatorNode)[]>([]);
  const masterGainRef  = useRef<GainNode | null>(null);
  const baseGainRef    = useRef<number>(0.4);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const previewTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Shadow refs — let callbacks read latest state without stale closures
  const soundRef  = useRef(selectedSound);
  const mutedRef  = useRef(isMuted);
  const volRef    = useRef(volume);
  const timerRef  = useRef(isTimerActive);

  useEffect(() => { soundRef.current  = selectedSound; }, [selectedSound]);
  useEffect(() => { mutedRef.current  = isMuted; },      [isMuted]);
  useEffect(() => { volRef.current    = volume; },        [volume]);
  useEffect(() => { timerRef.current  = isTimerActive; }, [isTimerActive]);

  // ── AudioContext (lazy, single instance) ──────────────────────────────────
  const getCtx = (): AudioContext | null => {
    try {
      if (!ctxRef.current || ctxRef.current.state === 'closed') {
        ctxRef.current = new AudioContext();
      }
      if (ctxRef.current.state === 'suspended') {
        ctxRef.current.resume().catch(() => {});
      }
      return ctxRef.current;
    } catch { return null; }
  };

  // ── Shared white-noise buffer (5 s, generated once) ───────────────────────
  const getNoise = (ctx: AudioContext): AudioBuffer => {
    if (noiseBufferRef.current) return noiseBufferRef.current;
    const n   = ctx.sampleRate * 5;
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    noiseBufferRef.current = buf;
    return buf;
  };

  // ── Stop all nodes ─────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (previewTimer.current) { clearTimeout(previewTimer.current); previewTimer.current = null; }
    nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
    nodesRef.current   = [];
    masterGainRef.current = null;
  }, []);

  // ── Start a sound ──────────────────────────────────────────────────────────
  // Uses only refs → safe to keep deps:[]
  const play = useCallback((soundId: AmbientSound) => {
    if (soundId === 'none') return;
    const ctx = getCtx();
    if (!ctx) return;

    const buf    = getNoise(ctx);
    const master = ctx.createGain();
    master.connect(ctx.destination);
    masterGainRef.current = master;

    const running: (AudioBufferSourceNode | OscillatorNode)[] = [];

    const noise = () => {
      const s = ctx.createBufferSource();
      s.buffer = buf; s.loop = true;
      running.push(s);
      return s;
    };
    const lfo = (freq: number, type: OscillatorType = 'sine') => {
      const o = ctx.createOscillator();
      o.type = type; o.frequency.value = freq;
      running.push(o);
      return o;
    };

    let base = 0.4;

    switch (soundId) {
      case 'rain': {
        const src = noise();
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';  lp.frequency.value = 1400;
        src.connect(hp); hp.connect(lp); lp.connect(master);
        src.start(); base = 0.50; break;
      }
      case 'ocean': {
        const src = noise();
        const lp  = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650;
        const wg  = ctx.createGain(); wg.gain.value = 0.5;
        const mod = lfo(0.12);
        const amp = ctx.createGain(); amp.gain.value = 0.45;
        mod.connect(amp); amp.connect(wg.gain);
        src.connect(lp); lp.connect(wg); wg.connect(master);
        mod.start(); src.start(); base = 0.55; break;
      }
      case 'forest': {
        const src = noise();
        const lp  = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 480;
        const wg  = ctx.createGain(); wg.gain.value = 0.5;
        const mod = lfo(0.055);
        const amp = ctx.createGain(); amp.gain.value = 0.38;
        mod.connect(amp); amp.connect(wg.gain);
        src.connect(lp); lp.connect(wg); wg.connect(master);
        mod.start(); src.start(); base = 0.45; break;
      }
      case 'cafe': {
        const s1  = noise();
        const lp1 = ctx.createBiquadFilter(); lp1.type = 'lowpass';  lp1.frequency.value = 500;
        const g1  = ctx.createGain(); g1.gain.value = 0.40;
        s1.connect(lp1); lp1.connect(g1); g1.connect(master); s1.start();

        const s2  = noise();
        const bp  = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 1.3;
        const g2  = ctx.createGain(); g2.gain.value = 0.20;
        s2.connect(bp); bp.connect(g2); g2.connect(master); s2.start();
        base = 0.50; break;
      }
      case 'fire': {
        const src = noise();
        const lp  = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 750;
        const cg  = ctx.createGain(); cg.gain.value = 0.55;
        const mod = lfo(4.3, 'sawtooth');
        const amp = ctx.createGain(); amp.gain.value = 0.38;
        mod.connect(amp); amp.connect(cg.gain);
        src.connect(lp); lp.connect(cg); cg.connect(master);
        mod.start(); src.start(); base = 0.45; break;
      }
      case 'white': {
        const src = noise();
        src.connect(master); src.start(); base = 0.25; break;
      }
    }

    // Direct assignment — no automation queue, no race conditions
    baseGainRef.current  = base;
    master.gain.value    = base * (volRef.current / 100);
    nodesRef.current     = running;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── React to timer state changes ───────────────────────────────────────────
  useEffect(() => {
    stop();
    if (isTimerActive && soundRef.current !== 'none' && !mutedRef.current) {
      play(soundRef.current);
    }
  }, [isTimerActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Core: cycle to a sound by direction (+1 / -1) ─────────────────────────
  const cycleSound = useCallback((dir: 1 | -1) => {
    const cur  = AMBIENT_OPTIONS.findIndex(o => o.id === soundRef.current);
    const next = (cur + dir + AMBIENT_OPTIONS.length) % AMBIENT_OPTIONS.length;
    const pick = AMBIENT_OPTIONS[next].id;

    setSelectedSound(pick);
    soundRef.current = pick;
    localStorage.setItem(LS.sound, pick);

    stop();
    if (pick === 'none' || mutedRef.current) return;

    play(pick);

    // 1.5 s preview when timer is not running
    if (!timerRef.current) {
      previewTimer.current = setTimeout(() => stop(), 1500);
    }
  }, [stop, play]);

  // ── Scroll to cycle sounds (desktop) ──────────────────────────────────────
  const handleSoundWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    cycleSound(e.deltaY > 0 ? 1 : -1);
  }, [cycleSound]);

  // ── Mute toggle ───────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setIsMuted(next);
    localStorage.setItem(LS.muted, String(next));

    if (next) {
      // Muting: silence gain but keep nodes alive
      if (masterGainRef.current) masterGainRef.current.gain.value = 0;
    } else {
      // Unmuting: restore gain if nodes exist, else restart if timer is active
      if (masterGainRef.current) {
        masterGainRef.current.gain.value = baseGainRef.current * (volRef.current / 100);
      } else if (timerRef.current && soundRef.current !== 'none') {
        play(soundRef.current);
      }
    }
  }, [play]);

  // ── Volume slider ──────────────────────────────────────────────────────────
  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
    volRef.current = v;
    localStorage.setItem(LS.volume, String(v));
    // Direct value set — no automation queue
    if (masterGainRef.current && !mutedRef.current) {
      masterGainRef.current.gain.value = baseGainRef.current * (v / 100);
    }
  }, []);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stop();
      ctxRef.current?.close().catch(() => {});
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { selectedSound, isMuted, volume, cycleSound, handleSoundWheel, toggleMute, handleVolumeChange };
}
