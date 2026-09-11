import {RECURRENCES, type Recurrence} from '../convex/dates';

/**
 * How each recurrence reads to an owner.
 *
 * `picker` labels the choice when adding or editing an obligation; `repeats`
 * follows "Repeats" on a row or a catalogue template. The three original
 * periods keep the wording they already had on screen, so nothing that
 * existed shifts under the store screenshots.
 */
const LABELS: Record<Recurrence, {picker: string; repeats: string}> = {
  monthly: {picker: 'Monthly', repeats: 'monthly'},
  quarterly: {picker: 'Quarterly', repeats: 'quarterly'},
  annual: {picker: 'Annual', repeats: 'annual'},
  biennial: {picker: 'Every 2 years', repeats: 'every 2 years'},
  triennial: {picker: 'Every 3 years', repeats: 'every 3 years'},
  quinquennial: {picker: 'Every 5 years', repeats: 'every 5 years'},
};

export const RECURRENCE_OPTIONS: readonly {value: Recurrence | undefined; label: string}[] = [
  {value: undefined, label: 'One-off'},
  ...RECURRENCES.map(value => ({value, label: LABELS[value].picker})),
];

/** "every 2 years" for `biennial`; an unknown value passes through unchanged. */
export function repeatsLabel(recurrence: string): string {
  return (LABELS as Record<string, {repeats: string}>)[recurrence]?.repeats ?? recurrence;
}
