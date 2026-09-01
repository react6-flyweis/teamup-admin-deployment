import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Chevron } from '@/assets/icons';
import { useHeaderCategoriesQuery, useUpdateCategoryMutation, useCreateCategoryMutation } from '@/hooks/useHeaderCategories';

const CategoryFormPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const { data: categoriesData } = useHeaderCategoriesQuery();
  const createCategory = useCreateCategoryMutation();
  const updateCategory = useUpdateCategoryMutation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryId && categoryId !== 'new' && categoriesData?.categories) {
      const category = categoriesData.categories.find(c => c.id === categoryId);
      if (category) {
        setName(category.name);
      }
    }
  }, [categoryId, categoriesData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    try {
      if (categoryId && categoryId !== 'new') {
        await updateCategory.mutateAsync({ categoryId, name: name.trim() });
      } else {
        await createCategory.mutateAsync(name.trim());
      }
      navigate('/manage-header');
    } catch (err) {
      console.error('Error saving category:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white min-h-screen">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/manage-header')} className="text-gray-400 hover:text-white transition-colors">
          <div className="rotate-90">
            <Chevron size={24} color="currentColor" />
          </div>
        </button>
        <h1 className="text-2xl font-bold">
          {categoryId && categoryId !== 'new' ? 'Edit Category' : 'Add Category'}
        </h1>
      </div>

      <div className="bg-[#1C1C1C] rounded-xl border border-[#3A3530] w-full max-w-2xl overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Choose Game"
              className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB3748] transition-colors"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#3A3530]">
            <button
              type="button"
              onClick={() => navigate('/manage-header')}
              className="px-4 py-2 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-[#2A2A2A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="bg-[#FB3748] text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormPage;
