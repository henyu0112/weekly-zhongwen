'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookMarked, Check, Search, Volume2, X } from 'lucide-react';
import { activitiesForWord } from '@/data/activities';
import {
  ANTONYMS,
  POS_EN,
  POS_ZH,
  TOPIC_EN,
  TOPIC_ZH,
  WORDS,
  WORD_BY_ID,
  type Pos,
  type TopicKey,
  type Word,
} from '@/data/words';
import { getGame } from '@/games/catalog';
import { loc, useT } from '@/lib/i18n';
import { LEVEL_GROUPS, inGroup, levelGroup, levelName, type LevelGroupId } from '@/lib/levels';
import { useProfile } from '@/lib/profile';
import { speak } from '@/lib/speech';
import type { Locale } from '@/lib/settings';
import { GameArt } from './GameArt';
import { WordArt } from './WordArt';

/** "píng guǒ" → "pingguo", so pinyin can be typed without tones or spaces. */
const plain = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();

const ANTONYM_OF = new Map<string, string[]>();
for (const [a, b] of ANTONYMS) {
  ANTONYM_OF.set(a.id, [...(ANTONYM_OF.get(a.id) ?? []), b.id]);
  ANTONYM_OF.set(b.id, [...(ANTONYM_OF.get(b.id) ?? []), a.id]);
}

const posLabel = (p: Pos, locale: Locale) => (locale === 'zh' ? POS_ZH[p] : POS_EN[p]);
const topicLabel = (k: TopicKey, locale: Locale) => (locale === 'zh' ? TOPIC_ZH[k] : TOPIC_EN[k]);

function Filter<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T | '';
  onChange: (v: T | '') => void;
  options: { value: T | ''; label: string }[];
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as T | '')}
      className="h-11 min-w-0 rounded-full border border-line bg-surface px-3 text-sm font-bold outline-none focus:border-brand"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Status({ id }: { id: string }) {
  const { t } = useT();
  const profile = useProfile();
  if (profile.mistakes[id]) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-extrabold text-amber-800">
        <BookMarked className="size-3" aria-hidden /> {t('dict.review')}
      </span>
    );
  }
  if (profile.wordsLearned[id]) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-extrabold text-emerald-800">
        <Check className="size-3" aria-hidden strokeWidth={3} /> {t('dict.learned')}
      </span>
    );
  }
  return null;
}

function WordDetail({ word, onOpen, onClose }: { word: Word; onOpen: (id: string) => void; onClose: () => void }) {
  const { t, locale } = useT();
  const antonyms = ANTONYM_OF.get(word.id) ?? [];
  const games = activitiesForWord(word.id)
    .map(getGame)
    .filter((g) => g?.playable);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const rows = [
    ...(word.zh ? [[t('dict.meaningZh'), word.zh]] : []),
    [t('dict.meaning'), word.en],
    [t('dict.type'), posLabel(word.pos, locale)],
    [t('dict.level'), levelName(word.level, locale)],
    ...(word.topic ? [[t('dict.topic'), topicLabel(word.topic, locale)]] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/50 sm:place-items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={word.hanzi}
        onClick={(e) => e.stopPropagation()}
        className="pop-in max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-md sm:rounded-3xl"
      >
        <div className="flex justify-end">
          <button
            type="button"
            aria-label={t('dict.close')}
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full hover:bg-soft"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="text-center">
          {word.art && <WordArt id={word.art} className="mx-auto mb-2 size-16" />}
          <p className="text-lg font-bold text-muted">{word.pinyin}</p>
          <h2 lang="zh-CN" className="text-6xl font-black">
            {word.hanzi}
          </h2>
          <button
            type="button"
            onClick={() => speak(word.hanzi)}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-brand px-4 text-sm font-bold text-brand-fg"
          >
            <Volume2 className="size-4" aria-hidden /> {t('dict.listen')}
          </button>
          <p className="mt-2 flex justify-center">
            <Status id={word.id} />
          </p>
        </div>

        <dl className="mt-4 divide-y divide-line rounded-2xl bg-soft px-4 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5">
              <dt className="font-bold text-muted">{k}</dt>
              <dd className="text-right font-extrabold">{v}</dd>
            </div>
          ))}
          {antonyms.length > 0 && (
            <div className="flex items-center justify-between gap-4 py-2">
              <dt className="font-bold text-muted">{t('dict.antonym')}</dt>
              <dd className="flex gap-1.5">
                {antonyms.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onOpen(id)}
                    className="rounded-full bg-surface px-3 py-1 font-black text-brand"
                  >
                    {WORD_BY_ID[id].hanzi}
                  </button>
                ))}
              </dd>
            </div>
          )}
        </dl>

        {games.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-extrabold text-muted">{t('dict.usedIn')}</h3>
            <div className="grid grid-cols-2 gap-2">
              {games.map((g) => (
                <Link
                  key={g!.slug}
                  href={`/games/${g!.slug}/`}
                  className="flex items-center gap-2 rounded-2xl border border-line p-2 text-sm font-bold hover:bg-soft"
                >
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${g!.gradient}`}>
                    <GameArt slug={g!.slug} className="size-7" />
                  </span>
                  {loc(g!.title, locale)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DictionaryView() {
  const { t, locale } = useT();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<LevelGroupId | ''>('');
  const [pos, setPos] = useState<Pos | ''>('');
  const [topic, setTopic] = useState<TopicKey | ''>('');
  const [openId, setOpenId] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qPlain = plain(q);
    const chosen = levelGroup(group);
    return WORDS.filter(
      (w) =>
        (!chosen || inGroup(chosen, [w.level, w.level])) &&
        (!pos || w.pos === pos) &&
        (!topic || w.topic === topic) &&
        (!q || w.hanzi.includes(q) || plain(w.pinyin).includes(qPlain) || w.en.toLowerCase().includes(q)),
    );
  }, [query, group, pos, topic]);

  const filtered = !!(query || group || pos || topic);
  const open = openId ? WORD_BY_ID[openId] : null;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-black">{t('dict.title')}</h1>
        <p className="mt-1 text-muted">{t('dict.sub', { n: WORDS.length })}</p>
      </header>

      <div className="space-y-3 rounded-3xl border border-line bg-surface p-4">
        <label className="relative block">
          <span className="sr-only">{t('dict.search')}</span>
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('dict.search')}
            className="h-12 w-full rounded-full border border-line bg-bg pl-12 pr-4 font-bold outline-none focus:border-brand"
          />
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Filter<LevelGroupId>
            label={t('dict.level')}
            value={group}
            onChange={setGroup}
            options={[
              { value: '', label: t('dict.allLevels') },
              ...LEVEL_GROUPS.map((g) => ({ value: g.id, label: `${loc(g.name, locale)} (${loc(g.years, locale)})` })),
            ]}
          />
          <Filter<Pos>
            label={t('dict.type')}
            value={pos}
            onChange={setPos}
            options={[
              { value: '', label: t('dict.allTypes') },
              ...(Object.keys(POS_ZH) as Pos[]).map((p) => ({ value: p, label: posLabel(p, locale) })),
            ]}
          />
          <Filter<TopicKey>
            label={t('dict.topic')}
            value={topic}
            onChange={setTopic}
            options={[
              { value: '', label: t('dict.allTopics') },
              ...(Object.keys(TOPIC_ZH) as TopicKey[]).map((k) => ({ value: k, label: topicLabel(k, locale) })),
            ]}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted">{t('dict.count', { n: results.length })}</p>
        {filtered && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setGroup('');
              setPos('');
              setTopic('');
            }}
            className="text-sm font-bold text-brand"
          >
            {t('dict.clear')}
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line p-10 text-center text-muted">{t('dict.empty')}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => setOpenId(w.id)}
                className="flex h-full min-h-36 w-full flex-col items-center rounded-2xl border border-line bg-surface p-3 text-center transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
              >
                <span className="text-xs font-bold text-muted">{w.pinyin}</span>
                <span lang="zh-CN" className="my-1 text-3xl font-black">
                  {w.hanzi}
                </span>
                <span className="line-clamp-2 text-sm font-semibold text-muted">{w.en}</span>
                <span className="mt-auto flex flex-wrap justify-center gap-1 pt-2">
                  <span className="rounded-full bg-soft px-2 py-0.5 text-xs font-bold text-brand">
                    {posLabel(w.pos, locale)}
                  </span>
                  <Status id={w.id} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && <WordDetail word={open} onOpen={setOpenId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
