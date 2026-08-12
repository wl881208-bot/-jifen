import React, { useState } from 'react';
import { ServiceRecord } from '../../types';
import { 
  ClipboardCheck, 
  Check, 
  X, 
  Clock, 
  Award, 
  User, 
  FileText, 
  ShieldAlert, 
  CheckCircle2,
  Download
} from 'lucide-react';

interface AuditHoursProps {
  serviceRecords: ServiceRecord[];
  onAuditRecord: (record: ServiceRecord, approved: boolean, rejectReason?: string) => Promise<void>;
}

export const AuditHours: React.FC<AuditHoursProps> = ({
  serviceRecords,
  onAuditRecord,
}) => {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [rejectModalRecord, setRejectModalRecord] = useState<ServiceRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);

  const filteredRecords = serviceRecords.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleExportCSV = () => {
    const headers = ['记录编号', '志愿者姓名', '联系电话', '志愿活动名称', '服务工时', '发放积分', '申报服务说明', '审核状态', '提交时间'];
    const rows = serviceRecords.map(r => [
      r.id,
      r.userName,
      r.userPhone || '未填写',
      `"${r.activityTitle.replace(/"/g, '""')}"`,
      r.hours,
      r.pointsEarned,
      `"${r.proofText.replace(/"/g, '""')}"`,
      r.status === 'approved' ? '已通过' : r.status === 'rejected' ? '已驳回' : '待审核',
      r.createdAt
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `社区志愿服务工时导出表_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmApprove = async (rec: ServiceRecord) => {
    setIsAuditing(true);
    await onAuditRecord(rec, true);
    setIsAuditing(false);
  };

  const handleConfirmReject = async () => {
    if (!rejectModalRecord) return;
    setIsAuditing(true);
    await onAuditRecord(rejectModalRecord, false, rejectReason || '打卡证明材料不齐全');
    setIsAuditing(false);
    setRejectModalRecord(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-5 pb-20 md:pb-10">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>志愿服务工时与积分审核</span>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">v2.0 优化版</span>
          </h2>
          <p className="text-xs text-slate-500">审核居民打卡报告，通过后自动打入居民账户积分与服务工时</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl text-xs flex items-center space-x-1 border border-emerald-200 transition-colors shadow-2xs"
            title="导出为 CSV 表格"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出工时报表</span>
          </button>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
                filter === 'pending' ? 'bg-amber-400 text-slate-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              待审核
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
                filter === 'approved' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              已通过
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部
            </button>
          </div>
        </div>
      </div>

      {/* Audit Queue */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-200">
            暂无需要处理的打卡记录
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{rec.userName}</span>
                    <span className="text-xs text-slate-400">({rec.userPhone || '居民'})</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700">{rec.activityTitle}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-red-600">+{rec.pointsEarned} 积分</div>
                  <div className="text-[11px] text-emerald-700 font-semibold">{rec.hours} 小时工时</div>
                </div>
              </div>

              {/* Proof details */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-800 flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>服务打卡说明与成果总结：</span>
                </div>
                <p className="leading-relaxed text-slate-600">{rec.proofText}</p>
                <div className="text-[10px] text-slate-400 pt-1">提交时间: {rec.createdAt}</div>
              </div>

              {/* Status or Audit buttons */}
              <div className="flex items-center justify-between pt-1">
                {rec.status === 'pending' ? (
                  <div className="flex items-center space-x-2 w-full">
                    <button
                      onClick={() => setRejectModalRecord(rec)}
                      disabled={isAuditing}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                      <span>驳回不通过</span>
                    </button>
                    <button
                      onClick={() => handleConfirmApprove(rec)}
                      disabled={isAuditing}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>审核通过发积分</span>
                    </button>
                  </div>
                ) : rec.status === 'approved' ? (
                  <div className="text-xs font-bold text-emerald-600 flex items-center space-x-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>已审核通过，已打入 {rec.pointsEarned} 积分 & {rec.hours}h 工时</span>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-red-600 flex items-center space-x-1 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                    <ShieldAlert className="w-4 h-4" />
                    <span>已驳回 ({rec.rejectReason || '信息不符'})</span>
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* REJECT MODAL */}
      {rejectModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base">驳回此工时打卡申请</h3>
            <p className="text-xs text-slate-500">申请人: {rejectModalRecord.userName} ({rejectModalRecord.activityTitle})</p>

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">驳回原因解释：</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请输入驳回原因，例如：打卡内容过于简单 / 现场未见签到材料..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setRejectModalRecord(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs"
              >
                取消
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
