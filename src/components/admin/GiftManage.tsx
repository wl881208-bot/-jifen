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
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">积分商城礼品与库存管理</h2>
          <p className="text-xs text-slate-500">上架新兑换礼品，调整所需积分与补库存</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>上架新礼品</span>
        </button>
      </div>

      {/* Gifts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gifts.map((gift) => (
          <div key={gift.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <img src={gift.image} alt={gift.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="space-y-0.5">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                    {gift.category}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{gift.name}</h4>
                  <div className="text-xs font-extrabold text-red-600">{gift.pointsCost} 积分</div>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2">{gift.description}</p>
            </div>

            {/* Stock Adjustment Controls */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-slate-600">库存:</span>
                <div className="flex items-center space-x-1 border border-slate-200 rounded-lg p-0.5">
                  <button
                    onClick={() => onUpdateGift(gift.id, { stock: Math.max(0, gift.stock - 1) })}
                    className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-slate-900">{gift.stock}</span>
                  <button
                    onClick={() => onUpdateGift(gift.id, { stock: gift.stock + 5 })}
                    className="w-6 h-6 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded flex items-center justify-center"
                    title="+5库存"
                  >
                    +5
                  </button>
                </div>
              </div>

              <button
                onClick={() => onUpdateGift(gift.id, { status: gift.status === 'on_sale' ? 'off_sale' : 'on_sale' })}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  gift.status === 'on_sale'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {gift.status === 'on_sale' ? '已上架' : '已下架'}
              </button>
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
