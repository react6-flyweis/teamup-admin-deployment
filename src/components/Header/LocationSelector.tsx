import React, { useState, useEffect, useMemo, useRef } from "react";
import { Chevron } from "../../assets/icons";
import { useLocationsQuery } from "@/hooks/useLocations";
import { useLocationStore } from "@/store/locationStore";

interface LocationSelectorProps {
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  itemClassName?: string;
  defaultLocation?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  itemClassName = "",
  defaultLocation = "Folsom, CA",
}) => {
  const { data, isLoading } = useLocationsQuery();
  const [isOpen, setIsOpen] = useState(false);
  const { selectedLocation, setSelectedLocation } = useLocationStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter to only include active locations
  const activeLocations = useMemo(
    () => (data?.locations || []).filter((loc) => loc.isActive !== false),
    [data?.locations]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Automatically select the first active location, or update if the current selected location is not active
  useEffect(() => {
    if (activeLocations.length > 0) {
      if (!selectedLocation || !activeLocations.some((loc) => loc._id === selectedLocation._id)) {
        setSelectedLocation(activeLocations[0]);
      }
    }
  }, [activeLocations, selectedLocation, setSelectedLocation]);

  const displayText = selectedLocation
    ? `${selectedLocation.name}, ${selectedLocation.state}`
    : defaultLocation;

  return (
    <div ref={containerRef} className={`relative flex flex-1 grow min-w-[200px] ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || activeLocations.length === 0}
        className={`header-component flex w-full items-center justify-between gap-4 h-14 ${buttonClassName} ${
          isLoading || activeLocations.length === 0 ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        <span className="text-header whitespace-nowrap">
          {isLoading ? "Loading locations..." : activeLocations.length === 0 ? "No active locations" : displayText}
        </span>
        <Chevron
          size={24}
          className={`transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          color="#292D32"
        />
      </button>

      {isOpen && activeLocations.length > 0 && (
        <div
          className={`absolute top-full left-0 mt-1 w-[290px] bg-white border border-neutral-200 rounded-lg shadow-lg z-50 ${dropdownClassName}`}
        >
          <div className="py-1">
            {activeLocations.map((loc) => {
              const displayName = `${loc.name}, ${loc.state}`;
              return (
                <button
                  key={loc._id}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-base font-bold text-black hover:bg-gray-50 transition-colors duration-150 ${itemClassName}`}
                >
                  {displayName}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
