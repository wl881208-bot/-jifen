import React, { useState } from 'react';
import { User, Registration, ServiceRecord, Redemption, PointsHistoryItem } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  User as UserIcon, 
  Award, 
  Clock, 
  QrCode, 
  CalendarCheck, 
  FileText, 
  TrendingUp, 
  CheckCircle2, 
  Clock3, 
  X,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface MyProfileProps {
  currentUser: User;
  registrations: Registration[];
  serviceRecords: ServiceRecord[];
  redemptions: Redemption[];
  pointsHistory: PointsHistoryItem[];
}

export const MyProfile: React.FC<MyProfileProps> = ({
  currentUser,
  registrations,
  serviceRecords,
  redemptions,
  pointsHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'redemptions' | 'registrations' | 'records' | 'history'>('redemptions');
  const [viewQrRedemption, setViewQrRedemption] = useState<Redemption | null>(null);

  const myRegistrations = registrations.filter(r => r.userId === currentUser.id);
  const myRecords = serviceRecords.filter(r => r.userId === currentUser.id);
  const myRedemptions = redemptions.filter(r => r.userId === currentUser.id);
  const myHistory = pointsHistory.filter(h => h.userId === currentUser.id);

  return (
    <div className="space-y-5 pb-20 md:pb-10">
      
      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center space-x-4">
          <div className="text-5xl bg-red-50 p-3 rounded-2xl border border-red-100 shrink-0">
            {currentUser.avatar}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
              <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-0.5 rounded-full">
                {currentUser.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500">联系电话: {currentUser.phone} · 入会时间: {currentUser.joinedDate}</p>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 w-fit">
              <span className="font-semibold">微信 OpenID 绑定:</span>
              <span className="font-mono text-[11px] font-bold text-emerald-800">{currentUser.openid || 'mock_openid_resident_001'}</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100 text-center">
            <div className="text-[11px] text-amber-800 font-medium">当前可用积分</div>
            <div className="text-2xl font-extrabold text-amber-600">{currentUser.points} <span className="text-xs">分</span></div>
          </div>
          <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 text-center">
            <div className="text-[11px] text-emerald-800 font-medium">累计志愿服务工时</div>
            <div className="text-2xl font-extrabold text-emerald-600">{currentUser.totalHours} <span className="text-xs">小时</span></div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('redemptions')}
          className={`flex-1 py-2 px-3 font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'redemptions' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          兑换凭证 ({myRedemptions.length})
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`flex-1 py-2 px-3 font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'registrations' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          已报活动 ({myRegistrations.length})
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`flex-1 py-2 px-3 font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'records' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          工时打卡记录 ({myRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-3 font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'history' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          积分流水 ({myHistory.length})
        </button>
      </div>

      {/* TAB 1: Redemptions list */}
      {activeTab === 'redemptions' && (
        <div className="space-y-3">
          {myRedemptions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-200">
              暂无礼品兑换凭证
            </div>
          ) : (
            myRedemptions.map((red) => (
              <div
                key={red.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between space-x-3"
              >
                <div className="flex items-center space-x-3">
                  <img src={red.giftImage} alt={red.giftName} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{red.giftName}</h4>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <span>兑换时间: {red.createdAt.split(' ')[0]}</span>
                      <span>{red.pointsCost} 积分</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-red-600">
                      码: {red.code}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {red.status === 'pending' ? (
                    <button
                      onClick={() => setViewQrRedemption(red)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center space-x-1 shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>出示二维码</span>
                    </button>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      已于 {red.redeemedAt?.split(' ')[0] || '此前'} 核销领奖
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Registrations */}
      {activeTab === 'registrations' && (
        <div className="space-y-3">
          {myRegistrations.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-200">
              暂无报名的活动
            </div>
          ) : (
            myRegistrations.map((reg) => (
              <div key={reg.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{reg.activityTitle}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">报名时间: {reg.signedAt}</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                    +{reg.pointsReward} 积分 / {reg.hours}h
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Service Records (Hour Claims) */}
      {activeTab === 'records' && (
        <div className="space-y-3">
          {myRecords.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-200">
              暂无工时打卡记录
            </div>
          ) : (
            myRecords.map((rec) => (
              <div key={rec.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{rec.activityTitle}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">提交时间: {rec.createdAt}</p>
                  </div>

                  {rec.status === 'pending' && (
                    <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1">
                      <Clock3 className="w-3.5 h-3.5" />
                      <span>待管理员审核</span>
                    </span>
                  )}
                  {rec.status === 'approved' && (
                    <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>通过 (+{rec.pointsEarned}分)</span>
                    </span>
                  )}
                  {rec.status === 'rejected' && (
                    <span className="bg-red-100 text-red-900 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
                      <span>已驳回</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {rec.proofText}
                </p>

                {rec.status === 'rejected' && rec.rejectReason && (
                  <div className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg">
                    驳回原因: {rec.rejectReason}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: Points History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 shadow-xs">
          {myHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">暂无积分变动流水</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myHistory.map((h) => (
                <div key={h.id} className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5 pr-2">
                    <div className="text-xs font-bold text-slate-800">{h.title}</div>
                    <div className="text-[11px] text-slate-500">{h.description}</div>
                    <div className="text-[10px] text-slate-400">{h.createdAt}</div>
                  </div>
                  <div className={`font-bold text-sm ${h.type === 'earn' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {h.type === 'earn' ? `+${h.amount}` : `-${h.amount}`} 分
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View QR Code Modal */}
      {viewQrRedemption && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">出示现场核销凭证</h3>
              <button onClick={() => setViewQrRedemption(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-slate-800 text-sm">{viewQrRedemption.giftName}</div>
              <div className="text-xs text-slate-400">兑换人: {viewQrRedemption.userName}</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center space-y-3">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100">
                <QRCodeSVG
                  value={viewQrRedemption.code}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-400 font-medium">核销兑换码</div>
                <div className="text-lg font-mono font-extrabold text-red-600 tracking-wider bg-red-50 border border-red-200 px-3 py-1 rounded-lg">
                  {viewQrRedemption.code}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              请前往幸福社区党群服务中心1楼，向管理员出示此二维码或核销码领奖。
            </p>

            <button
              onClick={() => setViewQrRedemption(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
            >
              关闭
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
