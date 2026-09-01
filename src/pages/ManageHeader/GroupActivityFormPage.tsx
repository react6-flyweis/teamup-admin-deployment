import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { HeaderSubItem } from "@/components/ManageHeader/types";
import { Chevron } from "@/assets/icons";
import GroupActivityForm from "./forms/GroupActivityForm";
import {
  useHeaderCategoriesQuery,
  useMenuItemQuery,
} from "@/hooks/useHeaderCategories";
import { useGamesQuery } from "@/hooks/useGames";
import {
  fetchGroupActivity,
  createGroupActivity,
  updateGroupActivity,
  createMenuItem,
  updateMenuItem,
  extractId,
  type GroupActivityPayload,
} from "@/hooks/useHeaderSubItems";

const GroupActivityFormPage: React.FC = () => {
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

  // Convert gamesData from API to HeaderSubItem list for available games selector
  useEffect(() => {
    if (gamesData?.games) {
      const formattedGames: HeaderSubItem[] = gamesData.games.map((g) => ({
        id: g._id || "",
        name: g.name || g.gameName || "",
        path: `/games/${g.slug || ""}`,
        icon: g.gameIconUrl || g.imageUrl || "",
        slug: g.slug || "",
      }));
      setAvailableGames(formattedGames);
    } else {
      const gamesCategory = categoriesData?.categories?.find((c) =>
        c.name.toLowerCase().includes("choose game"),
      );
      if (gamesCategory) {
        setAvailableGames(gamesCategory.subItems);
      }
    }
  }, [gamesData, categoriesData]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMenuItemLoading) return;

      if (subItemId && subItemId !== "new") {
        const menuItem = menuItemResponse?.menuItem;

        // Try getting real entity if linkedItemId exists
        const linkedId = menuItem?.linkedItemId || subItemId;
        let realData = null;

        if (linkedId) {
          try {
            const res = await fetchGroupActivity(linkedId);
            realData = res?.groupActivity || res?.data || res;
          } catch (err) {
            console.warn("Could not fetch group activity from API:", err);
          }
        }

        if (realData || menuItem) {
          const combined: HeaderSubItem = {
            id: menuItem?._id || subItemId,
            linkedItemId: realData?._id || menuItem?.linkedItemId || subItemId,
            name: menuItem?.title || realData?.name || "",
            path: menuItem?.linkUrl || realData?.path || "",
            icon: realData?.icon || menuItem?.iconUrl || "",
            pageType: "group-activity",
            pageHeadline: realData?.pageHeadline || "",
            pageHeroImage: realData?.pageHeroImage || "",
            heroBookNowLink: realData?.heroBookNowLink || "",
            sectionHeadline: realData?.sectionHeadline || "",
            sectionDescription: realData?.sectionDescription || "",
            checklistItems: realData?.checklistItems || [],
            howToBookHeadline: realData?.howToBookHeadline || "",
            howToBookBody: realData?.howToBookBody || "",
            howToBookLink: realData?.howToBookLink || "",
            howToBookEmail: realData?.howToBookEmail || "",
            howToBookPhone: realData?.howToBookPhone || "",
            chooseGamesHeading: realData?.chooseGamesHeading || "",
            chooseGameIds: realData?.chooseGameIds || [],
            isActive: realData?.isActive ?? menuItem?.isActive ?? true,
            isHidden: !(realData?.isActive ?? menuItem?.isActive ?? true),
          };

          if (isMounted) {
            setInitialData(combined);
            setLoading(false);
            return;
          }
        }

        // Fallback to categoriesData
        const category = categoriesData?.categories?.find(
          (c) => c.id === categoryId,
        );
        const subItem = category?.subItems?.find((s) => s.id === subItemId);
        if (subItem && isMounted) {
          setInitialData(subItem);
        }
      }

      if (isMounted) setLoading(false);
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [
    subItemId,
    categoryId,
    menuItemResponse,
    isMenuItemLoading,
    categoriesData,
  ]);

  const handleSave = async (subItemData: Partial<HeaderSubItem>) => {
    setLoading(true);

    const pagePayload: GroupActivityPayload = {
      name: subItemData.name || "",
      path: subItemData.path || "",
      icon: subItemData.icon || "",
      pageHeadline: subItemData.pageHeadline || "",
      pageHeroImage: subItemData.pageHeroImage || "",
      heroBookNowLink: subItemData.heroBookNowLink || "",
      sectionHeadline: subItemData.sectionHeadline || "",
      sectionDescription: subItemData.sectionDescription || "",
      checklistItems: subItemData.checklistItems || [],
      howToBookHeadline: subItemData.howToBookHeadline || "",
      howToBookBody: subItemData.howToBookBody || "",
      howToBookLink: subItemData.howToBookLink || "",
      howToBookEmail: subItemData.howToBookEmail || "",
      howToBookPhone: subItemData.howToBookPhone || "",
      chooseGamesHeading: subItemData.chooseGamesHeading || "",
      chooseGameIds: subItemData.chooseGameIds || [],
      isActive: subItemData.isActive ?? true,
    };

    let targetLinkedItemId = initialData?.linkedItemId;

    try {
      if (subItemId && subItemId !== "new" && targetLinkedItemId) {
        // 1. Update Group Activity real entity
        await updateGroupActivity(targetLinkedItemId, pagePayload);

        // 2. Update Menu Item (including all navigation setup fields)
        await updateMenuItem(subItemId, {
          title: subItemData.name || "",
          name: subItemData.name || "",
          section: categoryId || "group-activities",
          sectionLabel: "Group Activities",
          linkUrl: subItemData.path || "",
          path: subItemData.path || "",
          icon: subItemData.icon || "",
          iconUrl: subItemData.icon || "",
          type: "group-activity",
          linkedItemId: targetLinkedItemId,
          isActive: subItemData.isActive ?? true,
        });
      } else {
        // 1. Create Group Activity real entity
        const res = await createGroupActivity(pagePayload);
        targetLinkedItemId = extractId(res);

        // 2. Create Menu Item linked to created page (including all navigation setup fields)
        await createMenuItem({
          title: subItemData.name || "",
          name: subItemData.name || "",
          section: categoryId || "group-activities",
          sectionLabel: "Group Activities",
          linkUrl: subItemData.path || "",
          path: subItemData.path || "",
          icon: subItemData.icon || "",
          iconUrl: subItemData.icon || "",
          type: "group-activity",
          linkedItemId: targetLinkedItemId,
          order: 1,
          isActive: subItemData.isActive ?? true,
        });
      }
    } catch (error) {
      console.error("Error saving Group Activity API:", error);
    }

    await queryClient.invalidateQueries({ queryKey: ["header-categories"] });
    await queryClient.invalidateQueries({ queryKey: ["menu-item"] });

    navigate("/manage-header");
  };

  const handleClose = () => {
    navigate("/manage-header");
  };

  if (loading) {
    return (
      <div className="p-6 text-white min-h-screen flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E1017D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm animate-pulse">
          Loading Group Activity details...
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
            ? "Edit Group Activity"
            : "Add Group Activity"}
        </h1>
      </div>

      <div className="bg-[#1C1C1C] rounded-xl border border-[#3A3530] w-full max-w-4xl overflow-hidden mx-auto">
        <GroupActivityForm
          initialData={initialData}
          availableGames={availableGames}
          onClose={handleClose}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default GroupActivityFormPage;
