/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('convex/react', () => ({
  ConvexProvider: ({children}: {children: React.ReactNode}) => children,
  // src/session.ts pulls in the client singleton to refresh Convex auth.
  ConvexReactClient: class {
    setAuth() {}
    close() {}
  },
  useQuery: () => undefined,
  useMutation: () => jest.fn(),
}));
jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
  types: {allFiles: '*/*'},
}));
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn(),
    createChannel: jest.fn(async () => 'obligio-deadlines'),
    createTriggerNotification: jest.fn(async () => 'notification-id'),
    cancelNotification: jest.fn(),
    getNotificationSettings: jest.fn(async () => ({authorizationStatus: 1})),
  },
  AndroidImportance: {DEFAULT: 3},
  AuthorizationStatus: {DENIED: 0, AUTHORIZED: 1, PROVISIONAL: 2},
  TriggerType: {TIMESTAMP: 0},
}));
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    setLogLevel: jest.fn(),
    configure: jest.fn(),
    getOfferings: jest.fn(async () => ({current: {availablePackages: []}})),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
  },
  LOG_LEVEL: {INFO: 'INFO'},
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
