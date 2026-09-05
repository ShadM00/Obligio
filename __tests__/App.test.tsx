/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
jest.mock('convex/react', () => ({
  ConvexProvider: ({children}: {children: React.ReactNode}) => children,
  useQuery: () => undefined,
  useMutation: () => jest.fn(),
}));
jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
  types: {allFiles: '*/*'},
}));
jest.mock('@notifee/react-native', () => ({
  requestPermission: jest.fn(),
  createChannel: jest.fn(async () => 'obligio-deadlines'),
  AndroidImportance: {DEFAULT: 3},
  TriggerType: {TIMESTAMP: 0},
}));
import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
