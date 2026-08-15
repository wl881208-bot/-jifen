export type UserRole = 'resident' | 'party_member' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  role: UserRole;
  points: number;
  totalHours: number;
  badge: string;
  joinedDate: string;
  openid?: string;
}

export interface WechatLoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  isNew?: boolean;
  openid?: string;
  isMock?: boolean;
}

export type ActivityStatus = 'recruiting' | 'in_progress' | 'completed' | 'cancelled';

export interface Activity {
  id: string;
  title: string;
  location: string;
  date: string;
  hours: number;
  pointsReward: number;
  maxSeats: number;
  signedCount: number;
  status: ActivityStatus;
  category: string;
  description: string;
  organizer: string;
  createdAt: string;
}

export type RegistrationStatus = 'registered' | 'attended' | 'completed' | 'cancelled';

export interface Registration {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  userPhone: string;
  activityTitle: string;
  status: RegistrationStatus;
  hours: number;
  pointsReward: number;
  signedAt: string;
}

export type AuditStatus = 'pending' | 'approved' | 'rejected';

export interface ServiceRecord {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  activityId?: string;
  activityTitle: string;
  hours: number;
  pointsEarned: number;
  proofText: string;
  proofImage?: string;
  status: AuditStatus;
  rejectReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

export type GiftStatus = 'on_sale' | 'off_sale';

export interface Gift {
  id: string;
  name: string;
  pointsCost: number;
  stock: number;
  category: string;
  image: string;
  description: string;
  status: GiftStatus;
  createdAt: string;
}

export type RedemptionStatus = 'pending' | 'redeemed' | 'expired';

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
  status: RedemptionStatus;
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
  userRole?: UserRole;
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

export interface MiniProgramSessionResponse {
  success: boolean;
  message?: string;
  openid?: string;
  unionid?: string;
  session_key?: string;
  user?: User;
  token?: string;
  isNew?: boolean;
}

export interface MiniProgramPhoneResponse {
  success: boolean;
  message?: string;
  phoneNumber?: string;
  user?: User;
}

export interface MiniProgramSourceFile {
  path: string;
  content: string;
  description: string;
}

