import React, { useState } from 'react';
import { 
  User, 
  Activity, 
  Gift, 
  Registration, 
  ServiceRecord, 
  Redemption, 
  PointsHistoryItem,
  UserRole,
  SystemEnvMode
} from '../../types';
import { AdminTab } from '../BottomNav';
import { ActivityManage } from './ActivityManage';
import { AuditHours } from './AuditHours';
import { GiftManage } from './GiftManage';
import { RedemptionVerification } from './RedemptionVerification';
import { UserManage } from './UserManage';
import { IssueManage } from './IssueManage';
import { 
  ShieldCheck, 
  Lock, 
  LogIn, 
  Smartphone, 
  ArrowLeft, 
  Users, 
  PlusCircle, 
  ClipboardCheck, 
  Gift as GiftIcon, 
  QrCode, 
  LogOut, 
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Building2,
  CheckCircle2,
  Camera
} from 'lucide-react';
import { CommunityIssue, IssueStatus } from '../../types';

interface AdminPortalProps {
  currentUser: User | null;
  users: User[];
  activities: Activity[];
  gifts: Gift[];
  registrations: Registration[];
  serviceRecords: ServiceRecord[];
  redemptions: Redemption[];
  pointsHistory: PointsHistoryItem[];
  issues: CommunityIssue[];
  adminTab: AdminTab;
  onAdminTabChange: (tab: AdminTab) => void;
  onLoginAsAdmin: (adminUser: User) => void;
  onLogoutAdmin: () => void;
  onNavigateToH5: () => void;
  onResetData: () => void;
  isResetting: boolean;
  // CRUD callbacks
  onCreateActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Promise<{ success: boolean; message?: string }>;
  onUpdateActivity: (id: string, updates: Partial<Activity>) => Promise<{ success: boolean; message?: string }>;
  onDeleteActivity: (id: string) => Promise<{ success: boolean; message?: string }>;
  onAuditServiceRecord: (id: string, status: 'approved' | 'rejected', reviewNote?: string) => Promise<{ success: boolean; message?: string }>;
  onCreateGift: (gift: Omit<Gift, 'id' | 'createdAt'>) => Promise<{ success: boolean; message?: string }>;
  onUpdateGift: (id: string, updates: Partial<Gift>) => Promise<{ success: boolean; message?: string }>;
  onVerifyRedemptionCode: (code: string, verifierName: string) => Promise<{ success: boolean; message: string; redemption?: Redemption }>;
  onCreateUser: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  onUpdateUser: (id: string, updates: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  onDeleteUser: (id: string) => Promise<{ success: boolean; message?: string }>;
  onSetUserRole: (id: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  onAdjustPoints: (id: string, pointsDelta: number, reason: string) => Promise<{ success: boolean; message?: string }>;
  onHandleIssue: (
    id: string, 
    status: IssueStatus, 
    adminReply: string, 
    pointsReward: number, 
    replyImage?: string,
    handledBy?: string
  ) => Promise<{ success: boolean; message?: string }>;
  onDeleteIssue: (id: string) => Promise<{ success: boolean; message?: string }>;
  currentEnvMode?: SystemEnvMode;
  onOpenEnvSwitchModal?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  users,
  activities,
  gifts,
  registrations,
  serviceRecords,
  redemptions,
  pointsHistory,
  issues,
  adminTab,
  onAdminTabChange,
  onLoginAsAdmin,
  onLogoutAdmin,
  onNavigateToH5,
  onResetData,
  isResetting,
  onCreateActivity,
  onUpdateActivity,
  onDeleteActivity,
  onAuditServiceRecord,
  onCreateGift,
  onUpdateGift,
  onVerifyRedemptionCode,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onSetUserRole,
  onAdjustPoints,
  onHandleIssue,
  onDeleteIssue,
  currentEnvMode = 'production',
  onOpenEnvSwitchModal,
}) => {
  // Login form state
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available admin users from db
  const adminUsers = users.filter(u => u.role === 'admin');
  const defaultAdmin = adminUsers[0] || {
    id: 'user_admin',
    openid: 'wx_openid_admin_001',
    name: '王主任 (管理员)',
    phone: '133****9999',
    avatar: '👩‍💼',
    points: 0,
    totalHours: 0,
    badge: '社区管理员',
    role: 'admin',
    joinedDate: '2025-01-01'
  } as User;

  const pendingAuditsCount = serviceRecords.filter(r => r.status === 'pending').length;

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      // Find matching admin by phone or matching default
      const matchedAdmin = users.find(u => u.role === 'admin' && (u.phone.includes(adminPhone) || adminPhone.trim() === 'admin' || adminPhone.trim() === '13399999999' || adminPhone.trim() === '13900000000'));
      
      if (matchedAdmin) {
        onLoginAsAdmin(matchedAdmin);
      } else if (adminUsers.length > 0) {
        // Log in as first admin
        onLoginAsAdmin(adminUsers[0]);
      } else {
        onLoginAsAdmin(defaultAdmin);
      }
      setIsSubmitting(false);
    }, 400);
  };

  // IF NOT AUTHENTICATED AS ADMIN: SHOW DEDICATED ADMIN LOGIN PORTAL
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
        
        {/* Top Minimal Admin Entrance Header */}
        <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base text-slate-100 flex items-center space-x-2">
                <span>幸福社区党群服务中心</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                  管理后台专用门户
                </span>
              </div>
              <p className="text-[11px] text-slate-400">志愿服务工时审核 · 礼品核销 · 活动统筹系统</p>
            </div>
          </div>

          <button
            onClick={onNavigateToH5}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/80 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回居民端微信H5</span>
          </button>
        </header>

        {/* Main Center Login Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6">
            
            {/* Header Icon & Title */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-7 h-7 text-amber-400" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">居委会 / 站长工作后台登录</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                独立后台登录通道 · 具备活动发布、工时审核、礼品核销与权限配置权限
              </p>
            </div>

            {/* Fast Admin User Selection */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>管理员账号快速通道：</span>
                <span className="text-[10px] text-amber-400/90 font-normal">已授权管理员</span>
              </div>

              <div className="space-y-2">
                {(adminUsers.length > 0 ? adminUsers : [defaultAdmin]).map((admin) => (
                  <button
                    key={admin.id}
                    onClick={() => onLoginAsAdmin(admin)}
                    className="w-full p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl bg-slate-900 p-1.5 rounded-xl border border-slate-700 group-hover:scale-105 transition-transform">
                        {admin.avatar}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">{admin.name}</span>
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {admin.badge || '社区管理员'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {admin.phone} · 具备全站核销与管理权限
                        </div>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 bg-amber-500/20 text-amber-300 group-hover:bg-amber-500 group-hover:text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center space-x-1">
                      <span>登录</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider">或使用手机/密码登录</span>
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handlePasswordLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">管理员手机号 / 账号</label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="输入管理员手机号 (如 13399999999)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">管理认证口令 / 动态码</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="输入管理口令 (演示环境任意填写)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4 text-slate-950" />
                <span>{isSubmitting ? '认证核验中...' : '安全登录后台管理系统'}</span>
              </button>
            </form>

            {/* Bottom Security Tip */}
            <div className="pt-2 text-center">
              <div className="text-[11px] text-slate-500 flex items-center justify-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500/70" />
                <span>此页面为社区内部管理通道，严禁非授权人员操作</span>
              </div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-slate-600 border-t border-slate-900">
          幸福社区新时代文明实践站 · 社区志愿服务综合管理后台 v2.5
        </footer>

      </div>
    );
  }

  const pendingIssuesCount = issues.filter(i => i.status === 'pending').length;

  // IF AUTHENTICATED AS ADMIN: SHOW FULL ADMIN DASHBOARD
  const adminNavItems = [
    { id: 'activities_admin' as AdminTab, label: '发布与管理活动', icon: PlusCircle },
    { 
      id: 'audits_admin' as AdminTab, 
      label: '工时与积分审核', 
      icon: ClipboardCheck, 
      badge: pendingAuditsCount > 0 ? pendingAuditsCount : undefined 
    },
    { 
      id: 'issues_admin' as AdminTab, 
      label: '随手拍工单治理', 
      icon: Camera,
      badge: pendingIssuesCount > 0 ? pendingIssuesCount : undefined
    },
    { id: 'gifts_admin' as AdminTab, label: '礼品与库存管理', icon: GiftIcon },
    { id: 'verification_admin' as AdminTab, label: '现场领奖核销', icon: QrCode },
    { id: 'users_admin' as AdminTab, label: '用户与权限设置', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 shadow-xl select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Branding */}
            <div className="flex items-center space-x-3">
              <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl text-amber-400">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base sm:text-lg text-white tracking-tight">
                    幸福社区志愿服务管理后台
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold hidden sm:inline-block">
                    居委会工作站
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden md:block">
                  活动统筹 · 积分审核 · 现场扫码核销 · 居民档案体系
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Reset Mock Data */}
              <button
                onClick={onResetData}
                disabled={isResetting}
                className="hidden lg:flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                title="重置测试数据"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? '重置中...' : '重置演示数据'}</span>
              </button>

              {/* Environment Mode Switcher */}
              <button
                type="button"
                onClick={onOpenEnvSwitchModal}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  currentEnvMode === 'production'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900'
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/60 hover:bg-amber-900'
                }`}
                title="切换系统运行环境与微信认证模式"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${currentEnvMode === 'production' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{currentEnvMode === 'production' ? '🟢 真实微信环境' : '🟡 测试演练环境'}</span>
              </button>

              {/* View / Switch to H5 Resident View */}
              <button
                onClick={onNavigateToH5}
                className="flex items-center space-x-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="切换并打开居民端微信H5页面"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>查看居民端H5</span>
              </button>

              {/* Admin Profile Info */}
              <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl">
                <span className="text-base">{currentUser.avatar}</span>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-200">{currentUser.name}</div>
                  <div className="text-[10px] text-amber-400 font-semibold">{currentUser.badge || '社区管理员'}</div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogoutAdmin}
                className="p-2 bg-slate-800/80 hover:bg-red-950/60 hover:text-red-300 text-slate-400 border border-slate-700/80 rounded-xl transition-all cursor-pointer"
                title="退出管理后台"
              >
                <LogOut className="w-4 h-4" />
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Admin Module Tabs Subnav */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2.5 scrollbar-none">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onAdminTabChange(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-red-600 text-white' : 'bg-red-600 text-white animate-pulse'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Admin Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {adminTab === 'activities_admin' && (
          <ActivityManage
            activities={activities}
            registrations={registrations}
            onCreateActivity={onCreateActivity}
            onUpdateActivity={onUpdateActivity}
            onDeleteActivity={onDeleteActivity}
          />
        )}

        {adminTab === 'audits_admin' && (
          <AuditHours
            serviceRecords={serviceRecords}
            onAuditRecord={onAuditServiceRecord}
          />
        )}

        {adminTab === 'issues_admin' && (
          <IssueManage
            issues={issues}
            currentUser={currentUser}
            onHandleIssue={onHandleIssue}
            onDeleteIssue={onDeleteIssue}
          />
        )}

        {adminTab === 'gifts_admin' && (
          <GiftManage
            gifts={gifts}
            onCreateGift={onCreateGift}
            onUpdateGift={onUpdateGift}
          />
        )}

        {adminTab === 'verification_admin' && (
          <RedemptionVerification
            redemptions={redemptions}
            currentUser={currentUser}
            onVerifyCode={onVerifyRedemptionCode}
          />
        )}

        {adminTab === 'users_admin' && (
          <UserManage
            users={users}
            registrations={registrations}
            serviceRecords={serviceRecords}
            redemptions={redemptions}
            pointsHistory={pointsHistory}
            currentUser={currentUser}
            onCreateUser={onCreateUser}
            onUpdateUser={onUpdateUser}
            onDeleteUser={onDeleteUser}
            onSetUserRole={onSetUserRole}
            onAdjustPoints={onAdjustPoints}
          />
        )}
      </main>

      {/* Admin Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-950">
        幸福社区新时代文明实践站 · 社区志愿服务管理后台 (站长/工作人员端)
      </footer>

    </div>
  );
};
