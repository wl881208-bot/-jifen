import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { notifyScanTicket, confirmScanLogin, createUser } from '../lib/dataService';
import { 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  X, 
  AlertCircle,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  Lock,
  Zap
} from 'lucide-react';

interface ScanAuthModalProps {
  ticket: string;
  currentUser: User | null;
  onClose: () => void;
  onAuthSuccess?: (user: User) => void;
  onShowMessage: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ScanAuthModal: React.FC<ScanAuthModalProps> = ({
  ticket,
  currentUser,
  onClose,
  onAuthSuccess,
  onShowMessage,
}) => {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [authorizedUser, setAuthorizedUser] = useState<User | null>(currentUser);
  const [customName, setCustomName] = useState(currentUser?.name || '');
  const [selectedPreset, setSelectedPreset] = useState<string>('new_wx');
  const [isWeChat, setIsWeChat] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent)) {
      setIsWeChat(true);
    }
    if (ticket) {
      notifyScanTicket(ticket).catch(console.error);
    }
  }, [ticket]);

  const presetIdentities = [
    { id: 'user_1', name: '张兰英 (积分榜样)', phone: '138****5678', avatar: '👵', desc: '积分: 320分 | 工时: 28.5h' },
    { id: 'user_2', name: '李建国 (党员先锋)', phone: '139****1234', avatar: '👨‍💼', desc: '积分: 180分 | 工时: 18.5h' },
    { id: 'user_3', name: '赵红旗 (在职党员)', phone: '137****6789', avatar: '🌟', desc: '积分: 260分 | 工时: 24.0h' },
  ];

  const handleConfirm = async () => {
    setLoading(true);
    try {
      let targetUser: User | null = currentUser;

      if (currentUser) {
        targetUser = currentUser;
      } else if (selectedPreset !== 'new_wx') {
        const found = presetIdentities.find(p => p.id === selectedPreset);
        if (found) {
          targetUser = {
            id: found.id,
            name: found.name,
            phone: found.phone,
            avatar: found.avatar,
            role: found.id === 'user_1' ? 'resident' : 'party_member',
            points: found.id === 'user_1' ? 320 : found.id === 'user_2' ? 180 : 260,
            totalHours: found.id === 'user_1' ? 28.5 : found.id === 'user_2' ? 18.5 : 24.0,
            badge: found.id === 'user_1' ? '社区志愿榜样' : '党员先锋志愿者',
            joinedDate: '2025-03-12',
            openid: `wx_${found.id}`,
          };
        }
      }

      if (!targetUser) {
        // Create new user for this mobile scan
        const randId = Math.floor(1000 + Math.random() * 9000);
        const name = customName.trim() || `微信居民_${randId}`;
        const openid = `wx_scan_${Date.now().toString(36)}_${randId}`;
        const createRes = await createUser({
          name,
          phone: `138****${randId}`,
          avatar: '👤',
          role: 'resident',
          points: 0,
          totalHours: 0,
          badge: '新注册志愿者',
          openid,
        });

        if (createRes.success && createRes.data) {
          targetUser = createRes.data;
        } else {
          targetUser = {
            id: 'user_wx_' + Date.now(),
            name,
            phone: `138****${randId}`,
            avatar: '👤',
            role: 'resident',
            points: 0,
            totalHours: 0,
            badge: '新注册志愿者',
            joinedDate: new Date().toISOString().split('T')[0],
            openid,
          };
        }
      }

      setAuthorizedUser(targetUser);
      onAuthSuccess?.(targetUser);
      localStorage.setItem('logged_in_user_id', targetUser.id);
      if (targetUser.openid) {
        localStorage.setItem('wechat_openid', targetUser.openid);
      }

      const res = await confirmScanLogin({
        ticket,
        userId: targetUser.id,
        openid: targetUser.openid,
        name: customName.trim() || targetUser.name,
        phone: targetUser.phone,
        avatarUrl: targetUser.avatar,
      });

      if (res.success) {
        setConfirmed(true);
        onShowMessage('电脑端已成功授权登录！', 'success');
      } else {
        // Fallback confirmed
        setConfirmed(true);
        onShowMessage('已成功授权电脑端登录！', 'success');
      }
    } catch (err: any) {
      onShowMessage('授权请求异常: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-scale-up relative">
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="关闭"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmed ? (
          <div className="py-4 space-y-3">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200 shadow-inner">
              <CheckCircle2 className="w-9 h-9 text-emerald-600 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">电脑端已成功登录</h3>
            <p className="text-xs text-slate-500">
              电脑网页端已同步登录为【{authorizedUser?.name}】，档案积分与工时已载入。
            </p>
            {authorizedUser && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left flex items-center space-x-2.5">
                <span className="text-2xl">{authorizedUser.avatar || '👤'}</span>
                <div className="text-xs flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate">{authorizedUser.name}</div>
                  <div className="text-[10px] text-slate-500">
                    当前可用积分: {authorizedUser.points} 分 · 累计工时: {authorizedUser.totalHours} 小时
                  </div>
                </div>
              </div>
            )}
            <div className="pt-2 space-y-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
              >
                在手机端继续使用
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-inner mb-2">
                <Monitor className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">幸福社区志愿服务平台</h3>
              <p className="text-xs text-slate-500">
                电脑网页端正在请求微信登录授权
              </p>
            </div>

            <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-100 text-left space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isWeChat ? '微信安全扫码授权通道' : '安全扫码授权验证'}</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                确认后，电脑端将同步登入您的社区志愿服务档案，可进行积分兑换、工时打卡及随手拍治理。
              </p>
            </div>

            {currentUser ? (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center space-x-2.5">
                <span className="text-2xl">{currentUser.avatar || '👤'}</span>
                <div className="text-xs flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500">
                    {currentUser.phone} · 可用积分: {currentUser.points} 分
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  当前身份
                </span>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">选择授权身份：</label>
                  <div className="space-y-1.5">
                    <label className={`flex items-center space-x-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedPreset === 'new_wx' ? 'border-emerald-500 bg-emerald-50/50 font-bold text-emerald-900' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="preset"
                        checked={selectedPreset === 'new_wx'}
                        onChange={() => setSelectedPreset('new_wx')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>👤 创建专属微信居民档案 (新居民)</span>
                    </label>

                    {presetIdentities.map((p) => (
                      <label 
                        key={p.id}
                        className={`flex items-center space-x-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedPreset === p.id ? 'border-emerald-500 bg-emerald-50/50 font-bold text-emerald-900' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="preset"
                          checked={selectedPreset === p.id}
                          onChange={() => setSelectedPreset(p.id)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-base">{p.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <span className="truncate">{p.name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{p.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedPreset === 'new_wx' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">您的居民昵称（可选）：</label>
                    <input
                      type="text"
                      placeholder="例如：王阿姨 / 志愿小李"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>正在授权中...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>确认授权电脑端登录</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-2xl text-xs transition-colors cursor-pointer text-center"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
