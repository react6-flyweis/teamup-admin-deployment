import React, { useState, useMemo } from 'react';
import { useLocationStore } from '@/store/locationStore';
import {
  useEventPageQuery,
  useUpdateEventPageMutation,
  getInitialEventPageData,
  type EventPageType,
} from '@/hooks/useEventPage';
import type {
  EventPageData,
  EventsHeroData,
  AgeGroupsSectionData,
  InfoCardsSectionData,
} from '@/types/events';
import EventsHeroForm from './EventsHeroForm';
import AgeGroupCardsSection from './AgeGroupCardsSection';
import InfoCardsSection from './InfoCardsSection';
import SuccessModal from '@/components/common/SuccessModal';

type Tab = 'hero' | 'ageGroups' | 'infoCards';

interface ManageEventsPageProps {
  pageType: EventPageType;
  pageTitle: string;
  pageDescription: string;
}

export const ManageEventsPage: React.FC<ManageEventsPageProps> = ({
  pageType,
  pageTitle,
  pageDescription,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [errorSection, setErrorSection] = useState<{ section: string; message: string } | null>(null);
  const [successModalData, setSuccessModalData] = useState<{ title: string; message: string } | null>(null);

  const { selectedLocation } = useLocationStore();
  const locationSlug = selectedLocation?.slug;

  const { data: homeResponse, isLoading, error } = useEventPageQuery(pageType, locationSlug);
  const updateMutation = useUpdateEventPageMutation(pageType, locationSlug);

  const rawData = homeResponse?.content?.data?.[pageType];
  const pageData: EventPageData = useMemo(() => {
    return getInitialEventPageData(rawData as EventPageData | undefined, pageType);
  }, [rawData, pageType]);

  const handleSaveSection = (
    partial: Partial<EventPageData>,
    sectionKey: string,
    sectionLabel: string
  ) => {
    setErrorSection(null);
    setSavingSection(sectionKey);

    const merged: EventPageData = {
      ...pageData,
      ...partial,
    };

    updateMutation.mutate(
      { data: merged, locationSlug },
      {
        onSuccess: () => {
          setSavingSection(null);
          setSuccessModalData({
            title: 'Changes Saved!',
            message: `${sectionLabel} has been successfully updated.`,
          });
        },
        onError: (err: unknown) => {
          setSavingSection(null);
          console.error(`Failed to update ${sectionLabel}:`, err);
          const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
          const msg = apiErr?.response?.data?.message || apiErr?.message || `Failed to save ${sectionLabel}. Please try again.`;
          setErrorSection({ section: sectionKey, message: msg });
        },
      }
    );
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'hero', label: 'Hero Banner' },
    { id: 'ageGroups', label: 'Age Group Cards' },
    { id: 'infoCards', label: 'Experience Info Cards' },
  ];

  if (isLoading) {
    return (
      <div className="p-6 text-white min-h-[60vh] flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#E1017D] border-t-transparent"></div>
        <span className="text-xs text-gray-400">Loading {pageTitle} content...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white min-h-[60vh]">
        <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-xl mx-auto mt-12 text-center">
          <h3 className="text-base font-bold mb-2">Error Loading Page Content</h3>
          <p className="text-xs text-gray-400 mb-4">
            Could not fetch content for {pageTitle}. Please check your connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#E1017D] hover:bg-[#c2016c] text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E1017D]">
              Page Management
            </span>
            {selectedLocation && (
              <span className="text-xs bg-[#242424] px-2.5 py-0.5 rounded text-gray-300 border border-[#3A3530]">
                {selectedLocation.name}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {pageDescription}
          </p>
        </div>

        {/* Action / Count info */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {pageData.ageGroups.cards.length} Age Groups &bull; {pageData.infoCards.cards.length} Info Cards
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-[#3A3530] gap-2 pb-px no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#E1017D] text-[#E1017D]'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Section (Active Tab Only) */}
      <div className="space-y-8">
        {/* Hero Form */}
        {activeTab === 'hero' && (
          <EventsHeroForm
            initialData={pageData.hero}
            pageLabel={pageTitle}
            isSaving={savingSection === 'hero'}
            errorMessage={errorSection?.section === 'hero' ? errorSection.message : null}
            onSave={(heroData: EventsHeroData) =>
              handleSaveSection({ hero: heroData }, 'hero', 'Hero Section')
            }
          />
        )}

        {/* Age Group Cards Section */}
        {activeTab === 'ageGroups' && (
          <AgeGroupCardsSection
            initialData={pageData.ageGroups}
            pageLabel={pageTitle}
            isSaving={savingSection === 'ageGroups'}
            errorMessage={errorSection?.section === 'ageGroups' ? errorSection.message : null}
            onSave={(ageGroupsData: AgeGroupsSectionData) =>
              handleSaveSection({ ageGroups: ageGroupsData }, 'ageGroups', 'Age Group Cards')
            }
          />
        )}

        {/* Info Cards Section */}
        {activeTab === 'infoCards' && (
          <InfoCardsSection
            initialData={pageData.infoCards}
            pageLabel={pageTitle}
            isSaving={savingSection === 'infoCards'}
            errorMessage={errorSection?.section === 'infoCards' ? errorSection.message : null}
            onSave={(infoCardsData: InfoCardsSectionData) =>
              handleSaveSection({ infoCards: infoCardsData }, 'infoCards', 'Experience Info Cards')
            }
          />
        )}
      </div>

      {/* Success Modal Notification */}
      {successModalData && (
        <SuccessModal
          isOpen={!!successModalData}
          onConfirm={() => setSuccessModalData(null)}
          title={successModalData.title}
          message={successModalData.message}
        />
      )}
    </div>
  );
};

export default ManageEventsPage;
