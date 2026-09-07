import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const UserProfile: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const userName = user?.name || "Guest";
  const userRole = user?.role || "Member";
  const profilePicture = user?.profilePicture;

  const getInitials = (name: string) => {
    if (!name || name === "Guest") return "G";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileSettings = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  return (
    <div className="relative user-profile shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 h-14 hover:opacity-90 transition-opacity duration-200 cursor-pointer"
      >
        {/* User Avatar */}
        <div className="relative user-avatar shrink-0">
          {profilePicture ? (
            <img
              className="w-10 h-10 rounded-full object-cover border border-[#4A3F38]"
              src={profilePicture}
              alt={userName}
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-[#E1017D] to-purple-600 rounded-full flex items-center justify-center border border-[#4A3F38] shadow-sm">
              <span className="text-white text-xs font-bold font-raleway tracking-wider">
                {getInitials(userName)}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex flex-col items-start text-left">
          <div className="font-bold text-base leading-6 text-white whitespace-nowrap">
            {userName}
          </div>
          <div className="text-sm leading-[17px] text-[#9EA2AD] whitespace-nowrap capitalize">
            {userRole.replace(/_/g, " ")}
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-1 min-w-52 w-max max-w-xs bg-[#1E1A18] border border-[#3A3530] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="py-1">
            <div className="px-4 py-3 border-b border-[#2D2622]">
              <div className="text-sm font-semibold text-white break-words">
                {userName}
              </div>
              <div className="text-xs text-neutral-400 capitalize mt-0.5">
                {userRole.replace(/_/g, " ")}
              </div>
            </div>

            <button
              onClick={handleProfileSettings}
              className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-[#2A2420] hover:text-white transition-colors duration-150 cursor-pointer flex items-center gap-2"
            >
              <span>Profile Settings</span>
            </button>

            <div className="border-t border-[#2D2622] mt-1">
              <button
                type="button"
                onClick={() => logout()}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-150 cursor-pointer"
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
