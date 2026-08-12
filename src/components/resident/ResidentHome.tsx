import React from 'react';
import { User, Activity, PointsHistoryItem, Redemption } from '../../types';
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
  ShieldCheck
} from 'lucide-react';

interface ResidentHomeProps {
  currentUser: User;
  activities: Activity[];
  pointsHistory: PointsHistoryItem[];
  redemptions: Redemption[];
  onNavigateTab: (tab: 'activities' | 'mall' | 'profile') => void;
  onOpenActivityDetail: (activity: Activity) => void;
  onOpenClaimModal: () => void;
}

export const ResidentHome: React.FC<ResidentHomeProps> = ({
  currentUser,
  activities,
  pointsHistory,
  redemptions,
  onNavigateTab,
  onOpenActivityDetail,
  onOpenClaimModal,
}) => {
  // Filter recent activities (top 3 recruiting or in progress)
  const recentActivities = activities
    .filter(a => a.status === 'recruiting' || a.status === 'in_progress')
    .slice(0, 3);

  // Filter recent user points
  const myPoints = pointsHistory
    .filter(p => p.userId === currentUser.id)
    .slice(0, 4);

  // Pending redemptions
  const pendingRedemptions = redemptions.filter(
    r => r.userId === currentUser.id && r.status === 'pending'
  );

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      
      {/* User Points & Hours Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-amber-600 rounded-3xl text-white shadow-xl p-6 sm:p-8">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Award className="w-80 h-80 text-white" />
        </div>

        {/* User Info Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-4xl bg-white/20 p-2 rounded-2xl backdrop-blur-md shadow-inner border border-white/30">
              {currentUser.avatar}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight">{currentUser.name}</h2>
                <span className="bg-amber-300 text-amber-950 font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-amber-800" />
                  <span>{currentUser.badge}</span>
                </span>
              </div>
              <p className="text-xs text-red-100 mt-0.5">居民账号 · {currentUser.phone}</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('profile')}
            className="text-xs bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm transition-all flex items-center space-x-1"
          >
            <span>个人中心</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-xs text-red-100 font-medium">
              <Award className="w-4 h-4 text-amber-300" />
              <span>当前可用积分</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold text-amber-300 tracking-tight">
                {currentUser.points}
              </span>
              <span className="text-xs text-red-100 font-medium">分</span>
            </div>
          </div>

          <div className="space-y-1 border-l border-white/20 pl-4">
            <div className="flex items-center space-x-1.5 text-xs text-red-100 font-medium">
              <Clock className="w-4 h-4 text-emerald-300" />
              <span>累计志愿工时</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold text-emerald-300 tracking-tight">
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
            className="mt-4 bg-amber-400/90 text-amber-950 px-3.5 py-2 rounded-xl flex items-center justify-between text-xs font-semibold cursor-pointer hover:bg-amber-300 transition-colors shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <QrCode className="w-4 h-4 text-amber-900 animate-bounce" />
              <span>我有 {pendingRedemptions.length} 个礼品兑换码待现场核销领奖</span>
            </div>
            <span className="underline text-[11px] font-bold">查看核销码 &rarr;</span>
          </div>
        )}
      </div>

      {/* Quick Access Action Shortcuts */}
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('activities')}
          className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-1.5 group"
        >
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">活动大厅</span>
        </button>

        <button
          onClick={() => onNavigateTab('mall')}
          className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-1.5 group"
        >
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
            <Gift className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">积分商城</span>
        </button>

        <button
          onClick={onOpenClaimModal}
          className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-1.5 group"
        >
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
            <FileCheck className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">补打卡/工时</span>
        </button>

        <button
          onClick={() => onNavigateTab('profile')}
          className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-1.5 group"
        >
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-700">我的兑换码</span>
        </button>
      </div>

      {/* Recent Volunteer Activities Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-slate-800 text-base">近期志愿服务活动</h3>
          </div>
          <button
            onClick={() => onNavigateTab('activities')}
            className="text-xs text-red-600 font-semibold hover:text-red-700 flex items-center space-x-0.5"
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

      {/* Points History Flow */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 text-base">近期积分明细</h3>
          </div>
          <button
            onClick={() => onNavigateTab('profile')}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            全光明细 &rarr;
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

    </div>
  );
};
