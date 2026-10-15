import React, { useState } from 'react';
import { User, WechatLoginResponse, SystemEnvMode } from '../types';
import { wechatMockLogin, getWechatAuthUrl } from '../lib/dataService';
import { QRCodeSVG } from 'qrcode.react';
import { getPublicAppUrl } from '../lib/appConfig';
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
  ExternalLink,
  Globe,
  Settings2
} from 'lucide-react';

interface WechatAuthConsoleProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  onShowMessage: (msg: string, type?: 'success' | 'error' | 'info') => void;
  currentEnvMode?: SystemEnvMode;
  onOpenEnvSwitchModal?: () => void;
}

export const WechatAuthConsole: React.FC<WechatAuthConsoleProps> = ({
  currentUser,
  onUserChange,
  onShowMessage,
  currentEnvMode = 'production',
  onOpenEnvSwitchModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customOpenId, setCustomOpenId] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);

  // Public preview link (accessible directly on mobile phones without Google Account login)
  const appPreviewUrl = getPublicAppUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appPreviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isWechatBrowser = typeof navigator !== 'undefined' && /MicroMessenger/i.test(navigator.userAgent);

  const handleSwitchOpenId = async (openid: string, name?: string) => {
    if (currentEnvMode === 'production') {
      onShowMessage('当前处于真实生产模式，禁止模拟切换 OpenID。请切换至测试模式。', 'error');
      return;
    }
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
    if (currentEnvMode === 'production') {
      onShowMessage('当前处于【真实微信生产模式】，无法生成模拟用户。可在右上角切换为【测试模式】进行演练。', 'info');
      return;
    }
    const randId = Math.floor(1000 + Math.random() * 9000);
    const newOpenId = `mock_openid_${Date.now().toString(36)}_${randId}`;
    await handleSwitchOpenId(newOpenId, `新居民_${randId}`);
  };

  const handleSimulateWechatAuthRedirect = async () => {
    setLoading(true);
    try {
      const authRes = await getWechatAuthUrl(window.location.href);
      if (authRes.authUrl) {
        onShowMessage(`[微信授权跳转] 重定向至微信官方授权页`, 'info');
        window.location.href = authRes.authUrl;
      }
    } catch (err) {
      onShowMessage('授权链接生成失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${currentEnvMode === 'production' ? 'bg-emerald-900 border-emerald-800' : 'bg-slate-800 border-slate-700'} text-white border-b shadow-inner transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-2">
        
            {/* Environment & OpenID Status */}
            <div className="flex items-center space-x-2 flex-wrap">
              <button
                type="button"
                onClick={onOpenEnvSwitchModal}
                className="bg-black/30 hover:bg-black/40 text-white border border-white/20 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                title="点击切换生产/测试环境"
              >
                <span className={`w-2 h-2 rounded-full ${currentEnvMode === 'production' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{currentEnvMode === 'production' ? '🟢 真实微信生产模式' : '🟡 模拟测试演练模式'}</span>
                <span className="text-[10px] text-amber-200 underline ml-0.5">切换</span>
              </button>

              <div className="flex items-center space-x-1 bg-black/20 px-2.5 py-0.5 rounded-md border border-white/10">
                <Key className="w-3 h-3 text-amber-300" />
                <span className="text-emerald-100 font-mono">OpenID:</span>
                <span className="font-semibold text-amber-200 font-mono truncate max-w-[150px] sm:max-w-none">
                  {currentUser.openid || (currentEnvMode === 'production' ? '微信官方待认证' : '未绑定')}
                </span>
              </div>

              <span className="hidden md:inline-block text-emerald-200/80">
                当前档案: <strong className="text-white">{currentUser.name}</strong> ({currentUser.points} 积分)
              </span>
            </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 shadow-xs active:scale-95 cursor-pointer"
            title="微信扫码体验应用"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-950" />
            <span>📱 手机扫码体验</span>
          </button>

          {currentEnvMode === 'test' && (
            <button
              onClick={handleSimulateNewUser}
              disabled={loading}
              className="bg-emerald-700 hover:bg-emerald-600 text-emerald-100 font-medium px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 border border-emerald-500/50 cursor-pointer"
              title="一键模拟新微信用户进入（0积分）"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ 模拟新用户</span>
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-black/20 hover:bg-black/30 text-white px-2.5 py-1 rounded-md border border-white/20 transition-colors flex items-center space-x-1 cursor-pointer"
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

            {/* Domestic Network & Deployment Architecture Guide */}
            <div className="bg-emerald-900/60 border border-emerald-600/50 p-3 rounded-xl text-emerald-100 text-xs space-y-2">
              <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                <span>🇨🇳 国内生产环境微信直连与部署方案指南</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="bg-black/30 p-2.5 rounded-lg border border-emerald-700/60 space-y-1">
                  <div className="font-bold text-amber-200">方案 1：微信云托管 (推荐)</div>
                  <p className="text-emerald-300/80 leading-relaxed">
                    腾讯云与微信官方打通，免翻墙、免域名备案，自带微信内网免鉴权及天然 HTTPS，直接通过微信开放接口完成登录。
                  </p>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg border border-emerald-700/60 space-y-1">
                  <div className="font-bold text-amber-200">方案 2：国内自建服务器</div>
                  <p className="text-emerald-300/80 leading-relaxed">
                    部署在腾讯云/阿里云/华为云，将已备案域名绑定在微信公众号后台【网页授权域名】与【JS安全域名】即可。
                  </p>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg border border-emerald-700/60 space-y-1">
                  <div className="font-bold text-amber-200">方案 3：当前演示快速体验</div>
                  <p className="text-emerald-300/80 leading-relaxed">
                    在登录弹窗中点击【⚡ 一键模拟手机扫码确认】或使用【📱 手机号快捷登录】，无需翻墙即可秒级体验所有功能。
                  </p>
                </div>
              </div>
            </div>

            {/* WeChat Error 10003 Troubleshooting & Domain Config Help */}
            <div className="bg-amber-950/70 border border-amber-500/50 p-3 rounded-xl text-amber-100 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>遇到微信“错误码 10003（redirect_uri 域名与后台配置不一致）”？</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="bg-amber-400 text-slate-950 px-2.5 py-1 rounded-md text-[11px] font-bold hover:bg-amber-300 transition-colors flex items-center space-x-1 shrink-0 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? '已复制域名' : '复制授权域名'}</span>
                </button>
              </div>

              <div className="text-[11px] text-amber-200/90 leading-relaxed space-y-1">
                <p><strong>错误原因：</strong>微信公众号后台配置的【网页授权域名】与发起授权的实际域名不匹配。本系统已固定使用微信公众平台所配置的正式授权域名：<code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-300 font-mono">jifen-295865-11-1301488547.sh.run.tcloudbase.com</code>。</p>
                <p><strong>验证排查指南：</strong></p>
                <ol className="list-decimal list-inside space-y-0.5 pl-1 text-amber-100">
                  <li>登录 <a href="https://mp.weixin.qq.com" target="_blank" rel="noreferrer" className="underline font-semibold text-amber-300">微信公众平台 (mp.weixin.qq.com)</a></li>
                  <li>进入 <b>【设置与开发】👉【公众号设置】👉【功能设置】👉【网页授权域名】</b></li>
                  <li>确认填入的域名为：<code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-300 font-mono">jifen-295865-11-1301488547.sh.run.tcloudbase.com</code>（无需填写 http:// 或路径）</li>
                  <li>如微信提示校验 <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">MP_verify_xxx.txt</code> 文件，系统已自动拦截解析响应，直接点击确认即可通过校验！</li>
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
                  <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200 text-amber-950 font-semibold select-all">jifen-295865-11-1301488547.sh.run.tcloudbase.com</code>
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
