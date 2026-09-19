import {makeWatchSnapshot, validateWatchAction} from '../src/watch';
import type {Requirement} from '../src/types';
const business = {_id: 'business1', ownerId: 'owner1', name: 'Example'};
const item = {_id: 'req1', title: 'Renew', category: 'Other', dueDate: '2026-10-01', status: 'upcoming', hasDocument: true} as Requirement;

test('watch snapshot excludes documents and clears data on sign out', () => {
  const snapshot = makeWatchSnapshot(business, [item]);
  expect(snapshot.items[0]).not.toHaveProperty('hasDocument');
  expect(makeWatchSnapshot(null, [item]).items).toEqual([]);
  expect(makeWatchSnapshot(null, [item]).ownerId).toBe('');
});
test('watch completion cannot cross accounts or businesses', () => {
  const snapshot = makeWatchSnapshot(business, [item]);
  const action = {requestId: '1', ownerId: 'owner1', businessId: 'business1', requirementId: 'req1'};
  expect(validateWatchAction(action, snapshot)).toBeNull();
  expect(validateWatchAction({...action, ownerId: 'other'}, snapshot)).not.toBeNull();
  expect(validateWatchAction({...action, businessId: 'other'}, snapshot)).not.toBeNull();
  expect(validateWatchAction({...action, requirementId: 'deleted'}, snapshot)).not.toBeNull();
});
