import React from 'react';
import { 
  Home, 
  CalendarHeart, 
  ShoppingBag, 
  User, 
  PlusCircle, 
  ClipboardCheck, 
  Gift, 
  QrCode 
} from 'lucide-react';

export type ResidentTab = 'home' | 'activities' | 'mall' | 'profile';
export type AdminTab = 'activities_admin' | 'audits_admin' | 'gifts_admin' | 'verification_admin';

interface BottomNavProps {
  currentRole: 'resident' | 'admin';
  residentTab: ResidentTab;
  adminTab: AdminTab;
  onResidentTabChange: (tab: ResidentTab) => void;
  onAdminTabChange: (tab: AdminTab) => void;
  pendingAuditsCount: number;
  isMobileSimulated?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentRole,
  residentTab,
  adminTab,
  onResidentTabChange,
  onAdminTabChange,
  pendingAuditsCount,
  isMobileSimulated = false,
}) => {
  if (currentRole === 'resident') {
    const residentNavItems = [
      { id: 'home' as ResidentTab, label: '首页', icon: Home },
      { id: 'activities' as ResidentTab, label: '活动大厅', icon: CalendarHeart },
      { id: 'mall' as ResidentTab, label: '积分商城', icon: ShoppingBag },
      { id: 'profile' as ResidentTab, label: '我的记录', icon: User },
    ];

    if (isMobileSimulated) {
      return (
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-1 pt-1.5 pb-2">
          <div className="flex justify-around items-center">
            {residentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = residentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onResidentTabChange(item.id)}
                  className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all touch-manipulation active:scale-95 ${
                    isActive ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                  <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Desktop Header Subnav */}
        <div className="hidden md:block bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {residentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = residentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onResidentTabChange(item.id)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      isActive
                        ? 'border-red-600 text-red-600 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Fixed Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          <div className="flex justify-around items-center">
            {residentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = residentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onResidentTabChange(item.id)}
                  className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all touch-manipulation active:scale-95 ${
                    isActive ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                  <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  // Admin Navigation Bar
  const adminNavItems = [
    { id: 'activities_admin' as AdminTab, label: '发布与管理活动', icon: PlusCircle },
    { 
      id: 'audits_admin' as AdminTab, 
      label: '工时与积分审核', 
      icon: ClipboardCheck, 
      badge: pendingAuditsCount > 0 ? pendingAuditsCount : undefined 
    },
    { id: 'gifts_admin' as AdminTab, label: '礼品与库存管理', icon: Gift },
    { id: 'verification_admin' as AdminTab, label: '现场领奖核销', icon: QrCode },
  ];

  if (isMobileSimulated) {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-800 shadow-2xl px-1 pt-1.5 pb-2">
        <div className="flex justify-around items-center">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onAdminTabChange(item.id)}
                className={`relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all touch-manipulation active:scale-95 ${
                  isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label.slice(0, 4)}</span>
                {item.badge !== undefined && (
                  <span className="absolute top-0.5 right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-slate-900 shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Admin Header Subnav */}
      <div className="hidden md:block bg-slate-900 text-white border-b border-slate-800 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onAdminTabChange(item.id)}
                    className={`py-3 px-4 font-medium text-xs sm:text-sm flex items-center space-x-2 border-b-2 transition-all ${
                      isActive
                        ? 'border-amber-400 text-amber-400 font-semibold bg-slate-800/80'
                        : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-amber-400" />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-amber-300/80 font-mono hidden lg:inline-block">
              [管理员后台模式]
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Admin Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-800 shadow-2xl px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-around items-center">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onAdminTabChange(item.id)}
                className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all touch-manipulation active:scale-95 ${
                  isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label.slice(0, 4)}</span>
                {item.badge !== undefined && (
                  <span className="absolute top-0.5 right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-slate-900 shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
