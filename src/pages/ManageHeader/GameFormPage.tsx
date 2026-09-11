import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { HeaderSubItem } from '@/components/ManageHeader/types';
import { Chevron } from '@/assets/icons';
import GameForm from './forms/GameForm';
import { useHeaderCategoriesQuery, useMenuItemQuery } from '@/hooks/useHeaderCategories';
import { createMenuItem, updateMenuItem } from '@/hooks/useHeaderSubItems';
import { fetchGame } from '@/hooks/useGames';

const GameFormPage: React.FC = () => {
  const { categoryId, subItemId } = useParams<{ categoryId: string; subItemId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: categoriesData } = useHeaderCategoriesQuery();
  const { data: menuItemResponse, isLoading: isMenuItemLoading } = useMenuItemQuery(subItemId);

  const [initialData, setInitialData] = useState<HeaderSubItem | null>(null);
  const [loading, setLoading] = useState(true);

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
          icon: apiItem.iconUrl || gameData?.gameIconUrl || '',
          type: apiItem.type || 'game',
          linkedItemId: linkedId,
          linkedGame: gameData ? {
            _id: String(gameData._id || gameData.id),
            name: gameData.name || gameData.gameName || '',
            slug: gameData.slug || '',
            description: gameData.description || '',
            imageUrl: gameData.imageUrl || gameData.cardImageUrl || gameData.bannerImageUrl || '',
            duration: time,
            priceFrom: typeof price === 'number' ? price : price ? parseFloat(price) : undefined,
            tags: gameData.tags || [],
            isActive: gameData.isActive,
          } : undefined,
          pageHeadline: gameData?.name || gameData?.gameName || gameData?.headline || apiItem.tagline || '',
          pageTagline: apiItem.tagline || '',
          cardDescription: gameData?.description || apiItem.taglineDescription || apiItem.description || '',
          pageHeroImage: gameData?.bannerImageUrl || gameData?.cardImageUrl || gameData?.imageUrl || apiItem.heroImageUrl || apiItem.imageUrl || '',
          heroBookNowLink: apiItem.bookingUrl || '',
          isActive: apiItem.isActive !== undefined ? apiItem.isActive : (gameData?.isActive ?? true),
          isHidden: apiItem.isActive !== undefined ? !apiItem.isActive : false,
          pageDetails: {
            peoplePerMachine: people || detailsMap['How Many'] || '',
            timeMin: time || detailsMap['Time'] || '',
            lanes: lanes || detailsMap['How Many LANES'] || '',
            price: (price != null ? String(price) : '') || detailsMap['Price'] || '',
            minAge: gameData?.minimumAgeRequirement || detailsMap['Minimum Age'] || '',
            wheelchairAccess: gameData?.wheelchairAccessible !== undefined ? gameData.wheelchairAccessible : (detailsMap['Wheelchair Access']?.toLowerCase() === 'yes'),
          },
        };

        if (isMounted) {
          setInitialData(formatted);
          setLoading(false);
        }
        return;
      }

      // 2. Fallback to categoriesData if API response is not available
      const category = categoriesData?.categories?.find(c => c.id === categoryId);
      if (subItemId && subItemId !== 'new') {
        const subItem = category?.subItems?.find(s => s.id === subItemId);
        if (subItem && isMounted) {
          setInitialData(subItem);
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
    setLoading(true);

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
    } catch (err) {
      console.error('Error saving game menu item:', err);
    }

    await queryClient.invalidateQueries({ queryKey: ['header-categories'] });
    await queryClient.invalidateQueries({ queryKey: ['menu-item'] });

    navigate('/manage-header');
  };

  const handleClose = () => {
    navigate('/manage-header');
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

      <div className="bg-[#1C1C1C] rounded-xl border border-[#3A3530] w-full max-w-4xl overflow-hidden mx-auto">
        <GameForm initialData={initialData} subItemId={subItemId} onClose={handleClose} onSave={handleSave} />
      </div>
    </div>
  );
};

export default GameFormPage;
