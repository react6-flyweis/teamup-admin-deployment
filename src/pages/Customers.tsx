import React, { useState, useMemo } from 'react';
import { CustomerCard } from '../components/Customers/CustomerCard';
import { SearchIcon } from '../assets/icons';
import { LocationSelector } from '@/components/Header';
import { CustomerProfile } from '@/components/Customers/CustomerProfile';
import { useUsersQuery } from '@/hooks/useUsers';

const Customers: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data: apiData, isLoading, isError, error } = useUsersQuery({ search });

  const users = useMemo(() => {
    if (apiData?.users && Array.isArray(apiData.users)) {
      return apiData.users.map((u) => ({
        id: u._id || u.id || 'UID',
        name: u.name,
        email: u.email,
        phone: u.phone || '+1 0000000000',
        totalVisits: u.totalVisits ?? 0,
        totalSpent: u.totalSpent ?? 0,
        lastVisit: u.lastVisit || (u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : 'N/A'),
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
      }));
    }
    return [];
  }, [apiData]);

  const [selectedUser, setSelectedUser] = useState<(typeof users)[0] | null>(users[0] || null);

  // Keep selected user updated if list changes
  React.useEffect(() => {
    if (users.length > 0) {
      if (!selectedUser || !users.some(u => u.id === selectedUser.id)) {
        setSelectedUser(users[0]);
      }
    } else {
      setSelectedUser(null);
    }
  }, [users, selectedUser]);

  return (
    <div className="p-4 flex gap-6">
      {/* Left Section */}
      <div className="w-[320px] h-[780px] bg-[#F9D2EA] rounded-2xl p-4 flex flex-col">
        {/* Search User */}
        <div className="w-full h-10 bg-white rounded-lg px-4 flex items-center gap-3">
          <SearchIcon className="w-6 h-6 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search User"
            className="flex-1 outline-none text-[#4A4A4A] font-poppins text-sm"
          />
        </div>

        {/* Location Selector */}
        <div className="mt-4">
          <LocationSelector className="w-full" />
        </div>

        {/* Users List */}
        <div className="mt-8 flex flex-col gap-4 max-h-[580px] overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E1017D]"></div>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500 text-sm">
              Failed to load customers: {error instanceof Error ? error.message : "Error"}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No customers found.</div>
          ) : (
            users.map((user, index) => (
              <CustomerCard
                key={user.id || index}
                user={user}
                isSelected={user.id === selectedUser?.id}
                onClick={() => setSelectedUser(user)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Section */}
      {selectedUser ? (
        <CustomerProfile user={selectedUser} />
      ) : (
        <div className="flex-1 h-[780px] bg-[#F9D2EA] rounded-2xl p-6 flex flex-col justify-center items-center text-gray-600">
          <p className="text-lg font-medium">Select a customer to view profile</p>
        </div>
      )}
    </div>
  );
};

export default Customers;