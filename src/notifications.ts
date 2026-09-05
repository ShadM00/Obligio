import notifee, {AndroidImportance, TriggerType} from '@notifee/react-native';

const CHANNEL_ID = 'obligio-deadlines';

export async function prepareNotifications() {
  await notifee.requestPermission();
  return notifee.createChannel({id: CHANNEL_ID, name: 'Obligation deadlines', importance: AndroidImportance.DEFAULT});
}

export async function scheduleDeadlineReminder(title: string, timestamp: number) {
  const channelId = await prepareNotifications();
  return notifee.createTriggerNotification({title: 'Obligio reminder', body: title, android: {channelId}}, {type: TriggerType.TIMESTAMP, timestamp, alarmManager: {allowWhileIdle: true}});
}

export async function cancelDeadlineReminder(notificationId: string) {
  return notifee.cancelNotification(notificationId);
}
