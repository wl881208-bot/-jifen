import React from 'react';
import { User, Activity, PointsHistoryItem, Redemption, CommunityIssue } from '../../types';
import { 
  Award, 
  Clock, 
  Gift, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  Sparkles, 
  QrCode, 
  FileCheck, 
  ChevronRight, 
  LogIn,
  HeartHandshake,
  CheckCircle2,
  BookOpen,
  Camera,
  MapPin,
  Eye,
  CheckCircle
} from 'lucide-react';

interface ResidentHomeProps {
  currentUser: User | null;
  activities: Activity[];
  pointsHistory: PointsHistoryItem[];
  redemptions: Redemption[];
  issues?: CommunityIssue[];
  onNavigateTab: (tab: 'activities' | 'mall' | 'profile') => void;
  onOpenActivityDetail: (activity: Activity) => void;
  onOpenClaimModal: () => void;
  onOpenLoginModal?: (prompt?: string) => void;
  onOpenSnapModal: () => void;
  onOpenSnapFeedModal: () => void;
}

export const ResidentHome: React.FC<ResidentHomeProps> = ({
  currentUser,
  activities,
  pointsHistory,
  redemptions,
  issues = [],
  onNavigateTab,
  onOpenActivityDetail,
  onOpenClaimModal,
  onOpenLoginModal,
  onOpenSnapModal,
  onOpenSnapFeedModal,
}) => {
  // Filter recent activities (top 3 recruiting or in progress)
  const recentActivities = (activities || [])
    .filter(a => a && (a.status === 'recruiting' || a.status === 'in_progress'))
    .slice(0, 3);

  // Filter recent user points if logged in
  const myPoints = currentUser
    ? (pointsHistory || []).filter(p => p.userId === currentUser.id).slice(0, 4)
    : [];

  // Pending redemptions if logged in
  const pendingRedemptions = currentUser
    ? (redemptions || []).filter(r => r.userId === currentUser.id && r.status === 'pending')
    : [];

  // Recent resolved issues for public showcase
  const recentIssues = (issues || []).slice(0, 2);

  const handleSnapClick = () => {
    if (!currentUser) {
      onOpenLoginModal?.('请先登录居民账号，方可使用随手拍反馈问题并领取 +15 爱心积分！');
    } else {
      onOpenSnapModal();
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      
      {/* Hero Banner: Logged In vs Unlogged In */}
      {currentUser ? (
        /* LOGGED IN: User Points & Hours Hero Banner */
        <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-amber-600 rounded-3xl text-white shadow-xl p-4 sm:p-6">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Award className="w-80 h-80 text-white" />
          </div>

          {/* User Info Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5 min-w-0 pr-2">
              <div className="text-3xl sm:text-4xl bg-white/20 p-2 rounded-2xl backdrop-blur-md shadow-inner border border-white/30 shrink-0">
                {currentUser.avatar}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">{currentUser.name}</h2>
                  {currentUser.role === 'party_member' && (
                    <span className="bg-red-800 text-amber-200 border border-amber-300/40 font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-xs shrink-0">
                      <span>🚩</span>
                      <span>党员志愿者</span>
                    </span>
                  )}
                  <span className="bg-amber-300 text-amber-950 font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-xs shrink-0">
                    <Sparkles className="w-3 h-3 text-amber-800" />
                    <span>{currentUser.badge}</span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-red-100 mt-0.5 truncate">
                  {currentUser.role === 'admin' ? '社区管理员' : currentUser.role === 'party_member' ? '党员先锋岗' : '居民志愿者'} · {currentUser.phone}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('profile')}
              className="text-[11px] sm:text-xs bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-full border border-white/20 backdrop-blur-sm transition-all flex items-center space-x-1 shrink-0 cursor-pointer"
            >
              <span>个人中心</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20">
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-xs text-red-100 font-medium">
                <Award className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="truncate">当前可用积分</span>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight">
                  {currentUser.points}
                </span>
                <span className="text-xs text-red-100 font-medium">分</span>
              </div>
            </div>

            <div className="space-y-1 border-l border-white/20 pl-3">
              <div className="flex items-center space-x-1 text-xs text-red-100 font-medium">
                <Clock className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="truncate">累计志愿工时</span>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300 tracking-tight">
                  {currentUser.totalHours}
                </span>
                <span className="text-xs text-red-100 font-medium">小时</span>
              </div>
            </div>
          </div>

          {/* Quick Voucher Reminder Banner if has pending voucher */}
          {pendingRedemptions.length > 0 && (
            <div 
              onClick={() => onNavigateTab('profile')}
              className="mt-3 bg-amber-400/90 text-amber-950 px-3 py-2 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer hover:bg-amber-300 transition-colors shadow-sm"
            >
              <div className="flex items-center space-x-1.5 min-w-0 pr-1">
                <QrCode className="w-4 h-4 text-amber-900 animate-bounce shrink-0" />
                <span className="truncate">我有 {pendingRedemptions.length} 个礼品兑换码待现场核销领奖</span>
              </div>
              <span className="underline text-[11px] font-bold shrink-0 whitespace-nowrap">查看核销码 &rarr;</span>
            </div>
          )}
        </div>
      ) : (
        /* NOT LOGGED IN: Public Community Welcome Banner (No Personal User Info) */
        <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-amber-700 rounded-3xl text-white shadow-xl p-5 sm:p-7">
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <HeartHandshake className="w-80 h-80 text-white" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/30 text-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>幸福社区新时代文明实践站</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                志愿微服务 · 积分换好礼
              </h2>
              <p className="text-xs sm:text-sm text-red-100/90 leading-relaxed max-w-xl">
                欢迎来到幸福社区志愿服务与积分兑换平台。参与社区清洁、关爱邻里、便民服务，赚取爱心积分兑换丰富生活好礼！
              </p>
            </div>

            {/* Public Community Stats */}
            <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-black/15 backdrop-blur-md rounded-2xl border border-white/15 text-center">
              <div>
                <div className="text-lg sm:text-xl font-black text-amber-300">120+</div>
                <div className="text-[10px] sm:text-xs text-red-100">注册志愿者</div>
              </div>
              <div className="border-x border-white/15">
                <div className="text-lg sm:text-xl font-black text-emerald-300">386h</div>
                <div className="text-[10px] sm:text-xs text-red-100">累计服务工时</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black text-amber-300">5,800+</div>
                <div className="text-[10px] sm:text-xs text-red-100">发放爱心积分</div>
              </div>
            </div>

            {/* Login Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              <button
                onClick={() => onOpenLoginModal?.('微信一键授权即可同步个人志愿档案与积分')}
                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M8.5 2C4.36 2 1 4.91 1 8.5c0 1.98 1.02 3.75 2.64 4.96-.13.78-.58 2.21-.66 2.52-.1.39.14.39.3.28.22-.15 2.29-1.56 2.76-1.89.78.23 1.6.36 2.46.36.21 0 .42-.01.63-.03-.23-.62-.36-1.28-.36-1.97 0-3.31 3.13-6 7-6 .12 0 .24.01.36.01C15.02 3.86 12.01 2 8.5 2zm-2.25 4.5c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25S5 8.44 5 7.75 5.56 6.5 6.25 6.5zm4.5 0c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25S9.5 8.44 9.5 7.75 10.06 6.5 10.75 6.5zM15.5 8c-3.59 0-6.5 2.46-6.5 5.5 0 1.74.96 3.29 2.45 4.31-.11.66-.49 1.88-.56 2.14-.08.33.12.33.25.24.19-.13 1.94-1.32 2.34-1.6.66.19 1.36.3 2.08.3 3.59 0 6.5-2.46 6.5-5.5S19.09 8 15.5 8zm-2 3.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
                </svg>
                <span>微信一键授权登录 / 注册</span>
              </button>
              
              <button
                onClick={() => onOpenLoginModal?.('可选择系统预设的志愿者或管理员身份体验')}
                className="py-3 px-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-2xl text-xs sm:text-sm border border-white/30 backdrop-blur-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>选择身份账号体验</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 随手拍 (Community Snap & Report) Feature Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-red-50/50 to-amber-50 rounded-3xl p-4 sm:p-5 border border-red-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">邻里随手拍 · 身边事速通</h3>
                <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                  办结奖 +15分
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                环境卫生、路灯破损、飞线充电？随手拍一拍，网格员火速响应整改！
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSnapFeedModal}
            className="hidden sm:flex items-center space-x-1 text-xs font-bold text-red-600 hover:text-red-700 bg-white border border-red-200 px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>公示广场 ({issues.length})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleSnapClick}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
          >
            <Camera className="w-4 h-4" />
            <span>{currentUser ? '📸 马上随手拍上报 (奖15分)' : '🔒 登录后使用随手拍 (奖15分)'}</span>
          </button>

          <button
            onClick={onOpenSnapFeedModal}
            className="w-full py-2.5 px-4 bg-white hover:bg-red-50/50 text-slate-700 hover:text-red-700 font-bold rounded-2xl text-xs sm:text-sm border border-red-200/90 shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-red-600" />
            <span>查看社区随手拍办结公示 ({issues.length}条)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Issue Showcase Snippet */}
        {recentIssues.length > 0 && (
          <div className="pt-2 border-t border-red-200/50 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700 flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>最新办结公示速览</span>
              </span>
              <button
                onClick={onOpenSnapFeedModal}
                className="text-red-600 font-medium text-[11px] hover:underline cursor-pointer"
              >
                查看更多 &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recentIssues.map((issue) => (
                <div 
                  key={issue.id} 
                  onClick={onOpenSnapFeedModal}
                  className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center space-x-2.5 hover:border-red-200 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img 
                      src={issue.replyImage || issue.images?.[0] || 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&q=80&w=600'} 
                      alt="工单" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-100">
                        {issue.category}
                      </span>
                      <h5 className="text-xs font-bold text-slate-800 truncate">{issue.title}</h5>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      <span className="truncate">{issue.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Action Shortcuts */}
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('activities')}
          className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-1.5 group cursor-pointer"
        >
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">活动大厅</span>
        </button>

        <button
          onClick={() => onNavigateTab('mall')}
          className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-1.5 group cursor-pointer"
        >
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
            <Gift className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">积分商城</span>
        </button>

        <button
          onClick={() => {
            if (!currentUser) {
              onOpenLoginModal?.('请先微信登录后再提交志愿服务打卡与工时申报');
            } else {
              onOpenClaimModal();
            }
          }}
          className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-1.5 group cursor-pointer"
        >
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
            <FileCheck className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">补打卡/工时</span>
        </button>

        <button
          onClick={() => {
            if (!currentUser) {
              onOpenLoginModal?.('请先微信登录后再查看礼品核销二维码凭证');
            } else {
              onNavigateTab('profile');
            }
          }}
          className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-1.5 group cursor-pointer"
        >
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">我的兑换码</span>
        </button>
      </div>

      {/* Recent Volunteer Activities Section (Public) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-slate-800 text-base">近期志愿招募活动</h3>
          </div>
          <button
            onClick={() => onNavigateTab('activities')}
            className="text-xs text-red-600 font-semibold hover:text-red-700 flex items-center space-x-0.5 cursor-pointer"
          >
            <span>查看全部</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {recentActivities.map((act) => (
            <div
              key={act.id}
              onClick={() => onOpenActivityDetail(act)}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-red-200 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-red-100">
                      {act.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{act.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{act.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold text-red-600">+{act.pointsReward} 积分</div>
                  <div className="text-[10px] text-slate-400">{act.hours} 小时工时</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-3">
                  <span className="truncate max-w-[150px]">📍 {act.location}</span>
                  <span>⏰ {act.date.split(' ')[0]}</span>
                </div>
                <div className="text-[11px] font-medium text-emerald-600">
                  剩余名额: {act.maxSeats - act.signedCount} / {act.maxSeats}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: If Logged in -> Personal Points History, If Unlogged -> Community Rules & Points Guide */}
      {currentUser ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-800 text-base">近期积分明细</h3>
            </div>
            <button
              onClick={() => onNavigateTab('profile')}
              className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              全部明细 &rarr;
            </button>
          </div>

          {myPoints.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">暂无积分变动记录</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myPoints.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5 pr-2">
                    <div className="text-xs font-semibold text-slate-800">{item.title}</div>
                    <div className="text-[11px] text-slate-400">{item.createdAt}</div>
                  </div>
                  <div className={`font-bold text-sm ${item.type === 'earn' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {item.type === 'earn' ? `+${item.amount}` : `-${item.amount}`} 分
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-slate-800 text-base">社区志愿积分奖励规则</h3>
            </div>
            <span className="text-[11px] text-slate-400">公开公示</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-red-50/70 p-3.5 rounded-xl border border-red-100 space-y-1">
              <div className="flex items-center space-x-1 text-xs font-bold text-red-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>1. 参与志愿活动</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                每参加 1 小时志愿服务，经居委会审核通过后计入 1 工时并奖励 20 爱心积分。
              </p>
            </div>

            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-100 space-y-1">
              <div className="flex items-center space-x-1 text-xs font-bold text-amber-800">
                <Gift className="w-3.5 h-3.5" />
                <span>2. 兑换生活好礼</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                累积的爱心积分可在「积分商城」在线兑换大米、食用油、洗衣液等生活用品。
              </p>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100 space-y-1">
              <div className="flex items-center space-x-1 text-xs font-bold text-emerald-700">
                <Award className="w-3.5 h-3.5" />
                <span>3. 现场领奖核销</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                兑换成功后凭动态核销码前往社区党群服务中心1楼服务台，扫码即可当场领奖。
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
            <span>登录后可实时记录您的每一份奉献与积分积累</span>
            <button
              onClick={() => onOpenLoginModal?.('登录后即可开启您的社区志愿积分档案')}
              className="text-red-600 font-bold hover:text-red-700 flex items-center space-x-0.5 cursor-pointer"
            >
              <span>立即登录</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
