import React, { useState } from 'react';
import { 
  User, 
  Registration, 
  ServiceRecord, 
  Redemption, 
  PointsHistoryItem,
  UserRole 
} from '../../types';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  UserPlus, 
  Search, 
  Filter, 
  Clock, 
  Coins, 
  Edit3, 
  Trash2, 
  Sliders, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Smartphone, 
  Award, 
  ChevronRight, 
  X,
  Plus,
  Minus,
  Sparkles,
  ArrowUpDown,
  History,
  Gift as GiftIcon,
  CalendarCheck,
  Flag
} from 'lucide-react';

interface UserManageProps {
  users: User[];
  registrations: Registration[];
  serviceRecords: ServiceRecord[];
  redemptions: Redemption[];
  pointsHistory: PointsHistoryItem[];
  currentUser: User | null;
  onCreateUser: (userData: Partial<User>) => Promise<{ success: boolean; data?: User; message?: string }>;
  onUpdateUser: (userId: string, updates: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  onDeleteUser: (userId: string) => Promise<{ success: boolean; message?: string }>;
  onSetUserRole: (userId: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  onAdjustPoints: (userId: string, pointsDelta: number, hoursDelta: number, reason: string, adminName: string) => Promise<{ success: boolean; message?: string }>;
}

const AVATAR_OPTIONS = ['👵', '👨‍🦰', '👮‍♂️', '👩‍⚕️', '👨‍🏫', '👩‍🌾', '🧑‍🎨', '👨‍💼', '👩‍💻', '👤', '🌟', '💖'];

export const UserManage: React.FC<UserManageProps> = ({
  users,
  registrations,
  serviceRecords,
  redemptions,
  pointsHistory,
  currentUser,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onSetUserRole,
  onAdjustPoints,
}) => {
  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'resident' | 'party_member' | 'admin'>('all');
  const [sortBy, setSortBy] = useState<'joined' | 'points' | 'hours' | 'name'>('joined');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected User for Modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Create User Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    phone: '',
    avatar: '👤',
    role: 'resident' as UserRole,
    badge: '社区志愿者',
    points: 0,
    totalHours: 0,
  });

  // Edit User Form State
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    avatar: '👤',
    role: 'resident' as UserRole,
    badge: '',
  });

  // Points & Hours Adjust Form State
  const [adjustPointsDelta, setAdjustPointsDelta] = useState<number>(0);
  const [adjustHoursDelta, setAdjustHoursDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Loading indicator for async actions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const showLocalToast = (text: string, isError: boolean = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Aggregated Stats
  const totalUsersCount = users.length;
  const residentCount = users.filter(u => u.role === 'resident').length;
  const partyMemberCount = users.filter(u => u.role === 'party_member').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const totalHoursSum = users.reduce((acc, u) => acc + (u.totalHours || 0), 0);
  const totalPointsSum = users.reduce((acc, u) => acc + (u.points || 0), 0);

  // Filtered & Sorted Users
  const filteredUsers = users
    .filter(u => {
      const matchSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm) ||
        (u.openid && u.openid.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.badge && u.badge.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchRole = roleFilter === 'all' ? true : u.role === roleFilter;
      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      if (sortBy === 'points') return (b.points || 0) - (a.points || 0);
      if (sortBy === 'hours') return (b.totalHours || 0) - (a.totalHours || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'zh-CN');
      return (b.joinedDate || '').localeCompare(a.joinedDate || '');
    });

  // Action: Open Create User Modal
  const handleOpenCreateModal = () => {
    setCreateForm({
      name: '',
      phone: '',
      avatar: '👤',
      role: 'resident',
      badge: '社区志愿者',
      points: 0,
      totalHours: 0,
    });
    setIsCreateModalOpen(true);
  };

  // Action: Submit Create User
  const handleSubmitCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.phone.trim()) {
      showLocalToast('请填写完整的姓名与手机号', true);
      return;
    }

    setIsSubmitting(true);
    const res = await onCreateUser({
      name: createForm.name.trim(),
      phone: createForm.phone.trim(),
      avatar: createForm.avatar,
      role: createForm.role,
      badge: createForm.badge.trim() || (createForm.role === 'admin' ? '社区管理员' : '社区志愿者'),
      points: Number(createForm.points) || 0,
      totalHours: Number(createForm.totalHours) || 0,
    });
    setIsSubmitting(false);

    if (res.success) {
      showLocalToast(res.message || '新用户登记成功！');
      setIsCreateModalOpen(false);
    } else {
      showLocalToast(res.message || '登记失败', true);
    }
  };

  // Action: Open Edit User Modal
  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      phone: user.phone,
      avatar: user.avatar || '👤',
      role: user.role,
      badge: user.badge || '',
    });
    setIsEditModalOpen(true);
  };

  // Action: Submit Edit User
  const handleSubmitEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      showLocalToast('姓名与手机号不能为空', true);
      return;
    }

    setIsSubmitting(true);
    const res = await onUpdateUser(selectedUser.id, {
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      avatar: editForm.avatar,
      role: editForm.role,
      badge: editForm.badge.trim(),
    });
    setIsSubmitting(false);

    if (res.success) {
      showLocalToast('用户资料更新成功！');
      setIsEditModalOpen(false);
    } else {
      showLocalToast(res.message || '更新失败', true);
    }
  };

  // Action: Set Role (resident | party_member | admin)
  const handleSetRole = async (user: User, targetRole: UserRole) => {
    if (user.role === targetRole) return;
    
    const roleLabels: Record<UserRole, string> = {
      resident: '居民志愿者',
      party_member: '党员志愿者',
      admin: '社区管理员'
    };
    const actionText = `调整身份为【${roleLabels[targetRole]}】`;

    if (user.id === currentUser?.id && targetRole !== 'admin') {
      if (!window.confirm(`警告：您正在将自己当前的管理员权限调整为${roleLabels[targetRole]}，操作后您将无法直接操作管理后台！确认继续吗？`)) {
        return;
      }
    } else if (!window.confirm(`确认将用户【${user.name}】(${user.phone}) ${actionText} 吗？`)) {
      return;
    }

    setIsSubmitting(true);
    const res = await onSetUserRole(user.id, targetRole);
    setIsSubmitting(false);

    if (res.success) {
      showLocalToast(res.message || `已成功将【${user.name}】${actionText}！`);
    } else {
      showLocalToast(res.message || '操作失败', true);
    }
  };

  // Action: Open Adjust Points Modal
  const handleOpenAdjustModal = (user: User) => {
    setSelectedUser(user);
    setAdjustPointsDelta(0);
    setAdjustHoursDelta(0);
    setAdjustReason('');
    setIsAdjustModalOpen(true);
  };

  // Action: Submit Adjust Points
  const handleSubmitAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (adjustPointsDelta === 0 && adjustHoursDelta === 0) {
      showLocalToast('请输入需要调整的积分或工时增减数值', true);
      return;
    }

    setIsSubmitting(true);
    const adminOperator = currentUser?.name || '社区管理员';
    const res = await onAdjustPoints(
      selectedUser.id,
      Number(adjustPointsDelta),
      Number(adjustHoursDelta),
      adjustReason.trim() || '管理员人工考核补录',
      adminOperator
    );
    setIsSubmitting(false);

    if (res.success) {
      showLocalToast('积分与工时已调整，变动流水已自动记入历史！');
      setIsAdjustModalOpen(false);
    } else {
      showLocalToast(res.message || '调整失败', true);
    }
  };

  // Action: Open Dossier Modal
  const handleOpenDossier = (user: User) => {
    setSelectedUser(user);
    setIsDossierModalOpen(true);
  };

  // Action: Open Delete Modal
  const handleOpenDeleteModal = (user: User) => {
    if (user.id === currentUser?.id) {
      showLocalToast('不能删除当前正在登录的管理员账号！', true);
      return;
    }
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Action: Confirm Delete User
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    const res = await onDeleteUser(selectedUser.id);
    setIsSubmitting(false);

    if (res.success) {
      showLocalToast(`用户【${selectedUser.name}】档案已成功注销删除！`);
      setIsDeleteModalOpen(false);
    } else {
      showLocalToast(res.message || '删除失败', true);
    }
  };

  // Helper for user dossier items
  const getUserRegistrations = (userId: string) => registrations.filter(r => r.userId === userId);
  const getUserServiceRecords = (userId: string) => serviceRecords.filter(r => r.userId === userId);
  const getUserRedemptions = (userId: string) => redemptions.filter(r => r.userId === userId);
  const getUserPointsHistory = (userId: string) => pointsHistory.filter(p => p.userId === userId);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center space-x-2 ${
            toastMessage.isError 
              ? 'bg-red-900 text-red-100 border-red-500/40 shadow-red-950/40' 
              : 'bg-emerald-900 text-emerald-100 border-emerald-500/40 shadow-emerald-950/40'
          }`}>
            <span>{toastMessage.isError ? '⚠️' : '✅'}</span>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">注册用户与管理员权限设置</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              管理社区注册志愿者居民档案、人工核定/调整积分工时、分配设置系统管理员权限
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 flex items-center space-x-1.5 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>手工登记新用户/志愿者</span>
            </button>
          </div>
        </div>

        {/* 6 Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-slate-800/80 mt-6">
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] text-slate-400 font-medium flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>全社区总用户</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">{totalUsersCount} <span className="text-xs font-normal text-slate-400">人</span></div>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>居民志愿者</span>
            </div>
            <div className="text-xl font-bold text-emerald-300 mt-1">{residentCount} <span className="text-xs font-normal text-slate-400">人</span></div>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-red-900/40 bg-red-950/20">
            <div className="text-[11px] text-red-400 font-medium flex items-center space-x-1">
              <Flag className="w-3.5 h-3.5 text-red-400 fill-red-400/30" />
              <span>党员志愿者</span>
            </div>
            <div className="text-xl font-bold text-red-300 mt-1">{partyMemberCount} <span className="text-xs font-normal text-slate-400">人</span></div>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] text-amber-400 font-medium flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>社区管理员</span>
            </div>
            <div className="text-xl font-bold text-amber-300 mt-1">{adminCount} <span className="text-xs font-normal text-slate-400">人</span></div>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] text-blue-400 font-medium flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>累计服务工时</span>
            </div>
            <div className="text-xl font-bold text-blue-300 mt-1">{totalHoursSum.toFixed(1)} <span className="text-xs font-normal text-slate-400">h</span></div>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] text-amber-400 font-medium flex items-center space-x-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>全社区总积分</span>
            </div>
            <div className="text-xl font-bold text-amber-300 mt-1">{totalPointsSum} <span className="text-xs font-normal text-slate-400">分</span></div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索姓名、手机号、头衔或微信 OpenID..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                roleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部 ({totalUsersCount})
            </button>
            <button
              onClick={() => setRoleFilter('resident')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                roleFilter === 'resident' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              居民 ({residentCount})
            </button>
            <button
              onClick={() => setRoleFilter('party_member')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center space-x-1 ${
                roleFilter === 'party_member' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700 hover:text-red-900 hover:bg-red-50'
              }`}
            >
              <Flag className="w-3 h-3 fill-current" />
              <span>党员志愿者 ({partyMemberCount})</span>
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                roleFilter === 'admin' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              管理员 ({adminCount})
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200/80 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-slate-700 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="joined">最新注册</option>
              <option value="points">积分从高到低</option>
              <option value="hours">工时从多到少</option>
              <option value="name">姓名排序</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Records Table & List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800 text-sm">用户档案列表</span>
            <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
              共 {filteredUsers.length} 位
            </span>
          </div>
          <span className="text-xs text-slate-400">点击用户卡片可快速发起工时调整或切换管理员权限</span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <p className="text-sm font-bold text-slate-700">未找到符合条件的用户</p>
            <p className="text-xs text-slate-400">可尝试更换搜索关键词或清空身份筛选</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((user) => {
              const isAdmin = user.role === 'admin';
              const userRegs = getUserRegistrations(user.id);
              const userRecs = getUserServiceRecords(user.id);
              const userReds = getUserRedemptions(user.id);

              return (
                <div 
                  key={user.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Avatar & Basic Info */}
                  <div className="flex items-start sm:items-center space-x-3.5 min-w-[260px]">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl border border-slate-200 shadow-xs">
                        {user.avatar || '👤'}
                      </div>
                      {isAdmin && (
                        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-lg shadow-xs" title="社区管理员">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">{user.name}</span>
                        
                        {/* Role Badge */}
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-bold">
                            <ShieldCheck className="w-3 h-3 text-amber-700" />
                            <span>管理员</span>
                          </span>
                        ) : user.role === 'party_member' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-red-100 text-red-800 border border-red-300 rounded-lg text-[10px] font-bold">
                            <Flag className="w-3 h-3 text-red-600 fill-current" />
                            <span>党员志愿者</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold">
                            <span>居民志愿者</span>
                          </span>
                        )}

                        {/* Honor Badge */}
                        {user.badge && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-medium border border-slate-200">
                            {user.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-500 flex-wrap gap-y-1">
                        <span className="font-mono">{user.phone}</span>
                        <span>·</span>
                        <span>注册: {user.joinedDate || '2025-01-01'}</span>
                        {user.openid ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            <Smartphone className="w-2.5 h-2.5" />
                            <span>微信已绑定</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">未绑定微信</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Stats & Records Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center text-xs">
                    <div className="px-2">
                      <div className="text-[10px] text-slate-400">可用积分</div>
                      <div className="font-bold text-red-600 text-sm">{user.points || 0} <span className="text-[10px] font-normal">分</span></div>
                    </div>
                    <div className="px-2">
                      <div className="text-[10px] text-slate-400">累计工时</div>
                      <div className="font-bold text-blue-600 text-sm">{(user.totalHours || 0).toFixed(1)} <span className="text-[10px] font-normal">h</span></div>
                    </div>
                    <div className="px-2">
                      <div className="text-[10px] text-slate-400">报名活动</div>
                      <div className="font-bold text-slate-700 text-sm">{userRegs.length} <span className="text-[10px] font-normal">场</span></div>
                    </div>
                    <div className="px-2">
                      <div className="text-[10px] text-slate-400">礼品兑换</div>
                      <div className="font-bold text-slate-700 text-sm">{userReds.length} <span className="text-[10px] font-normal">件</span></div>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    {/* Fast Role Setting Selector */}
                    <select
                      value={user.role}
                      disabled={isSubmitting}
                      onChange={(e) => handleSetRole(user, e.target.value as UserRole)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all focus:outline-none ${
                        user.role === 'admin' 
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300' 
                          : user.role === 'party_member'
                          ? 'bg-red-50 hover:bg-red-100 text-red-900 border-red-300'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                      title="点击快速切换并设置该用户的身份角色"
                    >
                      <option value="resident">👤 居民志愿者</option>
                      <option value="party_member">🚩 党员志愿者</option>
                      <option value="admin">🛡️ 社区管理员</option>
                    </select>

                    {/* Adjust Points & Hours */}
                    <button
                      onClick={() => handleOpenAdjustModal(user)}
                      className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all"
                      title="人工增减积分与工时"
                    >
                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                      <span>积分/工时调整</span>
                    </button>

                    {/* Edit Profile */}
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200"
                      title="编辑用户基本资料"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* View Dossier */}
                    <button
                      onClick={() => handleOpenDossier(user)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200"
                      title="查看完整志愿与积分档案"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleOpenDeleteModal(user)}
                      disabled={user.id === currentUser?.id}
                      className={`p-2 rounded-xl text-xs font-semibold border ${
                        user.id === currentUser?.id 
                          ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed' 
                          : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200 cursor-pointer'
                      }`}
                      title={user.id === currentUser?.id ? '当前登录管理员不可删除' : '注销/删除用户档案'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= MODAL: CREATE USER ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-up my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">手工登记新居民/志愿者档案</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">居民/志愿者真实姓名 *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="例如：陈秀珍、张建民"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">联系手机号 *</label>
                <input
                  type="text"
                  required
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="例如：13812345678"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">系统身份角色 *</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      const defaultBadge = newRole === 'admin' ? '社区管理员' : newRole === 'party_member' ? '党员先锋志愿者' : '社区志愿者';
                      setCreateForm({ ...createForm, role: newRole, badge: defaultBadge });
                    }}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="resident">👤 居民志愿者</option>
                    <option value="party_member">🚩 党员志愿者 (党支部先锋岗)</option>
                    <option value="admin">🛡️ 社区管理员 (具有后台权限)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">社区荣誉头衔</label>
                  <input
                    type="text"
                    value={createForm.badge}
                    onChange={(e) => setCreateForm({ ...createForm, badge: e.target.value })}
                    placeholder="例如：社区志愿骨干、环保卫士"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">选择头像标识</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      type="button"
                      key={av}
                      onClick={() => setCreateForm({ ...createForm, avatar: av })}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                        createForm.avatar === av ? 'border-amber-500 bg-amber-50 scale-110 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">初始积分 (分)</label>
                  <input
                    type="number"
                    min="0"
                    value={createForm.points}
                    onChange={(e) => setCreateForm({ ...createForm, points: parseInt(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">历史服务工时 (小时)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={createForm.totalHours}
                    onChange={(e) => setCreateForm({ ...createForm, totalHours: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md cursor-pointer"
                >
                  <span>{isSubmitting ? '正在登记...' : '确认登记入库'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT USER ================= */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">编辑用户资料</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEditUser} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">姓名 *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">手机号 *</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">身份角色 *</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="resident">👤 居民志愿者</option>
                    <option value="party_member">🚩 党员志愿者</option>
                    <option value="admin">🛡️ 社区管理员</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">社区荣誉头衔</label>
                  <input
                    type="text"
                    value={editForm.badge}
                    onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">选择头像</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      type="button"
                      key={av}
                      onClick={() => setEditForm({ ...editForm, avatar: av })}
                      className={`w-8 h-8 rounded-xl text-base flex items-center justify-center border transition-all cursor-pointer ${
                        editForm.avatar === av ? 'border-blue-500 bg-blue-50 scale-110 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md cursor-pointer"
                >
                  <span>{isSubmitting ? '保存中...' : '保存更新'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADJUST POINTS & HOURS ================= */}
      {isAdjustModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">人工调整积分与工时</h3>
              </div>
              <button onClick={() => setIsAdjustModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target User Info Header */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center space-x-3 text-xs">
              <span className="text-2xl">{selectedUser.avatar || '👤'}</span>
              <div>
                <div className="font-bold text-slate-900">{selectedUser.name} ({selectedUser.phone})</div>
                <div className="text-slate-500 text-[11px] flex items-center space-x-2 mt-0.5">
                  <span>当前积分: <strong className="text-red-600">{selectedUser.points} 分</strong></span>
                  <span>·</span>
                  <span>当前工时: <strong className="text-blue-600">{selectedUser.totalHours} 小时</strong></span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitAdjustPoints} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  积分增减 (正数增加，负数扣减)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={adjustPointsDelta}
                    onChange={(e) => setAdjustPointsDelta(parseInt(e.target.value) || 0)}
                    className="flex-1 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="+50 或 -30"
                  />
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => setAdjustPointsDelta(prev => prev + 20)}
                      className="px-2 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer"
                    >
                      +20
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustPointsDelta(prev => prev + 50)}
                      className="px-2 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer"
                    >
                      +50
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustPointsDelta(prev => prev - 20)}
                      className="px-2 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer"
                    >
                      -20
                    </button>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  调整后预计积分: <strong className="text-slate-800">{Math.max(0, selectedUser.points + adjustPointsDelta)} 分</strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  工时增减 (小时，正数增加，负数扣减)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={adjustHoursDelta}
                  onChange={(e) => setAdjustHoursDelta(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="+2.0 或 -1.0"
                />
                <div className="text-[10px] text-slate-400 mt-1">
                  调整后预计工时: <strong className="text-slate-800">{Math.max(0, Number((selectedUser.totalHours + adjustHoursDelta).toFixed(1)))} 小时</strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">调整原因与依据说明 *</label>
                <textarea
                  rows={2}
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="例如：参与突发防汛抗旱应急志愿加分、特殊贡献奖励、人工校对纠错..."
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (adjustPointsDelta === 0 && adjustHoursDelta === 0) || !adjustReason.trim()}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? '提交调整中...' : '确认执行调整'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: USER VOLUNTEER DOSSIER ================= */}
      {isDossierModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-scale-up my-8 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">【{selectedUser.name}】志愿与积分综合档案</h3>
                  <div className="text-[11px] text-slate-400">
                    手机号: {selectedUser.phone} · 身份: {
                      selectedUser.role === 'admin' 
                        ? '社区管理员' 
                        : selectedUser.role === 'party_member' 
                        ? '党员志愿者 (先锋模范)' 
                        : '普通居民志愿者'
                    }
                  </div>
                </div>
              </div>
              <button onClick={() => setIsDossierModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
              {/* Top Quick Stats */}
              <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                <div>
                  <div className="text-[10px] text-slate-400">可用积分</div>
                  <div className="font-bold text-red-600 text-sm">{selectedUser.points} 分</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">累计工时</div>
                  <div className="font-bold text-blue-600 text-sm">{selectedUser.totalHours} h</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">活动报名</div>
                  <div className="font-bold text-slate-800 text-sm">{getUserRegistrations(selectedUser.id).length} 次</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">兑换礼品</div>
                  <div className="font-bold text-slate-800 text-sm">{getUserRedemptions(selectedUser.id).length} 件</div>
                </div>
              </div>

              {/* 1. Points Flow History */}
              <div className="space-y-2">
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <History className="w-4 h-4 text-red-500" />
                  <span>积分变动流水记录</span>
                </div>
                {getUserPointsHistory(selectedUser.id).length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl text-center text-slate-400 text-[11px]">
                    暂无积分变动流水记录
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {getUserPointsHistory(selectedUser.id).map(pts => (
                      <div key={pts.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800">{pts.title}</div>
                          <div className="text-[10px] text-slate-400">{pts.createdAt} · {pts.description}</div>
                        </div>
                        <span className={`font-bold font-mono text-xs ${pts.type === 'earn' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {pts.type === 'earn' ? `+${pts.amount}` : `-${pts.amount}`} 分
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Activity Registrations */}
              <div className="space-y-2">
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <CalendarCheck className="w-4 h-4 text-blue-500" />
                  <span>活动报名记录 ({getUserRegistrations(selectedUser.id).length})</span>
                </div>
                {getUserRegistrations(selectedUser.id).length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl text-center text-slate-400 text-[11px]">
                    暂无活动报名记录
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {getUserRegistrations(selectedUser.id).map(reg => (
                      <div key={reg.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800">{reg.activityTitle}</div>
                          <div className="text-[10px] text-slate-400">报名时间: {reg.signedAt}</div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                            工时 {reg.hours}h / +{reg.pointsReward}分
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Gift Redemptions */}
              <div className="space-y-2">
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <GiftIcon className="w-4 h-4 text-amber-500" />
                  <span>礼品兑换与核销记录 ({getUserRedemptions(selectedUser.id).length})</span>
                </div>
                {getUserRedemptions(selectedUser.id).length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl text-center text-slate-400 text-[11px]">
                    暂无礼品兑换记录
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {getUserRedemptions(selectedUser.id).map(red => (
                      <div key={red.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800">{red.giftName} (消耗 {red.pointsCost} 分)</div>
                          <div className="text-[10px] text-slate-400">核销码: <strong className="font-mono text-slate-700">{red.code}</strong> · 兑换于: {red.createdAt}</div>
                        </div>
                        <div>
                          {red.status === 'redeemed' ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                              已核销 ({red.verifierName || '管理员'})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
                              待核销领奖
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setIsDossierModalOpen(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                关闭档案窗口
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE USER CONFIRM ================= */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-scale-up text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto text-2xl">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-900 text-base">确认删除/注销用户档案？</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                即将删除用户【<strong className="text-slate-800">{selectedUser.name}</strong>】({selectedUser.phone})。删除后其积分与工时数据将被清空。
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-xs cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                <span>{isSubmitting ? '删除中...' : '确认删除'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
