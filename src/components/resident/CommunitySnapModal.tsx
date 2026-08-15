import React, { useState } from 'react';
import { User, IssueCategory, CommunityIssue } from '../../types';
import { 
  Camera, 
  X, 
  MapPin, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Image as ImageIcon,
  Navigation,
  Send
} from 'lucide-react';

interface CommunitySnapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSubmit: (issueData: Omit<CommunityIssue, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean; message?: string }>;
  onOpenLoginModal?: (prompt?: string) => void;
}

const CATEGORIES: { id: IssueCategory; label: string; icon: string; desc: string }[] = [
  { id: '环境卫生', label: '环境卫生', icon: '🧹', desc: '垃圾满溢、卫生死角、异味污水' },
  { id: '设施破损', label: '设施破损', icon: '🛠️', desc: '路灯不亮、井盖损坏、健身器材坏' },
  { id: '安全隐患', label: '安全隐患', icon: '🚨', desc: '飞线充电、消防通道堵塞、电线外露' },
  { id: '车辆违停', label: '车辆违停', icon: '🚗', desc: '机动车占道、电动车违规入楼' },
  { id: '楼道堆物', label: '楼道堆物', icon: '📦', desc: '楼道堆积纸箱杂物、易燃品' },
  { id: '其它诉求', label: '其它诉求', icon: '💬', desc: '邻里噪音、绿化修剪、公约建议' },
];

const PRESET_LOCATIONS = [
  '幸福小区1期中心广场',
  '2号楼1单元东侧入户门',
  '3号楼垃圾分类定时投放点',
  '幸福小区地下车库B区入口',
  '中央绿化带景观凉亭',
  '社区党群服务中心门前',
  '幸福幼儿园西侧人行道',
];

const PRESET_SAMPLE_PHOTOS = [
  {
    title: '垃圾箱满溢',
    url: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&q=80&w=600',
    category: '环境卫生' as IssueCategory,
    presetTitle: '垃圾分类点垃圾桶满溢散落',
    presetDesc: '垃圾箱已满未及时清运，周边地面有散落垃圾，异味较大，请及时安排保洁清运。'
  },
  {
    title: '路灯照明损坏',
    url: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&q=80&w=600',
    category: '设施破损' as IssueCategory,
    presetTitle: '地下通道及转角处顶灯接触不良闪烁',
    presetDesc: '转角处路灯/顶灯损坏不亮，夜间通行视线昏暗，老人行走存在绊倒安全隐患，建议更换灯泡。'
  },
  {
    title: '休闲木椅松动',
    url: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&q=80&w=600',
    category: '安全隐患' as IssueCategory,
    presetTitle: '休闲长椅木条螺丝松动翘起',
    presetDesc: '长椅一侧木条翘起，边缘有毛刺，容易划破居民衣物或伤到小孩，需加固维修。'
  },
  {
    title: '楼道杂物堆积',
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600',
    category: '楼道堆物' as IssueCategory,
    presetTitle: '楼道消防通道堆放纸箱和旧家具',
    presetDesc: '3楼至4楼缓步台堆放大量废旧纸箱与杂物，阻碍消防逃生通道，存在火灾安全隐患。'
  }
];

export const CommunitySnapModal: React.FC<CommunitySnapModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmit,
  onOpenLoginModal,
}) => {
  const [category, setCategory] = useState<IssueCategory>('环境卫生');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('幸福小区1期中心广场');
  const [locationDetail, setLocationDetail] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('上传图片大小不能超过 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImages(prev => [...prev.slice(0, 2), event.target!.result as string]);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick apply sample photo
  const handleApplyPresetPhoto = (preset: typeof PRESET_SAMPLE_PHOTOS[0]) => {
    setImages(prev => [...prev.filter(img => img !== preset.url).slice(0, 2), preset.url]);
    setCategory(preset.category);
    if (!title) setTitle(preset.presetTitle);
    if (!description) setDescription(preset.presetDesc);
  };

  // Simulate smart GPS locating
  const handleAutoLocate = () => {
    setIsLocating(true);
    setTimeout(() => {
      const randomLoc = PRESET_LOCATIONS[Math.floor(Math.random() * PRESET_LOCATIONS.length)];
      setLocation(randomLoc);
      setLocationDetail('GPS精确坐标: 东经121°28′ 北纬31°14′ (幸福网格03号)');
      setIsLocating(false);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLoginModal?.('请先登录居民账号，方可提交随手拍并获取爱心积分');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('请填写问题简述标题');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('请详细描述现场问题情况');
      return;
    }

    if (!location.trim()) {
      setErrorMessage('请选择或填写问题发生的具体地址位置');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const issueImages = images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&q=80&w=600'
      ];

      const res = await onSubmit({
        userId: currentUser.id,
        userName: currentUser.name,
        userPhone: currentUser.phone,
        userAvatar: currentUser.avatar,
        userRole: currentUser.role,
        title: title.trim(),
        category,
        description: description.trim(),
        images: issueImages,
        location: location.trim(),
        locationDetail: locationDetail.trim(),
        pointsReward: 15,
      });

      if (res.success) {
        // Reset form
        setTitle('');
        setDescription('');
        setImages([]);
        setLocationDetail('');
        onClose();
      } else {
        setErrorMessage(res.message || '提交失败，请重试');
      }
    } catch (err: any) {
      setErrorMessage(err.message || '网络异常，提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-4 sm:p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 text-white">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">邻里随手拍 · 身边事速通</h3>
                <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                  +15 积分
                </span>
              </div>
              <p className="text-xs text-red-100 mt-0.5">
                发现社区问题拍一拍，网格员火速响应整改，采纳即奖爱心积分！
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-slate-800 text-sm max-h-[80vh] overflow-y-auto">
          
          {/* Error Prompt */}
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Category Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>1. 选择问题分类 <span className="text-red-500">*</span></span>
              <span className="text-[11px] font-normal text-slate-400">选择对应的社区诉求类型</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-center sm:items-start text-center sm:text-left cursor-pointer ${
                    category === cat.id
                      ? 'bg-red-50 border-red-500 text-red-700 font-bold shadow-xs ring-1 ring-red-400'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg mb-0.5">{cat.icon}</span>
                  <span className="text-xs font-semibold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Photo Upload / Snapshot Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                2. 上传现场照片 <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">支持手机拍照或上传 (最多3张)</span>
            </div>

            {/* Photo List Preview */}
            <div className="grid grid-cols-3 gap-2.5">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                  <img src={imgUrl} alt="现场照片" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full p-1 shadow-sm opacity-90 hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {images.length < 3 && (
                <label className="aspect-video rounded-xl border-2 border-dashed border-slate-200 hover:border-red-400 hover:bg-red-50/50 transition-colors flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-red-600 p-2 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Camera className="w-5 h-5 mb-1" />
                  <span className="text-[11px] font-medium">拍照 / 上传</span>
                </label>
              )}
            </div>

            {/* Quick Demo Sample Photos */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
              <div className="text-[11px] font-medium text-slate-500 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>快速体验：可一键选用常见现场快照案例</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SAMPLE_PHOTOS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPresetPhoto(preset)}
                    className="text-[10px] sm:text-[11px] bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <span>📷</span>
                    <span>{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Title & Description */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                3. 问题简述标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="例如：2号楼东侧垃圾桶满溢散落 / 顶灯接触不良"
                maxLength={40}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  4. 问题详细说明 <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">{description.length}/200 字</span>
              </div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="请详细描述问题现场的具体状况、影响范围或您建议的整改措施..."
                rows={3}
                maxLength={200}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>

          {/* 4. Location Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>5. 问题具体地理位置 <span className="text-red-500">*</span></span>
              </label>
              <button
                type="button"
                onClick={handleAutoLocate}
                disabled={isLocating}
                className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? '定位中...' : '📍 重新智能定位'}</span>
              </button>
            </div>

            {/* Quick Location Chips */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_LOCATIONS.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    location === loc
                      ? 'bg-red-100/70 border-red-400 text-red-800 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            {/* Custom Location Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="所在区域/楼栋 (如：幸福小区3号楼)"
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
              />
              <input
                type="text"
                value={locationDetail}
                onChange={e => setLocationDetail(e.target.value)}
                placeholder="具体门牌/单元/方位 (选填，如：东单元20米处)"
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Reward Reminder */}
          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 flex items-start space-x-2.5 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-bold">积分激励说明：</span>
              <p className="text-[11px] text-amber-800">
                所上报线索经居委会核实采纳、网格员跟进办结后，系统将自动向您的账户发放 <span className="font-bold text-red-600">+15 爱心积分</span>！
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? '正在提交网格办...' : '立即上报随手拍'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
