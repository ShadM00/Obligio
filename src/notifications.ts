import notifee, {AndroidImportance, AuthorizationStatus, TriggerType} from '@notifee/react-native';
import {isIsoDate} from './dates';

const CHANNEL_ID = 'obligio-deadlines';
/** Reminders fire at 09:00 local time, this many days before the due date. */
const REMINDER_LEAD_DAYS = 7;
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

/**
 * The moment a reminder for an ISO due date should fire, or null when that
 * moment has already passed (notifee rejects triggers in the past).
 */
export function reminderTimestampFor(dueDateIso: string, now = Date.now()): number | null {
  if (!isIsoDate(dueDateIso)) return null;
  const [year, month, day] = dueDateIso.split('-').map(Number);
  const reminder = new Date(year, month - 1, day - REMINDER_LEAD_DAYS, REMINDER_HOUR, 0, 0, 0);
  const timestamp = reminder.getTime();
  return timestamp > now ? timestamp : null;
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
export function reminderIdFor(requirementId: string): string {
  return `obligio-req-${requirementId}`;
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
export async function scheduleReminderForDueDate(
  title: string,
  dueDateIso: string,
  requirementId?: string,
): Promise<string | null> {
  const id = requirementId ? reminderIdFor(requirementId) : undefined;
  const timestamp = reminderTimestampFor(dueDateIso);
  if (timestamp === null) {
    // The window has passed. Any reminder from a previous due date must still
    // be cleared, or an edit that moves a deadline earlier leaves the old one
    // armed.
    if (id) await cancelDeadlineReminder(id).catch(() => undefined);
    return null;
  }
  if (!(await notificationsAllowed())) return null;
  return scheduleDeadlineReminder(title, timestamp, id);
}

/** Clears the reminder for a requirement, if this device has one armed. */
export async function cancelReminderForRequirement(requirementId: string): Promise<void> {
  await cancelDeadlineReminder(reminderIdFor(requirementId)).catch(() => undefined);
}

export async function cancelDeadlineReminder(notificationId: string) {
  return notifee.cancelNotification(notificationId);
}
