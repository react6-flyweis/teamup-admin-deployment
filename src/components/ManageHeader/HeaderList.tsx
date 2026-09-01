import React, { useState } from 'react';
import type { HeaderCategory } from './types';
import { EditIcon, TrashIcon, Chevron } from '@/assets/icons';
import SubItemList from './SubItemList';
import { useNavigate } from 'react-router-dom';
import Toggle from '@/components/common/Toggle';
import { useHeaderCategoriesQuery, useUpdateCategoryMutation, useDeleteCategoryMutation } from '@/hooks/useHeaderCategories';

const HeaderList: React.FC = () => {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: apiCategoriesData, isLoading, isError, error } = useHeaderCategoriesQuery();
  const updateCategory = useUpdateCategoryMutation();
  const deleteCategory = useDeleteCategoryMutation();

  const categories: HeaderCategory[] = apiCategoriesData?.categories || [];

  const toggleVisibility = (category: HeaderCategory) => {
    updateCategory.mutate({
      categoryId: category.id,
      name: category.name,
      isActive: !!category.isHidden, // toggling isHidden -> isActive
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D92D20]"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
        Failed to load categories: {error instanceof Error ? error.message : "Error"}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate('/manage-header/category/new')}
          className="bg-[#D92D20] text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          + Add Category
        </button>
      </div>

      <div className="bg-[#1C1C1C] rounded-lg border border-[#3A3530] overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No categories found. Click "+ Add Category" to create one.
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="border-b border-[#3A3530] last:border-0">
              <div className="flex items-center justify-between p-4 bg-[#252525] hover:bg-[#2C2C2C] transition-colors">
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id)}
                >
                  <div className={`transform transition-transform ${expandedCategoryId === category.id ? 'rotate-180' : ''}`}>
                    <Chevron size={20} color="currentColor" className="text-gray-400" />
                  </div>
                  <h3 className={`text-lg font-medium ${category.isHidden ? 'text-gray-500 line-through' : 'text-white'}`}>
                    {category.name}
                  </h3>
                  <span className="text-xs bg-[#3A3530] text-gray-300 px-2 py-1 rounded-full">
                    {category.subItems?.length || 0} items
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div title={category.isHidden ? "Show Category" : "Hide Category"}>
                    <Toggle 
                      checked={!category.isHidden}
                      onChange={() => toggleVisibility(category)}
                      activeColor="#10A200"
                      inactiveColor="#EC221F"
                    />
                  </div>
                  <button 
                    onClick={() => navigate(`/manage-header/category/${category.id}`)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <EditIcon size={20} color="currentColor" />
                  </button>
                  <button 
                    onClick={() => handleDelete(category.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <TrashIcon size={20} color="currentColor" />
                  </button>
                </div>
              </div>

              {expandedCategoryId === category.id && (
                <div className="p-4 bg-[#1C1C1C]">
                  <SubItemList 
                    subItems={category.subItems || []} 
                    categoryName={category.name}
                    categoryId={category.id}
                    availableGames={[]}
                    onUpdate={() => {}} 
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HeaderList;
