import { 
  User, 
  Activity, 
  Gift, 
  ServiceRecord, 
  Redemption, 
  Registration, 
  PointsHistoryItem,
  WechatLoginResponse
} from '../types';

// Global Subscriber Store for Live Real-Time Updates across components
type CallbacksStore = {
  users: Set<(data: User[]) => void>;
  activities: Set<(data: Activity[]) => void>;
  gifts: Set<(data: Gift[]) => void>;
  registrations: Set<(data: Registration[]) => void>;
  serviceRecords: Set<(data: ServiceRecord[]) => void>;
  redemptions: Set<(data: Redemption[]) => void>;
  pointsHistory: Set<(data: PointsHistoryItem[]) => void>;
};

const callbacks: CallbacksStore = {
  users: new Set(),
  activities: new Set(),
  gifts: new Set(),
  registrations: new Set(),
  serviceRecords: new Set(),
  redemptions: new Set(),
  pointsHistory: new Set(),
};

let pollInterval: any = null;

// Helper to fetch full DB snapshot and notify all listeners
async function fetchAndNotifyAll() {
  try {
    const res = await fetch('/api/db/all');
    if (!res.ok) return;
    const data = await res.json();

    if (data.users) callbacks.users.forEach(cb => cb(data.users));
    if (data.activities) callbacks.activities.forEach(cb => cb(data.activities));
    if (data.gifts) callbacks.gifts.forEach(cb => cb(data.gifts));
    if (data.registrations) callbacks.registrations.forEach(cb => cb(data.registrations));
    if (data.serviceRecords) callbacks.serviceRecords.forEach(cb => cb(data.serviceRecords));
    if (data.redemptions) callbacks.redemptions.forEach(cb => cb(data.redemptions));
    if (data.pointsHistory) callbacks.pointsHistory.forEach(cb => cb(data.pointsHistory));
  } catch (err) {
    console.warn('API fetch error:', err);
  }
}

// Start polling background sync
function startGlobalPolling() {
  if (!pollInterval) {
    fetchAndNotifyAll();
    pollInterval = setInterval(fetchAndNotifyAll, 3000);
  }
}

/**
 * Seeds or resets database via Express Backend
 */
export async function seedDatabase(force: boolean = false): Promise<boolean> {
  try {
    const res = await fetch('/api/db/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force }),
    });
    const result = await res.json();
    await fetchAndNotifyAll();
    return result.seeded ?? true;
  } catch (err) {
    console.error('Seed database error:', err);
    return false;
  }
}

// Subscribe Functions
export function subscribeToUsers(callback: (users: User[]) => void) {
  callbacks.users.add(callback);
  startGlobalPolling();
  return () => { callbacks.users.delete(callback); };
}

export function subscribeToActivities(callback: (activities: Activity[]) => void) {
  callbacks.activities.add(callback);
  startGlobalPolling();
  return () => { callbacks.activities.delete(callback); };
}

export function subscribeToGifts(callback: (gifts: Gift[]) => void) {
  callbacks.gifts.add(callback);
  startGlobalPolling();
  return () => { callbacks.gifts.delete(callback); };
}

export function subscribeToRegistrations(callback: (regs: Registration[]) => void) {
  callbacks.registrations.add(callback);
  startGlobalPolling();
  return () => { callbacks.registrations.delete(callback); };
}

export function subscribeToServiceRecords(callback: (records: ServiceRecord[]) => void) {
  callbacks.serviceRecords.add(callback);
  startGlobalPolling();
  return () => { callbacks.serviceRecords.delete(callback); };
}

export function subscribeToRedemptions(callback: (reds: Redemption[]) => void) {
  callbacks.redemptions.add(callback);
  startGlobalPolling();
  return () => { callbacks.redemptions.delete(callback); };
}

export function subscribeToPointsHistory(callback: (history: PointsHistoryItem[]) => void) {
  callbacks.pointsHistory.add(callback);
  startGlobalPolling();
  return () => { callbacks.pointsHistory.delete(callback); };
}

// User Actions
export async function updateUserPointsAndHours(userId: string, pointsDelta: number, hoursDelta: number) {
  await fetch('/api/users/points-hours', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, pointsDelta, hoursDelta }),
  });
  await fetchAndNotifyAll();
}

// Activity Actions
export async function createActivity(activityData: Omit<Activity, 'id' | 'createdAt' | 'signedCount'>): Promise<string> {
  const res = await fetch('/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activityData),
  });
  const json = await res.json();
  await fetchAndNotifyAll();
  return json.data?.id || 'act_' + Date.now();
}

export async function updateActivity(activityId: string, updates: Partial<Activity>) {
  await fetch(`/api/activities/${activityId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  await fetchAndNotifyAll();
}

export async function deleteActivity(activityId: string) {
  await fetch(`/api/activities/${activityId}`, {
    method: 'DELETE',
  });
  await fetchAndNotifyAll();
}

export async function registerForActivity(
  user: User, 
  activity: Activity
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/activities/${activity.id}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id }),
  });
  const json = await res.json();
  await fetchAndNotifyAll();
  return json;
}

// Service Hours Claim & Audit Actions
export async function submitServiceRecord(recordData: Omit<ServiceRecord, 'id' | 'status' | 'createdAt'>): Promise<string> {
  const res = await fetch('/api/service-records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recordData),
  });
  const json = await res.json();
  await fetchAndNotifyAll();
  return json.data?.id || 'rec_' + Date.now();
}

export async function auditServiceRecord(
  record: ServiceRecord, 
  approved: boolean, 
  rejectReason?: string
) {
  await fetch(`/api/service-records/${record.id}/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved, rejectReason }),
  });
  await fetchAndNotifyAll();
}

// Gift Management
export async function createGift(giftData: Omit<Gift, 'id' | 'createdAt'>): Promise<string> {
  const res = await fetch('/api/gifts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(giftData),
  });
  const json = await res.json();
  await fetchAndNotifyAll();
  return json.data?.id || 'gift_' + Date.now();
}

export async function updateGift(giftId: string, updates: Partial<Gift>) {
  await fetch(`/api/gifts/${giftId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  await fetchAndNotifyAll();
}

// Gift Redemption
export async function redeemGift(
  user: User, 
  gift: Gift
): Promise<{ success: boolean; message: string; redemption?: Redemption }> {
  const res = await fetch(`/api/gifts/${gift.id}/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id }),
  });
  const json = await res.json();
  await fetchAndNotifyAll();
  return json;
}

// Verification Center
export async function verifyRedemptionCode(
  code: string, 
  verifierName: string
): Promise<{ success: boolean; message: string; redemption?: Redemption }> {
  const res = await fetch('/api/redemptions/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, verifierName }),
  });
  const json = await res.json();
  await fetchAndNotifyAll();
  return json;
}

// WeChat H5 Silent OAuth2.0 & OpenID Binding
export async function wechatLogin(code?: string, openid?: string): Promise<WechatLoginResponse> {
  const res = await fetch('/api/wechat/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, openid }),
  });
  const json = await res.json();
  await fetchAndNotifyAll();
  return json;
}

export async function wechatMockLogin(openid: string, name?: string): Promise<WechatLoginResponse> {
  const res = await fetch('/api/wechat/mock-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ openid, name }),
  });
  const json = await res.json();
  await fetchAndNotifyAll();
  return json;
}

export async function getWechatAuthUrl(redirectUri?: string): Promise<{ success: boolean; authUrl: string; isMock: boolean }> {
  const url = redirectUri ? `/api/wechat/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}` : '/api/wechat/auth-url';
  const res = await fetch(url);
  return await res.json();
}
