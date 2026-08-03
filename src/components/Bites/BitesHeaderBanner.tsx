import React from 'react';

export type BiteFilter = 'food' | 'drinks';

interface BitesHeaderBannerProps {
  activeFilter?: BiteFilter;
  onFilterChange?: (filter: BiteFilter) => void;
}

const BitesHeaderBanner: React.FC<BitesHeaderBannerProps> = ({
  activeFilter = 'food',
  onFilterChange
}) => {
  return (
    <div className="w-full bg-[#1A1A1A] rounded-xl overflow-hidden mb-8 border border-[#3A3530]">
      {/* Top section with icons and text */}
      <div className="flex flex-wrap justify-center gap-8 sm:gap-16 md:gap-24 py-10 px-6">
        {/* Drinks and Cocktails */}
        <div
          onClick={() => onFilterChange?.('drinks')}
          className={`flex flex-col items-center justify-between gap-4 cursor-pointer p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 select-none min-w-50 ${activeFilter === 'drinks'
            ? 'bg-[#E1017D]/15 border-2 border-[#E1017D] shadow-[0_0_20px_rgba(225,1,125,0.35)] ring-2 ring-[#E1017D]/30'
            : 'bg-[#222222] border-2 border-[#333333] hover:border-[#E1017D]/50 hover:bg-[#282828]'
            }`}
        >
          <div className={`transition-colors duration-300 ${activeFilter === 'drinks' ? 'text-[#E1017D]' : 'text-white/80'}`}>
            {/* Cocktail & Beer Icon SVG */}
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 35H45M25 35L28 80H42L45 35M25 35V30M45 35V30M35 25L32 15M30 45H40M30 55H40M30 65H40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M55 45V80H80V45H55ZM80 50H88V70H80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M55 45C55 35 60 30 65 30C67 30 70 35 75 35C80 35 80 40 80 45" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {/* Lemon wedge */}
              <circle cx="20" cy="25" r="10" stroke="currentColor" strokeWidth="3" />
              <path d="M20 15V35M10 25H30M13 18L27 32M13 32L27 18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className={`font-black text-xl tracking-wide uppercase transition-colors ${activeFilter === 'drinks' ? 'text-[#E1017D]' : 'text-white'}`}>Drinks and</h3>
            <h3 className={`font-black text-xl tracking-wide uppercase transition-colors ${activeFilter === 'drinks' ? 'text-[#E1017D]' : 'text-white'}`}>Cocktails</h3>
          </div>

        </div>

        {/* Street Food */}
        <div
          onClick={() => onFilterChange?.('food')}
          className={`flex flex-col items-center justify-between gap-4 cursor-pointer p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 select-none min-w-50 ${activeFilter === 'food'
            ? 'bg-[#E1017D]/15 border-2 border-[#E1017D] shadow-[0_0_20px_rgba(225,1,125,0.35)] ring-2 ring-[#E1017D]/30'
            : 'bg-[#222222] border-2 border-[#333333] hover:border-[#E1017D]/50 hover:bg-[#282828]'
            }`}
        >
          <div className={`transition-colors duration-300 ${activeFilter === 'food' ? 'text-[#E1017D]' : 'text-white/80'}`}>
            {/* Street Food Icon SVG */}
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Drink cup */}
              <path d="M55 40L60 80H80L85 40H55ZM65 30V40M75 30V40M60 30H80V35H60V30ZM70 30V20H60M60 25H75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {/* Burger */}
              <path d="M40 50C40 40 50 35 60 35C70 35 80 40 80 50H40ZM40 60H80V65C80 70 70 75 60 75C50 75 40 70 40 65V60ZM40 55H80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {/* Pizza slice */}
              <path d="M45 40L25 75C20 80 30 85 40 80L50 65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="35" cy="55" r="2" fill="currentColor" />
              <circle cx="42" cy="62" r="2" fill="currentColor" />
              <circle cx="30" cy="65" r="2" fill="currentColor" />
            </svg>
          </div>
          <div className="text-center flex flex-col justify-end h-full">
            <h3 className={`font-black text-xl tracking-wide uppercase mt-2 transition-colors ${activeFilter === 'food' ? 'text-[#E1017D]' : 'text-white'}`}>Street Food</h3>
          </div>
        </div>
      </div>

      {/* Pink bottom strip */}
      <div className="bg-[#E1017D] w-full py-3 px-6 text-center">
        <span className="text-white font-black text-sm sm:text-lg tracking-widest uppercase">
          TIPSY THRILLS - SIP, SAVOR & CELEBRATE!
        </span>
      </div>
    </div>
  );
};

export default BitesHeaderBanner;
