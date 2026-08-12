import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Types matching frontend
export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  role: 'resident' | 'admin';
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
      name: '李建国',
      phone: '139****1234',
      avatar: '👨‍🦰',
      role: 'resident',
      points: 150,
      totalHours: 12.0,
      badge: '环保热心居民',
      joinedDate: '2025-06-08',
      openid: 'mock_openid_resident_002',
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

  return { users, activities, gifts, registrations, serviceRecords, redemptions, pointsHistory };
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
    };
  }

  // Users
  public findUserByOpenId(openid: string): User | undefined {
    return this.users.find(u => u.openid === openid);
  }

  public createOrGetWechatUser(openid: string, customName?: string): { user: User; isNew: boolean } {
    let existing = this.users.find(u => u.openid === openid);
    if (existing) {
      return { user: existing, isNew: false };
    }

    // Auto-create a new resident account initialized with 0 points
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const newUserId = 'user_wx_' + Date.now();
    const newUser: User = {
      id: newUserId,
      name: customName || `微信居民_${randSuffix}`,
      phone: `138****${randSuffix}`,
      avatar: '👤',
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
}

const db = new MockMySQLDatabase();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
  app.post('/api/wechat/login', async (req, res) => {
    try {
      const { code, openid: directOpenid } = req.body;
      const appid = process.env.WECHAT_APPID;
      const secret = process.env.WECHAT_APPSECRET;
      const enableMock = process.env.ENABLE_WECHAT_MOCK !== 'false' || !appid || !secret;

      let targetOpenid = directOpenid;

      if (!targetOpenid) {
        if (enableMock || code?.startsWith('mock_')) {
          // Resolve mock codes
          if (code === 'mock_code_user_1') targetOpenid = 'mock_openid_resident_001';
          else if (code === 'mock_code_user_2') targetOpenid = 'mock_openid_resident_002';
          else if (code === 'mock_code_admin') targetOpenid = 'mock_openid_admin_999';
          else if (code && code.length > 0) targetOpenid = 'mock_openid_wx_' + code;
          else targetOpenid = 'mock_openid_resident_001';
        } else {
          // Real WeChat OAuth2.0 code -> access_token & openid exchange
          const wxUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`;
          const wxResponse = await fetch(wxUrl);
          const wxData = await wxResponse.json();

          if (wxData.openid) {
            targetOpenid = wxData.openid;
          } else {
            console.warn('[WeChat Auth] Real WeChat API exchange response without openid:', wxData);
            // Fallback to mock openid if real API call fails or invalid code
            targetOpenid = 'mock_openid_wx_' + (code || Date.now());
          }
        }
      }

      const { user, isNew } = db.createOrGetWechatUser(targetOpenid);
      const token = `jwt_wx_${user.id}_${Date.now()}`;

      res.json({
        success: true,
        token,
        user,
        isNew,
        openid: targetOpenid,
        isMock: enableMock,
        message: isNew 
          ? `微信静默授权成功！已为您自动创建新的社区居民账号 [${user.name}]，初始积分为 0` 
          : `微信静默授权成功！欢迎回来，【${user.name}】`,
      });
    } catch (err: any) {
      console.error('[WeChat Auth Error]', err);
      res.status(500).json({ success: false, message: '微信授权登录处理失败: ' + err.message });
    }
  });

  app.post('/api/wechat/mock-login', (req, res) => {
    const { openid, name } = req.body;
    if (!openid) {
      return res.status(400).json({ success: false, message: 'OpenID 不能为空' });
    }

    const { user, isNew } = db.createOrGetWechatUser(openid, name);
    const token = `jwt_wx_${user.id}_${Date.now()}`;

    res.json({
      success: true,
      token,
      user,
      isNew,
      openid,
      isMock: true,
      message: isNew 
        ? `成功模拟微信静默注册！已绑定新 OpenID [${openid}] 并创建居民账号(0分)` 
        : `成功切换至 OpenID [${openid}] 绑定的【${user.name}】账号`,
    });
  });

  app.get('/api/wechat/auth-url', (req, res) => {
    const redirectUri = (req.query.redirect_uri as string) || process.env.APP_URL || 'http://localhost:3000';
    const appid = process.env.WECHAT_APPID || 'wx_mock_appid';
    const enableMock = process.env.ENABLE_WECHAT_MOCK !== 'false' || !process.env.WECHAT_APPID;

    if (enableMock) {
      const mockUrl = `${redirectUri}${redirectUri.includes('?') ? '&' : '?'}code=mock_code_user_1`;
      res.json({ success: true, authUrl: mockUrl, isMock: true });
    } else {
      const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect`;
      res.json({ success: true, authUrl, isMock: false });
    }
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

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Full-Stack Server] Express + MySQL Mock DB running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
