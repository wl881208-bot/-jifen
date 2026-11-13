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
import { UserAvatar } from '../UserAvatar';
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
  Camera,
  RefreshCw,
  KeyRound,
  Database,
  Download,
  Upload,
  X
} from 'lucide-react';
import { CommunityIssue, IssueStatus } from '../../types';
import { 
  fetchAndSyncAllData, 
  adminLogin, 
  changeAdminPassword, 
  getDatabaseBackupSnapshot, 
  importDatabaseBackup 
} from '../../lib/dataService';

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
  onDeleteGift?: (id: string) => Promise<{ success: boolean; message?: string }>;
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
  onDeleteGift,
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
  const [isRefreshingData, setIsRefreshingData] = useState(false);

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Database Backup & Restore Modal State
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [backupFeedback, setBackupFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isImportingBackup, setIsImportingBackup] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshingData(true);
    await fetchAndSyncAllData();
    setTimeout(() => setIsRefreshingData(false), 400);
  };

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

  const handleQuickAdminClick = async (admin: User) => {
    setLoginError(null);
    const savedOpenid = typeof window !== 'undefined' ? localStorage.getItem('wechat_openid') : null;
    if (currentEnvMode === 'test' || (savedOpenid && admin.openid && savedOpenid === admin.openid)) {
      onLoginAsAdmin(admin);
      return;
    }
    setIsSubmitting(true);
    const res = await adminLogin(admin.phone || 'admin', adminPassword.trim() || 'admin123');
    setIsSubmitting(false);
    if (res.success) {
      onLoginAsAdmin(res.user || admin);
    } else {
      setAdminPhone(admin.phone || 'admin');
      setLoginError('已为您填入管理员账号，请在下方输入最新管理口令后点击登录');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const res = await adminLogin(
        adminPhone.trim() || 'admin',
        adminPassword.trim() || 'admin123'
      );
      if (res.success && res.user) {
        onLoginAsAdmin(res.user);
      } else {
        setLoginError(res.message || '管理口令核验失败，请检查输入的口令（初始默认口令：admin123）');
      }
    } catch {
      setLoginError('登录请求异常，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);
    if (!newPasswordInput || newPasswordInput.trim().length < 4) {
      setPasswordFeedback({ type: 'error', text: '新管理口令长度不能少于 4 位' });
      return;
    }
    if (newPasswordInput.trim() !== confirmPasswordInput.trim()) {
      setPasswordFeedback({ type: 'error', text: '两次输入的新口令不一致' });
      return;
    }
    setIsUpdatingPassword(true);
    const res = await changeAdminPassword(oldPasswordInput.trim(), newPasswordInput.trim());
    setIsUpdatingPassword(false);
    if (res.success) {
      setPasswordFeedback({ type: 'success', text: res.message || '后台管理口令已更新生效！' });
      setOldPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } else {
      setPasswordFeedback({ type: 'error', text: res.message || '原口令校验未通过' });
    }
  };

  const handleExportBackupJSON = () => {
    const snapshot = getDatabaseBackupSnapshot();
    const jsonString = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `幸福社区志愿服务数据库备份_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setBackupFeedback({
      type: 'success',
      text: `已成功导出全量数据包（含 ${snapshot.users.length} 名注册用户、${snapshot.activities.length} 场活动及全部流水记录）`
    });
  };

  const handleImportBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupFeedback(null);
    setIsImportingBackup(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await importDatabaseBackup(parsed, importMode);
      if (res.success) {
        setBackupFeedback({ type: 'success', text: res.message || '数据备份已成功恢复并同步至云端！' });
      } else {
        setBackupFeedback({ type: 'error', text: res.message || '数据恢复失败，请检查文件格式' });
      }
    } catch {
      setBackupFeedback({ type: 'error', text: '备份文件解析失败，请上传合法的 .json 备份文件' });
    } finally {
      setIsImportingBackup(false);
      e.target.value = '';
    }
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
                    type="button"
                    onClick={() => handleQuickAdminClick(admin)}
                    className="w-full p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <UserAvatar
                        avatar={admin.avatar}
                        name={admin.name}
                        className="w-10 h-10 text-2xl bg-slate-900 p-1 rounded-xl border border-slate-700 group-hover:scale-105 transition-transform"
                        imgClassName="w-full h-full rounded-lg object-cover"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">{admin.name}</span>
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {admin.badge || '社区管理员'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {admin.phone && !admin.phone.includes('****') ? `${admin.phone} · ` : ''}具备全站核销与管理权限
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
                    placeholder="输入管理员手机号或 admin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">管理认证口令</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="输入管理口令 (初始默认口令: admin123)"
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
          幸福社区新时代文明实践站 · 社区志愿服务综合管理后台 v2.6
        </footer>

      </div>
    );
  }

  const pendingIssuesCount = issues.filter(i => i.status === 'pending').length;
  const pendingRedemptionsCount = redemptions.filter(r => r.status === 'pending').length;

  // IF AUTHENTICATED AS ADMIN: SHOW FULL ADMIN DASHBOARD
  const adminNavItems = [
    { 
      id: 'users_admin' as AdminTab, 
      label: '注册用户管理', 
      icon: Users,
      badge: users.length > 0 ? users.length : undefined
    },
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
    { 
      id: 'verification_admin' as AdminTab, 
      label: '现场领奖核销', 
      icon: QrCode,
      badge: pendingRedemptionsCount > 0 ? pendingRedemptionsCount : undefined
    },
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
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              
              {/* Database Backup & Restore Button */}
              <button
                type="button"
                onClick={() => {
                  setBackupFeedback(null);
                  setIsBackupModalOpen(true);
                }}
                className="flex items-center space-x-1.5 bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 border border-blue-500/40 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="一键导出全量数据备份或从备份文件恢复（防容器重启丢失）"
              >
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">数据备份/恢复</span>
              </button>

              {/* Change Admin Password Button */}
              <button
                type="button"
                onClick={() => {
                  setPasswordFeedback(null);
                  setIsPasswordModalOpen(true);
                }}
                className="hidden md:flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                title="修改管理后台登录口令"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>修改口令</span>
              </button>

              {/* Reset Mock Data */}
              <button
                onClick={onResetData}
                disabled={isResetting}
                className="hidden xl:flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                title="重置测试数据"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? '重置中...' : '重置演示数据'}</span>
              </button>

              {/* Environment Mode Switcher */}
              <button
                type="button"
                onClick={onOpenEnvSwitchModal}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  currentEnvMode === 'production'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900'
                    : 'bg-amber-950/80 text-amber-300 border-amber-500/60 hover:bg-amber-900'
                }`}
                title="切换系统运行环境与微信认证模式"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${currentEnvMode === 'production' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="hidden sm:inline">{currentEnvMode === 'production' ? '🟢 真实微信环境' : '🟡 测试演练环境'}</span>
              </button>

              {/* View / Switch to H5 Resident View */}
              <button
                onClick={onNavigateToH5}
                className="flex items-center space-x-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="切换并打开居民端微信H5页面"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">查看居民端H5</span>
              </button>

              {/* Admin Profile Info */}
              <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700 px-2.5 py-1.5 rounded-xl">
                <UserAvatar
                  avatar={currentUser.avatar}
                  name={currentUser.name}
                  className="w-6 h-6 text-base rounded-full"
                />
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

      {/* Admin Module Tabs Subnav (Wrap layout so all 6 modules are always visible) */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 py-2.5">
            <nav className="flex flex-wrap gap-1.5 sm:gap-2.5">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onAdminTabChange(item.id)}
                    className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 sm:space-x-2 transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        item.id === 'users_admin'
                          ? (isActive ? 'bg-slate-900 text-amber-300' : 'bg-emerald-600 text-white')
                          : (isActive ? 'bg-red-600 text-white' : 'bg-red-600 text-white animate-pulse')
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleManualRefresh}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
              title="从服务器同步最新微信注册居民与工单数据"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshingData ? 'animate-spin' : ''}`} />
              <span>{isRefreshingData ? '同步中...' : '刷新实时数据'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick Overview Cards Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onAdminTabChange('users_admin')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              adminTab === 'users_admin'
                ? 'bg-emerald-950/60 border-emerald-500/60 ring-1 ring-emerald-500/40'
                : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/80'
            }`}
          >
            <div>
              <div className="text-xs text-slate-400 font-medium">已注册居民 / 用户总数</div>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                {users.length} <span className="text-xs font-normal text-emerald-400">人 (点击查看管理)</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onAdminTabChange('audits_admin')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              adminTab === 'audits_admin'
                ? 'bg-amber-950/60 border-amber-500/60 ring-1 ring-amber-500/40'
                : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/80'
            }`}
          >
            <div>
              <div className="text-xs text-slate-400 font-medium">待审核志愿工时申报</div>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                {pendingAuditsCount} <span className="text-xs font-normal text-amber-400">条待办</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onAdminTabChange('issues_admin')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              adminTab === 'issues_admin'
                ? 'bg-red-950/60 border-red-500/60 ring-1 ring-red-500/40'
                : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/80'
            }`}
          >
            <div>
              <div className="text-xs text-slate-400 font-medium">随手拍待办社区问题</div>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                {pendingIssuesCount} <span className="text-xs font-normal text-red-400">件待处理</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onAdminTabChange('verification_admin')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              adminTab === 'verification_admin'
                ? 'bg-blue-950/60 border-blue-500/60 ring-1 ring-blue-500/40'
                : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/80'
            }`}
          >
            <div>
              <div className="text-xs text-slate-400 font-medium">待现场核销礼品凭证</div>
              <div className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                {pendingRedemptionsCount} <span className="text-xs font-normal text-blue-400">张待核销</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
          </button>
        </div>
        {adminTab === 'activities_admin' && (
          <ActivityManage
            activities={activities}
            registrations={registrations}
            currentUser={currentUser}
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
            onDeleteGift={onDeleteGift}
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

      {/* Database Backup & Restore Modal */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">社区全量数据备份与恢复</h3>
                  <p className="text-xs text-slate-400">支持本地浏览器自动快照同步 + JSON 离线归档</p>
                </div>
              </div>
              <button
                onClick={() => setIsBackupModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-700/40 rounded-2xl p-3.5 text-xs text-emerald-200 space-y-1">
              <div className="font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>自动防丢保护已开启</span>
              </div>
              <p className="text-emerald-300/80 leading-relaxed">
                系统已自动在您的浏览器建立实时镜像快照。当云端容器重启或升级时，打开后台会自动将缺失的微信注册居民和积分流水回写同步至服务器。
              </p>
            </div>

            {backupFeedback && (
              <div className={`p-3 rounded-xl text-xs font-medium border ${
                backupFeedback.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                  : 'bg-red-950/60 border-red-800 text-red-300'
              }`}>
                {backupFeedback.text}
              </div>
            )}

            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">导出全量 JSON 备份包</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    当前包含 {users.length} 名用户、{activities.length} 场活动、{gifts.length} 款礼品及全部流水
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportBackupJSON}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>导出备份</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-white">从 JSON 备份包恢复数据</div>
                    <div className="text-xs text-slate-400 mt-0.5">选择此前导出的 .json 备份文件上传恢复</div>
                  </div>
                  <label className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shrink-0 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>{isImportingBackup ? '恢复中...' : '上传恢复'}</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportBackupFile}
                      disabled={isImportingBackup}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center space-x-3 text-xs pt-1 border-t border-slate-700/70">
                  <span className="text-slate-400">恢复策略：</span>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-slate-200">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                    />
                    <span>智能合并 (保留现有数据并补充缺失项)</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-slate-200">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                    />
                    <span>完整覆盖</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Admin Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">修改管理后台登录口令</h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordFeedback && (
              <div className={`p-3 rounded-xl text-xs font-medium border ${
                passwordFeedback.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                  : 'bg-red-950/60 border-red-800 text-red-300'
              }`}>
                {passwordFeedback.text}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">当前管理口令 (默认: admin123)</label>
                <input
                  type="password"
                  value={oldPasswordInput}
                  onChange={(e) => setOldPasswordInput(e.target.value)}
                  placeholder="请输入当前管理口令"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">新管理口令</label>
                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="设置至少 4 位新口令"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">确认新管理口令</label>
                <input
                  type="password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="再次输入新口令"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  关闭
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPassword ? '保存中...' : '保存新口令'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-950">
        幸福社区新时代文明实践站 · 社区志愿服务管理后台 (站长/工作人员端)
      </footer>

    </div>
  );
};

