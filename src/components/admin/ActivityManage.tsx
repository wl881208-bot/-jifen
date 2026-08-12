import React, { useState } from 'react';
import { Activity, Registration } from '../../types';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  X, 
  Check, 
  Calendar, 
  MapPin, 
  Award, 
  Clock, 
  Building 
} from 'lucide-react';

interface ActivityManageProps {
  activities: Activity[];
  registrations: Registration[];
  onCreateActivity: (activityData: Omit<Activity, 'id' | 'createdAt' | 'signedCount'>) => Promise<string>;
  onUpdateActivity: (activityId: string, updates: Partial<Activity>) => Promise<void>;
  onDeleteActivity: (activityId: string) => Promise<void>;
}

export const ActivityManage: React.FC<ActivityManageProps> = ({
  activities,
  registrations,
  onCreateActivity,
  onUpdateActivity,
  onDeleteActivity,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewRegistrationsActivity, setViewRegistrationsActivity] = useState<Activity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: '',
    hours: 2.0,
    pointsReward: 40,
    maxSeats: 20,
    category: '环保卫士',
    description: '',
    organizer: '幸福社区党群服务中心',
    status: 'recruiting' as Activity['status'],
  });

  const categories = ['环保卫士', '关爱邻里', '平安社区', '便民服务', '文明创建'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location || !formData.date) return;
    setIsSubmitting(true);
    await onCreateActivity(formData);
    setIsSubmitting(false);
    setShowCreateModal(false);
    setFormData({
      title: '',
      location: '',
      date: '',
      hours: 2.0,
      pointsReward: 40,
      maxSeats: 20,
      category: '环保卫士',
      description: '',
      organizer: '幸福社区党群服务中心',
      status: 'recruiting',
    });
  };

  return (
    <div className="space-y-5 pb-20 md:pb-10">
      
      {/* Top Banner & Release Button */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">社区志愿服务活动管理</h2>
          <p className="text-xs text-slate-500">创建新服务活动，设置奖励积分、名额与工时</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>发布新活动</span>
        </button>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {activities.map((act) => {
          const registeredUsers = registrations.filter(r => r.activityId === act.id);

          return (
            <div
              key={act.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-red-100">
                      {act.category}
                    </span>
                    <select
                      value={act.status}
                      onChange={(e) => onUpdateActivity(act.id, { status: e.target.value as Activity['status'] })}
                      className="bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-md focus:outline-none"
                    >
                      <option value="recruiting">招募中</option>
                      <option value="in_progress">进行中</option>
                      <option value="completed">已结束</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{act.title}</h3>
                </div>

                <div className="flex items-center space-x-1 text-xs">
                  <button
                    onClick={() => setViewRegistrationsActivity(act)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center space-x-1 font-semibold"
                    title="查看已报名人员"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{act.signedCount}/{act.maxSeats}人</span>
                  </button>
                  <button
                    onClick={() => onDeleteActivity(act.id)}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                    title="删除活动"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl">
                <div>📍 地点: {act.location}</div>
                <div>⏰ 时间: {act.date}</div>
                <div>🎁 奖励: <span className="font-bold text-red-600">+{act.pointsReward} 积分</span> | 工时: <span className="font-bold text-emerald-700">{act.hours} 小时</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE ACTIVITY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">发布新志愿服务活动</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">活动名称 *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：社区垃圾分类巡查宣传"
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">服务分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">招募名额 (人) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.maxSeats}
                    onChange={(e) => setFormData({ ...formData, maxSeats: parseInt(e.target.value) || 1 })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">服务地点 *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="例如：幸福社区1号广场"
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">服务时间 *</label>
                <input
                  type="text"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="例如：2026-08-10 09:00 - 11:30"
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">预计服务工时 (小时) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min={0.5}
                    required
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) || 0.5 })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">积分奖励 (分) *</label>
                  <input
                    type="number"
                    min={5}
                    required
                    value={formData.pointsReward}
                    onChange={(e) => setFormData({ ...formData, pointsReward: parseInt(e.target.value) || 10 })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">活动要求与描述</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入活动详细要求、集合地点、注意事项等..."
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
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
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md"
                >
                  {isSubmitting ? '发布中...' : '确认发布活动'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW REGISTERED RESIDENTS MODAL */}
      {viewRegistrationsActivity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">报名人员名单</h3>
              <button onClick={() => setViewRegistrationsActivity(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800">{viewRegistrationsActivity.title}</div>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {registrations.filter(r => r.activityId === viewRegistrationsActivity.id).length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">暂无居民报名该活动</div>
                ) : (
                  registrations.filter(r => r.activityId === viewRegistrationsActivity.id).map((r) => (
                    <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{r.userName}</div>
                        <div className="text-[10px] text-slate-400">{r.userPhone}</div>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold text-[10px]">
                        {r.signedAt} 报名
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setViewRegistrationsActivity(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
            >
              关闭
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
