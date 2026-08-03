import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { HeaderCategory, HeaderSubItem } from '@/components/ManageHeader/types';
import { initialMockData } from '@/components/ManageHeader/mockData';
import { Chevron } from '@/assets/icons';
import BoomBundleForm from './forms/BoomBundleForm';
import { useHeaderCategoriesQuery, useMenuItemQuery } from '@/hooks/useHeaderCategories';
import {
  fetchBoomBundle,
  createBoomBundle,
  updateBoomBundle,
  createMenuItem,
  updateMenuItem,
  extractId,
  type BoomBundlePayload,
} from '@/hooks/useHeaderSubItems';

const BoomBundleFormPage: React.FC = () => {
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
        let menuItem = menuItemResponse?.menuItem;
        const linkedId = menuItem?.linkedItemId || subItemId;
        let realData: any = null;

        if (linkedId) {
          try {
            const res = await fetchBoomBundle(linkedId);
            realData = res?.boomBundle || res?.data || res;
          } catch (err) {
            console.warn('Could not fetch boom bundle from API:', err);
          }
        }

        if (realData || menuItem) {
          const combined: HeaderSubItem = {
            id: menuItem?._id || subItemId,
            linkedItemId: realData?._id || menuItem?.linkedItemId || subItemId,
            name: menuItem?.title || realData?.name || '',
            path: menuItem?.linkUrl || realData?.path || '',
            icon: realData?.icon || menuItem?.iconUrl || '',
            pageType: 'boom-bundle',
            pageHeadline: realData?.pageHeadline || '',
            pageHeroImage: realData?.pageHeroImage || '',
            heroBookNowLink: realData?.heroBookNowLink || '',
            sectionHeadline: realData?.sectionHeadline || '',
            sectionDescription: realData?.sectionDescription || '',
            bundleCards: realData?.bundleCards || [],
            checklistItems: realData?.checklistItems || [],
            importantInfoHeading: realData?.importantInfoHeading || '',
            importantInfoText: realData?.importantInfoText || '',
            isActive: realData?.isActive ?? menuItem?.isActive ?? true,
            isHidden: !(realData?.isActive ?? menuItem?.isActive ?? true),
          };

          if (isMounted) {
            setInitialData(combined);
            setLoading(false);
            return;
          }
        }

        // Fallback to local storage
        const saved = localStorage.getItem('headerCategories');
        const categories: HeaderCategory[] = saved ? JSON.parse(saved) : (categoriesData?.categories || initialMockData);
        const category = categories.find(c => c.id === categoryId);
        const subItem = category?.subItems.find(s => s.id === subItemId);
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

    const pagePayload: BoomBundlePayload = {
      name: subItemData.name || '',
      path: subItemData.path || '',
      icon: subItemData.icon || '',
      pageHeadline: subItemData.pageHeadline || '',
      pageHeroImage: subItemData.pageHeroImage || '',
      heroBookNowLink: subItemData.heroBookNowLink || '',
      sectionHeadline: subItemData.sectionHeadline || '',
      sectionDescription: subItemData.sectionDescription || '',
      bundleCards: subItemData.bundleCards || [],
      checklistItems: subItemData.checklistItems || [],
      importantInfoHeading: subItemData.importantInfoHeading || '',
      importantInfoText: subItemData.importantInfoText || '',
      isActive: subItemData.isActive ?? true,
    };

    let targetLinkedItemId = initialData?.linkedItemId;

    try {
      if (subItemId && subItemId !== 'new' && targetLinkedItemId) {
        // 1. Update Boom Bundle real entity
        await updateBoomBundle(targetLinkedItemId, pagePayload);

        // 2. Update Menu Item (including all navigation setup fields)
        await updateMenuItem(subItemId, {
          title: subItemData.name || '',
          name: subItemData.name || '',
          section: categoryId || 'boom-bundles',
          sectionLabel: 'Boom Bundles',
          linkUrl: subItemData.path || '',
          path: subItemData.path || '',
          icon: subItemData.icon || '',
          iconUrl: subItemData.icon || '',
          type: 'boom-bundle',
          linkedItemId: targetLinkedItemId,
          isActive: subItemData.isActive ?? true,
        });
      } else {
        // 1. Create Boom Bundle real entity
        const res = await createBoomBundle(pagePayload);
        targetLinkedItemId = extractId(res);

        // 2. Create Menu Item linked to created page (including all navigation setup fields)
        await createMenuItem({
          title: subItemData.name || '',
          name: subItemData.name || '',
          section: categoryId || 'boom-bundles',
          sectionLabel: 'Boom Bundles',
          linkUrl: subItemData.path || '',
          path: subItemData.path || '',
          icon: subItemData.icon || '',
          iconUrl: subItemData.icon || '',
          type: 'boom-bundle',
          linkedItemId: targetLinkedItemId,
          order: 1,
          isActive: subItemData.isActive ?? true,
        });
      }
    } catch (error) {
      console.error('Error saving Boom Bundle API:', error);
    }

    // Update local storage fallback
    const saved = localStorage.getItem('headerCategories');
    let categories: HeaderCategory[] = saved ? JSON.parse(saved) : initialMockData;
    categories = categories.map(category => {
      if (category.id === categoryId) {
        let newSubItems = [...category.subItems];
        if (subItemId && subItemId !== 'new') {
          newSubItems = newSubItems.map(item =>
            item.id === subItemId ? { ...item, ...subItemData, linkedItemId: targetLinkedItemId, pageType: 'boom-bundle' } as HeaderSubItem : item
          );
        } else {
          newSubItems.push({
            ...subItemData,
            id: Date.now().toString(),
            linkedItemId: targetLinkedItemId,
            isHidden: false,
            pageType: 'boom-bundle'
          } as HeaderSubItem);
        }
        return { ...category, subItems: newSubItems };
      }
      return category;
    });
    localStorage.setItem('headerCategories', JSON.stringify(categories));

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
        <p className="text-gray-400 text-sm animate-pulse">Loading Boom Bundle details...</p>
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
          {subItemId && subItemId !== 'new' ? 'Edit Boom Bundle' : 'Add Boom Bundle'}
        </h1>
      </div>

      <div className="bg-[#1C1C1C] rounded-xl border border-[#3A3530] w-full max-w-4xl overflow-hidden mx-auto">
        <BoomBundleForm initialData={initialData} onClose={handleClose} onSave={handleSave} />
      </div>
    </div>
  );
};

export default BoomBundleFormPage;
