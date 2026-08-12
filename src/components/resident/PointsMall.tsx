import React, { useState } from 'react';
import { Gift, User, Redemption } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  ShoppingBag, 
  Gift as GiftIcon, 
  X, 
  QrCode, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  ChevronRight,
  MapPin
} from 'lucide-react';

interface PointsMallProps {
  currentUser: User;
  gifts: Gift[];
  onRedeemGift: (gift: Gift) => Promise<{ success: boolean; message: string; redemption?: Redemption }>;
  onNavigateToRedemptions: () => void;
}

export const PointsMall: React.FC<PointsMallProps> = ({
  currentUser,
  gifts,
  onRedeemGift,
  onNavigateToRedemptions,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [confirmModalGift, setConfirmModalGift] = useState<Gift | null>(null);
  const [successRedemption, setSuccessRedemption] = useState<Redemption | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const categories = ['全部', '生活用品', '粮油副食', '便民卡券', '文体用品'];

  const filteredGifts = gifts.filter(g => {
    const isCategoryMatch = selectedCategory === '全部' || g.category === selectedCategory;
    return isCategoryMatch && g.status === 'on_sale';
  });

  const handleConfirmRedeem = async () => {
    if (!confirmModalGift) return;
    setIsRedeeming(true);
    setErrorToast(null);

    const res = await onRedeemGift(confirmModalGift);
    setIsRedeeming(false);

    if (res.success && res.redemption) {
      setConfirmModalGift(null);
      setSuccessRedemption(res.redemption);
      // Trigger confetti celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      setErrorToast(res.message);
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-10">
      
      {/* Balance Top Card */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 rounded-3xl text-white p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none">
          <GiftIcon className="w-56 h-56 text-white" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-amber-100">
              <ShoppingBag className="w-4 h-4 text-amber-200" />
              <span>积分商城 · 凭积分免费兑换礼品</span>
            </div>
            <div className="flex items-baseline space-x-1 pt-1">
              <span className="text-4xl font-extrabold text-white">{currentUser.points}</span>
              <span className="text-sm font-medium text-amber-100">可用积分</span>
            </div>
          </div>

          <button
            onClick={onNavigateToRedemptions}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1 shadow-xs"
          >
            <QrCode className="w-4 h-4" />
            <span>我的兑换卷</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-900 font-bold shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error toast */}
      {errorToast && (
        <div className="bg-red-600 text-white p-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md">
          <span>{errorToast}</span>
          <button onClick={() => setErrorToast(null)} className="p-1 hover:bg-white/20 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Gifts Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {filteredGifts.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-8 text-center text-slate-400 space-y-2 border border-slate-200">
            <div className="text-3xl">🎁</div>
            <p className="text-xs">该分类下暂无上架礼品</p>
          </div>
        ) : (
          filteredGifts.map((gift) => {
            const canAfford = currentUser.points >= gift.pointsCost;
            const hasStock = gift.stock > 0;

            return (
              <div
                key={gift.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Gift Image */}
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                    <img
                      src={gift.image}
                      alt={gift.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-slate-900/75 text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                      {gift.category}
                    </span>
                    <span className={`absolute top-1.5 right-1.5 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      hasStock ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {hasStock ? `库存 ${gift.stock}` : '已售罄'}
                    </span>
                  </div>

                  {/* Gift Info */}
                  <div className="p-2.5 space-y-1">
                    <h4 className="font-bold text-slate-800 text-xs truncate">
                      {gift.name}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-2 leading-tight">
                      {gift.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="p-2.5 pt-0 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm sm:text-base font-extrabold text-red-600">
                      {gift.pointsCost} <span className="text-[10px] font-semibold">积分</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setConfirmModalGift(gift)}
                    disabled={!canAfford || !hasStock}
                    className={`w-full py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                      canAfford && hasStock
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {!hasStock ? '无货' : !canAfford ? '积分不足' : '使用积分兑换'}
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Redemption Confirm Modal */}
      {confirmModalGift && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">确认积分兑换礼品</h3>
              <button onClick={() => setConfirmModalGift(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <img src={confirmModalGift.image} alt={confirmModalGift.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div>
                <h4 className="font-bold text-slate-900 text-xs">{confirmModalGift.name}</h4>
                <div className="text-xs font-extrabold text-red-600 mt-1">需要 {confirmModalGift.pointsCost} 积分</div>
              </div>
            </div>

            {/* Points Deduction Preview */}
            <div className="bg-amber-50 text-amber-950 p-3.5 rounded-2xl text-xs space-y-1.5 border border-amber-200">
              <div className="flex justify-between">
                <span className="text-slate-600">当前可用积分：</span>
                <span className="font-bold">{currentUser.points} 分</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>扣除礼品积分：</span>
                <span className="font-bold">-{confirmModalGift.pointsCost} 分</span>
              </div>
              <div className="pt-1.5 border-t border-amber-200/60 flex justify-between font-bold text-slate-900">
                <span>兑换后剩余：</span>
                <span className="text-emerald-700">{currentUser.points - confirmModalGift.pointsCost} 分</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-xl space-y-0.5">
              <div className="font-semibold text-slate-700">领奖提示：</div>
              <div>兑换成功后将生成唯一核销二维码/兑换码，请前往党群中心现场展示核销领奖。</div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => setConfirmModalGift(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                再想想
              </button>
              <button
                onClick={handleConfirmRedeem}
                disabled={isRedeeming}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all"
              >
                {isRedeeming ? '兑换中...' : '确认兑换'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL WITH QR CODE & CODE DISPLAY */}
      {successRedemption && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-scale-up border border-amber-200">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">兑换成功！已生成核销凭证</h3>
              <p className="text-xs text-slate-500">《{successRedemption.giftName}》</p>
            </div>

            {/* QR CODE BOX */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center space-y-3">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100">
                <QRCodeSVG
                  value={successRedemption.code}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Unique 8-digit Code */}
              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-400 font-medium">现场核销兑换码</div>
                <div className="text-lg font-mono font-extrabold text-red-600 tracking-wider bg-red-50 border border-red-200 px-3 py-1 rounded-lg">
                  {successRedemption.code}
                </div>
              </div>
            </div>

            <div className="text-left text-[11px] text-slate-500 bg-amber-50 p-3 rounded-xl border border-amber-100 space-y-1">
              <div className="font-bold text-amber-900 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>领奖地点：幸福社区党群服务中心1楼大厅</span>
              </div>
              <div>请将上方二维码或核销码出示给管理员现场核销即可领取礼品。</div>
            </div>

            <button
              onClick={() => {
                setSuccessRedemption(null);
                onNavigateToRedemptions();
              }}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              去我的兑换卷查看
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
