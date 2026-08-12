import React from 'react';
import { Activity, ServiceRecord, Gift, Redemption, User } from '../../types';
import { 
  PlusCircle, 
  ClipboardCheck, 
  Gift as GiftIcon, 
  QrCode, 
  Users, 
  Clock, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AdminTab } from '../BottomNav';

interface AdminDashboardProps {
  activities: Activity[];
  serviceRecords: ServiceRecord[];
  gifts: Gift[];
  redemptions: Redemption[];
  users: User[];
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activities,
  serviceRecords,
  gifts,
  redemptions,
  users,
  onNavigateTab,
}) => {
  const pendingAudits = serviceRecords.filter(r => r.status === 'pending');
  const pendingRedemptions = redemptions.filter(r => r.status === 'pending');
  const totalVolunteers = users.filter(u => u.role === 'resident').length;

  const totalHoursAwarded = users.reduce((acc, u) => acc + (u.totalHours || 0), 0);

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      
      {/* Admin Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <QrCode className="w-72 h-72 text-amber-400" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-2xl backdrop-blur-md">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight">社区志愿服务后台管理中心</h2>
                <span className="bg-amber-400 text-slate-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  管理员模式
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">轻松发布服务活动、审核居民工时、上架积分礼品、现场扫码核销</p>
            </div>
          </div>
        </div>

        {/* Top Operational Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div 
            onClick={() => onNavigateTab('audits_admin')}
            className="bg-slate-800/90 hover:bg-slate-800 p-3.5 rounded-2xl border border-slate-700 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>待审核工时</span>
              <ClipboardCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{pendingAudits.length} <span className="text-xs font-normal">条</span></div>
          </div>

          <div 
            onClick={() => onNavigateTab('verification_admin')}
            className="bg-slate-800/90 hover:bg-slate-800 p-3.5 rounded-2xl border border-slate-700 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>待核销领奖</span>
              <QrCode className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-red-400 mt-1">{pendingRedemptions.length} <span className="text-xs font-normal">件</span></div>
          </div>

          <div 
            onClick={() => onNavigateTab('activities_admin')}
            className="bg-slate-800/90 hover:bg-slate-800 p-3.5 rounded-2xl border border-slate-700 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>志愿服务活动</span>
              <PlusCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{activities.length} <span className="text-xs font-normal">场</span></div>
          </div>

          <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>社区志愿者</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400 mt-1">{totalVolunteers} <span className="text-xs font-normal">人</span></div>
          </div>
        </div>
      </div>

      {/* Admin Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Verification Center Fast Card */}
        <div 
          onClick={() => onNavigateTab('verification_admin')}
          className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-6 rounded-3xl shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <QrCode className="w-6 h-6 text-amber-300" />
              <h3 className="font-bold text-lg">现场领奖核销中心</h3>
            </div>
            <p className="text-xs text-red-100 max-w-xs">
              居民凭 8 位兑换码或二维码现场领奖，点击直接输入/扫码完成核销。
            </p>
            <div className="pt-2 text-xs font-bold text-amber-300 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
              <span>进入现场核销中心</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30 hidden sm:block">
            <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
          </div>
        </div>

        {/* Work Hour Audit Fast Card */}
        <div 
          onClick={() => onNavigateTab('audits_admin')}
          className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center justify-between group border border-slate-700"
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ClipboardCheck className="w-6 h-6 text-emerald-400" />
              <h3 className="font-bold text-lg">工时与积分审核</h3>
            </div>
            <p className="text-xs text-slate-300 max-w-xs">
              审核居民提交的打卡记录，审核通过后系统自动发放积分与志愿工时。
            </p>
            <div className="pt-2 text-xs font-bold text-emerald-400 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
              <span>审核工时记录 ({pendingAudits.length} 待办)</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
