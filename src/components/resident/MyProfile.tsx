import React, { useState } from 'react';
import { User, Registration, ServiceRecord, Redemption, PointsHistoryItem, SystemEnvMode } from '../../types';
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
  LogOut, 
  LogIn, 
  Sparkles, 
  Lock 
} from 'lucide-react';

interface MyProfileProps {
  currentUser: User | null;
  currentEnvMode?: SystemEnvMode;
  registrations: Registration[];
  serviceRecords: ServiceRecord[];
  redemptions: Redemption[];
  pointsHistory: PointsHistoryItem[];
  onLogout?: () => void;
  onOpenLoginModal?: (prompt?: string) => void;
  onWechatDirectLogin?: () => void;
}

export const MyProfile: React.FC<MyProfileProps> = ({
  currentUser,
  currentEnvMode = 'production',
  registrations,
  serviceRecords,
  redemptions,
  pointsHistory,
  onLogout,
  onOpenLoginModal,
  onWechatDirectLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'redemptions' | 'registrations' | 'records' | 'history'>('redemptions');
  const [viewQrRedemption, setViewQrRedemption] = useState<Redemption | null>(null);

  // If user is not logged in, show Guest/Login view
  if (!currentUser) {
    return (
      <div className="space-y-6 pb-20 md:pb-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs text-center space-y-5">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto text-3xl border border-red-100 shadow-inner">
            <Lock className="w-10 h-10 text-red-500" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-900">您尚未登录社区账号</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              登录后可查看您个人的志愿服务档案、累计工时、积分变动流水以及礼品线下核销二维码凭证。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-sm mx-auto">
            <button
              onClick={() => {
                if (onWechatDirectLogin) {
                  onWechatDirectLogin();
                } else {
                  onOpenLoginModal?.('微信一键授权即可查看您的工时与兑换记录');
                }
              }}
              className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              title="点击直接调起微信登录机制"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M8.5 2C4.36 2 1 4.91 1 8.5c0 1.98 1.02 3.75 2.64 4.96-.13.78-.58 2.21-.66 2.52-.1.39.14.39.3.28.22-.15 2.29-1.56 2.76-1.89.78.23 1.6.36 2.46.36.21 0 .42-.01.63-.03-.23-.62-.36-1.28-.36-1.97 0-3.31 3.13-6 7-6 .12 0 .24.01.36.01C15.02 3.86 12.01 2 8.5 2zm-2.25 4.5c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25S5 8.44 5 7.75 5.56 6.5 6.25 6.5zm4.5 0c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25S9.5 8.44 9.5 7.75 10.06 6.5 10.75 6.5zM15.5 8c-3.59 0-6.5 2.46-6.5 5.5 0 1.74.96 3.29 2.45 4.31-.11.66-.49 1.88-.56 2.14-.08.33.12.33.25.24.19-.13 1.94-1.32 2.34-1.6.66.19 1.36.3 2.08.3 3.59 0 6.5-2.46 6.5-5.5S19.09 8 15.5 8zm-2 3.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
              </svg>
              <span>微信一键授权登录</span>
            </button>

            {currentEnvMode === 'test' && (
              <button
                onClick={() => onOpenLoginModal?.('切换不同身份账号体验测试')}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>选择体验账号</span>
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
            幸福社区志愿者服务中心 · 全程微信授权与工时存证
          </div>
        </div>
      </div>
    );
  }

  // Logged in:
  const myRegistrations = registrations.filter(r => r.userId === currentUser.id);
  const myRecords = serviceRecords.filter(r => r.userId === currentUser.id);
  const myRedemptions = redemptions.filter(r => r.userId === currentUser.id);
  const myHistory = pointsHistory.filter(h => h.userId === currentUser.id);

  return (
    <div className="space-y-5 pb-20 md:pb-10">
      
      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-red-100 shrink-0 overflow-hidden bg-red-50 flex items-center justify-center text-3xl sm:text-4xl shadow-xs">
              {currentUser.avatar && (currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('data:')) ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser.avatar || '👤'}</span>
              )}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap gap-y-1">
                <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate">{currentUser.name}</h2>
                {currentUser.role === 'party_member' && (
                  <span className="bg-red-600 text-white font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-full shrink-0 flex items-center space-x-1 shadow-xs">
                    <span>🚩</span>
                    <span>党员志愿者</span>
                  </span>
                )}
                {currentUser.role === 'admin' && (
                  <span className="bg-amber-100 text-amber-900 font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-full shrink-0">
                    社区管理员
                  </span>
                )}
                <span className="bg-amber-100 text-amber-900 font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-full shrink-0">
                  {currentUser.badge}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-tight">
                联系电话: {currentUser.phone} <span className="hidden xs:inline">·</span> <br className="xs:hidden" />入会时间: {currentUser.joinedDate}
              </p>
              <div className="flex items-center space-x-1 text-[10px] sm:text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 w-fit max-w-full">
                <span className="font-semibold shrink-0">微信 OpenID:</span>
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-emerald-800 truncate">{currentUser.openid || `wx_${currentUser.id}`}</span>
              </div>
            </div>
          </div>

          {/* Logout Action Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors flex items-center space-x-1 text-xs shrink-0 cursor-pointer"
              title="退出当前账号登录"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">退出登录</span>
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-slate-100">
          <div className="bg-amber-50/60 p-2.5 sm:p-3 rounded-2xl border border-amber-100 text-center">
            <div className="text-[10px] sm:text-[11px] text-amber-800 font-medium">当前可用积分</div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-600">{currentUser.points} <span className="text-xs">分</span></div>
          </div>
          <div className="bg-emerald-50/60 p-2.5 sm:p-3 rounded-2xl border border-emerald-100 text-center">
            <div className="text-[10px] sm:text-[11px] text-emerald-800 font-medium">累计志愿服务工时</div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-600">{currentUser.totalHours} <span className="text-xs">小时</span></div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('redemptions')}
          className={`flex-1 py-2 px-3 font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'redemptions' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          兑换凭证 ({myRedemptions.length})
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`flex-1 py-2 px-3 font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'registrations' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          已报活动 ({myRegistrations.length})
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`flex-1 py-2 px-3 font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'records' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          工时记录 ({myRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-3 font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'history' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          积分流水 ({myHistory.length})
        </button>
      </div>

      {/* TAB 1: Redemptions */}
      {activeTab === 'redemptions' && (
        <div className="space-y-3">
          {myRedemptions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
              <QrCode className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">暂无礼品兑换凭证，快去积分商城兑换吧！</p>
            </div>
          ) : (
            myRedemptions.map((red) => (
              <div key={red.id} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{red.giftName}</h4>
                    <p className="text-[11px] text-slate-400">兑换时间: {red.redeemedAt}</p>
                  </div>
                  <div>
                    {red.status === 'pending' ? (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <Clock3 className="w-3 h-3" />
                        <span>待核销领奖</span>
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-slate-500" />
                        <span>已领取</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-slate-400 font-medium">8位现场核销码</div>
                    <div className="font-mono text-base font-extrabold text-red-600 tracking-wider">
                      {red.code}
                    </div>
                  </div>

                  {red.status === 'pending' && (
                    <button
                      onClick={() => setViewQrRedemption(red)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1 shadow-xs cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>查看二维码</span>
                    </button>
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
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
              <CalendarCheck className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">暂无报名的志愿活动</p>
            </div>
          ) : (
            myRegistrations.map((reg) => (
              <div key={reg.id} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{reg.activityTitle}</h4>
                    <p className="text-[11px] text-slate-400">报名时间: {reg.registeredAt}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    报名成功
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Service Records */}
      {activeTab === 'records' && (
        <div className="space-y-3">
          {myRecords.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">暂无服务打卡/补申报记录</p>
            </div>
          ) : (
            myRecords.map((rec) => (
              <div key={rec.id} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{rec.activityTitle}</h4>
                    <p className="text-[11px] text-slate-400">申报工时: {rec.hours} 小时 · 奖励积分: {rec.pointsReward} 分</p>
                  </div>
                  <div>
                    {rec.status === 'pending' ? (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        审核中
                      </span>
                    ) : rec.status === 'approved' ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        已通过入账
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        已驳回
                      </span>
                    )}
                  </div>
                </div>
                {rec.proofText && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    证明材料: {rec.proofText}
                  </p>
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

      {/* Bottom Logout Button */}
      {onLogout && (
        <div className="pt-2">
          <button
            onClick={onLogout}
            className="w-full py-3 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-semibold rounded-2xl text-xs transition-colors flex items-center justify-center space-x-1.5 border border-slate-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>退出当前账号登录</span>
          </button>
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
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
