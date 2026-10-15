import React, { useState, useEffect, useRef } from 'react';
import { User, SystemEnvMode } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Smartphone, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  QrCode,
  RefreshCw,
  Zap,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { 
  createUser, 
  createScanTicket, 
  listenScanTicket, 
  checkScanStatus, 
  mockConfirmScanLogin,
  wechatMockLogin,
  wechatDirectAuth
} from '../lib/dataService';
import { getPublicAppUrl } from '../lib/appConfig';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  users: User[];
  defaultPrompt?: string;
  currentEnvMode?: SystemEnvMode;
  onOpenEnvSwitchModal?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  users,
  defaultPrompt,
  currentEnvMode = 'production',
  onOpenEnvSwitchModal,
}) => {
  const [loginMethod, setLoginMethod] = useState<'wechat_direct' | 'phone' | 'quick_select' | 'wechat_scan'>('wechat_direct');
  
  // WeChat Scan State (optional secondary tab)
  const [scanTicket, setScanTicket] = useState<string | null>(null);
  const [scanQrUrl, setScanQrUrl] = useState<string>('');
  const [scanStatus, setScanStatus] = useState<'loading' | 'pending' | 'scanned' | 'confirmed' | 'expired'>('loading');
  const [isGeneratingTicket, setIsGeneratingTicket] = useState(false);
  const [isMockingScan, setIsMockingScan] = useState(false);

  // Custom QR Host Configuration
  const [showHostConfig, setShowHostConfig] = useState(false);
  const [customHost, setCustomHost] = useState('');

  // Direct Mobile / Phone State
  const [customNameInput, setCustomNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or Refresh QR Code Ticket (only if on wechat_scan tab)
  const initScanTicket = async () => {
    setIsGeneratingTicket(true);
    setScanStatus('loading');
    setErrorMsg(null);
    try {
      const res = await createScanTicket();
      if (res.success && res.ticket) {
        setScanTicket(res.ticket);
        const baseUrl = customHost.trim() || getPublicAppUrl();
        const qr = `${baseUrl.replace(/\/$/, '')}/?scan_ticket=${res.ticket}`;
        setScanQrUrl(qr);
        setScanStatus('pending');
      } else {
        const fallbackTicket = `scan_local_${Date.now()}`;
        setScanTicket(fallbackTicket);
        const baseUrl = customHost.trim() || getPublicAppUrl();
        setScanQrUrl(`${baseUrl.replace(/\/$/, '')}/?scan_ticket=${fallbackTicket}`);
        setScanStatus('pending');
      }
    } catch (e: any) {
      const fallbackTicket = `scan_local_${Date.now()}`;
      setScanTicket(fallbackTicket);
      const baseUrl = customHost.trim() || getPublicAppUrl();
      setScanQrUrl(`${baseUrl.replace(/\/$/, '')}/?scan_ticket=${fallbackTicket}`);
      setScanStatus('pending');
    } finally {
      setIsGeneratingTicket(false);
    }
  };

  useEffect(() => {
    if (isOpen && loginMethod === 'wechat_scan') {
      initScanTicket();
    } else {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, loginMethod, customHost]);

  // Real-time Firestore snapshot listener + polling fallback for scan status
  useEffect(() => {
    if (!isOpen || loginMethod !== 'wechat_scan' || !scanTicket || scanStatus === 'confirmed' || scanStatus === 'expired') {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    const unsubscribe = listenScanTicket(scanTicket, (session) => {
      if (session.status === 'scanned') {
        setScanStatus('scanned');
      } else if (session.status === 'confirmed' && session.user) {
        setScanStatus('confirmed');
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        localStorage.setItem('logged_in_user_id', session.user.id);
        if (session.user.openid) localStorage.setItem('wechat_openid', session.user.openid);
        setTimeout(() => {
          onLoginSuccess(session.user!);
          onClose();
        }, 400);
      } else if (session.status === 'expired') {
        setScanStatus('expired');
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      }
    });

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await checkScanStatus(scanTicket);
        if (res.success) {
          if (res.status === 'scanned') {
            setScanStatus('scanned');
          } else if (res.status === 'confirmed' && res.user) {
            setScanStatus('confirmed');
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            localStorage.setItem('logged_in_user_id', res.user.id);
            if (res.user.openid) localStorage.setItem('wechat_openid', res.user.openid);
            setTimeout(() => {
              onLoginSuccess(res.user!);
              onClose();
            }, 400);
          } else if (res.status === 'expired') {
            setScanStatus('expired');
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          }
        }
      } catch (err) {
        console.warn('Poll scan status error:', err);
      }
    }, 1500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isOpen, loginMethod, scanTicket, scanStatus]);

  if (!isOpen) return null;

  // 1. Direct WeChat 1-Click Auth (直接调用微信登录机制，无需扫码页面)
  const handleDirectWechatAuth = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);

    const isWechatBrowser = typeof navigator !== 'undefined' && /micromessenger/i.test(navigator.userAgent);
    if (!isWechatBrowser && currentEnvMode === 'production') {
      setIsLoggingIn(false);
      setLoginMethod('wechat_scan');
      setErrorMsg('检测到您当前未在手机微信内打开。在【真实微信生产模式】下，已为您切换为微信扫码登录，请使用手机微信扫码进行真实身份授权。');
      return;
    }

    try {
      const res = await wechatDirectAuth(customNameInput.trim() || undefined);
      setIsLoggingIn(false);

      if (res.success && res.user) {
        localStorage.setItem('wechat_openid', res.user.openid || `wx_${res.user.id}`);
        localStorage.setItem('logged_in_user_id', res.user.id);
        onLoginSuccess(res.user);
        onClose();
      } else if (res.message && !res.user) {
        // If it redirected to WeChat official OAuth
        setErrorMsg(res.message);
      } else {
        setErrorMsg(res.message || '微信授权处理异常');
      }
    } catch (e: any) {
      console.error('Direct auth error:', e);
      setIsLoggingIn(false);
      setErrorMsg('微信授权失败: ' + e.message);
    }
  };

  // 2. Mock Scan Confirmation
  const handleMockScanConfirm = async () => {
    if (currentEnvMode === 'production') {
      setErrorMsg('当前处于【真实微信生产模式】，已禁用模拟扫码确认。请使用手机微信扫一扫上方二维码进行真实授权。');
      return;
    }
    if (!scanTicket) return;
    setIsMockingScan(true);
    setErrorMsg(null);
    try {
      const res = await mockConfirmScanLogin(scanTicket, customNameInput.trim() || undefined);
      if (res.success && res.user) {
        setScanStatus('confirmed');
        localStorage.setItem('logged_in_user_id', res.user.id);
        if (res.user.openid) localStorage.setItem('wechat_openid', res.user.openid);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 400);
      } else {
        const randId = Math.floor(1000 + Math.random() * 9000);
        const name = customNameInput.trim() || `微信居民_${randId}`;
        const openid = `wx_scan_${Date.now()}`;
        const newU = await createUser({
          name,
          phone: `138****${randId}`,
          avatar: '👤',
          role: 'resident',
          points: 0,
          totalHours: 0,
          badge: '新注册志愿者',
          openid,
        });
        if (newU.data) {
          setScanStatus('confirmed');
          localStorage.setItem('logged_in_user_id', newU.data.id);
          localStorage.setItem('wechat_openid', openid);
          setTimeout(() => {
            onLoginSuccess(newU.data!);
            onClose();
          }, 400);
        }
      }
    } catch (e: any) {
      setErrorMsg('模拟扫码授权异常: ' + e.message);
    } finally {
      setIsMockingScan(false);
    }
  };

  // 3. Phone Verification Code Send
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

  // 4. Phone Login / Registration Submit
  const handlePhoneLogin = async () => {
    if (!phoneInput || phoneInput.length !== 11) {
      setErrorMsg('请输入正确的11位手机号码');
      return;
    }
    if (!verificationCode) {
      setErrorMsg('请输入短信验证码');
      return;
    }

    setIsLoggingIn(true);
    setErrorMsg(null);

    try {
      const isTestPersona = (u: User) => u.id === 'user_1' || u.id === 'user_2' || u.id === 'user_3' || Boolean(u.openid?.startsWith('mock_'));
      const matchedUser = users.find(u => 
        (u.phone === phoneInput || u.phone === `${phoneInput.slice(0, 3)}****${phoneInput.slice(-4)}`) &&
        (currentEnvMode === 'test' || !isTestPersona(u))
      );
      
      if (matchedUser) {
        localStorage.setItem('logged_in_user_id', matchedUser.id);
        if (matchedUser.openid) localStorage.setItem('wechat_openid', matchedUser.openid);
        onLoginSuccess(matchedUser);
        onClose();
        setIsLoggingIn(false);
        return;
      }

      const newUserId = 'user_phone_' + Date.now();
      const phoneTail = phoneInput.slice(-4);
      const newPhoneUser: User = {
        id: newUserId,
        name: customNameInput.trim() || `居民_${phoneTail}`,
        phone: phoneInput,
        avatar: '👤',
        role: 'resident',
        points: 0,
        totalHours: 0,
        badge: '社区新居民',
        joinedDate: new Date().toISOString().split('T')[0],
        openid: `wx_phone_${newUserId}`,
      };

      const createRes = await createUser(newPhoneUser);
      setIsLoggingIn(false);

      if (createRes.success && createRes.data) {
        localStorage.setItem('logged_in_user_id', createRes.data.id);
        if (createRes.data.openid) localStorage.setItem('wechat_openid', createRes.data.openid);
        onLoginSuccess(createRes.data);
        onClose();
      } else {
        localStorage.setItem('logged_in_user_id', newPhoneUser.id);
        onLoginSuccess(newPhoneUser);
        onClose();
      }
    } catch (e: any) {
      console.error('Phone login error:', e);
      setIsLoggingIn(false);
      setErrorMsg('登录失败: ' + e.message);
    }
  };

  // 5. Quick Select Test/Demo Accounts
  const handleSelectUser = (user: User) => {
    if (user.openid) localStorage.setItem('wechat_openid', user.openid);
    localStorage.setItem('logged_in_user_id', user.id);
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 text-white relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
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
            <div className="mt-2.5 bg-white/15 px-3 py-1.5 rounded-xl text-xs text-amber-200 flex items-center space-x-1.5 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-300" />
              <span>{defaultPrompt}</span>
            </div>
          )}

          {/* Environment Status Badge */}
          <div className="mt-2.5 flex items-center justify-between bg-black/25 px-3 py-1.5 rounded-xl text-xs border border-white/10">
            <div className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${currentEnvMode === 'production' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-semibold text-white">
                {currentEnvMode === 'production' ? '当前：🟢 真实微信生产模式' : '当前：🟡 模拟测试演练模式'}
              </span>
            </div>
            {onOpenEnvSwitchModal && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenEnvSwitchModal(); }}
                className="text-amber-200 hover:text-white underline text-[11px] font-semibold cursor-pointer"
              >
                切换环境
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500 overflow-x-auto">
          <button
            onClick={() => { setLoginMethod('wechat_direct'); setErrorMsg(null); }}
            className={`flex-1 py-3 px-2 text-center transition-colors flex items-center justify-center space-x-1 cursor-pointer whitespace-nowrap ${
              loginMethod === 'wechat_direct' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600 font-bold' : 'hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>{currentEnvMode === 'production' ? '微信官方授权' : '模拟微信直登'}</span>
          </button>

          <button
            onClick={() => { setLoginMethod('wechat_scan'); setErrorMsg(null); }}
            className={`flex-1 py-3 px-2 text-center transition-colors flex items-center justify-center space-x-1 cursor-pointer whitespace-nowrap ${
              loginMethod === 'wechat_scan' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600 font-bold' : 'hover:text-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span>微信扫码登录</span>
          </button>

          <button
            onClick={() => { setLoginMethod('phone'); setErrorMsg(null); }}
            className={`flex-1 py-3 px-2 text-center transition-colors flex items-center justify-center space-x-1 cursor-pointer whitespace-nowrap ${
              loginMethod === 'phone' ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-bold' : 'hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>手机登录</span>
          </button>

          {currentEnvMode === 'test' && (
            <button
              onClick={() => { setLoginMethod('quick_select'); setErrorMsg(null); }}
              className={`flex-1 py-3 px-2 text-center transition-colors flex items-center justify-center space-x-1 cursor-pointer whitespace-nowrap ${
                loginMethod === 'quick_select' ? 'bg-white text-amber-700 border-b-2 border-amber-600 font-bold' : 'hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span>体验账号</span>
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: Direct WeChat 1-Click Auth */}
          {loginMethod === 'wechat_direct' && (
            <div className="space-y-4 py-1">
              
              {/* Feature Highlights Card */}
              <div className={`${currentEnvMode === 'production' ? 'bg-emerald-50/80 border-emerald-200/80' : 'bg-amber-50/80 border-amber-200/80'} border rounded-2xl p-3.5 space-y-2.5 text-left`}>
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 ${currentEnvMode === 'production' ? 'bg-emerald-600' : 'bg-amber-600'} text-white rounded-xl shadow-xs`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {currentEnvMode === 'production' ? '微信官方授权直登 (仅限微信客户端)' : '模拟微信免密直登 (测试模式)'}
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      {currentEnvMode === 'production' 
                        ? '在微信内点击调起微信官方授权页，自动拉取真实微信头像与昵称'
                        : '直接模拟生成虚拟测试 OpenID 进行业务演练'}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-700 space-y-1 pt-1 border-t border-slate-200/50">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {currentEnvMode === 'production' ? '真实绑定微信官方 OpenID 与头像' : '模拟体验全流程积分与核销'}
                    </span>
                  </div>
                  {currentEnvMode === 'production' && (
                    <div className="flex items-center space-x-1.5 text-amber-800 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>电脑端请切换到上方【微信扫码登录】标签使用手机微信扫码</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Name input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  您的姓名 / 称呼 <span className="text-slate-400 font-normal">(可选，默认自动读取微信昵称)</span>
                </label>
                <input
                  type="text"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  placeholder="如：王建民 / 李阿姨"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Primary 1-Click WeChat Direct Action Button */}
              <button
                type="button"
                onClick={handleDirectWechatAuth}
                disabled={isLoggingIn}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>正在调起微信授权登录...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M8.5 2C4.36 2 1 4.91 1 8.5c0 1.98 1.02 3.75 2.64 4.96-.13.78-.58 2.21-.66 2.52-.1.39.14.39.3.28.22-.15 2.29-1.56 2.76-1.89.78.23 1.6.36 2.46.36.21 0 .42-.01.63-.03-.23-.62-.36-1.28-.36-1.97 0-3.31 3.13-6 7-6 .12 0 .24.01.36.01C15.02 3.86 12.01 2 8.5 2zm-2.25 4.5c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25S5 8.44 5 7.75 5.56 6.5 6.25 6.5zm4.5 0c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25S9.5 8.44 9.5 7.75 10.06 6.5 10.75 6.5zM15.5 8c-3.59 0-6.5 2.46-6.5 5.5 0 1.74.96 3.29 2.45 4.31-.11.66-.49 1.88-.56 2.14-.08.33.12.33.25.24.19-.13 1.94-1.32 2.34-1.6.66.19 1.36.3 2.08.3 3.59 0 6.5-2.46 6.5-5.5S19.09 8 15.5 8zm-2 3.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
                    </svg>
                    <span>微信一键授权登录 / 注册</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className="text-blue-600 hover:underline flex items-center space-x-1 cursor-pointer font-medium"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>使用手机短信验证码登录</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLoginMethod('wechat_scan')}
                  className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
                >
                  <QrCode className="w-3 h-3" />
                  <span>电脑扫码(备用)</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: Phone Code Login / Register */}
          {loginMethod === 'phone' && (
            <div className="space-y-3 py-1">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 text-blue-900 text-[11px] leading-relaxed">
                📱 <strong>手机验证码登录</strong>：输入任意11位手机号码（如 <code className="bg-white/80 px-1 py-0.5 rounded text-blue-800 font-mono">13800138000</code>），点击获取验证码即可极速登入。
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">手机号码</label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={11}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="请输入11位手机号"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">您的居民姓名 (可选)</label>
                <input
                  type="text"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  placeholder="如：王建民 / 李阿姨"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">短信验证码</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="验证码 (测试填 8888)"
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                    className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 disabled:opacity-50 font-bold rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePhoneLogin}
                disabled={isLoggingIn}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{isLoggingIn ? '正在登录中...' : '验证并登录 / 注册新账号'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 3: Quick Select Demo Accounts */}
          {loginMethod === 'quick_select' && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 leading-snug">
                💡 <strong>一键测试登录</strong>：点击下方真实角色，免去注册步骤直接体验其对应的积分历史、工时记录与兑换核销。
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className="w-full text-left p-3 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl bg-slate-100 p-2 rounded-xl group-hover:scale-105 transition-transform">
                        {u.avatar}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-800">{u.name}</span>
                          {u.role === 'admin' ? (
                            <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              社区管理员
                            </span>
                          ) : u.role === 'party_member' ? (
                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5">
                              <span>🚩</span>
                              <span>党员志愿者</span>
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              居民志愿者
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {u.role === 'admin'
                            ? '全功能管理权限 · 工时审核 · 积分发奖 · 礼品核销'
                            : u.role === 'party_member'
                            ? `党员先锋岗 · 积分: ${u.points}分 | 志愿工时: ${u.totalHours}h`
                            : `居民志愿者 · 积分: ${u.points}分 | 志愿工时: ${u.totalHours}h`}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Optional WeChat QR Scan Tab */}
          {loginMethod === 'wechat_scan' && (
            <div className="text-center space-y-3.5 py-1">
              
              {/* QR Code Container */}
              <div className="relative mx-auto w-44 h-44 bg-white p-2.5 rounded-2xl border-2 border-emerald-500/30 shadow-md flex items-center justify-center">
                {scanStatus === 'loading' || isGeneratingTicket ? (
                  <div className="flex flex-col items-center space-y-2 text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                    <span className="text-xs">生成安全二维码中...</span>
                  </div>
                ) : scanStatus === 'expired' ? (
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-xs text-red-500 font-semibold">二维码已失效</span>
                    <button
                      type="button"
                      onClick={initScanTicket}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                    >
                      点击刷新
                    </button>
                  </div>
                ) : scanStatus === 'confirmed' ? (
                  <div className="flex flex-col items-center space-y-2 text-emerald-600">
                    <CheckCircle2 className="w-12 h-12 animate-bounce" />
                    <span className="text-xs font-bold">登录授权成功！</span>
                  </div>
                ) : (
                  <QRCodeSVG
                    value={scanQrUrl}
                    size={152}
                    level="M"
                    includeMargin={false}
                  />
                )}
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-center">
                {scanStatus === 'pending' && (
                  <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-0.5 rounded-full text-xs border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-semibold">使用手机微信扫一扫</span>
                  </div>
                )}
                {scanStatus === 'scanned' && (
                  <div className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-800 px-3 py-0.5 rounded-full text-xs border border-amber-200 font-semibold animate-pulse">
                    <span>📲 手机已扫码，等待确认...</span>
                  </div>
                )}
                {scanStatus === 'confirmed' && (
                  <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full text-xs border border-emerald-300 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>授权成功，已同步登入</span>
                  </div>
                )}
              </div>

              {/* Primary Action Buttons */}
              <div className="pt-1 space-y-2">
                {currentEnvMode === 'production' ? (
                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-950 text-left space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>真实微信扫码同步通道已建立</span>
                    </div>
                    <p className="text-[11px] text-emerald-900/80">
                      请使用手机微信【扫一扫】扫描上方二维码，在手机端完成官方授权后，电脑端将自动实时载入您的真实微信居民档案。
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleMockScanConfirm}
                    disabled={isMockingScan}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                    title="无需手机，直接极速模拟手机微信扫码授权完成"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>{isMockingScan ? '正在模拟授权中...' : '⚡ 一键模拟手机扫码确认 (测试演练)'}</span>
                  </button>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('wechat_direct')}
                    className="text-emerald-700 hover:underline flex items-center space-x-1 cursor-pointer font-medium"
                  >
                    <Zap className="w-3 h-3" />
                    <span>返回微信一键直登</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowHostConfig(!showHostConfig)}
                    className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                    <span>{showHostConfig ? '收起局域网配置' : '配置国内/局域网域名'}</span>
                  </button>
                </div>

                {showHostConfig && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left space-y-1.5 animate-fadeIn">
                    <label className="text-[10px] font-bold text-slate-600 block">
                      自定义二维码访问地址 (如腾讯云/局域网IP):
                    </label>
                    <div className="flex space-x-1.5">
                      <input
                        type="text"
                        value={customHost}
                        onChange={(e) => setCustomHost(e.target.value)}
                        placeholder="https://jifen-295865-11-1301488547.sh.run.tcloudbase.com"
                        className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={initScanTicket}
                        className="px-2.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        更新二维码
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          登录即代表同意社区志愿服务章程与爱心积分管理办法
        </div>

      </div>
    </div>
  );
};
