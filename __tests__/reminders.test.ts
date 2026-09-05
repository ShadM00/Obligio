const mockNotifee = {
  requestPermission: jest.fn(),
  createChannel: jest.fn(async () => 'obligio-deadlines'),
  createTriggerNotification: jest.fn(async () => 'scheduled'),
  cancelNotification: jest.fn(async () => undefined),
  getNotificationSettings: jest.fn(async () => ({authorizationStatus: 1})),
};

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: mockNotifee,
  AndroidImportance: {DEFAULT: 3},
  AuthorizationStatus: {DENIED: 0, AUTHORIZED: 1, PROVISIONAL: 2},
  TriggerType: {TIMESTAMP: 0},
}));

// Loaded with require, after mockNotifee exists: an ES import would hoist
// above the const and the mock factory would capture undefined.
const {
  cancelReminderForRequirement,
  reminderIdFor,
  scheduleReminderForDueDate,
}: typeof import('../src/notifications') = require('../src/notifications');

beforeEach(() => jest.clearAllMocks());

test('derives a stable id from the requirement id', () => {
  expect(reminderIdFor('abc123')).toBe('obligio-req-abc123');
  // Stable across calls, so a reschedule replaces rather than duplicates.
  expect(reminderIdFor('abc123')).toBe(reminderIdFor('abc123'));
});

test('schedules against the requirement id so it can be replaced later', async () => {
  const far = `${new Date().getFullYear() + 2}-10-14`;
  await scheduleReminderForDueDate('Renew licence', far, 'req1');
  expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
    expect.objectContaining({id: 'obligio-req-req1'}),
    expect.objectContaining({type: 0}),
  );
});

test('clears a stale reminder when the new date is already past', async () => {
  const result = await scheduleReminderForDueDate('Old thing', '2020-01-01', 'req2');
  expect(result).toBeNull();
  // An edit that moves a deadline into the past must not leave the old
  // reminder armed.
  expect(mockNotifee.cancelNotification).toHaveBeenCalledWith('obligio-req-req2');
  expect(mockNotifee.createTriggerNotification).not.toHaveBeenCalled();
});

test('does not schedule when notifications are not permitted', async () => {
  mockNotifee.getNotificationSettings.mockResolvedValueOnce({authorizationStatus: 0});
  const far = `${new Date().getFullYear() + 2}-10-14`;
  await expect(scheduleReminderForDueDate('Renew licence', far, 'req3')).resolves.toBeNull();
  expect(mockNotifee.createTriggerNotification).not.toHaveBeenCalled();
});

test('cancelling a requirement reminder swallows an absent notification', async () => {
  mockNotifee.cancelNotification.mockRejectedValueOnce(new Error('not found'));
  await expect(cancelReminderForRequirement('req4')).resolves.toBeUndefined();
});
