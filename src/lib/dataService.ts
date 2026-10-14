// Community Volunteer Service Platform - Pure REST & In-Memory Data Service
// Completely decoupled from Firestore to eliminate all quota limits and quota exhaustion crashes
import { 
  User, 
  Activity, 
  Gift, 
  Registration, 
  ServiceRecord, 
  Redemption, 
  PointsHistoryItem, 
  CommunityIssue, 
  UserRole,
  WechatLoginResponse,
  IssueStatus
} from '../types';
import { getPublicAppUrl } from './appConfig';

// In-Memory Reactive Cache
let cachedUsers: User[] = [];
let cachedActivities: Activity[] = [];
let cachedGifts: Gift[] = [];
let cachedRegistrations: Registration[] = [];
let cachedServiceRecords: ServiceRecord[] = [];
let cachedRedemptions: Redemption[] = [];
let cachedPointsHistory: PointsHistoryItem[] = [];
let cachedIssues: CommunityIssue[] = [];

// Subscribers
type Callback<T> = (data: T) => void;
const callbacks = {
  users: new Set<Callback<User[]>>(),
  activities: new Set<Callback<Activity[]>>(),
  gifts: new Set<Callback<Gift[]>>(),
  registrations: new Set<Callback<Registration[]>>(),
  serviceRecords: new Set<Callback<ServiceRecord[]>>(),
  redemptions: new Set<Callback<Redemption[]>>(),
  pointsHistory: new Set<Callback<PointsHistoryItem[]>>(),
  issues: new Set<Callback<CommunityIssue[]>>(),
};

// Initial Seed Data Sets
function getInitialProductionData() {
  const users: User[] = [
    {
      id: 'user_1',
      name: '张兰英',
      phone: '138****5678',
      avatar: '👵',
      role: 'resident',
      points: 320,
      totalHours: 28.5,
      badge: '社区志愿榜样',
      joinedDate: '2025-03-12',
      openid: 'mock_openid_resident_001',
    },
    {
      id: 'user_2',
      name: '李建国 (党员)',
      phone: '139****1234',
      avatar: '👨‍💼',
      role: 'party_member',
      points: 180,
      totalHours: 18.5,
      badge: '党员先锋志愿者',
      joinedDate: '2025-06-08',
      openid: 'mock_openid_resident_002',
    },
    {
      id: 'user_3',
      name: '赵红旗 (党员先锋)',
      phone: '137****6789',
      avatar: '🌟',
      role: 'party_member',
      points: 260,
      totalHours: 24.0,
      badge: '在职党员先锋队',
      joinedDate: '2025-05-04',
      openid: 'mock_openid_party_003',
    },
    {
      id: 'user_admin',
      name: '王主任 (管理员)',
      phone: '133****9999',
      avatar: '👮‍♂️',
      role: 'admin',
      points: 999,
      totalHours: 100.0,
      badge: '社区党群管理者',
      joinedDate: '2024-01-01',
      openid: 'mock_openid_admin_999',
    },
  ];

  const activities: Activity[] = [
    {
      id: 'act_1',
      title: '文明创建：社区垃圾分类宣传与分类督导',
      location: '幸福小区1-3期垃圾分类投放点',
      date: '2026-08-08 08:30 - 10:30',
      hours: 2.0,
      pointsReward: 40,
      maxSeats: 20,
      signedCount: 16,
      status: 'recruiting',
      category: '环保卫士',
      description: '在社区定时投放点引导居民正确分类投递垃圾，发放垃圾分类宣传手册，维持投放点干净整洁。',
      organizer: '幸福社区党群服务中心',
      createdAt: '2026-08-01',
    },
    {
      id: 'act_2',
      title: '温暖关爱：独居高龄老人关怀与卫生清扫',
      location: '幸福社区高龄老人家中',
      date: '2026-08-10 14:00 - 17:00',
      hours: 3.0,
      pointsReward: 60,
      maxSeats: 10,
      signedCount: 8,
      status: 'recruiting',
      category: '关爱邻里',
      description: '深入社区独居老人家中，陪老人聊天谈心，帮忙清扫室内卫生、排查燃气水电安全隐患。',
      organizer: '社区志愿者协会',
      createdAt: '2026-08-02',
    },
    {
      id: 'act_3',
      title: '平安社区：楼道电动车违规停放与消防巡查',
      location: '幸福社区各居民楼单元楼道',
      date: '2026-08-06 19:00 - 21:30',
      hours: 2.5,
      pointsReward: 50,
      maxSeats: 15,
      signedCount: 15,
      status: 'in_progress',
      category: '平安社区',
      description: '联合社区物业网格员巡查楼道违规飞线充电及违规停放电动车行为，引导居民安全用电停车。',
      organizer: '社区网格治理办',
      createdAt: '2026-08-03',
    },
    {
      id: 'act_4',
      title: '便民义集：社区便民免费理发与磨刀义诊',
      location: '社区广场休闲凉亭',
      date: '2026-08-02 09:00 - 12:00',
      hours: 3.0,
      pointsReward: 60,
      maxSeats: 12,
      signedCount: 12,
      status: 'completed',
      category: '便民服务',
      description: '为辖区60岁以上老人提供免费理发、义诊量血压血糖服务，现场秩序维护与签到引导。',
      organizer: '幸福社区新时代文明实践站',
      createdAt: '2026-07-28',
    },
    {
      id: 'act_5',
      title: '书香社区：社区儿童阅览室图书整理归类',
      location: '党群中心2楼书香图书室',
      date: '2026-08-12 15:00 - 17:00',
      hours: 2.0,
      pointsReward: 40,
      maxSeats: 8,
      signedCount: 5,
      status: 'recruiting',
      category: '文明创建',
      description: '协助社区图书馆管理员整理借阅图书，修补破损书籍，辅导社区放学儿童阅读。',
      organizer: '社区文化站',
      createdAt: '2026-08-04',
    }
  ];

  const gifts: Gift[] = [
    {
      id: 'gift_1',
      name: '304不锈钢便携保温杯 (500ml)',
      pointsCost: 150,
      stock: 25,
      category: '日用百货',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400',
      description: '双层抽真空保温保冷，医用级304不锈钢内胆，社区定制爱心纪念款。',
      status: 'on_sale',
      createdAt: '2026-08-01',
    },
    {
      id: 'gift_2',
      name: '优质小包装东北大米 (5kg)',
      pointsCost: 120,
      stock: 18,
      category: '粮油副食',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
      description: '当季新米，颗粒饱满，饭香浓郁，家庭常备优质口粮。',
      status: 'on_sale',
      createdAt: '2026-08-01',
    },
    {
      id: 'gift_3',
      name: '非转基因压榨一级玉米胚芽油 (1.8L)',
      pointsCost: 100,
      stock: 15,
      category: '粮油副食',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400',
      description: '物理压榨，清淡少油烟，富含植物甾醇与维生素E。',
      status: 'on_sale',
      createdAt: '2026-08-02',
    },
    {
      id: 'gift_4',
      name: '大容量浓缩除菌洗衣液 (2kg+补充装)',
      pointsCost: 80,
      stock: 30,
      category: '日用百货',
      image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=400',
      description: '深层洁净去渍，除菌抑菌，持久留香，温和不伤手。',
      status: 'on_sale',
      createdAt: '2026-08-02',
    },
    {
      id: 'gift_5',
      name: '社区环保折叠帆布购物袋',
      pointsCost: 30,
      stock: 50,
      category: '日用百货',
      image: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&q=80&w=400',
      description: '高密度加厚纯棉帆布，承重强可折叠，践行绿色低碳环保生活。',
      status: 'on_sale',
      createdAt: '2026-08-03',
    },
    {
      id: 'gift_6',
      name: '自动全晴雨两用黑胶遮阳伞',
      pointsCost: 100,
      stock: 12,
      category: '便民卡券',
      image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=400',
      description: '一键自动开合，UPF50+防晒黑胶涂层，抗风伞骨，出行守护。',
      status: 'on_sale',
      createdAt: '2026-08-03',
    },
  ];

  const registrations: Registration[] = [
    {
      id: 'reg_1',
      activityId: 'act_1',
      userId: 'user_1',
      userName: '张兰英',
      userPhone: '138****5678',
      activityTitle: '文明创建：社区垃圾分类宣传与分类督导',
      status: 'registered',
      hours: 2.0,
      pointsReward: 40,
      signedAt: '2026-08-02 10:15',
    },
    {
      id: 'reg_2',
      activityId: 'act_4',
      userId: 'user_1',
      userName: '张兰英',
      userPhone: '138****5678',
      activityTitle: '便民义集：社区便民免费理发与磨刀义诊',
      status: 'completed',
      hours: 3.0,
      pointsReward: 60,
      signedAt: '2026-07-29 14:20',
    },
    {
      id: 'reg_3',
      activityId: 'act_3',
      userId: 'user_2',
      userName: '李建国',
      userPhone: '139****1234',
      activityTitle: '平安社区：楼道电动车违规停放与消防巡查',
      status: 'registered',
      hours: 2.5,
      pointsReward: 50,
      signedAt: '2026-08-04 09:30',
    },
  ];

  const serviceRecords: ServiceRecord[] = [
    {
      id: 'rec_1',
      userId: 'user_2',
      userName: '李建国',
      userPhone: '139****1234',
      activityId: 'act_3',
      activityTitle: '平安社区：楼道电动车违规停放与消防巡查',
      hours: 2.5,
      pointsEarned: 50,
      proofText: '参与了幸福社区B区3号楼至6号楼的夜间安全巡查，劝导移走违规充电电动车4台，清理占用楼道消防栓通道杂物。',
      status: 'pending',
      createdAt: '2026-08-05 10:00',
    },
    {
      id: 'rec_2',
      userId: 'user_1',
      userName: '张兰英',
      userPhone: '138****5678',
      activityId: 'act_4',
      activityTitle: '便民义集：社区便民免费理发与磨刀义诊',
      hours: 3.0,
      pointsEarned: 60,
      proofText: '负责便民集市现场老年人签到与茶水供应，协助理发师维护现场排队秩序，服务居民超50人次。',
      status: 'approved',
      createdAt: '2026-08-02 12:30',
      reviewedAt: '2026-08-02 15:00',
    },
  ];

  const redemptions: Redemption[] = [
    {
      id: 'red_1',
      code: 'VOL-8821-K9P',
      userId: 'user_1',
      userName: '张兰英',
      userPhone: '138****5678',
      giftId: 'gift_1',
      giftName: '304不锈钢便携保温杯 (500ml)',
      giftImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400',
      pointsCost: 150,
      status: 'pending',
      createdAt: '2026-08-04 16:20',
    },
    {
      id: 'red_2',
      code: 'VOL-6632-M2A',
      userId: 'user_2',
      userName: '李建国',
      userPhone: '139****1234',
      giftId: 'gift_5',
      giftName: '社区环保折叠帆布购物袋',
      giftImage: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&q=80&w=400',
      pointsCost: 30,
      status: 'redeemed',
      createdAt: '2026-08-01 11:10',
      redeemedAt: '2026-08-01 14:30',
      verifierName: '王主任',
    },
  ];

  const pointsHistory: PointsHistoryItem[] = [
    {
      id: 'pts_1',
      userId: 'user_1',
      type: 'spend',
      amount: 150,
      title: '兑换礼品：304不锈钢便携保温杯',
      description: '生成兑换码 [VOL-8821-K9P]，等待现场核销领奖',
      createdAt: '2026-08-04 16:20',
    },
    {
      id: 'pts_2',
      userId: 'user_1',
      type: 'earn',
      amount: 60,
      title: '活动服务达标发放：便民义集',
      description: '志愿时长 3.0 小时审核通过，积分已入账',
      createdAt: '2026-08-02 15:00',
    },
    {
      id: 'pts_3',
      userId: 'user_2',
      type: 'earn',
      amount: 100,
      title: '党员先锋岗奉献积分奖励',
      description: '月度志愿服务突出个人积分奖励',
      createdAt: '2026-08-01 09:00',
    },
    {
      id: 'pts_4',
      userId: 'user_2',
      type: 'spend',
      amount: 30,
      title: '兑换礼品：社区环保折叠帆布购物袋',
      description: '现场成功核销核验 [VOL-6632-M2A]',
      createdAt: '2026-08-01 11:10',
    },
  ];

  const issues: CommunityIssue[] = [
    {
      id: 'issue_1',
      userId: 'user_1',
      userName: '张兰英',
      userPhone: '138****5678',
      userAvatar: '👵',
      userRole: 'resident',
      title: '幸福小区2号楼东侧垃圾投放点垃圾箱满溢散落',
      category: '环境卫生',
      description: '早上发现2号楼东侧的分类垃圾桶盖损坏且厨余垃圾溢出至地面，异味较重，影响居民早起出行，建议及时安排清运并更换新箱盖。',
      images: [
        'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&q=80&w=600'
      ],
      location: '幸福小区2号楼东侧垃圾分类亭',
      locationDetail: '2号楼1单元东侧20米处',
      status: 'resolved',
      pointsReward: 15,
      adminReply: '已指派保洁清运班组于当日上午9:30完成清运消毒，并更换了全新脚踏式垃圾桶盖。感谢张阿姨的细心反馈！',
      replyImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600',
      handledBy: '王主任 (管理员)',
      resolvedAt: '2026-08-04 10:15',
      createdAt: '2026-08-04 08:20',
    },
    {
      id: 'issue_2',
      userId: 'user_2',
      userName: '李建国 (党员)',
      userPhone: '139****1234',
      userAvatar: '👨‍💼',
      userRole: 'party_member',
      title: '3号楼地下车库通道顶灯接触不良闪烁',
      category: '设施破损',
      description: '地下车库下坡转弯处照明灯管损坏，夜间行车视线较暗，存在安全隐患，请物业电工排查修缮。',
      images: [
        'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&q=80&w=600'
      ],
      location: '幸福小区地下车库入口及主通道',
      locationDetail: '地下车库B区负一层拐角处',
      status: 'processing',
      pointsReward: 15,
      adminReply: '网格员已现场核实，工程部师傅已领用备用LED节能灯管，预计今日下午完成更换安装。',
      handledBy: '王主任 (管理员)',
      createdAt: '2026-08-05 19:40',
    },
    {
      id: 'issue_3',
      userId: 'user_3',
      userName: '赵红旗 (党员先锋)',
      userPhone: '137****6789',
      userAvatar: '🌟',
      userRole: 'party_member',
      title: '中心景观凉亭旁木质长椅螺丝松动翘起',
      category: '安全隐患',
      description: '中央小广场休闲长椅有一根木条螺丝脱落翘起，老人和小孩坐下容易划伤衣物或皮肤，建议加固。',
      images: [
        'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&q=80&w=600'
      ],
      location: '幸福社区中央景观公园',
      locationDetail: '紫藤长廊南侧第2把木椅',
      status: 'pending',
      pointsReward: 15,
      createdAt: '2026-08-06 09:15',
    }
  ];

  return {
    users,
    activities,
    gifts,
    registrations,
    serviceRecords,
    redemptions,
    pointsHistory,
    issues,
  };
}

// Initialize cache with default data synchronously
const initData = getInitialProductionData();
cachedUsers = initData.users;
cachedActivities = initData.activities;
cachedGifts = initData.gifts;
cachedRegistrations = initData.registrations;
cachedServiceRecords = initData.serviceRecords;
cachedRedemptions = initData.redemptions;
cachedPointsHistory = initData.pointsHistory;
cachedIssues = initData.issues;

// Broadcast helper
function notifySubscribers() {
  callbacks.users.forEach(cb => cb([...cachedUsers]));
  callbacks.activities.forEach(cb => cb([...cachedActivities]));
  callbacks.gifts.forEach(cb => cb([...cachedGifts]));
  callbacks.registrations.forEach(cb => cb([...cachedRegistrations]));
  callbacks.serviceRecords.forEach(cb => cb([...cachedServiceRecords]));
  callbacks.redemptions.forEach(cb => cb([...cachedRedemptions]));
  callbacks.pointsHistory.forEach(cb => cb([...cachedPointsHistory]));
  callbacks.issues.forEach(cb => cb([...cachedIssues]));
}

// Fetch all from backend Express API
let isFetchingAll = false;
export async function fetchAndSyncAllData(): Promise<boolean> {
  if (isFetchingAll) return false;
  isFetchingAll = true;
  try {
    const res = await fetch('/api/db/all');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && Array.isArray(data.users)) {
      cachedUsers = data.users || [];
      cachedActivities = data.activities || [];
      cachedGifts = data.gifts || [];
      cachedRegistrations = data.registrations || [];
      cachedServiceRecords = data.serviceRecords || [];
      cachedRedemptions = data.redemptions || [];
      cachedPointsHistory = data.pointsHistory || [];
      cachedIssues = data.issues || [];
      notifySubscribers();
      return true;
    }
    return false;
  } catch (err) {
    // Backend fetch failed or network offline; keep cache
    return false;
  } finally {
    isFetchingAll = false;
  }
}

// Auto-sync loop: run immediately and poll every 3.5s for real-time collaboration
if (typeof window !== 'undefined') {
  fetchAndSyncAllData();
  setInterval(() => {
    fetchAndSyncAllData();
  }, 3500);

  window.addEventListener('focus', () => {
    fetchAndSyncAllData();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchAndSyncAllData();
    }
  });
}

// Database Seeding
export async function seedDatabase(force: boolean = false): Promise<boolean> {
  try {
    const res = await fetch('/api/db/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force }),
    });
    const data = await res.json();
    await fetchAndSyncAllData();
    return data.success ?? true;
  } catch (err) {
    const def = getInitialProductionData();
    cachedUsers = def.users;
    cachedActivities = def.activities;
    cachedGifts = def.gifts;
    cachedRegistrations = def.registrations;
    cachedServiceRecords = def.serviceRecords;
    cachedRedemptions = def.redemptions;
    cachedPointsHistory = def.pointsHistory;
    cachedIssues = def.issues;
    notifySubscribers();
    return true;
  }
}

// Reactive Subscriptions
export function subscribeToUsers(callback: (users: User[]) => void) {
  callbacks.users.add(callback);
  callback([...cachedUsers]);
  return () => { callbacks.users.delete(callback); };
}

export function subscribeToActivities(callback: (activities: Activity[]) => void) {
  callbacks.activities.add(callback);
  callback([...cachedActivities]);
  return () => { callbacks.activities.delete(callback); };
}

export function subscribeToGifts(callback: (gifts: Gift[]) => void) {
  callbacks.gifts.add(callback);
  callback([...cachedGifts]);
  return () => { callbacks.gifts.delete(callback); };
}

export function subscribeToRegistrations(callback: (regs: Registration[]) => void) {
  callbacks.registrations.add(callback);
  callback([...cachedRegistrations]);
  return () => { callbacks.registrations.delete(callback); };
}

export function subscribeToServiceRecords(callback: (records: ServiceRecord[]) => void) {
  callbacks.serviceRecords.add(callback);
  callback([...cachedServiceRecords]);
  return () => { callbacks.serviceRecords.delete(callback); };
}

export function subscribeToRedemptions(callback: (reds: Redemption[]) => void) {
  callbacks.redemptions.add(callback);
  callback([...cachedRedemptions]);
  return () => { callbacks.redemptions.delete(callback); };
}

export function subscribeToPointsHistory(callback: (history: PointsHistoryItem[]) => void) {
  callbacks.pointsHistory.add(callback);
  callback([...cachedPointsHistory]);
  return () => { callbacks.pointsHistory.delete(callback); };
}

export function subscribeToIssues(callback: (issues: CommunityIssue[]) => void) {
  callbacks.issues.add(callback);
  callback([...cachedIssues]);
  return () => { callbacks.issues.delete(callback); };
}

// User CRUD Operations
export async function createUser(userData: Partial<User>): Promise<{ success: boolean; data?: User; message?: string }> {
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const result = await res.json();
    if (result.success && result.user) {
      const idx = cachedUsers.findIndex(u => u.id === result.user.id);
      if (idx >= 0) cachedUsers[idx] = result.user;
      else cachedUsers.unshift(result.user);
      callbacks.users.forEach(cb => cb([...cachedUsers]));
      return { success: true, data: result.user };
    }
  } catch (e) {
    console.warn('API createUser fallback:', e);
  }

  // Local fallback
  const newId = 'user_' + Date.now();
  const newUser: User = {
    id: newId,
    name: userData.name || '新居民',
    phone: userData.phone || '13800000000',
    avatar: userData.avatar || (userData.role === 'admin' ? '👮‍♂️' : '👤'),
    role: userData.role || 'resident',
    points: userData.points || 0,
    totalHours: userData.totalHours || 0,
    badge: userData.badge || (userData.role === 'admin' ? '社区管理员' : '社区志愿者'),
    joinedDate: userData.joinedDate || new Date().toISOString().split('T')[0],
    openid: userData.openid,
  };
  cachedUsers.unshift(newUser);
  callbacks.users.forEach(cb => cb([...cachedUsers]));
  return { success: true, data: newUser };
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; message?: string }> {
  const idx = cachedUsers.findIndex(u => u.id === userId);
  if (idx >= 0) {
    cachedUsers[idx] = { ...cachedUsers[idx], ...updates };
    callbacks.users.forEach(cb => cb([...cachedUsers]));
  }

  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    return { success: data.success ?? true, message: data.message };
  } catch (e) {
    return { success: true };
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  cachedUsers = cachedUsers.filter(u => u.id !== userId);
  callbacks.users.forEach(cb => cb([...cachedUsers]));

  try {
    const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    return { success: data.success ?? true, message: data.message };
  } catch (e) {
    return { success: true };
  }
}

export async function setUserRole(userId: string, role: UserRole): Promise<{ success: boolean; message?: string }> {
  const badge = role === 'admin' ? '社区管理员' : role === 'party_member' ? '党员先锋志愿者' : '社区志愿者';
  return updateUser(userId, { role, badge });
}

export async function adjustUserPoints(
  userId: string, 
  pointsDelta: number, 
  hoursDelta: number, 
  reason: string, 
  adminName: string
): Promise<{ success: boolean; message?: string }> {
  const user = cachedUsers.find(u => u.id === userId);
  if (user) {
    user.points = Math.max(0, user.points + pointsDelta);
    user.totalHours = Math.max(0, Number((user.totalHours + hoursDelta).toFixed(1)));
    callbacks.users.forEach(cb => cb([...cachedUsers]));

    if (pointsDelta !== 0) {
      const ptsItem: PointsHistoryItem = {
        id: 'pts_' + Date.now(),
        userId: user.id,
        type: pointsDelta > 0 ? 'earn' : 'spend',
        amount: Math.abs(pointsDelta),
        title: `管理员人工调整积分 (${pointsDelta > 0 ? '+' : ''}${pointsDelta} 分)`,
        description: `操作员【${adminName}】调整: ${reason || '无说明'}`,
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      };
      cachedPointsHistory.unshift(ptsItem);
      callbacks.pointsHistory.forEach(cb => cb([...cachedPointsHistory]));
    }
  }

  try {
    const res = await fetch(`/api/users/${userId}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pointsDelta, hoursDelta, reason, adminName }),
    });
    const data = await res.json();
    return { success: data.success ?? true, message: data.message };
  } catch (e) {
    return { success: true, message: '积分调整已生效' };
  }
}

export async function updateUserPointsAndHours(userId: string, pointsDelta: number, hoursDelta: number) {
  const user = cachedUsers.find(u => u.id === userId);
  if (user) {
    user.points = Math.max(0, user.points + pointsDelta);
    user.totalHours = Math.max(0, user.totalHours + hoursDelta);
    callbacks.users.forEach(cb => cb([...cachedUsers]));
  }
  fetch(`/api/users/${userId}/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pointsDelta, hoursDelta, reason: '系统自动结算', adminName: '系统' }),
  }).catch(() => {});
}

// Activity Operations
export async function createActivity(activityData: Omit<Activity, 'id' | 'createdAt' | 'signedCount'>): Promise<string> {
  const tempId = 'act_' + Date.now();
  const newAct: Activity = {
    ...activityData,
    id: tempId,
    signedCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
  };

  cachedActivities.unshift(newAct);
  callbacks.activities.forEach(cb => cb([...cachedActivities]));

  try {
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityData),
    });
    const data = await res.json();
    if (data.activity && data.activity.id) {
      newAct.id = data.activity.id;
      return data.activity.id;
    }
  } catch (e) {
    console.warn('API createActivity error:', e);
  }
  return tempId;
}

export async function updateActivity(activityId: string, updates: Partial<Activity>) {
  const idx = cachedActivities.findIndex(a => a.id === activityId);
  if (idx >= 0) {
    cachedActivities[idx] = { ...cachedActivities[idx], ...updates };
    callbacks.activities.forEach(cb => cb([...cachedActivities]));
  }
  fetch(`/api/activities/${activityId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }).catch(() => {});
}

export async function deleteActivity(activityId: string) {
  cachedActivities = cachedActivities.filter(a => a.id !== activityId);
  callbacks.activities.forEach(cb => cb([...cachedActivities]));
  fetch(`/api/activities/${activityId}`, { method: 'DELETE' }).catch(() => {});
}

export async function registerForActivity(
  arg1: string | User, 
  arg2: string | Activity, 
  userName?: string, 
  userPhone?: string
): Promise<{ success: boolean; message: string; registration?: Registration }> {
  let activityId: string;
  let userId: string;
  let uName: string;
  let uPhone: string;

  if (typeof arg1 === 'object' && typeof arg2 === 'object') {
    // Called as: registerForActivity(currentUser, activity)
    userId = arg1.id;
    uName = arg1.name;
    uPhone = arg1.phone;
    activityId = arg2.id;
  } else {
    // Called as: registerForActivity(activityId, userId, userName, userPhone)
    activityId = arg1 as string;
    userId = arg2 as string;
    uName = userName || '';
    uPhone = userPhone || '';
  }

  try {
    const res = await fetch(`/api/activities/${activityId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userName: uName, userPhone: uPhone }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchAndSyncAllData();
    }
    return data;
  } catch (e) {
    // Local fallback
    const act = cachedActivities.find(a => a.id === activityId);
    if (!act) return { success: false, message: '活动不存在' };
    const reg: Registration = {
      id: 'reg_' + Date.now(),
      activityId,
      userId,
      userName: uName,
      userPhone: uPhone,
      activityTitle: act.title,
      status: 'registered',
      hours: act.hours,
      pointsReward: act.pointsReward,
      signedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    };
    cachedRegistrations.unshift(reg);
    act.signedCount += 1;
    callbacks.registrations.forEach(cb => cb([...cachedRegistrations]));
    callbacks.activities.forEach(cb => cb([...cachedActivities]));
    return { success: true, message: '报名成功！', registration: reg };
  }
}

// Service Record Operations
export async function submitServiceRecord(recordData: Omit<ServiceRecord, 'id' | 'status' | 'createdAt'>): Promise<string> {
  const tempId = 'rec_' + Date.now();
  const newRec: ServiceRecord = {
    ...recordData,
    id: tempId,
    status: 'pending',
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  };
  cachedServiceRecords.unshift(newRec);
  callbacks.serviceRecords.forEach(cb => cb([...cachedServiceRecords]));

  try {
    const res = await fetch('/api/service-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recordData),
    });
    const data = await res.json();
    if (data.record && data.record.id) {
      newRec.id = data.record.id;
      return data.record.id;
    }
  } catch (e) {
    console.warn('API submitServiceRecord error:', e);
  }
  return tempId;
}

export async function auditServiceRecord(
  recordId: string, 
  status: 'approved' | 'rejected', 
  rejectReason?: string,
  _auditorName?: string
) {
  try {
    const res = await fetch(`/api/service-records/${recordId}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: status === 'approved', rejectReason }),
    });
    const data = await res.json();
    await fetchAndSyncAllData();
    return data;
  } catch (e) {
    const rec = cachedServiceRecords.find(r => r.id === recordId);
    if (rec) {
      rec.status = status;
      rec.rejectReason = rejectReason;
      rec.reviewedAt = new Date().toLocaleString('zh-CN', { hour12: false });
      if (status === 'approved') {
        const u = cachedUsers.find(user => user.id === rec.userId);
        if (u) {
          u.points += rec.pointsEarned;
          u.totalHours += rec.hours;
          callbacks.users.forEach(cb => cb([...cachedUsers]));
        }
      }
      callbacks.serviceRecords.forEach(cb => cb([...cachedServiceRecords]));
    }
  }
}

// Gift & Redemption Operations
export async function createGift(giftData: Omit<Gift, 'id' | 'createdAt'>): Promise<string> {
  const tempId = 'gift_' + Date.now();
  const newGift: Gift = {
    ...giftData,
    id: tempId,
    createdAt: new Date().toISOString().split('T')[0],
  };
  cachedGifts.unshift(newGift);
  callbacks.gifts.forEach(cb => cb([...cachedGifts]));

  try {
    const res = await fetch('/api/gifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(giftData),
    });
    const data = await res.json();
    if (data.gift && data.gift.id) {
      newGift.id = data.gift.id;
      return data.gift.id;
    }
  } catch (e) {
    console.warn('API createGift error:', e);
  }
  return tempId;
}

export async function updateGift(giftId: string, updates: Partial<Gift>) {
  const idx = cachedGifts.findIndex(g => g.id === giftId);
  if (idx >= 0) {
    cachedGifts[idx] = { ...cachedGifts[idx], ...updates };
    callbacks.gifts.forEach(cb => cb([...cachedGifts]));
  }
  fetch(`/api/gifts/${giftId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }).catch(() => {});
}

export async function redeemGift(
  arg1: string | User, 
  arg2: string | Gift
): Promise<{ success: boolean; message: string; redemption?: Redemption }> {
  const userId = typeof arg1 === 'object' ? arg1.id : arg1;
  const giftId = typeof arg2 === 'object' ? arg2.id : arg2;
  try {
    const res = await fetch(`/api/gifts/${giftId}/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchAndSyncAllData();
    }
    return data;
  } catch (e: any) {
    return { success: false, message: '兑换失败: ' + e.message };
  }
}

export async function verifyRedemptionCode(
  code: string, 
  verifierName: string
): Promise<{ success: boolean; message: string; redemption?: Redemption }> {
  try {
    const res = await fetch('/api/redemptions/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, verifierName }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchAndSyncAllData();
    }
    return data;
  } catch (e: any) {
    return { success: false, message: '核销异常: ' + e.message };
  }
}

// WeChat Login & Integration Handlers
export async function wechatDirectAuth(customName?: string): Promise<WechatLoginResponse> {
  try {
    const isWechatBrowser = typeof navigator !== 'undefined' && /micromessenger/i.test(navigator.userAgent);
    if (isWechatBrowser) {
      const cleanUri = window.location.href.split('?')[0];
      const authUrlRes = await fetch(`/api/wechat/auth-url?redirect_uri=${encodeURIComponent(cleanUri)}`);
      const data = await authUrlRes.json();
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
        return { success: true, message: '正在调起微信官方授权页面...' };
      }
    }

    let savedOpenid = typeof localStorage !== 'undefined' ? localStorage.getItem('wechat_openid') : null;
    if (!savedOpenid) {
      const rand = Math.floor(1000 + Math.random() * 9000);
      savedOpenid = `wx_openid_${Date.now().toString(36)}_${rand}`;
      if (typeof localStorage !== 'undefined') localStorage.setItem('wechat_openid', savedOpenid);
    }

    const res = await fetch('/api/wechat/mock-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        openid: savedOpenid,
        customName: customName || undefined,
        avatarUrl: '👤',
      }),
    });
    const data = await res.json();
    if (data.user) {
      const idx = cachedUsers.findIndex(u => u.id === data.user.id);
      if (idx >= 0) cachedUsers[idx] = data.user;
      else cachedUsers.unshift(data.user);
      callbacks.users.forEach(cb => cb([...cachedUsers]));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('logged_in_user_id', data.user.id);
        localStorage.setItem('wechat_openid', data.user.openid || savedOpenid);
      }
    }
    return data;
  } catch (err: any) {
    return { success: false, message: '微信登录异常: ' + err.message };
  }
}

// Check Tencent CloudBase (微信云托管) Native Gateway Automatic Header Authentication
export async function checkTcbAutoAuth(): Promise<{ success: boolean; hasTcbHeader: boolean; user?: User; token?: string; openid?: string }> {
  try {
    const res = await fetch('/api/wechat/tcb-auto-auth');
    const data = await res.json();
    if (data.success && data.user) {
      const idx = cachedUsers.findIndex(u => u.id === data.user.id);
      if (idx >= 0) cachedUsers[idx] = data.user;
      else cachedUsers.unshift(data.user);
      callbacks.users.forEach(cb => cb([...cachedUsers]));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('logged_in_user_id', data.user.id);
        if (data.openid) localStorage.setItem('wechat_openid', data.openid);
        localStorage.setItem('cached_user_profile', JSON.stringify(data.user));
      }
    }
    return data;
  } catch (e) {
    return { success: false, hasTcbHeader: false };
  }
}

export async function getWechatAuthUrl(redirectUri: string, scope: string = 'snsapi_userinfo', state: string = 'STATE'): Promise<{ success: boolean; authUrl: string; appId: string }> {
  try {
    const res = await fetch(`/api/wechat/oauth/url?redirectUri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`);
    const data = await res.json();
    return data;
  } catch (e) {
    const appId = 'wx7fd578a4010d96c7';
    const encodedUri = encodeURIComponent(redirectUri);
    return {
      success: true,
      appId,
      authUrl: `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodedUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
    };
  }
}

export async function wechatMockLogin(openid: string, customName?: string, avatarUrl?: string): Promise<WechatLoginResponse> {
  try {
    const res = await fetch('/api/wechat/mock-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ openid, customName, avatarUrl }),
    });
    const data = await res.json();
    if (data.user) {
      const idx = cachedUsers.findIndex(u => u.id === data.user.id);
      if (idx >= 0) cachedUsers[idx] = data.user;
      else cachedUsers.unshift(data.user);
      callbacks.users.forEach(cb => cb([...cachedUsers]));
    }
    return data;
  } catch (err: any) {
    return { success: false, message: '微信登录失败: ' + err.message };
  }
}

// WeChat QR Code Scan-to-Login Helpers
export async function createScanTicket(): Promise<{ success: boolean; ticket?: string; qrUrl?: string; expireSeconds?: number; message?: string }> {
  try {
    const ticket = `scan_tk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const origin = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : 'https://jifen-295865-11-1301488547.sh.run.tcloudbase.com';
    const qrUrl = `${origin}/?scan_ticket=${ticket}`;

    fetch('/api/wechat/scan/create-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket }),
    }).catch(() => {});

    return {
      success: true,
      ticket,
      qrUrl,
      expireSeconds: 300,
    };
  } catch (e: any) {
    return { success: false, message: '生成扫码凭证失败: ' + e.message };
  }
}

export function listenScanTicket(
  ticket: string, 
  callback: (session: { status: 'pending' | 'scanned' | 'confirmed' | 'expired'; user?: User; token?: string }) => void
) {
  let isStopped = false;
  const pollTimer = setInterval(async () => {
    if (isStopped) return;
    try {
      const res = await checkScanStatus(ticket);
      if (res.success) {
        callback({
          status: res.status,
          user: res.user,
          token: res.token,
        });
        if (res.status === 'confirmed' || res.status === 'expired') {
          clearInterval(pollTimer);
        }
      }
    } catch (e) {
      // ignore transient poll error
    }
  }, 1500);

  return () => {
    isStopped = true;
    clearInterval(pollTimer);
  };
}

export async function checkScanStatus(ticket: string): Promise<{ success: boolean; status: 'pending' | 'scanned' | 'confirmed' | 'expired'; user?: User; token?: string; message?: string }> {
  try {
    const res = await fetch(`/api/wechat/scan/status?ticket=${encodeURIComponent(ticket)}`);
    const data = await res.json();
    if (data.user) {
      const idx = cachedUsers.findIndex(u => u.id === data.user.id);
      if (idx >= 0) cachedUsers[idx] = data.user;
      else cachedUsers.unshift(data.user);
      callbacks.users.forEach(cb => cb([...cachedUsers]));
    }
    return data;
  } catch (e: any) {
    return { success: false, status: 'pending', message: '网络轮询异常' };
  }
}

export async function notifyScanTicket(ticket: string): Promise<{ success: boolean; status?: string }> {
  try {
    const res = await fetch('/api/wechat/scan/scan-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket }),
    });
    return await res.json();
  } catch (e) {
    return { success: true, status: 'scanned' };
  }
}

export async function confirmScanLogin(params: { ticket: string; openid?: string; name?: string; phone?: string; avatarUrl?: string; userId?: string }): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
  try {
    const res = await fetch('/api/wechat/scan/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (data.user) {
      const idx = cachedUsers.findIndex(u => u.id === data.user.id);
      if (idx >= 0) cachedUsers[idx] = data.user;
      else cachedUsers.unshift(data.user);
      callbacks.users.forEach(cb => cb([...cachedUsers]));
    }
    return data;
  } catch (e: any) {
    return { success: false, message: '确认授权失败: ' + e.message };
  }
}

export async function mockConfirmScanLogin(ticket: string, customName?: string): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
  try {
    const res = await fetch('/api/wechat/scan/mock-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket, customName }),
    });
    const data = await res.json();
    if (data.user) {
      const idx = cachedUsers.findIndex(u => u.id === data.user.id);
      if (idx >= 0) cachedUsers[idx] = data.user;
      else cachedUsers.unshift(data.user);
      callbacks.users.forEach(cb => cb([...cachedUsers]));
    }
    return data;
  } catch (e: any) {
    return { success: false, message: '模拟扫码授权失败: ' + e.message };
  }
}

export async function wechatLogin(code?: string, openidOrData?: { name?: string; avatar?: string; openid?: string } | string): Promise<WechatLoginResponse> {
  try {
    let payload: any = {};
    if (typeof openidOrData === 'string') {
      if (openidOrData.startsWith('wx_') || openidOrData.startsWith('mock_')) {
        payload.openid = openidOrData;
      } else {
        payload.name = openidOrData;
      }
    } else if (openidOrData) {
      payload = openidOrData;
    }

    const res = await fetch('/api/wechat/oauth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, ...payload }),
    });
    const data = await res.json();
    if (data.user) {
      const idx = cachedUsers.findIndex(u => u.id === data.user.id);
      if (idx >= 0) cachedUsers[idx] = data.user;
      else cachedUsers.unshift(data.user);
      callbacks.users.forEach(cb => cb([...cachedUsers]));
    }
    return data;
  } catch (err: any) {
    return { success: false, message: '微信登录失败: ' + err.message };
  }
}

export async function miniProgramLogin(code?: string): Promise<{ success: boolean; openid?: string; sessionKey?: string; unionid?: string; user?: User; isNew?: boolean; message?: string }> {
  try {
    const res = await fetch('/api/wechat/miniprogram/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code || 'mock_mp_code_' + Math.random().toString(36).slice(2, 8) }),
    });
    const data = await res.json();
    if (data.user) {
      const idx = cachedUsers.findIndex(u => u.id === data.user.id);
      if (idx >= 0) cachedUsers[idx] = data.user;
      else cachedUsers.unshift(data.user);
      callbacks.users.forEach(cb => cb([...cachedUsers]));
    }
    return data;
  } catch (err: any) {
    return { success: false, message: '小程序登录失败: ' + err.message };
  }
}

export async function miniProgramGetPhoneNumber(userIdOrCode?: string, phoneOrEncryptedData?: string, iv?: string): Promise<{ success: boolean; phoneNumber?: string; purePhoneNumber?: string; countryCode?: string; user?: User; message?: string }> {
  try {
    const res = await fetch('/api/wechat/miniprogram/phone-number', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userIdOrCode, phoneNumber: phoneOrEncryptedData, code: userIdOrCode, encryptedData: phoneOrEncryptedData, iv }),
    });
    const data = await res.json();
    if (data.user) {
      const idx = cachedUsers.findIndex(u => u.id === data.user.id);
      if (idx >= 0) cachedUsers[idx] = data.user;
      else cachedUsers.unshift(data.user);
      callbacks.users.forEach(cb => cb([...cachedUsers]));
    }
    return data;
  } catch (err: any) {
    return { success: false, message: '获取手机号失败: ' + err.message };
  }
}

export async function miniProgramExportSource(): Promise<{ success: boolean; files?: Record<string, string>; message?: string }> {
  try {
    const res = await fetch('/api/wechat/miniprogram/export-source');
    return await res.json();
  } catch (err: any) {
    return { success: false, message: '导出源码包失败: ' + err.message };
  }
}

export async function miniProgramSubscribeMessage(templateId: string, title: string, content: string, userId: string): Promise<{ success: boolean; message?: string; messageId?: string }> {
  try {
    const res = await fetch('/api/wechat/miniprogram/subscribe-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, title, content, userId }),
    });
    const data = await res.json();
    return {
      ...data,
      message: data.message || `模拟订阅消息推送成功 (模板ID: ${templateId})`,
    };
  } catch (e: any) {
    return { success: true, message: `模拟订阅消息推送已发送 (模板ID: ${templateId})` };
  }
}

export async function sendWechatTemplateMessage(templateId: string, title: string, content: string, userId: string): Promise<{ success: boolean; messageId?: string }> {
  return miniProgramSubscribeMessage(templateId, title, content, userId);
}

// Community Issues (随手拍) Actions
export async function submitCommunityIssue(issueData: Omit<CommunityIssue, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; data?: CommunityIssue; message?: string }> {
  try {
    const res = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issueData),
    });
    const result = await res.json();
    if (result.success && result.issue) {
      cachedIssues.unshift(result.issue);
      callbacks.issues.forEach(cb => cb([...cachedIssues]));
      return { success: true, data: result.issue, message: result.message || '随手拍工单已提交到网格中心！' };
    }
  } catch (err: any) {
    console.warn('API submitCommunityIssue fallback:', err);
  }

  // Fallback
  const id = 'issue_' + Date.now();
  const newIssue: CommunityIssue = {
    ...issueData,
    id,
    status: 'pending',
    pointsReward: issueData.pointsReward || 15,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
  cachedIssues.unshift(newIssue);
  callbacks.issues.forEach(cb => cb([...cachedIssues]));
  return { success: true, data: newIssue, message: '随手拍工单已提交到网格中心！' };
}

export async function handleCommunityIssue(
  id: string, 
  status: IssueStatus, 
  adminReply: string, 
  pointsReward: number, 
  replyImage?: string,
  handledBy?: string
): Promise<{ success: boolean; message?: string; issue?: CommunityIssue }> {
  try {
    const res = await fetch(`/api/issues/${id}/handle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminReply, pointsReward, replyImage, handledBy }),
    });
    const result = await res.json();
    await fetchAndSyncAllData();
    return result;
  } catch (err: any) {
    // Local fallback
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const currentIssue = cachedIssues.find(i => i.id === id);
    if (!currentIssue) return { success: false, message: '未找到指定工单' };

    const updates: Partial<CommunityIssue> = {
      status,
      adminReply,
      pointsReward,
      replyImage: replyImage || '',
      handledBy: handledBy || '社区网格办',
    };
    if (status === 'resolved') updates.resolvedAt = nowStr;

    Object.assign(currentIssue, updates);
    callbacks.issues.forEach(cb => cb([...cachedIssues]));
    return { success: true, message: '工单处理成功', issue: currentIssue };
  }
}

export async function deleteCommunityIssue(id: string): Promise<{ success: boolean; message?: string }> {
  cachedIssues = cachedIssues.filter(i => i.id !== id);
  callbacks.issues.forEach(cb => cb([...cachedIssues]));

  try {
    const res = await fetch(`/api/issues/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return { success: data.success ?? true, message: data.message };
  } catch (err: any) {
    return { success: true, message: '已成功删除随手拍工单' };
  }
}
