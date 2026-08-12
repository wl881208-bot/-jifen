import React, { useEffect, useRef, useState } from 'react';
import { Activity, User } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Download, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  MapPin, 
  Clock, 
  Building, 
  Smartphone,
  Copy,
  QrCode
} from 'lucide-react';
import { triggerWechatMockShare } from '../lib/wechatJssdk';

interface WechatActivityPosterModalProps {
  activity: Activity;
  currentUser: User;
  onClose: () => void;
  onShowMessage: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const WechatActivityPosterModal: React.FC<WechatActivityPosterModalProps> = ({
  activity,
  currentUser,
  onClose,
  onShowMessage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [posterImgUrl, setPosterImgUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);

  // Participant index mock (e.g., 18th volunteer for this activity)
  const participantNumber = (activity.signedCount || 0) + 1;
  const shareLink = `${window.location.origin}?actId=${activity.id}&referrer=${currentUser.openid || currentUser.id}`;

  useEffect(() => {
    generatePosterCanvas();
  }, [activity, currentUser]);

  const generatePosterCanvas = () => {
    setIsGenerating(true);
    const canvas = document.createElement('canvas');
    // High DPI 2x canvas size
    const width = 640;
    const height = 960;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Canvas Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Subtle background pattern or tint
    ctx.fillStyle = '#fffdfa';
    ctx.fillRect(20, 20, width - 40, height - 40);

    // Outer decorative border
    ctx.strokeStyle = '#fecdd3';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // 2. Header Banner (Red & Gold Community Theme)
    const headerGradient = ctx.createLinearGradient(0, 20, width, 180);
    headerGradient.addColorStop(0, '#991b1b');
    headerGradient.addColorStop(0.5, '#dc2626');
    headerGradient.addColorStop(1, '#b91c1c');

    ctx.fillStyle = headerGradient;
    ctx.beginPath();
    ctx.roundRect(20, 20, width - 40, 150, [12, 12, 0, 0]);
    ctx.fill();

    // Header Gold Badge Text
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚩 幸福邻里 · 社区志愿服务', width / 2, 65);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('志愿活动宣传与招募海报', width / 2, 110);

    ctx.fillStyle = '#fca5a5';
    ctx.font = '16px sans-serif';
    ctx.fillText('凝聚邻里力量 · 共建美好家园 · 积攒爱心积分', width / 2, 142);

    // 3. User Badge Box (我是第 N 位志愿参与者)
    ctx.fillStyle = '#fef2f2';
    ctx.beginPath();
    ctx.roundRect(40, 190, width - 80, 80, 16);
    ctx.fill();
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`👤 志愿居民：${currentUser.name}`, 60, 226);

    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`🌟 我是第 ${participantNumber} 位志愿倡议者！`, 60, 255);

    // 4. Activity Title Card
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(40, 285, width - 80, 420, 16);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Category Tag
    ctx.fillStyle = '#fee2e2';
    ctx.beginPath();
    ctx.roundRect(60, 305, 110, 32, 8);
    ctx.fill();
    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(activity.category, 115, 327);

    // Activity Title (Auto Word Wrap)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'left';
    
    const titleWords = activity.title;
    let titleY = 370;
    if (titleWords.length > 16) {
      ctx.fillText(titleWords.slice(0, 16), 60, titleY);
      ctx.fillText(titleWords.slice(16), 60, titleY + 36);
      titleY += 36;
    } else {
      ctx.fillText(titleWords, 60, titleY);
    }

    // Reward Highlight Box
    ctx.fillStyle = '#fff1f2';
    ctx.beginPath();
    ctx.roundRect(60, titleY + 15, width - 120, 60, 12);
    ctx.fill();
    ctx.strokeStyle = '#fecdd3';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`🎁 奖励积分：+${activity.pointsReward} 分`, 80, titleY + 52);
    ctx.fillStyle = '#047857';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`⏱️ 服务工时：${activity.hours} 小时`, 360, titleY + 52);

    // Details rows
    ctx.fillStyle = '#334155';
    ctx.font = '18px sans-serif';
    let detailY = titleY + 105;

    ctx.fillText(`📍 服务地点：${activity.location}`, 60, detailY);
    detailY += 32;
    ctx.fillText(`📅 服务时间：${activity.date}`, 60, detailY);
    detailY += 32;
    ctx.fillText(`🏢 组织单位：${activity.organizer}`, 60, detailY);
    detailY += 32;
    ctx.fillText(`👥 人数招募：已报 ${activity.signedCount} 人 / 限额 ${activity.maxSeats} 人`, 60, detailY);

    // Description quote box
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(60, detailY + 15, width - 120, 80, 10);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 16px sans-serif';
    const descExcerpt = activity.description.length > 42 ? activity.description.slice(0, 42) + '...' : activity.description;
    ctx.fillText(`“ ${descExcerpt} ”`, 75, detailY + 45);

    // 5. Footer & QR Code Section
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.roundRect(40, 720, width - 80, 200, 16);
    ctx.fill();

    // Draw QR code onto canvas
    const qrImage = new Image();
    const qrSvgString = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 29 29" fill="none" stroke="#000" stroke-width="1"><rect width="29" height="29" fill="#fff"/><path d="M0 0h7v7H0zM2 2h3v3H2zM22 0h7v7h-7zM24 2h3v3h-3zM0 22h7v7H0zM2 24h3v3H2zM9 0h2v3H9zM13 0h3v2h-3zM18 0h2v4h-2zM9 5h3v2H9zM14 5h4v2h-4zM9 9h2v4H9zM12 9h2v2h-2zM15 9h3v3h-3zM20 9h2v2h-2zM24 9h3v2h-3zM0 9h7v2H0zM0 13h4v2H0zM5 13h2v4H5zM9 15h2v2H9zM12 14h4v2h-4zM18 14h3v3h-3zM23 13h2v4h-2zM26 14h3v2h-3zM9 18h4v2H9zM14 18h2v3h-2zM17 18h4v2h-4zM22 18h3v2h-3zM26 18h3v4h-3zM0 16h3v2H0zM1 19h2v3H1zM4 19h3v2H4zM9 22h3v3H9zM13 22h2v5h-2zM16 22h3v2h-3zM20 22h2v3h-2zM23 23h3v2h-3zM27 23h2v6h-2zM0 26h4v3H0zM5 24h2v5H5zM9 26h3v3H9zM16 25h4v2h-4zM21 26h4v3h-4z"/></svg>`
    );
    qrImage.src = `data:image/svg+xml;utf8,${qrSvgString}`;

    qrImage.onload = () => {
      // QR Code white container
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(60, 740, 160, 160, 12);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.drawImage(qrImage, 70, 750, 140, 140);

      // Call-to-Action text next to QR Code
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('微信扫码或长按识别', 240, 780);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('一键报名参与志愿服务', 240, 815);

      ctx.fillStyle = '#64748b';
      ctx.font = '16px sans-serif';
      ctx.fillText(`推荐居民：${currentUser.name}`, 240, 850);
      ctx.fillText('完成服务即赠爱心积分兑好礼', 240, 880);

      const dataUrl = canvas.toDataURL('image/png');
      setPosterImgUrl(dataUrl);
      setIsGenerating(false);
    };

    // Fallback if image load takes time
    setTimeout(() => {
      if (isGenerating) {
        const dataUrl = canvas.toDataURL('image/png');
        setPosterImgUrl(dataUrl);
        setIsGenerating(false);
      }
    }, 300);
  };

  const handleDownloadImage = () => {
    if (!posterImgUrl) return;
    const link = document.createElement('a');
    link.download = `志愿海报_${activity.title.slice(0, 10)}_${Date.now()}.png`;
    link.href = posterImgUrl;
    link.click();
    onShowMessage('海报已开始下载！在手机微信端可直接【长按图片】保存到相册', 'success');
  };

  const handleTriggerJssdkShare = () => {
    triggerWechatMockShare(
      {
        title: `【社区志愿招募】${activity.title}`,
        desc: `诚邀参与志愿服务！可获 +${activity.pointsReward} 积分与 ${activity.hours} 小时工时，兑换大米粮油好礼！`,
        link: shareLink,
        imgUrl: posterImgUrl || `${window.location.origin}/favicon.ico`,
      },
      (msg) => onShowMessage(msg, 'info')
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl animate-scale-up border border-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="bg-red-600 text-white p-1.5 rounded-lg shadow-xs">
              <QrCode className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">生成微信志愿服务宣传海报</h3>
              <p className="text-[11px] text-slate-500">高清 H5 朋友圈传播卡片 · 带有专属推荐码</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Poster Preview Container */}
        <div className="bg-slate-900/90 rounded-2xl p-3 flex flex-col items-center justify-center relative min-h-[380px]">
          {isGenerating ? (
            <div className="text-white text-xs flex flex-col items-center space-y-2 py-12">
              <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
              <span>正在渲染高清 H5 社区志愿海报...</span>
            </div>
          ) : posterImgUrl ? (
            <div className="space-y-2 text-center w-full">
              <div className="relative group max-h-[460px] overflow-y-auto rounded-xl shadow-lg border border-slate-700">
                <img
                  src={posterImgUrl}
                  alt="志愿服务宣传海报"
                  className="w-full h-auto object-contain rounded-xl select-none"
                />
              </div>
              <p className="text-[11px] text-emerald-300 font-medium flex items-center justify-center space-x-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>手机端：长按上方海报图片即可直接【保存到相册】或【发送给微信好友】</span>
              </p>
            </div>
          ) : (
            <div className="text-red-400 text-xs">海报生成失败，请重试</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          
          <button
            onClick={handleDownloadImage}
            disabled={!posterImgUrl}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all active:scale-98 disabled:bg-slate-300"
          >
            <Download className="w-4 h-4" />
            <span>下载高清海报图片</span>
          </button>

          <button
            onClick={handleTriggerJssdkShare}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all active:scale-98"
          >
            <Share2 className="w-4 h-4" />
            <span>触发微信 JSDK 自定义卡片分享</span>
          </button>

        </div>

        {/* Tips Footer */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
          <div className="font-bold flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>海报分享收益：</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            邻里居民通过扫码此海报或访问分享链接成功报名活动，您将自动获得<b>【社区宣传达人】</b>微章与额外 <b>+10 奖励积分</b>！
          </p>
        </div>

      </div>
    </div>
  );
};
