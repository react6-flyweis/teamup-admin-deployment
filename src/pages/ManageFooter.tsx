import React, { useState, useEffect } from 'react';
import { EditIcon, TrashIcon } from '@/assets/icons';
import FooterLinkModal from '@/components/ManageFooter/FooterLinkModal';
import {
  useContentPagesQuery,
  useCreateContentPageMutation,
  useUpdateContentPageMutation,
  useDeleteContentPageMutation,
} from '@/hooks/useContentPages';
import { useFooterQuery, useUpdateFooterMutation } from '@/hooks/useFooter';
import { useLocationStore } from '@/store/locationStore';

interface FooterLink {
  id: string;
  label: string;
  url: string;
  content: string;
}

const ManageFooter: React.FC = () => {
  const { selectedLocation } = useLocationStore();
  const locationSlug = selectedLocation?.slug;

  const { data: pagesData, isLoading: isPagesLoading, error: pagesError } = useContentPagesQuery();
  const { data: footerData, isLoading: isFooterLoading, error: footerError } = useFooterQuery(locationSlug);
  const createMutation = useCreateContentPageMutation();
  const updateMutation = useUpdateContentPageMutation();
  const deleteMutation = useDeleteContentPageMutation();
  const updateFooterMutation = useUpdateFooterMutation(locationSlug);

  const [links, setLinks] = useState<FooterLink[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    if (pagesData?.pages) {
      setLinks(
        pagesData.pages.map((page) => ({
          id: page._id,
          label: page.title.toUpperCase(),
          url: `/${page.slug}`,
          content: page.content,
        }))
      );
    }
  }, [pagesData]);

  const [companyInfo, setCompanyInfo] = useState({
    address: '',
    phone: '',
    copyright: '',
  });

  const [socials, setSocials] = useState({
    facebook: '',
    instagram: '',
    tiktok: '',
  });

  useEffect(() => {
    if (footerData?.content?.data) {
      const { companyInfo: apiCompanyInfo, socialMediaLinks: apiSocials } = footerData.content.data;
      setCompanyInfo({
        address: apiCompanyInfo?.officeAddress || '',
        phone: apiCompanyInfo?.phoneNumber || '',
        copyright: apiCompanyInfo?.copyrightText || '',
      });
      setSocials({
        facebook: apiSocials?.facebookUrl || '',
        instagram: apiSocials?.instagramUrl || '',
        tiktok: apiSocials?.tiktokUrl || '',
      });
    }
  }, [footerData]);

  const handleSaveFooterChanges = async () => {
    try {
      await updateFooterMutation.mutateAsync({
        section: 'footer',
        data: {
          companyInfo: {
            officeAddress: companyInfo.address,
            phoneNumber: companyInfo.phone,
            copyrightText: companyInfo.copyright,
          },
          socialMediaLinks: {
            facebookUrl: socials.facebook,
            instagramUrl: socials.instagram,
            tiktokUrl: socials.tiktok,
          },
        },
        isActive: true,
      });
      setFeedback({ message: 'Footer changes saved successfully!', type: 'success' });
    } catch (err) {
      console.error('Failed to save footer changes:', err);
      setFeedback({ message: 'Failed to save footer changes.', type: 'error' });
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

  const handleSaveModal = async (label: string, url: string, content: string) => {
    const slug = url.replace(/^\//, '');
    const title = label;
    const excerpt = `${title} information for Team Up.`;
    const metaTitle = `${title} | Team Up`;
    const metaDescription = `Read the Team Up ${title.toLowerCase()} and related information.`;

    try {
      if (editingLink) {
        // Edit existing - get slug from the current link's URL path
        const currentSlug = editingLink.url.replace(/^\//, '');
        await updateMutation.mutateAsync({
          slug: currentSlug,
          data: { title, slug, content, excerpt, metaTitle, metaDescription },
        });
        setFeedback({ message: `Successfully updated page "${title}"!`, type: 'success' });
      } else {
        // Add new
        await createMutation.mutateAsync({
          title,
          slug,
          content,
          excerpt,
          metaTitle,
          metaDescription,
          isActive: true,
        });
        setFeedback({ message: `Successfully created page "${title}"!`, type: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save page:', err);
      throw err;
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete page:', err);
    }
  };

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
        <h1 className="text-2xl font-bold text-white mb-2">Manage Footer</h1>
        <p className="text-gray-400">Configure the content displayed in the website footer.</p>
      </div>

      {feedback && (
        <div className={`mb-6 p-4 rounded-lg border text-sm flex justify-between items-center ${
          feedback.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <span>{feedback.message}</span>
          <button 
            onClick={() => setFeedback(null)} 
            className="text-gray-400 hover:text-white ml-4 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Footer Links */}
          <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Top Navigation Links & Content</h2>
              <button
                onClick={handleOpenAddModal}
                className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add New Link
              </button>
            </div>
            <div className="space-y-3">
              {links.map((link) => (
                <div key={link.id} className="flex items-center gap-4 p-3 border border-[#3A3530] rounded-lg bg-[#222222]">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white mb-1">{link.label}</div>
                    <div className="text-xs text-gray-500 mb-1">{link.url}</div>
                    <div className="text-xs text-gray-400 line-clamp-1 italic bg-[#1A1A1A] p-1 rounded">
                      {(() => {
                        const plainText = link.content.replace(/<[^>]+>/g, '');
                        if (!plainText) return 'No content written...';
                        return plainText.length > 100 ? `${plainText.substring(0, 100)}...` : plainText;
                      })()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditModal(link)}
                      className="p-2 text-blue-400 hover:text-blue-300"
                    >
                      <EditIcon size={18} color="currentColor" />
                    </button>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <TrashIcon size={18} color="currentColor" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Company Info */}
          <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
            <h2 className="text-xl font-semibold text-white mb-6">Company Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Office Address</label>
                <textarea
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                  className="w-full h-20 p-3 rounded bg-[#2A2A2A] border border-[#3A3530] text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                <input
                  type="text"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                  className="w-full h-10 px-4 rounded bg-[#2A2A2A] border border-[#3A3530] text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Copyright Text</label>
                <input
                  type="text"
                  value={companyInfo.copyright}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, copyright: e.target.value })}
                  className="w-full h-10 px-4 rounded bg-[#2A2A2A] border border-[#3A3530] text-white"
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
            <h2 className="text-xl font-semibold text-white mb-6">Social Media Links</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Facebook URL</label>
                <input
                  type="text"
                  value={socials.facebook}
                  onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
                  className="w-full h-10 px-4 rounded bg-[#2A2A2A] border border-[#3A3530] text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Instagram URL</label>
                <input
                  type="text"
                  value={socials.instagram}
                  onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                  className="w-full h-10 px-4 rounded bg-[#2A2A2A] border border-[#3A3530] text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">TikTok URL</label>
                <input
                  type="text"
                  value={socials.tiktok}
                  onChange={(e) => setSocials({ ...socials, tiktok: e.target.value })}
                  className="w-full h-10 px-4 rounded bg-[#2A2A2A] border border-[#3A3530] text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSaveFooterChanges}
          disabled={updateFooterMutation.isPending}
          className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-8 py-3 rounded-lg font-medium transition-colors text-lg disabled:opacity-50"
        >
          {updateFooterMutation.isPending ? 'Saving...' : 'Save All Footer Changes'}
        </button>
      </div>

      {isModalOpen && (
        <FooterLinkModal
          initialLabel={editingLink?.label || ''}
          initialUrl={editingLink?.url || ''}
          initialContent={editingLink?.content || ''}
          isAdding={!editingLink}
          onSave={handleSaveModal}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ManageFooter;
