import React, { useState, useEffect } from 'react';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';
import {
  useFoodDrinksContentQuery,
  useUpdateFoodDrinksContentMutation,
  type DrinksSection
} from '@/hooks/useBites';

interface DrinksHeroSectionProps {
  locationSlug?: string;
  locationName?: string;
}

const DEFAULT_DRINKS_HERO: DrinksSection = {
  title: 'DRINKS & COCKTAILS',
  description: 'Craft cocktails, beers and refreshing drinks',
  backgroundImage: '',
};

const DrinksHeroSection: React.FC<DrinksHeroSectionProps> = ({
  locationSlug,
  locationName,
}) => {
  const [formData, setFormData] = useState<DrinksSection>(DEFAULT_DRINKS_HERO);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Queries & Mutations
  const {
    data: siteContentData,
    isLoading: isContentLoading,
    error: contentError,
  } = useFoodDrinksContentQuery(locationSlug);

  const updateMutation = useUpdateFoodDrinksContentMutation(locationSlug);

  // Extract drinksSection safely from various backend response shapes
  const contentData = siteContentData?.content?.data || siteContentData?.data;
  const apiDrinksSection: DrinksSection | undefined =
    contentData?.drinksSection ||
    (siteContentData?.content as unknown as { drinksSection?: DrinksSection })?.drinksSection ||
    (siteContentData as unknown as { drinksSection?: DrinksSection })?.drinksSection;

  // Sync state when backend data loads or changes (e.g. location switch)
  useEffect(() => {
    if (apiDrinksSection) {
      setFormData({
        title: apiDrinksSection.title ?? DEFAULT_DRINKS_HERO.title,
        description: apiDrinksSection.description ?? DEFAULT_DRINKS_HERO.description,
        backgroundImage: apiDrinksSection.backgroundImage ?? '',
      });
    } else if (!isContentLoading) {
      setFormData(DEFAULT_DRINKS_HERO);
    }
  }, [apiDrinksSection, isContentLoading]);

  // Check if form is dirty
  const isDirty =
    apiDrinksSection
      ? formData.title !== (apiDrinksSection.title ?? DEFAULT_DRINKS_HERO.title) ||
        formData.description !== (apiDrinksSection.description ?? DEFAULT_DRINKS_HERO.description) ||
        formData.backgroundImage !== (apiDrinksSection.backgroundImage ?? '')
      : formData.title !== DEFAULT_DRINKS_HERO.title ||
        formData.description !== DEFAULT_DRINKS_HERO.description ||
        formData.backgroundImage !== '';

  const handleReset = () => {
    if (apiDrinksSection) {
      setFormData({
        title: apiDrinksSection.title ?? DEFAULT_DRINKS_HERO.title,
        description: apiDrinksSection.description ?? DEFAULT_DRINKS_HERO.description,
        backgroundImage: apiDrinksSection.backgroundImage ?? '',
      });
    } else {
      setFormData(DEFAULT_DRINKS_HERO);
    }
    setErrorMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const payloadDrinksSection: DrinksSection = {
      title: formData.title.trim() || DEFAULT_DRINKS_HERO.title,
      description: formData.description.trim(),
      backgroundImage: formData.backgroundImage.trim(),
    };

    try {
      await updateMutation.mutateAsync({
        locationSlug,
        data: {
          drinksSection: payloadDrinksSection,
        },
      });

      setSuccessMsg('Drinks hero section saved successfully!');
      const timer = setTimeout(() => setSuccessMsg(null), 3500);
      return () => clearTimeout(timer);
    } catch (err: unknown) {
      console.error('Failed to update drinks hero section:', err);
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMsg(
        axiosErr?.response?.data?.message ||
        axiosErr?.message ||
        'Failed to save drinks hero section. Please try again.'
      );
    }
  };

  return (
    <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530] transition-all duration-300">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#3A3530] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Drinks Hero Section
            </h2>
            {locationName ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#E1017D]/20 border border-[#E1017D]/40 text-[#E1017D] text-xs font-semibold">
                {locationName}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-[#2A2A2A] border border-[#3A3530] text-gray-400 text-xs font-medium">
                Default / Global
              </span>
            )}
            {isContentLoading && (
              <span className="inline-block animate-spin h-3.5 w-3.5 border-2 border-[#E1017D] border-t-transparent rounded-full" />
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Configure the headline, subtitle, and background banner displayed on the Drinks & Cocktails tab.
          </p>
        </div>

        {/* Header Actions */}
        {isDirty && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleReset}
              disabled={updateMutation.isPending}
              className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded bg-[#2A2A2A] border border-[#3A3530] transition-colors"
            >
              Discard Changes
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-base">✓</span>
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
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠</span>
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
        <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
          Notice: Failed to fetch previous saved content for this location. You can still set and save new values below.
        </div>
      )}

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hero Title <span className="text-[#E1017D]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. DRINKS & COCKTAILS"
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#E1017D] transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              The primary headline shown prominently at the top of the drinks page.
            </p>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Craft cocktails, beers and refreshing drinks"
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#E1017D] transition-colors resize-none"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Supporting tagline or subtitle describing the drink selections.
            </p>
          </div>
        </div>

        {/* Background Image Input with Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hero Background Image
          </label>
          <ImageInputWithUpload
            value={formData.backgroundImage}
            onChange={(url) => setFormData({ ...formData, backgroundImage: url })}
            label=""
            hint="Recommended: 1920×500 px or 1920×400 px (~4:1 to 5:1 ultra-wide) • Min: 1500×350 px • Display: 100% width, 350px desktop / 300px mobile (bg-cover bg-center)"
            placeholder="Paste image CDN URL or click Upload"
            aspectRatio="4:1"
            previewHeight="h-28"
            previewWidth="w-full max-w-lg"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-[#3A3530] flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {locationSlug ? (
              <span>
                Changes will be saved for venue: <span className="text-gray-300 font-mono font-medium">{locationSlug}</span>
              </span>
            ) : (
              <span>Changes will apply globally.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-[#E1017D] hover:bg-[#c9016f] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-[0_0_15px_rgba(225,1,125,0.4)]"
            >
              {updateMutation.isPending ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Hero Configuration</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DrinksHeroSection;
