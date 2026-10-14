import React, { useEffect, useState } from 'react';
import { 
  User, 
  Activity, 
  Gift, 
  Registration, 
  ServiceRecord, 
  Redemption, 
  PointsHistoryItem,
  CommunityIssue,
  IssueStatus
} from './types';
import { 
  seedDatabase, 
  subscribeToUsers, 
  subscribeToActivities, 
  subscribeToGifts, 
  subscribeToRegistrations, 
  subscribeToServiceRecords, 
  subscribeToRedemptions, 
  subscribeToPointsHistory,
  subscribeToIssues,
  registerForActivity,
  submitServiceRecord,
  auditServiceRecord,
  createActivity,
  updateActivity,
  deleteActivity,
  createGift,
  updateGift,
  redeemGift,
  verifyRedemptionCode,
  createUser,
  updateUser,
  deleteUser,
  setUserRole,
  adjustUserPoints,
  submitCommunityIssue,
  handleCommunityIssue,
  deleteCommunityIssue,
  wechatLogin,
  wechatDirectAuth,
  getWechatAuthUrl,
  checkTcbAutoAuth
} from './lib/dataService';
import { Navbar } from './components/Navbar';
import { WechatAuthConsole } from './components/WechatAuthConsole';
import { MiniProgramConsole } from './components/MiniProgramConsole';
import { LoginModal } from './components/LoginModal';
import { ScanAuthModal } from './components/ScanAuthModal';
import { CommunitySnapModal } from './components/resident/CommunitySnapModal';
import { CommunitySnapFeedModal } from './components/resident/CommunitySnapFeedModal';
import { initWechatJssdk } from './lib/wechatJssdk';
import { BottomNav, ResidentTab, AdminTab } from './components/BottomNav';
import { ResidentHome } from './components/resident/ResidentHome';
import { ActivityHall } from './components/resident/ActivityHall';
import { PointsMall } from './components/resident/PointsMall';
import { MyProfile } from './components/resident/MyProfile';
import { AdminPortal } from './components/admin/AdminPortal';
import { X, Send, Smartphone, Monitor, ShieldCheck, LogIn, Lock, ArrowRight, ExternalLink } from 'lucide-react';

export default function App() {
  // Real-time State
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsHistoryItem[]>([]);
  const [issues, setIssues] = useState<CommunityIssue[]>([]);

  // Portal Mode: 'h5' (Resident client) vs 'admin' (Dedicated Backend Portal)
  const isInitialAdmin = typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/admin') ||
    window.location.hash.startsWith('#admin') ||
    new URLSearchParams(window.location.search).get('portal') === 'admin'
  );
  const [portalMode, setPortalMode] = useState<'h5' | 'admin'>(isInitialAdmin ? 'admin' : 'h5');

  // Navigation Tabs State
  const [residentTab, setResidentTab] = useState<ResidentTab>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('verification_admin');

  // Mobile Shell Simulation Toggle (Default FALSE for standard responsive H5 Web)
  const [isMobileSimulated, setIsMobileSimulated] = useState<boolean>(false);

  // Debug Console Visibility Toggle (Default FALSE for clean Web UI)
  const [showDebugTools, setShowDebugTools] = useState<boolean>(false);

  // Active User: Defaults to null (Guest / Unlogged in) unless persisted in localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Login Modal State (Resident H5)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPromptText, setLoginPromptText] = useState<string | undefined>(undefined);

  // Community Snap (随手拍) Modals
  const [isSnapModalOpen, setIsSnapModalOpen] = useState(false);
  const [isSnapFeedModalOpen, setIsSnapFeedModalOpen] = useState(false);

  // Mobile Scan Ticket Modal (when scanned via phone)
  const [mobileScanTicket, setMobileScanTicket] = useState<string | null>(null);

  // Global UI Modals / Toast
  const [isResetting, setIsResetting] = useState(false);
  const [selectedActivityForDetail, setSelectedActivityForDetail] = useState<Activity | null>(null);
  const [globalClaimModalOpen, setGlobalClaimModalOpen] = useState(false);
  const [claimTitle, setClaimTitle] = useState('');
  const [claimHours, setClaimHours] = useState(2.0);
  const [claimProofText, setClaimProofText] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Listen to browser URL changes (popstate / hashchange)
  useEffect(() => {
    const handleUrlChange = () => {
      const isAdminRoute = window.location.pathname.startsWith('/admin') || 
                           window.location.hash.startsWith('#admin') || 
                           new URLSearchParams(window.location.search).get('portal') === 'admin';
      setPortalMode(isAdminRoute ? 'admin' : 'h5');
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Portal Navigation Helpers
  const navigateToAdmin = () => {
    setPortalMode('admin');
    window.history.pushState({}, '', '/admin');
  };

  const navigateToH5 = () => {
    setPortalMode('h5');
    window.history.pushState({}, '', '/');
  };

  // Initial Seed & Real-time Subscriptions
  useEffect(() => {
    let unsubscribeFns: (() => void)[] = [];

    const initData = async () => {
      // Initialize WeChat JSDK setup
      initWechatJssdk();

      // Seed MySQL mock engine with initial dataset if empty
      await seedDatabase(false);

      // Check WeChat OAuth code in URL (if arriving from WeChat OAuth redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const codeFromUrl = urlParams.get('code');
      const scanTicketFromUrl = urlParams.get('scan_ticket');
      const isWeChatBrowser = typeof navigator !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent);

      if (scanTicketFromUrl) {
        setMobileScanTicket(scanTicketFromUrl);
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      if (codeFromUrl) {
        showToast('微信授权认证成功，正在载入居民档案...', 'info');
        try {
          const wxRes = await wechatLogin(codeFromUrl);
          if (wxRes.success && wxRes.user) {
            setCurrentUser(wxRes.user);
            setIsLoginModalOpen(false);
            if (wxRes.openid) localStorage.setItem('wechat_openid', wxRes.openid);
            localStorage.setItem('logged_in_user_id', wxRes.user.id);
            localStorage.setItem('cached_user_profile', JSON.stringify(wxRes.user));
            showToast(wxRes.message || `微信授权登录成功！欢迎，【${wxRes.user.name}】`, 'success');
            setResidentTab('profile');
          } else if (wxRes.message) {
            showToast(wxRes.message, 'error');
          }
        } catch (e) {
          console.error('WeChat code exchange error:', e);
          showToast('微信授权认证成功，欢迎进入社区积分系统', 'success');
        }
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } else {
        // Check local storage for persistent login
        const savedUserId = localStorage.getItem('logged_in_user_id');
        const savedOpenid = localStorage.getItem('wechat_openid');
        const cachedUserJson = localStorage.getItem('cached_user_profile');

        if (cachedUserJson) {
          try {
            const parsed = JSON.parse(cachedUserJson);
            if (parsed && parsed.id) {
              setCurrentUser(parsed);
            }
          } catch {
            // ignore
          }
        }

        if (savedOpenid) {
          try {
            const wxRes = await wechatLogin(undefined, savedOpenid);
            if (wxRes.success && wxRes.user) {
              setCurrentUser(wxRes.user);
              localStorage.setItem('cached_user_profile', JSON.stringify(wxRes.user));
            }
          } catch (e) {
            console.warn('Saved WeChat openid login error:', e);
          }
        } else if (!savedUserId) {
          // If running directly on Tencent CloudBase inside WeChat browser/webview
          try {
            const tcbAuth = await checkTcbAutoAuth();
            if (tcbAuth.success && tcbAuth.user) {
              setCurrentUser(tcbAuth.user);
              showToast(`微信云托管免登识别成功！欢迎，【${tcbAuth.user.name}】`, 'success');
            }
          } catch (e) {
            // Non-blocking
          }
        }
      }

      // Subscribe to real-time database updates
      unsubscribeFns.push(subscribeToUsers((u) => {
        setUsers(u);
        // Sync active user profile updates if already logged in
        setCurrentUser((prev) => {
          if (!prev) {
            const savedUserId = localStorage.getItem('logged_in_user_id');
            if (savedUserId) {
              return u.find(user => user.id === savedUserId) || null;
            }
            return null;
          }
          const updated = u.find(user => user.id === prev.id);
          return updated || prev;
        });
      }));

      unsubscribeFns.push(subscribeToActivities((a) => setActivities(a)));
      unsubscribeFns.push(subscribeToGifts((g) => setGifts(g)));
      unsubscribeFns.push(subscribeToRegistrations((r) => setRegistrations(r)));
      unsubscribeFns.push(subscribeToServiceRecords((s) => setServiceRecords(s)));
      unsubscribeFns.push(subscribeToRedemptions((red) => setRedemptions(red)));
      unsubscribeFns.push(subscribeToPointsHistory((pts) => setPointsHistory(pts)));
      unsubscribeFns.push(subscribeToIssues((iss) => setIssues(iss)));
    };

    initData();

    return () => {
      unsubscribeFns.forEach(fn => fn());
    };
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Open Login Modal Helper
  const handleOpenLogin = (prompt?: string) => {
    setLoginPromptText(prompt);
    setIsLoginModalOpen(true);
  };

  // Direct 1-Click WeChat Authorization Handler (No QR modal required)
  const handleWechatDirectLogin = async (customName?: string) => {
    try {
      showToast('正在调起微信登录授权...', 'info');
      const res = await wechatDirectAuth(customName);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('logged_in_user_id', res.user.id);
        if (res.user.openid) localStorage.setItem('wechat_openid', res.user.openid);
        showToast(res.message || `微信授权登录成功！欢迎，【${res.user.name}】`, 'success');
        setIsLoginModalOpen(false);
      } else if (res.message) {
        showToast(res.message, res.success ? 'success' : 'error');
      }
    } catch (err: any) {
      showToast('微信授权登录异常: ' + err.message, 'error');
    }
  };

  // User Login Success Handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`欢迎回来，${user.name}！已同步您的志愿档案。`);
  };

  // User Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('logged_in_user_id');
    localStorage.removeItem('wechat_openid');
    setCurrentUser(null);
    setResidentTab('home');
    showToast('已安全退出当前账号，进入未登录浏览模式', 'info');
  };

  // Reset Mock Data Button
  const handleResetData = async () => {
    setIsResetting(true);
    await seedDatabase(true);
    setIsResetting(false);
    showToast('已重置并装载社区示例测试数据！');
  };

  // Active User Selection (e.g. from dropdown or switcher)
  const handleUserSelect = (user: User) => {
    localStorage.setItem('logged_in_user_id', user.id);
    if (user.openid) localStorage.setItem('wechat_openid', user.openid);
    setCurrentUser(user);
    showToast(`已切换至账号：${user.name}`);
  };

  // Activity Registration Action
  const handleRegisterForActivity = async (activity: Activity) => {
    if (!currentUser) {
      handleOpenLogin('请先微信登录后再报名参加志愿活动');
      return { success: false, message: '请先登录社区账号' };
    }
    const res = await registerForActivity(currentUser, activity);
    return res;
  };

  // Submit Hour Audit Claim from Activity Hall
  const handleSubmitServiceProof = async (
    activityTitle: string,
    activityId: string,
    hours: number,
    pointsReward: number,
    proofText: string
  ) => {
    if (!currentUser) {
      handleOpenLogin('请先微信登录后再提交志愿打卡证明');
      return;
    }
    await submitServiceRecord({
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      activityId,
      activityTitle,
      hours,
      pointsEarned: pointsReward,
      proofText,
    });
    showToast('服务打卡与工时申报已提交，等待管理员审核后自动发放积分！');
  };

  // Global Independent Hour Claim Submission
  const handleGlobalClaimSubmit = async () => {
    if (!currentUser) {
      handleOpenLogin('请先微信登录后再提交工时申报');
      return;
    }
    if (!claimTitle.trim() || !claimProofText.trim()) return;
    setIsSubmittingClaim(true);
    await submitServiceRecord({
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      activityTitle: claimTitle.trim(),
      hours: claimHours,
      pointsEarned: Math.round(claimHours * 20), // 20 points per hour standard
      proofText: claimProofText.trim(),
    });
    setIsSubmittingClaim(false);
    setGlobalClaimModalOpen(false);
    setClaimTitle('');
    setClaimProofText('');
    showToast('自主填报服务工时已提交，等待管理员审核发积分！');
  };

  // Redeem Gift Action
  const handleRedeemGift = async (gift: Gift) => {
    if (!currentUser) {
      handleOpenLogin('请先微信登录后再使用积分兑换礼品');
      return { success: false, message: '未登录居民账号' };
    }
    const res = await redeemGift(currentUser, gift);
    return res;
  };

  // Admin Verification Action
  const handleVerifyRedemptionCode = async (code: string, verifierName: string) => {
    const res = await verifyRedemptionCode(code, verifierName);
    return res;
  };

  // Community Issue (随手拍) Actions
  const handleCreateIssue = async (data: Omit<CommunityIssue, 'id' | 'createdAt' | 'status'>) => {
    const res = await submitCommunityIssue(data);
    if (res.success) {
      showToast('随手拍问题已成功上报！网格员将火速核实整改，办结后奖励 +15 积分');
    }
    return res;
  };

  const handleAdminHandleIssue = async (
    id: string, 
    status: IssueStatus, 
    adminReply: string, 
    pointsReward: number, 
    replyImage?: string,
    handledBy?: string
  ) => {
    const res = await handleCommunityIssue(id, status, adminReply, pointsReward, replyImage, handledBy);
    if (res.success) {
      showToast(status === 'resolved' ? '工单已办结并已向居民发放积分奖励！' : '工单状态已更新');
    }
    return res;
  };

  const handleAdminDeleteIssue = async (id: string) => {
    const res = await deleteCommunityIssue(id);
    if (res.success) {
      showToast('随手拍记录已删除');
    }
    return res;
  };

  // Render Admin Portal if in admin portal route
  if (portalMode === 'admin') {
    return (
      <>
        <AdminPortal
          currentUser={currentUser}
          users={users}
          activities={activities}
          gifts={gifts}
          registrations={registrations}
          serviceRecords={serviceRecords}
          redemptions={redemptions}
          pointsHistory={pointsHistory}
          issues={issues}
          adminTab={adminTab}
          onAdminTabChange={(tab) => setAdminTab(tab)}
          onLoginAsAdmin={(adminUser) => {
            handleUserSelect(adminUser);
            showToast(`已登录管理员身份：${adminUser.name}`);
          }}
          onLogoutAdmin={() => {
            handleLogout();
            showToast('已安全退出管理后台');
          }}
          onNavigateToH5={navigateToH5}
          onResetData={handleResetData}
          isResetting={isResetting}
          onCreateActivity={createActivity}
          onUpdateActivity={updateActivity}
          onDeleteActivity={deleteActivity}
          onAuditServiceRecord={auditServiceRecord}
          onCreateGift={createGift}
          onUpdateGift={updateGift}
          onVerifyRedemptionCode={handleVerifyRedemptionCode}
          onCreateUser={createUser}
          onUpdateUser={updateUser}
          onDeleteUser={deleteUser}
          onSetUserRole={setUserRole}
          onAdjustPoints={adjustUserPoints}
          onHandleIssue={handleAdminHandleIssue}
          onDeleteIssue={handleAdminDeleteIssue}
        />

        {/* Global Toast Notification */}
        {toast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 pointer-events-none max-w-md w-full px-4">
            <div className={`p-3 rounded-2xl shadow-xl border flex items-center space-x-2.5 text-xs font-semibold backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-900/90 text-red-100 border-red-500/40 shadow-red-950/40'
                : toast.type === 'info'
                ? 'bg-slate-900/90 text-slate-100 border-slate-700/60 shadow-slate-950/40'
                : 'bg-emerald-900/90 text-emerald-100 border-emerald-500/40 shadow-emerald-950/40'
            }`}>
              <span className="shrink-0">{toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✅'}</span>
              <span className="flex-1 leading-snug">{toast.message}</span>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Native WeChat Mini-Program Native Console Bar (Debug Mode Only) */}
      {showDebugTools && (
        <div className="relative">
          <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded text-[11px] font-bold">
                开发者调试工具
              </span>
              <span className="text-slate-400">独立后台地址: <code className="text-amber-400 font-mono">/admin</code></span>
            </div>
            <button
              onClick={navigateToAdmin}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>进入管理后台门户</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <MiniProgramConsole
            currentUser={currentUser}
            onUserChange={(user) => {
              handleUserSelect(user);
            }}
            onShowMessage={(msg, type) => showToast(msg, type)}
          />

          <WechatAuthConsole
            currentUser={currentUser}
            onUserChange={(user) => {
              handleUserSelect(user);
            }}
            onShowMessage={(msg) => showToast(msg)}
          />
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        users={users}
        currentRole="resident"
        onRoleSwitch={() => {}}
        onUserSelect={handleUserSelect}
        onResetData={handleResetData}
        isResetting={isResetting}
        onOpenLoginModal={handleOpenLogin}
        onWechatDirectLogin={handleWechatDirectLogin}
        onLogout={handleLogout}
        isMobileSimulated={isMobileSimulated}
        onToggleMobileSimulator={() => setIsMobileSimulated(!isMobileSimulated)}
        showDebugTools={showDebugTools}
        onToggleDebugTools={() => setShowDebugTools(!showDebugTools)}
      />

      {/* Main Core View Area - Normal vs Smartphone Shell */}
      {isMobileSimulated ? (
        <div className="py-6 px-2 flex flex-col items-center justify-center bg-slate-900/95 min-h-[calc(100vh-64px)]">
          {/* Top Info Banner for Simulator */}
          <div className="mb-4 bg-slate-800/90 text-slate-200 border border-slate-700/80 px-4 py-2 rounded-2xl text-xs flex items-center space-x-3 shadow-lg">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <Smartphone className="w-4 h-4" />
              <span>iPhone 15 Pro / 微信 H5 拟真手机外壳模式</span>
            </div>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setIsMobileSimulated(false)}
              className="text-amber-400 hover:text-amber-300 font-semibold underline flex items-center space-x-1 cursor-pointer"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>还原网页全屏</span>
            </button>
          </div>

          {/* iPhone Physical Device Outer Shell */}
          <div className="relative w-[390px] max-w-full h-[760px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 ring-1 ring-white/20 flex flex-col overflow-hidden">
            
            {/* Phone Screen Inner Container */}
            <div className="flex-1 overflow-hidden bg-slate-100/95 text-slate-900 relative flex flex-col rounded-[36px]">
              
              {/* Scrollable View Area */}
              <div className="flex-1 overflow-y-auto p-3 pb-20 custom-scrollbar">
                {/* Global Notification Toast */}
                {toast && (
                  <div className={`mb-3 px-3 py-2 rounded-xl shadow-lg text-xs font-semibold border flex items-center space-x-1.5 ${
                    toast.type === 'error' ? 'bg-red-950 text-red-100 border-red-700' :
                    toast.type === 'info' ? 'bg-slate-900 text-slate-100 border-slate-700' :
                    'bg-emerald-950 text-emerald-100 border-emerald-700'
                  }`}>
                    <span>{toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✨'}</span>
                    <span>{toast.message}</span>
                  </div>
                )}

                {/* Resident Mode Views */}
                {residentTab === 'home' && (
                  <ResidentHome
                    currentUser={currentUser}
                    activities={activities}
                    pointsHistory={pointsHistory}
                    redemptions={redemptions}
                    issues={issues}
                    onNavigateTab={(tab) => setResidentTab(tab)}
                    onOpenActivityDetail={(act) => {
                      setSelectedActivityForDetail(act);
                      setResidentTab('activities');
                    }}
                    onOpenClaimModal={() => setGlobalClaimModalOpen(true)}
                    onOpenLoginModal={handleOpenLogin}
                    onWechatDirectLogin={handleWechatDirectLogin}
                    onOpenSnapModal={() => setIsSnapModalOpen(true)}
                    onOpenSnapFeedModal={() => setIsSnapFeedModalOpen(true)}
                  />
                )}

                {residentTab === 'activities' && (
                  <ActivityHall
                    currentUser={currentUser}
                    activities={activities}
                    myRegistrations={currentUser ? registrations.filter(r => r.userId === currentUser.id) : []}
                    onRegister={handleRegisterForActivity}
                    onSubmitServiceProof={handleSubmitServiceProof}
                    selectedActivityForDetail={selectedActivityForDetail}
                    onClearSelectedActivity={() => setSelectedActivityForDetail(null)}
                    onOpenLoginModal={handleOpenLogin}
                  />
                )}

                {residentTab === 'mall' && (
                  <PointsMall
                    currentUser={currentUser}
                    gifts={gifts}
                    onRedeemGift={handleRedeemGift}
                    onNavigateToRedemptions={() => setResidentTab('profile')}
                    onOpenLoginModal={handleOpenLogin}
                  />
                )}

                {residentTab === 'profile' && (
                  <MyProfile
                    currentUser={currentUser}
                    registrations={registrations}
                    serviceRecords={serviceRecords}
                    redemptions={redemptions}
                    pointsHistory={pointsHistory}
                    onLogout={handleLogout}
                    onOpenLoginModal={handleOpenLogin}
                    onWechatDirectLogin={handleWechatDirectLogin}
                  />
                )}
              </div>

              {/* Bottom Nav inside Phone Shell */}
              <BottomNav
                currentRole="resident"
                residentTab={residentTab}
                adminTab={adminTab}
                onResidentTabChange={(tab) => setResidentTab(tab)}
                onAdminTabChange={(tab) => setAdminTab(tab)}
                pendingAuditsCount={0}
                isMobileSimulated={true}
              />

            </div>

            {/* iOS Home Bar Indicator */}
            <div className="bg-slate-900 pt-1.5 pb-2 flex justify-center shrink-0 border-t border-slate-800">
              <div className="w-32 h-1 bg-slate-500 rounded-full"></div>
            </div>

          </div>
        </div>
      ) : (
        <>
          {/* Navigation Subnav / Mobile Bottom Bar */}
          <BottomNav
            currentRole="resident"
            residentTab={residentTab}
            adminTab={adminTab}
            onResidentTabChange={(tab) => setResidentTab(tab)}
            onAdminTabChange={(tab) => setAdminTab(tab)}
            pendingAuditsCount={0}
          />

          {/* Main Content Area */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
            {/* RESIDENT MODE VIEWS */}
            {residentTab === 'home' && (
              <ResidentHome
                currentUser={currentUser}
                activities={activities}
                pointsHistory={pointsHistory}
                redemptions={redemptions}
                issues={issues}
                onNavigateTab={(tab) => setResidentTab(tab)}
                onOpenActivityDetail={(act) => {
                  setSelectedActivityForDetail(act);
                  setResidentTab('activities');
                }}
                onOpenClaimModal={() => setGlobalClaimModalOpen(true)}
                onOpenLoginModal={handleOpenLogin}
                onWechatDirectLogin={handleWechatDirectLogin}
                onOpenSnapModal={() => setIsSnapModalOpen(true)}
                onOpenSnapFeedModal={() => setIsSnapFeedModalOpen(true)}
              />
            )}

            {residentTab === 'activities' && (
              <ActivityHall
                currentUser={currentUser}
                activities={activities}
                myRegistrations={currentUser ? registrations.filter(r => r.userId === currentUser.id) : []}
                onRegister={handleRegisterForActivity}
                onSubmitServiceProof={handleSubmitServiceProof}
                selectedActivityForDetail={selectedActivityForDetail}
                onClearSelectedActivity={() => setSelectedActivityForDetail(null)}
                onOpenLoginModal={handleOpenLogin}
              />
            )}

            {residentTab === 'mall' && (
              <PointsMall
                currentUser={currentUser}
                gifts={gifts}
                onRedeemGift={handleRedeemGift}
                onNavigateToRedemptions={() => setResidentTab('profile')}
                onOpenLoginModal={handleOpenLogin}
              />
            )}

            {residentTab === 'profile' && (
              <MyProfile
                currentUser={currentUser}
                registrations={registrations}
                serviceRecords={serviceRecords}
                redemptions={redemptions}
                pointsHistory={pointsHistory}
                onLogout={handleLogout}
                onOpenLoginModal={handleOpenLogin}
                onWechatDirectLogin={handleWechatDirectLogin}
              />
            )}
          </main>
        </>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        users={users}
        defaultPrompt={loginPromptText}
      />

      {/* Mobile Scan Confirmation Modal */}
      {mobileScanTicket && (
        <ScanAuthModal
          ticket={mobileScanTicket}
          currentUser={currentUser}
          onClose={() => setMobileScanTicket(null)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
          }}
          onShowMessage={(msg, type) => showToast(msg, type)}
        />
      )}

      {/* Community Snap Modal (随手拍上报弹窗) */}
      <CommunitySnapModal
        isOpen={isSnapModalOpen}
        currentUser={currentUser}
        onClose={() => setIsSnapModalOpen(false)}
        onSubmit={handleCreateIssue}
        onOpenLoginModal={handleOpenLogin}
      />

      {/* Community Snap Feed Modal (随手拍公示动态广场弹窗) */}
      <CommunitySnapFeedModal
        isOpen={isSnapFeedModalOpen}
        currentUser={currentUser}
        issues={issues}
        onClose={() => setIsSnapFeedModalOpen(false)}
        onOpenSnapModal={() => {
          setIsSnapFeedModalOpen(false);
          setIsSnapModalOpen(true);
        }}
      />

      {/* Global Hour Claim / Service Proof Modal */}
      {globalClaimModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">自主补打卡/工时申报</h3>
              <button onClick={() => setGlobalClaimModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">志愿服务项目名称 *</label>
                <input
                  type="text"
                  required
                  value={claimTitle}
                  onChange={(e) => setClaimTitle(e.target.value)}
                  placeholder="例如：自发清理单元楼道积存废弃小广告"
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">申报服务时长 (小时) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={claimHours}
                  onChange={(e) => setClaimHours(parseFloat(e.target.value) || 0.5)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">系统标准: 1小时服务工时将获得 20 积分</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">成果说明与服务过程描述 *</label>
                <textarea
                  rows={3}
                  required
                  value={claimProofText}
                  onChange={(e) => setClaimProofText(e.target.value)}
                  placeholder="请详细描述具体的服务地点、起止时间及服务成果..."
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setGlobalClaimModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-xs cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleGlobalClaimSubmit}
                disabled={!claimTitle.trim() || !claimProofText.trim() || isSubmittingClaim}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingClaim ? '提交中...' : '确认提交审核'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 pointer-events-none max-w-md w-full px-4">
          <div className={`p-3 rounded-2xl shadow-xl border flex items-center space-x-2.5 text-xs font-semibold backdrop-blur-md ${
            toast.type === 'error'
              ? 'bg-red-900/90 text-red-100 border-red-500/40 shadow-red-950/40'
              : toast.type === 'info'
              ? 'bg-slate-900/90 text-slate-100 border-slate-700/60 shadow-slate-950/40'
              : 'bg-emerald-900/90 text-emerald-100 border-emerald-500/40 shadow-emerald-950/40'
          }`}>
            <span className="shrink-0">{toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✅'}</span>
            <span className="flex-1 leading-snug">{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
