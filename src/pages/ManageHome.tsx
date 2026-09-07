import React, { useState } from "react";
import HeroSectionForm from "@/components/ManageHome/HeroSectionForm";
import BoomBundlesForm from "@/components/ManageHome/BoomBundlesForm";
import LocationHoursForm from "@/components/ManageHome/LocationHoursForm";
import ChooseGamesForm from "@/components/ManageHome/ChooseGamesForm";
import BitesAndEventsForm from "@/components/ManageHome/BitesAndEventsForm";
import NewsletterSectionForm from "@/components/ManageHome/NewsletterSectionForm";
import {
  useHomeQuery,
  useUpdateHomeMutation,
  type ChooseGameSectionData,
} from "@/hooks/useHome";
import { useLocationStore } from "@/store/locationStore";

type Tab = "hero" | "bundles" | "location" | "games" | "bites" | "newsletter";

const ManageHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { selectedLocation } = useLocationStore();
  const locationSlug = selectedLocation?.slug;

  const { data: homeResponse, isLoading, error } = useHomeQuery(locationSlug);
  const updateHomeMutation = useUpdateHomeMutation(locationSlug);

  const tabs: { id: Tab; label: string }[] = [
    { id: "hero", label: "Hero Banner" },
    { id: "bundles", label: "Boom Bundles" },
    { id: "location", label: "Location & Hours" },
    { id: "games", label: "Choose Game" },
    { id: "bites", label: "Bites & Events" },
    { id: "newsletter", label: "Sign Up / Newsletter" },
  ];

  if (isLoading) {
    return (
      <div className="p-6 text-white min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E1017D]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white min-h-screen">
        <div className="text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-xl mx-auto mt-12 text-center">
          Failed to load home page content. Please try again later.
        </div>
      </div>
    );
  }

  const rawData = homeResponse?.content?.data;

  // Map API data to HeroSection structure
  const heroData = {
    topBannerText: rawData?.topBanner?.text || "",
    isTopBannerActive: rawData?.topBanner?.isActive ?? true,
    title: rawData?.hero?.title || "",
    subtitle: rawData?.hero?.subtitle || "",
    backgroundMediaUrl: rawData?.hero?.backgroundMediaUrl || "",
    buttons: {
      primaryText: rawData?.hero?.primaryButton?.text || "",
      primaryLink: rawData?.hero?.primaryButton?.link || "",
      secondaryText: rawData?.hero?.secondaryButton?.text || "",
      secondaryLink: rawData?.hero?.secondaryButton?.link || "",
    },
  };

  // Map API boomBundles to BoomBundle[]
  const bundlesData = rawData?.boomBundles?.items
    ? rawData.boomBundles.items.map((b, idx) => ({
        id: String(idx + 1),
        title: b.title || "",
        description: b.description || "",
        imageUrl: b.imageUrl || "",
        buttonText: b.buttonText || "",
        buttonLink: b.buttonLink || "",
        isActive: b.isActive ?? true,
      }))
    : [];

  // Map API chooseGameSection
  const chooseGameSectionData: ChooseGameSectionData =
    rawData?.chooseGameSection || {
      title: "",
      subtitle: "",
      items: [],
    };

  // Map API bitesEvents to BitesAndDrinks and NightsOut
  const bitesData = {
    bitesTitle: rawData?.bitesEvents?.bites?.title || "",
    bitesImageUrl: rawData?.bitesEvents?.bites?.imageUrl || "",
    bitesMenuLink: rawData?.bitesEvents?.bites?.menuLink || "",
    drinksTitle: rawData?.bitesEvents?.drinks?.title || "",
    drinksImageUrl: rawData?.bitesEvents?.drinks?.imageUrl || "",
    drinksMenuLink: rawData?.bitesEvents?.drinks?.menuLink || "",
  };

  const nightsOutData = {
    title: rawData?.bitesEvents?.nightsOut?.title || "",
    subtitle: rawData?.bitesEvents?.nightsOut?.subtitle || "",
    description: rawData?.bitesEvents?.nightsOut?.description || "",
    backgroundMediaUrl:
      rawData?.bitesEvents?.nightsOut?.backgroundImageUrl || "",
    buttonText: rawData?.bitesEvents?.nightsOut?.buttonText || "",
    buttonLink: rawData?.bitesEvents?.nightsOut?.buttonLink || "",
  };

  const newsletterData = {
    heading: rawData?.newsletter?.heading || "",
    subheading: rawData?.newsletter?.subheading || "",
    backgroundImageUrl: rawData?.newsletter?.backgroundImageUrl || "",
    inputPlaceholder: rawData?.newsletter?.inputPlaceholder || "",
    buttonText: rawData?.newsletter?.buttonText || "",
    disclaimerText: rawData?.newsletter?.disclaimerText || "",
    isActive: rawData?.newsletter?.isActive ?? true,
  };

  // Save callback handlers
  const handleSaveHero = (heroFields: typeof heroData) => {
    updateHomeMutation.mutate(
      {
        data: {
          topBanner: {
            text: heroFields.topBannerText,
            isActive: heroFields.isTopBannerActive,
          },
          hero: {
            backgroundMediaUrl: heroFields.backgroundMediaUrl,
            title: heroFields.title,
            subtitle: heroFields.subtitle,
            primaryButton: {
              text: heroFields.buttons.primaryText,
              link: heroFields.buttons.primaryLink,
            },
            secondaryButton: {
              text: heroFields.buttons.secondaryText,
              link: heroFields.buttons.secondaryLink,
            },
          },
        },
      },
      {
        onSuccess: () => {
          setSuccessMsg("Hero Banner updated successfully");
          setTimeout(() => setSuccessMsg(null), 3000);
        },
      },
    );
  };

  const handleSaveBundles = (bundlesFields: typeof bundlesData) => {
    updateHomeMutation.mutate(
      {
        data: {
          boomBundles: {
            title: rawData?.boomBundles?.title || "Boom Bundles",
            items: bundlesFields.map((b, idx) => ({
              title: b.title,
              description: b.description,
              imageUrl: b.imageUrl,
              buttonText: b.buttonText,
              buttonLink: b.buttonLink,
              order: idx + 1,
              isActive: b.isActive,
            })),
          },
        },
      },
      {
        onSuccess: () => {
          setSuccessMsg("Boom Bundles updated successfully");
          setTimeout(() => setSuccessMsg(null), 3000);
        },
      },
    );
  };

  const handleSaveGames = (sectionData: ChooseGameSectionData) => {
    updateHomeMutation.mutate(
      {
        data: {
          chooseGameSection: sectionData,
        },
      },
      {
        onSuccess: () => {
          setSuccessMsg("Choose Game section updated successfully");
          setTimeout(() => setSuccessMsg(null), 3000);
        },
      },
    );
  };

  const handleSaveBitesEvents = (
    bitesFields: typeof bitesData,
    nightsOutFields: typeof nightsOutData,
  ) => {
    updateHomeMutation.mutate(
      {
        data: {
          bitesEvents: {
            bites: {
              title: bitesFields.bitesTitle,
              imageUrl: bitesFields.bitesImageUrl,
              menuLink: bitesFields.bitesMenuLink,
              isActive: true,
            },
            drinks: {
              title: bitesFields.drinksTitle,
              imageUrl: bitesFields.drinksImageUrl,
              menuLink: bitesFields.drinksMenuLink,
              isActive: true,
            },
            nightsOut: {
              backgroundImageUrl: nightsOutFields.backgroundMediaUrl,
              title: nightsOutFields.title,
              subtitle: nightsOutFields.subtitle,
              description: nightsOutFields.description,
              buttonText: nightsOutFields.buttonText,
              buttonLink: nightsOutFields.buttonLink,
              isActive: true,
            },
          },
        },
      },
      {
        onSuccess: () => {
          setSuccessMsg("Bites & Events section updated successfully");
          setTimeout(() => setSuccessMsg(null), 3000);
        },
      },
    );
  };

  const handleSaveNewsletter = (newsletterFields: typeof newsletterData) => {
    updateHomeMutation.mutate(
      {
        data: {
          newsletter: {
            title: newsletterFields.heading,
            heading: newsletterFields.heading,
            subheading: newsletterFields.subheading,
            description: newsletterFields.subheading,
            body: newsletterFields.subheading,
            backgroundImageUrl: newsletterFields.backgroundImageUrl,
            backgroundMediaUrl: newsletterFields.backgroundImageUrl,
            inputPlaceholder: newsletterFields.inputPlaceholder,
            buttonText: newsletterFields.buttonText,
            disclaimerText: newsletterFields.disclaimerText,
            isActive: newsletterFields.isActive,
          },
        },
      },
      {
        onSuccess: () => {
          setSuccessMsg("Sign Up / Newsletter section updated successfully");
          setTimeout(() => setSuccessMsg(null), 3000);
        },
      },
    );
  };

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Manage Home</h1>
          <p className="text-gray-400">
            Configure the content displayed on the homepage.
          </p>
        </div>
        {successMsg && (
          <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm transition-all duration-300">
            {successMsg}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-[#3A3530] mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSuccessMsg(null);
            }}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-[#E1017D] text-[#E1017D]"
                : "border-transparent text-gray-400 hover:text-white hover:border-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "hero" && (
          <HeroSectionForm
            initialData={heroData}
            onSave={handleSaveHero}
            isSaving={updateHomeMutation.isPending}
          />
        )}
        {activeTab === "bundles" && (
          <BoomBundlesForm
            initialData={bundlesData}
            onSave={handleSaveBundles}
            isSaving={updateHomeMutation.isPending}
          />
        )}
        {activeTab === "location" && <LocationHoursForm />}
        {activeTab === "games" && (
          <ChooseGamesForm
            initialData={chooseGameSectionData}
            onSave={handleSaveGames}
            isSaving={updateHomeMutation.isPending}
          />
        )}
        {activeTab === "bites" && (
          <BitesAndEventsForm
            initialBites={bitesData}
            initialNightsOut={nightsOutData}
            onSave={handleSaveBitesEvents}
            isSaving={updateHomeMutation.isPending}
          />
        )}
        {activeTab === "newsletter" && (
          <NewsletterSectionForm
            initialData={newsletterData}
            onSave={handleSaveNewsletter}
            isSaving={updateHomeMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

export default ManageHome;
