/**
 * @format
 *
 * The free-limit gate, wired rather than in isolation.
 *
 * `entitlements.ts` is unit tested as pricing policy, but policy that is never
 * consulted gates nothing. These tests drive the real App with a signed-in
 * business and check that a free account actually meets the paywall — the one
 * path in the app where being wrong costs money in either direction.
 */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import {locales} from '../src/i18n';
import {FREE_REQUIREMENT_LIMIT} from '../src/entitlements';

const copy = locales['en-US'];

// Prefixed `mock` so jest's hoisted factories may reference them.
let mockIsPlus = false;
let mockRequirements: unknown[] = [];

jest.mock('../src/session', () => ({
  useSession: () => ({
    status: 'signed-in',
    error: null,
    signIn: jest.fn(),
    signOut: jest.fn(),
    clearError: jest.fn(),
  }),
}));

jest.mock('../src/subscription', () => {
  const entitlements = jest.requireActual('../src/entitlements');
  return {
    ...entitlements,
    useSubscription: () => ({isPlus: mockIsPlus, loading: false, packages: [], refresh: jest.fn()}),
  };
});

jest.mock('convex/react', () => ({
  ConvexProvider: ({children}: {children: React.ReactNode}) => children,
  ConvexReactClient: class {
    setAuth() {}
    close() {}
  },
  // Dispatched on the arguments rather than on the query reference: the
  // reference identity does not survive jest's module registry, and App calls
  // each of these with a distinct argument shape anyway.
  useQuery: (_ref: unknown, args: unknown) => {
    if (args === 'skip') {
      return undefined;
    }
    const shape = (args ?? {}) as Record<string, unknown>;
    if ('businessId' in shape) {
      return mockRequirements;
    }
    if ('country' in shape) {
      return [];
    }
    return {_id: 'biz1', name: 'Test Co', country: 'US', region: 'WA', industry: 'General'};
  },
  useMutation: () => jest.fn(),
  useConvex: () => ({query: jest.fn()}),
}));

jest.mock('@react-native-documents/picker', () => ({pick: jest.fn(), types: {allFiles: '*/*'}}));
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn(),
    createChannel: jest.fn(async () => 'obligio-deadlines'),
    createTriggerNotification: jest.fn(async () => 'id'),
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
    getCustomerInfo: jest.fn(async () => ({entitlements: {active: {}}})),
    addCustomerInfoUpdateListener: jest.fn(),
    removeCustomerInfoUpdateListener: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
  },
  LOG_LEVEL: {INFO: 'INFO'},
}));

import App from '../App';

function obligations(count: number) {
  return Array.from({length: count}, (_, i) => ({
    _id: `req${i}`,
    title: `Obligation ${i}`,
    category: 'Tax',
    dueDate: '2026-12-31',
    status: 'upcoming',
    recurrence: 'annual',
    hasDocument: false,
  }));
}

async function render() {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });
  return tree;
}

function texts(tree: ReactTestRenderer.ReactTestRenderer): string[] {
  return tree.root
    .findAllByType('Text' as never)
    .flatMap(node => node.children.filter((child): child is string => typeof child === 'string'));
}

describe('free requirement limit', () => {
  beforeEach(() => {
    mockIsPlus = false;
    mockRequirements = [];
  });

  it('says nothing about the limit below it', async () => {
    mockRequirements = obligations(FREE_REQUIREMENT_LIMIT - 1);
    expect(texts(await render())).not.toContain(copy.freeLimitReached(FREE_REQUIREMENT_LIMIT));
  });

  it('offers the upgrade once the limit is reached', async () => {
    mockRequirements = obligations(FREE_REQUIREMENT_LIMIT);
    expect(texts(await render())).toContain(copy.freeLimitReached(FREE_REQUIREMENT_LIMIT));
  });

  it('does not nag a subscriber who is over the free limit', async () => {
    // Plus is unlimited; showing the banner to someone already paying is the
    // more damaging direction of this bug.
    mockIsPlus = true;
    mockRequirements = obligations(FREE_REQUIREMENT_LIMIT + 4);
    expect(texts(await render())).not.toContain(copy.freeLimitReached(FREE_REQUIREMENT_LIMIT));
  });
});
