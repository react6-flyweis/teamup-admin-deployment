import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { HeaderSubItem } from '@/components/ManageHeader/types';
import { Chevron } from '@/assets/icons';
import QueensNightForm from './forms/QueensNightForm';
import { useHeaderCategoriesQuery, useMenuItemQuery } from '@/hooks/useHeaderCategories';
import {
  fetchQueensNight,
  createQueensNight,
  updateQueensNight,
  createMenuItem,
  updateMenuItem,
  extractId,
  type QueensNightPayload,
} from '@/hooks/useHeaderSubItems';

const QueensNightFormPage: React.FC = () => {
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

      if (subItemId && subItemId !== 'new') {
        const menuItem = menuItemResponse?.menuItem;
        const linkedId = menuItem?.linkedItemId || subItemId;
        let realData: any = null;

        if (linkedId) {
          try {
            const res = await fetchQueensNight(linkedId);
            realData = res?.queensNight || res?.data || res;
          } catch (err) {
            console.warn('Could not fetch queens night from API:', err);
          }
        }

        if (realData || menuItem) {
          const combined: HeaderSubItem = {
            id: menuItem?._id || subItemId,
            linkedItemId: realData?._id || menuItem?.linkedItemId || subItemId,
            name: menuItem?.title || realData?.name || '',
            path: menuItem?.linkUrl || realData?.path || '',
            icon: realData?.icon || menuItem?.iconUrl || '',
            pageType: 'queens-night',
            pageHeadline: realData?.pageHeadline || '',
            pageHeroImage: realData?.pageHeroImage || '',
            heroBookNowLink: realData?.heroBookNowLink || '',
            sectionHeadline: realData?.sectionHeadline || '',
            sectionDescription: realData?.sectionDescription || '',
            checklistItems: realData?.checklistItems || [],
            howToBookHeadline: realData?.howToBookHeadline || '',
            howToBookBody: realData?.howToBookBody || '',
            statsBlocks: realData?.statsBlocks || [],
            otherGamesHeading: realData?.otherGamesHeading || '',
            otherGamesCards: realData?.otherGamesCards || [],
            isActive: realData?.isActive ?? menuItem?.isActive ?? true,
            isHidden: !(realData?.isActive ?? menuItem?.isActive ?? true),
          };

          if (isMounted) {
            setInitialData(combined);
            setLoading(false);
            return;
          }
        }

        // Fallback to categoriesData
        const category = categoriesData?.categories?.find(c => c.id === categoryId);
        const subItem = category?.subItems?.find(s => s.id === subItemId);
        if (subItem && isMounted) {
          setInitialData(subItem);
        }
      }

      if (isMounted) setLoading(false);
    };

    loadData();
    return () => { isMounted = false; };
  }, [subItemId, categoryId, menuItemResponse, isMenuItemLoading, categoriesData]);

  const handleSave = async (subItemData: Partial<HeaderSubItem>) => {
    setLoading(true);

    const pagePayload: QueensNightPayload = {
      name: subItemData.name || '',
      path: subItemData.path || '',
      icon: subItemData.icon || '',
      pageHeadline: subItemData.pageHeadline || '',
      pageHeroImage: subItemData.pageHeroImage || '',
      heroBookNowLink: subItemData.heroBookNowLink || '',
      sectionHeadline: subItemData.sectionHeadline || '',
      sectionDescription: subItemData.sectionDescription || '',
      checklistItems: subItemData.checklistItems || [],
      howToBookHeadline: subItemData.howToBookHeadline || '',
      howToBookBody: subItemData.howToBookBody || '',
      statsBlocks: subItemData.statsBlocks || [],
      otherGamesHeading: subItemData.otherGamesHeading || '',
      otherGamesCards: subItemData.otherGamesCards || [],
      isActive: subItemData.isActive ?? true,
    };

    let targetLinkedItemId = initialData?.linkedItemId;

    try {
      if (subItemId && subItemId !== 'new' && targetLinkedItemId) {
        // 1. Update Queens Night real entity
        await updateQueensNight(targetLinkedItemId, pagePayload);

        // 2. Update Menu Item (including all navigation setup fields)
        await updateMenuItem(subItemId, {
          title: subItemData.name || '',
          name: subItemData.name || '',
          section: categoryId || 'queens-nights',
          sectionLabel: 'Queens Night',
          linkUrl: subItemData.path || '',
          path: subItemData.path || '',
          icon: subItemData.icon || '',
          iconUrl: subItemData.icon || '',
          type: 'queens-night',
          linkedItemId: targetLinkedItemId,
          isActive: subItemData.isActive ?? true,
        });
      } else {
        // 1. Create Queens Night real entity
        const res = await createQueensNight(pagePayload);
        targetLinkedItemId = extractId(res);

        // 2. Create Menu Item linked to created page (including all navigation setup fields)
        await createMenuItem({
          title: subItemData.name || '',
          name: subItemData.name || '',
          section: categoryId || 'queens-nights',
          sectionLabel: 'Queens Night',
          linkUrl: subItemData.path || '',
          path: subItemData.path || '',
          icon: subItemData.icon || '',
          iconUrl: subItemData.icon || '',
          type: 'queens-night',
          linkedItemId: targetLinkedItemId,
          order: 1,
          isActive: subItemData.isActive ?? true,
        });
      }
    } catch (error) {
      console.error('Error saving Queens Night API:', error);
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
        <div className="w-10 h-10 border-4 border-[#E1017D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm animate-pulse">Loading Queens Night details...</p>
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
          {subItemId && subItemId !== 'new' ? 'Edit Queens Night' : 'Add Queens Night'}
        </h1>
      </div>

      <div className="bg-[#1C1C1C] rounded-xl border border-[#3A3530] w-full max-w-4xl overflow-hidden mx-auto">
        <QueensNightForm initialData={initialData} onClose={handleClose} onSave={handleSave} />
      </div>
    </div>
  );
};

export default QueensNightFormPage;
