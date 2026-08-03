import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { HeaderCategory, HeaderSubItem } from '@/components/ManageHeader/types';
import { initialMockData } from '@/components/ManageHeader/mockData';
import { Chevron } from '@/assets/icons';
import GameForm from './forms/GameForm';
import { useHeaderCategoriesQuery, useMenuItemQuery } from '@/hooks/useHeaderCategories';

const GameFormPage: React.FC = () => {
  const { categoryId, subItemId } = useParams<{ categoryId: string; subItemId: string }>();
  const navigate = useNavigate();
  
  const { data: categoriesData } = useHeaderCategoriesQuery();
  const { data: menuItemResponse, isLoading: isMenuItemLoading } = useMenuItemQuery(subItemId);

  const [initialData, setInitialData] = useState<HeaderSubItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMenuItemLoading) return;

    // 1. Check if backend API returned details for menuItemId
    if (menuItemResponse?.menuItem) {
      const apiItem = menuItemResponse.menuItem;
      
      // Parse details array into pageDetails
      const detailsMap: Record<string, string> = {};
      if (Array.isArray(apiItem.details)) {
        apiItem.details.forEach((d: { label: string; value: string }) => {
          detailsMap[d.label] = d.value;
        });
      }

      const formatted: HeaderSubItem = {
        id: apiItem._id || subItemId || '',
        name: apiItem.title || '',
        slug: apiItem.slug || '',
        path: apiItem.linkUrl || '',
        icon: apiItem.iconUrl || '',
        type: apiItem.type || 'game',
        linkedItemId: apiItem.linkedItemId || undefined,
        pageHeadline: apiItem.tagline || '',
        pageTagline: apiItem.tagline || '',
        cardDescription: apiItem.taglineDescription || apiItem.description || '',
        pageHeroImage: apiItem.heroImageUrl || apiItem.imageUrl || '',
        heroBookNowLink: apiItem.bookingUrl || '',
        isActive: apiItem.isActive !== undefined ? apiItem.isActive : true,
        isHidden: apiItem.isActive !== undefined ? !apiItem.isActive : false,
        pageDetails: {
          peoplePerMachine: detailsMap['How Many'] || '',
          timeMin: detailsMap['Time'] || '',
          lanes: detailsMap['How Many LANES'] || '',
          price: detailsMap['Price'] || '',
          minAge: detailsMap['Minimum Age'] || '',
          wheelchairAccess: detailsMap['Wheelchair Access']?.toLowerCase() === 'yes',
        },
      };

      setInitialData(formatted);
      setLoading(false);
      return;
    }

    // 2. Fallback to localStorage / categoriesData if API response is not available
    const saved = localStorage.getItem('headerCategories');
    const categories: HeaderCategory[] = saved ? JSON.parse(saved) : (categoriesData?.categories || initialMockData);
    const category = categories.find(c => c.id === categoryId);

    if (subItemId && subItemId !== 'new') {
      const subItem = category?.subItems.find(s => s.id === subItemId);
      if (subItem) {
        setInitialData(subItem);
      }
    }
    setLoading(false);
  }, [categoryId, subItemId, menuItemResponse, categoriesData, isMenuItemLoading]);



  const handleSave = (subItemData: Partial<HeaderSubItem>) => {
    const saved = localStorage.getItem('headerCategories');
    let categories: HeaderCategory[] = saved ? JSON.parse(saved) : initialMockData;

    categories = categories.map(category => {
      if (category.id === categoryId) {
        let newSubItems = [...category.subItems];
        if (subItemId && subItemId !== 'new') {
          newSubItems = newSubItems.map(item => item.id === subItemId ? { ...item, ...subItemData } as HeaderSubItem : item);
        } else {
          newSubItems.push({ ...subItemData, id: Date.now().toString(), isHidden: false } as HeaderSubItem);
        }
        return { ...category, subItems: newSubItems };
      }
      return category;
    });

    localStorage.setItem('headerCategories', JSON.stringify(categories));
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
