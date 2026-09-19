/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';

import {makeWatchSnapshot, validateWatchAction} from '../src/watch';
import {WATCH_STRINGS, type WatchStrings} from '../src/watchStrings';
import type {Requirement} from '../src/types';

const business = {_id: 'business1', ownerId: 'owner1', name: 'Example'};
const item = {
  _id: 'req1',
  title: 'Statement of Information',
  category: 'Registration',
  dueDate: '2026-10-14',
  status: 'upcoming',
  recurrence: 'biennial',
  hasDocument: false,
} as Requirement;

describe('watch speaks the phone language', () => {
  it('translates every interface string, not just some', () => {
    // A key left in English inside the French table reads as a bug on the
    // wrist, where there is no room to explain it.
    const english = WATCH_STRINGS['en-US'];
    for (const locale of ['fr-CA', 'es-US'] as const) {
      const table = WATCH_STRINGS[locale];
      for (const key of Object.keys(english) as (keyof WatchStrings)[]) {
        expect(table[key]).toBeTruthy();
        if (!['title', 'ok'].includes(key)) {
          expect([locale, key, table[key]]).not.toEqual([locale, key, english[key]]);
        }
      }
    }
  });

  it('keeps the placeholders the watch fills in', () => {
    for (const table of Object.values(WATCH_STRINGS)) {
      expect(table.synced).toContain('{ago}');
      expect(table.lastSynced).toContain('{time}');
    }
  });

  it('sends dates and cadences already formatted for the owner', () => {
    const fr = makeWatchSnapshot(business, [item], 'fr-CA');
    expect(fr.locale).toBe('fr-CA');
    expect(fr.strings).toBe(WATCH_STRINGS['fr-CA']);
    expect(fr.items[0].dueLabel).toMatch(/^Échéance : 14 oct\.? 2026$/);
    expect(fr.items[0].repeatsLabel).toBe('Récurrence tous les 2 ans');

    const en = makeWatchSnapshot(business, [item], 'en-US');
    expect(en.items[0].dueLabel).toBe('Due Oct 14, 2026');
    // Not "Repeats biennial": the raw value is what the watch used to show.
    expect(en.items[0].repeatsLabel).toBe('Repeats every 2 years');
  });

  it('answers a refused completion in the language the watch was sent', () => {
    const es = makeWatchSnapshot(business, [item], 'es-US');
    const action = {requestId: '1', ownerId: 'someone-else', businessId: 'business1', requirementId: 'req1'};
    expect(validateWatchAction(action, es)).toBe(WATCH_STRINGS['es-US'].accountChanged);
  });

  it('notes truncation in the owner language only when items were dropped', () => {
    const many = Array.from({length: 105}, (_, i) => ({...item, _id: `r${i}`}) as Requirement);
    expect(makeWatchSnapshot(business, many, 'fr-CA').truncationNote).toMatch(/^100 sur 105/);
    expect(makeWatchSnapshot(business, [item], 'fr-CA').truncationNote).toBe('');
  });
});

describe('native watch apps', () => {
  // The watch apps look strings up by key. A key they read that the phone
  // never sends would silently fall back to English forever.
  const root = path.join(__dirname, '..');
  const sources = {
    watchOS: fs.readFileSync(path.join(root, 'ios/ObligioWatch/ObligioWatchApp.swift'), 'utf8'),
    wearOS: fs.readFileSync(path.join(root, 'android/wear/src/main/java/com/obligio/watch/MainActivity.kt'), 'utf8'),
  };
  const sent = new Set(Object.keys(WATCH_STRINGS['en-US']));

  it.each(Object.entries(sources))('%s reads only keys the phone sends', (_name, source) => {
    const read = [...source.matchAll(/\b(?:t|s)\("([a-zA-Z]+)"\)/g)].map(match => match[1]);
    expect(read.length).toBeGreaterThan(5);
    for (const key of read) {
      expect(sent).toContain(key);
    }
  });

  it.each(Object.entries(sources))('%s keeps an English fallback for every key it reads', (_name, source) => {
    const read = new Set([...source.matchAll(/\b(?:t|s)\("([a-zA-Z]+)"\)/g)].map(match => match[1]));
    for (const key of read) {
      expect(source).toMatch(new RegExp(`"${key}"\\s*(?::|to)\\s*"`));
    }
  });
});
