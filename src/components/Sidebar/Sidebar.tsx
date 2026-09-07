import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavigationItem from './NavigationItem';
import { navigationItems } from '../../config/navigation';
import { LogoutIcon } from '@/assets/icons';
import TeamUpIcon from '@/assets/TeamUp.png';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuthStore } from '@/store/authStore';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { canAccessTab, hasPermission, isSuperAdmin, hasRole } = usePermissions();
  const logout = useAuthStore((state) => state.logout);

  const allowedItems = navigationItems.filter((item) => {
    // Check specific role restrictions if defined on the navigation item
    if (item.roles && item.roles.length > 0) {
      if (!hasRole(item.roles)) {
        return false;
      }
    }

    if (isSuperAdmin) return true;
    if (item.tabId && canAccessTab(item.tabId)) return true;
    if (item.permission && hasPermission(item.permission)) return true;
    return canAccessTab(item.id);
  });

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div 
      className="h-screen overflow-y-auto overflow-x-hidden flex flex-col text-white border-r border-[#3A3530] fixed left-0 top-0 sidebar-scrollbar" 
      style={{ width: '248px', padding: '40px 4px' }}
    >
      {/* Main Content Container */}
      <div className="flex flex-col gap-8 w-60 h-full">
        {/* Logo Section */}
        <div className="flex flex-col items-center w-60 shrink-0">
          <div 
            className="w-[150px] h-[61px] cursor-pointer hover:opacity-80 transition-opacity duration-200" 
            onClick={() => navigate('/')}
          >
            <img src={TeamUpIcon} alt='TeamUP' />
          </div>
        </div>

        {/* Navigation Menu - Scrollable */}
        <div className="flex-1">
          <nav className="flex flex-col gap-2 w-60 pr-2">
            {allowedItems.map((item) => (
              <NavigationItem
                key={item.id}
                path={item.path}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.path}
              />
            ))}
          </nav>
        </div>

        {/* Logout Section */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-col items-start p-4 gap-2.5 w-60 h-14 rounded-xl transition-all duration-200 hover:bg-red-900/20 smooth-transition focus-ring"
          >
            <div className="flex items-center gap-3 w-52 h-6">
              <LogoutIcon size={24} className="text-[#FB3748]" />
              <span className="font-medium text-xs leading-[18px] text-[#7E0B0B]">
                Logout
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
