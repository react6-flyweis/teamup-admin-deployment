import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Location } from '@/hooks/useLocations';
import { queryClient } from '@/utils/queryClient';

interface LocationState {
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
  getLocationSlug: () => string | undefined;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      selectedLocation: null,
      setSelectedLocation: (location) => {
        const prevSlug = get().selectedLocation?.slug;
        const newSlug = location?.slug;
        set({ selectedLocation: location });
        if (prevSlug !== newSlug) {
          queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] !== 'locations',
          });
        }
      },
      getLocationSlug: () => {
        const loc = get().selectedLocation;
        return (
          loc?.slug ||
          (loc?.name
            ? loc.name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
            : undefined)
        );
      },
    }),
    {
      name: 'location-storage',
    }
  )
);
