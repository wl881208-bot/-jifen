import React, { useState, useEffect } from 'react';
import { SystemEnvMode, SystemEnvInfo } from '../types';
import { switchSystemEnvMode, getSystemEnvInfo } from '../lib/dataService';
import { 
  X, 
  ShieldCheck, 
  FlaskConical, 
  CheckCircle2, 
  RefreshCw, 
  AlertTriangle, 
  Key, 
  Server, 
  Trash2, 
  Smartphone,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface EnvSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: SystemEnvMode;
  onModeChanged: (newMode: SystemEnvMode) => void;
  onShowMessage: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const EnvSwitchModal: React.FC<EnvSwitchModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onModeChanged,
  onShowMessage,
}) => {
  const [loading, setLoading] = useState(false);
  const [envInfo, setEnvInfo] = useState<SystemEnvInfo | null>(null);
  const [showConfigEdit, setShowConfigEdit] = useState(false);
  const [appIdInput, setAppIdInput] = useState('');
  const [secretInput, setSecretInput] = useState('');
  const [oauthDomainInput, setOauthDomainInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadInfo();
    }
  }, [isOpen]);

  const loadInfo = async () => {
    const info = await getSystemEnvInfo();
    setEnvInfo(info);
    if (info.wechatAppId) setAppIdInput(info.wechatAppId);
    if (info.oauthDomain) setOauthDomainInput(info.oauthDomain);
  };

  if (!isOpen) return null;

  const handleSelectMode = async (targetMode: SystemEnvMode) => {
    if (targetMode === currentMode) return;
    setLoading(true);
    try {
      const res = await switchSystemEnvMode(targetMode);
      if (res.success) {
        onModeChanged(targetMode);
        onShowMessage(res.message || `环境已切换为【${targetMode === 'production' ? '真实微信生产模式' : '模拟测试演练模式'}】`, 'success');
        await loadInfo();
      } else {
        onShowMessage(res.message || '环境切换失败', 'error');
      }
    } catch (e: any) {
      onShowMessage('环境切换异常: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWechatConfig = async () => {
    setLoading(true);
    try {
      const res = await switchSystemEnvMode(
        currentMode, 
        appIdInput.trim() || undefined, 
        secretInput.trim() || undefined,
        oauthDomainInput.trim() || undefined
      );
      if (res.success) {
        onShowMessage('微信公众号参数及网页授权域名更新成功！', 'success');
        setShowConfigEdit(false);
        setSecretInput('');
        await loadInfo();
      } else {
        onShowMessage(res.message || '配置更新失败', 'error');
      }
    } catch (e: any) {
      onShowMessage('配置更新异常: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearLegacyCache = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('logged_in_user_id');
      localStorage.removeItem('wechat_openid');
      localStorage.removeItem('cached_user_profile');
    }
    onShowMessage('已彻底清理本地缓存与历史测试账号数据，请重新登录认证。', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg shadow-inner">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">系统运行环境与微信模式切换</h3>
              <p className="text-xs text-slate-300 mt-0.5">腾讯云托管与微信官方生态认证控制台</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Mode Selector Cards */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">选择系统当前运行环境</p>

            {/* Mode 1: Production Real WeChat */}
            <div 
              onClick={() => handleSelectMode('production')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                currentMode === 'production'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-xl text-white ${currentMode === 'production' ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">🟢 真实微信生产模式</span>
                      {currentMode === 'production' && (
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                          当前启用
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">面向居民正式使用，数据 100% 真实</p>
                  </div>
                </div>
                {currentMode === 'production' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-emerald-100/60 text-xs text-slate-600 space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>调用微信官方网页授权，获取真实微信头像、昵称与专属 OpenID</span>
                </div>
                <div className="flex items-center space-x-1.5 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>微信云托管原生网关直连免密通道（识别请求头真实 x-wx-openid）</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span>严格禁用任何虚拟测试账号与假数据生成，报错如实诊断</span>
                </div>
              </div>
            </div>

            {/* Mode 2: Test / Mock Mode */}
            <div 
              onClick={() => handleSelectMode('test')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                currentMode === 'test'
                  ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-xl text-white ${currentMode === 'test' ? 'bg-amber-600' : 'bg-slate-400'}`}>
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">🟡 模拟测试演练模式</span>
                      {currentMode === 'test' && (
                        <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold">
                          当前启用
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">开发演练、无微信凭证时的功能体验</p>
                  </div>
                </div>
                {currentMode === 'test' && (
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-amber-100/60 text-xs text-slate-600 space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>开放快捷体验账号登录（管理员、党员先锋、积极居民）</span>
                </div>
                <div className="flex items-center space-x-1.5 text-amber-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>支持一键模拟微信登录、模拟扫码核销与志愿服务流程演练</span>
                </div>
              </div>
            </div>

          </div>

          {/* Current Gateway & WeChat Diagnostics */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-700">
              <span className="flex items-center space-x-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                <span>微信云托管与公众号状态</span>
              </span>
              <button
                type="button"
                onClick={() => setShowConfigEdit(!showConfigEdit)}
                className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                {showConfigEdit ? '取消配置' : '配置参数'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-slate-400 block">云托管网关:</span>
                <span className={`font-semibold ${envInfo?.isTcbGateway ? 'text-emerald-600' : 'text-slate-600'}`}>
                  {envInfo?.isTcbGateway ? '已直连 x-wx-openid' : '标准容器 Web 模式'}
                </span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-slate-400 block">微信 AppID:</span>
                <span className="font-mono text-slate-700 font-semibold truncate block">
                  {envInfo?.wechatAppId || '未配置'}
                </span>
              </div>
            </div>

            {/* Config Edit Form */}
            {showConfigEdit && (
              <div className="pt-2 border-t border-slate-200 space-y-2.5 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">微信公众号 AppID</label>
                  <input
                    type="text"
                    value={appIdInput}
                    onChange={(e) => setAppIdInput(e.target.value)}
                    placeholder="如: wx7fd578a4010d96c7"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">微信公众号 AppSecret (留空则不修改)</label>
                  <input
                    type="password"
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    placeholder="请输入微信公众号 AppSecret"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[11px] font-semibold text-slate-600">微信网页授权域名 (对应错误码 10003)</label>
                    <span className="text-[10px] text-emerald-600 font-medium">必须与微信公众平台后台一致</span>
                  </div>
                  <input
                    type="text"
                    value={oauthDomainInput}
                    onChange={(e) => setOauthDomainInput(e.target.value)}
                    placeholder="如: jifen-295865-11-1301488547.sh.run.tcloudbase.com"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    在微信公众平台【设置与开发】👉【公众号设置】👉【功能设置】👉【网页授权域名】中填写的域名。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveWechatConfig}
                  disabled={loading}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                >
                  保存参数与授权域名
                </button>
              </div>
            )}
          </div>

          {/* Reset / Clear Local Stale Data button */}
          <div className="pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClearLegacyCache}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center space-x-1 cursor-pointer py-1.5 px-2 hover:bg-red-50 rounded-lg transition-colors"
              title="清理历史残留的测试用户ID与OpenID"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清理本地旧测试账号缓存</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              完成
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
