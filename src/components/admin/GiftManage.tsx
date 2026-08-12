import React, { useState } from 'react';
import { Gift } from '../../types';
import { 
  Plus, 
  Gift as GiftIcon, 
  Edit, 
  X, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

interface GiftManageProps {
  gifts: Gift[];
  onCreateGift: (giftData: Omit<Gift, 'id' | 'createdAt'>) => Promise<string>;
  onUpdateGift: (giftId: string, updates: Partial<Gift>) => Promise<void>;
}

export const GiftManage: React.FC<GiftManageProps> = ({
  gifts,
  onCreateGift,
  onUpdateGift,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    pointsCost: 100,
    stock: 20,
    category: '生活用品',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400',
    description: '',
    status: 'on_sale' as Gift['status'],
  });

  const categories = ['生活用品', '粮油副食', '便民卡券', '文体用品'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setIsSubmitting(true);
    await onCreateGift(formData);
    setIsSubmitting(false);
    setShowCreateModal(false);
    setFormData({
      name: '',
      pointsCost: 100,
      stock: 20,
      category: '生活用品',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400',
      description: '',
      status: 'on_sale',
    });
  };

  return (
    <div className="space-y-5 pb-20 md:pb-10">
      
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">积分商城礼品与库存管理</h2>
          <p className="text-[11px] sm:text-xs text-slate-500 truncate">上架新兑换礼品，调整所需积分与补库存</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-1 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="whitespace-nowrap">上架新礼品</span>
        </button>
      </div>

      {/* Gifts List */}
      <div className="grid grid-cols-1 gap-3">
        {gifts.map((gift) => (
          <div key={gift.id} className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <img src={gift.image} alt={gift.name} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100" />
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded shrink-0">
                      {gift.category}
                    </span>
                    <button
                      onClick={() => onUpdateGift(gift.id, { status: gift.status === 'on_sale' ? 'off_sale' : 'on_sale' })}
                      className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-semibold shrink-0 transition-colors ${
                        gift.status === 'on_sale'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {gift.status === 'on_sale' ? '已上架' : '已下架'}
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{gift.name}</h4>
                  <div className="text-xs font-extrabold text-red-600">{gift.pointsCost} 积分</div>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed">{gift.description}</p>
            </div>

            {/* Stock Adjustment Controls */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-600 text-xs">库存管理:</span>
                <div className="flex items-center space-x-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                  <button
                    onClick={() => onUpdateGift(gift.id, { stock: Math.max(0, gift.stock - 1) })}
                    className="w-6 h-6 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded shadow-2xs flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <span className="w-7 text-center font-extrabold text-slate-900 text-xs">{gift.stock}</span>
                  <button
                    onClick={() => onUpdateGift(gift.id, { stock: gift.stock + 5 })}
                    className="w-6 h-6 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded shadow-2xs flex items-center justify-center text-[10px]"
                    title="+5库存"
                  >
                    +5
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-medium">
                {gift.stock === 0 ? <span className="text-red-500 font-bold">缺货</span> : <span>存货充足</span>}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* CREATE GIFT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">上架新礼品</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">礼品名称 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：多功能清洁护理套装"
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">礼品分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">所需积分 (分) *</label>
                  <input
                    type="number"
                    min={10}
                    required
                    value={formData.pointsCost}
                    onChange={(e) => setFormData({ ...formData, pointsCost: parseInt(e.target.value) || 10 })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">初始库存 (件) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 1 })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">图片链接</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">礼品规格与说明</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="例如：包含洗洁精1L + 洗手液..."
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md"
                >
                  {isSubmitting ? '上架中...' : '确认上架礼品'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
