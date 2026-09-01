import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

export interface FoodCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FoodItem {
  _id: string;
  categoryId: string | FoodCategory;
  name: string;
  slug: string;
  description?: string;
  calories?: string;
  price: number;
  tags?: string[];
  imageUrl?: string;
  order?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type DrinkCategoryEnum =
  | 'cocktails'
  | 'beers'
  | 'draught'
  | 'mocktails'
  | 'soft-drinks'
  | 'shots'
  | 'wine'
  | 'other';

export interface Drink {
  _id: string;
  name: string;
  slug: string;
  category: DrinkCategoryEnum;
  description?: string;
  price: number;
  isAlcoholic: boolean;
  imageUrl?: string;
  order?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FoodComboItem {
  title: string;
  subtitle: string;
  pizza: string;
  bevvies: string;
  burger: string;
  welcomeBevy: string;
  shots: string;
  order: number;
  isActive: boolean;
}

export interface FoodCombosSection {
  title: string;
  items: FoodComboItem[];
}

export interface FoodDrinksSiteContent {
  _id: string;
  section: string;
  data: {
    foodCombos?: FoodCombosSection;
  };
  isActive: boolean;
}

// 1. Food Categories Hooks
export const useFoodCategoriesQuery = () => {
  return useQuery<FoodCategory[]>({
    queryKey: ['food-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/menu/categories?search=&sortBy=order&sortOrder=asc');
      return Array.isArray(response.data) ? response.data : (response.data.categories || response.data.data || []);
    },
  });
};

export const useCreateFoodCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<FoodCategory>) => {
      const response = await apiClient.post('/menu/categories', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-categories'] });
    },
  });
};

export interface DetailedFoodCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  order?: number;
}

export interface DetailedFoodItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  calories?: string;
  price: number;
  tags?: string[];
  imageUrl?: string;
  order?: number;
  isActive: boolean;
  categoryId?: string | DetailedFoodCategory;
  createdAt?: string;
  updatedAt?: string;
}

// 2. Food Items Hooks
export const useFoodItemsQuery = () => {
  return useQuery<FoodItem[]>({
    queryKey: ['food-items'],
    queryFn: async () => {
      const response = await apiClient.get('/menu/items?includeInactive=true');
      return Array.isArray(response.data) ? response.data : (response.data.items || response.data.menuItems || response.data.data || []);
    },
  });
};

export const useFoodItemByIdQuery = (idOrSlug: string | null) => {
  return useQuery<DetailedFoodItem>({
    queryKey: ['food-item', idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) throw new Error('No food item ID provided');
      const response = await apiClient.get(`/menu/items/${idOrSlug}`);
      return response.data?.item || response.data;
    },
    enabled: !!idOrSlug,
  });
};

export const useCreateFoodItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<FoodItem>) => {
      const response = await apiClient.post('/menu/items', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-items'] });
    },
  });
};

export const useUpdateFoodItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, slug, payload }: { id?: string; slug?: string; payload: Partial<FoodItem> }) => {
      const target = id || slug;
      if (!target) throw new Error('No food item ID or slug provided');
      const response = await apiClient.patch(`/menu/items/${target}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['food-items'] });
      const target = variables.id || variables.slug;
      if (target) {
        queryClient.invalidateQueries({ queryKey: ['food-item', target] });
      }
    },
  });
};

export const useDeleteFoodItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (target: string | { id?: string; slug?: string }) => {
      const targetId = typeof target === 'string' ? target : (target.id || target.slug);
      if (!targetId) throw new Error('No food item ID or slug provided for deletion');
      const response = await apiClient.delete(`/menu/items/${targetId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-items'] });
    },
  });
};

// 3. Drinks Hooks
export const useDrinksQuery = () => {
  return useQuery<Drink[]>({
    queryKey: ['drinks'],
    queryFn: async () => {
      const response = await apiClient.get('/drinks?includeInactive=true');
      return Array.isArray(response.data) ? response.data : (response.data.drinks || response.data.data || []);
    },
  });
};

export const useCreateDrinkMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Drink>) => {
      const response = await apiClient.post('/drinks', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drinks'] });
    },
  });
};

export const useUpdateDrinkMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, payload }: { slug: string; payload: Partial<Drink> }) => {
      const response = await apiClient.patch(`/drinks/${slug}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drinks'] });
    },
  });
};

export const useDeleteDrinkMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const response = await apiClient.delete(`/drinks/${slug}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drinks'] });
    },
  });
};

export const useReorderFoodCategoriesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categories: { id: string; order: number }[]) => {
      const response = await apiClient.patch('/menu/categories/reorder', { categories });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-categories'] });
    },
  });
};

export const useReorderFoodItemsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; order: number; categoryId?: string }[]) => {
      const response = await apiClient.patch('/menu/items/reorder', { items });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-items'] });
    },
  });
};

export const useReorderDrinksMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (drinks: { id: string; order: number; category?: string }[]) => {
      const response = await apiClient.patch('/drinks/reorder', { drinks });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drinks'] });
    },
  });
};

export interface FoodDrinksSiteContentResponse {
  content: FoodDrinksSiteContent;
}

// 4. Site Content (Combos) Hooks
export const useFoodDrinksContentQuery = (locationSlug?: string) => {
  return useQuery<FoodDrinksSiteContentResponse>({
    queryKey: ['food-drinks-content', locationSlug],
    queryFn: async () => {
      const queryParam = locationSlug ? `?locationSlug=${encodeURIComponent(locationSlug)}` : '';
      const response = await apiClient.get(`/site-content/food-drinks${queryParam}`);
      return response.data;
    },
  });
};

export const useUpdateFoodDrinksContentMutation = (locationSlug?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { data: { foodCombos?: FoodCombosSection }; isActive?: boolean; locationSlug?: string }) => {
      const slug = payload.locationSlug || locationSlug;
      const queryParam = slug ? `?locationSlug=${encodeURIComponent(slug)}` : '';
      const response = await apiClient.patch(`/site-content/food-drinks${queryParam}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-drinks-content'] });
    },
  });
};

// 5. Dedicated Food Combos Hooks (/food-combos)
export interface FoodCombo {
  _id: string;
  id?: string;
  title?: string;
  subtitle?: string;
  pizza?: string;
  bevvies?: string;
  burger?: string;
  welcomeBevy?: string;
  welcomeBevvy?: string;
  shots?: string;
  order?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const useFoodCombosQuery = (search?: string, sortBy: string = 'order', sortOrder: 'asc' | 'desc' = 'asc') => {
  return useQuery<FoodCombo[]>({
    queryKey: ['food-combos', search, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await apiClient.get(`/food-combos${queryString}`);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.combos)) return data.combos;
      if (Array.isArray(data.foodCombos)) return data.foodCombos;
      if (Array.isArray(data.data)) return data.data;
      return [];
    },
  });
};

export const useFoodComboByIdQuery = (id: string | null) => {
  return useQuery<FoodCombo>({
    queryKey: ['food-combo', id],
    queryFn: async () => {
      if (!id) throw new Error('No food combo ID provided');
      const response = await apiClient.get(`/food-combos/${id}`);
      return response.data?.combo || response.data?.foodCombo || response.data?.data || response.data;
    },
    enabled: !!id,
  });
};

export const useCreateFoodComboMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<FoodCombo>) => {
      const response = await apiClient.post('/food-combos', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-combos'] });
    },
  });
};

export const useUpdateFoodComboMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<FoodCombo> }) => {
      const response = await apiClient.patch(`/food-combos/${id}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['food-combos'] });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['food-combo', variables.id] });
      }
    },
  });
};

export const useReorderFoodCombosMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (combos: { id: string; order: number }[]) => {
      const response = await apiClient.patch('/food-combos/reorder', { combos });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-combos'] });
    },
  });
};

export const useDeleteFoodComboMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/food-combos/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-combos'] });
    },
  });
};

