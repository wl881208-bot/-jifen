/**
 * WeChat H5 JSDK (JS-SDK) helper & Mock handler
 */

declare global {
  interface Window {
    wx?: any;
  }
}

export interface WechatShareData {
  title: string;
  desc: string;
  link: string;
  imgUrl?: string;
}

export async function fetchJssdkConfig(url?: string) {
  try {
    const currentUrl = url || window.location.href.split('#')[0];
    const res = await fetch(`/api/wechat/jssdk-config?url=${encodeURIComponent(currentUrl)}`);
    return await res.json();
  } catch (err) {
    console.warn('[WeChat JSDK] Config fetch error:', err);
    return null;
  }
}

export async function initWechatJssdk(shareData?: WechatShareData) {
  const config = await fetchJssdkConfig();
  if (!config) return;

  if (typeof window !== 'undefined' && window.wx) {
    window.wx.config({
      debug: false,
      appId: config.appId,
      timestamp: config.timestamp,
      nonceStr: config.nonceStr,
      signature: config.signature,
      jsApiList: [
        'updateAppMessageShareData',
        'updateTimelineShareData',
        'onMenuShareAppMessage',
        'onMenuShareTimeline'
      ]
    });

    window.wx.ready(() => {
      const targetData = shareData || config.defaultShare;
      if (window.wx.updateAppMessageShareData) {
        window.wx.updateAppMessageShareData(targetData);
        window.wx.updateTimelineShareData(targetData);
      }
    });

    window.wx.error((res: any) => {
      console.warn('[WeChat JSDK Error]', res);
    });
  } else {
    // Non-WeChat or Dev Mock mode
    console.log('[WeChat JSDK Mock] Initialized with config:', config);
  }
}

export function triggerWechatMockShare(shareData: WechatShareData, onToast?: (msg: string) => void) {
  if (typeof window !== 'undefined' && window.wx) {
    window.wx.ready(() => {
      window.wx.updateAppMessageShareData?.(shareData);
      window.wx.updateTimelineShareData?.(shareData);
      if (onToast) onToast(`[微信 JSDK] 已为当前页面配置微信分享卡片标题：《${shareData.title}》`);
    });
  } else {
    const msg = `[微信 JSDK 自定义分享 Mock] 已调起微信分享配置：
📢 标题: ${shareData.title}
📝 描述: ${shareData.desc}
🔗 链接: ${shareData.link}`;
    console.log(msg);
    if (onToast) {
      onToast(`[已模拟微信分享卡片] 标题：《${shareData.title}》`);
    }
  }
}
