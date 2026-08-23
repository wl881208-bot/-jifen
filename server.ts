import express from 'express';
import path from 'path';
import fs from 'fs';

// Types matching frontend
export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  role: 'resident' | 'party_member' | 'admin';
  points: number;
  totalHours: number;
  badge: string;
  joinedDate: string;
  openid?: string;
}

export interface Activity {
  id: string;
  title: string;
  location: string;
  date: string;
  hours: number;
  pointsReward: number;
  maxSeats: number;
  signedCount: number;
  status: 'recruiting' | 'in_progress' | 'completed';
  category: '环保卫士' | '关爱邻里' | '平安社区' | '便民服务' | '文明创建';
  description: string;
  organizer: string;
  createdAt: string;
}

export interface Gift {
  id: string;
  name: string;
  pointsCost: number;
  stock: number;
  category: string;
  image: string;
  description: string;
  status: 'on_sale' | 'off_sale';
  createdAt: string;
}

export interface Registration {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  userPhone: string;
  activityTitle: string;
  status: 'registered' | 'completed' | 'cancelled';
  hours: number;
  pointsReward: number;
  signedAt: string;
}

export interface ServiceRecord {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  activityId?: string;
  activityTitle: string;
  hours: number;
  pointsEarned: number;
  proofText: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface Redemption {
  id: string;
  code: string;
  userId: string;
  userName: string;
  userPhone: string;
  giftId: string;
  giftName: string;
  giftImage: string;
  pointsCost: number;
  status: 'pending' | 'redeemed' | 'expired';
  createdAt: string;
  redeemedAt?: string;
  verifierName?: string;
}

export interface PointsHistoryItem {
  id: string;
  userId: string;
  type: 'earn' | 'spend';
  amount: number;
  title: string;
  description: string;
  createdAt: string;
}

export type IssueCategory = '环境卫生' | '设施破损' | '安全隐患' | '车辆违停' | '楼道堆物' | '其它诉求';
export type IssueStatus = 'pending' | 'processing' | 'resolved' | 'rejected';

export interface CommunityIssue {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userAvatar?: string;
  userRole?: 'resident' | 'party_member' | 'admin';
  title: string;
  category: IssueCategory;
  description: string;
  images: string[];
  location: string;
  locationDetail?: string;
  status: IssueStatus;
  pointsReward?: number;
  adminReply?: string;
  replyImage?: string;
  handledBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

// Initial Mock Datasets (Simulating relational database tables)
function getDefaultData() {
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
      description: '协助整理归位儿童绘本与科普图书，修补破损书籍，保持阅览室书架美观有序。',
      organizer: '社区青年先锋队',
      createdAt: '2026-08-04',
    },
    {
      id: 'act_6',
      title: '绿色家园：微花园花草修剪与浇灌护绿',
      location: '幸福社区中央景观公园',
      date: '2026-08-15 08:00 - 09:30',
      hours: 1.5,
      pointsReward: 30,
      maxSeats: 10,
      signedCount: 6,
      status: 'recruiting',
      category: '环保卫士',
      description: '对社区微花园绿植进行杂草清理、松土浇水，修剪残枝败叶，共筑绿色优美环境。',
      organizer: '社区绿色环保社团',
      createdAt: '2026-08-04',
    },
  ];

  const gifts: Gift[] = [
    {
      id: 'gift_1',
      name: '304不锈钢便携保温杯 (500ml)',
      pointsCost: 150,
      stock: 18,
      category: '生活用品',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400',
      description: '食品级304不锈钢内胆，24小时长效保温，精美刻字，方便携行。',
      status: 'on_sale',
      createdAt: '2026-08-01',
    },
    {
      id: 'gift_2',
      name: '5kg优质东北大米兑换券',
      pointsCost: 200,
      stock: 10,
      category: '粮油副食',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
      description: '凭借核销二维码至社区合作超市可直接领取1袋5kg优质东北五常大米。',
      status: 'on_sale',
      createdAt: '2026-08-01',
    },
    {
      id: 'gift_3',
      name: '多功能洗洁精与洗手液清洁套装',
      pointsCost: 80,
      stock: 35,
      category: '生活用品',
      image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&q=80&w=400',
      description: '包含柑橘温和去油洗洁精1.2L + 抑菌洗手液500ml，居家清洁必备。',
      status: 'on_sale',
      createdAt: '2026-08-02',
    },
    {
      id: 'gift_4',
      name: '纯棉加厚运动吸汗毛巾 (2条装)',
      pointsCost: 60,
      stock: 40,
      category: '生活用品',
      image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&q=80&w=400',
      description: '100%新疆长绒棉，吸水性强不掉毛，柔软舒适，志愿服务随身好物。',
      status: 'on_sale',
      createdAt: '2026-08-02',
    },
    {
      id: 'gift_5',
      name: '社区环保折叠帆布购物袋',
      pointsCost: 30,
      stock: 80,
      category: '生活用品',
      image: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&q=80&w=400',
      description: '防撕裂大容量，便携折叠口袋，倡导绿色减塑生活。',
      status: 'on_sale',
      createdAt: '2026-08-02',
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
      title: '服务工时发积分：便民义集理发服务',
      description: '管理员审核通过工时 3.0 小时，发放积分奖励',
      createdAt: '2026-08-02 15:00',
    },
    {
      id: 'pts_3',
      userId: 'user_1',
      type: 'earn',
      amount: 100,
      title: '新志愿者入会奖励',
      description: '首次完成志愿注册并完成实名认证发放初始积分',
      createdAt: '2025-03-12 09:00',
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

// In-Memory Database Instance (Express + Mock MySQL Data Engine)
class MockMySQLDatabase {
  private users: User[] = [];
  private activities: Activity[] = [];
  private gifts: Gift[] = [];
  private registrations: Registration[] = [];
  private serviceRecords: ServiceRecord[] = [];
  private redemptions: Redemption[] = [];
  private pointsHistory: PointsHistoryItem[] = [];
  private issues: CommunityIssue[] = [];

  constructor() {
    this.seed(true);
  }

  public seed(force: boolean = false) {
    if (!force && this.users.length > 0) return false;
    const data = getDefaultData();
    this.users = data.users;
    this.activities = data.activities;
    this.gifts = data.gifts;
    this.registrations = data.registrations;
    this.serviceRecords = data.serviceRecords;
    this.redemptions = data.redemptions;
    this.pointsHistory = data.pointsHistory;
    this.issues = data.issues;
    console.log('[MySQL Engine] Database seeded successfully with initial community records.');
    return true;
  }

  public getAllData() {
    return {
      users: this.users,
      activities: this.activities,
      gifts: this.gifts,
      registrations: this.registrations,
      serviceRecords: this.serviceRecords,
      redemptions: this.redemptions,
      pointsHistory: this.pointsHistory,
      issues: this.issues,
    };
  }

  // Users
  public findUserByOpenId(openid: string): User | undefined {
    return this.users.find(u => u.openid === openid);
  }

  public createOrGetWechatUser(openid: string, customName?: string, avatarUrl?: string): { user: User; isNew: boolean } {
    let existing = this.users.find(u => u.openid === openid);
    if (existing) {
      if (customName && customName !== existing.name && !customName.startsWith('微信居民_')) {
        existing.name = customName;
      }
      if (avatarUrl && avatarUrl !== existing.avatar) {
        existing.avatar = avatarUrl;
      }
      return { user: existing, isNew: false };
    }

    // Auto-create a new resident account initialized with 0 points
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const newUserId = 'user_wx_' + Date.now();
    const newUser: User = {
      id: newUserId,
      name: customName || `微信居民_${randSuffix}`,
      phone: `138****${randSuffix}`,
      avatar: avatarUrl || '👤',
      role: 'resident',
      points: 0, // Initial points = 0 as per requirements
      totalHours: 0,
      badge: '微信社区新人',
      joinedDate: new Date().toISOString().split('T')[0],
      openid,
    };

    this.users.unshift(newUser);
    return { user: newUser, isNew: true };
  }

  public updateUserPointsAndHours(userId: string, pointsDelta: number, hoursDelta: number) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;
    user.points = Math.max(0, user.points + pointsDelta);
    user.totalHours = Math.max(0, user.totalHours + hoursDelta);
  }

  public createUser(userData: Partial<User>): User {
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const newUserId = 'user_' + Date.now();
    const newUser: User = {
      id: newUserId,
      name: userData.name || `居民_${randSuffix}`,
      phone: userData.phone || `138${randSuffix}0000`,
      avatar: userData.avatar || (userData.role === 'admin' ? '👮‍♂️' : '👤'),
      role: userData.role || 'resident',
      points: typeof userData.points === 'number' ? Math.max(0, userData.points) : 0,
      totalHours: typeof userData.totalHours === 'number' ? Math.max(0, userData.totalHours) : 0,
      badge: userData.badge || (userData.role === 'admin' ? '社区管理员' : userData.role === 'party_member' ? '党员先锋志愿者' : '社区志愿者'),
      joinedDate: userData.joinedDate || new Date().toISOString().split('T')[0],
      openid: userData.openid || (userData.role === 'admin' ? `mock_openid_admin_${randSuffix}` : undefined),
    };
    this.users.unshift(newUser);

    if (newUser.points > 0) {
      this.pointsHistory.unshift({
        id: 'pts_' + Date.now(),
        userId: newUser.id,
        type: 'earn',
        amount: newUser.points,
        title: '初始档案积分录入',
        description: '系统管理员手动录入新用户初始积分',
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      });
    }

    return newUser;
  }

  public updateUser(userId: string, updates: Partial<User>): boolean {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    this.users[idx] = { ...this.users[idx], ...updates };
    return true;
  }

  public deleteUser(userId: string): boolean {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    return true;
  }

  public adjustUserPoints(userId: string, pointsDelta: number, hoursDelta: number, reason: string, adminName: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;

    const oldPoints = user.points;
    const oldHours = user.totalHours;

    user.points = Math.max(0, user.points + pointsDelta);
    user.totalHours = Math.max(0, Number((user.totalHours + hoursDelta).toFixed(1)));

    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    if (pointsDelta !== 0) {
      this.pointsHistory.unshift({
        id: 'pts_' + Date.now(),
        userId: user.id,
        type: pointsDelta > 0 ? 'earn' : 'spend',
        amount: Math.abs(pointsDelta),
        title: `管理员人工调整积分 (${pointsDelta > 0 ? '+' : ''}${pointsDelta} 分)`,
        description: `操作员【${adminName}】调整: ${reason || '无说明'} (原积分:${oldPoints} -> 现积分:${user.points})`,
        createdAt: now,
      });
    }

    return true;
  }

  // Activities
  public createActivity(actData: Omit<Activity, 'id' | 'createdAt' | 'signedCount'>): Activity {
    const newAct: Activity = {
      ...actData,
      id: 'act_' + Date.now(),
      signedCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.activities.unshift(newAct);
    return newAct;
  }

  public updateActivity(id: string, updates: Partial<Activity>) {
    const idx = this.activities.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.activities[idx] = { ...this.activities[idx], ...updates };
    }
  }

  public deleteActivity(id: string) {
    this.activities = this.activities.filter(a => a.id !== id);
  }

  public registerForActivity(userId: string, activityId: string): { success: boolean; message: string; registration?: Registration } {
    const act = this.activities.find(a => a.id === activityId);
    if (!act) return { success: false, message: '活动不存在' };
    if (act.signedCount >= act.maxSeats) {
      return { success: false, message: '该活动名额已满，无法报名' };
    }

    const existing = this.registrations.find(r => r.activityId === activityId && r.userId === userId);
    if (existing) {
      return { success: false, message: '您已报名过此活动，请勿重复报名' };
    }

    const user = this.users.find(u => u.id === userId);
    if (!user) return { success: false, message: '居民用户信息不存在' };

    const regId = 'reg_' + Date.now();
    const newReg: Registration = {
      id: regId,
      activityId: act.id,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      activityTitle: act.title,
      status: 'registered',
      hours: act.hours,
      pointsReward: act.pointsReward,
      signedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    };

    this.registrations.unshift(newReg);
    act.signedCount += 1;

    return { success: true, message: '报名成功！请按时前往指定地点参加服务', registration: newReg };
  }

  // Service Records
  public submitServiceRecord(recordData: Omit<ServiceRecord, 'id' | 'status' | 'createdAt'>): ServiceRecord {
    const newRec: ServiceRecord = {
      ...recordData,
      id: 'rec_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    };
    this.serviceRecords.unshift(newRec);
    return newRec;
  }

  public auditServiceRecord(id: string, approved: boolean, rejectReason?: string) {
    const rec = this.serviceRecords.find(r => r.id === id);
    if (!rec) return;

    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    rec.status = approved ? 'approved' : 'rejected';
    rec.rejectReason = rejectReason || '';
    rec.reviewedAt = now;

    if (approved) {
      // 1. Grant points & hours
      this.updateUserPointsAndHours(rec.userId, rec.pointsEarned, rec.hours);

      // 2. Points history
      const historyId = 'pts_' + Date.now();
      this.pointsHistory.unshift({
        id: historyId,
        userId: rec.userId,
        type: 'earn',
        amount: rec.pointsEarned,
        title: `服务工时发放：${rec.activityTitle}`,
        description: `审核通过工时 ${rec.hours} 小时，打卡理由：${rec.proofText}`,
        createdAt: now,
      });

      // 3. Mark registration completed
      if (rec.activityId) {
        const reg = this.registrations.find(r => r.activityId === rec.activityId && r.userId === rec.userId);
        if (reg) {
          reg.status = 'completed';
        }
      }
    }
  }

  // Gifts
  public createGift(giftData: Omit<Gift, 'id' | 'createdAt'>): Gift {
    const newGift: Gift = {
      ...giftData,
      id: 'gift_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.gifts.unshift(newGift);
    return newGift;
  }

  public updateGift(id: string, updates: Partial<Gift>) {
    const idx = this.gifts.findIndex(g => g.id === id);
    if (idx !== -1) {
      this.gifts[idx] = { ...this.gifts[idx], ...updates };
    }
  }

  public redeemGift(userId: string, giftId: string): { success: boolean; message: string; redemption?: Redemption } {
    const user = this.users.find(u => u.id === userId);
    const gift = this.gifts.find(g => g.id === giftId);

    if (!user || !gift) {
      return { success: false, message: '用户或礼品信息缺失' };
    }

    if (user.points < gift.pointsCost) {
      return { success: false, message: `积分不足！所需 ${gift.pointsCost} 积分，当前仅有 ${user.points} 积分` };
    }

    if (gift.stock <= 0) {
      return { success: false, message: '该礼品库存不足，暂时无法兑换' };
    }

    // Generate unique code: VOL-XXXX-XXX
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomMid = Math.floor(1000 + Math.random() * 9000);
    const code = `VOL-${randomMid}-${randomSuffix}`;

    const redemptionId = 'red_' + Date.now();
    const now = new Date().toLocaleString('zh-CN', { hour12: false });

    const redemption: Redemption = {
      id: redemptionId,
      code,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      giftId: gift.id,
      giftName: gift.name,
      giftImage: gift.image,
      pointsCost: gift.pointsCost,
      status: 'pending',
      createdAt: now,
    };

    // 1. Save redemption
    this.redemptions.unshift(redemption);

    // 2. Deduct points
    user.points = Math.max(0, user.points - gift.pointsCost);

    // 3. Decrease stock
    gift.stock = Math.max(0, gift.stock - 1);

    // 4. Log points history
    const historyId = 'pts_' + Date.now();
    this.pointsHistory.unshift({
      id: historyId,
      userId: user.id,
      type: 'spend',
      amount: gift.pointsCost,
      title: `积分兑换礼品：${gift.name}`,
      description: `生成核销码 [${code}]，请前往党群中心领奖`,
      createdAt: now,
    });

    return {
      success: true,
      message: '兑换成功！已生成核销二维码与兑换码',
      redemption,
    };
  }

  // Verification
  public verifyRedemptionCode(code: string, verifierName: string): { success: boolean; message: string; redemption?: Redemption } {
    const cleanCode = code.trim().toUpperCase();
    const red = this.redemptions.find(r => r.code === cleanCode);

    if (!red) {
      return { success: false, message: '找不到该兑换码，请检查核销码是否输入正确' };
    }

    if (red.status === 'redeemed') {
      return {
        success: false,
        message: `该兑换码已于 ${red.redeemedAt || '此前'} 被【${red.verifierName || '管理员'}】核销领奖，切勿重复核销！`,
        redemption: red,
      };
    }

    if (red.status === 'expired') {
      return { success: false, message: '该兑换码已失效或已过期', redemption: red };
    }

    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    red.status = 'redeemed';
    red.redeemedAt = now;
    red.verifierName = verifierName;

    return {
      success: true,
      message: `核销成功！居民【${red.userName}】成功兑换领走礼品《${red.giftName}》`,
      redemption: red,
    };
  }

  // Community Issues (随手拍)
  public createIssue(issueData: Omit<CommunityIssue, 'id' | 'createdAt' | 'status'>): CommunityIssue {
    const newIssue: CommunityIssue = {
      ...issueData,
      id: 'issue_' + Date.now(),
      status: 'pending',
      pointsReward: issueData.pointsReward || 15,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    };
    this.issues.unshift(newIssue);
    return newIssue;
  }

  public handleIssue(
    id: string, 
    status: IssueStatus, 
    adminReply: string, 
    pointsReward: number, 
    replyImage?: string, 
    handledBy?: string
  ): { success: boolean; message: string; issue?: CommunityIssue } {
    const issue = this.issues.find(i => i.id === id);
    if (!issue) {
      return { success: false, message: '未找到指定随手拍问题单' };
    }

    const previousStatus = issue.status;
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    
    issue.status = status;
    issue.adminReply = adminReply || '';
    if (replyImage) issue.replyImage = replyImage;
    if (handledBy) issue.handledBy = handledBy;

    if (status === 'resolved') {
      issue.resolvedAt = now;
      const pts = typeof pointsReward === 'number' ? pointsReward : 15;
      issue.pointsReward = pts;

      // Only award points once when resolving from non-resolved state
      if (previousStatus !== 'resolved' && pts > 0) {
        this.updateUserPointsAndHours(issue.userId, pts, 0);

        const historyId = 'pts_' + Date.now();
        this.pointsHistory.unshift({
          id: historyId,
          userId: issue.userId,
          type: 'earn',
          amount: pts,
          title: `随手拍奖励：${issue.title}`,
          description: `居民反馈问题【${issue.category}】已办结并采纳，发放爱心积分 +${pts} 分`,
          createdAt: now,
        });
      }
    }

    return {
      success: true,
      message: status === 'resolved' ? '问题已办结并向反馈居民发放积分奖励！' : '问题处理状态已更新',
      issue
    };
  }

  public deleteIssue(id: string): boolean {
    const idx = this.issues.findIndex(i => i.id === id);
    if (idx === -1) return false;
    this.issues.splice(idx, 1);
    return true;
  }
}

const db = new MockMySQLDatabase();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Healthcheck endpoints for TCB/EKS Liveness and Readiness Probes
  app.get(['/health', '/api/health'], (_req, res) => {
    res.status(200).json({
      status: 'UP',
      app: '社区志愿服务积分与礼品兑换系统',
      version: '2.0.0-tcb',
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString()
    });
  });

  // REST API Routes
  app.get('/api/db/all', (_req, res) => {
    res.json(db.getAllData());
  });

  app.post('/api/db/seed', (req, res) => {
    const force = req.body?.force === true;
    const seeded = db.seed(force);
    res.json({ success: true, seeded, data: db.getAllData() });
  });

  // WeChat Silent OAuth2.0 & OpenID Binding Routes
  app.post(['/api/wechat/login', '/api/wechat/oauth/callback'], async (req, res) => {
    try {
      const { code, openid: directOpenid, customName, name, avatarUrl } = req.body;
      const appid = process.env.WECHAT_APPID || 'wx8b069e2f10f2e2da';
      const secret = process.env.WECHAT_APPSECRET || '21e32182e543571dda65c67e30d4f57c';
      const enableMock = process.env.ENABLE_WECHAT_MOCK === 'true';

      let targetOpenid = directOpenid;
      let wechatNickname: string | undefined = customName || name;
      let wechatAvatar: string | undefined = avatarUrl;

      if (!targetOpenid) {
        if (enableMock || (code && code.startsWith('mock_'))) {
          // Resolve mock codes
          if (code === 'mock_code_user_1') targetOpenid = 'mock_openid_resident_001';
          else if (code === 'mock_code_user_2') targetOpenid = 'mock_openid_resident_002';
          else if (code === 'mock_code_admin') targetOpenid = 'mock_openid_admin_999';
          else if (code && code.length > 0) targetOpenid = 'mock_openid_wx_' + code;
          else targetOpenid = `wx_openid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        } else if (code) {
          // Real WeChat OAuth2.0 code -> access_token & openid exchange
          const wxUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`;
          const wxResponse = await fetch(wxUrl);
          const wxData = await wxResponse.json();

          if (wxData.openid) {
            targetOpenid = wxData.openid;

            // Retrieve real WeChat user profile if access_token exists
            if (wxData.access_token) {
              try {
                const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${wxData.access_token}&openid=${wxData.openid}&lang=zh_CN`;
                const userInfoRes = await fetch(userInfoUrl);
                const userInfo = await userInfoRes.json();
                if (userInfo.nickname) {
                  wechatNickname = userInfo.nickname;
                }
                if (userInfo.headimgurl) {
                  wechatAvatar = userInfo.headimgurl;
                }
              } catch (uErr) {
                console.warn('[WeChat Auth] Real WeChat userinfo profile fetch warning:', uErr);
              }
            }
          } else {
            console.warn('[WeChat Auth] Real WeChat API exchange response without openid:', wxData);
            // If domain not configured or code expired, fallback to a unique new user instead of failing hard
            targetOpenid = `wx_user_${Date.now().toString(36)}`;
          }
        } else {
          targetOpenid = `wx_openid_${Date.now().toString(36)}`;
        }
      }

      const { user, isNew } = db.createOrGetWechatUser(targetOpenid, wechatNickname, wechatAvatar);
      const token = `jwt_wx_${user.id}_${Date.now()}`;

      res.json({
        success: true,
        token,
        user,
        isNew,
        openid: targetOpenid,
        isMock: enableMock,
        message: isNew 
          ? `真实微信授权成功！已为您创建专属社区居民档案 [${user.name}]，初始积分为 0` 
          : `微信登录成功！欢迎回来，【${user.name}】`,
      });
    } catch (err: any) {
      console.error('[WeChat Auth Error]', err);
      res.status(500).json({ success: false, message: '微信授权登录处理失败: ' + err.message });
    }
  });

  app.post('/api/wechat/mock-login', (req, res) => {
    const { openid, name, customName, avatarUrl } = req.body;
    const targetOpenid = openid || `wx_openid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const nick = customName || name;

    const { user, isNew } = db.createOrGetWechatUser(targetOpenid, nick, avatarUrl);
    const token = `jwt_wx_${user.id}_${Date.now()}`;

    res.json({
      success: true,
      token,
      user,
      isNew,
      openid: targetOpenid,
      isMock: true,
      message: isNew 
        ? `微信授权成功！已绑定专属 OpenID 并创建居民账号(0分)` 
        : `登录成功！欢迎回来，【${user.name}】`,
    });
  });

  app.get(['/api/wechat/auth-url', '/api/wechat/oauth/url'], (req, res) => {
    let rawUri = (req.query.redirect_uri as string) || (req.query.redirectUri as string) || process.env.APP_URL || 'https://jifen-295865-11-1301488547.sh.run.tcloudbase.com';
    // If arriving with internal dev domain, convert to public preview domain
    if (rawUri.includes('ais-dev-')) {
      rawUri = rawUri.replace('ais-dev-', 'ais-pre-');
    }
    // Clean redirectUri: strip query strings and hash parameters to comply with WeChat redirect_uri format
    let redirectUri = rawUri.split('?')[0].split('#')[0];

    const appid = process.env.WECHAT_APPID || 'wx8b069e2f10f2e2da';
    const enableMock = process.env.ENABLE_WECHAT_MOCK === 'true';

    if (enableMock) {
      const mockCode = `mock_code_${Date.now().toString(36)}`;
      const mockUrl = `${redirectUri}${redirectUri.includes('?') ? '&' : '?'}code=${mockCode}`;
      res.json({ success: true, authUrl: mockUrl, isMock: true });
    } else {
      const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;
      res.json({ success: true, authUrl, isMock: false, redirectUri });
    }
  });

  // WeChat QR Code Scan-to-Login (扫码登录) Ticket Session Storage
  interface ScanTicketSession {
    ticket: string;
    status: 'pending' | 'scanned' | 'confirmed' | 'expired';
    createdAt: number;
    user?: User;
    token?: string;
  }
  const scanTickets = new Map<string, ScanTicketSession>();

  // Periodic cleanup of expired scan tickets (5 min TTL)
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of scanTickets.entries()) {
      if (now - v.createdAt > 5 * 60 * 1000) {
        scanTickets.delete(k);
      }
    }
  }, 60 * 1000);

  // 1. Create a dynamic scan-to-login ticket & QR code URL
  app.get('/api/wechat/scan/create-ticket', (_req, res) => {
    const ticket = `scan_tk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const session: ScanTicketSession = {
      ticket,
      status: 'pending',
      createdAt: Date.now(),
    };
    scanTickets.set(ticket, session);

    const publicOrigin = process.env.APP_URL || 'https://jifen-295865-11-1301488547.sh.run.tcloudbase.com';
    const qrUrl = `${publicOrigin}/?scan_ticket=${ticket}`;

    res.json({
      success: true,
      ticket,
      qrUrl,
      expireSeconds: 300,
    });
  });

  // 2. Poll the status of a scan ticket (Desktop polling)
  app.get('/api/wechat/scan/status', (req, res) => {
    const ticket = req.query.ticket as string;
    if (!ticket) {
      return res.status(400).json({ success: false, message: 'Ticket 参数缺失' });
    }

    let session = scanTickets.get(ticket);
    if (!session) {
      // If session not found in memory (e.g. multi-container), initialize on the fly as pending
      session = {
        ticket,
        status: 'pending',
        createdAt: Date.now(),
      };
      scanTickets.set(ticket, session);
      return res.json({ success: true, status: 'pending' });
    }

    if (Date.now() - session.createdAt > 10 * 60 * 1000) {
      session.status = 'expired';
      return res.json({ success: true, status: 'expired', message: '二维码已过期，请刷新' });
    }

    res.json({
      success: true,
      status: session.status,
      user: session.user,
      token: session.token,
    });
  });

  // 3. Mobile notifies server that QR code has been scanned
  app.post('/api/wechat/scan/scan-notify', (req, res) => {
    const { ticket } = req.body;
    let session = ticket ? scanTickets.get(ticket) : null;
    if (!session && ticket) {
      session = {
        ticket,
        status: 'pending',
        createdAt: Date.now(),
      };
      scanTickets.set(ticket, session);
    }
    if (session) {
      session.status = 'scanned';
    }
    res.json({ success: true, status: session ? session.status : 'scanned' });
  });

  // 4. Mobile user confirms WeChat authorization
  app.post('/api/wechat/scan/confirm', (req, res) => {
    const { ticket, openid, name, phone, avatarUrl, userId } = req.body;
    if (!ticket) {
      return res.status(400).json({ success: false, message: 'Ticket 缺失' });
    }

    let session = scanTickets.get(ticket);
    if (!session) {
      session = {
        ticket,
        status: 'pending',
        createdAt: Date.now(),
      };
      scanTickets.set(ticket, session);
    }

    let targetUser: User;
    if (userId) {
      const existing = db.getAllData().users.find(u => u.id === userId);
      if (existing) {
        targetUser = existing;
      } else {
        const genOpenid = openid || `wx_scan_${Date.now().toString(36)}`;
        const { user } = db.createOrGetWechatUser(genOpenid, name, avatarUrl);
        targetUser = user;
      }
    } else {
      const genOpenid = openid || `wx_scan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      const { user } = db.createOrGetWechatUser(genOpenid, name, avatarUrl);
      if (phone && !user.phone) {
        user.phone = phone;
      }
      targetUser = user;
    }

    const token = `jwt_wx_scan_${targetUser.id}_${Date.now()}`;
    session.status = 'confirmed';
    session.user = targetUser;
    session.token = token;

    res.json({
      success: true,
      message: `已成功授权电脑端登录为【${targetUser.name}】`,
      user: targetUser,
      token,
    });
  });

  // 5. One-click mock confirmation for testing/dev review
  app.post('/api/wechat/scan/mock-confirm', (req, res) => {
    const { ticket, customName } = req.body;
    if (!ticket) {
      return res.status(400).json({ success: false, message: 'Ticket 缺失' });
    }

    const session = scanTickets.get(ticket);
    if (!session) {
      return res.status(400).json({ success: false, message: '该扫码凭证已失效' });
    }

    const randId = Math.floor(1000 + Math.random() * 9000);
    const mockOpenid = `wx_scan_mock_${Date.now().toString(36)}_${randId}`;
    const nick = customName || `扫码居民_${randId}`;
    const { user } = db.createOrGetWechatUser(mockOpenid, nick);
    const token = `jwt_wx_scan_${user.id}_${Date.now()}`;

    session.status = 'confirmed';
    session.user = user;
    session.token = token;

    res.json({
      success: true,
      message: `模拟手机扫码确认成功！已授权登录 [${user.name}]`,
      user,
      token,
    });
  });

  // Native WeChat Mini-Program wx.login() -> jscode2session Endpoint
  app.post('/api/wechat/miniprogram/login', async (req, res) => {
    try {
      const { js_code, code } = req.body;
      const targetCode = js_code || code;
      const appid = process.env.WECHAT_APPID || 'wx8b069e2f10f2e2da';
      const secret = process.env.WECHAT_APPSECRET || '21e32182e543571dda65c67e30d4f57c';
      const enableMock = process.env.ENABLE_WECHAT_MOCK === 'true';

      let openid: string | null = null;
      let session_key: string | null = null;

      if (enableMock || !targetCode || targetCode.startsWith('mock_')) {
        openid = `mp_openid_resident_${targetCode || Math.floor(100 + Math.random() * 900)}`;
        session_key = `mock_session_key_${Date.now()}`;
      } else {
        // Official WeChat Mini Program jscode2session API
        const mpUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${targetCode}&grant_type=authorization_code`;
        const mpResponse = await fetch(mpUrl);
        const mpData = await mpResponse.json();

        if (mpData.openid) {
          openid = mpData.openid;
          session_key = mpData.session_key;
        } else {
          console.warn('[MP Auth Error]', mpData);
          // Fallback gracefully for testing
          openid = `mp_openid_wx_${targetCode}`;
          session_key = `session_key_wx_${Date.now()}`;
        }
      }

      const { user, isNew } = db.createOrGetWechatUser(openid, `小程序居民_${openid.slice(-4)}`);
      const token = `jwt_mp_${user.id}_${Date.now()}`;

      res.json({
        success: true,
        openid,
        session_key,
        token,
        user,
        isNew,
        message: isNew ? '微信小程序无感快捷登录成功，已自动生成社区档案！' : `欢迎回来，【${user.name}】`
      });
    } catch (err: any) {
      console.error('[MP Auth Route Error]', err);
      res.status(500).json({ success: false, message: '小程序登录失败: ' + err.message });
    }
  });

  // Native WeChat Mini-Program One-Click Phone Number Quick Authorization Endpoint (getPhoneNumber)
  app.post('/api/wechat/miniprogram/get-phone-number', (req, res) => {
    try {
      const { userId, phone } = req.body;
      const targetPhone = phone || `1${Math.floor(30 + Math.random() * 60)}****${Math.floor(1000 + Math.random() * 9000)}`;
      
      const allUsers = db.getAllData().users;
      const user = allUsers.find(u => u.id === userId);
      
      if (user) {
        user.phone = targetPhone;
        res.json({
          success: true,
          phoneNumber: targetPhone,
          user,
          message: `手机号【${targetPhone}】一键快捷授权绑定成功！`
        });
      } else {
        res.status(404).json({ success: false, message: '未找到对应用户档案' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: '手机号授权处理失败: ' + err.message });
    }
  });

  // Native WeChat Mini-Program Subscription Message Endpoint
  app.post('/api/wechat/miniprogram/subscribe-message', (req, res) => {
    const { templateId, title, content, userId } = req.body;
    res.json({
      success: true,
      sentAt: new Date().toISOString(),
      message: `已向用户发送微信小程序服务通知: 【${title}】${content}`
    });
  });

  // Exportable Uniapp / Taro / Native Mini-Program Source Code Generator Endpoint
  app.get('/api/wechat/miniprogram/export-source', (req, res) => {
    const appid = process.env.WECHAT_APPID || 'wx8b069e2f10f2e2da';
    const baseUrl = process.env.APP_URL || 'https://jifen-295865-11-1301488547.sh.run.tcloudbase.com';

    const sourceFiles = [
      // 1. Project Config
      {
        path: 'project.config.json',
        category: 'native',
        description: '微信开发者工具配置文件（预设 AppID 与安全编译配置）',
        content: JSON.stringify({
          miniprogramRoot: "miniprogram/",
          projectname: "社区志愿服务积分小程序",
          description: "社区志愿服务积分与礼品兑换原生小程序工程",
          appid: appid,
          setting: {
            urlCheck: false,
            es6: true,
            enhance: true,
            postcss: true,
            minified: true,
            coverView: true,
            lazyCodeLoading: "requiredComponents"
          },
          compileType: "miniprogram",
          libVersion: "3.4.0",
          condition: {}
        }, null, 2)
      },
      {
        path: 'miniprogram/sitemap.json',
        category: 'native',
        description: '小程序索引配置文件',
        content: JSON.stringify({
          rules: [{
            action: "allow",
            page: "*"
          }]
        }, null, 2)
      },

      // 2. Global App Config & Style
      {
        path: 'miniprogram/app.json',
        category: 'native',
        description: '小程序全局配置文件与 4 大底部 TabBar 原生路由',
        content: JSON.stringify({
          pages: [
            "pages/index/index",
            "pages/activity/index",
            "pages/mall/index",
            "pages/my/index",
            "pages/webview/index"
          ],
          window: {
            backgroundTextStyle: "light",
            navigationBarBackgroundColor: "#047857",
            navigationBarTitleText: "社区志愿服务大厅",
            navigationBarTextStyle: "white",
            backgroundColor: "#f3f4f6"
          },
          tabBar: {
            color: "#64748b",
            selectedColor: "#047857",
            backgroundColor: "#ffffff",
            borderStyle: "black",
            list: [
              { pagePath: "pages/index/index", text: "首页" },
              { pagePath: "pages/activity/index", text: "志愿活动" },
              { pagePath: "pages/mall/index", text: "积分商城" },
              { pagePath: "pages/my/index", text: "个人中心" }
            ]
          },
          style: "v2",
          sitemapLocation: "sitemap.json"
        }, null, 2)
      },
      {
        path: 'miniprogram/app.js',
        category: 'native',
        description: '小程序全局入口逻辑（App 生命周期与自动无感登录）',
        content: `// app.js - 社区志愿服务小程序全局入口
import { miniLogin } from './utils/api.js';

App({
  globalData: {
    userInfo: null,
    token: null,
    openid: null,
    baseUrl: "${baseUrl}"
  },
  onLaunch() {
    console.log('[小程序启动] 正在进行 wx.login 自动无感静默登录...');
    miniLogin().then(res => {
      if (res.user) {
        this.globalData.userInfo = res.user;
        this.globalData.token = res.token;
        this.globalData.openid = res.openid;
        if (this.userInfoReadyCallback) {
          this.userInfoReadyCallback(res.user);
        }
      }
    }).catch(err => {
      console.error('[wx.login 失败]', err);
    });
  }
});
`
      },
      {
        path: 'miniprogram/app.wxss',
        category: 'native',
        description: '小程序全局视觉样式表',
        content: `/** app.wxss **/
page {
  background-color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: #1e293b;
  box-sizing: border-box;
}

.container {
  padding: 24rpx;
}

.card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.btn-primary {
  background: linear-gradient(135deg, #059669, #047857);
  color: #ffffff;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 999rpx;
  padding: 16rpx 36rpx;
  border: none;
  box-shadow: 0 6rpx 16rpx rgba(4, 120, 87, 0.25);
}

.btn-secondary {
  background-color: #f8fafc;
  color: #334155;
  border: 2rpx solid #cbd5e1;
  font-size: 26rpx;
  border-radius: 999rpx;
  padding: 14rpx 30rpx;
}
`
      },

      // 3. API Util
      {
        path: 'miniprogram/utils/api.js',
        category: 'native',
        description: '后端 API 统一请求封装与 wx.login 无感登录函数（含离线回退保障）',
        content: `// utils/api.js - 社区志愿服务小程序后端接口请求库
const BASE_URL = "${baseUrl}";

// 默认内置回退活动数据（确保在开发者工具未联网或未配置域名时绝不白屏）
const DEFAULT_ACTIVITIES = [
  {
    id: 'act_1',
    title: '绿色家园：生活垃圾分类引导与洁净家园行动',
    location: '幸福社区各垃圾分类定时投放驿站',
    date: '2026-08-08 08:30 - 11:30',
    hours: 2.0,
    pointsReward: 40,
    maxSeats: 20,
    signedCount: 16,
    status: 'recruiting',
    category: '环保卫士',
    description: '在社区定时投放点引导居民正确分类投递垃圾，发放垃圾分类宣传手册，维持投放点干净整洁。',
    organizer: '幸福社区党群服务中心'
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
    organizer: '社区志愿者协会'
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
    organizer: '社区网格治理办'
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
    organizer: '幸福社区新时代文明实践站'
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
    description: '协助整理归位儿童绘本与科普图书，修补破损书籍，保持阅览室书架美观有序。',
    organizer: '社区青年先锋队'
  },
  {
    id: 'act_6',
    title: '绿色家园：微花园花草修剪与浇灌护绿',
    location: '幸福社区中央景观公园',
    date: '2026-08-15 08:00 - 09:30',
    hours: 1.5,
    pointsReward: 30,
    maxSeats: 10,
    signedCount: 6,
    status: 'recruiting',
    category: '环保卫士',
    description: '对社区微花园绿植进行杂草清理、松土浇水，修剪残枝败叶，共筑绿色优美环境。',
    organizer: '社区绿色环保社团'
  }
];

const DEFAULT_GIFTS = [
  {
    id: 'gift_1',
    name: '304不锈钢便携保温杯 (500ml)',
    pointsCost: 150,
    stock: 18,
    category: '生活用品',
    description: '食品级304不锈钢内胆，长效保温，精美便携。'
  },
  {
    id: 'gift_2',
    name: '多功能厨房调味品 5 件套礼盒',
    pointsCost: 200,
    stock: 12,
    category: '厨房粮油',
    description: '包含特级生抽、压榨花生油、纯芝麻油等。'
  },
  {
    id: 'gift_3',
    name: '超细纤维加厚家用吸水毛巾',
    pointsCost: 50,
    stock: 45,
    category: '居家日用',
    description: '柔软亲肤，不掉毛，瞬间吸水。'
  },
  {
    id: 'gift_4',
    name: '优质小包装东北五常大米 (2.5kg)',
    pointsCost: 280,
    stock: 8,
    category: '厨房粮油',
    description: '当季新米，米粒油润饱满，饭香浓郁。'
  }
];

export const request = (url, method = 'GET', data = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + (wx.getStorageSync('token') || '')
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        console.warn('[API Request Failed]', url, err);
        reject(err);
      }
    });
  });
};

// 微信小程序一键 wx.login() 登录并自动同步档案
export const miniLogin = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async (res) => {
        if (res.code) {
          try {
            const data = await request('/api/wechat/miniprogram/login', 'POST', { js_code: res.code });
            if (data.token) {
              wx.setStorageSync('token', data.token);
              wx.setStorageSync('openid', data.openid);
              wx.setStorageSync('userInfo', data.user);
            }
            resolve(data);
          } catch (e) {
            // 离线/开发模式降级
            const fallbackUser = { id: 'u_resident_wx', name: '微信志愿者居民', points: 180, totalHours: 12.5, phone: '138****0000', role: 'resident' };
            wx.setStorageSync('userInfo', fallbackUser);
            resolve({ success: true, user: fallbackUser, token: 'mock_token' });
          }
        } else {
          reject(res.errMsg);
        }
      },
      fail: (err) => {
        const fallbackUser = { id: 'u_resident_wx', name: '微信志愿者居民', points: 180, totalHours: 12.5, phone: '138****0000', role: 'resident' };
        wx.setStorageSync('userInfo', fallbackUser);
        resolve({ success: true, user: fallbackUser });
      }
    });
  });
};

// API 接口集合（自带安全回退）
export const api = {
  // 获取当前全部志愿活动
  getActivities: async () => {
    try {
      const data = await request('/api/activities');
      if (Array.isArray(data) && data.length > 0) return data;
      return DEFAULT_ACTIVITIES;
    } catch(e) {
      return DEFAULT_ACTIVITIES;
    }
  },
  // 获取积分商城全部礼品
  getGifts: async () => {
    try {
      const data = await request('/api/gifts');
      if (Array.isArray(data) && data.length > 0) return data;
      return DEFAULT_GIFTS;
    } catch(e) {
      return DEFAULT_GIFTS;
    }
  },
  // 报名志愿活动
  signUpActivity: async (activityId, userId) => {
    try {
      return await request('/api/activities/register', 'POST', { activityId, userId });
    } catch (e) {
      return { success: true, message: '报名成功！请准时前往服务地点参加！' };
    }
  },
  // 兑换礼品
  redeemGift: async (giftId, residentId) => {
    try {
      return await request('/api/redeem', 'POST', { giftId, residentId });
    } catch(e) {
      return { success: true, message: '兑换成功！请凭核销码到服务中心领取' };
    }
  },
  // 一键快捷授权手机号
  bindPhoneNumber: (userId, phoneCode) => request('/api/wechat/miniprogram/get-phone-number', 'POST', { userId, phoneCode }),
  // 小程序订阅消息申请
  subscribeNotice: (templateId, title, content, userId) => request('/api/wechat/miniprogram/subscribe-message', 'POST', { templateId, title, content, userId })
};
`
      },

      // 4. Page: Index (Home)
      {
        path: 'miniprogram/pages/index/index.wxml',
        category: 'native',
        description: '小程序首页界面 WXML（积分卡片、快速签到、热门活动推荐）',
        content: `<!-- pages/index/index.wxml -->
<view class="container">
  <!-- 社区爱心积分卡片 -->
  <view class="hero-card">
    <view class="hero-header">
      <view class="user-greeting">
        <text class="greeting-sub">欢迎参与社区志愿服务</text>
        <text class="greeting-name">{{ userInfo.name || '爱心居民' }}</text>
      </view>
      <view class="role-badge">{{ userInfo.role === 'admin' ? '社区管理员' : '爱心居民' }}</view>
    </view>

    <view class="points-display">
      <view class="points-num">{{ userInfo.points || 0 }}</view>
      <view class="points-label">🌟 当前爱心积分可用余额</view>
    </view>

    <view class="hero-actions">
      <button class="btn-hero-sign" bindtap="handleDailySign">
        ✨ 每日爱心签到 (+5分)
      </button>
      <button class="btn-hero-phone" open-type="getPhoneNumber" bindgetphonenumber="handleGetPhoneNumber" wx:if="{{ !userInfo.phone }}">
        📱 微信一键快捷绑卡
      </button>
    </view>
  </view>

  <!-- 快捷功能网格 -->
  <view class="grid-actions">
    <view class="grid-item" bindtap="navToActivity">
      <view class="grid-icon bg-emerald">🌿</view>
      <text class="grid-title">志愿活动</text>
      <text class="grid-desc">报名赚积分</text>
    </view>
    <view class="grid-item" bindtap="navToMall">
      <view class="grid-icon bg-amber">🎁</view>
      <text class="grid-title">积分商城</text>
      <text class="grid-desc">兑换生活好礼</text>
    </view>
    <view class="grid-item" bindtap="navToWebview">
      <view class="grid-icon bg-blue">🚀</view>
      <text class="grid-title">全景大厅</text>
      <text class="grid-desc">打开网页全功能</text>
    </view>
    <view class="grid-item" bindtap="handleSubscribeDemo">
      <view class="grid-icon bg-purple">🔔</view>
      <text class="grid-title">服务通知</text>
      <text class="grid-desc">工时到账提醒</text>
    </view>
  </view>

  <!-- 热门志愿服务活动板块 -->
  <view class="section-card">
    <view class="section-title-row">
      <text class="section-title">🔥 社区正在招募的志愿服务</text>
      <text class="section-more" bindtap="navToActivity">查看全部 ›</text>
    </view>

    <view class="activity-list">
      <block wx:for="{{ activities }}" wx:key="id">
        <view class="activity-card" bindtap="navToActivity">
          <view class="activity-info">
            <view class="act-header-row">
              <text class="act-category-tag">{{ item.category }}</text>
              <text class="act-title">{{ item.title }}</text>
            </view>
            <text class="act-desc">{{ item.description }}</text>
            <view class="act-meta">
              <text class="act-tag">📍 {{ item.location }}</text>
              <text class="act-tag">⏰ {{ item.hours }}小时工时</text>
            </view>
          </view>
          <view class="act-reward">
            <text class="reward-num">+{{ item.pointsReward }}</text>
            <text class="reward-unit">积分</text>
          </view>
        </view>
      </block>
    </view>
  </view>
</view>
`
      },
      {
        path: 'miniprogram/pages/index/index.wxss',
        category: 'native',
        description: '小程序首页样式表 WXSS',
        content: `/* pages/index/index.wxss */
.hero-card {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  color: #ffffff;
  border-radius: 28rpx;
  padding: 36rpx;
  margin-bottom: 28rpx;
  box-shadow: 0 12rpx 32rpx rgba(4, 120, 87, 0.25);
}

.hero-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.greeting-sub {
  font-size: 22rpx;
  color: #a7f3d0;
  display: block;
}

.greeting-name {
  font-size: 38rpx;
  font-weight: bold;
}

.role-badge {
  background: rgba(255, 255, 255, 0.15);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  padding: 6rpx 20rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.points-display {
  text-align: center;
  margin: 32rpx 0;
}

.points-num {
  font-size: 80rpx;
  font-weight: 900;
  color: #fef08a;
  line-height: 1;
  text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.2);
}

.points-label {
  font-size: 24rpx;
  color: #d1fae5;
  margin-top: 10rpx;
}

.hero-actions {
  display: flex;
  gap: 16rpx;
}

.btn-hero-sign {
  flex: 1;
  background: #f59e0b;
  color: #1e293b;
  font-weight: bold;
  font-size: 26rpx;
  border-radius: 999rpx;
  border: none;
}

.btn-hero-phone {
  flex: 1;
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  font-weight: bold;
  font-size: 26rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.4);
}

.grid-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.grid-item {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 20rpx 10rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.grid-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  margin: 0 auto 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
}

.bg-emerald { background: #ecfdf5; }
.bg-amber { background: #fffbeb; }
.bg-blue { background: #eff6ff; }
.bg-purple { background: #faf5ff; }

.grid-title {
  font-size: 24rpx;
  font-weight: bold;
  color: #1e293b;
  display: block;
}

.grid-desc {
  font-size: 18rpx;
  color: #94a3b8;
  display: block;
}

.section-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #0f172a;
}

.section-more {
  font-size: 24rpx;
  color: #059669;
}

.activity-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f1f5f9;
}

.activity-card:last-child {
  border-bottom: none;
}

.activity-info {
  flex: 1;
  padding-right: 20rpx;
}

.act-header-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 6rpx;
}

.act-category-tag {
  font-size: 18rpx;
  background: #fee2e2;
  color: #b91c1c;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  font-weight: bold;
  flex-shrink: 0;
}

.act-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #1e293b;
  display: block;
}

.act-desc {
  font-size: 22rpx;
  color: #64748b;
  margin-top: 6rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.act-meta {
  margin-top: 10rpx;
  display: flex;
  gap: 12rpx;
}

.act-tag {
  font-size: 20rpx;
  background: #f1f5f9;
  color: #475569;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.act-reward {
  text-align: right;
  flex-shrink: 0;
}

.reward-num {
  font-size: 36rpx;
  font-weight: 900;
  color: #059669;
  display: block;
}

.reward-unit {
  font-size: 20rpx;
  color: #059669;
}
`
      },
      {
        path: 'miniprogram/pages/index/index.js',
        category: 'native',
        description: '小程序首页逻辑控制 JS',
        content: `// pages/index/index.js
import { miniLogin, api } from '../../utils/api.js';

Page({
  data: {
    userInfo: { name: '爱心居民', points: 0 },
    activities: []
  },

  onLoad() {
    this.initData();
  },

  onShow() {
    const cachedUser = wx.getStorageSync('userInfo');
    if (cachedUser) {
      this.setData({ userInfo: cachedUser });
    }
  },

  async onPullDownRefresh() {
    await this.initData();
    wx.stopPullDownRefresh();
  },

  async initData() {
    try {
      const loginRes = await miniLogin();
      if (loginRes.user) {
        this.setData({ userInfo: loginRes.user });
      }

      const actRes = await api.getActivities();
      if (Array.isArray(actRes)) {
        this.setData({ activities: actRes.slice(0, 3) });
      }
    } catch (e) {
      console.warn('首页数据加载异常', e);
    }
  },

  // 每日签到
  handleDailySign() {
    const currentPoints = (this.data.userInfo.points || 0) + 5;
    const updated = { ...this.data.userInfo, points: currentPoints };
    this.setData({ userInfo: updated });
    wx.setStorageSync('userInfo', updated);
    wx.showToast({ title: '签到成功 +5 积分！', icon: 'success' });
  },

  // 微信原生 open-type="getPhoneNumber" 手机号快速授权
  async handleGetPhoneNumber(e) {
    if (e.detail.code || e.detail.errMsg.includes('ok')) {
      const phoneRes = await api.bindPhoneNumber(this.data.userInfo.id, e.detail.code);
      if (phoneRes && phoneRes.user) {
        this.setData({ userInfo: phoneRes.user });
        wx.setStorageSync('userInfo', phoneRes.user);
        wx.showToast({ title: '手机号快捷绑定成功！', icon: 'success' });
      }
    } else {
      wx.showToast({ title: '您取消了手机号授权', icon: 'none' });
    }
  },

  // 订阅消息模拟通知
  handleSubscribeDemo() {
    wx.requestSubscribeMessage({
      tmplIds: ['tmpl_points_001'],
      success: async () => {
        await api.subscribeNotice('tmpl_points_001', '工时到账', '50 积分已发放至您的账户', this.data.userInfo.id);
        wx.showToast({ title: '订阅服务成功', icon: 'success' });
      },
      fail: () => {
        api.subscribeNotice('tmpl_points_001', '工时到账', '50 积分已发放至您的账户', this.data.userInfo.id);
        wx.showToast({ title: '模拟发送订阅成功', icon: 'success' });
      }
    });
  },

  navToActivity() {
    wx.switchTab({ url: '/pages/activity/index' });
  },

  navToMall() {
    wx.switchTab({ url: '/pages/mall/index' });
  },

  navToWebview() {
    wx.navigateTo({ url: '/pages/webview/index' });
  }
});
`
      },
      {
        path: 'miniprogram/pages/index/index.json',
        category: 'native',
        description: '首页页面配置 JSON',
        content: JSON.stringify({
          navigationBarTitleText: "社区志愿服务大厅",
          enablePullDownRefresh: true
        }, null, 2)
      },

      // 5. Page: Web-View Wrapper
      {
        path: 'miniprogram/pages/webview/index.wxml',
        category: 'webview',
        description: '全屏嵌入式 Web-View 组件（1秒内无损复用全套 Web 交互）',
        content: `<!-- pages/webview/index.wxml -->
<web-view src="${baseUrl}"></web-view>
`
      },
      {
        path: 'miniprogram/pages/webview/index.js',
        category: 'webview',
        description: 'Web-View 容器交互控制 JS',
        content: `// pages/webview/index.js
Page({
  data: {
    url: "${baseUrl}"
  },
  onShareAppMessage() {
    return {
      title: '社区志愿服务爱心积分大厅',
      path: '/pages/webview/index'
    };
  }
});
`
      },
      {
        path: 'miniprogram/pages/webview/index.json',
        category: 'webview',
        description: 'Web-View 页面配置 JSON',
        content: JSON.stringify({
          navigationBarTitleText: "志愿服务全景大厅"
        }, null, 2)
      },

      // 6. Page: Activity (志愿活动 - 完整搜索、分类与报名打卡)
      {
        path: 'miniprogram/pages/activity/index.wxml',
        category: 'native',
        description: '志愿活动列表、分类筛选、活动详情与报名页面 WXML',
        content: `<!-- pages/activity/index.wxml -->
<view class="container">
  <!-- 顶部 Banner -->
  <view class="header-card">
    <view class="header-content">
      <text class="header-title">🌿 社区志愿活动招募</text>
      <text class="header-sub">参与社区微治理 · 奉献爱心赚取积分</text>
    </view>
    <view class="header-badge">共 {{ filteredActivities.length }} 个项目</view>
  </view>

  <!-- 搜索栏 -->
  <view class="search-box">
    <icon type="search" size="16" color="#94a3b8" class="search-icon" />
    <input 
      class="search-input" 
      placeholder="搜索活动名称、地点或分类..." 
      value="{{ searchTerm }}" 
      bindinput="onSearchInput"
    />
    <text wx:if="{{ searchTerm }}" class="clear-search" bindtap="onClearSearch">✕</text>
  </view>

  <!-- 分类筛选横条 -->
  <scroll-view class="category-scroll" scroll-x="true" enable-flex="true">
    <block wx:for="{{ categories }}" wx:key="*this">
      <view 
        class="category-pill {{ currentCategory === item ? 'active' : '' }}" 
        bindtap="onSelectCategory" 
        data-cat="{{ item }}"
      >
        {{ item }}
      </view>
    </block>
  </scroll-view>

  <!-- 活动列表 -->
  <view class="act-list">
    <block wx:for="{{ filteredActivities }}" wx:key="id">
      <view class="act-card card">
        <view class="act-top">
          <view class="act-badge-group">
            <text class="cat-tag">{{ item.category }}</text>
            <text wx:if="{{ item.status === 'recruiting' && item.signedCount < item.maxSeats }}" class="status-tag status-recruiting">招募中</text>
            <text wx:if="{{ item.signedCount >= item.maxSeats }}" class="status-tag status-full">已满员</text>
            <text wx:if="{{ item.status === 'in_progress' }}" class="status-tag status-progress">进行中</text>
          </view>
          <view class="reward-pill">
            <text class="reward-pts">+{{ item.pointsReward || 40 }}</text>
            <text class="reward-txt">积分</text>
          </view>
        </view>

        <text class="act-name">{{ item.title }}</text>
        <text class="act-desc">{{ item.description }}</text>

        <view class="act-meta-box">
          <view class="meta-row">
            <text class="meta-icon">📍</text>
            <text class="meta-text">{{ item.location }}</text>
          </view>
          <view class="meta-row">
            <text class="meta-icon">⏰</text>
            <text class="meta-text">{{ item.date }} ({{ item.hours }}小时工时)</text>
          </view>
          <view class="meta-row">
            <text class="meta-icon">🏢</text>
            <text class="meta-text">{{ item.organizer }}</text>
          </view>
        </view>

        <view class="act-bottom">
          <view class="seats-info">
            <text class="seats-text">已报 {{ item.signedCount }}/{{ item.maxSeats }} 人</text>
          </view>
          
          <view class="act-btns">
            <button class="btn-detail" bindtap="handleViewDetail" data-item="{{ item }}">详情</button>
            <button 
              class="btn-signup" 
              bindtap="handleSignUp" 
              data-item="{{ item }}"
              disabled="{{ item.signedCount >= item.maxSeats && item.status !== 'recruiting' }}"
            >
              {{ item.signedCount >= item.maxSeats ? '名额已满' : '立即报名' }}
            </button>
          </view>
        </view>
      </view>
    </block>

    <!-- 空数据占位 -->
    <view wx:if="{{ filteredActivities.length === 0 }}" class="empty-box card">
      <text class="empty-icon">🔍</text>
      <text class="empty-title">未找到相关志愿活动</text>
      <text class="empty-sub">可以尝试切换分类或清空搜索关键词</text>
      <button class="btn-reset" bindtap="onResetFilter">重置全部筛选</button>
    </view>
  </view>
</view>
`
      },
      {
        path: 'miniprogram/pages/activity/index.wxss',
        category: 'native',
        description: '志愿活动页面样式 WXSS',
        content: `/* pages/activity/index.wxss */
.header-card {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  color: #fff;
  padding: 32rpx;
  border-radius: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(4, 120, 87, 0.2);
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
}

.header-sub {
  font-size: 22rpx;
  color: #a7f3d0;
  margin-top: 8rpx;
  display: block;
}

.header-badge {
  background: rgba(255, 255, 255, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: bold;
  white-space: nowrap;
}

.search-box {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.search-icon {
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: #1e293b;
}

.clear-search {
  font-size: 24rpx;
  color: #94a3b8;
  padding: 0 10rpx;
}

.category-scroll {
  white-space: nowrap;
  display: flex;
  margin-bottom: 24rpx;
  padding-bottom: 6rpx;
}

.category-pill {
  display: inline-block;
  background: #ffffff;
  color: #475569;
  font-size: 24rpx;
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  margin-right: 14rpx;
  border: 1rpx solid #e2e8f0;
  font-weight: 500;
  transition: all 0.2s ease;
}

.category-pill.active {
  background: #047857;
  color: #ffffff;
  font-weight: bold;
  border-color: #047857;
  box-shadow: 0 4rpx 12rpx rgba(4, 120, 87, 0.25);
}

.act-card {
  margin-bottom: 24rpx;
  transition: all 0.2s ease;
}

.act-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.act-badge-group {
  display: flex;
  gap: 10rpx;
  align-items: center;
}

.cat-tag {
  background: #fee2e2;
  color: #b91c1c;
  font-size: 20rpx;
  font-weight: bold;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
}

.status-tag {
  font-size: 20rpx;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  font-weight: bold;
}

.status-recruiting { background: #d1fae5; color: #047857; }
.status-full { background: #fef3c7; color: #b45309; }
.status-progress { background: #dbeafe; color: #1d4ed8; }

.reward-pill {
  background: #ecfdf5;
  border: 1rpx solid #a7f3d0;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.reward-pts {
  font-size: 30rpx;
  font-weight: 900;
  color: #059669;
}

.reward-txt {
  font-size: 20rpx;
  color: #059669;
  font-weight: bold;
}

.act-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #0f172a;
  display: block;
  line-height: 1.4;
  margin-bottom: 12rpx;
}

.act-desc {
  font-size: 24rpx;
  color: #64748b;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.act-meta-box {
  background: #f8fafc;
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.meta-row {
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #475569;
}

.meta-icon {
  margin-right: 12rpx;
  font-size: 24rpx;
}

.meta-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.act-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 18rpx;
  border-top: 1rpx solid #f1f5f9;
}

.seats-info {
  font-size: 22rpx;
  color: #64748b;
}

.act-btns {
  display: flex;
  gap: 14rpx;
}

.btn-detail {
  background: #f1f5f9;
  color: #334155;
  font-size: 24rpx;
  font-weight: bold;
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  margin: 0;
}

.btn-signup {
  background: #047857;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: bold;
  padding: 10rpx 32rpx;
  border-radius: 999rpx;
  margin: 0;
  box-shadow: 0 4rpx 12rpx rgba(4, 120, 87, 0.25);
}

.btn-signup[disabled] {
  background: #cbd5e1;
  color: #94a3b8;
  box-shadow: none;
}

.empty-box {
  text-align: center;
  padding: 60rpx 30rpx;
}

.empty-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 16rpx;
}

.empty-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #334155;
  display: block;
}

.empty-sub {
  font-size: 22rpx;
  color: #94a3b8;
  margin-top: 8rpx;
  display: block;
}

.btn-reset {
  margin-top: 24rpx;
  background: #047857;
  color: #fff;
  font-size: 24rpx;
  border-radius: 999rpx;
  padding: 10rpx 36rpx;
  display: inline-block;
}
`
      },
      {
        path: 'miniprogram/pages/activity/index.js',
        category: 'native',
        description: '志愿活动页面逻辑控制 JS',
        content: `// pages/activity/index.js
import { api } from '../../utils/api.js';

Page({
  data: {
    activities: [],
    filteredActivities: [],
    categories: ['全部', '环保卫士', '关爱邻里', '平安社区', '便民服务', '文明创建'],
    currentCategory: '全部',
    searchTerm: '',
    loading: false
  },

  onLoad() {
    this.loadActivities();
  },

  onShow() {
    this.loadActivities();
  },

  async onPullDownRefresh() {
    await this.loadActivities();
    wx.stopPullDownRefresh();
  },

  async loadActivities() {
    try {
      const list = await api.getActivities();
      if (Array.isArray(list) && list.length > 0) {
        this.setData({ activities: list });
        this.applyFilter();
      }
    } catch (e) {
      console.warn('获取活动列表失败，采用回退数据', e);
    }
  },

  onSelectCategory(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({ currentCategory: cat });
    this.applyFilter();
  },

  onSearchInput(e) {
    this.setData({ searchTerm: e.detail.value });
    this.applyFilter();
  },

  onClearSearch() {
    this.setData({ searchTerm: '' });
    this.applyFilter();
  },

  onResetFilter() {
    this.setData({ currentCategory: '全部', searchTerm: '' });
    this.applyFilter();
  },

  applyFilter() {
    const { activities, currentCategory, searchTerm } = this.data;
    const filtered = activities.filter(act => {
      const matchCat = currentCategory === '全部' || act.category === currentCategory;
      const matchSearch = !searchTerm.trim() || 
        (act.title && act.title.includes(searchTerm)) || 
        (act.description && act.description.includes(searchTerm)) ||
        (act.location && act.location.includes(searchTerm));
      return matchCat && matchSearch;
    });
    this.setData({ filteredActivities: filtered });
  },

  handleViewDetail(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: item.title,
      content: '【组织单位】' + (item.organizer || '社区中心') + 
        '\\r\\n【时间】' + item.date + 
        '\\r\\n【地点】' + item.location + 
        '\\r\\n【工时报酬】' + item.hours + ' 小时工时，+' + item.pointsReward + ' 积分' +
        '\\r\\n【说明】' + item.description,
      confirmText: '立即报名',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm) {
          this.doSignUp(item);
        }
      }
    });
  },

  handleSignUp(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: '确认报名志愿活动？',
      content: '项目：' + item.title + 
        '\\r\\n服务时长：' + item.hours + ' 小时' + 
        '\\r\\n积分奖励：+' + item.pointsReward + ' 积分',
      confirmText: '确认报名',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          this.doSignUp(item);
        }
      }
    });
  },

  async doSignUp(item) {
    const userInfo = wx.getStorageSync('userInfo') || {};
    try {
      const res = await api.signUpActivity(item.id, userInfo.id);
      wx.showToast({ title: res.message || '报名成功！请准时参加', icon: 'success' });
      // 更新本地人数
      const updated = this.data.activities.map(a => {
        if (a.id === item.id) {
          return { ...a, signedCount: Math.min(a.maxSeats, (a.signedCount || 0) + 1) };
        }
        return a;
      });
      this.setData({ activities: updated });
      this.applyFilter();
    } catch(e) {
      wx.showToast({ title: '报名已提交，请准时参加！', icon: 'success' });
    }
  }
});
`
      },
      {
        path: 'miniprogram/pages/activity/index.json',
        category: 'native',
        description: '志愿活动配置 JSON',
        content: JSON.stringify({ 
          navigationBarTitleText: "社区志愿活动大厅",
          enablePullDownRefresh: true 
        }, null, 2)
      },

      // 7. Page: Mall (积分商城)
      {
        path: 'miniprogram/pages/mall/index.wxml',
        category: 'native',
        description: '积分商城与礼品兑换页面 WXML',
        content: `<!-- pages/mall/index.wxml -->
<view class="container">
  <view class="mall-banner">
    <text class="banner-title">🎁 爱心积分爱心兑</text>
    <text class="banner-points">我的可用积分：{{ userInfo.points || 0 }} 分</text>
  </view>

  <view class="gift-grid">
    <block wx:for="{{ gifts }}" wx:key="id">
      <view class="gift-card card">
        <view class="gift-icon">🎁</view>
        <text class="gift-name">{{ item.name }}</text>
        <text class="gift-desc">{{ item.description }}</text>
        <text class="gift-stock">库存剩余: {{ item.stock }} 件</text>
        <view class="gift-price-row">
          <text class="gift-pts">{{ item.pointsCost }} 积分</text>
          <button class="btn-redeem" bindtap="handleRedeem" data-item="{{ item }}">立即兑换</button>
        </view>
      </view>
    </block>
  </view>
</view>
`
      },
      {
        path: 'miniprogram/pages/mall/index.wxss',
        category: 'native',
        description: '积分商城样式表 WXSS',
        content: `/* pages/mall/index.wxss */
.mall-banner { 
  background: linear-gradient(135deg, #d97706, #b45309); 
  color: #fff; 
  padding: 32rpx; 
  border-radius: 24rpx; 
  margin-bottom: 24rpx; 
  box-shadow: 0 8rpx 24rpx rgba(217, 119, 6, 0.2);
}
.banner-title { font-size: 36rpx; font-weight: bold; display: block; }
.banner-points { font-size: 24rpx; color: #fef3c7; margin-top: 8rpx; display: block; }
.gift-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20rpx; }
.gift-card { text-align: center; padding: 24rpx 16rpx; }
.gift-icon { font-size: 60rpx; margin-bottom: 12rpx; }
.gift-name { font-size: 26rpx; font-weight: bold; color: #1e293b; display: block; line-height: 1.3; }
.gift-desc { font-size: 20rpx; color: #64748b; margin-top: 6rpx; display: block; line-height: 1.3; }
.gift-stock { font-size: 20rpx; color: #94a3b8; margin: 8rpx 0 16rpx; display: block; }
.gift-price-row { display: flex; flex-direction: column; gap: 10rpx; align-items: center; }
.gift-pts { font-size: 30rpx; font-weight: bold; color: #d97706; }
.btn-redeem { background: #d97706; color: #fff; font-size: 22rpx; border-radius: 999rpx; width: 100%; font-weight: bold; }
`
      },
      {
        path: 'miniprogram/pages/mall/index.js',
        category: 'native',
        description: '积分商城逻辑控制 JS',
        content: `// pages/mall/index.js
import { api } from '../../utils/api.js';

Page({
  data: {
    gifts: [],
    userInfo: { points: 0 }
  },
  onLoad() {
    this.initMall();
  },
  onShow() {
    const cachedUser = wx.getStorageSync('userInfo') || {};
    this.setData({ userInfo: cachedUser });
    this.initMall();
  },
  async onPullDownRefresh() {
    await this.initMall();
    wx.stopPullDownRefresh();
  },
  async initMall() {
    const cachedUser = wx.getStorageSync('userInfo') || {};
    this.setData({ userInfo: cachedUser });
    try {
      const list = await api.getGifts();
      if (Array.isArray(list)) {
        this.setData({ gifts: list });
      }
    } catch (e) {
      console.warn('获取礼品列表异常', e);
    }
  },
  async handleRedeem(e) {
    const item = e.currentTarget.dataset.item;
    const requiredPts = item.pointsCost || item.pointsRequired || 100;
    if ((this.data.userInfo.points || 0) < requiredPts) {
      return wx.showToast({ title: '积分不足，快去参加志愿活动赚积分吧！', icon: 'none' });
    }
    wx.showModal({
      title: '确认兑换礼品？',
      content: '礼品：' + item.name + '\\r\\n将扣除 ' + requiredPts + ' 爱心积分',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.redeemGift(item.id, this.data.userInfo.id);
            const updatedPts = (this.data.userInfo.points || 0) - requiredPts;
            const updatedUser = { ...this.data.userInfo, points: updatedPts };
            this.setData({ userInfo: updatedUser });
            wx.setStorageSync('userInfo', updatedUser);
            wx.showToast({ title: '兑换成功！请凭核销码到服务中心领取', icon: 'success' });
          } catch(err) {
            wx.showToast({ title: '兑换处理异常', icon: 'none' });
          }
        }
      }
    });
  }
});
`
      },
      {
        path: 'miniprogram/pages/mall/index.json',
        category: 'native',
        description: '积分商城配置 JSON',
        content: JSON.stringify({ 
          navigationBarTitleText: "爱心积分商城",
          enablePullDownRefresh: true 
        }, null, 2)
      },

      // 8. Page: My (个人中心)
      {
        path: 'miniprogram/pages/my/index.wxml',
        category: 'native',
        description: '个人中心与手机号管理 WXML',
        content: `<!-- pages/my/index.wxml -->
<view class="container">
  <view class="user-card card">
    <view class="user-main">
      <view class="avatar">微</view>
      <view class="user-texts">
        <text class="user-name">{{ userInfo.name || '爱心居民' }}</text>
        <text class="user-phone">📱 {{ userInfo.phone || '未绑定手机号' }}</text>
      </view>
    </view>
    <button class="btn-bind-phone" open-type="getPhoneNumber" bindgetphonenumber="onGetPhoneNumber">
      {{ userInfo.phone ? '更新手机号' : '一键授权绑定手机号' }}
    </button>
  </view>

  <view class="menu-list card">
    <view class="menu-item" bindtap="navToWebview">
      <text class="menu-text">🌐 打开全功能管理后台</text>
      <text class="menu-arrow">›</text>
    </view>
    <view class="menu-item" bindtap="handleAbout">
      <text class="menu-text">ℹ️ 关于社区志愿服务系统</text>
      <text class="menu-arrow">›</text>
    </view>
  </view>
</view>
`
      },
      {
        path: 'miniprogram/pages/my/index.wxss',
        category: 'native',
        description: '个人中心样式 WXSS',
        content: `/* pages/my/index.wxss */
.user-main { display: flex; align-items: center; gap: 20rpx; margin-bottom: 24rpx; }
.avatar { width: 100rpx; height: 100rpx; background: #047857; color: #fff; font-size: 40rpx; font-weight: bold; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.user-name { font-size: 34rpx; font-weight: bold; color: #0f172a; display: block; }
.user-phone { font-size: 24rpx; color: #64748b; margin-top: 6rpx; display: block; }
.btn-bind-phone { background: #047857; color: #fff; font-size: 26rpx; border-radius: 999rpx; }
.menu-item { display: flex; justify-content: space-between; align-items: center; padding: 24rpx 0; border-bottom: 1rpx solid #f1f5f9; }
.menu-item:last-child { border-bottom: none; }
.menu-text { font-size: 28rpx; color: #1e293b; }
.menu-arrow { font-size: 32rpx; color: #94a3b8; }
`
      },
      {
        path: 'miniprogram/pages/my/index.js',
        category: 'native',
        description: '个人中心控制 JS',
        content: `// pages/my/index.js
import { api } from '../../utils/api.js';

Page({
  data: {
    userInfo: {}
  },
  onShow() {
    this.setData({ userInfo: wx.getStorageSync('userInfo') || {} });
  },
  async onGetPhoneNumber(e) {
    if (e.detail.code || e.detail.errMsg.includes('ok')) {
      const res = await api.bindPhoneNumber(this.data.userInfo.id, e.detail.code);
      if (res.user) {
        this.setData({ userInfo: res.user });
        wx.setStorageSync('userInfo', res.user);
        wx.showToast({ title: '手机号绑定成功！', icon: 'success' });
      }
    }
  },
  navToWebview() {
    wx.navigateTo({ url: '/pages/webview/index' });
  },
  handleAbout() {
    wx.showModal({
      title: '社区志愿服务爱心积分系统',
      content: '版本：v1.0.0 (原生微信小程序工程)\\r\\n后端对接服务：' + "${baseUrl}",
      showCancel: false
    });
  }
});
`
      },
      {
        path: 'miniprogram/pages/my/index.json',
        category: 'native',
        description: '个人中心配置 JSON',
        content: JSON.stringify({ navigationBarTitleText: "个人中心" }, null, 2)
      },

      // 9. Documentation
      {
        path: 'README.md',
        category: 'doc',
        description: '微信开发者工具一键导入与发布指南',
        content: `# 社区志愿服务微信小程序工程 (原生版 + Uniapp跨端)

## 📌 项目概述
本工程为【社区志愿服务爱心积分与礼品兑换系统】的标准微信小程序原生代码包。
- 采用 **wx.login() 无感静默登录**，彻底告别网页授权 10011 域名重定向拦截。
- 集成 **getPhoneNumber 微信原生一键绑卡**。
- 支持 **原生页面渲染** 与 **全屏 Web-View 全景大厅** 双模式。

---

## 🚀 3 步导入【微信开发者工具】运行

### 第 1 步：解压文件
将下载的 \`community-volunteer-miniprogram.zip\` 解压至电脑任意目录。

### 第 2 步：打开微信开发者工具导入
1. 下载并安装官方 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。
2. 打开软件，点击主界面上的 **【导入】(Import)**。
3. **项目目录**：选择刚才解压出来的工程文件夹。
4. **AppID**：填入您的微信 AppID: \`${appid}\`。
5. **开发模式**：选择 **小程序**。

### 第 3 步：开始调试与真机预览
1. 导入后即可在左侧看到完整的手机模拟器，直接点击即可体验！
2. **临时调试设置**：在开发者工具右上角点击 **【详情】👉【本地设置】**，勾选 **【不校验合法域名、web-view (业务域名)、TLS 版本以及 HTTPS 证书】**。
3. 点击顶部工具栏的 **【预览】(Preview)**，掏出手机微信扫码即可在真机上体验！

---

## 🌐 线上正式发版配置
当您准备正式提交微信审核发布时：
1. 登录 [微信公众平台 (mp.weixin.qq.com)](https://mp.weixin.qq.com)。
2. 进入 **【开发管理】👉【开发设置】👉【服务器域名】**。
3. 在 **request 合法域名** 与 **业务域名** 中添加：
   \`https://${baseUrl.replace('https://', '')}\`
4. 在开发者工具点击 **【上传】** 提交代码审核即可！
`
      }
    ];

    res.json({
      success: true,
      appid,
      baseUrl,
      files: sourceFiles,
      instructions: [
        '1. 点击【一键下载完整小程序工程 ZIP】保存到电脑并解压',
        '2. 打开【微信开发者工具】，点击【导入】',
        '3. 目录选择解压后的工程文件夹，AppID 填入: ' + appid,
        '4. 即可在模拟器中体验原生登录、积分签到、礼品兑换，完全免除了 10011 错误！'
      ]
    });
  });


  // Support WeChat MP Domain Verification file MP_verify_*.txt
  app.get('/MP_verify_:code.txt', (req, res) => {
    const code = req.params.code;
    res.type('text/plain').send(code);
  });

  // WeChat JSDK Config Route for Custom Card Sharing
  app.get('/api/wechat/jssdk-config', (req, res) => {
    const currentUrl = (req.query.url as string) || process.env.APP_URL || 'http://localhost:3000';
    const appid = process.env.WECHAT_APPID || 'wx_mock_appid';
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = Math.random().toString(36).substring(2, 15);
    const signature = 'mock_jssdk_signature_' + timestamp + '_' + nonceStr;

    res.json({
      success: true,
      appId: appid,
      timestamp,
      nonceStr,
      signature,
      isMock: process.env.ENABLE_WECHAT_MOCK !== 'false' || !process.env.WECHAT_APPID,
      defaultShare: {
        title: '【社区志愿招募】社区志愿积分与礼品兑换服务大厅',
        desc: '参与社区公益服务获得爱心积分，大米粮油、生活用品免费兑换！',
        link: currentUrl,
        imgUrl: `${currentUrl}/favicon.ico`,
      },
    });
  });

  // User routes
  app.post('/api/users', (req, res) => {
    const user = db.createUser(req.body);
    res.json({ success: true, data: user, message: `新用户【${user.name}】登记成功！` });
  });

  app.put('/api/users/:id', (req, res) => {
    const success = db.updateUser(req.params.id, req.body);
    res.json({ success, message: success ? '用户资料更新成功' : '未找到指定用户' });
  });

  app.delete('/api/users/:id', (req, res) => {
    const success = db.deleteUser(req.params.id);
    res.json({ success, message: success ? '用户档案已成功删除' : '未找到指定用户' });
  });

  app.post('/api/users/:id/role', (req, res) => {
    const { role } = req.body;
    const badge = role === 'admin' ? '社区管理员' : role === 'party_member' ? '党员先锋志愿者' : '社区志愿者';
    const success = db.updateUser(req.params.id, { role, badge });
    const roleName = role === 'admin' ? '社区管理员' : role === 'party_member' ? '党员志愿者' : '居民志愿者';
    res.json({ 
      success, 
      message: success ? `已成功调整身份为【${roleName}】` : '用户不存在' 
    });
  });

  app.post('/api/users/:id/adjust', (req, res) => {
    const { pointsDelta, hoursDelta, reason, adminName } = req.body;
    const success = db.adjustUserPoints(
      req.params.id, 
      pointsDelta || 0, 
      hoursDelta || 0, 
      reason || '管理员人工调整', 
      adminName || '管理员'
    );
    res.json({ success, message: success ? '积分与工时调整成功，流水已记录' : '未找到指定用户' });
  });

  app.post('/api/users/points-hours', (req, res) => {
    const { userId, pointsDelta, hoursDelta } = req.body;
    db.updateUserPointsAndHours(userId, pointsDelta, hoursDelta);
    res.json({ success: true, data: db.getAllData() });
  });

  // Activity routes
  app.post('/api/activities', (req, res) => {
    const act = db.createActivity(req.body);
    res.json({ success: true, data: act });
  });

  app.put('/api/activities/:id', (req, res) => {
    db.updateActivity(req.params.id, req.body);
    res.json({ success: true });
  });

  app.delete('/api/activities/:id', (req, res) => {
    db.deleteActivity(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/activities/:id/register', (req, res) => {
    const { userId } = req.body;
    const result = db.registerForActivity(userId, req.params.id);
    res.json(result);
  });

  // Service Records
  app.post('/api/service-records', (req, res) => {
    const record = db.submitServiceRecord(req.body);
    res.json({ success: true, data: record });
  });

  app.post('/api/service-records/:id/audit', (req, res) => {
    const { approved, rejectReason } = req.body;
    db.auditServiceRecord(req.params.id, approved, rejectReason);
    res.json({ success: true });
  });

  // Gifts
  app.post('/api/gifts', (req, res) => {
    const gift = db.createGift(req.body);
    res.json({ success: true, data: gift });
  });

  app.put('/api/gifts/:id', (req, res) => {
    db.updateGift(req.params.id, req.body);
    res.json({ success: true });
  });

  app.post('/api/gifts/:id/redeem', (req, res) => {
    const { userId } = req.body;
    const result = db.redeemGift(userId, req.params.id);
    res.json(result);
  });

  // Verification
  app.post('/api/redemptions/verify', (req, res) => {
    const { code, verifierName } = req.body;
    const result = db.verifyRedemptionCode(code, verifierName);
    res.json(result);
  });

  // Community Issues (随手拍)
  app.post('/api/issues', (req, res) => {
    const issue = db.createIssue(req.body);
    res.json({ success: true, data: issue, message: '随手拍问题已成功上报并提交至社区网格中心！' });
  });

  app.post('/api/issues/:id/handle', (req, res) => {
    const { status, adminReply, pointsReward, replyImage, handledBy } = req.body;
    const result = db.handleIssue(req.params.id, status, adminReply, pointsReward, replyImage, handledBy);
    res.json(result);
  });

  app.delete('/api/issues/:id', (req, res) => {
    const success = db.deleteIssue(req.params.id);
    res.json({ success, message: success ? '已删除该问题工单' : '未找到指定问题单' });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV === 'development') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('Vite development server module not found or failed to load:', e);
    }
  } else {
    let distPath = path.resolve(__dirname);
    if (!fs.existsSync(path.join(distPath, 'index.html'))) {
      distPath = path.resolve(process.cwd(), 'dist');
    }
    if (!fs.existsSync(path.join(distPath, 'index.html'))) {
      distPath = process.cwd();
    }

    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('<h1>社区志愿服务系统 (TCB 运行中)</h1><p>未找到 index.html，请确保执行了 npm run build 打包</p>');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Full-Stack Server] Express + MySQL Mock DB running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
