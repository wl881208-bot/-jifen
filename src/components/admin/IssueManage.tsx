import React, { useState } from 'react';
import { CommunityIssue, IssueCategory, IssueStatus, User } from '../../types';
import { 
  Camera, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Search, 
  Filter, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  CheckCircle,
  ExternalLink,
  Phone,
  User as UserIcon,
  X,
  Send,
  Upload
} from 'lucide-react';

interface IssueManageProps {
  issues: CommunityIssue[];
  currentUser: User | null;
  onHandleIssue: (
    id: string, 
    status: IssueStatus, 
    adminReply: string, 
    pointsReward: number, 
    replyImage?: string,
    handledBy?: string
  ) => Promise<{ success: boolean; message?: string }>;
  onDeleteIssue: (id: string) => Promise<{ success: boolean; message?: string }>;
}

const SAMPLE_REPLY_PHOTOS = [
  {
    title: '垃圾分类点清运完成',
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600',
    desc: '已安排保洁清运班组完成垃圾桶清空并彻底冲洗消毒，地面干净无异味。'
  },
  {
    title: '照明灯管维修更换完成',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600',
    desc: '工程部电工师傅已更换全新节能LED灯管，现场照明恢复正常。'
  },
  {
    title: '长椅加固修缮完毕',
    url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=600',
    desc: '维修师傅已对松动螺栓进行重新加固并打磨木质边缘毛刺，确保居民安全使用。'
  }
];

export const IssueManage: React.FC<IssueManageProps> = ({
  issues,
  currentUser,
  onHandleIssue,
  onDeleteIssue,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | IssueStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Selected issue for handling modal
  const [handlingIssue, setHandlingIssue] = useState<CommunityIssue | null>(null);
  const [targetStatus, setTargetStatus] = useState<IssueStatus>('resolved');
  const [adminReply, setAdminReply] = useState('');
  const [replyImage, setReplyImage] = useState('');
  const [pointsReward, setPointsReward] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Stats calculation
  const totalCount = issues.length;
  const pendingCount = issues.filter(i => i.status === 'pending').length;
  const processingCount = issues.filter(i => i.status === 'processing').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const totalPointsAwarded = issues
    .filter(i => i.status === 'resolved')
    .reduce((sum, i) => sum + (i.pointsReward || 15), 0);

  // Filtered issues list
  const filteredIssues = issues.filter(issue => {
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(kw);
      const matchDesc = issue.description.toLowerCase().includes(kw);
      const matchName = issue.userName.toLowerCase().includes(kw);
      const matchLoc = issue.location.toLowerCase().includes(kw);
      if (!matchTitle && !matchDesc && !matchName && !matchLoc) return false;
    }
    return true;
  });

  const openHandleModal = (issue: CommunityIssue) => {
    setHandlingIssue(issue);
    setTargetStatus(issue.status === 'pending' ? 'resolved' : issue.status);
    setAdminReply(issue.adminReply || (
      issue.category === '环境卫生' 
        ? '已安排保洁清运人员对现场进行深度清理消毒，感谢您的细心反馈！' 
        : issue.category === '设施破损' 
        ? '社区工程维修师傅已领用备件并完成修缮更换，已恢复正常使用！' 
        : '网格员已前往现场核实并协调完成整改处置，感谢您对社区治理的支持！'
    ));
    setReplyImage(issue.replyImage || (
      issue.category === '环境卫生' ? SAMPLE_REPLY_PHOTOS[0].url : SAMPLE_REPLY_PHOTOS[1].url
    ));
    setPointsReward(issue.pointsReward || 15);
    setModalError(null);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handlingIssue) return;

    if (!adminReply.trim()) {
      setModalError('请填写网格处置说明或整改答复');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await onHandleIssue(
        handlingIssue.id,
        targetStatus,
        adminReply.trim(),
        pointsReward,
        replyImage.trim() || undefined,
        currentUser?.name || '社区管理员'
      );

      if (res.success) {
        setHandlingIssue(null);
      } else {
        setModalError(res.message || '处理工单失败');
      }
    } catch (err: any) {
      setModalError(err.message || '系统异常');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (issueId: string, title: string) => {
    if (window.confirm(`确认删除随手拍工单【${title}】吗？此操作无法撤销。`)) {
      await onDeleteIssue(issueId);
    }
  };

  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>已办结归档</span>
          </span>
        );
      case 'processing':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>网格跟进中</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold px-2.5 py-1 rounded-full">
            已驳回/无效
          </span>
        );
      default:
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
            <span>待网格受理</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Camera className="w-6 h-6 text-red-600" />
            <span>随手拍民意工单治理中心</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            受理居民上报的环境卫生、设施破损、安全隐患等身边事，答复整改并核发爱心积分。
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-xs text-slate-500 font-medium">总上报诉求</div>
          <div className="text-2xl font-black text-slate-900">{totalCount} <span className="text-xs font-normal text-slate-400">件</span></div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 bg-blue-50/20 shadow-xs space-y-1">
          <div className="text-xs text-blue-700 font-bold flex items-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>待受理派单</span>
          </div>
          <div className="text-2xl font-black text-blue-700">{pendingCount} <span className="text-xs font-normal text-blue-400">件</span></div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs space-y-1">
          <div className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>已整改办结</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">{resolvedCount} <span className="text-xs font-normal text-emerald-400">件</span></div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs space-y-1">
          <div className="text-xs text-amber-800 font-bold flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>已发随手拍积分</span>
          </div>
          <div className="text-2xl font-black text-amber-600">+{totalPointsAwarded} <span className="text-xs font-normal text-amber-500">分</span></div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            placeholder="搜索诉求标题、描述、上报人姓名或地点..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
          >
            <option value="all">全部处理状态</option>
            <option value="pending">待网格受理 ({pendingCount})</option>
            <option value="processing">网格处理中 ({processingCount})</option>
            <option value="resolved">已办结整改 ({resolvedCount})</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
          >
            <option value="all">全部分类</option>
            <option value="环境卫生">环境卫生</option>
            <option value="设施破损">设施破损</option>
            <option value="安全隐患">安全隐患</option>
            <option value="车辆违停">车辆违停</option>
            <option value="楼道堆物">楼道堆物</option>
            <option value="其它诉求">其它诉求</option>
          </select>
        </div>
      </div>

      {/* Issues Table / List */}
      <div className="space-y-3.5">
        {filteredIssues.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
            <div className="text-3xl">📷</div>
            <div className="text-sm font-semibold text-slate-700">没有符合筛选条件的随手拍工单</div>
            <p className="text-xs text-slate-400">居民在 H5 首页提交随手拍后将实时在此处汇聚</p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5 flex-wrap">
                  <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-red-100">
                    {issue.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{issue.title}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  {getStatusBadge(issue.status)}
                  <button
                    onClick={() => openHandleModal(issue)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{issue.status === 'resolved' ? '修改整改记录' : '处置工单 / 办结奖励'}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(issue.id, issue.title)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="删除工单"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Submitter & Location Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                <div className="flex items-center space-x-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">{issue.userName}</span>
                  {issue.userRole === 'party_member' && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      🚩党员
                    </span>
                  )}
                  <span className="text-slate-400">({issue.userPhone})</span>
                </div>

                <div className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate">{issue.location} {issue.locationDetail ? `(${issue.locationDetail})` : ''}</span>
                </div>

                <div className="flex items-center space-x-1 text-slate-400 sm:justify-end">
                  <Clock className="w-3.5 h-3.5" />
                  <span>上报时间：{issue.createdAt}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {issue.description}
              </p>

              {/* Photos Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Before: Reported Photo */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 flex items-center space-x-1">
                    <span>📷</span>
                    <span>居民现场上报照片</span>
                  </div>
                  <div className="aspect-video max-h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img 
                      src={issue.images?.[0] || 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&q=80&w=600'} 
                      alt="现场照片" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>

                {/* After: Rectification Photo */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>网格整改后对比照片</span>
                  </div>
                  {issue.replyImage ? (
                    <div className="aspect-video max-h-48 rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50">
                      <img 
                        src={issue.replyImage} 
                        alt="整改后照片" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ) : (
                    <div className="aspect-video max-h-48 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                      <span>暂未上传整改后照片</span>
                      <button
                        onClick={() => openHandleModal(issue)}
                        className="mt-2 text-xs text-red-600 font-bold hover:underline cursor-pointer"
                      >
                        点击上传处置反馈
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Reply & Points status */}
              {issue.adminReply && (
                <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-emerald-900 font-bold">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>居委会处置答复：</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full font-bold">
                        🎁 已发放 +{issue.pointsReward || 15} 爱心积分
                      </span>
                      {issue.handledBy && (
                        <span className="text-emerald-700 font-normal">经办人: {issue.handledBy}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-700 leading-relaxed pl-4">{issue.adminReply}</p>
                </div>
              )}

            </div>
          ))
        )}
      </div>

      {/* Handling / Resolving Modal */}
      {handlingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div 
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white p-4 sm:p-5 relative">
              <button
                onClick={() => setHandlingIssue(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold">处置随手拍工单 · 办结答复与发奖</h3>
              <p className="text-xs text-red-100 mt-0.5">
                工单号：{handlingIssue.id} · 上报人：{handlingIssue.userName} ({handlingIssue.userPhone})
              </p>
            </div>

            <form onSubmit={handleModalSubmit} className="p-4 sm:p-6 space-y-4 text-slate-800 text-sm max-h-[80vh] overflow-y-auto">
              
              {modalError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  1. 更新工单状态
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetStatus('resolved')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      targetStatus === 'resolved'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-400'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>已办结整改 (发奖)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetStatus('processing')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      targetStatus === 'processing'
                        ? 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-400'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>网格处理中</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetStatus('rejected')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                      targetStatus === 'rejected'
                        ? 'bg-slate-100 border-slate-400 text-slate-700 ring-2 ring-slate-400'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>驳回/非社区管辖</span>
                  </button>
                </div>
              </div>

              {/* Reply explanation */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  2. 处置说明与居民反馈答复 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={adminReply}
                  onChange={e => setAdminReply(e.target.value)}
                  placeholder="填写整改措施（如：已指派保洁消杀、电工已更换灯管...）"
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white resize-none"
                />
              </div>

              {/* Rectification Photo */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  3. 整改后对比实景照片 (URL或选用案例)
                </label>
                <input
                  type="text"
                  value={replyImage}
                  onChange={e => setReplyImage(e.target.value)}
                  placeholder="输入整改后照片URL..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                />

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                  <div className="text-[11px] text-slate-500 font-medium">快速选用整改完成实景图：</div>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_REPLY_PHOTOS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setReplyImage(p.url);
                          setAdminReply(p.desc);
                        }}
                        className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors cursor-pointer"
                      >
                        {p.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reward Points */}
              {targetStatus === 'resolved' && (
                <div className="space-y-1 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-950 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>4. 发放爱心积分奖励 (分)</span>
                    </label>
                    <span className="text-xs font-extrabold text-red-600">+{pointsReward} 积分</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={pointsReward}
                    onChange={e => setPointsReward(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-900"
                  />
                  <p className="text-[10px] text-amber-700 mt-1">
                    办结后系统将自动向居民【{handlingIssue.userName}】账户注入该积分并记录流水日志。
                  </p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setHandlingIssue(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? '保存中...' : '提交处置并更新状态'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
