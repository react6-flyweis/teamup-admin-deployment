import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { HeaderSubItem } from "@/components/ManageHeader/types";
import { Chevron } from "@/assets/icons";
import BoomBundleForm from "./forms/BoomBundleForm";
import {
  useHeaderCategoriesQuery,
  useMenuItemQuery,
} from "@/hooks/useHeaderCategories";
import {
  fetchBoomBundle,
  createBoomBundle,
  updateBoomBundle,
  createMenuItem,
  updateMenuItem,
  extractId,
  type BoomBundlePayload,
} from "@/hooks/useHeaderSubItems";
import SuccessModal from "@/components/common/SuccessModal";

const BoomBundleFormPage: React.FC = () => {
  const { categoryId, subItemId } = useParams<{
    categoryId: string;
    subItemId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categoriesData } = useHeaderCategoriesQuery();
  const { data: menuItemResponse, isLoading: isMenuItemLoading } =
    useMenuItemQuery(subItemId);

  const [initialData, setInitialData] = useState<HeaderSubItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMenuItemLoading) return;

      // 1. Fetch from boom bundle API if subItemId exists and is not 'new'
      if (subItemId && subItemId !== "new") {
        const menuItem = menuItemResponse?.menuItem;
        const linkedId = menuItem?.linkedItemId || subItemId;

        if (linkedId) {
          try {
            const res = await fetchBoomBundle(linkedId);
            const bundle = res?.boomBundle || res?.data || res;
            if (bundle && isMounted) {
              setInitialData({
                id: menuItem?._id || subItemId,
                name: menuItem?.title || bundle.name || "",
                path: menuItem?.linkUrl || bundle.path || "",
                icon: menuItem?.iconUrl || bundle.icon || "",
                pageType: "boom-bundle",
                linkedItemId: bundle._id || linkedId,
                pageHeadline: bundle.pageHeadline || menuItem?.title || "",
                heroHighlight: bundle.heroHighlight || "",
                heroSubtitle: bundle.heroSubtitle || "",
                pageHeroImage: bundle.pageHeroImage || "",
                heroBookNowLink: bundle.heroBookNowLink || "",
                sectionHeadline: bundle.sectionHeadline || "",
                sectionDescription: bundle.sectionDescription || "",
                bundleCards: bundle.bundleCards || [],
                checklistItems: bundle.checklistItems || [],
                importantInfoHeading: bundle.importantInfoHeading || "",
                importantInfoText: bundle.importantInfoText || "",
              });
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn("Could not fetch boom bundle API:", err);
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

    const pagePayload: BoomBundlePayload = {
      name: subItemData.name || "",
      path: subItemData.path || "",
      icon: subItemData.icon || "",
      pageHeadline: subItemData.pageHeadline || "",
      heroHighlight: subItemData.heroHighlight || "",
      heroSubtitle: subItemData.heroSubtitle || "",
      pageHeroImage: subItemData.pageHeroImage || "",
      heroBookNowLink: subItemData.heroBookNowLink || "",
      sectionHeadline: subItemData.sectionHeadline || "",
      sectionDescription: subItemData.sectionDescription || "",
      bundleCards: subItemData.bundleCards || [],
      checklistItems: subItemData.checklistItems || [],
      importantInfoHeading: subItemData.importantInfoHeading || "",
      importantInfoText: subItemData.importantInfoText || "",
      isActive: subItemData.isActive ?? true,
    };

    let targetLinkedItemId = initialData?.linkedItemId;

    try {
      if (subItemId && subItemId !== "new" && targetLinkedItemId) {
        // 1. Update Boom Bundle real entity
        await updateBoomBundle(targetLinkedItemId, pagePayload);

        // 2. Update Menu Item (including all navigation setup fields)
        await updateMenuItem(subItemId, {
          title: subItemData.name || "",
          name: subItemData.name || "",
          section: categoryId || "boom-bundles",
          sectionLabel: "Boom Bundles",
          linkUrl: subItemData.path || "",
          path: subItemData.path || "",
          icon: subItemData.icon || "",
          iconUrl: subItemData.icon || "",
          type: "boom-bundle",
          linkedItemId: targetLinkedItemId,
          isActive: subItemData.isActive ?? true,
        });
      } else {
        // 1. Create Boom Bundle real entity
        const res = await createBoomBundle(pagePayload);
        targetLinkedItemId = extractId(res);

        // 2. Create Menu Item linked to created page (including all navigation setup fields)
        await createMenuItem({
          title: subItemData.name || "",
          name: subItemData.name || "",
          section: categoryId || "boom-bundles",
          sectionLabel: "Boom Bundles",
          linkUrl: subItemData.path || "",
          path: subItemData.path || "",
          icon: subItemData.icon || "",
          iconUrl: subItemData.icon || "",
          type: "boom-bundle",
          linkedItemId: targetLinkedItemId,
          order: 1,
          isActive: subItemData.isActive ?? true,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["header-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["menu-item"] });

      setShowSuccessModal(true);
    } catch (error: unknown) {
      console.error("Error saving Boom Bundle API:", error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiErr = error as any;
      const msg =
        apiErr?.response?.data?.message ||
        apiErr?.message ||
        "Failed to save boom bundle. Please check the fields and try again.";
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
          Loading Boom Bundle details...
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
            ? "Edit Boom Bundle"
            : "Add Boom Bundle"}
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
        <BoomBundleForm
          initialData={initialData}
          onClose={handleClose}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        title={
          subItemId && subItemId !== "new"
            ? "Boom Bundle Updated!"
            : "Boom Bundle Created!"
        }
        message="Boom Bundle details have been saved successfully."
        buttonText="OK"
        onConfirm={handleSuccessRedirect}
      />
    </div>
  );
};

export default BoomBundleFormPage;
