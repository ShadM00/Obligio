import {NativeModules} from 'react-native';
import {formatDisplayDate} from './dates';
import {locales, type Locale} from './i18n';
import {repeatsLabel} from './recurrence';
import type {Requirement} from './types';
import {WATCH_STRINGS, type WatchStrings} from './watchStrings';

export type WatchAction = {
  requestId: string;
  businessId: string;
  ownerId: string;
  requirementId: string;
};
/**
 * What the watch shows.
 *
 * Version 2 adds everything the watch needs to speak the owner's chosen
 * language: the interface strings, and per-item labels the phone has already
 * formatted and translated. The watch apps treat every version-2 field as
 * optional, so an older phone build still drives them in English.
 */
export type WatchSnapshot = {
  version: 2;
  locale: Locale;
  strings: WatchStrings;
  businessId: string;
  ownerId: string;
  businessName: string;
  updatedAt: number;
  totalCount: number;
  /** "Showing 100 of 140…", or empty when every item fits. */
  truncationNote: string;
  items: {
    id: string;
    title: string;
    dueDate: string;
    status: string;
    recurrence: string;
    /** "Due Oct 14, 2026", in the owner's language and date order. */
    dueLabel: string;
    /** "Repeats every 2 years", or empty for a one-off. */
    repeatsLabel: string;
  }[];
};

const WATCH_ITEM_LIMIT = 100;

const TRUNCATION: Record<Locale, (shown: number, total: number) => string> = {
  'en-US': (shown, total) => `Showing ${shown} of ${total}. Open your phone for all obligations.`,
  'en-GB': (shown, total) => `Showing ${shown} of ${total}. Open your phone for all obligations.`,
  'fr-CA': (shown, total) => `${shown} sur ${total} affichées. Ouvrez votre téléphone pour toutes les voir.`,
  'es-US': (shown, total) => `Se muestran ${shown} de ${total}. Abre tu teléfono para ver todas.`,
};

const DUE: Record<Locale, (date: string) => string> = {
  'en-US': date => `Due ${date}`,
  'en-GB': date => `Due ${date}`,
  'fr-CA': date => `Échéance : ${date}`,
  'es-US': date => `Vence: ${date}`,
};

type WatchBridge = {
  updateSnapshot(json: string): Promise<void>;
  pendingActions(): Promise<WatchAction[]>;
  reply(requestId: string, error: string | null): Promise<void>;
};
export const watchBridge: WatchBridge | undefined = NativeModules.ObligioWatch;

export function makeWatchSnapshot(
  business: { _id: string; ownerId?: string; name: string } | null | undefined,
  items: Requirement[],
  locale: Locale = 'en-US',
): WatchSnapshot {
  const copy = locales[locale];
  const tracked = business?.ownerId ? items.filter(item => item._id) : [];
  const shown = tracked
    .sort((a, b) => Number(a.status === 'current') - Number(b.status === 'current') || a.dueDate.localeCompare(b.dueDate))
    .slice(0, WATCH_ITEM_LIMIT);
  return {
    version: 2,
    locale,
    strings: WATCH_STRINGS[locale],
    businessId: business?._id ?? '',
    ownerId: business?.ownerId ?? '',
    businessName: business?.name ?? '',
    updatedAt: Date.now(),
    totalCount: tracked.length,
    truncationNote: tracked.length > shown.length ? TRUNCATION[locale](shown.length, tracked.length) : '',
    // Evidence, account credentials and document URLs never leave the phone.
    items: shown.map(item => ({
      id: item._id!,
      title: item.title,
      dueDate: item.dueDate,
      status: item.status,
      recurrence: item.recurrence ?? '',
      dueLabel: DUE[locale](formatDisplayDate(item.dueDate, locale)),
      repeatsLabel: item.recurrence
        ? `${copy.text('Repeats')} ${copy.text(repeatsLabel(item.recurrence))}`
        : '',
    })),
  };
}

export function validateWatchAction(action: WatchAction, snapshot: WatchSnapshot): string | null {
  // The reply is read on the watch, so it speaks the language the watch was sent.
  if (!snapshot.ownerId || action.ownerId !== snapshot.ownerId || action.businessId !== snapshot.businessId) {
    return snapshot.strings.accountChanged;
  }
  if (!snapshot.items.some(item => item.id === action.requirementId)) {
    return snapshot.strings.itemGone;
  }
  return null;
}
