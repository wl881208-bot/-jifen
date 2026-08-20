import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  writeBatch, 
  query, 
  orderBy,
  runTransaction,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { getPublicAppUrl } from './appConfig';
import { 
  User, 
  Activity, 
  Gift, 
  ServiceRecord, 
  Redemption, 
  Registration, 
  PointsHistoryItem, 
  CommunityIssue, 
  IssueStatus,
  WechatLoginResponse, 
  UserRole 
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
  issues: Set<(data: CommunityIssue[]) => void>;
};

const callbacks: CallbacksStore = {
  users: new Set(),
  activities: new Set(),
  gifts: new Set(),
  registrations: new Set(),
  serviceRecords: new Set(),
  redemptions: new Set(),
  pointsHistory: new Set(),
  issues: new Set(),
};

// Initial Production Seed Datasets
const initialProductionSeed = getInitialProductionData();

// Cached In-Memory State for Instant Synchronous Queries (Preloaded for instant load in domestic network environments)
let cachedUsers: User[] = [...initialProductionSeed.users];
let cachedActivities: Activity[] = [...initialProductionSeed.activities];
let cachedGifts: Gift[] = [...initialProductionSeed.gifts];
let cachedRegistrations: Registration[] = [...initialProductionSeed.registrations];
let cachedServiceRecords: ServiceRecord[] = [...initialProductionSeed.serviceRecords];
let cachedRedemptions: Redemption[] = [...initialProductionSeed.redemptions];
let cachedPointsHistory: PointsHistoryItem[] = [...initialProductionSeed.pointsHistory];
let cachedIssues: CommunityIssue[] = [...initialProductionSeed.issues];

let isFirestoreInitialized = false;
let isSeeding = false;

// Initial Production Seed Datasets
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

  return { users, activities, gifts, registrations, serviceRecords, redemptions, pointsHistory, issues };
}

// Ensure Production Firestore Collections are seeded
async function checkAndSeedFirestore(force: boolean = false) {
  if (isSeeding) return;
  try {
    isSeeding = true;
    const usersSnap = await getDocs(collection(db, 'users'));
    if (force || usersSnap.empty) {
      console.log('[Firestore] Seeding production data into Firestore collections...');
      const seedData = getInitialProductionData();
      const batch = writeBatch(db);

      // Seed users
      for (const u of seedData.users) {
        batch.set(doc(db, 'users', u.id), u);
      }
      // Seed activities
      for (const a of seedData.activities) {
        batch.set(doc(db, 'activities', a.id), a);
      }
      // Seed gifts
      for (const g of seedData.gifts) {
        batch.set(doc(db, 'gifts', g.id), g);
      }
      // Seed registrations
      for (const r of seedData.registrations) {
        batch.set(doc(db, 'registrations', r.id), r);
      }
      // Seed service_records
      for (const s of seedData.serviceRecords) {
        batch.set(doc(db, 'service_records', s.id), s);
      }
      // Seed redemptions
      for (const red of seedData.redemptions) {
        batch.set(doc(db, 'redemptions', red.id), red);
      }
      // Seed points_history
      for (const p of seedData.pointsHistory) {
        batch.set(doc(db, 'points_history', p.id), p);
      }
      // Seed issues
      for (const iss of seedData.issues) {
        batch.set(doc(db, 'issues', iss.id), iss);
      }

      await batch.commit();
      console.log('[Firestore] Production Firestore database seeded successfully!');
    }
  } catch (err) {
    console.warn('[Firestore] Error during check/seed:', err);
  } finally {
    isSeeding = false;
  }
}

// Initialize Real-time Firestore Listeners
function initFirestoreSync() {
  if (isFirestoreInitialized) return;
  isFirestoreInitialized = true;

  checkAndSeedFirestore();

  // Users listener
  onSnapshot(collection(db, 'users'), (snapshot) => {
    const list: User[] = [];
    snapshot.forEach(doc => list.push({ ...(doc.data() as User), id: doc.id }));
    cachedUsers = list;
    callbacks.users.forEach(cb => cb(list));
  }, (err) => {
    console.warn('Firestore users snapshot error:', err);
    fallbackToBackendApi();
  });

  // Activities listener
  onSnapshot(collection(db, 'activities'), (snapshot) => {
    const list: Activity[] = [];
    snapshot.forEach(doc => list.push({ ...(doc.data() as Activity), id: doc.id }));
    cachedActivities = list;
    callbacks.activities.forEach(cb => cb(list));
  }, (err) => {
    console.warn('Firestore activities snapshot error:', err);
  });

  // Gifts listener
  onSnapshot(collection(db, 'gifts'), (snapshot) => {
    const list: Gift[] = [];
    snapshot.forEach(doc => list.push({ ...(doc.data() as Gift), id: doc.id }));
    cachedGifts = list;
    callbacks.gifts.forEach(cb => cb(list));
  }, (err) => {
    console.warn('Firestore gifts snapshot error:', err);
  });

  // Registrations listener
  onSnapshot(collection(db, 'registrations'), (snapshot) => {
    const list: Registration[] = [];
    snapshot.forEach(doc => list.push({ ...(doc.data() as Registration), id: doc.id }));
    cachedRegistrations = list;
    callbacks.registrations.forEach(cb => cb(list));
  }, (err) => {
    console.warn('Firestore registrations snapshot error:', err);
  });

  // Service records listener
  onSnapshot(collection(db, 'service_records'), (snapshot) => {
    const list: ServiceRecord[] = [];
    snapshot.forEach(doc => list.push({ ...(doc.data() as ServiceRecord), id: doc.id }));
    cachedServiceRecords = list;
    callbacks.serviceRecords.forEach(cb => cb(list));
  }, (err) => {
    console.warn('Firestore service_records snapshot error:', err);
  });

  // Redemptions listener
  onSnapshot(collection(db, 'redemptions'), (snapshot) => {
    const list: Redemption[] = [];
    snapshot.forEach(doc => list.push({ ...(doc.data() as Redemption), id: doc.id }));
    cachedRedemptions = list;
    callbacks.redemptions.forEach(cb => cb(list));
  }, (err) => {
    console.warn('Firestore redemptions snapshot error:', err);
  });

  // Points history listener
  onSnapshot(collection(db, 'points_history'), (snapshot) => {
    const list: PointsHistoryItem[] = [];
    snapshot.forEach(doc => list.push({ ...(doc.data() as PointsHistoryItem), id: doc.id }));
    cachedPointsHistory = list;
    callbacks.pointsHistory.forEach(cb => cb(list));
  }, (err) => {
    console.warn('Firestore points_history snapshot error:', err);
  });

  // Issues listener
  onSnapshot(collection(db, 'issues'), (snapshot) => {
    const list: CommunityIssue[] = [];
    snapshot.forEach(doc => list.push({ ...(doc.data() as CommunityIssue), id: doc.id }));
    cachedIssues = list;
    callbacks.issues.forEach(cb => cb(list));
  }, (err) => {
    console.warn('Firestore issues snapshot error:', err);
  });
}

// Fallback helper to sync with backend API if needed
async function fallbackToBackendApi() {
  try {
    const res = await fetch('/api/db/all');
    if (!res.ok) return;
    const data = await res.json();
    if (data.users) { cachedUsers = data.users; callbacks.users.forEach(cb => cb(data.users)); }
    if (data.activities) { cachedActivities = data.activities; callbacks.activities.forEach(cb => cb(data.activities)); }
    if (data.gifts) { cachedGifts = data.gifts; callbacks.gifts.forEach(cb => cb(data.gifts)); }
    if (data.registrations) { cachedRegistrations = data.registrations; callbacks.registrations.forEach(cb => cb(data.registrations)); }
    if (data.serviceRecords) { cachedServiceRecords = data.serviceRecords; callbacks.serviceRecords.forEach(cb => cb(data.serviceRecords)); }
    if (data.redemptions) { cachedRedemptions = data.redemptions; callbacks.redemptions.forEach(cb => cb(data.redemptions)); }
    if (data.pointsHistory) { cachedPointsHistory = data.pointsHistory; callbacks.pointsHistory.forEach(cb => cb(data.pointsHistory)); }
    if (data.issues) { cachedIssues = data.issues; callbacks.issues.forEach(cb => cb(data.issues)); }
  } catch (e) {
    console.warn('Fallback sync warning:', e);
  }
}

/**
 * Seeds or resets database with production data
 */
export async function seedDatabase(force: boolean = false): Promise<boolean> {
  try {
    await checkAndSeedFirestore(force);
    await fetch('/api/db/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force }),
    });
    return true;
  } catch (err) {
    console.error('Seed database error:', err);
    return false;
  }
}

// Subscription Hooks
export function subscribeToUsers(callback: (users: User[]) => void) {
  callbacks.users.add(callback);
  initFirestoreSync();
  if (cachedUsers.length > 0) callback(cachedUsers);
  return () => { callbacks.users.delete(callback); };
}

export function subscribeToActivities(callback: (activities: Activity[]) => void) {
  callbacks.activities.add(callback);
  initFirestoreSync();
  if (cachedActivities.length > 0) callback(cachedActivities);
  return () => { callbacks.activities.delete(callback); };
}

export function subscribeToGifts(callback: (gifts: Gift[]) => void) {
  callbacks.gifts.add(callback);
  initFirestoreSync();
  if (cachedGifts.length > 0) callback(cachedGifts);
  return () => { callbacks.gifts.delete(callback); };
}

export function subscribeToRegistrations(callback: (regs: Registration[]) => void) {
  callbacks.registrations.add(callback);
  initFirestoreSync();
  if (cachedRegistrations.length > 0) callback(cachedRegistrations);
  return () => { callbacks.registrations.delete(callback); };
}

export function subscribeToServiceRecords(callback: (records: ServiceRecord[]) => void) {
  callbacks.serviceRecords.add(callback);
  initFirestoreSync();
  if (cachedServiceRecords.length > 0) callback(cachedServiceRecords);
  return () => { callbacks.serviceRecords.delete(callback); };
}

export function subscribeToRedemptions(callback: (reds: Redemption[]) => void) {
  callbacks.redemptions.add(callback);
  initFirestoreSync();
  if (cachedRedemptions.length > 0) callback(cachedRedemptions);
  return () => { callbacks.redemptions.delete(callback); };
}

export function subscribeToPointsHistory(callback: (history: PointsHistoryItem[]) => void) {
  callbacks.pointsHistory.add(callback);
  initFirestoreSync();
  if (cachedPointsHistory.length > 0) callback(cachedPointsHistory);
  return () => { callbacks.pointsHistory.delete(callback); };
}

export function subscribeToIssues(callback: (issues: CommunityIssue[]) => void) {
  callbacks.issues.add(callback);
  initFirestoreSync();
  if (cachedIssues.length > 0) callback(cachedIssues);
  return () => { callbacks.issues.delete(callback); };
}

// User Actions
export async function createUser(userData: Partial<User>): Promise<{ success: boolean; data?: User; message?: string }> {
  try {
    const id = userData.id || 'user_' + Date.now();
    const newUser: User = {
      id,
      name: userData.name || '新居民',
      phone: userData.phone || '138****0000',
      avatar: userData.avatar || '👤',
      role: userData.role || 'resident',
      points: userData.points ?? 50,
      totalHours: userData.totalHours ?? 0,
      badge: userData.badge || '社区新居民',
      joinedDate: userData.joinedDate || new Date().toISOString().split('T')[0],
      openid: userData.openid || ('openid_' + Date.now()),
    };

    await setDoc(doc(db, 'users', id), newUser);
    fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) }).catch(() => {});
    return { success: true, data: newUser };
  } catch (err: any) {
    return { success: false, message: '创建用户失败: ' + err.message };
  }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; message?: string }> {
  try {
    await updateDoc(doc(db, 'users', userId), updates);
    fetch(`/api/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) }).catch(() => {});
    return { success: true };
  } catch (err: any) {
    return { success: false, message: '更新用户失败: ' + err.message };
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteDoc(doc(db, 'users', userId));
    fetch(`/api/users/${userId}`, { method: 'DELETE' }).catch(() => {});
    return { success: true };
  } catch (err: any) {
    return { success: false, message: '删除用户失败: ' + err.message };
  }
}

export async function setUserRole(userId: string, role: UserRole): Promise<{ success: boolean; message?: string }> {
  try {
    let badge = '社区热心居民';
    if (role === 'party_member') badge = '党员先锋志愿者';
    if (role === 'admin') badge = '社区党群管理者';

    await updateDoc(doc(db, 'users', userId), { role, badge });
    fetch(`/api/users/${userId}/role`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) }).catch(() => {});
    return { success: true };
  } catch (err: any) {
    return { success: false, message: '设置权限失败: ' + err.message };
  }
}

export async function adjustUserPoints(
  userId: string, 
  pointsDelta: number, 
  hoursDelta: number, 
  reason: string, 
  adminName: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return { success: false, message: '用户不存在' };

    const user = userSnap.data() as User;
    const newPoints = Math.max(0, (user.points || 0) + pointsDelta);
    const newHours = Math.max(0, (user.totalHours || 0) + hoursDelta);

    await updateDoc(userRef, { points: newPoints, totalHours: newHours });

    if (pointsDelta !== 0) {
      const ptsId = 'pts_' + Date.now();
      const ptsItem: PointsHistoryItem = {
        id: ptsId,
        userId,
        type: pointsDelta > 0 ? 'earn' : 'spend',
        amount: Math.abs(pointsDelta),
        title: pointsDelta > 0 ? '管理人工调增积分' : '管理人工调减积分',
        description: `管理员[${adminName}]调整: ${reason} (时长+${hoursDelta}h)`,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      await setDoc(doc(db, 'points_history', ptsId), ptsItem);
    }

    fetch(`/api/users/${userId}/adjust`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pointsDelta, hoursDelta, reason, adminName }) }).catch(() => {});
    return { success: true };
  } catch (err: any) {
    return { success: false, message: '积分工时调整失败: ' + err.message };
  }
}

export async function updateUserPointsAndHours(userId: string, pointsDelta: number, hoursDelta: number) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const user = userSnap.data() as User;
      await updateDoc(userRef, {
        points: Math.max(0, (user.points || 0) + pointsDelta),
        totalHours: Math.max(0, (user.totalHours || 0) + hoursDelta),
      });
    }
    fetch('/api/users/points-hours', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, pointsDelta, hoursDelta }) }).catch(() => {});
  } catch (e) {
    console.warn('updateUserPointsAndHours error:', e);
  }
}

// Activity Actions
export async function createActivity(activityData: Omit<Activity, 'id' | 'createdAt' | 'signedCount'>): Promise<string> {
  const id = 'act_' + Date.now();
  const newActivity: Activity = {
    ...activityData,
    id,
    signedCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
  };
  await setDoc(doc(db, 'activities', id), newActivity);
  fetch('/api/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(activityData) }).catch(() => {});
  return id;
}

export async function updateActivity(activityId: string, updates: Partial<Activity>) {
  await updateDoc(doc(db, 'activities', activityId), updates);
  fetch(`/api/activities/${activityId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) }).catch(() => {});
}

export async function deleteActivity(activityId: string) {
  await deleteDoc(doc(db, 'activities', activityId));
  fetch(`/api/activities/${activityId}`, { method: 'DELETE' }).catch(() => {});
}

export async function registerForActivity(
  user: User, 
  activity: Activity
): Promise<{ success: boolean; message: string }> {
  try {
    const existing = cachedRegistrations.find(r => r.activityId === activity.id && r.userId === user.id && r.status !== 'cancelled');
    if (existing) {
      return { success: false, message: '您已报名该活动，请勿重复提交' };
    }

    if (activity.signedCount >= activity.maxSeats) {
      return { success: false, message: '该活动报名人数已满' };
    }

    const regId = 'reg_' + Date.now();
    const newReg: Registration = {
      id: regId,
      activityId: activity.id,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      activityTitle: activity.title,
      status: 'registered',
      hours: activity.hours,
      pointsReward: activity.pointsReward,
      signedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    await setDoc(doc(db, 'registrations', regId), newReg);
    await updateDoc(doc(db, 'activities', activity.id), {
      signedCount: (activity.signedCount || 0) + 1,
    });

    fetch(`/api/activities/${activity.id}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) }).catch(() => {});
    return { success: true, message: '报名成功！请准时参加志愿服务' };
  } catch (err: any) {
    return { success: false, message: '报名提交失败: ' + err.message };
  }
}

// Service Hours Claim & Audit Actions
export async function submitServiceRecord(recordData: Omit<ServiceRecord, 'id' | 'status' | 'createdAt'>): Promise<string> {
  const id = 'rec_' + Date.now();
  const newRecord: ServiceRecord = {
    ...recordData,
    id,
    status: 'pending',
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
  await setDoc(doc(db, 'service_records', id), newRecord);
  fetch('/api/service-records', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(recordData) }).catch(() => {});
  return id;
}

export async function auditServiceRecord(
  record: ServiceRecord, 
  approved: boolean, 
  rejectReason?: string
) {
  const status = approved ? 'approved' : 'rejected';
  const reviewedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

  await updateDoc(doc(db, 'service_records', record.id), {
    status,
    rejectReason: rejectReason || '',
    reviewedAt,
  });

  if (approved) {
    // Award points and hours to user
    const userRef = doc(db, 'users', record.userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const u = userSnap.data() as User;
      await updateDoc(userRef, {
        points: (u.points || 0) + record.pointsEarned,
        totalHours: (u.totalHours || 0) + record.hours,
      });

      const ptsId = 'pts_' + Date.now();
      const ptsItem: PointsHistoryItem = {
        id: ptsId,
        userId: record.userId,
        type: 'earn',
        amount: record.pointsEarned,
        title: `志愿服务审核通过：${record.activityTitle}`,
        description: `累计志愿服务工时 ${record.hours} 小时，奖励积分已到账`,
        createdAt: reviewedAt,
      };
      await setDoc(doc(db, 'points_history', ptsId), ptsItem);
    }
  }

  fetch(`/api/service-records/${record.id}/audit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approved, rejectReason }) }).catch(() => {});
}

// Gift Management
export async function createGift(giftData: Omit<Gift, 'id' | 'createdAt'>): Promise<string> {
  const id = 'gift_' + Date.now();
  const newGift: Gift = {
    ...giftData,
    id,
    createdAt: new Date().toISOString().split('T')[0],
  };
  await setDoc(doc(db, 'gifts', id), newGift);
  fetch('/api/gifts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(giftData) }).catch(() => {});
  return id;
}

export async function updateGift(giftId: string, updates: Partial<Gift>) {
  await updateDoc(doc(db, 'gifts', giftId), updates);
  fetch(`/api/gifts/${giftId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) }).catch(() => {});
}

export async function redeemGift(
  user: User, 
  gift: Gift
): Promise<{ success: boolean; message: string; redemption?: Redemption }> {
  try {
    if ((user.points || 0) < gift.pointsCost) {
      return { success: false, message: '您的爱心积分不足，无法兑换该礼品' };
    }
    if ((gift.stock || 0) <= 0) {
      return { success: false, message: '该礼品库存不足' };
    }

    const code = 'VOL-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
    const redId = 'red_' + Date.now();
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newRedemption: Redemption = {
      id: redId,
      code,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      giftId: gift.id,
      giftName: gift.name,
      giftImage: gift.image,
      pointsCost: gift.pointsCost,
      status: 'pending',
      createdAt: nowStr,
    };

    // Save redemption
    await setDoc(doc(db, 'redemptions', redId), newRedemption);

    // Deduct user points
    await updateDoc(doc(db, 'users', user.id), {
      points: Math.max(0, (user.points || 0) - gift.pointsCost),
    });

    // Deduct gift stock
    await updateDoc(doc(db, 'gifts', gift.id), {
      stock: Math.max(0, (gift.stock || 0) - 1),
    });

    // Log points history
    const ptsId = 'pts_' + Date.now();
    const ptsItem: PointsHistoryItem = {
      id: ptsId,
      userId: user.id,
      type: 'spend',
      amount: gift.pointsCost,
      title: `兑换礼品：${gift.name}`,
      description: `生成兑换券 [${code}]，请前往党群服务中心核销`,
      createdAt: nowStr,
    };
    await setDoc(doc(db, 'points_history', ptsId), ptsItem);

    fetch(`/api/gifts/${gift.id}/redeem`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) }).catch(() => {});
    return { success: true, message: '兑换成功！兑换券已生成', redemption: newRedemption };
  } catch (err: any) {
    return { success: false, message: '兑换操作失败: ' + err.message };
  }
}

// Verify Redemption Code
export async function verifyRedemptionCode(
  code: string, 
  verifierName: string
): Promise<{ success: boolean; message: string; redemption?: Redemption }> {
  try {
    const target = cachedRedemptions.find(r => r.code.trim().toUpperCase() === code.trim().toUpperCase());
    if (!target) {
      return { success: false, message: '未查询到该兑换码，请核对后重试' };
    }

    if (target.status === 'redeemed') {
      return { success: false, message: `该兑换码已被核销（核销人: ${target.verifierName || '社区管理员'}）` };
    }

    const redeemedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    await updateDoc(doc(db, 'redemptions', target.id), {
      status: 'redeemed',
      redeemedAt,
      verifierName,
    });

    fetch('/api/redemptions/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, verifierName }) }).catch(() => {});
    return { 
      success: true, 
      message: `核销成功！礼品 [${target.giftName}] 已成功发放下发给居民 [${target.userName}]`,
      redemption: { ...target, status: 'redeemed', redeemedAt, verifierName }
    };
  } catch (err: any) {
    return { success: false, message: '核销异常: ' + err.message };
  }
}

// WeChat Simulation & Mini Program Bridge Methods
export async function wechatDirectAuth(customName?: string): Promise<WechatLoginResponse> {
  try {
    // 1. Check if in WeChat in-app browser (微信内置浏览器)
    const isWechat = typeof navigator !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent);
    if (isWechat) {
      const cleanUri = getPublicAppUrl(window.location.pathname);
      const authUrlRes = await fetch(`/api/wechat/auth-url?redirect_uri=${encodeURIComponent(cleanUri)}`);
      const data = await authUrlRes.json();
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
        return { success: true, message: '正在调起微信官方授权页面...' };
      }
    }

    // 2. Direct WeChat Auth (for H5, Mobile, Desktop, Simulator, or non-WeChat browser)
    let savedOpenid = localStorage.getItem('wechat_openid');
    if (!savedOpenid) {
      const rand = Math.floor(1000 + Math.random() * 9000);
      savedOpenid = `wx_openid_${Date.now().toString(36)}_${rand}`;
      localStorage.setItem('wechat_openid', savedOpenid);
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
      await setDoc(doc(db, 'users', data.user.id), data.user, { merge: true });
      localStorage.setItem('logged_in_user_id', data.user.id);
      localStorage.setItem('wechat_openid', data.user.openid || savedOpenid);
    }
    return data;
  } catch (err: any) {
    // Robust fallback: In case backend is unreachable, create/login locally
    const rand = Math.floor(1000 + Math.random() * 9000);
    const openid = localStorage.getItem('wechat_openid') || `wx_openid_${Date.now().toString(36)}_${rand}`;
    const newUserId = localStorage.getItem('logged_in_user_id') || ('user_wx_' + Date.now());
    const existing = cachedUsers.find(u => u.openid === openid || u.id === newUserId);
    if (existing) {
      return {
        success: true,
        user: existing,
        token: `jwt_wx_${existing.id}`,
        message: `微信授权登录成功！欢迎回来，【${existing.name}】`,
      };
    }
    const fallbackUser: User = {
      id: newUserId,
      name: customName || `微信居民_${rand}`,
      phone: `138****${rand}`,
      avatar: '👤',
      role: 'resident',
      points: 0,
      totalHours: 0,
      badge: '新注册志愿者',
      joinedDate: new Date().toISOString().split('T')[0],
      openid,
    };
    try {
      await setDoc(doc(db, 'users', newUserId), fallbackUser, { merge: true });
    } catch {}
    localStorage.setItem('logged_in_user_id', newUserId);
    localStorage.setItem('wechat_openid', openid);
    return {
      success: true,
      user: fallbackUser,
      token: `jwt_wx_${newUserId}`,
      message: `微信授权成功！已为您创建专属社区志愿档案 [${fallbackUser.name}]`,
    };
  }
}

export async function getWechatAuthUrl(redirectUri: string, scope: string = 'snsapi_userinfo', state: string = 'STATE'): Promise<{ success: boolean; authUrl: string; appId: string }> {
  try {
    const res = await fetch(`/api/wechat/oauth/url?redirectUri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`);
    const data = await res.json();
    return data;
  } catch (e) {
    const appId = 'wx7d983401fa9902bc';
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
      await setDoc(doc(db, 'users', data.user.id), data.user, { merge: true });
    }
    return data;
  } catch (err: any) {
    return { success: false, message: '微信登录失败: ' + err.message };
  }
}

// WeChat QR Code Scan-to-Login (扫码登录) Helpers with Firestore Sync
export async function createScanTicket(): Promise<{ success: boolean; ticket?: string; qrUrl?: string; expireSeconds?: number; message?: string }> {
  try {
    const ticket = `scan_tk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const now = Date.now();
    const qrUrl = `https://ais-pre-osvnr3skurb2bwxoglvyra-202559658155.us-east1.run.app/?scan_ticket=${ticket}`;

    // 1. Write immediately to Firestore so all containers and devices share the session
    try {
      await setDoc(doc(db, 'scan_tickets', ticket), {
        ticket,
        status: 'pending',
        createdAt: now,
      });
    } catch (fsErr) {
      console.warn('Firestore set scan_ticket error (continuing with backend API):', fsErr);
    }

    // 2. Also register on backend API (non-blocking)
    fetch('/api/wechat/scan/create-ticket').catch(() => {});

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

export function listenScanTicket(ticket: string, callback: (session: { status: 'pending' | 'scanned' | 'confirmed' | 'expired'; user?: User; token?: string }) => void) {
  try {
    const unsub = onSnapshot(doc(db, 'scan_tickets', ticket), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        callback({
          status: data.status || 'pending',
          user: data.user,
          token: data.token,
        });
      }
    });
    return unsub;
  } catch (err) {
    console.warn('listenScanTicket Firestore snapshot failed:', err);
    return () => {};
  }
}

export async function checkScanStatus(ticket: string): Promise<{ success: boolean; status: 'pending' | 'scanned' | 'confirmed' | 'expired'; user?: User; token?: string; message?: string }> {
  try {
    // 1. Check Firestore first for zero-latency cross-container state
    try {
      const snap = await getDoc(doc(db, 'scan_tickets', ticket));
      if (snap.exists()) {
        const d = snap.data() as any;
        if (d.status === 'confirmed' && d.user) {
          await setDoc(doc(db, 'users', d.user.id), d.user, { merge: true });
          return { success: true, status: 'confirmed', user: d.user, token: d.token };
        }
        if (d.status === 'scanned') {
          return { success: true, status: 'scanned' };
        }
      }
    } catch (fsErr) {
      console.warn('Check scan status Firestore read warning:', fsErr);
    }

    // 2. Check Backend API
    const res = await fetch(`/api/wechat/scan/status?ticket=${encodeURIComponent(ticket)}`);
    const data = await res.json();
    if (data.user) {
      await setDoc(doc(db, 'users', data.user.id), data.user, { merge: true });
    }
    return data;
  } catch (e: any) {
    return { success: false, status: 'pending', message: '网络轮询异常' };
  }
}

export async function notifyScanTicket(ticket: string): Promise<{ success: boolean; status?: string }> {
  try {
    // Update Firestore
    try {
      await setDoc(doc(db, 'scan_tickets', ticket), {
        status: 'scanned',
        scannedAt: Date.now(),
      }, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore notify scan error:', fsErr);
    }

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
    let targetUser: User | undefined;

    // 1. If userId provided, fetch user
    if (params.userId) {
      const uSnap = await getDoc(doc(db, 'users', params.userId));
      if (uSnap.exists()) {
        targetUser = uSnap.data() as User;
      }
    }

    // 2. If no target user found yet, build or retrieve by OpenID
    if (!targetUser) {
      const rand = Math.floor(1000 + Math.random() * 9000);
      const openid = params.openid || `wx_scan_${Date.now().toString(36)}_${rand}`;
      const newUserId = params.userId || ('user_wx_' + Date.now());
      targetUser = {
        id: newUserId,
        name: params.name || `微信居民_${rand}`,
        phone: params.phone || `138****${rand}`,
        avatar: params.avatarUrl || '👤',
        role: 'resident',
        points: 0,
        totalHours: 0,
        badge: '新注册志愿者',
        joinedDate: new Date().toISOString().split('T')[0],
        openid,
      };
      await setDoc(doc(db, 'users', newUserId), targetUser, { merge: true });
    }

    const token = `jwt_wx_scan_${targetUser.id}_${Date.now()}`;

    // 3. Write confirmed state directly to Firestore scan_tickets
    try {
      await setDoc(doc(db, 'scan_tickets', params.ticket), {
        ticket: params.ticket,
        status: 'confirmed',
        user: targetUser,
        token,
        confirmedAt: Date.now(),
      }, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore confirmScanLogin setDoc warning:', fsErr);
    }

    // 4. Notify backend API
    fetch('/api/wechat/scan/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, userId: targetUser.id }),
    }).catch(() => {});

    return {
      success: true,
      user: targetUser,
      token,
      message: `已成功授权电脑端登录为【${targetUser.name}】`,
    };
  } catch (e: any) {
    return { success: false, message: '确认授权失败: ' + e.message };
  }
}

export async function mockConfirmScanLogin(ticket: string, customName?: string): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
  try {
    const randId = Math.floor(1000 + Math.random() * 9000);
    const mockOpenid = `wx_scan_mock_${Date.now().toString(36)}_${randId}`;
    const nick = customName || `微信居民_${randId}`;
    const newUserId = 'user_wx_' + Date.now();
    const newUser: User = {
      id: newUserId,
      name: nick,
      phone: `138****${randId}`,
      avatar: '👤',
      role: 'resident',
      points: 0,
      totalHours: 0,
      badge: '新注册志愿者',
      joinedDate: new Date().toISOString().split('T')[0],
      openid: mockOpenid,
    };

    await setDoc(doc(db, 'users', newUserId), newUser, { merge: true });
    const token = `jwt_wx_mock_${newUserId}_${Date.now()}`;

    // Update Firestore
    try {
      await setDoc(doc(db, 'scan_tickets', ticket), {
        ticket,
        status: 'confirmed',
        user: newUser,
        token,
        confirmedAt: Date.now(),
      }, { merge: true });
    } catch (fsErr) {
      console.warn('Mock confirm Firestore write warning:', fsErr);
    }

    // Call backend
    fetch('/api/wechat/scan/mock-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket, customName }),
    }).catch(() => {});

    return {
      success: true,
      user: newUser,
      token,
      message: `模拟手机扫码确认成功！已授权登录 [${newUser.name}]`,
    };
  } catch (e: any) {
    return { success: false, message: '模拟扫码授权失败: ' + e.message };
  }
}

export async function wechatLogin(code: string, mockUserData?: { name?: string; avatar?: string } | string): Promise<WechatLoginResponse> {
  try {
    const payload = typeof mockUserData === 'string' ? { name: mockUserData } : mockUserData;
    const res = await fetch('/api/wechat/oauth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, ...payload }),
    });
    const data = await res.json();
    if (data.user) {
      await setDoc(doc(db, 'users', data.user.id), data.user, { merge: true });
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
      await setDoc(doc(db, 'users', data.user.id), data.user, { merge: true });
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
      await setDoc(doc(db, 'users', data.user.id), data.user, { merge: true });
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
}

export async function sendWechatTemplateMessage(templateId: string, title: string, content: string, userId: string): Promise<{ success: boolean; messageId?: string }> {
  return miniProgramSubscribeMessage(templateId, title, content, userId);
}

// Community Issues (随手拍) Actions
export async function submitCommunityIssue(issueData: Omit<CommunityIssue, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; data?: CommunityIssue; message?: string }> {
  try {
    const id = 'issue_' + Date.now();
    const newIssue: CommunityIssue = {
      ...issueData,
      id,
      status: 'pending',
      pointsReward: issueData.pointsReward || 15,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    await setDoc(doc(db, 'issues', id), newIssue);
    fetch('/api/issues', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(issueData) }).catch(() => {});
    return { success: true, data: newIssue, message: '随手拍工单已提交到网格中心！' };
  } catch (err: any) {
    return { success: false, message: '随手拍提交失败: ' + err.message };
  }
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
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const issueRef = doc(db, 'issues', id);
    const issueSnap = await getDoc(issueRef);

    if (!issueSnap.exists()) {
      return { success: false, message: '未找到指定工单' };
    }

    const currentIssue = issueSnap.data() as CommunityIssue;
    const updates: Partial<CommunityIssue> = {
      status,
      adminReply,
      pointsReward,
      replyImage: replyImage || '',
      handledBy: handledBy || '社区网格办',
    };

    if (status === 'resolved') {
      updates.resolvedAt = nowStr;

      // Award points to user if first time resolving
      if (currentIssue.status !== 'resolved') {
        const userRef = doc(db, 'users', currentIssue.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const u = userSnap.data() as User;
          await updateDoc(userRef, {
            points: (u.points || 0) + pointsReward,
          });

          const ptsId = 'pts_' + Date.now();
          const ptsItem: PointsHistoryItem = {
            id: ptsId,
            userId: currentIssue.userId,
            type: 'earn',
            amount: pointsReward,
            title: `随手拍线索办结奖励：${currentIssue.title.slice(0, 14)}...`,
            description: `工单已办结整改完毕，网格办向您发放 +${pointsReward} 爱心积分`,
            createdAt: nowStr,
          };
          await setDoc(doc(db, 'points_history', ptsId), ptsItem);
        }
      }
    }

    await updateDoc(issueRef, updates);
    fetch(`/api/issues/${id}/handle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, adminReply, pointsReward, replyImage, handledBy }) }).catch(() => {});
    return { success: true, message: '工单处理成功', issue: { ...currentIssue, ...updates } };
  } catch (err: any) {
    return { success: false, message: '处理工单失败: ' + err.message };
  }
}

export async function deleteCommunityIssue(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteDoc(doc(db, 'issues', id));
    fetch(`/api/issues/${id}`, { method: 'DELETE' }).catch(() => {});
    return { success: true, message: '已成功删除随手拍工单' };
  } catch (err: any) {
    return { success: false, message: '删除工单失败: ' + err.message };
  }
}
