import React, { useEffect, useState } from 'react';
import { 
  User, 
  Activity, 
  Gift, 
  Registration, 
  ServiceRecord, 
  Redemption, 
  PointsHistoryItem 
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
  wechatLogin,
  wechatMockLogin
} from './lib/dataService';
import { Navbar } from './components/Navbar';
import { WechatAuthConsole } from './components/WechatAuthConsole';
import { initWechatJssdk } from './lib/wechatJssdk';
import { BottomNav, ResidentTab, AdminTab } from './components/BottomNav';
import { ResidentHome } from './components/resident/ResidentHome';
import { ActivityHall } from './components/resident/ActivityHall';
import { PointsMall } from './components/resident/PointsMall';
import { MyProfile } from './components/resident/MyProfile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ActivityManage } from './components/admin/ActivityManage';
import { AuditHours } from './components/admin/AuditHours';
import { GiftManage } from './components/admin/GiftManage';
import { RedemptionVerification } from './components/admin/RedemptionVerification';
import { X, Send } from 'lucide-react';

export default function App() {
  // Real-time State
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsHistoryItem[]>([]);

  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<'resident' | 'admin'>('resident');
  const [residentTab, setResidentTab] = useState<ResidentTab>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('verification_admin');

  // Active User (Defaults to 张兰英 user_1)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Global UI Modals / Toast
  const [isResetting, setIsResetting] = useState(false);
  const [selectedActivityForDetail, setSelectedActivityForDetail] = useState<Activity | null>(null);
  const [globalClaimModalOpen, setGlobalClaimModalOpen] = useState(false);
  const [claimTitle, setClaimTitle] = useState('');
  const [claimHours, setClaimHours] = useState(2.0);
  const [claimProofText, setClaimProofText] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial Seed & Real-time Subscriptions
  useEffect(() => {
    let unsubscribeFns: (() => void)[] = [];

    const initData = async () => {
      // Initialize WeChat JSDK setup
      initWechatJssdk();

      // Seed MySQL mock engine with initial dataset if empty
      await seedDatabase(false);

      // Check WeChat OAuth code in URL
      const urlParams = new URLSearchParams(window.location.search);
      const codeFromUrl = urlParams.get('code');

      if (codeFromUrl) {
        try {
          const wxRes = await wechatLogin(codeFromUrl);
          if (wxRes.success && wxRes.user) {
            setCurrentUser(wxRes.user);
            if (wxRes.openid) localStorage.setItem('wechat_openid', wxRes.openid);
            showToast(wxRes.message || `微信静默授权登录成功 [${wxRes.user.name}]`);
          }
        } catch (e) {
          console.error('WeChat code exchange error:', e);
        }
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } else {
        const savedOpenid = localStorage.getItem('wechat_openid');
        if (savedOpenid) {
          try {
            const wxRes = await wechatMockLogin(savedOpenid);
            if (wxRes.success && wxRes.user) {
              setCurrentUser(wxRes.user);
            }
          } catch (e) {
            console.warn('Saved openid login error:', e);
          }
        }
      }

      // Subscribe to real-time database updates
      unsubscribeFns.push(subscribeToUsers((u) => {
        setUsers(u);
        // Sync active user profile updates
        setCurrentUser((prev) => {
          if (!prev) {
            const defaultUser = u.find(user => user.id === 'user_1') || u[0];
            return defaultUser || null;
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
    };

    initData();

    return () => {
      unsubscribeFns.forEach(fn => fn());
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset Mock Data Button
  const handleResetData = async () => {
    setIsResetting(true);
    await seedDatabase(true);
    setIsResetting(false);
    showToast('已重置并装载社区示例测试数据！');
  };

  // Active User Selection
  const handleUserSelect = (user: User) => {
    setCurrentUser(user);
    showToast(`已切换至体验账号：${user.name}`);
  };

  // Activity Registration Action
  const handleRegisterForActivity = async (activity: Activity) => {
    if (!currentUser) return { success: false, message: '请先选择体验账号' };
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
    if (!currentUser) return;
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
    if (!currentUser || !claimTitle.trim() || !claimProofText.trim()) return;
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
    if (!currentUser) return { success: false, message: '未登录居民账号' };
    const res = await redeemGift(currentUser, gift);
    return res;
  };

  // Admin Verification Action
  const handleVerifyRedemptionCode = async (code: string, verifierName: string) => {
    const res = await verifyRedemptionCode(code, verifierName);
    return res;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 text-slate-500 text-sm">
        系统初始化中，请稍候...
      </div>
    );
  }

  const pendingAuditsCount = serviceRecords.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 font-sans antialiased selection:bg-red-500 selection:text-white">
      
      {/* WeChat Silent Auth & OpenID Console Bar */}
      <WechatAuthConsole
        currentUser={currentUser}
        onUserChange={(user) => {
          setCurrentUser(user);
          if (user.openid) localStorage.setItem('wechat_openid', user.openid);
        }}
        onShowMessage={(msg) => showToast(msg)}
      />

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        users={users}
        currentRole={currentRole}
        onRoleSwitch={(role) => setCurrentRole(role)}
        onUserSelect={handleUserSelect}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {/* Navigation Subnav / Mobile Bottom Bar */}
      <BottomNav
        currentRole={currentRole}
        residentTab={residentTab}
        adminTab={adminTab}
        onResidentTabChange={(tab) => setResidentTab(tab)}
        onAdminTabChange={(tab) => setAdminTab(tab)}
        pendingAuditsCount={pendingAuditsCount}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        
        {/* Global Notification Toast */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold animate-fade-in border border-slate-700 flex items-center space-x-2">
            <span>✨ {toastMessage}</span>
          </div>
        )}

        {/* RESIDENT MODE VIEWS */}
        {currentRole === 'resident' && (
          <>
            {residentTab === 'home' && (
              <ResidentHome
                currentUser={currentUser}
                activities={activities}
                pointsHistory={pointsHistory}
                redemptions={redemptions}
                onNavigateTab={(tab) => setResidentTab(tab)}
                onOpenActivityDetail={(act) => {
                  setSelectedActivityForDetail(act);
                  setResidentTab('activities');
                }}
                onOpenClaimModal={() => setGlobalClaimModalOpen(true)}
              />
            )}

            {residentTab === 'activities' && (
              <ActivityHall
                currentUser={currentUser}
                activities={activities}
                myRegistrations={registrations.filter(r => r.userId === currentUser.id)}
                onRegister={handleRegisterForActivity}
                onSubmitServiceProof={handleSubmitServiceProof}
                selectedActivityForDetail={selectedActivityForDetail}
                onClearSelectedActivity={() => setSelectedActivityForDetail(null)}
              />
            )}

            {residentTab === 'mall' && (
              <PointsMall
                currentUser={currentUser}
                gifts={gifts}
                onRedeemGift={handleRedeemGift}
                onNavigateToRedemptions={() => setResidentTab('profile')}
              />
            )}

            {residentTab === 'profile' && (
              <MyProfile
                currentUser={currentUser}
                registrations={registrations}
                serviceRecords={serviceRecords}
                redemptions={redemptions}
                pointsHistory={pointsHistory}
              />
            )}
          </>
        )}

        {/* ADMINISTRATOR MODE VIEWS */}
        {currentRole === 'admin' && (
          <>
            {adminTab === 'activities_admin' && (
              <ActivityManage
                activities={activities}
                registrations={registrations}
                onCreateActivity={createActivity}
                onUpdateActivity={updateActivity}
                onDeleteActivity={deleteActivity}
              />
            )}

            {adminTab === 'audits_admin' && (
              <AuditHours
                serviceRecords={serviceRecords}
                onAuditRecord={auditServiceRecord}
              />
            )}

            {adminTab === 'gifts_admin' && (
              <GiftManage
                gifts={gifts}
                onCreateGift={createGift}
                onUpdateGift={updateGift}
              />
            )}

            {adminTab === 'verification_admin' && (
              <RedemptionVerification
                redemptions={redemptions}
                currentUser={currentUser}
                onVerifyCode={handleVerifyRedemptionCode}
              />
            )}
          </>
        )}

      </main>

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
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-xs"
              >
                取消
              </button>
              <button
                onClick={handleGlobalClaimSubmit}
                disabled={!claimTitle.trim() || !claimProofText.trim() || isSubmittingClaim}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingClaim ? '提交中...' : '确认提交审核'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
