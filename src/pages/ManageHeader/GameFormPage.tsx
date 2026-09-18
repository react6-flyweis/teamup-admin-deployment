import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { HeaderSubItem } from '@/components/ManageHeader/types';
import { Chevron } from '@/assets/icons';
import GameForm from './forms/GameForm';
import { useHeaderCategoriesQuery, useMenuItemQuery } from '@/hooks/useHeaderCategories';
import { createMenuItem, updateMenuItem } from '@/hooks/useHeaderSubItems';
import { fetchGame } from '@/hooks/useGames';
import SuccessModal from '@/components/common/SuccessModal';

const GameFormPage: React.FC = () => {
  const { categoryId, subItemId } = useParams<{ categoryId: string; subItemId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: categoriesData } = useHeaderCategoriesQuery();
  const { data: menuItemResponse, isLoading: isMenuItemLoading } = useMenuItemQuery(subItemId);

  const [initialData, setInitialData] = useState<HeaderSubItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMenuItemLoading) return;

      // 1. Check if backend API returned details for menuItemId
      if (menuItemResponse?.menuItem) {
        const apiItem = menuItemResponse.menuItem;
        const linkedId = apiItem.linkedItemId != null ? String(apiItem.linkedItemId) : undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let gameData: any = null;

        if (linkedId) {
          try {
            const res = await fetchGame(linkedId);
            gameData = res?.game || res?.data || res;
          } catch (err) {
            console.warn('Could not fetch game from API:', err);
          }
        }

        const detailsMap: Record<string, string> = {};
        if (Array.isArray(apiItem.details)) {
          apiItem.details.forEach((d: { label: string; value: string }) => {
            detailsMap[d.label] = d.value;
          });
        }

        const price = gameData?.pricePerPerson ?? gameData?.priceFrom;
        const time = gameData?.timeOption || gameData?.duration;
        const lanes = gameData?.totalLanes != null ? String(gameData.totalLanes) : '';
        const people = gameData?.peopleAllowedPerLane != null ? String(gameData.peopleAllowedPerLane) : '';

        const formatted: HeaderSubItem = {
          id: apiItem._id || subItemId || '',
          name: apiItem.title || gameData?.name || gameData?.gameName || '',
          slug: apiItem.slug || gameData?.slug || '',
          path: apiItem.linkUrl || (gameData?.slug ? `/games/${gameData.slug}` : ''),
          icon: apiItem.icon || apiItem.iconUrl || '',
          linkedItemId: linkedId,
          pageHeadline: apiItem.title || gameData?.name || '',
          pageTagline: detailsMap['Tagline'] || '',
          cardDescription: apiItem.taglineDescription || gameData?.description || '',
          pageHeroImage: gameData?.imageUrl || gameData?.cardImageUrl || gameData?.bannerImageUrl || '',
          heroBookNowLink: apiItem.bookingUrl || '',
          pageDetails: {
            peoplePerMachine: people,
            timeMin: time || '',
            lanes: lanes,
            price: price != null ? String(price) : '',
            minAge: gameData?.minimumAgeRequirement || '',
            wheelchairAccess: gameData?.wheelchairAccessible ?? false,
          },
        };

        if (isMounted) {
          setInitialData(formatted);
          setLoading(false);
        }
        return;
      }

      // 2. Fallback to categories query if menuItemResponse didn't find it
      if (subItemId && subItemId !== 'new' && categoriesData?.categories) {
        for (const cat of categoriesData.categories) {
          const item = cat.subItems.find(s => s.id === subItemId);
          if (item) {
            if (isMounted) {
              setInitialData(item);
              setLoading(false);
            }
            return;
          }
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [categoryId, subItemId, menuItemResponse, categoriesData, isMenuItemLoading]);

  const handleSave = async (subItemData: Partial<HeaderSubItem>) => {
    setErrorMessage(null);

    try {
      if (subItemId && subItemId !== 'new') {
        await updateMenuItem(subItemId, {
          title: subItemData.name || '',
          name: subItemData.name || '',
          section: categoryId || 'choose-game',
          linkUrl: subItemData.path || '',
          path: subItemData.path || '',
          icon: subItemData.icon || '',
          iconUrl: subItemData.icon || '',
          type: 'game',
          linkedItemId: subItemData.linkedItemId,
          isActive: subItemData.isActive ?? true,
        });
      } else {
        await createMenuItem({
          title: subItemData.name || '',
          name: subItemData.name || '',
          section: categoryId || 'choose-game',
          linkUrl: subItemData.path || '',
          path: subItemData.path || '',
          icon: subItemData.icon || '',
          iconUrl: subItemData.icon || '',
          type: 'game',
          linkedItemId: subItemData.linkedItemId,
          order: 1,
          isActive: subItemData.isActive ?? true,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['header-categories'] });
      await queryClient.invalidateQueries({ queryKey: ['menu-item'] });

      setShowSuccessModal(true);
    } catch (err: unknown) {
      console.error('Error saving game menu item:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiErr = err as any;
      const msg = apiErr?.response?.data?.message || apiErr?.message || 'Failed to save game. Please check the fields and try again.';
      setErrorMessage(msg);
      throw err;
    }
  };

  const handleSuccessRedirect = () => {
    setShowSuccessModal(false);
    navigate(categoryId ? `/manage-header?tab=${categoryId}` : '/manage-header');
  };

  const handleClose = () => {
    navigate(categoryId ? `/manage-header?tab=${categoryId}` : '/manage-header');
  };

  if (loading) {
    return (
      <div className="p-6 text-white min-h-screen flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FB3748] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm animate-pulse">Loading game details...</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
          <div className="rotate-90">
            <Chevron size={24} color="currentColor" />
          </div>
        </button>
        <h1 className="text-2xl font-bold">
          {subItemId && subItemId !== 'new' ? 'Edit Game' : 'Add Game'}
        </h1>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-900/40 border border-red-500/60 rounded-xl text-red-200 text-sm flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-300 hover:text-white text-xs underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-[#1C1C1C] rounded-xl border border-[#3A3530] w-full max-w-4xl overflow-hidden mx-auto">
        <GameForm initialData={initialData} subItemId={subItemId} onClose={handleClose} onSave={handleSave} />
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        title={subItemId && subItemId !== 'new' ? 'Game Updated!' : 'Game Added!'}
        message="Game details have been saved successfully."
        buttonText="OK"
        onConfirm={handleSuccessRedirect}
      />
    </div>
  );
};

export default GameFormPage;
