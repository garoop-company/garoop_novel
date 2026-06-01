'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultLocale, isLocale, localeMeta, type Locale } from '@/locales';
import { localizePath } from '@/lib/locale-path';
import {
  SPRITE_FRAMES,
  type DramaSeries,
  type DramaCharacter,
  type DramaLine,
  type DramaPose,
} from '@/lib/dramas';

type Props = {
  drama: DramaSeries;
  lang: Locale;
  initialEp: number;
};

/* ──────────────────────────────────────────────────────────
   Hatch Pet スプライト・アニメーション
   public/dramas/<sprite>/<pose>.png（192×208 セルの横ストリップ）を
   JS でフレーム送りして再生する。
   ────────────────────────────────────────────────────────── */
const POSE_FPS: Record<DramaPose, number> = {
  idle: 6,
  jumping: 11,
  waving: 6,
  'running-right': 12,
  'running-left': 12,
  failed: 5,
};

function SpritePet({
  sprite,
  pose,
  size = 168,
}: {
  sprite: string;
  pose: DramaPose;
  size?: number;
}) {
  const frames = SPRITE_FRAMES[pose] ?? 1;
  const [frame, setFrame] = useState(0);
  const cellW = (size * 192) / 208;

  useEffect(() => {
    setFrame(0);
    const fps = POSE_FPS[pose] ?? 6;
    const id = setInterval(() => setFrame((f) => (f + 1) % frames), 1000 / fps);
    return () => clearInterval(id);
  }, [pose, frames]);

  return (
    <div
      aria-hidden
      style={{
        width: cellW,
        height: size,
        backgroundImage: `url(/images/dramas/${sprite}/${pose}.png)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${cellW * frames}px ${size}px`,
        backgroundPosition: `${-frame * cellW}px 0px`,
        imageRendering: 'auto',
        filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.45))',
      }}
    />
  );
}

/* ── Beats: 1エピソードをシーン見出し＋セリフの連なりに平坦化 ── */
type Beat = {
  sceneIndex: number;
  sceneId: string;
  heading: string;
  kind: 'heading' | 'line';
  line?: DramaLine;
};

function langToBcp47(lang: string): string {
  if (isLocale(lang)) return localeMeta[lang as Locale].i18nTag;
  return 'ja-JP';
}

/* キャラごとに声色（ピッチ）を変えて“ドラマ”らしく読む */
const VOICE_PITCH: Record<string, number> = {
  garu: 1.45,
  nana: 1.15,
  swan: 1.3,
  owl: 1.0,
  penguin: 1.25,
  wolf: 0.7,
  bear: 0.55,
  hawk: 0.8,
  smuggler: 0.95,
  broker: 1.05,
};

export default function DramaPlayer({ drama, lang, initialEp }: Props) {
  const routeLocale = isLocale(lang) ? lang : defaultLocale;
  const charMap = useMemo(() => {
    const m: Record<string, DramaCharacter> = {};
    for (const c of drama.characters) m[c.id] = c;
    return m;
  }, [drama]);

  const [epIndex, setEpIndex] = useState(
    Math.min(Math.max(initialEp - 1, 0), drama.episodes.length - 1)
  );
  const episode = drama.episodes[epIndex];

  // エピソードを beats に平坦化
  const beats = useMemo<Beat[]>(() => {
    const out: Beat[] = [];
    episode.scenes.forEach((sc, si) => {
      out.push({ sceneIndex: si, sceneId: sc.id, heading: sc.heading, kind: 'heading' });
      sc.lines.forEach((ln) => {
        out.push({ sceneIndex: si, sceneId: sc.id, heading: sc.heading, kind: 'line', line: ln });
      });
    });
    return out;
  }, [episode]);

  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ttsOn, setTtsOn] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showCast, setShowCast] = useState(false);

  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!ttsSupported) return;
    const populate = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
    populate();
    window.speechSynthesis.addEventListener('voiceschanged', populate);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', populate);
  }, [ttsSupported]);

  // エピソード変更時はリセット
  useEffect(() => {
    setCursor(0);
    setPlaying(false);
    if (ttsSupported) window.speechSynthesis.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epIndex]);

  const beat = beats[cursor];
  const isLastBeat = cursor >= beats.length - 1;

  // 現在の話者
  const speaker: DramaCharacter | null =
    beat?.kind === 'line' && beat.line?.type === 'dialogue' && beat.line.char
      ? charMap[beat.line.char] ?? null
      : null;

  // ガルちゃんのポーズ（彼女が主役なので常にステージに居る）
  const garuPose: DramaPose = useMemo(() => {
    if (!beat) return 'idle';
    const ln = beat.line;
    if (ln?.type === 'dialogue' && ln.char === 'garu') return ln.pose ?? 'idle';
    if (ln?.type === 'action' && ln.actor === 'garu') return ln.pose ?? 'idle';
    return 'idle';
  }, [beat]);

  const speak = useCallback(
    (text: string, charId: string | undefined, onDone: () => void) => {
      if (!ttsSupported) {
        onDone();
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = langToBcp47(lang);
      utter.pitch = (charId && VOICE_PITCH[charId]) || 1;
      utter.rate = 1.02;
      utter.volume = 1;
      const prefix = utter.lang.split('-')[0];
      const v =
        voicesRef.current.find((x) => x.lang === utter.lang) ??
        voicesRef.current.find((x) => x.lang.startsWith(prefix));
      if (v) utter.voice = v;
      utter.onend = onDone;
      utter.onerror = onDone;
      window.speechSynthesis.speak(utter);
    },
    [lang, ttsSupported]
  );

  // 自動再生エンジン
  useEffect(() => {
    if (!playing || !beat) return;
    if (isLastBeat) {
      setPlaying(false);
      return;
    }
    let cancelled = false;
    const advance = () => { if (!cancelled) setCursor((c) => Math.min(c + 1, beats.length - 1)); };

    const text = beat.kind === 'line' ? beat.line?.text ?? '' : '';
    const speakable = beat.kind === 'line' && !!text;

    if (ttsOn && speakable) {
      const fallback = setTimeout(advance, (text.length * 130) / speed + 2500);
      speak(text, beat.line?.char, () => { clearTimeout(fallback); advance(); });
      return () => {
        cancelled = true;
        clearTimeout(fallback);
        if (ttsSupported) window.speechSynthesis.cancel();
      };
    }

    // タイマー方式
    let ms: number;
    if (beat.kind === 'heading') ms = 1500;
    else if (beat.line?.type === 'action') ms = Math.min(Math.max(text.length * 55, 2000), 7000);
    else ms = Math.min(Math.max(text.length * 72, 1700), 8000);
    const t = setTimeout(advance, ms / speed);
    return () => { cancelled = true; clearTimeout(t); };
  }, [playing, cursor, ttsOn, speed, beat, isLastBeat, beats.length, speak, ttsSupported]);

  // タイプライター演出
  const fullText = beat?.kind === 'line' ? beat.line?.text ?? '' : '';
  const [typed, setTyped] = useState('');
  useEffect(() => {
    if (!fullText) { setTyped(''); return; }
    setTyped('');
    let i = 0;
    const step = Math.max(12, Math.min(38, 900 / fullText.length));
    const id = setInterval(() => {
      i += 1;
      setTyped(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(id);
    }, step);
    return () => clearInterval(id);
  }, [fullText, cursor]);

  const goPrev = useCallback(() => {
    if (ttsSupported) window.speechSynthesis.cancel();
    setCursor((c) => Math.max(0, c - 1));
  }, [ttsSupported]);
  const goNext = useCallback(() => {
    if (ttsSupported) window.speechSynthesis.cancel();
    setCursor((c) => Math.min(beats.length - 1, c + 1));
  }, [beats.length, ttsSupported]);
  const togglePlay = useCallback(() => {
    if (isLastBeat && !playing) setCursor(0);
    setPlaying((p) => !p);
  }, [isLastBeat, playing]);

  useEffect(() => () => { if (ttsSupported) window.speechSynthesis.cancel(); }, [ttsSupported]);

  // 擬似タイムコード
  const progress = beats.length > 1 ? cursor / (beats.length - 1) : 0;
  const elapsedMin = Math.round(progress * episode.runtime);
  const timecode = `${String(elapsedMin).padStart(2, '0')}:00 / ${episode.runtime}:00`;

  // 当エピソードの登場キャラ（台本に出てくる順）
  const epCharIds = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    episode.scenes.forEach((sc) =>
      sc.lines.forEach((ln) => {
        if (ln.char && !seen.has(ln.char)) { seen.add(ln.char); order.push(ln.char); }
      })
    );
    if (!seen.has('garu')) order.unshift('garu');
    return order;
  }, [episode]);

  return (
    <main className="relative min-h-screen text-amber-50">
      {/* Backdrop */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              `radial-gradient(1000px 600px at 50% -5%, ${drama.accent}22, transparent 65%), linear-gradient(180deg, #07060a 0%, #0c0a12 55%, #07060a 100%)`,
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-28">
        {/* Breadcrumb / title */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link
            href={localizePath('/dramas', routeLocale)}
            className="text-amber-200/70 hover:text-amber-200 text-sm font-serif inline-flex items-center gap-1"
          >
            ← 劇場へ
          </Link>
          <span className="text-amber-200/60 text-[11px] tracking-[0.25em] uppercase font-serif">
            {drama.genre}
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl text-amber-50 leading-snug">
          {drama.seriesTitle}
        </h1>
        <p className="mt-1 font-serif italic text-amber-200/75 text-sm">「{drama.tagline}」</p>

        {/* Episode tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {drama.episodes.map((ep, i) => {
            const active = i === epIndex;
            return (
              <button
                key={ep.number}
                onClick={() => setEpIndex(i)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl border text-sm font-serif transition ${
                  active
                    ? 'text-stone-900 border-transparent shadow'
                    : 'text-amber-50/75 border-amber-200/15 bg-stone-900/40 hover:bg-stone-900/70'
                }`}
                style={active ? { background: drama.accent } : undefined}
              >
                第{ep.number}話
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          <p className="font-serif text-amber-50 text-lg">
            第{episode.number}話「{episode.title}」
            <span className="ml-2 text-amber-200/60 text-xs tracking-widest">{episode.subtitle}</span>
          </p>
          <p className="mt-1 font-serif text-amber-50/65 text-[13px] leading-relaxed">
            {episode.synopsis}
          </p>
        </div>

        {/* ── STAGE ── */}
        <div
          className="mt-6 relative rounded-3xl overflow-hidden"
          style={{
            background:
              'radial-gradient(120% 80% at 50% 0%, rgba(255,240,210,0.08), transparent 60%), linear-gradient(180deg, #120f1a 0%, #0a0810 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(217,180,120,0.16), 0 30px 60px -25px rgba(0,0,0,0.7)',
          }}
        >
          {/* Scene heading bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-amber-200/10 bg-black/25">
            <AnimatePresence mode="wait">
              <motion.span
                key={`hd-${beat?.sceneId}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="font-mono text-[11px] sm:text-xs text-amber-200/80 tracking-wide truncate"
              >
                ◉ {beat?.heading}
              </motion.span>
            </AnimatePresence>
            <span className="font-mono text-[10px] text-amber-200/50 flex-shrink-0 ml-3">
              {timecode}
            </span>
          </div>

          {/* Stage floor */}
          <div
            className="relative min-h-[360px] sm:min-h-[420px] flex flex-col items-center justify-end px-4 sm:px-8 pt-8 pb-6 cursor-pointer"
            onClick={() => { if (!playing) goNext(); }}
            role="button"
            aria-label="次へ"
          >
            {/* spotlight */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-2/3"
              style={{
                background: `radial-gradient(60% 90% at 50% 0%, ${
                  speaker ? speaker.color + '26' : drama.accent + '1f'
                }, transparent 70%)`,
              }}
            />

            {/* 中央：話者 or ナレーション */}
            <div className="relative z-10 flex-1 w-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                {beat?.kind === 'heading' ? (
                  <motion.div
                    key={`scene-${beat.sceneId}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <p className="font-mono text-amber-200/60 text-xs tracking-[0.3em] uppercase">
                      Scene {beat.sceneIndex + 1}
                    </p>
                    <p className="mt-3 font-serif text-xl sm:text-2xl text-amber-50/90 max-w-md leading-relaxed">
                      {beat.heading}
                    </p>
                  </motion.div>
                ) : speaker ? (
                  // セリフ：話者を大きく
                  <motion.div
                    key={`spk-${cursor}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    {speaker.id === 'garu' && speaker.sprite ? (
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
                        <SpritePet sprite={speaker.sprite} pose={garuPose} size={172} />
                      </motion.div>
                    ) : (
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                        className="grid place-items-center rounded-full"
                        style={{
                          width: 132,
                          height: 132,
                          fontSize: 82,
                          background: `radial-gradient(circle at 50% 35%, ${speaker.color}33, ${speaker.color}10 70%)`,
                          boxShadow: `0 0 0 2px ${speaker.color}55, 0 18px 30px -12px ${speaker.color}66`,
                        }}
                      >
                        <span aria-hidden>{speaker.emoji}</span>
                      </motion.div>
                    )}
                    <span
                      className="mt-3 px-3 py-1 rounded-full text-xs font-serif tracking-wider"
                      style={{ background: `${speaker.color}22`, color: '#f5e9c8', border: `1px solid ${speaker.color}55` }}
                    >
                      {speaker.emoji} {speaker.name}
                    </span>
                  </motion.div>
                ) : (
                  // ト書き（ナレーション）
                  <motion.div
                    key={`act-${cursor}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center"
                  >
                    {beat?.line?.actor === 'garu' ? (
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <SpritePet sprite="garuchan" pose={garuPose} size={150} />
                      </motion.div>
                    ) : (
                      <span className="text-4xl opacity-70">🎬</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 字幕（セリフ／ト書き本文） */}
            <div className="relative z-10 w-full max-w-2xl min-h-[92px] mt-2">
              {beat?.kind === 'line' && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`sub-${cursor}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {beat.line?.type === 'dialogue' ? (
                      <div
                        className="relative rounded-2xl px-5 py-4"
                        style={{
                          background: 'linear-gradient(180deg, rgba(245,238,220,0.98), rgba(238,228,200,0.96))',
                          boxShadow: `0 14px 30px -14px rgba(0,0,0,0.6), inset 0 0 0 1px ${speaker?.color ?? '#caa'}55`,
                        }}
                      >
                        <span
                          className="absolute -top-2 left-7 w-3 h-3 rotate-45"
                          style={{ background: 'rgba(245,238,220,0.98)' }}
                        />
                        <p className="font-serif text-[15px] sm:text-[17px] leading-[1.9] text-stone-800">
                          {beat.line.paren && (
                            <span className="text-stone-500 text-[13px]">（{beat.line.paren}）</span>
                          )}
                          {beat.line.paren ? ' ' : ''}
                          {typed}
                          <span className="inline-block w-[2px] h-[1.1em] align-middle bg-stone-500 ml-0.5 animate-pulse" />
                        </p>
                      </div>
                    ) : (
                      <p className="text-center font-serif italic text-amber-100/85 text-[14px] sm:text-[15px] leading-loose px-2">
                        {typed}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Cast bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-3 border-t border-amber-200/10 bg-black/25">
            {epCharIds.map((cid) => {
              const c = charMap[cid];
              if (!c) return null;
              const active = speaker?.id === cid || (beat?.line?.actor === cid);
              return (
                <span
                  key={cid}
                  title={`${c.name}（${c.role}）`}
                  className="flex-shrink-0 grid place-items-center rounded-full transition-all"
                  style={{
                    width: 34,
                    height: 34,
                    fontSize: 20,
                    background: active ? `${c.color}33` : 'rgba(255,255,255,0.04)',
                    boxShadow: active ? `0 0 0 2px ${c.color}` : '0 0 0 1px rgba(255,255,255,0.08)',
                    opacity: active ? 1 : 0.55,
                    transform: active ? 'scale(1.12)' : 'scale(1)',
                  }}
                >
                  {c.emoji}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── CONTROLS ── */}
        <div className="mt-4">
          {/* progress */}
          <div
            className="h-1.5 rounded-full bg-white/10 overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const p = (e.clientX - rect.left) / rect.width;
              if (ttsSupported) window.speechSynthesis.cancel();
              setCursor(Math.round(p * (beats.length - 1)));
            }}
          >
            <div className="h-full rounded-full" style={{ width: `${progress * 100}%`, background: drama.accent }} />
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={goPrev}
              disabled={cursor === 0}
              className="w-11 h-11 rounded-full grid place-items-center bg-stone-900/60 border border-amber-200/15 text-amber-100 hover:bg-stone-900/90 disabled:opacity-30"
              aria-label="戻る"
            >
              ◀
            </button>
            <button
              onClick={togglePlay}
              className="px-6 h-12 rounded-full grid place-items-center font-serif font-bold text-stone-900 shadow-lg"
              style={{ background: drama.accent }}
            >
              {playing ? '⏸ 一時停止' : isLastBeat ? '↺ 最初から再生' : '▶ 再生'}
            </button>
            <button
              onClick={goNext}
              disabled={isLastBeat}
              className="w-11 h-11 rounded-full grid place-items-center bg-stone-900/60 border border-amber-200/15 text-amber-100 hover:bg-stone-900/90 disabled:opacity-30"
              aria-label="進む"
            >
              ▶
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs">
            {ttsSupported && (
              <button
                onClick={() => setTtsOn((v) => !v)}
                className={`px-3.5 py-1.5 rounded-full font-serif border transition ${
                  ttsOn
                    ? 'bg-amber-300 text-stone-900 border-amber-200'
                    : 'bg-stone-900/50 text-amber-100/80 border-amber-200/15 hover:bg-stone-900/80'
                }`}
              >
                🔊 声で再生 {ttsOn ? 'ON' : 'OFF'}
              </button>
            )}
            <div className="inline-flex rounded-full overflow-hidden border border-amber-200/15">
              {[1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-3 py-1.5 font-serif transition ${
                    speed === s ? 'bg-amber-300 text-stone-900' : 'bg-stone-900/50 text-amber-100/70 hover:bg-stone-900/80'
                  }`}
                >
                  x{s}
                </button>
              ))}
            </div>
            <span className="px-2 py-1.5 font-mono text-amber-200/50">
              {cursor + 1}/{beats.length}
            </span>
          </div>
        </div>

        {/* ── 登場人物 ── */}
        <div className="mt-10">
          <button
            onClick={() => setShowCast((v) => !v)}
            className="w-full flex items-center justify-between font-serif text-amber-50 text-lg border-b border-amber-200/15 pb-2"
          >
            <span>登場人物</span>
            <span className="text-amber-200/60 text-sm">{showCast ? '閉じる ▲' : '開く ▼'}</span>
          </button>
          <AnimatePresence initial={false}>
            {showCast && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid sm:grid-cols-2 gap-3 pt-4">
                  {drama.characters
                    .filter((c) => c.role !== '端役')
                    .map((c) => (
                      <div
                        key={c.id}
                        className="flex gap-3 rounded-2xl p-3.5"
                        style={{ background: `${c.color}12`, boxShadow: `inset 0 0 0 1px ${c.color}33` }}
                      >
                        {c.sprite ? (
                          <Image
                            src={`/images/dramas/${c.sprite}/portrait.png`}
                            alt={c.name}
                            width={56}
                            height={56}
                            className="w-14 h-14 object-contain flex-shrink-0"
                          />
                        ) : (
                          <span
                            className="flex-shrink-0 w-14 h-14 grid place-items-center rounded-full text-3xl"
                            style={{ background: `${c.color}22` }}
                          >
                            {c.emoji}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-serif text-amber-50 text-sm">
                            {c.name}{' '}
                            <span className="text-amber-200/55 text-[11px]">{c.emoji} {c.animal}</span>
                          </p>
                          <p className="font-serif text-[11px] tracking-wider mt-0.5" style={{ color: c.color }}>
                            {c.role}
                          </p>
                          <p className="font-serif text-amber-50/65 text-[12px] leading-relaxed mt-1">
                            {c.bio}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Episode nav */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            onClick={() => setEpIndex((i) => Math.max(0, i - 1))}
            disabled={epIndex === 0}
            className="px-4 py-2 rounded-full bg-stone-900/50 border border-amber-200/15 text-amber-100/80 text-sm font-serif disabled:opacity-30 hover:bg-stone-900/80"
          >
            ← 前の話
          </button>
          <Link
            href={localizePath('/dramas', routeLocale)}
            className="text-amber-200/60 hover:text-amber-200 text-sm font-serif"
          >
            一覧へ
          </Link>
          <button
            onClick={() => setEpIndex((i) => Math.min(drama.episodes.length - 1, i + 1))}
            disabled={epIndex === drama.episodes.length - 1}
            className="px-4 py-2 rounded-full bg-stone-900/50 border border-amber-200/15 text-amber-100/80 text-sm font-serif disabled:opacity-30 hover:bg-stone-900/80"
          >
            次の話 →
          </button>
        </div>
      </div>
    </main>
  );
}
