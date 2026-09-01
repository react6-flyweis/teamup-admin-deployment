import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit: string;
  avatar: string;
}

interface CustomerProfileProps {
  user: User;
}

interface GameHistoryItem {
  date: string;
  game: string;
  duration: string;
  zone: string;
}

interface OrderItem {
  date: string;
  foodBeverages: string;
  totalAmount: string;
  zone: string;
}

interface BookingHistoryItem {
  date: string;
  game: string;
  time: string;
  bookingType: string;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'gameHistory' | 'orders' | 'bookingHistory'>('gameHistory');

  const gameHistory: GameHistoryItem[] = [];
  const orders: OrderItem[] = [];
  const bookings: BookingHistoryItem[] = [];

  return (
    <div className="w-full h-[780px] bg-[#F9D2EA] rounded-2xl p-6 flex flex-col">
      {/* User Info */}
      <div className="flex items-start gap-4 mb-6 p-2">
        <div className="w-[62px] h-[62px] rounded-full bg-[#D9D9D9] overflow-hidden">
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-medium font-roboto text-[#050505]">{user.name}</h2>
          <p className="text-sm font-roboto text-[#050505]">{user.email}</p>
          <p className="text-sm font-roboto text-[#050505]">{user.phone}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center mb-8 bg-[#FDECF6] p-4 rounded-xl">
        <div className="text-center">
          <p className="text-xs text-gray-600 font-poppins mb-1">User ID</p>
          <p className="text-sm font-bold font-poppins truncate max-w-[120px]">{user.id}</p>
        </div>
        <div className="w-px h-8 bg-[#570B39]/30" />
        <div className="text-center">
          <p className="text-xs text-gray-600 font-poppins mb-1">Total Visits</p>
          <p className="text-sm font-bold font-poppins">{user.totalVisits}</p>
        </div>
        <div className="w-px h-8 bg-[#570B39]/30" />
        <div className="text-center">
          <p className="text-xs text-gray-600 font-poppins mb-1">Total Spent</p>
          <p className="text-sm font-bold font-poppins">${user.totalSpent}</p>
        </div>
        <div className="w-px h-8 bg-[#570B39]/30" />
        <div className="text-center">
          <p className="text-xs text-gray-600 font-poppins mb-1">Last Visit</p>
          <p className="text-sm font-bold font-poppins">{user.lastVisit}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mb-4">
        <button
          className={`text-base pb-2 cursor-pointer ${
            activeTab === 'gameHistory' ? 'font-extrabold border-b-2 border-black text-black' : 'font-medium text-gray-700'
          }`}
          onClick={() => setActiveTab('gameHistory')}
        >
          Game History
        </button>
        <button
          className={`text-base pb-2 cursor-pointer ${
            activeTab === 'orders' ? 'font-extrabold border-b-2 border-black text-black' : 'font-medium text-gray-700'
          }`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={`text-base pb-2 cursor-pointer ${
            activeTab === 'bookingHistory' ? 'font-extrabold border-b-2 border-black text-black' : 'font-medium text-gray-700'
          }`}
          onClick={() => setActiveTab('bookingHistory')}
        >
          Booking History
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg overflow-hidden flex-1 flex flex-col">
        {activeTab === 'gameHistory' && (
          <>
            <div className="grid grid-cols-4 gap-4 p-4 bg-[#F9D2EA] font-montserrat font-bold text-sm">
              <div className="text-center">Date</div>
              <div className="text-center">Game</div>
              <div className="text-center">Duration</div>
              <div className="text-center">Zone</div>
            </div>
            {gameHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No game history recorded for this customer.</div>
            ) : (
              gameHistory.map((item, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-4 gap-4 p-4 ${
                    index % 2 === 0 ? 'bg-[#FDECF6]' : 'bg-[#FFFBFD]'
                  } font-montserrat text-sm hover:bg-[#F9D2EA] transition-colors duration-200`}
                >
                  <div className="text-center">{item.date}</div>
                  <div className="text-center">{item.game}</div>
                  <div className="text-center">{item.duration}</div>
                  <div className="text-center">{item.zone}</div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="grid grid-cols-4 gap-4 p-4 bg-[#F9D2EA] font-montserrat font-bold text-sm">
              <div className="text-center">Date</div>
              <div className="text-center">Food & Beverages</div>
              <div className="text-center">Total Amount</div>
              <div className="text-center">Zone</div>
            </div>
            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No orders found for this customer.</div>
            ) : (
              orders.map((item, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-4 gap-4 p-4 ${
                    index % 2 === 0 ? 'bg-[#FDECF6]' : 'bg-[#FFFBFD]'
                  } font-montserrat text-sm hover:bg-[#F9D2EA] transition-colors duration-200`}
                >
                  <div className="text-center">{item.date}</div>
                  <div className="text-center">{item.foodBeverages}</div>
                  <div className="text-center">{item.totalAmount}</div>
                  <div className="text-center">{item.zone}</div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'bookingHistory' && (
          <>
            <div className="grid grid-cols-4 gap-4 p-4 bg-[#F9D2EA] font-montserrat font-bold text-sm">
              <div className="text-center">Date</div>
              <div className="text-center">Game</div>
              <div className="text-center">Time</div>
              <div className="text-center">Booking Type</div>
            </div>
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No bookings recorded for this customer.</div>
            ) : (
              bookings.map((item, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-4 gap-4 p-4 ${
                    index % 2 === 0 ? 'bg-[#FDECF6]' : 'bg-[#FFFBFD]'
                  } font-montserrat text-sm hover:bg-[#F9D2EA] transition-colors duration-200`}
                >
                  <div className="text-center">{item.date}</div>
                  <div className="text-center">{item.game}</div>
                  <div className="text-center">{item.time}</div>
                  <div className="text-center">{item.bookingType}</div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};
