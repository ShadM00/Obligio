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

export async function scheduleDeadlineReminder(title: string, timestamp: number): Promise<string> {
  const channelId = await prepareNotifications();
  return notifee.createTriggerNotification(
    {title: 'Obligio reminder', body: title, android: {channelId}},
    {type: TriggerType.TIMESTAMP, timestamp, alarmManager: {allowWhileIdle: true}},
  );
}

/**
 * Schedules a reminder for a requirement's due date. Returns the notification
 * id, or null when the reminder window has already passed or the user has not
 * granted permission — neither is an error worth interrupting a save for.
 */
export async function scheduleReminderForDueDate(title: string, dueDateIso: string): Promise<string | null> {
  const timestamp = reminderTimestampFor(dueDateIso);
  if (timestamp === null) return null;
  if (!(await notificationsAllowed())) return null;
  return scheduleDeadlineReminder(title, timestamp);
}

export async function cancelDeadlineReminder(notificationId: string) {
  return notifee.cancelNotification(notificationId);
}
