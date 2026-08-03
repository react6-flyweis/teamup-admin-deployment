import React, { useRef, useEffect } from "react";
import ChevronDown from "@/assets/icons/Chevron";

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  width?: number | string;
  placeholder?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  width = 270,
  placeholder
}) => {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleOptionClick = (option: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(option);
    setOpen(false);
  };

  const isValidValue = options.includes(value);

  return (
    <div
      ref={dropdownRef}
      className="relative"
      style={{ width }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={handleMouseDown}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(o => !o);
        }}
        className="flex flex-row justify-between items-center px-4 py-3 w-full font-bold text-[16px] bg-white border border-[#005066] rounded-[4px] transition cursor-pointer"
        style={{
          height: 44,
          fontFamily: "Poppins",
          color: "#000"
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={!isValidValue ? 'text-gray-500 font-normal' : ''}>
          {isValidValue ? value : (placeholder || 'Select...')}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            transition: 'transform 0.45s cubic-bezier(.4,0,.2,1)'
          }}
        >
          <span
            style={{
              display: "inline-flex",
              transition: 'transform 0.45s cubic-bezier(.4,0,.2,1)',
              transform: open ? "rotate(180deg)" : "rotate(0deg)"
            }}
          >
            <ChevronDown className="w-6 h-6" />
          </span>
        </span>
      </button>
      
      <div
        className={`absolute left-0 top-[48px] w-full bg-white border border-[#005066] rounded-[4px] overflow-hidden shadow-xl z-[60]
          transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)]
          ${open
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-4"
          }
        `}
        style={{
          fontFamily: "Poppins",
          fontWeight: 700,
          fontSize: 16,
          transitionProperty: "opacity, transform",
          transformOrigin: "top"
        }}
        role="listbox"
        aria-activedescendant={isValidValue ? value : undefined}
      >
        {options.map((option) => (
          <button
            key={option}
            type="button" // 🔥 CRITICAL FIX: Prevents form submission
            className={`block w-full text-left px-4 py-2 transition font-bold text-[16px] ${
              isValidValue && option === value ? "bg-[#A3EBFF]" : ""
            }`}
            style={{ color: "#000" }}
            onClick={(e) => handleOptionClick(option, e)}
            onMouseDown={handleMouseDown}
            tabIndex={open ? 0 : -1}
            role="option"
            aria-selected={isValidValue && value === option}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
