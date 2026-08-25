import React, { useState } from 'react';
import DummyProfile from '@/assets/Avatar.jpg'
import { StarFilledIcon } from '@/assets/icons';
import { useAuthStore } from '@/store/authStore';

const UserProfile: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const userName = user?.name || 'Guest';
  const userRole = user?.role || 'Member';

  return (
    <div className="relative user-profile">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-end gap-3 w-[148px] h-14 hover:opacity-80 transition-opacity duration-200"
      >
        {/* User Avatar */}
        <div className="relative user-avatar">
          <div className=" bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-semibold"><img className='rounded-full' src={DummyProfile} alt={userName} /></span>
          </div>
          {/* Online status indicator */}
          <div className='absolute -right-2 top-0'><StarFilledIcon /></div>
          <div className="status-indicator"></div>
        </div>

        {/* User Info */}
        <div className="flex flex-col items-start w-[51px]">
          <div className="font-bold text-base leading-6 text-white truncate max-w-[51px]">{userName}</div>
          <div className="text-sm leading-[17px] text-[#9EA2AD] truncate max-w-[51px]">{userRole}</div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            <div className="px-3 py-2 border-b border-neutral-100">
              <div className="text-sm font-medium text-neutral-900">{userName}</div>
              <div className="text-xs text-neutral-500">{userRole}</div>
            </div>

            {/* <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors duration-150">
              Profile Settings
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors duration-150">
              Account Settings
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors duration-150">
              Notifications
            </button> */}

            <div className="border-t border-neutral-100 mt-1">
              <button
                onClick={() => logout()}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;