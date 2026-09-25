/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import type {
  HeaderSubItem,
  OtherGameCard,
  ChecklistItem,
  ChooseGameCard,
} from "@/components/ManageHeader/types";
import { CloseIcon, UploadIcon, TrashIcon } from "@/assets/icons";
import { fetchGame, useGamesQuery } from "@/hooks/useGames";
import apiClient from "@/utils/apiClient";
import { uploadFile } from "@/utils/fileUpload";
import ImageInputWithUpload from "@/components/common/ImageInputWithUpload";
import { useHeaderCategoriesQuery } from "@/hooks/useHeaderCategories";
import SuccessModal from "@/components/common/SuccessModal";
import { MAX_VIDEO_SIZE_MB } from "@/constants/upload";

export interface GameFormValues {
  // Navigation & Category
  selectedCategoryId: string;
  name: string;
  slug: string;
  icon: string;
  pageType: "game" | "group-activity";

  // Hero Section
  pageHeadline: string;
  pageTagline: string;
  cardDescription: string;
  cardImage: string;
  pageHeroImage: string;
  videoUrl: string;
  heroBookNowLink: string;

  // Game Details
  peoplePerMachine: string;
  timeMin: string;
  lanes: string;
  price: string;
  minAge: string;
  idRequired: boolean;
  wheelchairAccess: boolean;
  tagsInput: string;
  otherGames: OtherGameCard[];

  // Group Activity
  sectionHeadline: string;
  sectionDescription: string;
  checklistItems: ChecklistItem[];
  howToBookHeadline: string;
  howToBookBody: string;
  howToBookLink: string;
  howToBookEmail: string;
  howToBookPhone: string;
  chooseGamesHeading: string;
  chooseGameCards: ChooseGameCard[];
}

interface GameFormProps {
  onClose: () => void;
  onSave?: (subItem?: Partial<HeaderSubItem>) => void | Promise<void>;
  initialData?: HeaderSubItem | null;
  subItemId?: string;
  menuItemId?: string;
  gameId?: string;
  categoryIdFromUrl?: string;
  defaultCategoryId?: string;
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const GameForm: React.FC<GameFormProps> = ({
  onClose,
  onSave,
  initialData,
  subItemId,
  menuItemId,
  gameId,
  categoryIdFromUrl,
  defaultCategoryId,
}) => {
  const queryClient = useQueryClient();
  const { data: gamesData } = useGamesQuery();
  const { data: categoriesData } = useHeaderCategoriesQuery();

  const availableGames = useMemo(
    () => gamesData?.games || [],
    [gamesData?.games],
  );
  const categories = useMemo(
    () => categoriesData?.categories || [],
    [categoriesData?.categories],
  );

  const effectiveGameId =
    gameId && gameId !== "new"
      ? gameId
      : initialData?.linkedItemId
        ? String(initialData.linkedItemId)
        : undefined;
  const effectiveMenuItemId =
    (menuItemId || subItemId) && (menuItemId || subItemId) !== "new"
      ? menuItemId || subItemId
      : initialData?.id
        ? String(initialData.id)
        : undefined;
  const isNewGame =
    (!gameId || gameId === "new") &&
    (!effectiveMenuItemId || effectiveMenuItemId === "new") &&
    !initialData?.id;

  const [selectedGameId, setSelectedGameId] = useState<string>(
    effectiveGameId || "",
  );
  const [resolvedMenuItemId, setResolvedMenuItemId] = useState<string>(
    effectiveMenuItemId || "",
  );
  const [isSlugEditing, setIsSlugEditing] = useState(false);
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(
    Boolean(effectiveGameId || effectiveMenuItemId),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<GameFormValues>({
    defaultValues: {
      selectedCategoryId: defaultCategoryId || "",
      name: "",
      slug: "",
      icon: "",
      pageType: "game",
      pageHeadline: "",
      pageTagline: "",
      cardDescription: "",
      cardImage: "",
      pageHeroImage: "",
      videoUrl: "",
      heroBookNowLink: "",
      peoplePerMachine: "",
      timeMin: "",
      lanes: "",
      price: "",
      minAge: "",
      idRequired: false,
      wheelchairAccess: false,
      tagsInput: "family, indoor, featured",
      otherGames: [],
      sectionHeadline: "",
      sectionDescription: "",
      checklistItems: [],
      howToBookHeadline: "",
      howToBookBody: "",
      howToBookLink: "",
      howToBookEmail: "",
      howToBookPhone: "",
      chooseGamesHeading: "",
      chooseGameCards: [],
    },
  });

  const name = watch("name");
  const slug = watch("slug");
  const icon = watch("icon");
  const pageType = watch("pageType");
  const cardImage = watch("cardImage");
  const pageHeroImage = watch("pageHeroImage");
  const videoUrl = watch("videoUrl");
  const idRequired = watch("idRequired");
  const wheelchairAccess = watch("wheelchairAccess");
  const checklistItems = watch("checklistItems") || [];
  const chooseGameCards = watch("chooseGameCards") || [];
  const selectedCategoryId = watch("selectedCategoryId");

  // Auto-select "Choose Game" category when accessed from Game Management
  useEffect(() => {
    const cats = categoriesData?.categories || [];
    if (!categoryIdFromUrl && !selectedCategoryId && cats.length > 0) {
      const chooseGameCat = cats.find(
        (c) =>
          c.name.toLowerCase().includes("game") ||
          c.name.toLowerCase().includes("choose"),
      );
      setValue(
        "selectedCategoryId",
        chooseGameCat ? chooseGameCat.id : cats[0].id,
      );
    }
  }, [categoryIdFromUrl, selectedCategoryId, categoriesData, setValue]);

  // Debounced auto-slugify for new games when name changes
  useEffect(() => {
    if (isNewGame && !hasManuallyEditedSlug && name?.trim()) {
      const timer = setTimeout(() => {
        setValue("slug", slugify(name), {
          shouldValidate: true,
          shouldDirty: true,
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [name, isNewGame, hasManuallyEditedSlug, setValue]);

  // Separate dual-fetch: fetch game via gameId and menu item via menuItemId
  useEffect(() => {
    let isMounted = true;

    const loadGameAndMenu = async () => {
      if (isNewGame) {
        setIsLoadingDetails(false);
        return;
      }

      setIsLoadingDetails(true);
      let gameData: any = null;
      let menuItemData: any = initialData || null;

      // 1. Fetch Game separately with gameId
      if (effectiveGameId) {
        try {
          const res = await fetchGame(effectiveGameId);
          gameData = res?.game || res?.data || res;
        } catch (err) {
          console.warn("Could not fetch game with gameId:", err);
        }
      }

      // 2. Fetch Menu Item separately with menuItemId
      if (effectiveMenuItemId) {
        try {
          const res = await apiClient.get(`/menu-items/${effectiveMenuItemId}`);
          const raw = res?.data;
          menuItemData =
            raw?.menuItem || raw?.data?.menuItem || raw?.data || raw;
        } catch (err) {
          console.warn("Could not fetch menu item with menuItemId:", err);
        }
      }

      // 3. Fallback: if gameData wasn't fetched directly, check menuItemData pointers
      if (!gameData && menuItemData) {
        const linkedId =
          menuItemData.linkedItemId != null
            ? String(menuItemData.linkedItemId)
            : undefined;
        if (linkedId) {
          try {
            const res = await fetchGame(linkedId);
            gameData = res?.game || res?.data || res;
          } catch {
            // ignore
          }
        }
        const rawPath = menuItemData.linkUrl || menuItemData.path || "";
        const extractedSlug = (
          menuItemData.slug || rawPath.replace(/^\/?(games\/)?/, "")
        )
          .replace(/^\//, "")
          .trim();
        if (!gameData && extractedSlug) {
          try {
            const res = await fetchGame(extractedSlug);
            gameData = res?.game || res?.data || res;
          } catch {
            // ignore
          }
        }
        if (!gameData && availableGames.length > 0) {
          const slugLower = extractedSlug.toLowerCase();
          const titleLower = (menuItemData?.title || menuItemData?.name || "")
            .toLowerCase()
            .trim();
          const found = availableGames.find((g: any) => {
            const gSlug = (g.slug || "").toLowerCase().trim();
            const gName = (g.name || g.gameName || "").toLowerCase().trim();
            return (
              (linkedId && String(g._id) === linkedId) ||
              (gSlug && slugLower && gSlug === slugLower) ||
              (gName && titleLower && gName === titleLower)
            );
          });
          if (found?._id) {
            try {
              const res = await fetchGame(found._id);
              gameData = res?.game || res?.data || res || found;
            } catch {
              gameData = found;
            }
          }
        }
      }

      if (!isMounted) return;

      if (gameData?._id) {
        setSelectedGameId(String(gameData._id));
      }
      if (effectiveMenuItemId) {
        setResolvedMenuItemId(effectiveMenuItemId);
      }

      const detailsMap: Record<string, string> = {};
      if (Array.isArray(menuItemData?.details)) {
        menuItemData.details.forEach((d: { label: string; value: string }) => {
          if (d?.label) detailsMap[d.label] = d.value;
        });
      }

      const price = gameData?.pricePerPerson ?? gameData?.priceFrom;
      const time = gameData?.timeOption || gameData?.duration;
      const lanes =
        gameData?.totalLanes != null ? String(gameData.totalLanes) : "";
      const people =
        gameData?.peopleAllowedPerLane != null
          ? String(gameData.peopleAllowedPerLane)
          : "";

      const finalName =
        gameData?.name ||
        gameData?.gameName ||
        menuItemData?.title ||
        menuItemData?.name ||
        "";
      const rawSlug =
        gameData?.slug ||
        menuItemData?.slug ||
        (menuItemData?.linkUrl || menuItemData?.path || "").replace(
          /^\/?(games\/)?/,
          "",
        );
      const cleanSlug = rawSlug.replace(/^\//, "").trim();

      reset({
        selectedCategoryId: categoryIdFromUrl || defaultCategoryId || "",
        name: finalName,
        slug: cleanSlug,
        icon:
          gameData?.gameIconUrl ||
          menuItemData?.icon ||
          menuItemData?.iconUrl ||
          "",
        pageType: "game",
        pageHeadline:
          gameData?.name ||
          gameData?.gameName ||
          menuItemData?.title ||
          menuItemData?.name ||
          "",
        pageTagline:
          detailsMap["Tagline"] ||
          menuItemData?.tagline ||
          menuItemData?.pageTagline ||
          "",
        cardDescription:
          gameData?.description ||
          menuItemData?.taglineDescription ||
          menuItemData?.cardDescription ||
          "",
        cardImage:
          gameData?.cardImageUrl ||
          gameData?.imageUrl ||
          menuItemData?.cardImage ||
          menuItemData?.imageUrl ||
          "",
        pageHeroImage:
          gameData?.bannerImageUrl ||
          gameData?.imageUrl ||
          gameData?.cardImageUrl ||
          menuItemData?.heroImageUrl ||
          menuItemData?.imageUrl ||
          "",
        videoUrl: gameData?.videoUrl || menuItemData?.videoUrl || "",
        heroBookNowLink:
          menuItemData?.bookingUrl || menuItemData?.heroBookNowLink || "",
        peoplePerMachine:
          people ||
          (detailsMap["How Many"]
            ? detailsMap["How Many"].replace(/[^0-9]/g, "")
            : ""),
        timeMin: time || detailsMap["Time"] || "",
        lanes:
          lanes ||
          (detailsMap["How Many LANES"]
            ? detailsMap["How Many LANES"].replace(/[^0-9]/g, "")
            : ""),
        price:
          price != null
            ? String(price)
            : detailsMap["Price"]
              ? detailsMap["Price"].replace(/[^0-9.]/g, "")
              : "",
        minAge:
          gameData?.minimumAgeRequirement || detailsMap["Minimum Age"] || "",
        idRequired: Boolean(gameData?.idRequired ?? false),
        wheelchairAccess: Boolean(
          gameData?.wheelchairAccessible ??
          detailsMap["Wheelchair Access"]?.toLowerCase() === "yes",
        ),
        tagsInput:
          gameData?.tags && gameData.tags.length > 0
            ? gameData.tags.join(", ")
            : "family, indoor, featured",
        otherGames: menuItemData?.otherGames || [],
        sectionHeadline: "",
        sectionDescription: "",
        checklistItems: [],
        howToBookHeadline: "",
        howToBookBody: "",
        howToBookLink: "",
        howToBookEmail: "",
        howToBookPhone: "",
        chooseGamesHeading: "",
        chooseGameCards: [],
      });

      setIsLoadingDetails(false);
    };

    loadGameAndMenu();

    return () => {
      isMounted = false;
    };
  }, [
    effectiveGameId,
    effectiveMenuItemId,
    categoryIdFromUrl,
    defaultCategoryId,
    isNewGame,
    reset,
    initialData,
    availableGames,
  ]);

  const onSubmit = async (data: GameFormValues) => {
    const cleanSlug = (data.slug.trim() || slugify(data.name))
      .replace(/^\//, "")
      .replace(/^games\//, "");
    const formattedPath = `/games/${cleanSlug}`;

    if (!data.name.trim() || !cleanSlug) return;

    try {
      let targetGameId =
        selectedGameId ||
        (initialData?.linkedItemId
          ? String(initialData.linkedItemId)
          : undefined);

      const numPrice = parseFloat(data.price);
      const parsedTags = data.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const parsedPeople = parseInt(
        data.peoplePerMachine.replace(/[^0-9]/g, ""),
        10,
      );
      const parsedLanes = parseInt(data.lanes.replace(/[^0-9]/g, ""), 10);
      const gameNameVal = (data.pageHeadline || data.name).trim();

      const gamePayload = {
        name: gameNameVal,
        gameName: gameNameVal,
        slug: cleanSlug,
        description: data.cardDescription,
        imageUrl: data.cardImage || data.pageHeroImage,
        cardImageUrl: data.cardImage || data.pageHeroImage,
        bannerImageUrl: data.pageHeroImage || data.cardImage,
        videoUrl: data.videoUrl,
        duration: data.timeMin,
        timeOption: data.timeMin,
        priceFrom: isNaN(numPrice) ? 0 : numPrice,
        pricePerPerson: isNaN(numPrice) ? 0 : numPrice,
        peopleAllowedPerLane: isNaN(parsedPeople) ? 0 : parsedPeople,
        totalLanes: isNaN(parsedLanes) ? 0 : parsedLanes,
        minimumAgeRequirement: data.minAge,
        idRequired: data.idRequired,
        wheelchairAccessible: data.wheelchairAccess,
        tags:
          parsedTags.length > 0 ? parsedTags : ["family", "indoor", "featured"],
        isActive: true,
      };

      // 1. Sync or Create in /games API
      if (targetGameId) {
        try {
          await apiClient.patch(`/games/${targetGameId}`, gamePayload);
        } catch (err) {
          console.error(
            "Failed to sync game updates via PATCH /api/games/:id",
            err,
          );
        }
      } else {
        try {
          const createGameRes = await apiClient.post("/games", gamePayload);
          const createdGame =
            createGameRes?.data?.game || createGameRes?.data || createGameRes;
          targetGameId = createdGame?._id || createdGame?.id;
        } catch (err) {
          console.error("Failed to create game via POST /api/games", err);
        }
      }

      // 2. Sync or Create menu item via /menu-items API
      const targetCatId = categoryIdFromUrl || data.selectedCategoryId;
      const detailsArray = [
        {
          label: "How Many",
          value: data.peoplePerMachine || "1-2 Person",
          note: "Per Machine",
        },
        { label: "How Many LANES", value: data.lanes || "8 LANES", note: "" },
        { label: "Time", value: data.timeMin || "30 or 60", note: "Minutes" },
        { label: "Price", value: data.price || "9 to 17", note: "Per Person" },
        { label: "Minimum Age", value: data.minAge || "All Allowed", note: "" },
        {
          label: "Wheelchair Access",
          value: data.wheelchairAccess ? "Yes" : "No",
          note: "Call the provider",
        },
      ];

      const targetMenuId =
        resolvedMenuItemId || effectiveMenuItemId || initialData?.id;

      const menuPayload = {
        title: data.name.trim(),
        name: data.name.trim(),
        section: targetCatId || "choose-game",
        linkUrl: formattedPath,
        path: formattedPath,
        slug: cleanSlug,
        iconUrl: data.icon,
        icon: data.icon,
        type: "game",
        linkedItemId: targetGameId,
        heroImageUrl: data.pageHeroImage || data.cardImage,
        imageUrl: data.cardImage || data.pageHeroImage,
        videoUrl: data.videoUrl,
        tagline: data.pageTagline,
        taglineDescription: data.cardDescription,
        bookingUrl: data.heroBookNowLink,
        details: detailsArray,
      };

      if (targetMenuId && targetMenuId !== "new") {
        try {
          await apiClient.patch(`/menu-items/${targetMenuId}`, menuPayload);
        } catch (err) {
          console.error(
            "Failed to sync navigation setup via PATCH /api/menu-items/:id",
            err,
          );
        }
      } else if (targetCatId) {
        try {
          await apiClient.post("/menu-items", {
            ...menuPayload,
            order: 1,
            isActive: true,
          });
        } catch (err) {
          console.error(
            "Failed to create menu item via POST /api/menu-items",
            err,
          );
        }
      }

      // Invalidate queries so UI immediately reflects updated menu item and game data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["header-categories"] }),
        queryClient.invalidateQueries({ queryKey: ["menu-item"] }),
        queryClient.invalidateQueries({ queryKey: ["games"] }),
        queryClient.invalidateQueries({ queryKey: ["game"] }),
      ]);

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof GameFormValues,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setValue(field, url as any, { shouldDirty: true });
      } catch (error) {
        console.error("File upload failed:", error);
      }
    }
  };

  // ─── Checklist helpers ─────────────────────────────────────
  const addChecklist = () =>
    setValue(
      "checklistItems",
      [
        ...checklistItems,
        { id: Date.now().toString(), title: "", subtext: "" },
      ],
      { shouldDirty: true },
    );

  const removeChecklist = (id: string) =>
    setValue(
      "checklistItems",
      checklistItems.filter((c) => c.id !== id),
      { shouldDirty: true },
    );

  const updateChecklist = (
    index: number,
    field: keyof ChecklistItem,
    value: string,
  ) => {
    const next = [...checklistItems];
    next[index] = { ...next[index], [field]: value };
    setValue("checklistItems", next, { shouldDirty: true });
  };

  // ─── Choose Game Cards helpers ─────────────────────────────
  const handleChooseGameImageUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        const next = [...chooseGameCards];
        next[index].image = url;
        setValue("chooseGameCards", next, { shouldDirty: true });
      } catch (error) {
        console.error("File upload failed:", error);
      }
    }
  };

  const addChooseGameCard = () =>
    setValue(
      "chooseGameCards",
      [
        ...chooseGameCards,
        { id: Date.now().toString(), title: "", image: "", link: "" },
      ],
      { shouldDirty: true },
    );

  const removeChooseGameCard = (id: string) =>
    setValue(
      "chooseGameCards",
      chooseGameCards.filter((c) => c.id !== id),
      { shouldDirty: true },
    );

  const updateChooseGameCard = (
    index: number,
    field: keyof ChooseGameCard,
    value: string,
  ) => {
    const next = [...chooseGameCards];
    next[index] = { ...next[index], [field]: value };
    setValue("chooseGameCards", next, { shouldDirty: true });
  };

  const inputCls =
    "w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB3748] transition-colors";
  const inputSmCls =
    "w-full bg-[#1C1C1C] border border-[#3A3530] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB3748] text-sm transition-colors";
  const labelCls = "block text-sm font-medium text-gray-300 mb-2";
  const labelSmCls = "block text-xs font-medium text-gray-400 mb-1";
  const sectionTitleCls =
    "text-md font-medium text-white border-b border-[#3A3530] pb-2 mb-4";

  if (isLoadingDetails) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-[#FB3748] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm animate-pulse">
          Loading game details...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[#1C1C1C] rounded-xl border border-[#3A3530] w-full max-w-4xl overflow-hidden flex flex-col mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3A3530] shrink-0">
          <h2 className="text-lg font-semibold text-white">
            {initialData ? "Edit Sub-item / Game" : "Add Sub-item / Game"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 overflow-y-auto flex-1 space-y-8"
        >
          {/* ── Header Menu Category (Only when not provided in URL) ── */}
          {!categoryIdFromUrl && (
            <div className="p-4 bg-[#252525] border border-[#3A3530] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <label className={labelCls}>Header Menu Category</label>
                <span className="text-xs text-gray-400">
                  Controls which header dropdown this game reflects under
                </span>
              </div>
              <select {...register("selectedCategoryId")} className={inputCls}>
                <option value="">
                  -- Choose Category (Default: Choose Game) --
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ── Navigation Setup ── */}
          <div>
            <h3 className={sectionTitleCls}>Navigation Setup</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Navigation Display Name</label>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="e.g. Axe Throwing"
                  className={inputCls}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Game Slug
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSlugEditing((prev) => !prev)}
                    className="text-xs text-[#FB3748] hover:text-[#ff5c6b] transition-colors cursor-pointer font-medium"
                  >
                    {isSlugEditing ? "Done" : "Edit Slug"}
                  </button>
                </div>
                <div
                  className={`flex items-center rounded-lg overflow-hidden border transition-colors ${
                    isSlugEditing
                      ? "border-[#FB3748] bg-[#2A2A2A]"
                      : "border-[#3A3530] bg-[#1E1E1E]"
                  }`}
                >
                  <span className="px-3 py-2.5 text-xs text-gray-400 bg-[#161616] border-r border-[#3A3530] select-none font-mono">
                    /games/
                  </span>
                  <input
                    type="text"
                    value={slug || ""}
                    onChange={(e) => {
                      setValue(
                        "slug",
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-_]/g, ""),
                        { shouldValidate: true, shouldDirty: true },
                      );
                      setHasManuallyEditedSlug(true);
                    }}
                    disabled={!isSlugEditing}
                    placeholder="e.g. axe-throwing"
                    className="flex-1 bg-transparent px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed text-sm font-mono"
                  />
                  {isSlugEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setValue("slug", slugify(name || ""), {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setHasManuallyEditedSlug(false);
                      }}
                      title="Reset to name slug"
                      className="px-2.5 py-1 mr-2 text-xs bg-[#333333] hover:bg-[#3D3D3D] text-gray-300 rounded transition-colors"
                    >
                      Auto
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  {isNewGame && !hasManuallyEditedSlug
                    ? 'Auto-generated from game name. Click "Edit Slug" to customize.'
                    : "The unique URL identifier for this game page (/games/[slug])."}
                </p>
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className={labelCls}>
                Navigation Icon{" "}
                <span className="text-xs text-gray-400 font-normal ml-1.5">
                  (1:1 Square • Rec: 160×160 px • SVG/PNG)
                </span>
              </label>
              <div className="flex items-center gap-4">
                {icon ? (
                  <div className="relative group w-16 h-16 rounded-lg bg-[#2A2A2A] border border-[#3A3530] overflow-hidden flex items-center justify-center">
                    <img
                      src={icon}
                      alt="Icon"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setValue("icon", "", { shouldDirty: true })
                      }
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg bg-[#2A2A2A] border border-dashed border-[#3A3530] hover:border-[#FB3748] hover:text-[#FB3748] flex flex-col items-center justify-center text-gray-500 transition-colors"
                  >
                    <UploadIcon />
                    <span className="text-[10px] mt-1">Upload</span>
                  </button>
                )}
                <div className="flex-1">
                  <input
                    type="text"
                    {...register("icon")}
                    placeholder="Or paste image URL"
                    className={`${inputCls} text-sm`}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "icon")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Shared Hero ── */}
          <div>
            <h3 className={sectionTitleCls}>Hero Section</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Hero Headline / Game Name</label>
                  <input
                    type="text"
                    {...register("pageHeadline")}
                    placeholder="e.g. Axe Throw"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Page Tagline</label>
                  <input
                    type="text"
                    {...register("pageTagline")}
                    placeholder="e.g. Rack 'em up!"
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>
                  Card Description (Used in Group Activities lists)
                </label>
                <textarea
                  {...register("cardDescription")}
                  placeholder="e.g. Lorem Ipsum is simply dummy text..."
                  rows={2}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Book Now Link</label>
                <input
                  type="text"
                  {...register("heroBookNowLink")}
                  placeholder="e.g. /book/birthday"
                  className={inputCls}
                />
              </div>

              {/* Card Image (Square 1:1) */}
              <div className="bg-[#242424] border border-[#3A3530] rounded-xl p-5">
                <ImageInputWithUpload
                  label="Listing Card Thumbnail (1:1 Square)"
                  hint="1:1 • Rec: 800×800 or 1000×1000 px • WebP/JPG/PNG"
                  value={cardImage || ""}
                  onChange={(val) =>
                    setValue("cardImage", val, { shouldDirty: true })
                  }
                  placeholder="Paste square image URL or click upload"
                  accept="image/*"
                  aspectRatio="1:1"
                  previewWidth="w-48"
                  inputClassName="w-full h-10 px-3 rounded bg-[#1C1C1C] border border-[#3A3530] text-white text-sm focus:border-[#FB3748] focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Used on game cards, listing grids, and category previews
                  across the site.
                </p>
              </div>

              {/* Background Image (Photo / Fallback Poster) */}
              <div className="bg-[#242424] border border-[#3A3530] rounded-xl p-5">
                <ImageInputWithUpload
                  label="Hero Background Photo (Initial / Fallback Poster)"
                  hint="16:9 • Rec: 1920×1080 or 2560×1440 px • WebP/JPG/PNG"
                  value={pageHeroImage || ""}
                  onChange={(val) =>
                    setValue("pageHeroImage", val, { shouldDirty: true })
                  }
                  placeholder="Paste photo URL or click upload"
                  accept="image/*"
                  aspectRatio="16:9"
                  previewWidth="w-full max-w-xl"
                  inputClassName="w-full h-10 px-3 rounded bg-[#1C1C1C] border border-[#3A3530] text-white text-sm focus:border-[#FB3748] focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Displays immediately as the initial poster while the video
                  loads, and serves as the fallback on mobile low-power mode or
                  slow connections.
                </p>
              </div>

              {/* Background Video (Optional) */}
              <div className="bg-[#242424] border border-[#3A3530] rounded-xl p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400 font-medium">
                    Hero Background Video (Optional)
                  </span>
                  {videoUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setValue("videoUrl", "", { shouldDirty: true })
                      }
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-0.5 rounded bg-red-950/40 border border-red-900/50 hover:bg-red-900/40 transition-colors cursor-pointer"
                    >
                      Remove Video
                    </button>
                  )}
                </div>
                <ImageInputWithUpload
                  hint={`16:9 • MP4/WebM • Max ${MAX_VIDEO_SIZE_MB}MB`}
                  value={videoUrl || ""}
                  onChange={(val) =>
                    setValue("videoUrl", val, { shouldDirty: true })
                  }
                  placeholder="Paste video URL or click upload"
                  accept="video/*"
                  aspectRatio="16:9"
                  previewWidth="w-full max-w-xl"
                  buttonText="Upload Video"
                  inputClassName="w-full h-10 px-3 rounded bg-[#1C1C1C] border border-[#3A3530] text-white text-sm focus:border-[#FB3748] focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Autoplays in a loop behind the hero section. Leave empty to
                  use only the background photo.
                </p>
              </div>
            </div>
          </div>

          {/* ── CHOOSE GAME specific fields ── */}
          {pageType === "game" && (
            <>
              <div>
                <h3 className={sectionTitleCls}>Game Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelSmCls}>People Per Machine</label>
                      <input
                        type="text"
                        {...register("peoplePerMachine")}
                        placeholder="e.g. 1-4 PERSON"
                        className={inputSmCls}
                      />
                    </div>
                    <div>
                      <label className={labelSmCls}>Time (Minutes)</label>
                      <input
                        type="text"
                        {...register("timeMin")}
                        placeholder="e.g. 30 OR 60"
                        className={inputSmCls}
                      />
                    </div>
                    <div>
                      <label className={labelSmCls}>Lanes</label>
                      <input
                        type="text"
                        {...register("lanes")}
                        placeholder="e.g. 8 LANES"
                        className={inputSmCls}
                      />
                    </div>
                    <div>
                      <label className={labelSmCls}>Price</label>
                      <input
                        type="text"
                        {...register("price")}
                        placeholder="e.g. 9 TO 17"
                        className={inputSmCls}
                      />
                    </div>
                    <div>
                      <label className={labelSmCls}>Minimum Age</label>
                      <input
                        type="text"
                        {...register("minAge")}
                        placeholder="e.g. ALL ALLOWED"
                        className={inputSmCls}
                      />
                    </div>
                    <div>
                      <label className={labelSmCls}>
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        {...register("tagsInput")}
                        placeholder="e.g. family, indoor, featured"
                        className={inputSmCls}
                      />
                    </div>
                    <div className="flex items-center mt-3">
                      <label className="flex items-center cursor-pointer gap-3">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={Boolean(idRequired)}
                            onChange={(e) =>
                              setValue("idRequired", e.target.checked, {
                                shouldDirty: true,
                              })
                            }
                          />
                          <div
                            className={`block w-10 h-6 rounded-full transition-colors ${idRequired ? "bg-[#FB3748]" : "bg-[#3A3530]"}`}
                          ></div>
                          <div
                            className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${idRequired ? "translate-x-4" : ""}`}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-300">
                          ID Required
                        </span>
                      </label>
                    </div>
                    <div className="flex items-center mt-3">
                      <label className="flex items-center cursor-pointer gap-3">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={Boolean(wheelchairAccess)}
                            onChange={(e) =>
                              setValue("wheelchairAccess", e.target.checked, {
                                shouldDirty: true,
                              })
                            }
                          />
                          <div
                            className={`block w-10 h-6 rounded-full transition-colors ${wheelchairAccess ? "bg-[#FB3748]" : "bg-[#3A3530]"}`}
                          ></div>
                          <div
                            className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${wheelchairAccess ? "translate-x-4" : ""}`}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-300">
                          Wheelchair Access
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Other Games Cards (Commented out) ──
              <div>
                ...
              </div>
              */}
            </>
          )}

          {/* ── GROUP ACTIVITY specific fields ── */}
          {pageType === "group-activity" && (
            <>
              {/* What's Included */}
              <div>
                <h3 className={sectionTitleCls}>What's Included Section</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Section Headline</label>
                    <input
                      type="text"
                      {...register("sectionHeadline")}
                      placeholder="e.g. BATTLE IT OUT FOR A BIRTHDAY YOU WON'T FORGET"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Section Description</label>
                    <textarea
                      {...register("sectionDescription")}
                      placeholder="e.g. Chat to our expert party planners today to plan the ultimate birthday get together..."
                      rows={3}
                      className={inputCls}
                    />
                  </div>

                  {/* Checklist Items */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-300">
                        ✅ Checklist Items
                      </label>
                      <button
                        type="button"
                        onClick={addChecklist}
                        className="text-xs bg-[#2A2A2A] hover:bg-[#3A3530] text-white px-3 py-1.5 rounded transition-colors"
                      >
                        + Add Item
                      </button>
                    </div>
                    {checklistItems.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        No checklist items yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {checklistItems.map((item, index) => (
                          <div
                            key={item.id}
                            className="p-3 bg-[#252525] rounded-lg border border-[#3A3530] relative"
                          >
                            <button
                              type="button"
                              onClick={() => removeChecklist(item.id)}
                              className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                            >
                              <TrashIcon size={14} color="currentColor" />
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className={labelSmCls}>
                                  Title (Bold)
                                </label>
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) =>
                                    updateChecklist(
                                      index,
                                      "title",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g. 2 X GAMES"
                                  className={inputSmCls}
                                />
                              </div>
                              <div>
                                <label className={labelSmCls}>
                                  Subtext (optional)
                                </label>
                                <input
                                  type="text"
                                  value={item.subtext || ""}
                                  onChange={(e) =>
                                    updateChecklist(
                                      index,
                                      "subtext",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g. Choose from our epic selection..."
                                  className={inputSmCls}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* How to Book */}
              <div>
                <h3 className={sectionTitleCls}>How To Book Section</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Section Headline</label>
                    <input
                      type="text"
                      {...register("howToBookHeadline")}
                      placeholder="e.g. HERE'S HOW TO BOOK"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Body Text</label>
                    <textarea
                      {...register("howToBookBody")}
                      placeholder="e.g. To book this package, either click here, email us on... or give us a call on..."
                      rows={3}
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelSmCls}>Book Link</label>
                      <input
                        type="text"
                        {...register("howToBookLink")}
                        placeholder="/book/..."
                        className={inputSmCls}
                      />
                    </div>
                    <div>
                      <label className={labelSmCls}>Email</label>
                      <input
                        type="text"
                        {...register("howToBookEmail")}
                        placeholder="e.g. sales@boom.com"
                        className={inputSmCls}
                      />
                    </div>
                    <div>
                      <label className={labelSmCls}>Phone</label>
                      <input
                        type="text"
                        {...register("howToBookPhone")}
                        placeholder="e.g. 0207 286 0404"
                        className={inputSmCls}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Choose Your Games Cards */}
              <div>
                <div className="flex items-center justify-between border-b border-[#3A3530] pb-2 mb-4">
                  <h3 className="text-md font-medium text-white">
                    Choose Your Games Cards
                  </h3>
                  <button
                    type="button"
                    onClick={addChooseGameCard}
                    className="text-xs bg-[#2A2A2A] hover:bg-[#3A3530] text-white px-3 py-1.5 rounded transition-colors"
                  >
                    + Add Card
                  </button>
                </div>
                <div className="mb-3">
                  <label className={labelSmCls}>Section Heading</label>
                  <input
                    type="text"
                    {...register("chooseGamesHeading")}
                    placeholder="e.g. CHOOSE YOUR GAMES"
                    className={inputSmCls}
                  />
                </div>
                {chooseGameCards.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No game cards added yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {chooseGameCards.map((card, index) => (
                      <div
                        key={card.id}
                        className="p-4 bg-[#252525] rounded-lg border border-[#3A3530] relative"
                      >
                        <button
                          type="button"
                          onClick={() => removeChooseGameCard(card.id)}
                          className="absolute top-3 right-3 text-red-400 hover:text-red-300"
                        >
                          <TrashIcon size={16} color="currentColor" />
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelSmCls}>Card Title</label>
                            <input
                              type="text"
                              value={card.title}
                              onChange={(e) =>
                                updateChooseGameCard(
                                  index,
                                  "title",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g. AXE THROW"
                              className={inputSmCls}
                            />
                          </div>
                          <div>
                            <label className={labelSmCls}>
                              Card Image{" "}
                              <span className="text-[11px] text-gray-400 font-normal ml-1">
                                (1:1 Square • Rec: 800×800 px)
                              </span>
                            </label>
                            <div className="flex items-center gap-2">
                              {card.image && (
                                <img
                                  src={card.image}
                                  alt=""
                                  className="w-10 h-10 object-cover rounded border border-[#3A3530]"
                                />
                              )}
                              <div className="flex-1 relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleChooseGameImageUpload(index, e)
                                  }
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="w-full bg-[#1C1C1C] border border-dashed border-[#3A3530] rounded-lg px-3 py-2 text-white text-sm text-center hover:border-[#FB3748] transition-colors">
                                  {card.image ? "Change" : "Upload"}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <label className={labelSmCls}>Card Link</label>
                            <input
                              type="text"
                              value={card.link || ""}
                              onChange={(e) =>
                                updateChooseGameCard(
                                  index,
                                  "link",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g. /games/axe-throw"
                              className={inputSmCls}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#3A3530]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-[#2A2A2A] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name?.trim() || !slug?.trim() || isSubmitting}
              className="bg-[#FB3748] text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </form>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        title={isNewGame ? "Game Added!" : "Game Updated!"}
        message="Game details have been saved successfully."
        buttonText="OK"
        onConfirm={() => {
          setShowSuccessModal(false);
          if (onSave) {
            onSave({
              id: resolvedMenuItemId || effectiveMenuItemId,
              linkedItemId: selectedGameId || effectiveGameId,
            });
          } else {
            onClose();
          }
        }}
      />
    </div>
  );
};

export default GameForm;
