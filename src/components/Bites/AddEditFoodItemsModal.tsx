import React from 'react';
import { Dropdown } from '../common/Dropdown';
import type { MenuItem } from '@/pages/Bites';
import { useFoodItemByIdQuery, useFoodCategoriesQuery } from '@/hooks/useBites';
import { DRINK_CATEGORY_OPTIONS, formatDrinkCategory } from '@/utils/drinkCategories';
import { uploadFile } from '@/utils/fileUpload';

interface AddEditModalProps {
  onClose: () => void;
  item?: MenuItem | null;
  onSave: (item: Partial<MenuItem>) => void;
  isSaving?: boolean;
  error?: string | null;
}

const AddEditFoodItemsModal: React.FC<AddEditModalProps> = ({
  onClose,
  item,
  onSave,
  isSaving = false,
  error = null
}) => {
  const initialCategory = item?.isDrink ? 'Drinks' : 'Food';
  const rawSubCategory = item?.subCategory && item.subCategory !== '---'
    ? item.subCategory
    : (item?.category && item.category !== 'Food' && item.category !== 'Drinks' ? item.category : '');
  const initialSubCategory = item?.isDrink ? formatDrinkCategory(rawSubCategory) : rawSubCategory;

  const [category, setCategory] = React.useState(initialCategory);
  const [subCategory, setSubCategory] = React.useState(initialSubCategory);
  const [name, setName] = React.useState(item?.name || '');
  const [kcal, setKcal] = React.useState(item?.kcal || '');
  const [description, setDescription] = React.useState(item?.description || '');
  const [image, setImage] = React.useState(item?.image || '');
  const [price, setPrice] = React.useState(item?.price !== undefined ? String(item.price) : '');
  const [isAlcoholic, setIsAlcoholic] = React.useState(item?.isAlcoholic || false);

  // Fetch food categories dynamically from API
  const { data: foodCategories = [] } = useFoodCategoriesQuery();

  // Fetch detailed item data for editing via GET /api/menu/items/:foodItemId
  const foodItemId = item && !item.isDrink ? item.id : null;
  const { data: detailedItem, isLoading: isFetchingDetails } = useFoodItemByIdQuery(foodItemId);

  React.useEffect(() => {
    if (detailedItem) {
      if (detailedItem.name) setName(detailedItem.name);
      if (detailedItem.price !== undefined) setPrice(String(detailedItem.price));
      if (detailedItem.calories !== undefined) setKcal(detailedItem.calories);
      if (detailedItem.description !== undefined) setDescription(detailedItem.description);
      if (detailedItem.imageUrl !== undefined) setImage(detailedItem.imageUrl);

      if (detailedItem.categoryId) {
        const catName = typeof detailedItem.categoryId === 'object' ? detailedItem.categoryId.name : '';
        if (catName && catName !== 'Drinks') {
          setCategory('Food');
          setSubCategory(prev => (!prev || prev === '---' ? catName : prev));
        }
      }
    }
  }, [detailedItem]);

  const categories = ['Food', 'Drinks'];

  const dynamicFoodSubCategories = React.useMemo(() => {
    return foodCategories
      .filter(c => c.slug !== 'food-combos')
      .map(c => c.name);
  }, [foodCategories]);

  const subCategories =
    category === 'Food'
      ? dynamicFoodSubCategories
      : category === 'Drinks'
        ? DRINK_CATEGORY_OPTIONS.map(opt => opt.label)
        : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalSubCategory = subCategory;
    if (category === 'Drinks') {
      const matchedOpt = DRINK_CATEGORY_OPTIONS.find(
        opt => opt.label.toLowerCase() === subCategory.toLowerCase() || opt.value === subCategory
      );
      if (matchedOpt) {
        finalSubCategory = matchedOpt.value;
      }
    }

    onSave({
      category,
      subCategory: finalSubCategory,
      name,
      kcal,
      description,
      image,
      price: price ? parseFloat(price) : 0,
      isAlcoholic
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-[#F9D2EA] rounded-2xl p-6 w-[683px] max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-black">
              {item ? (item.isDrink ? 'Edit Drink Item' : 'Edit Food Item') : 'Add New Item'}
            </h2>
            {isFetchingDetails && (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#E1017D] bg-white/60 px-3 py-1 rounded-full border border-[#E1017D]/30 animate-pulse">
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-[#E1017D]"></div>
                Loading details...
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-6 h-6 bg-white rounded-full flex items-center justify-center disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M15 5L5 15M5 5L15 15" stroke="#000" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <hr className="border-black mb-6" />

        {error && (
          <div className="mb-6 p-3.5 bg-[#FFEBEE] border border-[#FFCDD2] text-[#B71C1C] rounded-lg text-sm flex items-center gap-2.5 shadow-sm">
            <svg className="w-5 h-5 flex-shrink-0 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category and Sub-category row */}
          <div className="grid grid-cols-2 gap-5">
            <div className='w-full'>
              <label className="block text-sm font-medium text-black mb-1">Category</label>
              <Dropdown
                options={categories}
                value={category}
                onChange={(val) => {
                  setCategory(val);
                  setSubCategory('');
                }}
                placeholder="Select Category"
              />
            </div>
            {(category === 'Food' || category === 'Drinks') && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {category === 'Drinks' ? 'Drink Category' : 'Category Detail'}
                </label>
                <Dropdown
                  options={subCategories}
                  value={subCategory}
                  onChange={setSubCategory}
                  placeholder={category === 'Drinks' ? 'Select Drink Category' : 'Select Category Detail'}
                />
              </div>
            )}
          </div>

          {/* Name and Price row */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Item Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white"
                placeholder="Enter item name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Price (£)</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white"
                placeholder="Enter price"
              />
            </div>
          </div>

          {/* Kcal or IsAlcoholic row */}
          {category === 'Drinks' ? (
            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="isAlcoholic"
                checked={isAlcoholic}
                onChange={(e) => setIsAlcoholic(e.target.checked)}
                className="w-5 h-5 accent-[#E1017D] rounded border-[#AEB4C2]"
              />
              <label htmlFor="isAlcoholic" className="text-base font-semibold text-black cursor-pointer">
                Alcoholic Drink
              </label>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-black mb-1">Kcal (Calories)</label>
              <input
                type="text"
                value={kcal}
                onChange={(e) => setKcal(e.target.value)}
                className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white"
                placeholder="Enter calories (e.g. 450 kcal)"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-[#AEB4C2] rounded-lg h-[72px] bg-white"
              placeholder="Enter description..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Item Image (optional) <span className="text-xs text-gray-500 font-normal ml-1">(1:1 or 4:3 • Rec: 600×600 px)</span>
            </label>
            <div className="border border-dashed border-black rounded-lg p-4 text-center bg-white">
              {image ? (
                <div className="flex flex-col items-center gap-4">
                  <img src={image} alt={name} className="w-auto h-32 rounded-lg object-cover" />
                  <button
                    type="button"
                    disabled={isSaving}
                    className="px-5 py-2 border border-[#E1017D] text-[#E1017D] rounded-lg bg-white disabled:opacity-50"
                    onClick={() => setImage('')}
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 ">
                  <span className="text-black">Upload your photo here</span>
                  <button
                    type="button"
                    disabled={isSaving}
                    className="px-5 py-2 border border-[#E1017D] text-[#E1017D] rounded-lg bg-white disabled:opacity-50"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          try {
                            const url = await uploadFile(file);
                            setImage(url);
                          } catch (error) {
                            console.error('File upload failed:', error);
                          }
                        }
                      };
                      input.click();
                    }}
                  >
                    Select Photo
                  </button>
                  <span className="text-xs text-gray-600">
                    Supported file format PNG, JPEG, JPG
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2 border border-[#7E0B0B] text-[#7E0B0B] rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#E1017D] text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              )}
              {isSaving ? 'Saving...' : (item ? 'Save Changes' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditFoodItemsModal;
