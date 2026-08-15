import React, { useState } from 'react';
import { Activity, User, Registration } from '../../types';
import { 
  Search, 
  MapPin, 
  Clock, 
  Award, 
  Users, 
  CheckCircle2, 
  X, 
  Send,
  Calendar,
  Building,
  Filter,
  QrCode,
  Share2
} from 'lucide-react';
import { WechatActivityPosterModal } from '../WechatActivityPosterModal';
import { triggerWechatMockShare } from '../../lib/wechatJssdk';

interface ActivityHallProps {
  currentUser: User | null;
  activities: Activity[];
  myRegistrations: Registration[];
  onRegister: (activity: Activity) => Promise<{ success: boolean; message: string }>;
  onSubmitServiceProof: (activityTitle: string, activityId: string, hours: number, pointsReward: number, proofText: string) => Promise<void>;
  selectedActivityForDetail?: Activity | null;
  onClearSelectedActivity?: () => void;
  onOpenLoginModal?: (prompt?: string) => void;
}

export const ActivityHall: React.FC<ActivityHallProps> = ({
  currentUser,
  activities = [],
  myRegistrations = [],
  onRegister,
  onSubmitServiceProof,
  selectedActivityForDetail,
  onClearSelectedActivity,
  onOpenLoginModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState<'all' | 'recruiting' | 'registered'>('all');

  // Modal states
  const [activeDetailModal, setActiveDetailModal] = useState<Activity | null>(selectedActivityForDetail || null);
  const [claimProofModal, setClaimProofModal] = useState<Activity | null>(null);
  const [posterModalActivity, setPosterModalActivity] = useState<Activity | null>(null);
  const [proofText, setProofText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  React.useEffect(() => {
    if (selectedActivityForDetail) {
      setActiveDetailModal(selectedActivityForDetail);
    }
  }, [selectedActivityForDetail]);

  const categories = ['全部', '环保卫士', '关爱邻里', '平安社区', '便民服务', '文明创建'];

  // Safe registration map
  const safeRegistrations = Array.isArray(myRegistrations) ? myRegistrations : [];
  const safeActivities = Array.isArray(activities) ? activities : [];

  const myRegMap = new Map<string, Registration>();
  safeRegistrations.forEach(r => {
    if (r && r.activityId) {
      myRegMap.set(r.activityId, r);
    }
  });

  const term = (searchTerm || '').trim().toLowerCase();

  const filteredActivities = safeActivities.filter(act => {
    if (!act) return false;
    const title = (act.title || '').toLowerCase();
    const desc = (act.description || '').toLowerCase();
    const loc = (act.location || '').toLowerCase();
    const matchesSearch = !term || title.includes(term) || desc.includes(term) || loc.includes(term);
    const matchesCategory = categoryFilter === '全部' || act.category === categoryFilter;
    let matchesStatus = true;
    if (statusFilter === 'recruiting') matchesStatus = act.status === 'recruiting';
    if (statusFilter === 'registered') matchesStatus = myRegMap.has(act.id);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleConfirmRegister = async (act: Activity) => {
    if (!currentUser) {
      onOpenLoginModal?.('请先登录社区账号后再报名参加志愿活动');
      return;
    }
    setIsRegistering(true);
    const res = await onRegister(act);
    setIsRegistering(false);
    setFeedbackToast({ type: res.success ? 'success' : 'error', msg: res.message });
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleConfirmSubmitProof = async () => {
    if (!claimProofModal || !proofText.trim()) return;
    setIsSubmitting(true);
    await onSubmitServiceProof(
      claimProofModal.title,
      claimProofModal.id,
      claimProofModal.hours,
      claimProofModal.pointsReward,
      proofText.trim()
    );
    setIsSubmitting(false);
    setProofText('');
    setClaimProofModal(null);
    setFeedbackToast({ type: 'success', msg: '服务记录与工时打卡已提交，等待管理员审核后发放积分！' });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  return (
    <div className="space-y-5 pb-20 md:pb-10">
      
      {/* Search & Category Filter Header */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索志愿活动名称、地点、描述..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none shadow-xs"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
                categoryFilter === cat
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Tab Switch */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 py-1.5 font-medium rounded-lg transition-colors ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            全部活动
          </button>
          <button
            onClick={() => setStatusFilter('recruiting')}
            className={`flex-1 py-1.5 font-medium rounded-lg transition-colors ${
              statusFilter === 'recruiting' ? 'bg-white text-red-600 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            招募中
          </button>
          <button
            onClick={() => setStatusFilter('registered')}
            className={`flex-1 py-1.5 font-medium rounded-lg transition-colors ${
              statusFilter === 'registered' ? 'bg-white text-emerald-600 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            我报名的 ({myRegistrations.length})
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {feedbackToast && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md animate-fade-in ${
          feedbackToast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <span>{feedbackToast.msg}</span>
          <button onClick={() => setFeedbackToast(null)} className="p-1 hover:bg-white/20 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Activities Grid */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 space-y-2 border border-slate-200">
            <div className="text-3xl">🔍</div>
            <p className="text-xs">未找到符合条件的志愿服务活动</p>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const isRegistered = myRegMap.has(act.id);
            const myReg = myRegMap.get(act.id);
            const isFull = act.signedCount >= act.maxSeats;

            return (
              <div
                key={act.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-red-300 transition-all p-4 space-y-3"
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {act.category}
                      </span>
                      {act.status === 'recruiting' && !isFull && (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          招募中
                        </span>
                      )}
                      {isFull && act.status === 'recruiting' && (
                        <span className="bg-amber-50 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          已满员
                        </span>
                      )}
                      {act.status === 'in_progress' && (
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          进行中
                        </span>
                      )}
                      {act.status === 'completed' && (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          已结束
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {act.title}
                    </h3>
                  </div>

                  {/* Rewards */}
                  <div className="text-right shrink-0">
                    <div className="text-sm sm:text-base font-extrabold text-red-600">
                      +{act.pointsReward} 积分
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {act.hours} 小时工时
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {act.description}
                </p>

                {/* Info row */}
                <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-xl border border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-start space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800 leading-snug">{act.location}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-medium text-slate-700">{act.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60 gap-1">
                    <div className="flex items-center space-x-1 text-slate-500 min-w-0 flex-1">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{act.organizer}</span>
                    </div>
                    <div className="flex items-center space-x-1 font-semibold text-slate-700 shrink-0 bg-white px-2 py-0.5 rounded-md border border-slate-200/60 shadow-2xs">
                      <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>已报 {act.signedCount} / 名额 {act.maxSeats}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setActiveDetailModal(act)}
                      className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-[11px] sm:text-xs transition-colors shrink-0"
                    >
                      详情
                    </button>

                    <button
                      onClick={() => setPosterModalActivity(act)}
                      className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 font-semibold rounded-xl text-[11px] sm:text-xs transition-colors flex items-center space-x-1 shrink-0"
                      title="生成朋友圈宣传海报"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>海报</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {isRegistered ? (
                      <>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                          <span>{myReg?.status === 'completed' ? '已发放积分' : '已报名'}</span>
                        </span>

                        <button
                          onClick={() => setClaimProofModal(act)}
                          className="py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-[11px] shadow-xs active:scale-95 transition-all"
                        >
                          提交打卡
                        </button>
                      </>
                    ) : act.status === 'recruiting' && !isFull ? (
                      <button
                        onClick={() => handleConfirmRegister(act)}
                        disabled={isRegistering}
                        className="py-1.5 px-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-[11px] sm:text-xs transition-colors shadow-xs"
                      >
                        立即报名
                      </button>
                    ) : (
                      <button
                        disabled
                        className="py-1.5 px-3 bg-slate-100 text-slate-400 font-medium rounded-xl text-[11px]"
                      >
                        {isFull ? '名额已满' : '报名已截止'}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Activity Detail Modal */}
      {activeDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="bg-red-50 text-red-700 font-bold text-xs px-2.5 py-1 rounded-md">
                {activeDetailModal.category}
              </span>
              <button
                onClick={() => {
                  setActiveDetailModal(null);
                  if (onClearSelectedActivity) onClearSelectedActivity();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">{activeDetailModal.title}</h2>
              <div className="flex items-center space-x-3 text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl">
                <Award className="w-4 h-4 text-red-600" />
                <span>完成报酬：+{activeDetailModal.pointsReward} 积分 & {activeDetailModal.hours} 小时服务工时</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div><span className="font-semibold text-slate-700">服务地点：</span>{activeDetailModal.location}</div>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div><span className="font-semibold text-slate-700">服务时间：</span>{activeDetailModal.date}</div>
              </div>
              <div className="flex items-start space-x-2">
                <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div><span className="font-semibold text-slate-700">组织单位：</span>{activeDetailModal.organizer}</div>
              </div>
              <div className="flex items-start space-x-2">
                <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div><span className="font-semibold text-slate-700">报名名额：</span>已报名 {activeDetailModal.signedCount} 人 / 限额 {activeDetailModal.maxSeats} 人</div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-slate-800">活动说明与要求：</div>
              <p className="text-slate-600 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl">
                {activeDetailModal.description}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => setPosterModalActivity(activeDetailModal)}
                className="w-full sm:w-auto px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <QrCode className="w-4 h-4" />
                <span>生成微信宣传海报</span>
              </button>

              {myRegMap.has(activeDetailModal.id) ? (
                <div className="w-full text-center py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 flex-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>您已成功报名该项目，请按时参加</span>
                </div>
              ) : activeDetailModal.status === 'recruiting' && activeDetailModal.signedCount < activeDetailModal.maxSeats ? (
                <button
                  onClick={() => {
                    handleConfirmRegister(activeDetailModal);
                    setActiveDetailModal(null);
                  }}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex-1"
                >
                  确认一键报名
                </button>
              ) : (
                <button disabled className="w-full py-3 bg-slate-200 text-slate-500 font-bold rounded-xl text-xs flex-1">
                  暂不可报名
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Poster Generation Modal */}
      {posterModalActivity && (
        <WechatActivityPosterModal
          activity={posterModalActivity}
          currentUser={currentUser}
          onClose={() => setPosterModalActivity(null)}
          onShowMessage={(msg, type) => {
            setFeedbackToast({ type: type === 'error' ? 'error' : 'success', msg });
            setTimeout(() => setFeedbackToast(null), 3500);
          }}
        />
      )}

      {/* Hour Claims / Proof Submission Modal */}
      {claimProofModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">提交志愿服务打卡工时</h3>
              <button onClick={() => setClaimProofModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 text-blue-900 p-3 rounded-xl text-xs space-y-1 border border-blue-100">
              <div className="font-bold">{claimProofModal.title}</div>
              <div className="text-blue-700">完成该服务可获得：<span className="font-bold text-red-600">+{claimProofModal.pointsReward} 积分</span> & <span className="font-bold text-emerald-700">{claimProofModal.hours} 小时工时</span></div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-800">打卡服务成果与总结：</label>
              <textarea
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                placeholder="例如：按时前往居民楼进行巡查，劝导移走违规电动车3台，清理楼道推积杂物并拍照留存..."
                rows={4}
                className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setClaimProofModal(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmSubmitProof}
                disabled={!proofText.trim() || isSubmitting}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? '提交中...' : '提交打卡审核'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
