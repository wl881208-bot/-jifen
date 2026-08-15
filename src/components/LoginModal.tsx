import React, { useState } from 'react';
import { User } from '../types';
import { 
  X, 
  Smartphone, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { wechatMockLogin } from '../lib/dataService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  users: User[];
  defaultPrompt?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  users,
  defaultPrompt
}) => {
  const [loginMethod, setLoginMethod] = useState<'wechat' | 'quick_select' | 'phone'>('wechat');
  const [phoneInput, setPhoneInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // WeChat 1-Click Fast Auth
  const handleWechatAuth = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);

    try {
      // If inside real WeChat browser
      const isWechat = typeof navigator !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent);
      if (isWechat) {
        // Trigger real WeChat OAuth flow
        const authUrlRes = await fetch(`/api/wechat/auth-url?redirect_uri=${encodeURIComponent(window.location.href)}`);
        const data = await authUrlRes.json();
        if (data.success && data.authUrl) {
          window.location.href = data.authUrl;
          return;
        }
      }

      // H5 / Browser simulated WeChat login using resident user_1 or first resident
      const defaultResident = users.find(u => u.role === 'resident') || users[0];
      const openid = defaultResident?.openid || `wx_openid_${Date.now().toString(36)}`;
      
      const res = await wechatMockLogin(openid, defaultResident?.name || '微信志愿居民');
      setIsLoggingIn(false);

      if (res.success && res.user) {
        localStorage.setItem('wechat_openid', res.user.openid || openid);
        localStorage.setItem('logged_in_user_id', res.user.id);
        onLoginSuccess(res.user);
        onClose();
      } else {
        // Fallback to default user
        if (defaultResident) {
          localStorage.setItem('logged_in_user_id', defaultResident.id);
          onLoginSuccess(defaultResident);
          onClose();
        }
      }
    } catch (e) {
      console.error('WeChat login error:', e);
      // Fallback
      const defaultResident = users.find(u => u.role === 'resident') || users[0];
      if (defaultResident) {
        onLoginSuccess(defaultResident);
        onClose();
      }
      setIsLoggingIn(false);
    }
  };

  // Quick Select Existing Account
  const handleSelectUser = (user: User) => {
    if (user.openid) localStorage.setItem('wechat_openid', user.openid);
    localStorage.setItem('logged_in_user_id', user.id);
    onLoginSuccess(user);
    onClose();
  };

  // Phone Verification Code Send
  const handleSendCode = () => {
    if (!phoneInput || phoneInput.length !== 11) {
      setErrorMsg('请输入正确的11位手机号码');
      return;
    }
    setErrorMsg(null);
    setVerificationCode('8888');
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Phone Login Submit
  const handlePhoneLogin = () => {
    if (!phoneInput || phoneInput.length !== 11) {
      setErrorMsg('请输入正确的11位手机号码');
      return;
    }
    if (!verificationCode) {
      setErrorMsg('请输入短信验证码');
      return;
    }

    // Match existing user by phone or create
    const matchedUser = users.find(u => u.phone === phoneInput) || users.find(u => u.role === 'resident') || users[0];
    if (matchedUser) {
      localStorage.setItem('logged_in_user_id', matchedUser.id);
      onLoginSuccess(matchedUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 text-white relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg shadow-inner">
              ❤️
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">欢迎登录社区志愿服务平台</h3>
              <p className="text-xs text-red-100 mt-0.5">幸福社区新时代文明实践站</p>
            </div>
          </div>

          {defaultPrompt && (
            <div className="mt-3 bg-white/15 px-3 py-1.5 rounded-xl text-xs text-amber-200 flex items-center space-x-1.5 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-300" />
              <span>{defaultPrompt}</span>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
          <button
            onClick={() => { setLoginMethod('wechat'); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center space-x-1.5 ${
              loginMethod === 'wechat' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600 font-bold' : 'hover:text-slate-800'
            }`}
          >
            <span className="text-base">🟢</span>
            <span>微信授权登录 (推荐)</span>
          </button>
          <button
            onClick={() => { setLoginMethod('quick_select'); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center space-x-1.5 ${
              loginMethod === 'quick_select' ? 'bg-white text-red-600 border-b-2 border-red-600 font-bold' : 'hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>切换体验账号</span>
          </button>
          <button
            onClick={() => { setLoginMethod('phone'); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center space-x-1.5 ${
              loginMethod === 'phone' ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-bold' : 'hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>手机号登录</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: WeChat 1-Click Auth (Default) */}
          {loginMethod === 'wechat' && (
            <div className="text-center space-y-5 py-2">
              <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center border border-emerald-100 shadow-inner">
                <svg className="w-12 h-12 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.5 2C4.36 2 1 4.91 1 8.5c0 1.98 1.02 3.75 2.64 4.96-.13.78-.58 2.21-.66 2.52-.1.39.14.39.3.28.22-.15 2.29-1.56 2.76-1.89.78.23 1.6.36 2.46.36.21 0 .42-.01.63-.03-.23-.62-.36-1.28-.36-1.97 0-3.31 3.13-6 7-6 .12 0 .24.01.36.01C15.02 3.86 12.01 2 8.5 2zm-2.25 4.5c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25S5 8.44 5 7.75 5.56 6.5 6.25 6.5zm4.5 0c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25S9.5 8.44 9.5 7.75 10.06 6.5 10.75 6.5zM15.5 8c-3.59 0-6.5 2.46-6.5 5.5 0 1.74.96 3.29 2.45 4.31-.11.66-.49 1.88-.56 2.14-.08.33.12.33.25.24.19-.13 1.94-1.32 2.34-1.6.66.19 1.36.3 2.08.3 3.59 0 6.5-2.46 6.5-5.5S19.09 8 15.5 8zm-2 3.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
                </svg>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-base">微信授权快捷登录</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  无需繁琐注册，自动同步您的微信昵称、头像，安全存证您的志愿工时与爱心积分。
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 text-left space-y-1.5 text-[11px] text-slate-500 border border-slate-100">
                <div className="flex items-center space-x-2 text-slate-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>授权后可享受的服务：</span>
                </div>
                <div className="pl-5 space-y-0.5">
                  <p>• 报名社区志愿活动与线上签到</p>
                  <p>• 积分商城免费兑换生活好礼</p>
                  <p>• 获得社区志愿服务工时证明与电子勋章</p>
                </div>
              </div>

              <button
                onClick={handleWechatAuth}
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              >
                {isLoggingIn ? (
                  <span>正在微信授权中...</span>
                ) : (
                  <>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M8.5 2C4.36 2 1 4.91 1 8.5c0 1.98 1.02 3.75 2.64 4.96-.13.78-.58 2.21-.66 2.52-.1.39.14.39.3.28.22-.15 2.29-1.56 2.76-1.89.78.23 1.6.36 2.46.36.21 0 .42-.01.63-.03-.23-.62-.36-1.28-.36-1.97 0-3.31 3.13-6 7-6 .12 0 .24.01.36.01C15.02 3.86 12.01 2 8.5 2zm-2.25 4.5c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25S5 8.44 5 7.75 5.56 6.5 6.25 6.5zm4.5 0c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25S9.5 8.44 9.5 7.75 10.06 6.5 10.75 6.5zM15.5 8c-3.59 0-6.5 2.46-6.5 5.5 0 1.74.96 3.29 2.45 4.31-.11.66-.49 1.88-.56 2.14-.08.33.12.33.25.24.19-.13 1.94-1.32 2.34-1.6.66.19 1.36.3 2.08.3 3.59 0 6.5-2.46 6.5-5.5S19.09 8 15.5 8zm-2 3.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
                    </svg>
                    <span>微信一键授权登录</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: Quick Select Existing Test Account */}
          {loginMethod === 'quick_select' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                点击下方居民/党员预设账号快速登录体验：
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {users.filter(u => u.role !== 'admin').map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className="w-full p-3 rounded-2xl border border-slate-200 hover:border-red-300 hover:bg-red-50/50 transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl bg-slate-100 p-1.5 rounded-xl group-hover:scale-110 transition-transform">
                        {u.avatar}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-800">{u.name}</span>
                          {u.role === 'party_member' ? (
                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5">
                              <span>🚩</span>
                              <span>党员志愿者</span>
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {u.badge || '居民志愿者'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {u.role === 'party_member'
                            ? `党支部先锋岗 · 积分: ${u.points}分 | 工时: ${u.totalHours}小时`
                            : `可用积分: ${u.points}分 | 志愿工时: ${u.totalHours}小时`}
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Phone Code Login */}
          {loginMethod === 'phone' && (
            <div className="space-y-3 py-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">手机号码</label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    maxLength={11}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\\D/g, ''))}
                    placeholder="请输入11位手机号码（如 13800000001）"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">短信验证码</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="输入验证码 (演示填8888)"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold rounded-xl text-xs whitespace-nowrap transition-colors"
                  >
                    {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePhoneLogin}
                className="w-full mt-2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-red-600/20"
              >
                验证并登录
              </button>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
          登录即代表您已同意《幸福社区志愿者服务协议》与《个人信息保护声明》
        </div>

      </div>
    </div>
  );
};
