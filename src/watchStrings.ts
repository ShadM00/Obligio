import type {Locale} from './i18n';

/**
 * Everything the watch apps say, in each interface language.
 *
 * The watch shows the language the owner chose in the phone app, not the
 * watch's own system language, so the phone translates and sends these with
 * each snapshot. The watch apps carry only the English below as a fallback,
 * for the moment before a watch has ever synced.
 *
 * `{ago}` and `{time}` are filled in on the watch at render time, because
 * "synced two minutes ago" goes stale between syncs.
 */
export type WatchStrings = {
  title: string;
  deadline: string;
  synced: string;
  lastSynced: string;
  noObligations: string;
  signInOnPhone: string;
  refresh: string;
  connecting: string;
  markComplete: string;
  saving: string;
  confirmTitle: string;
  complete: string;
  cancel: string;
  ok: string;
  /** Wear OS only: returns from an obligation to the list. */
  back: string;
  completedStatus: string;
  completedFeedback: string;
  openPhone: string;
  phoneUnavailable: string;
  noReply: string;
  itemGone: string;
  accountChanged: string;
};

const en: WatchStrings = {
  title: 'Obligio',
  deadline: 'Deadline',
  synced: 'Synced {ago}',
  lastSynced: 'Last synced {time}',
  noObligations: 'No obligations yet. Add one on your phone.',
  signInOnPhone: 'Open Obligio on your phone and sign in to sync your obligations.',
  refresh: 'Refresh',
  connecting: 'Connecting…',
  markComplete: 'Mark complete',
  saving: 'Saving…',
  confirmTitle: 'Complete this obligation?',
  complete: 'Complete',
  cancel: 'Cancel',
  ok: 'OK',
  back: 'Back',
  completedStatus: 'Completed',
  completedFeedback: 'Completed. Your phone will sync the next deadline if this obligation repeats.',
  openPhone: 'Open Obligio on your paired phone and keep it nearby.',
  phoneUnavailable: 'Phone unavailable. Open Obligio on your phone and try again.',
  noReply: 'No reply. Refresh before retrying to check whether the item completed.',
  itemGone: 'This obligation is no longer available. Refresh your watch.',
  accountChanged: 'Your phone account changed. Refresh Obligio on your watch.',
};

const fr: WatchStrings = {
  title: 'Obligio',
  deadline: 'Échéance',
  synced: 'Synchronisé {ago}',
  lastSynced: 'Dernière synchronisation : {time}',
  noObligations: 'Aucune obligation. Ajoutez-en une sur votre téléphone.',
  signInOnPhone: 'Ouvrez Obligio sur votre téléphone et connectez-vous pour synchroniser vos obligations.',
  refresh: 'Actualiser',
  connecting: 'Connexion…',
  markComplete: 'Marquer comme terminée',
  saving: 'Enregistrement…',
  confirmTitle: 'Terminer cette obligation ?',
  complete: 'Terminer',
  cancel: 'Annuler',
  ok: 'OK',
  back: 'Retour',
  completedStatus: 'Terminée',
  completedFeedback: 'Terminée. Votre téléphone synchronisera la prochaine échéance si cette obligation est récurrente.',
  openPhone: 'Ouvrez Obligio sur votre téléphone jumelé et gardez-le à proximité.',
  phoneUnavailable: 'Téléphone indisponible. Ouvrez Obligio sur votre téléphone et réessayez.',
  noReply: 'Aucune réponse. Actualisez avant de réessayer pour vérifier si l’obligation a été terminée.',
  itemGone: 'Cette obligation n’est plus disponible. Actualisez votre montre.',
  accountChanged: 'Le compte de votre téléphone a changé. Actualisez Obligio sur votre montre.',
};

const es: WatchStrings = {
  title: 'Obligio',
  deadline: 'Plazo',
  synced: 'Sincronizado {ago}',
  lastSynced: 'Última sincronización: {time}',
  noObligations: 'Aún no hay obligaciones. Agrega una en tu teléfono.',
  signInOnPhone: 'Abre Obligio en tu teléfono e inicia sesión para sincronizar tus obligaciones.',
  refresh: 'Actualizar',
  connecting: 'Conectando…',
  markComplete: 'Marcar como completada',
  saving: 'Guardando…',
  confirmTitle: '¿Completar esta obligación?',
  complete: 'Completar',
  cancel: 'Cancelar',
  ok: 'OK',
  back: 'Atrás',
  completedStatus: 'Completada',
  completedFeedback: 'Completada. Tu teléfono sincronizará el próximo plazo si esta obligación se repite.',
  openPhone: 'Abre Obligio en tu teléfono vinculado y mantenlo cerca.',
  phoneUnavailable: 'Teléfono no disponible. Abre Obligio en tu teléfono e inténtalo de nuevo.',
  noReply: 'Sin respuesta. Actualiza antes de reintentar para comprobar si se completó.',
  itemGone: 'Esta obligación ya no está disponible. Actualiza tu reloj.',
  accountChanged: 'La cuenta de tu teléfono cambió. Actualiza Obligio en tu reloj.',
};

export const WATCH_STRINGS: Record<Locale, WatchStrings> = {
  'en-US': en,
  'en-GB': en,
  'fr-CA': fr,
  'es-US': es,
};
