import {NativeModules} from 'react-native';
import type {Requirement} from './types';

export type WatchAction = {
  requestId: string;
  businessId: string;
  ownerId: string;
  requirementId: string;
};
export type WatchSnapshot = {
  version: 1;
  businessId: string;
  ownerId: string;
  businessName: string;
  updatedAt: number;
  totalCount: number;
  items: {id: string; title: string; dueDate: string; status: string; recurrence: string}[];
};

type WatchBridge = {
  updateSnapshot(json: string): Promise<void>;
  pendingActions(): Promise<WatchAction[]>;
  reply(requestId: string, error: string | null): Promise<void>;
};
export const watchBridge: WatchBridge | undefined = NativeModules.ObligioWatch;

export function makeWatchSnapshot(
  business: { _id: string; ownerId?: string; name: string } | null | undefined,
  items: Requirement[],
): WatchSnapshot {
  return {
    version: 1,
    businessId: business?._id ?? '',
    ownerId: business?.ownerId ?? '',
    businessName: business?.name ?? '',
    updatedAt: Date.now(),
    totalCount: business?.ownerId ? items.filter(item => item._id).length : 0,
    // Evidence, account credentials and document URLs never leave the phone.
    items: business?.ownerId ? items.filter(item => item._id).sort((a, b) => Number(a.status === 'current') - Number(b.status === 'current') || a.dueDate.localeCompare(b.dueDate)).slice(0, 100).map(item => ({
      id: item._id!, title: item.title, dueDate: item.dueDate,
      status: item.status, recurrence: item.recurrence ?? '',
    })) : [],
  };
}

export function validateWatchAction(action: WatchAction, snapshot: WatchSnapshot): string | null {
  if (!snapshot.ownerId || action.ownerId !== snapshot.ownerId || action.businessId !== snapshot.businessId) {
    return 'Your phone account changed. Refresh Obligio on your watch.';
  }
  if (!snapshot.items.some(item => item.id === action.requirementId)) {
    return 'This obligation is no longer available. Refresh your watch.';
  }
  return null;
}
