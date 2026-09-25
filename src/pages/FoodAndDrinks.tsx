import React, { useState, useEffect } from 'react';
import { useLocationStore } from '@/store/locationStore';
import { ImageInputWithUpload } from '@/components/common/ImageInputWithUpload';
import {
  useFoodDrinksContentQuery,
  useUpdateFoodDrinksContentMutation,
  type MenuImagesSection,
} from '@/hooks/useBites';
import BitesHeaderBanner, { type BiteFilter } from '@/components/Bites/BitesHeaderBanner';

const FoodAndDrinks: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<BiteFilter>('drinks');
  const [menuImages, setMenuImages] = useState<MenuImagesSection>({
    cocktails: '',
    beer: '',
    flatbreads: '',
    appetizers: '',
  });
  const [bgWallpaperImageUrl, setBgWallpaperImageUrl] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { selectedLocation } = useLocationStore();
  const locationSlug = selectedLocation?.slug;

  const {
    data: siteContentData,
    isLoading: isContentLoading,
    error: contentError,
  } = useFoodDrinksContentQuery(locationSlug);

  const updateMutation = useUpdateFoodDrinksContentMutation(locationSlug);

  // Safely extract menuImages and bgWallpaperImageUrl from site-content payload
  const contentData = siteContentData?.content?.data || siteContentData?.data;
  const apiMenuImages: MenuImagesSection | undefined =
    contentData?.menuImages ||
    (siteContentData?.content as unknown as { menuImages?: MenuImagesSection })?.menuImages ||
    (siteContentData as unknown as { menuImages?: MenuImagesSection })?.menuImages;

  const apiBgWallpaperImageUrl: string =
    contentData?.bgWallpaperImageUrl ||
    (siteContentData?.content as unknown as { bgWallpaperImageUrl?: string })?.bgWallpaperImageUrl ||
    (siteContentData as unknown as { bgWallpaperImageUrl?: string })?.bgWallpaperImageUrl ||
    '';

  // Sync state whenever backend data loads or location changes
  useEffect(() => {
    if (apiMenuImages) {
      setMenuImages({
        cocktails: apiMenuImages.cocktails || '',
        beer: apiMenuImages.beer || '',
        flatbreads: apiMenuImages.flatbreads || '',
        appetizers: apiMenuImages.appetizers || '',
      });
    } else if (!isContentLoading) {
      setMenuImages({
        cocktails: '',
        beer: '',
        flatbreads: '',
        appetizers: '',
      });
    }

    if (apiBgWallpaperImageUrl !== undefined) {
      setBgWallpaperImageUrl(apiBgWallpaperImageUrl || '');
    } else if (!isContentLoading) {
      setBgWallpaperImageUrl('');
    }
  }, [apiMenuImages, apiBgWallpaperImageUrl, isContentLoading]);

  // When switching tabs, update filter without clearing pending edits
  const handleTabChange = (newFilter: BiteFilter) => {
    setActiveFilter(newFilter);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleImageChange = (name: keyof MenuImagesSection, url: string) => {
    setMenuImages((prev) => ({
      ...prev,
      [name]: url,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      menuImages: {
        cocktails: (menuImages.cocktails || '').trim(),
        beer: (menuImages.beer || '').trim(),
        flatbreads: (menuImages.flatbreads || '').trim(),
        appetizers: (menuImages.appetizers || '').trim(),
      },
      bgWallpaperImageUrl: (bgWallpaperImageUrl || '').trim(),
    };

    try {
      await updateMutation.mutateAsync({
        locationSlug,
        data: payload,
      });

      setSuccessMsg('Settings saved successfully!');
      const timer = setTimeout(() => setSuccessMsg(null), 3500);
      return () => clearTimeout(timer);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to save settings. Please try again.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="flex flex-col gap-8 min-h-screen">
      {/* Header Tab Navigation */}
      <BitesHeaderBanner
        activeFilter={activeFilter}
        onFilterChange={handleTabChange}
      />

      {/* Main Content Card */}
      <div className="w-full bg-[#1A1A1A] border border-[#3A3530] rounded-xl p-6 sm:p-8">
        {/* Header Title & Location Context */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#3A3530]">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              {activeFilter === 'drinks' ? 'Drinks & Cocktails Menu' : 'Street Food Menu'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {activeFilter === 'drinks'
                ? 'Upload dedicated menu images for Cocktails and Beer.'
                : 'Upload dedicated menu images for Flatbreads and Appetizers.'}
            </p>
          </div>

          <div className="text-xs text-gray-400 bg-[#242424] px-3 py-1.5 rounded-lg border border-[#333333]">
            Venue:{' '}
            <span className="text-[#E1017D] font-semibold">
              {selectedLocation?.name || locationSlug || 'Global / All Venues'}
            </span>
          </div>
        </div>

        {/* Feedback Notifications */}
        {successMsg && (
          <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">✓</span>
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-green-400/80 hover:text-green-300 text-xs px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">⚠</span>
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-400/80 hover:text-red-300 text-xs px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {contentError && !errorMsg && (
          <div className="mt-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
            Notice: Failed to fetch previous saved content for this location. You can still set and save new values below.
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-8">
          {activeFilter === 'drinks' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cocktails Menu */}
              <div className="bg-[#222222] border border-[#333333] rounded-xl p-5 hover:border-[#E1017D]/40 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">Cocktails</h3>
                  </div>
                  <span className="text-xs text-[#E1017D] bg-[#E1017D]/10 border border-[#E1017D]/30 px-2.5 py-0.5 rounded-full font-medium">
                    Drinks
                  </span>
                </div>
                <ImageInputWithUpload
                  key="cocktails-input"
                  value={menuImages.cocktails || ''}
                  onChange={(url) => handleImageChange('cocktails', url)}
                  label="Cocktails Menu Image"
                  hint="Upload image for cocktails menu (JPG, PNG, WebP)"
                  placeholder="Paste image URL or click Upload"
                  showPreview={true}
                  previewHeight="h-72"
                  previewWidth="w-full"
                  objectFit="contain"
                />
              </div>

              {/* Beer Menu */}
              <div className="bg-[#222222] border border-[#333333] rounded-xl p-5 hover:border-[#E1017D]/40 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">Beer</h3>
                  </div>
                  <span className="text-xs text-[#E1017D] bg-[#E1017D]/10 border border-[#E1017D]/30 px-2.5 py-0.5 rounded-full font-medium">
                    Drinks
                  </span>
                </div>
                <ImageInputWithUpload
                  key="beer-input"
                  value={menuImages.beer || ''}
                  onChange={(url) => handleImageChange('beer', url)}
                  label="Beer Menu Image"
                  hint="Upload image for beer and beverages menu (JPG, PNG, WebP)"
                  placeholder="Paste image URL or click Upload"
                  showPreview={true}
                  previewHeight="h-72"
                  previewWidth="w-full"
                  objectFit="contain"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Flatbreads Menu */}
              <div className="bg-[#222222] border border-[#333333] rounded-xl p-5 hover:border-[#E1017D]/40 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">Flatbreads</h3>
                  </div>
                  <span className="text-xs text-[#E1017D] bg-[#E1017D]/10 border border-[#E1017D]/30 px-2.5 py-0.5 rounded-full font-medium">
                    Street Food
                  </span>
                </div>
                <ImageInputWithUpload
                  key="flatbreads-input"
                  value={menuImages.flatbreads || ''}
                  onChange={(url) => handleImageChange('flatbreads', url)}
                  label="Flatbreads Menu Image"
                  hint="Upload image for flatbreads menu (JPG, PNG, WebP)"
                  placeholder="Paste image URL or click Upload"
                  showPreview={true}
                  previewHeight="h-72"
                  previewWidth="w-full"
                  objectFit="contain"
                />
              </div>

              {/* Appetizers Menu */}
              <div className="bg-[#222222] border border-[#333333] rounded-xl p-5 hover:border-[#E1017D]/40 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">Appetizers</h3>
                  </div>
                  <span className="text-xs text-[#E1017D] bg-[#E1017D]/10 border border-[#E1017D]/30 px-2.5 py-0.5 rounded-full font-medium">
                    Street Food
                  </span>
                </div>
                <ImageInputWithUpload
                  key="appetizers-input"
                  value={menuImages.appetizers || ''}
                  onChange={(url) => handleImageChange('appetizers', url)}
                  label="Appetizers Menu Image"
                  hint="Upload image for appetizers menu (JPG, PNG, WebP)"
                  placeholder="Paste image URL or click Upload"
                  showPreview={true}
                  previewHeight="h-72"
                  previewWidth="w-full"
                  objectFit="contain"
                />
              </div>
            </div>
          )}

          {/* Common Background Wallpaper Section */}
          <div className="bg-[#222222] border border-[#333333] rounded-xl p-5 hover:border-[#E1017D]/40 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-[#333333]">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-semibold text-white">Background Wallpaper</h3>
                  <span className="text-xs text-[#E1017D] bg-[#E1017D]/10 border border-[#E1017D]/30 px-2.5 py-0.5 rounded-full font-medium">
                    Common for Drinks & Food
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Upload or paste background wallpaper URL. This wallpaper is shared across both Drinks and Street Food menus.
                </p>
              </div>
            </div>

            <ImageInputWithUpload
              key="bg-wallpaper-input"
              value={bgWallpaperImageUrl}
              onChange={(url) => setBgWallpaperImageUrl(url)}
              label="Background Wallpaper Image"
              hint="Recommended: 16:9 widescreen • High resolution (e.g. 1920×1080 or 2560×1440) • JPG, PNG, WebP"
              placeholder="Paste wallpaper image URL or click Upload"
              showPreview={true}
              previewHeight="h-64"
              previewWidth="w-full"
              objectFit="cover"
            />
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-[#3A3530] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-400">
              {locationSlug ? (
                <span>
                  Saving for location:{' '}
                  <span className="text-white font-mono font-medium">{locationSlug}</span>
                </span>
              ) : (
                <span>Applies across all venues (no location selected).</span>
              )}
            </div>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full sm:w-auto bg-[#E1017D] hover:bg-[#c9016f] text-white px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(225,1,125,0.4)]"
            >
              {updateMutation.isPending ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodAndDrinks;
