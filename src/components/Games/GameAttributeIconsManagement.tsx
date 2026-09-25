import { useState, useEffect } from "react";
import {
  useGameAttributeIconsQuery,
  useUpdateGameAttributeIconMutation,
  type GameAttributeIcon,
} from "@/hooks/useGames";
import ImageInputWithUpload from "@/components/common/ImageInputWithUpload";

export default function GameAttributeIconsManagement() {
  const { data, isLoading, isError, error } = useGameAttributeIconsQuery();
  const updateMutation = useUpdateGameAttributeIconMutation();

  const [iconsState, setIconsState] = useState<GameAttributeIcon[]>([]);
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (data?.icons) {
      setIconsState(data.icons);
      setDirtyKeys(new Set());
    }
  }, [data]);

  const handleFieldChange = (
    key: string,
    field: "label" | "iconUrl",
    value: string
  ) => {
    setIconsState((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
    setDirtyKeys((prev) => {
      const next = new Set(prev);
      const original = data?.icons?.find((i) => i.key === key);
      const current = iconsState.find((i) => i.key === key);
      const updatedItem = current ? { ...current, [field]: value } : null;

      const isChanged =
        original && updatedItem
          ? updatedItem.label !== original.label ||
            updatedItem.iconUrl !== original.iconUrl
          : true;

      if (isChanged) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const handleSaveSingle = async (key: string) => {
    const item = iconsState.find((i) => i.key === key);
    if (!item) return;

    setSavingKey(key);
    setFeedback(null);
    try {
      await updateMutation.mutateAsync({
        key: item.key,
        label: item.label.trim(),
        iconUrl: item.iconUrl.trim(),
      });
      setDirtyKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      setFeedback({
        message: `Updated "${item.label}" successfully!`,
        type: "success",
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update attribute icon. Please try again.";
      setFeedback({
        message: errorMsg,
        type: "error",
      });
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveAll = async () => {
    if (dirtyKeys.size === 0) return;
    setSavingKey("ALL");
    setFeedback(null);

    const keysToSave = Array.from(dirtyKeys);
    let successCount = 0;
    let failedKey: string | null = null;
    let failureMsg = "";

    for (const key of keysToSave) {
      const item = iconsState.find((i) => i.key === key);
      if (!item) continue;
      try {
        await updateMutation.mutateAsync({
          key: item.key,
          label: item.label.trim(),
          iconUrl: item.iconUrl.trim(),
        });
        successCount++;
        setDirtyKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } catch (err: unknown) {
        failedKey = item.label;
        failureMsg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Failed to update some icons.";
        break;
      }
    }

    setSavingKey(null);

    if (failedKey) {
      setFeedback({
        message: `Saved ${successCount} items, but failed on "${failedKey}": ${failureMsg}`,
        type: "error",
      });
    } else {
      setFeedback({
        message: `All ${successCount} attribute icons saved successfully!`,
        type: "success",
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <section className="w-full bg-[#181818] border border-[#2E2E2E] rounded-2xl p-6 sm:p-7 mb-8 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#2E2E2E]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white font-poppins tracking-wide">
              Game Attribute Icons
            </h2>
            <span className="text-[11px] font-semibold text-[#E1017D] bg-[#E1017D]/10 border border-[#E1017D]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Global Specs
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Configure icons and labels displayed for game specifications (e.g., Total People Per Lane, Time, Price, Wheelchair Access).
          </p>
        </div>

        {dirtyKeys.size > 0 && (
          <button
            onClick={handleSaveAll}
            disabled={savingKey !== null}
            className="bg-[#E1017D] hover:bg-[#c5016b] text-white px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-lg hover:shadow-[0_0_15px_rgba(225,1,125,0.4)] disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {savingKey === "ALL" ? (
              <>
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                <span>Saving All ({dirtyKeys.size})...</span>
              </>
            ) : (
              <span>Save All Changes ({dirtyKeys.size})</span>
            )}
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`mt-4 p-3.5 rounded-xl flex items-center justify-between text-xs sm:text-sm transition-all ${
            feedback.type === "success"
              ? "bg-emerald-950/70 border border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/70 border border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold">{feedback.type === "success" ? "✓" : "⚠"}</span>
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:no-underline ml-4 cursor-pointer opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-[#202020] border border-[#2D2D2D] rounded-xl p-4 animate-pulse flex flex-col gap-3"
            >
              <div className="h-4 bg-[#2E2E2E] rounded w-2/3" />
              <div className="h-10 bg-[#282828] rounded w-full" />
              <div className="h-16 bg-[#252525] rounded w-16" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
          Failed to load game attribute icons:{" "}
          {(error as Error)?.message || "Unknown error"}
        </div>
      ) : iconsState.length === 0 ? (
        <div className="mt-6 p-6 text-center text-gray-500 text-xs bg-[#202020] rounded-xl border border-[#2D2D2D]">
          No game attribute icons found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {iconsState.map((iconItem) => {
            const isDirty = dirtyKeys.has(iconItem.key);
            const isSavingThis = savingKey === iconItem.key;

            return (
              <div
                key={iconItem.key}
                className={`bg-[#202020] border rounded-xl p-4.5 transition-all flex flex-col justify-between gap-4 ${
                  isDirty
                    ? "border-[#E1017D]/70 shadow-[0_0_12px_rgba(225,1,125,0.15)]"
                    : "border-[#2E2E2E] hover:border-[#3E3E3E]"
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-xs font-semibold text-gray-300">
                      Display Label
                    </label>

                    {isDirty && (
                      <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        Unsaved
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={iconItem.label || ""}
                    onChange={(e) =>
                      handleFieldChange(iconItem.key, "label", e.target.value)
                    }
                    placeholder="Attribute Label"
                    className="w-full bg-[#161616] border border-[#333333] rounded-lg px-3 py-2 text-white text-xs font-medium focus:outline-none focus:border-[#E1017D] transition-colors"
                  />

                  <ImageInputWithUpload
                    key={iconItem.key}
                    label="Attribute Icon"
                    value={iconItem.iconUrl || ""}
                    onChange={(url) =>
                      handleFieldChange(iconItem.key, "iconUrl", url)
                    }
                    hint="SVG/PNG • 1:1"
                    placeholder="SVG/PNG URL or click Upload"
                    accept=".svg,image/svg+xml,image/png,image/webp,image/*"
                    aspectRatio="1:1"
                    previewHeight="h-16"
                    previewWidth="w-16"
                    objectFit="contain"
                    inputClassName="w-full bg-[#161616] border border-[#333333] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#E1017D] flex-1 font-mono"
                    buttonClassName="bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white px-3 py-2 rounded-lg text-xs border border-[#3D3D3D] shrink-0 disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                  />
                </div>

                <div className="pt-3 border-t border-[#2A2A2A] flex items-center justify-end">
                  <button
                    type="button"
                    disabled={!isDirty || isSavingThis || savingKey !== null}
                    onClick={() => handleSaveSingle(iconItem.key)}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer bg-[#2E2E2E] hover:bg-[#E1017D] text-white border border-[#3D3D3D] hover:border-[#E1017D]"
                  >
                    {isSavingThis ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
