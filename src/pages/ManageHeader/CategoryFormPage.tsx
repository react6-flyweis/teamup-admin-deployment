import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Chevron } from '@/assets/icons';
import { useHeaderCategoriesQuery, useUpdateCategoryMutation, useCreateCategoryMutation } from '@/hooks/useHeaderCategories';
import SuccessModal from '@/components/common/SuccessModal';

const CategoryFormPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  const fromTab = searchParams.get('tab');
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const { data: categoriesData } = useHeaderCategoriesQuery();
  const createCategory = useCreateCategoryMutation();
  const updateCategory = useUpdateCategoryMutation();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedCategoryId, setSavedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId && categoryId !== 'new' && categoriesData?.categories) {
      const category = categoriesData.categories.find(c => c.id === categoryId);
      if (category) {
        setName(category.name || '');
        setLink(category.link || category.path || '');
      }
    }
  }, [categoryId, categoriesData]);

  const handleBack = () => {
    const targetTab = (categoryId && categoryId !== 'new') ? categoryId : fromTab;
    navigate(targetTab ? `/manage-header?tab=${targetTab}` : '/manage-header');
  };

  const handleSuccessRedirect = () => {
    setShowSuccessModal(false);
    navigate(savedCategoryId ? `/manage-header?tab=${savedCategoryId}` : '/manage-header');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      if (categoryId && categoryId !== 'new') {
        await updateCategory.mutateAsync({
          categoryId,
          name: name.trim(),
          link: link.trim(),
        });
        setSavedCategoryId(categoryId);
      } else {
        const res = await createCategory.mutateAsync({
          name: name.trim(),
          link: link.trim(),
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiRes = res as any;
        const newCatId = apiRes?.category?.id || apiRes?.category?._id || apiRes?.data?.id || apiRes?.data?._id || apiRes?.id || apiRes?._id;
        setSavedCategoryId(newCatId || fromTab || null);
      }
      setShowSuccessModal(true);
    } catch (err: unknown) {
      console.error('Error saving category:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiErr = err as any;
      const msg = apiErr?.response?.data?.message || apiErr?.message || 'Failed to save category. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white min-h-screen">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={handleBack} className="text-gray-400 hover:text-white transition-colors">
          <div className="rotate-90">
            <Chevron size={24} color="currentColor" />
          </div>
        </button>
        <h1 className="text-2xl font-bold">
          {categoryId && categoryId !== 'new' ? 'Edit Category' : 'Add Category'}
        </h1>
      </div>

      <div className="bg-[#1C1C1C] rounded-xl border border-[#3A3530] w-full max-w-2xl overflow-hidden">
        {errorMessage && (
          <div className="p-4 bg-red-900/40 border-b border-red-500/60 text-red-200 text-sm flex items-center justify-between">
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

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category Name <span className="text-[#FB3748]">*</span>
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Link / URL <span className="text-xs text-gray-500 font-normal">(Optional direct link, e.g. /games or https://...)</span>
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g. /games or /book-now"
              className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB3748] transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Specify a direct link if this category should navigate directly to a page.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#3A3530]">
            <button
              type="button"
              onClick={handleBack}
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
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        title={categoryId && categoryId !== 'new' ? 'Category Updated!' : 'Category Created!'}
        message={`Category "${name}" has been saved successfully.`}
        buttonText="OK"
        onConfirm={handleSuccessRedirect}
      />
    </div>
  );
};

export default CategoryFormPage;
