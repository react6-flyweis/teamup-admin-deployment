import React from 'react';
import LocationSelector from './LocationSelector';
// import SearchBar from './SearchBar';
import UserProfile from './UserProfile';

const Header: React.FC = () => {
  return (
    <div className="flex flex-col justify-center px-6 py-6 w-full h-[104px] border-b border-[#3A3530]">
      <div className="flex items-center justify-between gap-6 w-full h-14">
        {/* Location Selector */}
        <LocationSelector />

        {/* Search Bar */}
        {/* <SearchBar /> */}

        {/* User Profile */}
        <UserProfile />
      </div>
    </div>
  );
};

export default Header;