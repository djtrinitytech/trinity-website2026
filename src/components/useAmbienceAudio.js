import { useEffect, useRef } from 'react';

/**
 * Web Audio API synthesizer generating a subtle meditative temple ambience
 * (grounding harmonic drone and soft resonant chimes). Zero external audio dependencies.
 */
export default function useAmbienceAudio(isPlaying) {
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        // Master Gain
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
        // Smoothly fade in over 2 seconds to gentle level
        masterGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 2);
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        // Harmonic Drones (108 Hz Root & 162 Hz Perfect Fifth - sacred tuning)
        const rootFreq = 108;
        const fifthFreq = 162;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const droneGain1 = ctx.createGain();
        const droneGain2 = ctx.createGain();

        // Subtle low-pass filter to give warm, deep parchment stone reverberation
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(rootFreq, ctx.currentTime);
        droneGain1.gain.setValueAtTime(0.08, ctx.currentTime);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(fifthFreq, ctx.currentTime);
        droneGain2.gain.setValueAtTime(0.04, ctx.currentTime);

        osc1.connect(droneGain1);
        osc2.connect(droneGain2);
        droneGain1.connect(filter);
        droneGain2.connect(filter);
        filter.connect(masterGain);

        osc1.start();
        osc2.start();

        // Periodic soft Tibetan singing bowl chime (every 14 seconds)
        const playChime = () => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
          const chimeCtx = audioCtxRef.current;
          const chimeOsc = chimeCtx.createOscillator();
          const chimeGain = chimeCtx.createGain();

          chimeOsc.type = 'sine';
          // Random harmonious frequency around 432Hz / 540Hz
          const frequencies = [432, 540, 648];
          const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
          chimeOsc.frequency.setValueAtTime(freq, chimeCtx.currentTime);

          chimeGain.gain.setValueAtTime(0.001, chimeCtx.currentTime);
          chimeGain.gain.exponentialRampToValueAtTime(0.05, chimeCtx.currentTime + 0.1);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeCtx.currentTime + 6);

          chimeOsc.connect(chimeGain);
          chimeGain.connect(masterGain);

          chimeOsc.start(chimeCtx.currentTime);
          chimeOsc.stop(chimeCtx.currentTime + 6);
        };

        // First chime after 1.5s
        const initialTimer = setTimeout(playChime, 1500);
        const interval = setInterval(playChime, 14000);
        intervalRef.current = interval;

        return () => {
          clearTimeout(initialTimer);
          clearInterval(interval);
          if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close().catch(() => {});
          }
        };
      } catch (err) {
        console.warn('Web Audio initialization error:', err);
      }
    } else {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        if (masterGainRef.current) {
          try {
            masterGainRef.current.gain.exponentialRampToValueAtTime(
              0.0001,
              audioCtxRef.current.currentTime + 0.8
            );
          } catch (e) {}
        }
        setTimeout(() => {
          if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close().catch(() => {});
          }
        }, 800);
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isPlaying]);
}
