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
  Smartphone
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  users: User[];
  currentRole: 'resident' | 'admin';
  onRoleSwitch: (role: 'resident' | 'admin') => void;
  onUserSelect: (user: User) => void;
  onResetData: () => void;
  isResetting: boolean;
  isMobileSimulated?: boolean;
  onToggleMobileSimulator?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users,
  currentRole,
  onRoleSwitch,
  onUserSelect,
  onResetData,
  isResetting,
  isMobileSimulated = false,
  onToggleMobileSimulator,
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
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            
            {/* Mode Switcher (Resident vs Admin) */}
            <div className="bg-red-700/80 p-0.5 sm:p-1 rounded-lg border border-red-500/40 flex items-center">
              <button
                onClick={() => onRoleSwitch('resident')}
                className={`px-2 py-1 text-[11px] sm:text-xs font-medium rounded-md transition-all flex items-center space-x-1 ${
                  currentRole === 'resident'
                    ? 'bg-white text-red-700 shadow-sm font-semibold'
                    : 'text-red-100 hover:text-white hover:bg-red-600/50'
                }`}
                title="切换到社区居民端"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">居民端</span>
                <span className="xs:hidden">居民</span>
              </button>
              <button
                onClick={() => onRoleSwitch('admin')}
                className={`px-2 py-1 text-[11px] sm:text-xs font-medium rounded-md transition-all flex items-center space-x-1 ${
                  currentRole === 'admin'
                    ? 'bg-amber-400 text-slate-900 shadow-sm font-semibold'
                    : 'text-red-100 hover:text-white hover:bg-red-600/50'
                }`}
                title="切换到管理员后台"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">后台核销</span>
                <span className="xs:hidden">后台</span>
              </button>
            </div>

            {/* Current Active User Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-1.5 bg-red-700/90 hover:bg-red-700 px-2.5 py-1.5 rounded-lg border border-red-500/50 text-xs text-white transition-colors"
                title="切换测试体验账号"
              >
                <span className="text-base">{currentUser.avatar}</span>
                <span className="font-medium max-w-[80px] sm:max-w-none truncate">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-red-200" />
              </button>

              {showUserDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserDropdown(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 text-slate-800 z-20 text-xs">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-slate-500 font-medium">
                      选择测试体验账号：
                    </div>
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onUserSelect(u);
                          setShowUserDropdown(false);
                          if (u.role === 'admin') onRoleSwitch('admin');
                          else onRoleSwitch('resident');
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-red-50 transition-colors ${
                          currentUser.id === u.id ? 'bg-red-50/80 font-semibold text-red-700' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{u.avatar}</span>
                          <div>
                            <div className="font-medium">{u.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {u.role === 'admin' ? '系统管理员' : `积分: ${u.points} | 工时: ${u.totalHours}h`}
                            </div>
                          </div>
                        </div>
                        {u.role === 'admin' ? (
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                            管理员
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                            居民
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Simulator Toggle Button */}
            {onToggleMobileSimulator && (
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
                <span>{isMobileSimulated ? '📱 手机框开启中' : '📱 模拟手机模式'}</span>
              </button>
            )}

            {/* Phone QR Code Scan Button */}
            <button
              onClick={() => setShowQrModal(true)}
              className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-lg transition-all flex items-center space-x-1 text-xs shadow-xs active:scale-95"
              title="微信扫码手机体验"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-900" />
              <span>📱 手机扫码</span>
            </button>

            {/* Seed / Reset Data Button */}
            <button
              onClick={onResetData}
              disabled={isResetting}
              className="p-1.5 bg-red-700 hover:bg-red-800 border border-red-500/50 rounded-lg text-red-100 hover:text-white transition-all flex items-center space-x-1 text-xs"
              title="一键加载/重置示范数据"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">重置示例数据</span>
            </button>

          </div>

        </div>
      </div>

      {/* QR Code Modal for Phone Preview */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-scale-up text-center relative">
            
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center space-y-1">
              <div className="bg-emerald-100 text-emerald-800 p-2 rounded-2xl mb-1">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">📱 手机微信扫码直达体验</h3>
              <p className="text-xs text-slate-500">使用微信或手机相机扫描下方二维码</p>
            </div>

            {/* QR Code Graphic Box */}
            <div className="bg-slate-50 border-2 border-dashed border-red-200 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2">
              <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-200">
                <QRCodeSVG
                  value={appPreviewUrl}
                  size={190}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold">
                支持微信静默授权登录 / 志愿积分兑换 / 微信 H5 响应式适配
              </p>
            </div>

            {/* Direct Link Action */}
            <div className="space-y-2 pt-1">
              <div className="bg-slate-100 p-2 rounded-xl text-[11px] font-mono text-slate-600 truncate border border-slate-200">
                {appPreviewUrl}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyLink}
                  className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? '已复制链接！' : '复制体验链接'}</span>
                </button>

                <a
                  href={appPreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>新标签页打开</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
