import React, { useState, useMemo } from 'react';
import {
  useCorporateQuery,
  useUpdateCorporateMutation,
  DEFAULT_CORPORATES_DATA,
  type CorporatesData,
} from '@/hooks/useCorporate';
import { useLocationStore } from '@/store/locationStore';
import CorporateHeroForm from '@/components/ManageCorporate/CorporateHeroForm';
import CorporatePackagesForm from '@/components/ManageCorporate/CorporatePackagesForm';
import CorporateBookOnlineForm from '@/components/ManageCorporate/CorporateBookOnlineForm';
import CorporatePrivateHireForm from '@/components/ManageCorporate/CorporatePrivateHireForm';
import CorporateOtherGamesForm from '@/components/ManageCorporate/CorporateOtherGamesForm';
import SuccessModal from '@/components/common/SuccessModal';

type Tab = 'all' | 'hero' | 'packages' | 'promos' | 'games';

const ManageCorporate: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [errorSection, setErrorSection] = useState<{ section: string; message: string } | null>(null);
  const [successModalData, setSuccessModalData] = useState<{ title: string; message: string } | null>(null);

  const { selectedLocation } = useLocationStore();
  const locationSlug = selectedLocation?.slug;

  const { data: homeResponse, isLoading, error } = useCorporateQuery(locationSlug);
  const updateCorporateMutation = useUpdateCorporateMutation(locationSlug);

  // Extract or default corporate data
  const rawCorporate = homeResponse?.content?.data?.corporates;
  const corporateData: CorporatesData = useMemo(() => ({
    pageUrl: rawCorporate?.pageUrl ?? DEFAULT_CORPORATES_DATA.pageUrl,
    heroTitle: rawCorporate?.heroTitle ?? DEFAULT_CORPORATES_DATA.heroTitle,
    heroImageUrl: rawCorporate?.heroImageUrl ?? DEFAULT_CORPORATES_DATA.heroImageUrl,
    packagesTitle: rawCorporate?.packagesTitle ?? DEFAULT_CORPORATES_DATA.packagesTitle,
    packagesDescription:
      rawCorporate?.packagesDescription ?? DEFAULT_CORPORATES_DATA.packagesDescription,
    packages: rawCorporate?.packages ?? DEFAULT_CORPORATES_DATA.packages,
    budgetText: rawCorporate?.budgetText ?? DEFAULT_CORPORATES_DATA.budgetText,
    bookOnline: rawCorporate?.bookOnline ?? DEFAULT_CORPORATES_DATA.bookOnline,
    privateHire: rawCorporate?.privateHire ?? DEFAULT_CORPORATES_DATA.privateHire,
    otherGames: rawCorporate?.otherGames ?? DEFAULT_CORPORATES_DATA.otherGames,
  }), [rawCorporate]);

  const handleSaveCorporate = (
    partial: Partial<CorporatesData>,
    sectionKey: string,
    label: string
  ) => {
    setErrorSection(null);
    setSavingSection(sectionKey);

    const merged: CorporatesData = {
      ...corporateData,
      ...partial,
    };

    updateCorporateMutation.mutate(
      { corporates: merged },
      {
        onSuccess: () => {
          setSavingSection(null);
          setSuccessModalData({
            title: 'Corporate Saved!',
            message: `${label} has been saved successfully.`,
          });
        },
        onError: (err: unknown) => {
          setSavingSection(null);
          console.error(`Failed to update ${label}:`, err);
          const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
          const msg = apiErr?.response?.data?.message || apiErr?.message || `Failed to save ${label}. Please try again.`;
          setErrorSection({ section: sectionKey, message: msg });
        },
      }
    );
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All Sections' },
    { id: 'hero', label: 'Hero & Page URL' },
    { id: 'packages', label: 'Party Packages' },
    { id: 'promos', label: 'Book Online & Private Hire' },
    { id: 'games', label: 'Other Games' },
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
        <div className="text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-xl mx-auto mt-12 text-center">
          <h3 className="text-lg font-bold mb-2">Error Loading Corporate Content</h3>
          <p className="text-sm text-gray-300">
            Failed to retrieve content for{' '}
            <span className="text-white font-semibold">
              {selectedLocation?.name || locationSlug || 'selected venue'}
            </span>
            . Please check your network or try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Manage Corporate Page</h1>
          {selectedLocation && (
            <span className="px-2.5 py-1 rounded bg-[#2A2A2A] border border-[#3A3530] text-xs font-medium text-gray-300">
              {selectedLocation.name}
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm mt-1">
          Configure party packages, pricing, private hire inquiries, and attractions for corporate events.
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
                ? 'border-[#E1017D] text-[#E1017D]'
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Forms Content */}
      <div className="space-y-8">
        {(activeTab === 'all' || activeTab === 'hero') && (
          <CorporateHeroForm
            initialData={{
              pageUrl: corporateData.pageUrl || '',
              heroTitle: corporateData.heroTitle || '',
              heroImageUrl: corporateData.heroImageUrl || '',
            }}
            onSave={(heroFields) => handleSaveCorporate(heroFields, 'hero', 'Hero Section')}
            isSaving={savingSection === 'hero'}
            errorMessage={errorSection?.section === 'hero' ? errorSection.message : null}
          />
        )}

        {(activeTab === 'all' || activeTab === 'packages') && (
          <CorporatePackagesForm
            initialData={{
              packagesTitle: corporateData.packagesTitle || '',
              packagesDescription: corporateData.packagesDescription || '',
              packages: corporateData.packages || [],
              budgetText: corporateData.budgetText || '',
            }}
            onSave={(packagesFields) => handleSaveCorporate(packagesFields, 'packages', 'Corporate Packages')}
            isSaving={savingSection === 'packages'}
            errorMessage={errorSection?.section === 'packages' ? errorSection.message : null}
          />
        )}

        {(activeTab === 'all' || activeTab === 'promos') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CorporateBookOnlineForm
              initialData={
                corporateData.bookOnline || {
                  title: 'BOOK ONLINE',
                  body: '',
                  imageUrl: '',
                  buttonText: 'BOOK NOW',
                  buttonLink: '',
                }
              }
              onSave={(bookOnlineFields) =>
                handleSaveCorporate({ bookOnline: bookOnlineFields }, 'bookOnline', 'Book Online Section')
              }
              isSaving={savingSection === 'bookOnline'}
              errorMessage={errorSection?.section === 'bookOnline' ? errorSection.message : null}
            />

            <CorporatePrivateHireForm
              initialData={
                corporateData.privateHire || {
                  title: 'PRIVATE HIRE',
                  body: '',
                  imageUrl: '',
                  buttonText: 'CONTACT US',
                  buttonLink: '',
                }
              }
              onSave={(privateHireFields) =>
                handleSaveCorporate({ privateHire: privateHireFields }, 'privateHire', 'Private Hire Section')
              }
              isSaving={savingSection === 'privateHire'}
              errorMessage={errorSection?.section === 'privateHire' ? errorSection.message : null}
            />
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'games') && (
          <CorporateOtherGamesForm
            initialData={
              corporateData.otherGames || {
                title: 'OTHER GAMES',
                items: [],
              }
            }
            onSave={(gamesFields) =>
              handleSaveCorporate({ otherGames: gamesFields }, 'otherGames', 'Other Games Section')
            }
            isSaving={savingSection === 'otherGames'}
            errorMessage={errorSection?.section === 'otherGames' ? errorSection.message : null}
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

export default ManageCorporate;
