import { useState } from 'react';
import MenuTable from '../components/Bites/MenuTable';
import AddEditFoodItemsModal from '../components/Bites/AddEditFoodItemsModal';
import FoodComboSection from '../components/Bites/FoodComboSection';
import BitesHeaderBanner, { type BiteFilter } from '../components/Bites/BitesHeaderBanner';

import {
  useFoodCategoriesQuery,
  useFoodItemsQuery,
  useCreateFoodItemMutation,
  useUpdateFoodItemMutation,
  useDeleteFoodItemMutation,
  useDrinksQuery,
  useCreateDrinkMutation,
  useUpdateDrinkMutation,
  useDeleteDrinkMutation
} from '../hooks/useBites';
import type { DrinkCategoryEnum } from '../hooks/useBites';
import { formatDrinkCategory, DRINK_CATEGORY_OPTIONS } from '../utils/drinkCategories';

import ConfirmDeleteModal from '../components/common/ConfirmDeleteModal';

export interface MenuItem {
  id: string;
  image: string;
  name: string;
  category: string;
  subCategory: string;
  availability: boolean;
  description: string;
  kcal?: string;
  price?: number;
  slug: string;
  isDrink?: boolean;
  categoryId?: string;
  isAlcoholic?: boolean;
}


const Bites = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<BiteFilter>('food');
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  // Queries
  const { data: categories = [], isLoading: categoriesLoading } = useFoodCategoriesQuery();

  const { data: foodItems = [], isLoading: foodItemsLoading } = useFoodItemsQuery();
  const createFoodItemMutation = useCreateFoodItemMutation();
  const updateFoodItemMutation = useUpdateFoodItemMutation();
  const deleteFoodItemMutation = useDeleteFoodItemMutation();

  const { data: drinks = [], isLoading: drinksLoading } = useDrinksQuery();
  const createDrinkMutation = useCreateDrinkMutation();
  const updateDrinkMutation = useUpdateDrinkMutation();
  const deleteDrinkMutation = useDeleteDrinkMutation();

  // Loading indicator
  if (categoriesLoading || foodItemsLoading || drinksLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E1017D]"></div>
      </div>
    );
  }

  // Map backend items to unified UI model
  const mappedFoodItems: MenuItem[] = foodItems.map(item => {
    const rawCat = item.categoryId;
    const catIdStr = typeof rawCat === 'object' && rawCat ? rawCat._id : (typeof rawCat === 'string' ? rawCat : '');
    const catObj = typeof rawCat === 'object' && rawCat ? rawCat : categories.find(c => c._id === catIdStr);
    const categoryName = catObj ? catObj.name : 'Food';

    return {
      id: item._id,
      image: item.imageUrl || '',
      name: item.name,
      category: 'Food',
      subCategory: categoryName,
      availability: item.isActive,
      description: item.description || '',
      kcal: item.calories || '',
      price: item.price,
      slug: item.slug,
      isDrink: false,
      categoryId: catIdStr
    };
  });

  const mappedDrinks: MenuItem[] = drinks.map(item => {
    return {
      id: item._id,
      image: item.imageUrl || '',
      name: item.name,
      category: 'Drinks',
      subCategory: formatDrinkCategory(item.category),
      availability: item.isActive,
      description: item.description || '',
      price: item.price,
      slug: item.slug,
      isDrink: true,
      isAlcoholic: item.isAlcoholic
    };
  });

  const filteredItems = activeFilter === 'drinks' ? mappedDrinks : mappedFoodItems;

  const handleToggleAvailability = (id: string, availability: boolean) => {
    const item = filteredItems.find(i => i.id === id);
    if (!item) return;

    if (item.isDrink) {
      updateDrinkMutation.mutate({
        slug: item.slug,
        payload: { isActive: availability }
      });
    } else {
      updateFoodItemMutation.mutate({
        id: item.id,
        slug: item.slug,
        payload: { isActive: availability }
      });
    }
  };

  const resetMutationErrors = () => {
    createFoodItemMutation.reset();
    updateFoodItemMutation.reset();
    createDrinkMutation.reset();
    updateDrinkMutation.reset();
  };

  const handleEdit = (item: MenuItem) => {
    resetMutationErrors();
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = (item: MenuItem) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.isDrink) {
      deleteDrinkMutation.mutate(itemToDelete.slug, {
        onSuccess: () => setItemToDelete(null)
      });
    } else {
      deleteFoodItemMutation.mutate(
        { id: itemToDelete.id, slug: itemToDelete.slug },
        { onSuccess: () => setItemToDelete(null) }
      );
    }
  };

  const handleSave = (updatedItem: Partial<MenuItem>) => {
    resetMutationErrors();
    const isNew = !selectedItem;
    const cleanSlug = updatedItem.name
      ? updatedItem.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
      : '';

    const closeOnSuccess = {
      onSuccess: () => {
        setShowModal(false);
        setSelectedItem(null);
      }
    };

    if (updatedItem.category === 'Drinks') {
      const selectedSub = updatedItem.subCategory || 'cocktails';
      const matchedOpt = DRINK_CATEGORY_OPTIONS.find(
        opt => opt.value === selectedSub || opt.label.toLowerCase() === selectedSub.toLowerCase()
      );
      const categorySlug = (matchedOpt ? matchedOpt.value : selectedSub) as DrinkCategoryEnum;
      const payload = {
        name: updatedItem.name || '',
        slug: isNew ? cleanSlug : selectedItem.slug,
        category: categorySlug,
        description: updatedItem.description || '',
        price: updatedItem.price || 0,
        isAlcoholic: updatedItem.isAlcoholic || false,
        imageUrl: updatedItem.image || '',
        isActive: true,
        order: 1
      };

      if (isNew) {
        createDrinkMutation.mutate(payload, closeOnSuccess);
      } else {
        updateDrinkMutation.mutate({
          slug: selectedItem.slug,
          payload
        }, closeOnSuccess);
      }
    } else {
      const targetCatName = updatedItem.subCategory || updatedItem.category || 'Food';
      const matchedCat = categories.find(c => c.name.toLowerCase() === targetCatName.toLowerCase()) || categories.find(c => c.name.toLowerCase() === 'food');
      const categoryId = matchedCat ? matchedCat._id : (categories[0]?._id || '');

      const payload = {
        categoryId,
        name: updatedItem.name || '',
        slug: isNew ? cleanSlug : selectedItem.slug,
        description: updatedItem.description || '',
        calories: updatedItem.kcal || '',
        price: updatedItem.price || 0,
        imageUrl: updatedItem.image || '',
        isActive: true,
        order: 1
      };

      if (isNew) {
        createFoodItemMutation.mutate(payload, closeOnSuccess);
      } else {
        updateFoodItemMutation.mutate({
          id: selectedItem.id,
          slug: selectedItem.slug,
          payload
        }, closeOnSuccess);
      }
    }
  };

  const isSavingItem = createFoodItemMutation.isPending || updateFoodItemMutation.isPending || createDrinkMutation.isPending || updateDrinkMutation.isPending;
  const isProcessing = deleteFoodItemMutation.isPending || deleteDrinkMutation.isPending || (updateFoodItemMutation.isPending && !showModal) || (updateDrinkMutation.isPending && !showModal);

  const itemError = createFoodItemMutation.error || updateFoodItemMutation.error || createDrinkMutation.error || updateDrinkMutation.error;
  const saveErrorMessage = itemError
    ? ((itemError as { response?: { data?: { message?: string } } }).response?.data?.message || itemError.message || 'Failed to save item. Please try again.')
    : null;

  return (
    <div className="flex flex-col gap-8 min-h-screen">
      {/* Banner Section */}
      <BitesHeaderBanner activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Menu Items Section */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Menu Items & Pricing</h1>
          <button
            onClick={() => {
              resetMutationErrors();
              setSelectedItem(null);
              setShowModal(true);
            }}
            className="bg-[#E1017D] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#c9016f] transition-colors"
          >
            Add Item
          </button>
        </div>

        {/* Table Section */}
        <MenuTable
          items={filteredItems}
          onToggleAvailability={handleToggleAvailability}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isProcessing={isProcessing}
        />
      </div>

      {/* Food Combo Section */}
      <FoodComboSection />

      {/* Add/Edit Menu Item Modal */}
      {showModal && (
        <AddEditFoodItemsModal
          onClose={() => {
            resetMutationErrors();
            setShowModal(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          onSave={handleSave}
          isSaving={isSavingItem}
          error={saveErrorMessage}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        itemName={itemToDelete?.name}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
        isDeleting={deleteFoodItemMutation.isPending || deleteDrinkMutation.isPending}
      />
    </div>
  );
};

export default Bites;