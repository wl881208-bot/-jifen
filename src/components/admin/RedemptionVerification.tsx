import React, { useState } from 'react';
import { Redemption, User } from '../../types';
import confetti from 'canvas-confetti';
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Sparkles, 
  Camera, 
  RefreshCw, 
  Gift as GiftIcon, 
  User as UserIcon,
  ShieldCheck,
  Check,
  Download
} from 'lucide-react';

interface RedemptionVerificationProps {
  redemptions: Redemption[];
  currentUser: User;
  onVerifyCode: (code: string, verifierName: string) => Promise<{ success: boolean; message: string; redemption?: Redemption }>;
}

export const RedemptionVerification: React.FC<RedemptionVerificationProps> = ({
  redemptions,
  currentUser,
  onVerifyCode,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [isSimulatingCamera, setIsSimulatingCamera] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    redemption?: Redemption;
  } | null>(null);

  const [tableFilter, setTableFilter] = useState<'all' | 'pending' | 'redeemed'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Pending redemptions list for quick testing scan
  const pendingRedemptions = redemptions.filter(r => r.status === 'pending');

  const handleExportRedemptionsCSV = () => {
    const headers = ['核销单号', '8位核销码', '居民姓名', '联系电话', '兑换礼品名称', '消耗积分', '核销状态', '核销人员', '兑换时间', '核销时间'];
    const rows = redemptions.map(r => [
      r.id,
      r.code,
      r.userName,
      r.userPhone || '未填写',
      `"${r.giftName.replace(/"/g, '""')}"`,
      r.pointsCost,
      r.status === 'redeemed' ? '已核销领奖' : r.status === 'expired' ? '已过期' : '待核销领奖',
      r.verifierName || '无',
      r.createdAt,
      r.redeemedAt || '未核销'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `社区礼品核销记录表_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify || inputCode).trim();
    if (!code) return;

    setIsVerifying(true);
    setVerificationResult(null);

    const res = await onVerifyCode(code, currentUser.name);
    setIsVerifying(false);
    setVerificationResult(res);

    if (res.success) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 }
      });
    }
  };

  const handleSimulateScanCode = (code: string) => {
    setInputCode(code);
    setIsSimulatingCamera(false);
    handleVerify(code);
  };

  const filteredTableRedemptions = redemptions.filter(r => {
    const matchesFilter = tableFilter === 'all' || r.status === tableFilter;
    const matchesSearch = r.code.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          r.userName.includes(searchFilter) || 
                          r.giftName.includes(searchFilter);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-amber-400 font-bold">
              <QrCode className="w-4 h-4 shrink-0" />
              <span>现场领奖核销中心</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">扫码或输入兑换码领奖</h2>
            <p className="text-[11px] sm:text-xs text-slate-400">核验居民出示的核销码，确认发放礼品并更新核销状态</p>
          </div>

          <button
            onClick={() => setIsSimulatingCamera(!isSimulatingCamera)}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs px-3.5 py-2 sm:py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 shadow-md shrink-0 whitespace-nowrap self-start sm:self-auto"
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>{isSimulatingCamera ? '关闭摄像头扫码' : '开启摄像头扫码'}</span>
          </button>
        </div>

        {/* Camera Simulation View */}
        {isSimulatingCamera && (
          <div className="bg-slate-950 rounded-2xl p-3 sm:p-4 border border-slate-800 space-y-3 animate-fade-in text-center">
            <div className="relative w-full max-w-xs mx-auto h-40 sm:h-48 bg-slate-900 rounded-xl border-2 border-dashed border-amber-400/60 flex flex-col items-center justify-center p-4 space-y-2 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-amber-400 animate-pulse shadow-glow" />
              <Camera className="w-8 h-8 text-amber-400/80 animate-bounce" />
              <p className="text-[11px] text-amber-200 font-medium">请将居民手机上的核销二维码对准镜头</p>
              <div className="text-[10px] text-slate-500">模拟扫码中...（或从下方快速选码体验）</div>
            </div>

            {/* Quick click to test scan */}
            <div className="space-y-1.5 pt-1">
              <div className="text-xs text-slate-300 font-semibold">演示模拟：一键选择待核销的测试兑换码</div>
              {pendingRedemptions.length === 0 ? (
                <div className="text-xs text-slate-500">当前没有待核销的兑换码，居民兑换礼品后将出现在此</div>
              ) : (
                <div className="flex flex-wrap justify-center gap-2">
                  {pendingRedemptions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSimulateScanCode(r.code)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs px-3 py-1.5 rounded-xl font-mono font-bold flex items-center space-x-1 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{r.code} ({r.userName})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Code Input Bar */}
        <div className="flex items-center space-x-2 bg-slate-800/90 p-1.5 sm:p-2 rounded-2xl border border-slate-700">
          <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 ml-1.5 shrink-0" />
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            placeholder="输入 8 位核销码"
            className="flex-1 bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm font-mono font-bold focus:outline-none px-1 uppercase min-w-0"
          />
          <button
            onClick={() => handleVerify()}
            disabled={!inputCode.trim() || isVerifying}
            className="bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white font-bold text-xs px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center space-x-1 whitespace-nowrap"
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{isVerifying ? '核验中...' : '立即核销'}</span>
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div className={`p-6 rounded-3xl border shadow-xl animate-scale-up space-y-3 ${
          verificationResult.success 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
            : 'bg-red-50 border-red-300 text-red-950'
        }`}>
          <div className="flex items-start space-x-3">
            {verificationResult.success ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h3 className="font-extrabold text-base sm:text-lg">
                {verificationResult.success ? '核销成功！礼品可准予发放' : '核验提示 / 错误'}
              </h3>
              <p className="text-xs font-medium leading-relaxed">
                {verificationResult.message}
              </p>
            </div>
          </div>

          {/* Details of matched redemption */}
          {verificationResult.redemption && (
            <div className="bg-white/80 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-slate-500">兑换人员：</span><span className="font-bold">{verificationResult.redemption.userName}</span></div>
                <div><span className="text-slate-500">联系电话：</span><span className="font-mono font-semibold">{verificationResult.redemption.userPhone}</span></div>
                <div><span className="text-slate-500">兑换礼品：</span><span className="font-bold text-red-600">{verificationResult.redemption.giftName}</span></div>
                <div><span className="text-slate-500">扣除积分：</span><span className="font-bold">{verificationResult.redemption.pointsCost} 分</span></div>
                <div><span className="text-slate-500">兑换时间：</span><span>{verificationResult.redemption.createdAt}</span></div>
                <div><span className="text-slate-500">核销号：</span><span className="font-mono font-bold">{verificationResult.redemption.code}</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Redemptions Log Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-3.5 sm:p-5 space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <GiftIcon className="w-5 h-5 text-red-600 shrink-0" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">礼品核销记录汇总</h3>
            </div>

            <button
              onClick={handleExportRedemptionsCSV}
              className="sm:hidden px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl text-[11px] flex items-center space-x-1 border border-red-200 transition-colors shrink-0"
              title="导出礼品核销记录表 CSV"
            >
              <Download className="w-3 h-3 shrink-0" />
              <span>导出</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 justify-between sm:justify-end">
            <button
              onClick={handleExportRedemptionsCSV}
              className="hidden sm:flex px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl text-xs items-center space-x-1 border border-red-200 transition-colors shadow-2xs shrink-0"
              title="导出礼品核销记录表 CSV"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>导出核销表</span>
            </button>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => setTableFilter('all')}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1 font-semibold rounded-lg text-center transition-colors text-[11px] sm:text-xs ${
                  tableFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setTableFilter('pending')}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1 font-semibold rounded-lg text-center transition-colors text-[11px] sm:text-xs ${
                  tableFilter === 'pending' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-500'
                }`}
              >
                待现场核销
              </button>
              <button
                onClick={() => setTableFilter('redeemed')}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1 font-semibold rounded-lg text-center transition-colors text-[11px] sm:text-xs ${
                  tableFilter === 'redeemed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                }`}
              >
                已核销领奖
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 shrink-0" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="输入兑换码、居民姓名或礼品名搜索..."
            className="w-full border border-slate-200 rounded-xl pl-8 sm:pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* List */}
        <div className="space-y-2.5 sm:space-y-0 sm:divide-y sm:divide-slate-100">
          {filteredTableRedemptions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">未找到匹配的核销纪录</div>
          ) : (
            filteredTableRedemptions.map((red) => (
              <div key={red.id} className="p-2.5 sm:p-0 sm:py-3 bg-slate-50/80 sm:bg-transparent rounded-2xl sm:rounded-none border sm:border-0 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-start sm:items-center space-x-2.5 min-w-0">
                  <img src={red.giftImage} alt={red.giftName} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200/60" />
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-[140px] sm:max-w-none">{red.giftName}</span>
                      <span className="font-mono text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md font-bold text-[10px] sm:text-[11px] shrink-0">
                        {red.code}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 leading-tight">
                      兑换居民: <span className="font-semibold text-slate-800">{red.userName}</span> ({red.userPhone}) · <span className="font-bold text-red-600">{red.pointsCost}积分</span>
                    </div>
                    <div className="text-[10px] text-slate-400">兑换时间: {red.createdAt}</div>
                  </div>
                </div>

                <div className="flex items-center justify-end shrink-0 pt-1 sm:pt-0 border-t sm:border-0 border-slate-200/60">
                  {red.status === 'pending' ? (
                    <button
                      onClick={() => handleVerify(red.code)}
                      disabled={isVerifying}
                      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-xl transition-colors shadow-xs text-[11px] sm:text-xs text-center"
                    >
                      点击一键核销
                    </button>
                  ) : (
                    <div className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl text-[11px] sm:text-xs">
                      已核销 ({red.verifierName || '管理员'})
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
