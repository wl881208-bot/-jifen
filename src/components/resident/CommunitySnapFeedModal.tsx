import React, { useState } from 'react';
import { User, CommunityIssue, IssueCategory, IssueStatus } from '../../types';
import { 
  X, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Camera, 
  MessageSquare, 
  ArrowRight,
  Filter,
  Eye,
  CheckCircle
} from 'lucide-react';

interface CommunitySnapFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  issues: CommunityIssue[];
  onOpenReportModal: () => void;
}

export const CommunitySnapFeedModal: React.FC<CommunitySnapFeedModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  issues,
  onOpenReportModal,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | IssueStatus>('all');
  const [selectedIssue, setSelectedIssue] = useState<CommunityIssue | null>(null);

  if (!isOpen) return null;

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    if (activeTab === 'mine') {
      if (!currentUser || issue.userId !== currentUser.id) return false;
    }
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>已办结整改</span>
          </span>
        );
      case 'processing':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
            <span>网格员处理中</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
            已驳回/无效
          </span>
        );
      default:
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
            <AlertCircle className="w-3 h-3 text-blue-500" />
            <span>待网格受理</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-4 sm:p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-between pr-10">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 text-white">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">社区随手拍 · 办结公示广场</h3>
                <p className="text-xs text-red-100 mt-0.5">
                  全过程公开透明，居民随手一拍，社区网格必应！
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenReportModal();
              }}
              className="bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold px-3 py-2 rounded-xl shadow-md transition-all flex items-center space-x-1 cursor-pointer shrink-0"
            >
              <span>+ 我要随手拍</span>
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center space-x-2 mt-4 pt-2 border-t border-white/20">
            <button
              onClick={() => setActiveTab('all')}
              className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-red-700 shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              全部公示 ({issues.length})
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                activeTab === 'mine'
                  ? 'bg-white text-red-700 shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              我的上报 ({currentUser ? issues.filter(i => i.userId === currentUser.id).length : 0})
            </button>

            {/* Filter */}
            <div className="ml-auto flex items-center space-x-1 bg-black/20 px-2 py-0.5 rounded-full">
              <Filter className="w-3 h-3 text-white/80" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-white text-[11px] font-medium outline-none cursor-pointer"
              >
                <option value="all" className="text-slate-800">全部状态</option>
                <option value="pending" className="text-slate-800">待受理</option>
                <option value="processing" className="text-slate-800">处理中</option>
                <option value="resolved" className="text-slate-800">已办结</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/60">
          
          {filteredIssues.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                📸
              </div>
              <div className="text-sm font-semibold text-slate-700">暂无相关随手拍记录</div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                随手拍下您在社区中发现的环境卫生、破损设施等问题，居委会将火速为您跟进！
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenReportModal();
                }}
                className="inline-flex items-center space-x-1 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
              >
                <span>立即提交第一条随手拍</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div 
                key={issue.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-red-100">
                        {issue.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{issue.title}</h4>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700 flex items-center space-x-1">
                        <span>{issue.userAvatar || '👤'}</span>
                        <span>{issue.userName}</span>
                        {issue.userRole === 'party_member' && (
                          <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-bold">
                            🚩党员
                          </span>
                        )}
                      </span>
                      <span>·</span>
                      <span>{issue.createdAt}</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right space-y-1">
                    {getStatusBadge(issue.status)}
                    {issue.status === 'resolved' && (
                      <div className="text-[11px] font-extrabold text-amber-600 flex items-center justify-end space-x-0.5">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>已奖 +{issue.pointsReward || 15} 积分</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {issue.description}
                </p>

                {/* Location */}
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="font-medium text-slate-800">{issue.location}</span>
                  {issue.locationDetail && (
                    <span className="text-slate-400">({issue.locationDetail})</span>
                  )}
                </div>

                {/* Photos Comparison Grid */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Reported Image */}
                    {issue.images && issue.images[0] && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 flex items-center space-x-1">
                          <span>📷</span>
                          <span>整改前现场照片</span>
                        </div>
                        <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                          <img src={issue.images[0]} alt="现场上报" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}

                    {/* Rectification Reply Image */}
                    {issue.replyImage ? (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>整改后实景反馈</span>
                        </div>
                        <div className="aspect-video rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50">
                          <img src={issue.replyImage} alt="整改完成" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    ) : (
                      issue.images && issue.images[1] && (
                        <div className="space-y-1">
                          <div className="text-[11px] font-bold text-slate-500">现场照片 (附图)</div>
                          <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                            <img src={issue.images[1]} alt="现场副图" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Admin Reply & Handling Progress */}
                {issue.adminReply && (
                  <div className="bg-emerald-50/80 rounded-xl p-3 border border-emerald-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-emerald-800 font-bold">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>网格中心/居委会处置反馈：</span>
                      </div>
                      {issue.resolvedAt && (
                        <span className="text-[10px] text-emerald-600 font-normal">办结于 {issue.resolvedAt}</span>
                      )}
                    </div>
                    <p className="text-slate-700 leading-relaxed pl-4">
                      {issue.adminReply}
                    </p>
                  </div>
                )}

              </div>
            ))
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>发现身边的社区问题？拍照上报，办结即奖 15 积分！</span>
          <button
            onClick={() => {
              onClose();
              onOpenReportModal();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            马上随手拍
          </button>
        </div>

      </div>
    </div>
  );
};
