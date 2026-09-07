import React, { useRef, useState, useEffect } from "react";
import { UploadIcon } from "@/assets/icons";
import { FormDropdown } from "@/components/common/FormDropdown";
import Toggle from "@/components/common/Toggle";
import { useCreateGameMutation, useUpdateGameMutation, useSingleGameQuery } from "@/hooks/useGames";
import { uploadFile } from "@/utils/fileUpload";

export interface GameData {
  gameName: string;
  peopleAllowedPerLane: string;
  totalLanes: string;
  timeOption: string;
  pricePerPerson: string;
  minimumAgeRequirement: string;
  idRequired: boolean;
  wheelchairAccessible: boolean;
  gameIcon: string;
  cardImage: string;
  bannerPhoto: string;
  headline: string;
  description: string;
}

interface GameModalProps {
  mode: "add" | "edit";
  gameIdOrSlug?: string;
  initialData?: Partial<GameData>;
  onClose: () => void;
  onSave?: (gameData: GameData) => void;
}

const emptyState: GameData = {
  gameName: "",
  peopleAllowedPerLane: "",
  totalLanes: "",
  timeOption: "",
  pricePerPerson: "",
  minimumAgeRequirement: "",
  idRequired: false,
  wheelchairAccessible: false,
  gameIcon: "",
  cardImage: "",
  bannerPhoto: "",
  headline: "",
  description: "",
};

const GameModal: React.FC<GameModalProps> = ({
  mode,
  gameIdOrSlug,
  initialData,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<GameData>({
    ...emptyState,
    ...initialData,
  });

  const { data: singleGameData, isLoading: isFetchingGame } = useSingleGameQuery(
    mode === "edit" ? gameIdOrSlug : undefined
  );

  useEffect(() => {
    if (mode === "edit" && singleGameData?.game) {
      const g = singleGameData.game;
      setFormData({
        gameName: g.gameName || g.name || "",
        peopleAllowedPerLane: g.peopleAllowedPerLane != null ? String(g.peopleAllowedPerLane) : "",
        totalLanes: g.totalLanes != null ? String(g.totalLanes) : "",
        timeOption: g.timeOption || g.duration || "",
        pricePerPerson: g.pricePerPerson != null ? String(g.pricePerPerson) : g.priceFrom != null ? String(g.priceFrom) : "",
        minimumAgeRequirement: g.minimumAgeRequirement || "",
        idRequired: g.idRequired ?? false,
        wheelchairAccessible: g.wheelchairAccessible ?? false,
        gameIcon: g.gameIconUrl || "",
        cardImage: g.cardImageUrl || g.imageUrl || "",
        bannerPhoto: g.bannerImageUrl || "",
        headline: g.headline || "",
        description: g.description || "",
      });
    }
  }, [mode, singleGameData]);

  const createGameMutation = useCreateGameMutation();
  const updateGameMutation = useUpdateGameMutation();

  const iconRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const timeOptions = [
    "Select Time",
    "30 Min",
    "60 Min",
    "Min: 30 - Max: 60",
    "Min: 60 - Max: 90",
  ];
  const ageOptions = ["If Required", "18+", "21+", "All Ages"];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      gameName: formData.gameName,
      peopleAllowedPerLane: parseInt(formData.peopleAllowedPerLane) || 0,
      totalLanes: parseInt(formData.totalLanes) || 0,
      timeOption: formData.timeOption,
      pricePerPerson: parseFloat(formData.pricePerPerson.replace(/[^0-9.]/g, "")) || 0,
      minimumAgeRequirement: formData.minimumAgeRequirement,
      idRequired: formData.idRequired,
      wheelchairAccessible: formData.wheelchairAccessible,
      gameIconUrl: formData.gameIcon || undefined,
      cardImageUrl: formData.cardImage || undefined,
      bannerImageUrl: formData.bannerPhoto || undefined,
      headline: formData.headline || undefined,
      description: formData.description || undefined,
      isActive: true,
    };

    if (mode === "add") {
      createGameMutation.mutate(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    } else if (mode === "edit" && gameIdOrSlug) {
      updateGameMutation.mutate(
        { gameIdOrSlug, payload },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else if (onSave) {
      onSave(formData);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  async function handleImageUpload(field: keyof GameData, file?: File) {
    if (!file) return;
    try {
      const url = await uploadFile(file);
      setFormData((prev) => ({
        ...prev,
        [field]: url,
      }));
    } catch (error) {
      console.error('File upload failed:', error);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#F9D2EA] rounded-2xl p-6 w-[683px] max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">
            {mode === "add" ? "Add Game" : "Edit Game"}
          </h2>
          <button
            onClick={onClose}
            className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M15 5L5 15M5 5L15 15" stroke="#000" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        {mode === "edit" && isFetchingGame ? (
          <div className="py-12 flex justify-center items-center gap-2 font-montserrat text-gray-700">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E1017D]"></div>
            Loading game details...
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Game Name
              </label>
              <input
                type="text"
                value={formData.gameName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gameName: e.target.value }))
                }
                className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white"
                placeholder="Enter Game Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                People Allowed Per Lane
              </label>
              <input
                type="text"
                value={formData.peopleAllowedPerLane}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    peopleAllowedPerLane: e.target.value,
                  }))
                }
                className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white"
                placeholder="Enter Number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Total Lanes
              </label>
              <input
                type="text"
                value={formData.totalLanes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalLanes: e.target.value,
                  }))
                }
                className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white"
                placeholder="Enter Number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Time option
              </label>
              <FormDropdown
                options={timeOptions}
                value={formData.timeOption}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, timeOption: value }))
                }
                placeholder="Select Time"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Price Per Person
              </label>
              <input
                type="text"
                value={formData.pricePerPerson}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricePerPerson: e.target.value,
                  }))
                }
                className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white"
                placeholder="Enter Amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Minimum Age Requirement
              </label>
              <FormDropdown
                options={ageOptions}
                value={formData.minimumAgeRequirement}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    minimumAgeRequirement: value,
                  }))
                }
                placeholder="If Required"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-20">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium text-black">
                ID Required
              </span>
              <Toggle
                checked={formData.idRequired}
                onChange={(checked) =>
                  setFormData((prev) => ({ ...prev, idRequired: checked }))
                }
                activeColor="#003240"
                inactiveColor="#4A4A4A"
                activeText="Yes"
                inactiveText="No"
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium text-black">
                Wheelchair Accessible
              </span>
              <Toggle
                checked={formData.wheelchairAccessible}
                onChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    wheelchairAccessible: checked,
                  }))
                }
                activeColor="#003240"
                inactiveColor="#4A4A4A"
                activeText="Yes"
                inactiveText="No"
              />
            </div>
          </div>

          {/* Game Icon */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Add Game Icon <span className="text-xs text-gray-500 font-normal ml-1">(1:1 Square • Rec: 160×160 px • SVG/PNG)</span>
              </label>
              {!formData.gameIcon ? (
                <div
                  className="border border-dashed border-[#4A4A4A] rounded-lg bg-white w-full flex flex-col items-center justify-center cursor-pointer "
                  style={{ minHeight: 90, height: 140 }}
                  onClick={() => iconRef.current?.click()}
                >
                  <span className="font-[500] text-[#323232] text-base mb-1">
                    Upload your game icon here
                  </span>
                  <UploadIcon className="w-8 h-8 text-[#C3C3C3]" />
                  <button
                    type="button"
                    className="mt-2 px-5 py-2 border-2 border-[#E1017D] text-[#E1017D] font-bold rounded-lg bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      iconRef.current?.click();
                    }}
                  >
                    Select Photo
                  </button>
                  <input
                    ref={iconRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    tabIndex={-1}
                    onChange={(e) =>
                      handleImageUpload("gameIcon", e.target.files?.[0])
                    }
                  />
                </div>
              ) : (
                <>
                  <div
                    className="border border-dashed border-[#4A4A4A] rounded-lg bg-white w-full flex items-center justify-center"
                    style={{ minHeight: 90, height:140 }}
                  >
                    <img
                      src={formData.gameIcon}
                      alt="Game Icon"
                      className="object-contain rounded"
                      style={{ maxHeight: 140, maxWidth: 164 }}
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <input
                      ref={iconRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      tabIndex={-1}
                      onChange={(e) =>
                        handleImageUpload("gameIcon", e.target.files?.[0])
                      }
                    />
                    <button
                      type="button"
                      className="px-5 py-2 border-2 border-[#E1017D] text-[#E1017D] font-bold rounded-lg bg-white"
                      onClick={() => iconRef.current?.click()}
                    >
                      Change
                    </button>
                  </div>
                </>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Add Card Image <span className="text-xs text-gray-500 font-normal ml-1">(1:1 Square • Rec: 800×800 px)</span>
              </label>
              {!formData.cardImage ? (
                <div
                  className="border border-dashed border-[#4A4A4A] rounded-lg bg-white w-full flex flex-col items-center justify-center cursor-pointer"
                  style={{ minHeight: 90, height: 140 }}
                  onClick={() => cardRef.current?.click()}
                >
                  <span className="font-[500] text-[#323232] text-base mb-1">
                    Upload your Card Image
                  </span>
                  <UploadIcon className="w-8 h-8 text-[#C3C3C3]" />
                  <button
                    type="button"
                    className="mt-2 px-5 py-2 border-2 border-[#E1017D] text-[#E1017D] font-bold rounded-lg bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      cardRef.current?.click();
                    }}
                  >
                    Select Photo
                  </button>
                  <input
                    ref={cardRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    tabIndex={-1}
                    onChange={(e) =>
                      handleImageUpload("cardImage", e.target.files?.[0])
                    }
                  />
                </div>
              ) : (
                <>
                  <div
                    className="border border-dashed border-[#4A4A4A] rounded-lg bg-white w-full flex items-center justify-center"
                    style={{ minHeight: 90, height: 140 }}
                  >
                    <img
                      src={formData.cardImage}
                      alt="Card"
                      className="h-[90px] object-contain rounded"
                      style={{ maxWidth: 164 }}
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <input
                      ref={cardRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      tabIndex={-1}
                      onChange={(e) =>
                        handleImageUpload("cardImage", e.target.files?.[0])
                      }
                    />
                    <button
                      type="button"
                      className="px-5 py-2 border-2 border-[#E1017D] text-[#E1017D] font-bold rounded-lg bg-white"
                      onClick={() => cardRef.current?.click()}
                    >
                      Change
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Banner - with inner Select and outer Change */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Add Game Banner Photo <span className="text-xs text-gray-500 font-normal ml-1">(16:9 • Rec: 1920×1080 or 2560×1440 px)</span>
            </label>
            {!formData.bannerPhoto ? (
              <div
                className="border border-dashed border-[#4A4A4A] rounded-lg bg-white w-full flex flex-col items-center justify-center cursor-pointer"
                style={{ minHeight: 110, height: 180 }}
                onClick={() => bannerRef.current?.click()}
              >
                <span className="font-[500] text-[#323232] text-base mb-1 mt-1.5">
                  Upload your game icon here
                </span>
                <UploadIcon className="w-8 h-8 text-[#C3C3C3]" />
                <span className="pt-2 text-xs text-gray-600 mb-2">
                  Supported file format PNG, JPEG, JPG
                </span>
                <button
                  type="button"
                  className="mt-1 px-5 py-2 border-2 border-[#E1017D] text-[#E1017D] font-bold rounded-lg bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    bannerRef.current?.click();
                  }}
                >
                  Select Photo
                </button>
                <input
                  ref={bannerRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  tabIndex={-1}
                  onChange={(e) =>
                    handleImageUpload("bannerPhoto", e.target.files?.[0])
                  }
                />
              </div>
            ) : (
              <>
                <div
                  className="border border-dashed border-[#4A4A4A] rounded-lg bg-white w-full flex items-center justify-center"
                  style={{ minHeight: 110, height: 180 }}
                >
                  <img
                    src={formData.bannerPhoto}
                    alt="Banner"
                    className="h-[90px] object-contain rounded"
                    style={{ maxWidth: "full" }}
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <input
                    ref={bannerRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    tabIndex={-1}
                    onChange={(e) =>
                      handleImageUpload("bannerPhoto", e.target.files?.[0])
                    }
                  />
                  <button
                    type="button"
                    className="px-5 py-2 border-2 border-[#E1017D] text-[#E1017D] font-bold rounded-lg bg-white"
                    onClick={() => bannerRef.current?.click()}
                  >
                    Change
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Headline */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-black mb-1">
              Add Headline
            </label>
            <input
              type="text"
              value={formData.headline || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, headline: e.target.value }))
              }
              className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white"
              placeholder="Add your game headline here......"
            />
          </div>
          {/* Description */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-black mb-1">
              Add Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white min-h-[100px]"
              placeholder="Add your game description here......"
            />
          </div>

          <div className="flex justify-end gap-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-7 py-2 border-2 border-[#E1017D] text-[#E1017D] font-bold rounded-lg bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createGameMutation.isPending || updateGameMutation.isPending}
              className="px-7 py-2 bg-[#E1017D] hover:bg-[#c5016b] disabled:opacity-50 text-white font-bold rounded-lg transition-colors duration-200"
            >
              {createGameMutation.isPending || updateGameMutation.isPending
                ? mode === "add"
                  ? "Creating..."
                  : "Saving..."
                : mode === "add"
                ? "Add Game"
                : "Save Changes"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default GameModal;
