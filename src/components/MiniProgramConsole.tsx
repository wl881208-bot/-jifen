import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { User } from '../types';
import { 
  miniProgramLogin, 
  miniProgramGetPhoneNumber, 
  miniProgramExportSource, 
  miniProgramSubscribeMessage 
} from '../lib/dataService';
import { 
  Smartphone, 
  Zap, 
  Phone, 
  BellRing, 
  Code2, 
  Download, 
  CheckCircle2, 
  Copy, 
  X, 
  ChevronRight, 
  Sparkles,
  Info,
  ShieldCheck,
  QrCode,
  Layers,
  FolderArchive,
  FileCode,
  ExternalLink,
  BookOpen,
  FolderTree
} from 'lucide-react';

interface MiniProgramConsoleProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  onShowMessage: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MiniProgramConsole: React.FC<MiniProgramConsoleProps> = ({
  currentUser,
  onUserChange,
  onShowMessage,
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [sourceData, setSourceData] = useState<any>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [customPhoneInput, setCustomPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'native' | 'webview' | 'doc'>('all');

  const appid = 'wx8b069e2f10f2e2da';

  useEffect(() => {
    fetchSourceCode();
  }, []);

  const fetchSourceCode = async () => {
    try {
      const res = await miniProgramExportSource();
      if (res.success) {
        setSourceData(res);
      }
    } catch (e) {
      console.warn('Export source error:', e);
    }
  };

  // 1-Click ZIP Download for WeChat Mini Program Project
  const handleDownloadZip = async () => {
    if (!sourceData || !sourceData.files) {
      onShowMessage('正在加载代码包资源，请稍候...', 'info');
      await fetchSourceCode();
    }

    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      // Create root folder in zip
      const rootFolder = zip.folder('community-volunteer-miniprogram');
      
      // Populate all files into zip
      sourceData.files.forEach((file: any) => {
        rootFolder?.file(file.path, file.content);
      });

      // Generate zip blob
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Trigger download
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `community-volunteer-miniprogram-${appid}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onShowMessage(`[一键导出成功] 微信小程序工程包 (.ZIP) 已下载！解压后用微信开发者工具导入即可运行。`, 'success');
    } catch (err: any) {
      console.error('Zip generation error:', err);
      onShowMessage('打包下载失败: ' + err.message, 'error');
    } finally {
      setIsZipping(false);
    }
  };

  const handleMiniLoginTest = async () => {
    setLoading(true);
    try {
      const mockJsCode = `mock_jscode_${Math.floor(1000 + Math.random() * 9000)}`;
      const res = await miniProgramLogin(mockJsCode);
      if (res.success && res.user) {
        onUserChange(res.user);
        onShowMessage(`[wx.login 成功] 原生小程序 Code 已通过 jscode2session 换取 OpenID`, 'success');
      } else {
        onShowMessage(res.message || '小程序登录失败', 'error');
      }
    } catch (e) {
      onShowMessage('网络异常，小程序登录测试失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizePhone = async () => {
    setLoading(true);
    try {
      const phoneToBind = customPhoneInput.trim() || `138****${Math.floor(1000 + Math.random() * 9000)}`;
      const res = await miniProgramGetPhoneNumber(currentUser.id, phoneToBind);
      if (res.success && res.user) {
        onUserChange(res.user);
        onShowMessage(`[wx.getPhoneNumber 成功] 已为您无感快捷绑定手机号: ${res.phoneNumber}`, 'success');
        setShowPhoneModal(false);
      } else {
        onShowMessage(res.message || '手机号绑定失败', 'error');
      }
    } catch (e) {
      onShowMessage('手机号授权处理失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSubscribe = async (type: string) => {
    let title = '【志愿服务到账通知】';
    let content = '您参与的社区环境整治志愿服务工时已审核通过，已自动发放 50 积分！';
    if (type === 'gift') {
      title = '【礼品兑换成功通知】';
      content = '您已成功兑换【精制珍珠大米 5kg】，兑换码 [RH9821]，请前往社区服务中心核销领用。';
    }

    try {
      const res = await miniProgramSubscribeMessage('tmpl_001', title, content, currentUser.id);
      if (res.success) {
        onShowMessage(`[wx.requestSubscribeMessage] ${res.message}`, 'success');
      }
    } catch (e) {
      onShowMessage('订阅消息模拟失败', 'error');
    }
  };

  const handleCopyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredFiles = sourceData?.files?.filter((f: any) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'native') return f.category === 'native';
    if (categoryFilter === 'webview') return f.category === 'webview';
    if (categoryFilter === 'doc') return f.category === 'doc';
    return true;
  }) || [];

  return (
    <div className="bg-slate-900 text-white border-b border-emerald-500/30 shadow-lg">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold flex items-center space-x-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>微信小程序原生模式 (Uniapp / Taro) 已就绪</span>
          </span>

          <span className="bg-emerald-950/80 text-emerald-200 border border-emerald-700/50 px-2 py-0.5 rounded-md font-mono flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>免域名拦截 (无10011错误)</span>
          </span>

          <span className="hidden lg:inline-block text-slate-300">
            已连接 AppID: <code className="text-amber-300 font-mono font-bold bg-black/40 px-1.5 py-0.5 rounded">{appid}</code>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-wrap">
          {/* Prominent 1-Click Export ZIP Button */}
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3.5 py-1.5 rounded-lg font-bold transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 flex items-center space-x-1.5 border border-amber-300/40"
          >
            <Download className="w-4 h-4 animate-bounce" />
            <span>{isZipping ? '正在打包压缩...' : '一键导出小程序代码 (.ZIP)'}</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-md flex items-center space-x-1.5 border border-emerald-400/30"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>在线查看源码</span>
          </button>

          <button
            onClick={() => setShowPhoneModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/80 px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>模拟获取手机号</span>
          </button>

          <button
            onClick={handleMiniLoginTest}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/80 px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>测试 wx.login</span>
          </button>
        </div>
      </div>

      {/* Mini Program Features Dashboard Quick Strip */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 py-1.5 text-[11px] text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-4 flex-wrap">
            <span className="text-emerald-400 font-medium flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>wx.login 零感知登录</span>
            </span>
            <span className="text-emerald-400 font-medium flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>getPhoneNumber 快捷绑卡</span>
            </span>
            <span className="text-emerald-400 font-medium flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>4大原生 TabBar 页面</span>
            </span>
            <span className="text-emerald-400 font-medium flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>订阅消息工时到账通知</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => handleTestSubscribe('activity')}
              className="text-amber-300 hover:text-amber-200 underline flex items-center space-x-1 text-[11px]"
            >
              <BellRing className="w-3 h-3 text-amber-400" />
              <span>测试工时到账订阅提醒</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Phone Number Authorization Sheet Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Native WeChat Phone Sheet Header */}
            <div className="bg-emerald-800 p-4 text-white text-center relative">
              <button 
                onClick={() => setShowPhoneModal(false)}
                className="absolute right-3 top-3 text-emerald-200 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-800 shadow-md font-bold text-xl">
                微
              </div>
              <h3 className="font-bold text-base">微信小程序手机号一键快捷授权</h3>
              <p className="text-xs text-emerald-100 mt-0.5">绑定后居民无需繁琐注册，自动同步档案积分</p>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 flex items-start space-x-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">原生小程序开放能力：open-type="getPhoneNumber"</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    在真机上，居民点击按钮后，微信客户端会弹出系统级的原生手机号允许对话框，全流程仅需 1 秒！
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  当前需要绑定的居民：<span className="text-emerald-700 font-bold">{currentUser.name}</span>
                </label>
                <input
                  type="text"
                  placeholder="留空自动生成掩码手机号（如 138****8888）"
                  value={customPhoneInput}
                  onChange={(e) => setCustomPhoneInput(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={handleAuthorizePhone}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>{loading ? '处理授权中...' : '允许（微信一键快捷授权）'}</span>
                </button>

                <button
                  onClick={() => setShowPhoneModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl font-medium text-xs transition-colors"
                >
                  拒绝 / 取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Mini Program Source Code & Project Exporter Modal */}
      {showExportModal && sourceData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <FolderArchive className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                    <span>微信小程序工程源码包</span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded font-mono border border-emerald-500/40">
                      AppID: {sourceData.appid}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    采用 wx.login 架构，包含原生 WXML/WXSS/JS、Web-View 容器及完整 API 接口层
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* 1-Click ZIP Download in Modal */}
                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-lg flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>{isZipping ? '打包中...' : '一键打包下载完整工程 (.ZIP)'}</span>
                </button>

                <button 
                  onClick={() => setShowExportModal(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                    categoryFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  全部文件 ({sourceData.files?.length || 0})
                </button>
                <button
                  onClick={() => setCategoryFilter('native')}
                  className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                    categoryFilter === 'native' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  原生小程序模块 (WXML/WXSS)
                </button>
                <button
                  onClick={() => setCategoryFilter('webview')}
                  className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                    categoryFilter === 'webview' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Web-View 全景大厅
                </button>
                <button
                  onClick={() => setCategoryFilter('doc')}
                  className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                    categoryFilter === 'doc' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📖 导入实战指南
                </button>
              </div>

              <span className="text-slate-400 text-[11px]">
                解压后直接在【微信开发者工具】中点击【导入】即可
              </span>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-4">
              {/* File List Sidebar */}
              <div className="p-3 bg-slate-950/60 border-r border-slate-800 space-y-1 overflow-y-auto">
                <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider flex items-center justify-between">
                  <span>文件目录 (Files)</span>
                  <FolderTree className="w-3.5 h-3.5 text-slate-500" />
                </div>

                {filteredFiles.map((file: any, idx: number) => {
                  const originalIndex = sourceData.files.findIndex((f: any) => f.path === file.path);
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFileIndex(originalIndex)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                        selectedFileIndex === originalIndex
                          ? 'bg-emerald-600 text-white font-bold shadow-md'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <FileCode className="w-3.5 h-3.5 opacity-70 shrink-0" />
                        <span className="font-mono truncate">{file.path}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 opacity-60 shrink-0" />
                    </button>
                  );
                })}

                <div className="pt-4 px-2 space-y-2">
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-[11px] text-slate-300 space-y-1">
                    <p className="font-bold text-amber-300 flex items-center space-x-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>3步极速导入运行：</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400">
                      <li>点击右上角【一键打包下载完整工程 ZIP】</li>
                      <li>打开微信开发者工具点击【导入】并选择该目录</li>
                      <li>填入 AppID: <code className="text-white bg-slate-800 px-1 rounded">{sourceData.appid}</code></li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="md:col-span-3 p-4 bg-slate-900 flex flex-col overflow-hidden">
                {sourceData.files?.[selectedFileIndex] && (
                  <>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 flex-wrap gap-2">
                      <div>
                        <h4 className="font-mono text-emerald-400 text-sm font-bold flex items-center space-x-2">
                          <span>{sourceData.files[selectedFileIndex].path}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 font-sans px-2 py-0.5 rounded border border-slate-700">
                            {sourceData.files[selectedFileIndex].category || 'file'}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {sourceData.files[selectedFileIndex].description}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopyCode(sourceData.files[selectedFileIndex].content, selectedFileIndex)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-all shadow-md flex items-center space-x-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedIndex === selectedFileIndex ? '已复制！' : '复制此文件代码'}</span>
                        </button>
                      </div>
                    </div>

                    <pre className="flex-1 bg-slate-950 p-4 rounded-xl overflow-auto font-mono text-xs text-slate-200 border border-slate-800/80 leading-relaxed select-all">
                      <code>{sourceData.files[selectedFileIndex].content}</code>
                    </pre>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>支持 Uniapp、Taro、微信开发者工具 100% 原生兼容导入</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>一键导出 .ZIP 工程包</span>
                </button>

                <button
                  onClick={() => setShowExportModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-lg font-medium transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

