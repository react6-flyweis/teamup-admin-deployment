import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { HeaderSubItem } from "@/components/ManageHeader/types";
import { Chevron } from "@/assets/icons";
import TeamPartiesForm from "./forms/TeamPartiesForm";
import {
  useHeaderCategoriesQuery,
  useMenuItemQuery,
} from "@/hooks/useHeaderCategories";
import { useGamesQuery } from "@/hooks/useGames";
import {
  fetchTeamParty,
  createTeamParty,
  updateTeamParty,
  createMenuItem,
  updateMenuItem,
  extractId,
  type TeamPartyPayload,
} from "@/hooks/useHeaderSubItems";
import SuccessModal from "@/components/common/SuccessModal";

const TeamPartiesFormPage: React.FC = () => {
  const { categoryId, subItemId } = useParams<{
    categoryId: string;
    subItemId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categoriesData } = useHeaderCategoriesQuery();
  const { data: gamesData } = useGamesQuery();
  const { data: menuItemResponse, isLoading: isMenuItemLoading } =
    useMenuItemQuery(subItemId);

  const [initialData, setInitialData] = useState<HeaderSubItem | null>(null);
  const [availableGames, setAvailableGames] = useState<HeaderSubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Convert gamesData from API to HeaderSubItem list for available games selector
  useEffect(() => {
    if (gamesData?.games) {
      const activeGames = gamesData.games.filter(
        (g: { isActive?: boolean }) => g.isActive !== false
      );
      const mapped: HeaderSubItem[] = activeGames.map(
        (g: {
          _id?: string;
          id?: string;
          name?: string;
          gameName?: string;
          imageUrl?: string;
          cardImageUrl?: string;
          slug?: string;
        }) => ({
          id: String(g._id || g.id),
          name: g.name || g.gameName || "",
          icon: g.imageUrl || g.cardImageUrl || "",
          path: `/games/${g.slug || ""}`,
        })
      );
      setAvailableGames(mapped);
    }
  }, [gamesData]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMenuItemLoading) return;

      // 1. Fetch from team parties API if subItemId exists and is not 'new'
      if (subItemId && subItemId !== "new") {
        const menuItem = menuItemResponse?.menuItem;
        const linkedId = menuItem?.linkedItemId || subItemId;

        if (linkedId) {
          try {
            const res = await fetchTeamParty(linkedId);
            const party = res?.teamParty || res?.data || res;
            if (party && isMounted) {
              setInitialData({
                id: menuItem?._id || subItemId,
                name: menuItem?.title || party.name || "",
                path: menuItem?.linkUrl || party.path || "",
                icon: menuItem?.iconUrl || party.icon || "",
                pageType: "team-parties",
                linkedItemId: party._id || linkedId,
                pageHeadline: party.pageHeadline || menuItem?.title || "",
                pageHeroImage: party.pageHeroImage || "",
                heroBookNowLink: party.heroBookNowLink || "",
                sectionHeadline: party.sectionHeadline || "",
                sectionDescription: party.sectionDescription || "",
                checklistItems: party.checklistItems || [],
                eventsDateHeading: party.eventsDateHeading || "",
                featuredEvents: party.featuredEvents || [],
                chooseGamesHeading: party.chooseGamesHeading || "",
                chooseGameIds: party.chooseGameIds || [],
              });
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn("Could not fetch team party API:", err);
          }
        }

        // 2. Fallback to categoriesData if API response not found
        if (categoriesData?.categories) {
          for (const cat of categoriesData.categories) {
            const item = cat.subItems.find((s) => s.id === subItemId);
            if (item && isMounted) {
              setInitialData(item);
              setLoading(false);
              return;
            }
          }
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [
    categoryId,
    subItemId,
    menuItemResponse,
    isMenuItemLoading,
    categoriesData,
  ]);

  const handleSave = async (subItemData: Partial<HeaderSubItem>) => {
    setIsSaving(true);
    setErrorMessage(null);

    const pagePayload: TeamPartyPayload = {
      name: subItemData.name || "",
      path: subItemData.path || "",
      icon: subItemData.icon || "",
      pageHeadline: subItemData.pageHeadline || "",
      pageHeroImage: subItemData.pageHeroImage || "",
      heroBookNowLink: subItemData.heroBookNowLink || "",
      sectionHeadline: subItemData.sectionHeadline || "",
      sectionDescription: subItemData.sectionDescription || "",
      checklistItems: subItemData.checklistItems || [],
      eventsDateHeading: subItemData.eventsDateHeading || "",
      featuredEvents: subItemData.featuredEvents || [],
      chooseGamesHeading: subItemData.chooseGamesHeading || "",
      chooseGameIds: subItemData.chooseGameIds || [],
      isActive: subItemData.isActive ?? true,
    };

    let targetLinkedItemId = initialData?.linkedItemId;

    try {
      if (subItemId && subItemId !== "new" && targetLinkedItemId) {
        // 1. Update Team Party real entity
        await updateTeamParty(targetLinkedItemId, pagePayload);

        // 2. Update Menu Item (including all navigation setup fields)
        await updateMenuItem(subItemId, {
          title: subItemData.name || "",
          name: subItemData.name || "",
          section: categoryId || "team-parties",
          sectionLabel: "Team Parties",
          linkUrl: subItemData.path || "",
          path: subItemData.path || "",
          icon: subItemData.icon || "",
          iconUrl: subItemData.icon || "",
          type: "team-parties",
          linkedItemId: targetLinkedItemId,
          isActive: subItemData.isActive ?? true,
        });
      } else {
        // 1. Create Team Party real entity
        const res = await createTeamParty(pagePayload);
        targetLinkedItemId = extractId(res);

        // 2. Create Menu Item linked to created page (including all navigation setup fields)
        await createMenuItem({
          title: subItemData.name || "",
          name: subItemData.name || "",
          section: categoryId || "team-parties",
          sectionLabel: "Team Parties",
          linkUrl: subItemData.path || "",
          path: subItemData.path || "",
          icon: subItemData.icon || "",
          iconUrl: subItemData.icon || "",
          type: "team-parties",
          linkedItemId: targetLinkedItemId,
          order: 1,
          isActive: subItemData.isActive ?? true,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["header-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["menu-item"] });

      setShowSuccessModal(true);
    } catch (error: unknown) {
      console.error("Error saving Team Parties API:", error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiErr = error as any;
      const msg =
        apiErr?.response?.data?.message ||
        apiErr?.message ||
        "Failed to save team party. Please check the fields and try again.";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuccessRedirect = () => {
    setShowSuccessModal(false);
    navigate(categoryId ? `/manage-header?tab=${categoryId}` : "/manage-header");
  };

  const handleClose = () => {
    navigate(categoryId ? `/manage-header?tab=${categoryId}` : "/manage-header");
  };

  if (loading) {
    return (
      <div className="p-6 text-white min-h-screen flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E1017D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm animate-pulse">
          Loading Team Parties details...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <div className="rotate-90">
            <Chevron size={24} color="currentColor" />
          </div>
        </button>
        <h1 className="text-2xl font-bold">
          {subItemId && subItemId !== "new"
            ? "Edit Team Parties"
            : "Add Team Parties"}
        </h1>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-900/40 border border-red-500/60 rounded-xl text-red-200 text-sm flex items-center justify-between max-w-4xl mx-auto">
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

      <div className="bg-[#1C1C1C] rounded-xl border border-[#3A3530] w-full max-w-4xl overflow-hidden mx-auto">
        <TeamPartiesForm
          initialData={initialData}
          availableGames={availableGames}
          onClose={handleClose}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        title={
          subItemId && subItemId !== "new"
            ? "Team Party Updated!"
            : "Team Party Created!"
        }
        message="Team Party details have been saved successfully."
        buttonText="OK"
        onConfirm={handleSuccessRedirect}
      />
    </div>
  );
};

export default TeamPartiesFormPage;
