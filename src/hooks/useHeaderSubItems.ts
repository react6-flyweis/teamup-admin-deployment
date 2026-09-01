/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/apiClient';

// ─── API Payload Interfaces ───────────────────────────────

export interface GroupActivityPayload {
  name: string;
  path: string;
  icon?: string;
  pageHeadline?: string;
  pageHeroImage?: string;
  heroBookNowLink?: string;
  sectionHeadline?: string;
  sectionDescription?: string;
  checklistItems?: any[];
  howToBookHeadline?: string;
  howToBookBody?: string;
  howToBookLink?: string;
  howToBookEmail?: string;
  howToBookPhone?: string;
  chooseGamesHeading?: string;
  chooseGameIds?: string[];
  isActive?: boolean;
}

export interface TeamPartyPayload {
  name: string;
  path: string;
  icon?: string;
  pageHeadline?: string;
  pageHeroImage?: string;
  heroBookNowLink?: string;
  sectionHeadline?: string;
  sectionDescription?: string;
  checklistItems?: any[];
  eventsDateHeading?: string;
  featuredEvents?: any[];
  chooseGamesHeading?: string;
  chooseGameIds?: string[];
  isActive?: boolean;
}

export interface BoomBundlePayload {
  name: string;
  path: string;
  icon?: string;
  pageHeadline?: string;
  pageHeroImage?: string;
  heroBookNowLink?: string;
  sectionHeadline?: string;
  sectionDescription?: string;
  bundleCards?: any[];
  checklistItems?: any[];
  importantInfoHeading?: string;
  importantInfoText?: string;
  isActive?: boolean;
}

export interface QueensNightPayload {
  name: string;
  path: string;
  icon?: string;
  pageHeadline?: string;
  pageHeroImage?: string;
  heroBookNowLink?: string;
  sectionHeadline?: string;
  sectionDescription?: string;
  checklistItems?: any[];
  howToBookHeadline?: string;
  howToBookBody?: string;
  statsBlocks?: any[];
  otherGamesHeading?: string;
  otherGamesCards?: any[];
  isActive?: boolean;
}

export interface MenuItemPayload {
  title: string;
  name?: string;
  section?: string;
  sectionLabel?: string;
  linkUrl: string;
  path?: string;
  icon?: string;
  iconUrl?: string;
  type: string;
  linkedItemId?: string;
  order?: number;
  isActive?: boolean;
}


// Helper to extract _id or id from various API response shapes
export const extractId = (res: any): string => {
  if (!res) return '';
  if (typeof res === 'string') return res;
  if (res._id) return res._id;
  if (res.id) return res.id;
  if (res.data?._id) return res.data._id;
  if (res.data?.id) return res.data.id;
  if (res.groupActivity?._id) return res.groupActivity._id;
  if (res.teamParty?._id) return res.teamParty._id;
  if (res.boomBundle?._id) return res.boomBundle._id;
  if (res.queensNight?._id) return res.queensNight._id;
  if (res.menuItem?._id) return res.menuItem._id;
  if (res.item?._id) return res.item._id;
  return '';
};

// Safe update trying PATCH first, falling back to PUT if necessary
const safeUpdate = async (endpoint: string, payload: Record<string, any>) => {
  try {
    const res = await apiClient.patch(endpoint, payload);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 405 || err?.response?.status === 404) {
      const res = await apiClient.put(endpoint, payload);
      return res.data;
    }
    throw err;
  }
};

// ─── Group Activities API ─────────────────────────────────
export const fetchGroupActivity = async (id: string) => {
  const res = await apiClient.get(`/group-activities/${id}`);
  return res.data;
};

export const createGroupActivity = async (payload: GroupActivityPayload) => {
  const res = await apiClient.post('/group-activities', payload);
  return res.data;
};

export const updateGroupActivity = async (id: string, payload: Partial<GroupActivityPayload>) => {
  return safeUpdate(`/group-activities/${id}`, payload);
};

export const deleteGroupActivity = async (id: string) => {
  const res = await apiClient.delete(`/group-activities/${id}`);
  return res.data;
};

// ─── Team Parties API ──────────────────────────────────────
export const fetchTeamParty = async (id: string) => {
  const res = await apiClient.get(`/team-parties/${id}`);
  return res.data;
};

export const createTeamParty = async (payload: TeamPartyPayload) => {
  const res = await apiClient.post('/team-parties', payload);
  return res.data;
};

export const updateTeamParty = async (id: string, payload: Partial<TeamPartyPayload>) => {
  return safeUpdate(`/team-parties/${id}`, payload);
};

export const deleteTeamParty = async (id: string) => {
  const res = await apiClient.delete(`/team-parties/${id}`);
  return res.data;
};

// ─── Boom Bundles API ──────────────────────────────────────
export const fetchBoomBundle = async (id: string) => {
  const res = await apiClient.get(`/boom-bundles/${id}`);
  return res.data;
};

export const createBoomBundle = async (payload: BoomBundlePayload) => {
  const res = await apiClient.post('/boom-bundles', payload);
  return res.data;
};

export const updateBoomBundle = async (id: string, payload: Partial<BoomBundlePayload>) => {
  return safeUpdate(`/boom-bundles/${id}`, payload);
};

export const deleteBoomBundle = async (id: string) => {
  const res = await apiClient.delete(`/boom-bundles/${id}`);
  return res.data;
};

// ─── Queens Night API ──────────────────────────────────────
export const fetchQueensNight = async (id: string) => {
  const res = await apiClient.get(`/queens-nights/${id}`);
  return res.data;
};

export const createQueensNight = async (payload: QueensNightPayload) => {
  const res = await apiClient.post('/queens-nights', payload);
  return res.data;
};

export const updateQueensNight = async (id: string, payload: Partial<QueensNightPayload>) => {
  return safeUpdate(`/queens-nights/${id}`, payload);
};

export const deleteQueensNight = async (id: string) => {
  const res = await apiClient.delete(`/queens-nights/${id}`);
  return res.data;
};

// ─── Menu Items API ────────────────────────────────────────
export const createMenuItem = async (payload: MenuItemPayload) => {
  const res = await apiClient.post('/menu-items', payload);
  return res.data;
};

export const updateMenuItem = async (id: string, payload: Partial<MenuItemPayload>) => {
  return safeUpdate(`/menu-items/${id}`, payload);
};

export const deleteMenuItem = async (id: string) => {
  const res = await apiClient.delete(`/menu-items/${id}`);
  return res.data;
};

export const useReorderMenuItemsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; order: number; section?: string }[]) => {
      const res = await apiClient.patch('/menu-items/reorder', { items });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['header-categories'] });
      queryClient.invalidateQueries({ queryKey: ['menu-item'] });
    },
  });
};
