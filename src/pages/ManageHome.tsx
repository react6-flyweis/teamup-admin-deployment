import React, { useState } from "react";
import HeroSectionForm from "@/components/ManageHome/HeroSectionForm";
import type { HeroSection } from "@/components/ManageHome/types";
import BoomBundlesForm from "@/components/ManageHome/BoomBundlesForm";
import LocationHoursForm from "@/components/ManageHome/LocationHoursForm";
import ChooseGamesForm from "@/components/ManageHome/ChooseGamesForm";
import BitesAndEventsForm from "@/components/ManageHome/BitesAndEventsForm";
import NewsletterSectionForm from "@/components/ManageHome/NewsletterSectionForm";
import MainBackgroundForm from "@/components/ManageHome/MainBackgroundForm";

import {
  useHomeQuery,
  useUpdateHomeMutation,
  type ChooseGameSectionData,
} from "@/hooks/useHome";
import { useLocationStore } from "@/store/locationStore";
import SuccessModal from "@/components/common/SuccessModal";

type Tab = "hero" | "mainBg" | "bundles" | "location" | "games" | "bites" | "newsletter";

const ManageHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [errorSection, setErrorSection] = useState<{
    section: string;
    message: string;
  } | null>(null);
  const [successModalData, setSuccessModalData] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const { selectedLocation } = useLocationStore();
  const locationSlug = selectedLocation?.slug;

  const { data: homeResponse, isLoading, error } = useHomeQuery(locationSlug);
  const updateHomeMutation = useUpdateHomeMutation(locationSlug);

  const tabs: { id: Tab; label: string }[] = [
    { id: "hero", label: "Hero Banner" },
    { id: "mainBg", label: "Main Background" },
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
    videoUrl: rawData?.hero?.videoUrl || "",
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

  const mainBgData = rawData?.mainBg || "";

  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (err && typeof err === "object") {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return axiosErr.response?.data?.message || axiosErr.message || fallback;
    }
    return fallback;
  };

  // Save callback handlers
  const handleSaveHero = (heroFields: HeroSection) => {
    setErrorSection(null);
    setSavingSection("hero");
    updateHomeMutation.mutate(
      {
        data: {
          topBanner: {
            text: heroFields.topBannerText,
            isActive: heroFields.isTopBannerActive,
          },
          hero: {
            backgroundMediaUrl: heroFields.backgroundMediaUrl,
            videoUrl: heroFields.videoUrl || "",
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
          setSavingSection(null);
          setSuccessModalData({
            title: "Hero Banner Saved!",
            message: "Hero Banner has been updated successfully.",
          });
        },
        onError: (err: unknown) => {
          setSavingSection(null);
          setErrorSection({
            section: "hero",
            message: getErrorMessage(
              err,
              "Failed to update Hero Banner. Please try again.",
            ),
          });
        },
      },
    );
  };

  const handleSaveMainBg = (bgUrl: string) => {
    setErrorSection(null);
    setSavingSection("mainBg");
    updateHomeMutation.mutate(
      {
        data: {
          mainBg: bgUrl,
        },
      },
      {
        onSuccess: () => {
          setSavingSection(null);
          setSuccessModalData({
            title: "Main Background Saved!",
            message: "Main background has been updated successfully.",
          });
        },
        onError: (err: unknown) => {
          setSavingSection(null);
          setErrorSection({
            section: "mainBg",
            message: getErrorMessage(
              err,
              "Failed to update Main Background. Please try again.",
            ),
          });
        },
      },
    );
  };

  const handleSaveBundles = (bundlesFields: typeof bundlesData) => {
    setErrorSection(null);
    setSavingSection("bundles");
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
          setSavingSection(null);
          setSuccessModalData({
            title: "Boom Bundles Saved!",
            message: "Boom Bundles have been updated successfully.",
          });
        },
        onError: (err: unknown) => {
          setSavingSection(null);
          setErrorSection({
            section: "bundles",
            message: getErrorMessage(
              err,
              "Failed to update Boom Bundles. Please try again.",
            ),
          });
        },
      },
    );
  };

  const handleSaveGames = (sectionData: ChooseGameSectionData) => {
    setErrorSection(null);
    setSavingSection("games");
    updateHomeMutation.mutate(
      {
        data: {
          chooseGameSection: sectionData,
        },
      },
      {
        onSuccess: () => {
          setSavingSection(null);
          setSuccessModalData({
            title: "Choose Game Section Saved!",
            message: "Choose Game section has been updated successfully.",
          });
        },
        onError: (err: unknown) => {
          setSavingSection(null);
          setErrorSection({
            section: "games",
            message: getErrorMessage(
              err,
              "Failed to update Choose Game section. Please try again.",
            ),
          });
        },
      },
    );
  };

  const handleSaveBitesEvents = (
    bitesFields: typeof bitesData,
    nightsOutFields: typeof nightsOutData,
  ) => {
    setErrorSection(null);
    setSavingSection("bites");
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
          setSavingSection(null);
          setSuccessModalData({
            title: "Bites & Events Saved!",
            message: "Bites & Events section has been updated successfully.",
          });
        },
        onError: (err: unknown) => {
          setSavingSection(null);
          setErrorSection({
            section: "bites",
            message: getErrorMessage(
              err,
              "Failed to update Bites & Events section. Please try again.",
            ),
          });
        },
      },
    );
  };

  const handleSaveNewsletter = (newsletterFields: typeof newsletterData) => {
    setErrorSection(null);
    setSavingSection("newsletter");
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
          setSavingSection(null);
          setSuccessModalData({
            title: "Newsletter Section Saved!",
            message:
              "Sign Up / Newsletter section has been updated successfully.",
          });
        },
        onError: (err: unknown) => {
          setSavingSection(null);
          setErrorSection({
            section: "newsletter",
            message: getErrorMessage(
              err,
              "Failed to update Newsletter section. Please try again.",
            ),
          });
        },
      },
    );
  };

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Manage Home</h1>
        <p className="text-gray-400">
          Configure the content displayed on the homepage.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-[#3A3530] mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setErrorSection(null);
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
            isSaving={savingSection === "hero"}
            errorMessage={
              errorSection?.section === "hero" ? errorSection.message : null
            }
          />
        )}
        {activeTab === "mainBg" && (
          <MainBackgroundForm
            initialData={mainBgData}
            onSave={handleSaveMainBg}
            isSaving={savingSection === "mainBg"}
            errorMessage={
              errorSection?.section === "mainBg"
                ? errorSection.message
                : null
            }
          />
        )}
        {activeTab === "bundles" && (
          <BoomBundlesForm
            initialData={bundlesData}
            onSave={handleSaveBundles}
            isSaving={savingSection === "bundles"}
            errorMessage={
              errorSection?.section === "bundles" ? errorSection.message : null
            }
          />
        )}
        {activeTab === "location" && <LocationHoursForm />}
        {activeTab === "games" && (
          <ChooseGamesForm
            initialData={chooseGameSectionData}
            onSave={handleSaveGames}
            isSaving={savingSection === "games"}
            errorMessage={
              errorSection?.section === "games" ? errorSection.message : null
            }
          />
        )}
        {activeTab === "bites" && (
          <BitesAndEventsForm
            initialBites={bitesData}
            initialNightsOut={nightsOutData}
            onSave={handleSaveBitesEvents}
            isSaving={savingSection === "bites"}
            errorMessage={
              errorSection?.section === "bites" ? errorSection.message : null
            }
          />
        )}
        {activeTab === "newsletter" && (
          <NewsletterSectionForm
            initialData={newsletterData}
            onSave={handleSaveNewsletter}
            isSaving={savingSection === "newsletter"}
            errorMessage={
              errorSection?.section === "newsletter"
                ? errorSection.message
                : null
            }
          />
        )}
      </div>

      <SuccessModal
        isOpen={Boolean(successModalData)}
        title={successModalData?.title}
        message={successModalData?.message}
        buttonText="OK"
        onConfirm={() => setSuccessModalData(null)}
      />
    </div>
  );
};

export default ManageHome;
