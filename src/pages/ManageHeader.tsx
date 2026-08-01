import React, { useState, useEffect } from 'react';
import type { HeaderCategory, HeaderSubItem } from '@/components/ManageHeader/types';
import { useHeaderCategoriesQuery, useUpdateCategoryMutation } from '@/hooks/useHeaderCategories';
import { useLocationsQuery } from '@/hooks/useLocations';
import { EditIcon, TrashIcon } from '@/assets/icons';
import SubItemList from '@/components/ManageHeader/SubItemList';
import { useNavigate } from 'react-router-dom';
import Toggle from '@/components/common/Toggle';
import TeamUpLogo from '@/assets/TeamUp.png';

const ManageHeader: React.FC = () => {
  const { data: categoriesData, isLoading: isCategoriesLoading } = useHeaderCategoriesQuery();
  const updateCategory = useUpdateCategoryMutation();
  const { data: locationsData, isLoading: isLocationsLoading } = useLocationsQuery();
  const [categories, setCategories] = useState<HeaderCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [locations, setLocations] = useState<string[]>(['🇺🇸 Folsom, CA']);
  const navigate = useNavigate();

  useEffect(() => {
    if (categoriesData?.categories) {
      setCategories(categoriesData.categories);
      if (categoriesData.categories.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(categoriesData.categories[0].id);
      }
    }
  }, [categoriesData, selectedCategoryId]);

  useEffect(() => {
    if (locationsData?.locations) {
      const formattedLocs = locationsData.locations.map(loc => `${loc.city}, ${loc.state}`);
      if (formattedLocs.length > 0) {
        setLocations(formattedLocs);
      }
    }
  }, [locationsData]);


  const saveCategories = (newCategories: HeaderCategory[]) => {
    setCategories(newCategories);
  };

  const toggleVisibility = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    const newIsActive = category ? !!category.isHidden : false;

    // Optimistically update local UI state
    saveCategories(categories.map(cat => cat.id === id ? { ...cat, isHidden: !cat.isHidden } : cat));

    // Send PATCH /api/menu-items/categories/:categoryId with { isActive }
    updateCategory.mutate({ categoryId: id, isActive: newIsActive });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      const updated = categories.filter(cat => cat.id !== id);
      saveCategories(updated);
      if (selectedCategoryId === id) {
        setSelectedCategoryId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };



  const updateSubItems = (categoryId: string, subItems: HeaderSubItem[]) => {
    saveCategories(categories.map(cat => cat.id === categoryId ? { ...cat, subItems } : cat));
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId) || null;
  const availableGames = (categories.find(c => c.name.toLowerCase().includes('choose game'))?.subItems) || [];

  const isLoading = isCategoriesLoading || isLocationsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E1017D] mb-4"></div>
        <p className="text-gray-400 text-sm animate-pulse">Loading header data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Header</h1>
      </div>

      {/* Live Preview Section */}
      <div className="mb-8 border border-[#3A3530] rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-black relative" style={{ backgroundImage: 'radial-gradient(circle at center, #1a1a1a 0%, #050505 100%)' }}>
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img src={TeamUpLogo} alt="Team Up" className="h-10 object-contain" />
            </div>

            <div className="flex items-center gap-8 text-sm">
              {/* Location */}
              <div className="relative group flex items-center gap-2 border border-gray-600 rounded px-3 py-1.5 cursor-pointer hover:bg-gray-800 transition-colors">
                <span className="font-medium text-[13px] text-white">{locations[0]}</span>
                <span className="text-gray-400 text-[10px]">▼</span>

                {locations.length > 1 && (
                  <div className="absolute top-full left-0 mt-1 min-w-[120%] bg-[#111111] border border-[#3A3530] rounded shadow-2xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
                    {locations.slice(1).map((loc, i) => (
                      <div key={i} className="px-3 py-2 hover:bg-[#E1017D] hover:text-white text-gray-300 text-[13px] transition-colors border-b border-[#3A3530] last:border-0 whitespace-nowrap">
                        {loc}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nav items from categories */}
              <div className="flex items-center gap-6 font-medium tracking-wide text-[13px]">
                {categories.filter(c => !c.isHidden).slice(0, 4).map(cat => (
                  <div key={cat.id} className="relative group cursor-pointer">
                    <div className="flex items-center gap-1 hover:text-[#E1017D] transition-colors py-2">
                      {cat.name}
                      {cat.subItems.length > 0 && <span className="text-[9px] opacity-70">▼</span>}
                    </div>
                    {/* Dropdown Menu */}
                    {cat.subItems.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-[#111111] border border-[#3A3530] rounded shadow-2xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
                        <div className="py-2">
                          {cat.subItems.map(sub => (
                            <div key={sub.id} className="px-4 py-2 hover:bg-[#E1017D] hover:text-white text-gray-300 text-sm transition-colors">
                              {sub.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 font-bold text-[11px] uppercase tracking-wider text-center">
              <button className="bg-[#E1017D] hover:bg-pink-700 text-white px-5 py-2 rounded shadow-lg transition-transform hover:scale-105 leading-tight">
                BOOK <br />GAMES
              </button>
              <button className="bg-[#00B4D8] hover:bg-cyan-600 text-white px-5 py-2 rounded shadow-lg transition-transform hover:scale-105 leading-tight">
                BOOK <br />EVENTS
              </button>
            </div>
          </div>
          {/* Banner */}
          <div className="bg-[#E1017D] w-full py-2.5 text-center text-white font-black uppercase text-sm tracking-widest shadow-md">
            TIPSY THRILLS - SIPS & THRILLS FRI 15TH AUG
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 min-h-[calc(100vh-140px)]">

        {/* ── LEFT MINI SIDEBAR ── */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-6 h-full">
          {/* CATEGORIES */}
          <div className="bg-[#1C1C1C] rounded-xl border border-[#3A3530] flex flex-col overflow-hidden flex-1">
            <div className="p-4 border-b border-[#3A3530] flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Categories</span>
              <button
                onClick={() => navigate('/manage-header/category/new')}
                className="text-xs bg-[#D92D20] hover:bg-red-700 text-white px-2 py-1 rounded transition-colors font-medium"
              >
                + Add
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`group flex items-center justify-between px-4 py-3 cursor-pointer border-b border-[#2A2A2A] transition-all duration-200 ${selectedCategoryId === category.id
                      ? 'bg-[#2C2C2C] border-l-2 border-l-[#E1017D]'
                      : 'hover:bg-[#252525] border-l-2 border-l-transparent'
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${category.isHidden ? 'text-gray-500 line-through' :
                        selectedCategoryId === category.id ? 'text-white' : 'text-gray-300'
                      }`}>
                      {category.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{category.subItems.length} items</p>
                  </div>

                  {/* Actions (show on hover or selected) */}
                  <div
                    className={`flex items-center gap-1 ml-2 transition-opacity ${selectedCategoryId === category.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    onClick={e => e.stopPropagation()}
                  >
                    <div title={category.isHidden ? 'Show' : 'Hide'}>
                      <Toggle
                        checked={!category.isHidden}
                        onChange={() => toggleVisibility(category.id)}
                        activeColor="#10A200"
                        inactiveColor="#EC221F"
                      />
                    </div>
                    <button
                      onClick={() => navigate(`/manage-header/category/${category.id}`)}
                      className="text-blue-400 hover:text-blue-300 p-1 transition-colors"
                    >
                      <EditIcon size={14} color="currentColor" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-400 hover:text-red-300 p-1 transition-colors"
                    >
                      <TrashIcon size={14} color="currentColor" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LOCATIONS */}
          <div className="bg-[#1C1C1C] rounded-xl border border-[#3A3530] flex flex-col overflow-hidden min-h-[250px]">
            <div className="p-4 border-b border-[#3A3530] flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Locations</span>
              <button
                className="text-xs bg-[#00B4D8] hover:bg-cyan-600 text-white px-2 py-1 rounded transition-colors font-medium"
              >
                + Add
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {locations.map((loc, idx) => (
                <div key={idx} className="group flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A] hover:bg-[#252525] transition-all duration-200">
                  <p className="text-sm font-medium text-gray-300 truncate">{loc}</p>
                  {idx > 0 && (
                    <button
                      className="text-red-400 hover:text-red-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon size={14} color="currentColor" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT CONTENT PANEL ── */}
        <div className="flex-1 bg-[#1C1C1C] rounded-xl border border-[#3A3530] overflow-hidden">
          {selectedCategory ? (
            <>
              <div className="px-6 py-4 border-b border-[#3A3530] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedCategory.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Manage sub-items and their page content</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${selectedCategory.isHidden
                    ? 'bg-red-900/30 text-red-400'
                    : 'bg-green-900/30 text-green-400'
                  }`}>
                  {selectedCategory.isHidden ? 'Hidden' : 'Visible'}
                </span>
              </div>
              <div className="p-6">
                <SubItemList
                  subItems={selectedCategory.subItems}
                  categoryName={selectedCategory.name}
                  categoryId={selectedCategory.id}
                  availableGames={availableGames}
                  onUpdate={(newSubItems) => updateSubItems(selectedCategory.id, newSubItems)}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-24 text-gray-500">
              <div className="text-4xl mb-4">📂</div>
              <p className="text-sm">Select a category from the sidebar</p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default ManageHeader;
