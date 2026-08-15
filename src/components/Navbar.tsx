import React, { useState } from 'react';
import { User } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  HeartHandshake, 
  UserCheck, 
  ShieldCheck, 
  RotateCcw, 
  ChevronDown, 
  Award,
  Sparkles,
  QrCode,
  X,
  Copy,
  ExternalLink,
  Smartphone,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  users: User[];
  currentRole: 'resident' | 'admin';
  onRoleSwitch: (role: 'resident' | 'admin') => void;
  onUserSelect: (user: User) => void;
  onResetData: () => void;
  isResetting: boolean;
  onOpenLoginModal?: (prompt?: string) => void;
  onLogout?: () => void;
  isMobileSimulated?: boolean;
  onToggleMobileSimulator?: () => void;
  showDebugTools?: boolean;
  onToggleDebugTools?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users,
  currentRole,
  onRoleSwitch,
  onUserSelect,
  onResetData,
  isResetting,
  onOpenLoginModal,
  onLogout,
  isMobileSimulated = false,
  onToggleMobileSimulator,
  showDebugTools = false,
  onToggleDebugTools,
}) => {
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Preferred public preview link
  const appPreviewUrl = 'https://ais-pre-osvnr3skurb2bwxoglvyra-202559658155.us-east1.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appPreviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-red-600 text-white shadow-md select-none">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo / Brand Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className="bg-white/10 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm border border-white/20">
              <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight truncate max-w-[140px] xs:max-w-none">幸福社区志愿服务</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
                  积分与礼品核销系统
                </span>
              </div>
              <p className="text-xs text-red-100 hidden md:block">爱心汇聚能量 · 积分兑换幸福</p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            
            {/* Current Active User Info / Dropdown OR Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-1.5 bg-red-700/90 hover:bg-red-700 px-2 sm:px-2.5 py-1.5 rounded-lg border border-red-500/50 text-xs text-white transition-colors cursor-pointer"
                  title="点击管理/切换当前账号或退出"
                >
                  <span className="text-base">{currentUser.avatar}</span>
                  <span className="font-semibold max-w-[70px] sm:max-w-none truncate">{currentUser.name}</span>
                  {currentUser.role === 'party_member' && (
                    <span className="bg-amber-300 text-red-900 font-extrabold px-1.5 py-0.5 rounded text-[10px] hidden xs:inline flex items-center space-x-0.5">
                      <span>🚩</span>
                      <span>{currentUser.points}分</span>
                    </span>
                  )}
                  {currentUser.role === 'resident' && (
                    <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] hidden xs:inline">
                      {currentUser.points}分
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-red-200" />
                </button>

                {showUserDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserDropdown(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 text-slate-800 z-20 text-xs animate-scale-up">
                      
                      {/* Active User Card */}
                      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center space-x-2.5">
                        <span className="text-2xl bg-white p-1 rounded-xl shadow-2xs border border-slate-200">
                          {currentUser.avatar}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 truncate">{currentUser.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {currentUser.phone} · {currentUser.points}分 ({currentUser.role === 'party_member' ? '党员先锋' : '居民志愿者'})
                          </div>
                        </div>
                      </div>

                      <div className="px-3.5 py-1.5 text-slate-400 font-semibold text-[10px]">
                        切换不同居民账号体验：
                      </div>

                      <div className="max-h-48 overflow-y-auto">
                        {users.filter(u => u.role !== 'admin').map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              onUserSelect(u);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-red-50 transition-colors cursor-pointer ${
                              currentUser.id === u.id ? 'bg-red-50/80 font-bold text-red-700' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate pr-1">
                              <span className="text-base">{u.avatar}</span>
                              <div className="truncate">
                                <div className="font-medium text-slate-800 truncate">{u.name}</div>
                                <div className="text-[10px] text-slate-400">
                                  {u.points}积分 · {u.totalHours}工时
                                </div>
                              </div>
                            </div>
                            {u.role === 'party_member' ? (
                              <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">
                                党员 🚩
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                                居民
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Logout Action */}
                      <div className="pt-1.5 mt-1.5 border-t border-slate-100 px-2">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            if (onLogout) onLogout();
                          }}
                          className="w-full py-2 px-3 text-red-600 hover:bg-red-50 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>退出登录</span>
                        </button>
                      </div>

                    </div>
                  </>
                )}
              </div>
            ) : (
              /* When not logged in: Show Login Button */
              <button
                onClick={() => onOpenLoginModal?.('微信一键授权即可同步个人志愿工时与爱心积分')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1 shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden xs:inline">微信登录</span>
                <span className="xs:hidden">登录</span>
              </button>
            )}

            {/* Mobile Simulator Toggle Button (Debug mode only) */}
            {showDebugTools && onToggleMobileSimulator && (
              <button
                onClick={onToggleMobileSimulator}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 shadow-xs border ${
                  isMobileSimulated
                    ? 'bg-emerald-400 text-slate-950 border-emerald-300'
                    : 'bg-red-700/80 hover:bg-red-700 text-white border-red-500/50'
                }`}
                title={isMobileSimulated ? '切换回标准响应式视图' : '开启iPhone手机模拟外壳视图'}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isMobileSimulated ? '📱 手机框开启中' : '📱 模拟手机模式'}</span>
              </button>
            )}

            {/* Phone QR Code Scan Button */}
            <button
              onClick={() => setShowQrModal(true)}
              className="px-2 py-1 sm:px-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-lg transition-all flex items-center space-x-1 text-xs shadow-xs active:scale-95 shrink-0"
              title="微信扫码手机体验"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-900 shrink-0" />
              <span className="hidden sm:inline">手机扫码体验</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={onResetData}
              disabled={isResetting}
              className="p-1.5 bg-red-700/70 hover:bg-red-700 rounded-lg text-white text-xs transition-colors shrink-0 disabled:opacity-50"
              title="重置测试演示数据"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            </button>

          </div>

        </div>
      </div>

      {/* QR Code Modal for Phone WeChat Scan */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-800 text-center space-y-4 shadow-2xl animate-scale-up border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📱</span>
                <h3 className="font-bold text-slate-900 text-base">微信扫码手机体验</h3>
              </div>
              <button 
                onClick={() => setShowQrModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              请使用手机微信或浏览器「扫一扫」下方二维码，即刻在手机端体验社区志愿服务、活动打卡与积分兑换。
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-2">
              <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-100">
                <QRCodeSVG
                  value={appPreviewUrl}
                  size={190}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">支持微信扫码直接打开体验</span>
            </div>

            {/* Public Link Copy */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 bg-slate-100 p-2 rounded-xl text-xs">
                <input
                  type="text"
                  readOnly
                  value={appPreviewUrl}
                  className="bg-transparent text-slate-600 font-mono text-[11px] flex-1 outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1 shrink-0 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? '已复制' : '复制'}</span>
                </button>
              </div>

              <a
                href={appPreviewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 font-semibold pt-1"
              >
                <span>在新窗口中以独立页面打开</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
