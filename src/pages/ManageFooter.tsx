import React, { useState, useEffect } from "react";
import { EditIcon, TrashIcon } from "@/assets/icons";
import FooterLinkModal, {
  type FooterLinkModalSaveData,
} from "@/components/ManageFooter/FooterLinkModal";
import SuccessModal from "@/components/common/SuccessModal";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import {
  useContentPagesQuery,
  useCreateContentPageMutation,
  useUpdateContentPageMutation,
  useDeleteContentPageMutation,
  useToggleContentPageActiveMutation,
} from "@/hooks/useContentPages";
import { useFooterQuery, useUpdateFooterMutation } from "@/hooks/useFooter";
import { useLocationStore } from "@/store/locationStore";
import ImageInputWithUpload from "@/components/common/ImageInputWithUpload";

interface FooterLink {
  id: string;
  title: string;
  slug: string;
  label: string;
  url: string;
  content: string;
  tagline?: string;
  heroBgImage?: string;
  heroVideo?: string;
  isActive: boolean;
}

const ManageFooter: React.FC = () => {
  const { selectedLocation } = useLocationStore();
  const locationSlug = selectedLocation?.slug;

  // Include inactive pages so admin can see and manage both active and deleted/hidden pages
  const {
    data: pagesData,
    isLoading: isPagesLoading,
    error: pagesError,
  } = useContentPagesQuery(true);

  const {
    data: footerData,
    isLoading: isFooterLoading,
    error: footerError,
  } = useFooterQuery(locationSlug);

  const createMutation = useCreateContentPageMutation();
  const updateMutation = useUpdateContentPageMutation();
  const deleteMutation = useDeleteContentPageMutation();
  const toggleActiveMutation = useToggleContentPageActiveMutation();
  const updateFooterMutation = useUpdateFooterMutation(locationSlug);

  const [links, setLinks] = useState<FooterLink[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingPage, setDeletingPage] = useState<FooterLink | null>(null);
  const [successModalData, setSuccessModalData] = useState<{
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (pagesData?.pages) {
      setLinks(
        pagesData.pages.map((page) => ({
          id: page._id,
          title: page.title || "",
          slug: page.slug || "",
          label: page.title ? page.title.toUpperCase() : "",
          url: page.slug ? `/${page.slug}` : "",
          content: page.content || "",
          tagline: page.tagline || page.subtitle || "",
          heroBgImage: page.heroBgImage || page.heroImage || page.bgMediaUrl || "",
          heroVideo: page.heroVideo || page.videoUrl || "",
          isActive: page.isActive !== false,
        })),
      );
    }
  }, [pagesData]);

  const [companyInfo, setCompanyInfo] = useState({
    addressLabel: "",
    address: "",
    phone: "",
    copyright: "",
  });

  const [socials, setSocials] = useState({
    facebook: "",
    instagram: "",
    tiktok: "",
  });

  const [bgWallpaperImageUrl, setBgWallpaperImageUrl] = useState("");

  useEffect(() => {
    if (footerData?.content?.data) {
      const {
        companyInfo: apiCompanyInfo,
        socialMediaLinks: apiSocials,
        bgWallpaperImageUrl: apiBgWallpaper,
      } = footerData.content.data;
      setCompanyInfo({
        addressLabel:
          apiCompanyInfo?.addressLabel || apiCompanyInfo?.addresslabel || "",
        address: apiCompanyInfo?.officeAddress || "",
        phone: apiCompanyInfo?.phoneNumber || "",
        copyright: apiCompanyInfo?.copyrightText || "",
      });
      setSocials({
        facebook: apiSocials?.facebookUrl || "",
        instagram: apiSocials?.instagramUrl || "",
        tiktok: apiSocials?.tiktokUrl || "",
      });
      setBgWallpaperImageUrl(apiBgWallpaper || "");
    }
  }, [footerData]);

  const handleSaveFooterChanges = async () => {
    setSaveError(null);
    try {
      await updateFooterMutation.mutateAsync({
        section: "footer",
        data: {
          companyInfo: {
            addressLabel: companyInfo.addressLabel,
            addresslabel: companyInfo.addressLabel,
            officeAddress: companyInfo.address,
            phoneNumber: companyInfo.phone,
            copyrightText: companyInfo.copyright,
          },
          socialMediaLinks: {
            facebookUrl: socials.facebook,
            instagramUrl: socials.instagram,
            tiktokUrl: socials.tiktok,
          },
          bgWallpaperImageUrl: bgWallpaperImageUrl.trim(),
        },
        isActive: true,
      });
      setSuccessModalData({
        title: "Footer Saved!",
        message: "Footer changes have been saved successfully.",
      });
    } catch (err: unknown) {
      console.error("Failed to save footer changes:", err);
      const apiErr = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setSaveError(
        apiErr?.response?.data?.message ||
          apiErr?.message ||
          "Failed to save footer changes. Please try again.",
      );
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);

  const handleOpenAddModal = () => {
    setEditingLink(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (link: FooterLink) => {
    setEditingLink(link);
    setIsModalOpen(true);
  };

  const handleSaveModal = async ({
    title,
    slug,
    content,
    tagline,
    heroBgImage,
    heroVideo,
    isActive,
  }: FooterLinkModalSaveData) => {
    const excerpt = tagline || `${title} information for Team Up.`;
    const metaTitle = `${title} | Team Up`;
    const metaDescription =
      tagline || `Read the Team Up ${title.toLowerCase()} and related information.`;

    const pagePayload = {
      title,
      slug,
      content,
      tagline,
      subtitle: tagline,
      heroBgImage,
      heroImage: heroBgImage,
      bgMediaUrl: heroBgImage,
      heroVideo,
      videoUrl: heroVideo,
      excerpt,
      metaTitle,
      metaDescription,
      isActive,
    };

    try {
      if (editingLink) {
        // Edit existing page identified by the existing slug
        const targetSlug = editingLink.slug || editingLink.url.replace(/^\//, "");
        await updateMutation.mutateAsync({
          slug: targetSlug,
          data: pagePayload,
        });
        setSuccessModalData({
          title: "Page Updated!",
          message: `Successfully updated page "${title}".`,
        });
      } else {
        // Add new dynamic page
        await createMutation.mutateAsync(pagePayload);
        setSuccessModalData({
          title: "Page Created!",
          message: `Successfully created page "${title}".`,
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save page:", err);
      throw err;
    }
  };

  // Quick toggle Active/Inactive visibility
  const handleToggleActive = async (link: FooterLink) => {
    try {
      await toggleActiveMutation.mutateAsync({
        slug: link.slug,
        isActive: !link.isActive,
      });
      setSuccessModalData({
        title: !link.isActive ? "Page Published" : "Page Hidden",
        message: !link.isActive
          ? `Page "${link.title}" is now active and published to public view.`
          : `Page "${link.title}" has been removed from public view.`,
      });
    } catch (err: unknown) {
      console.error("Failed to toggle page status:", err);
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      setSaveError(
        apiErr?.response?.data?.message ||
          apiErr?.message ||
          "Failed to update page status. Please try again.",
      );
    }
  };

  // Delete page from public view by slug (DELETE /api/content-pages/:slug)
  const handleConfirmDelete = async () => {
    if (!deletingPage) return;
    try {
      await deleteMutation.mutateAsync(deletingPage.slug);
      setSuccessModalData({
        title: "Page Removed",
        message: `Page "${deletingPage.title}" (/${deletingPage.slug}) has been deleted from public view.`,
      });
      setDeletingPage(null);
    } catch (err: unknown) {
      console.error("Failed to delete page:", err);
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      setSaveError(
        apiErr?.response?.data?.message ||
          apiErr?.message ||
          "Failed to delete page. Please try again.",
      );
      setDeletingPage(null);
    }
  };

  const activeCount = links.filter((l) => l.isActive).length;
  const inactiveCount = links.filter((l) => !l.isActive).length;
  const displayedLinks = links.filter((l) => {
    if (filterStatus === "active") return l.isActive;
    if (filterStatus === "inactive") return !l.isActive;
    return true;
  });

  if (isPagesLoading || isFooterLoading) {
    return (
      <div className="p-6 text-white min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E1017D]"></div>
      </div>
    );
  }

  if (pagesError || footerError) {
    return (
      <div className="p-6 text-white min-h-screen">
        <div className="text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          Failed to load footer configuration. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Manage Footer & Footer Pages</h1>
        <p className="text-gray-400">
          Configure footer pages, routing slugs, public visibility, and footer information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Footer Pages */}
        <div className="space-y-8">
          <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Footer Pages
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Public routes and top navigation footer links.
                </p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer shrink-0 shadow-md"
              >
                + Add Footer Page
              </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 mb-4 p-1 bg-[#161616] rounded-lg border border-[#2D2D2D] text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  filterStatus === "all"
                    ? "bg-[#2A2A2A] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                All Pages ({links.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("active")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === "active"
                    ? "bg-[#2A2A2A] text-emerald-400 shadow-sm"
                    : "text-gray-400 hover:text-emerald-400"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("inactive")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === "inactive"
                    ? "bg-[#2A2A2A] text-amber-400 shadow-sm"
                    : "text-gray-400 hover:text-amber-400"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Hidden / Inactive ({inactiveCount})
              </button>
            </div>

            <div className="space-y-3">
              {displayedLinks.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-[#161616] rounded-xl border border-[#2D2D2D]">
                  No {filterStatus !== "all" ? filterStatus : ""} pages found. Click &quot;+ Add Footer Page&quot; to create one.
                </div>
              ) : (
                displayedLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-xl bg-[#222222] transition-colors ${
                      link.isActive
                        ? "border-[#3A3530] hover:border-[#4A4540]"
                        : "border-amber-900/30 bg-[#1e1c1a]/60 hover:border-amber-700/50"
                    }`}
                  >
                    {/* Thumbnail / Media indicator */}
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-[#1A1A1A] border border-[#3A3530] shrink-0 relative flex items-center justify-center">
                      {link.heroBgImage ? (
                        <img
                          src={link.heroBgImage}
                          alt={link.title || link.label}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-[10px] text-gray-500 font-medium text-center px-1">
                          No Media
                        </div>
                      )}
                      {link.heroVideo && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] text-[#E1017D] px-1 rounded font-bold font-mono">
                          VID
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-white">
                          {link.title || link.label}
                        </span>

                        {/* Route slug */}
                        <span className="text-xs text-gray-400 bg-[#1A1A1A] px-2 py-0.5 rounded border border-[#3A3530] font-mono">
                          /{link.slug}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border ${
                            link.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              link.isActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                            }`}
                          />
                          {link.isActive ? "Public" : "Hidden"}
                        </span>

                        {link.heroBgImage && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Hero Image
                          </span>
                        )}
                        {link.heroVideo && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            Hero Video
                          </span>
                        )}
                      </div>

                      {link.tagline && (
                        <div className="text-xs text-[#E1017D] font-medium mb-1 line-clamp-1">
                          {link.tagline}
                        </div>
                      )}

                      <div className="text-xs text-gray-400 line-clamp-1 italic bg-[#1A1A1A] p-1.5 rounded border border-[#2F2A26]">
                        {(() => {
                          const plainText = link.content.replace(/<[^>]+>/g, "");
                          if (!plainText) return "No content written...";
                          return plainText.length > 100
                            ? `${plainText.substring(0, 100)}...`
                            : plainText;
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Quick visibility toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(link)}
                        disabled={toggleActiveMutation.isPending}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer font-medium ${
                          link.isActive
                            ? "text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white"
                            : "text-emerald-400 border-emerald-600/40 bg-emerald-500/10 hover:bg-emerald-500/20"
                        }`}
                        title={link.isActive ? "Hide from public view" : "Publish to public view"}
                      >
                        {link.isActive ? "Hide" : "Publish"}
                      </button>

                      {/* Edit modal */}
                      <button
                        onClick={() => handleOpenEditModal(link)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Edit Page"
                      >
                        <EditIcon size={18} color="currentColor" />
                      </button>

                      {/* Delete page */}
                      <button
                        onClick={() => setDeletingPage(link)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Page from Public View"
                      >
                        <TrashIcon size={18} color="currentColor" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Background Wallpaper */}
          <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
            <h2 className="text-xl font-semibold text-white mb-6">
              Footer Background Wallpaper
            </h2>
            <ImageInputWithUpload
              value={bgWallpaperImageUrl}
              onChange={(url) => setBgWallpaperImageUrl(url)}
              label="Background Wallpaper Image"
              hint="1920×400 px • WebP/JPG/SVG"
              placeholder="https://api.teamuparena.com/uploads/footer-background.webp"
              showPreview={true}
              previewHeight="h-36"
              previewWidth="w-full"
              objectFit="cover"
            />
          </div>
        </div>

        {/* Right Column - Company Info & Socials */}
        <div className="space-y-8">
          {/* Company Info */}
          <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
            <h2 className="text-xl font-semibold text-white mb-6">
              Company Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Address Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Office Address"
                  value={companyInfo.addressLabel}
                  onChange={(e) =>
                    setCompanyInfo({
                      ...companyInfo,
                      addressLabel: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 rounded bg-[#2A2A2A] border border-[#3A3530] text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Address
                </label>
                <textarea
                  value={companyInfo.address}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, address: e.target.value })
                  }
                  className="w-full h-20 p-3 rounded bg-[#2A2A2A] border border-[#3A3530] text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={companyInfo.phone}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, phone: e.target.value })
                  }
                  className="w-full h-10 px-4 rounded bg-[#2A2A2A] border border-[#3A3530] text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Copyright Text
                </label>
                <input
                  type="text"
                  value={companyInfo.copyright}
                  onChange={(e) =>
                    setCompanyInfo({
                      ...companyInfo,
                      copyright: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 rounded bg-[#2A2A2A] border border-[#3A3530] text-white"
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
            <h2 className="text-xl font-semibold text-white mb-6">
              Social Media Links
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Facebook URL
                </label>
                <input
                  type="text"
                  value={socials.facebook}
                  onChange={(e) =>
                    setSocials({ ...socials, facebook: e.target.value })
                  }
                  className="w-full h-10 px-4 rounded bg-[#2A2A2A] border border-[#3A3530] text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Instagram URL
                </label>
                <input
                  type="text"
                  value={socials.instagram}
                  onChange={(e) =>
                    setSocials({ ...socials, instagram: e.target.value })
                  }
                  className="w-full h-10 px-4 rounded bg-[#2A2A2A] border border-[#3A3530] text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  TikTok URL
                </label>
                <input
                  type="text"
                  value={socials.tiktok}
                  onChange={(e) =>
                    setSocials({ ...socials, tiktok: e.target.value })
                  }
                  className="w-full h-10 px-4 rounded bg-[#2A2A2A] border border-[#3A3530] text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-end sm:items-center justify-end gap-4">
        {saveError && (
          <div className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-lg">
            {saveError}
          </div>
        )}
        <button
          type="button"
          onClick={handleSaveFooterChanges}
          disabled={updateFooterMutation.isPending}
          className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-8 py-3 rounded-lg font-medium transition-colors text-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {updateFooterMutation.isPending && (
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
          )}
          {updateFooterMutation.isPending
            ? "Saving..."
            : "Save All Footer Changes"}
        </button>
      </div>

      {isModalOpen && (
        <FooterLinkModal
          initialTitle={editingLink?.title || editingLink?.label || ""}
          initialSlug={editingLink?.slug || editingLink?.url.replace(/^\//, "") || ""}
          initialContent={editingLink?.content || ""}
          initialTagline={editingLink?.tagline || ""}
          initialHeroBgImage={editingLink?.heroBgImage || ""}
          initialHeroVideo={editingLink?.heroVideo || ""}
          initialIsActive={editingLink?.isActive ?? true}
          isAdding={!editingLink}
          onSave={handleSaveModal}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Confirmation modal for deleting page from public view */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingPage)}
        title="Delete Page from Public View"
        message="Are you sure you want to delete this page from public view? Public users will no longer see this page in the footer or website."
        itemName={deletingPage ? `${deletingPage.title} (/${deletingPage.slug})` : undefined}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPage(null)}
      />

      <SuccessModal
        isOpen={Boolean(successModalData)}
        title={successModalData?.title}
        message={successModalData?.message}
        buttonText="OK"
        onConfirm={() => setSuccessModalData(null)}
      />
    </div>
  );
};

export default ManageFooter;
