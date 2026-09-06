import notifee, {AndroidImportance, AuthorizationStatus, TriggerType} from '@notifee/react-native';
import {isIsoDate} from './dates';

const CHANNEL_ID = 'obligio-deadlines';
/**
 * Reminders fire at 09:00 local on each of these days before the due date.
 *
 * A single late reminder is not much use: gathering renewal paperwork takes
 * longer than the notice it gives. A long-range warning gives time to act and
 * a short-range one catches anyone who deferred it.
 */
const REMINDER_LEAD_DAYS = [30, 14, 7, 1] as const;
const REMINDER_HOUR = 9;

export async function prepareNotifications(): Promise<string> {
  await notifee.requestPermission();
  return notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Obligation deadlines',
    importance: AndroidImportance.DEFAULT,
  });
}

export async function notificationsAllowed(): Promise<boolean> {
  const settings = await notifee.getNotificationSettings();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

/** Every reminder moment for a due date that is still in the future. */
export function reminderTimestampsFor(dueDateIso: string, now = Date.now()): number[] {
  if (!isIsoDate(dueDateIso)) return [];
  const [year, month, day] = dueDateIso.split('-').map(Number);
  return REMINDER_LEAD_DAYS.map(lead =>
    new Date(year, month - 1, day - lead, REMINDER_HOUR, 0, 0, 0).getTime(),
  ).filter(timestamp => timestamp > now);
}

/**
 * The soonest reminder still ahead of us, or null when every one has passed
 * (notifee rejects triggers in the past).
 */
export function reminderTimestampFor(dueDateIso: string, now = Date.now()): number | null {
  return reminderTimestampsFor(dueDateIso, now)[0] ?? null;
}

/**
 * The notification id for a requirement.
 *
 * Reminder ids are derived from the requirement id rather than stored. Notifee
 * ids are local to a device, so a stored id would be meaningless on the
 * owner's other devices; deriving it means any device can cancel or replace
 * its own reminder for a requirement, and rescheduling overwrites in place
 * instead of stacking duplicates.
 */
export function reminderIdFor(requirementId: string, leadDays?: number): string {
  return leadDays === undefined
    ? `obligio-req-${requirementId}`
    : `obligio-req-${requirementId}-${leadDays}`;
}

/** Every notification id this requirement may have armed, for cancellation. */
export function reminderIdsFor(requirementId: string): string[] {
  return [reminderIdFor(requirementId), ...REMINDER_LEAD_DAYS.map(d => reminderIdFor(requirementId, d))];
}

export async function scheduleDeadlineReminder(
  title: string,
  timestamp: number,
  id?: string,
): Promise<string> {
  const channelId = await prepareNotifications();
  return notifee.createTriggerNotification(
    {id, title: 'Obligio reminder', body: title, android: {channelId}},
    {type: TriggerType.TIMESTAMP, timestamp, alarmManager: {allowWhileIdle: true}},
  );
}

/**
 * Schedules a reminder for a requirement's due date. Returns the notification
 * id, or null when the reminder window has already passed or the user has not
 * granted permission — neither is an error worth interrupting a save for.
 */
/**
 * Arms every future reminder for a due date, returning how many were set.
 *
 * Existing reminders are cleared first, so editing a date never leaves a
 * reminder from the previous one armed — including when the new date is close
 * enough that fewer reminders apply, or already past so none do.
 */
export async function scheduleReminderForDueDate(
  title: string,
  dueDateIso: string,
  requirementId?: string,
): Promise<number> {
  if (requirementId) await cancelReminderForRequirement(requirementId);

  const timestamps = reminderTimestampsFor(dueDateIso);
  if (timestamps.length === 0) return 0;
  if (!(await notificationsAllowed())) return 0;

  let armed = 0;
  for (const [index, timestamp] of timestamps.entries()) {
    const lead = REMINDER_LEAD_DAYS[REMINDER_LEAD_DAYS.length - timestamps.length + index];
    const id = requirementId ? reminderIdFor(requirementId, lead) : undefined;
    await scheduleDeadlineReminder(title, timestamp, id);
    armed += 1;
  }
  return armed;
}

/** Clears every reminder this device has armed for a requirement. */
export async function cancelReminderForRequirement(requirementId: string): Promise<void> {
  await Promise.all(
    reminderIdsFor(requirementId).map(id => cancelDeadlineReminder(id).catch(() => undefined)),
  );
}

export async function cancelDeadlineReminder(notificationId: string) {
  return notifee.cancelNotification(notificationId);
}
