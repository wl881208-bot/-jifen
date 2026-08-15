import React, { useState } from 'react';
import { User, WechatLoginResponse } from '../types';
import { wechatMockLogin, getWechatAuthUrl } from '../lib/dataService';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  UserPlus, 
  Smartphone, 
  ShieldCheck, 
  ChevronRight,
  Info,
  Key,
  X,
  Copy,
  ExternalLink
} from 'lucide-react';

interface WechatAuthConsoleProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  onShowMessage: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const WechatAuthConsole: React.FC<WechatAuthConsoleProps> = ({
  currentUser,
  onUserChange,
  onShowMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customOpenId, setCustomOpenId] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);

  const appPreviewUrl = 'https://ais-pre-osvnr3skurb2bwxoglvyra-202559658155.us-east1.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appPreviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isWechatBrowser = typeof navigator !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent);

  const handleSwitchOpenId = async (openid: string, name?: string) => {
    setLoading(true);
    try {
      const res: WechatLoginResponse = await wechatMockLogin(openid, name);
      if (res.success && res.user) {
        onUserChange(res.user);
        onShowMessage(res.message || `已绑定 OpenID: ${openid}`, 'success');
      } else {
        onShowMessage(res.message || '切换 OpenID 失败', 'error');
      }
    } catch (err) {
      onShowMessage('网络异常，OpenID 绑定失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateNewUser = async () => {
    const randId = Math.floor(1000 + Math.random() * 9000);
    const newOpenId = `mock_openid_wx_${randId}`;
    await handleSwitchOpenId(newOpenId, `微信居民_${randId}`);
  };

  const handleSimulateWechatAuthRedirect = async () => {
    setLoading(true);
    try {
      const authRes = await getWechatAuthUrl(window.location.href);
      if (authRes.authUrl) {
        onShowMessage(`[模拟微信静默跳转] 重定向至: ${authRes.authUrl.slice(0, 45)}...`, 'info');
        setTimeout(() => {
          handleSwitchOpenId('mock_openid_resident_001');
        }, 800);
      }
    } catch (err) {
      onShowMessage('静默授权链接生成失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-emerald-800 text-white border-b border-emerald-700/60 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-2">
        
            {/* Environment & OpenID Status */}
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="bg-emerald-900/80 text-emerald-200 border border-emerald-600/50 px-2 py-0.5 rounded-full font-medium flex items-center space-x-1">
                <Smartphone className="w-3 h-3 text-emerald-300" />
                <span>{isWechatBrowser ? '真实微信 H5 授权模式 (snsapi_userinfo)' : '真实微信登录模式 (Mock已关闭)'}</span>
              </span>

              <div className="flex items-center space-x-1 bg-black/20 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                <Key className="w-3 h-3 text-amber-300" />
                <span className="text-emerald-100 font-mono">OpenID:</span>
                <span className="font-semibold text-amber-200 font-mono truncate max-w-[150px] sm:max-w-none">
                  {currentUser.openid || '真实微信账号认证中'}
                </span>
              </div>

              <span className="hidden md:inline-block text-emerald-200/80">
                当前居民: <strong className="text-white">{currentUser.name}</strong> ({currentUser.points} 积分)
              </span>
            </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 shadow-xs active:scale-95"
            title="微信扫码体验应用"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-950" />
            <span>📱 手机扫码体验</span>
          </button>

          <button
            onClick={handleSimulateNewUser}
            disabled={loading}
            className="bg-emerald-700 hover:bg-emerald-600 text-emerald-100 font-medium px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 border border-emerald-500/50"
            title="一键模拟新微信用户进入（0积分）"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ 模拟新用户</span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-emerald-700 hover:bg-emerald-600 text-emerald-100 px-2.5 py-1 rounded-md border border-emerald-500/50 transition-colors flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>测试控制台</span>
          </button>
        </div>
      </div>

      {/* Expanded Console Panel */}
      {isOpen && (
        <div className="bg-emerald-950/95 border-t border-emerald-800 p-4 text-emerald-100 animate-fadeIn text-xs">
          <div className="max-w-7xl mx-auto space-y-3">
            
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-white">微信网页 OAuth2.0 静默授权与 OpenID 绑定测试面板</span>
              </div>
              <span className="text-emerald-400/80 text-[11px]">
                环境参数: ENABLE_WECHAT_MOCK = true | scope = snsapi_base
              </span>
            </div>

            <p className="text-emerald-300/90 leading-relaxed">
              静默授权流程：居民在微信中打开 H5 页面时，无感换取 <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200">code</code> 并在后端调取微信 API 拿到 <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200">openid</code>。
              首次进入将<b>自动初始化创建居民账号并绑定 OpenID (初始0积分)</b>；若已存在则签发 Token 并关联已有积分与工时。
            </p>

            {/* Quick Switch Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              
              <button
                onClick={() => handleSwitchOpenId('mock_openid_resident_001')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  currentUser.openid === 'mock_openid_resident_001'
                    ? 'bg-emerald-800 border-amber-400 text-white font-semibold ring-1 ring-amber-400'
                    : 'bg-emerald-900/50 border-emerald-700/60 text-emerald-200 hover:bg-emerald-800/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-amber-300 font-bold">老居民 · 张兰英</span>
                  <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300">320 积分</span>
                </div>
                <div className="font-mono text-[10px] text-emerald-400/80 mt-1 truncate">
                  OpenID: mock_openid_resident_001
                </div>
              </button>

              <button
                onClick={() => handleSwitchOpenId('mock_openid_resident_002')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  currentUser.openid === 'mock_openid_resident_002'
                    ? 'bg-emerald-800 border-amber-400 text-white font-semibold ring-1 ring-amber-400'
                    : 'bg-emerald-900/50 border-emerald-700/60 text-emerald-200 hover:bg-emerald-800/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-amber-300 font-bold">热心居民 · 李建国</span>
                  <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300">150 积分</span>
                </div>
                <div className="font-mono text-[10px] text-emerald-400/80 mt-1 truncate">
                  OpenID: mock_openid_resident_002
                </div>
              </button>

              <button
                onClick={() => handleSwitchOpenId('mock_openid_admin_999')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  currentUser.openid === 'mock_openid_admin_999'
                    ? 'bg-amber-900/60 border-amber-400 text-white font-semibold ring-1 ring-amber-400'
                    : 'bg-emerald-900/50 border-emerald-700/60 text-emerald-200 hover:bg-emerald-800/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-amber-300 font-bold">网格管理员 · 王主任</span>
                  <span className="text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded font-bold">管理员</span>
                </div>
                <div className="font-mono text-[10px] text-emerald-400/80 mt-1 truncate">
                  OpenID: mock_openid_admin_999
                </div>
              </button>

              <button
                onClick={handleSimulateNewUser}
                className="p-2.5 rounded-lg border border-dashed border-amber-400/80 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-left transition-all flex flex-col justify-between"
              >
                <div className="font-bold flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>生成全新 OpenID</span>
                </div>
                <div className="text-[10px] text-amber-300/80 mt-1">
                  模拟新微信授权，初始积分 0 分
                </div>
              </button>

            </div>

            {/* WeChat Error 10011 Troubleshooting & Domain Config Help */}
            <div className="bg-amber-950/70 border border-amber-500/50 p-3 rounded-xl text-amber-100 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>遇到微信“错误码 10011（redirect_uri 域名与后台配置不一致）”？</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="bg-amber-400 text-slate-950 px-2.5 py-1 rounded-md text-[11px] font-bold hover:bg-amber-300 transition-colors flex items-center space-x-1 shrink-0"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? '已复制域名' : '复制授权域名'}</span>
                </button>
              </div>

              <div className="text-[11px] text-amber-200/90 leading-relaxed space-y-1">
                <p><strong>错误原因：</strong>微信公众号 <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">wx8b069e2f10f2e2da</code> 的后台尚未将本系统域名配置为【网页授权域名】。</p>
                <p><strong>解决步骤（仅需 1 分钟）：</strong></p>
                <ol className="list-decimal list-inside space-y-0.5 pl-1 text-amber-100">
                  <li>登录 <a href="https://mp.weixin.qq.com" target="_blank" rel="noreferrer" className="underline font-semibold text-amber-300">微信公众平台 (mp.weixin.qq.com)</a></li>
                  <li>进入 <b>【设置与开发】👉【公众号设置】👉【功能设置】👉【网页授权域名】</b></li>
                  <li>点击设置，在域名栏填入：<code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-300 font-mono">ais-pre-osvnr3skurb2bwxoglvyra-202559658155.us-east1.run.app</code></li>
                  <li>如微信提示校验 <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">MP_verify_xxx.txt</code> 文件，本服务端已全自动原生拦截适配，直接点击“确认/保存”即可成功配置！</li>
                </ol>
              </div>
            </div>

            {/* Custom OpenID Form & Simulate Redirect Button */}
            <div className="pt-2 border-t border-emerald-800/80 flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[200px] flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="输入自定义 OpenID (如: wx_openid_888)"
                  value={customOpenId}
                  onChange={(e) => setCustomOpenId(e.target.value)}
                  className="bg-black/40 border border-emerald-700 rounded px-2.5 py-1 text-white placeholder-emerald-600 focus:outline-none focus:border-amber-400 text-xs flex-1 font-mono"
                />
                <input
                  type="text"
                  placeholder="姓名 (可选)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-24 bg-black/40 border border-emerald-700 rounded px-2.5 py-1 text-white placeholder-emerald-600 focus:outline-none focus:border-amber-400 text-xs"
                />
                <button
                  onClick={() => {
                    if (!customOpenId.trim()) return onShowMessage('请先输入 OpenID', 'error');
                    handleSwitchOpenId(customOpenId.trim(), customName.trim() || undefined);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1 rounded transition-colors whitespace-nowrap"
                >
                  绑定并登录
                </button>
              </div>

              <button
                onClick={handleSimulateWechatAuthRedirect}
                className="bg-emerald-800 hover:bg-emerald-700 text-emerald-200 border border-emerald-600 px-3 py-1 rounded transition-colors flex items-center space-x-1"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>触发完整的 snsapi_base 重定向</span>
              </button>
            </div>

          </div>
        </div>
      )}

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
            <div className="bg-slate-50 border-2 border-dashed border-emerald-300 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2">
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
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors"
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

              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900 text-left space-y-1">
                <p className="font-bold text-amber-950 flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>扫码若提示“错误码 10011”？</span>
                </p>
                <p className="text-amber-800 leading-snug">
                  请在微信公众号后台【网页授权域名】中添加：<br/>
                  <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200 text-amber-950 font-semibold select-all">ais-pre-osvnr3skurb2bwxoglvyra-202559658155.us-east1.run.app</code>
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
