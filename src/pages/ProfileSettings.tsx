import React, { useState, useEffect, useRef } from 'react';
import { useProfileQuery, useUpdateProfileMutation } from '@/hooks/useProfile';
import { uploadFile } from '@/utils/fileUpload';
import { useAuthStore } from '@/store/authStore';
import { ROLES } from '@/types';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  UploadIcon,
  TrashIcon,
  SecurityIcon,
} from '@/assets/icons';

const ProfileSettings: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const authUser = useAuthStore((state) => state.user);

  const { data, isLoading, isError, refetch } = useProfileQuery();
  const updateMutation = useUpdateProfileMutation();

  const user = data?.user || authUser;

  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    profilePicture: string;
  }>({
    name: '',
    phone: '',
    profilePicture: '',
  });

  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        type: 'error',
        message: 'Image file size must be less than 5MB.',
      });
      return;
    }

    setIsUploading(true);
    setFeedback(null);
    try {
      const uploadedUrl = await uploadFile(file);
      setFormData((prev) => ({ ...prev, profilePicture: uploadedUrl }));
      setFeedback({
        type: 'success',
        message: 'Profile picture uploaded! Click "Save Changes" to save your profile.',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to upload profile picture.';
      setFeedback({ type: 'error', message });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePicture: '' }));
    setFeedback({
      type: 'success',
      message: 'Photo removed. Click "Save Changes" to apply.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    try {
      await updateMutation.mutateAsync({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        profilePicture: formData.profilePicture || undefined,
      });

      setFeedback({
        type: 'success',
        message: 'Profile updated successfully!',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update profile.';
      setFeedback({ type: 'error', message });
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Super Admin
          </span>
        );
      case ROLES.ADMIN:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E1017D]/20 text-[#E1017D] border border-[#E1017D]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E1017D]" />
            Admin
          </span>
        );
      case ROLES.MANAGER:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Manager
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-neutral-700">
            {role ? role.replace(/_/g, ' ') : 'Member'}
          </span>
        );
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-t-[#E1017D] border-r-transparent border-b-[#E1017D] border-l-transparent rounded-full animate-spin" />
        <span className="text-neutral-400 text-sm font-medium">Loading profile...</span>
      </div>
    );
  }

  if (isError && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
          <SecurityIcon size={28} />
        </div>
        <p className="text-white font-bold mb-1">Failed to Load Profile</p>
        <p className="text-neutral-400 text-xs mb-4">Unable to fetch profile information from the server.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-[#E1017D] hover:bg-[#B71778] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="text-white space-y-6 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="border-b border-[#3A3530] pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-[#E1017D]/10 text-[#E1017D]">
            <UserIcon size={26} />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-raleway tracking-wide">
            Profile Settings
          </h1>
        </div>
        <p className="text-neutral-400 text-sm max-w-2xl">
          Manage your personal details, profile picture, and view assigned organization privileges.
        </p>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-white text-xs px-2 py-1 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Identity */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#1E1A18] border border-[#3A3530] rounded-2xl p-6 flex flex-col items-center text-center shadow-xl">
            {/* Avatar Preview */}
            <div className="relative group">
              {formData.profilePicture ? (
                <img
                  src={formData.profilePicture}
                  alt={formData.name || 'User Profile'}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#3A3530] shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-[#E1017D] to-purple-600 rounded-full flex items-center justify-center border-4 border-[#3A3530] shadow-lg">
                  <span className="text-white text-3xl font-bold font-raleway tracking-wider">
                    {getInitials(formData.name || user?.name)}
                  </span>
                </div>
              )}

              {/* Upload overlay spinner if uploading */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* User Title & Role */}
            <h2 className="text-lg font-bold text-white mt-4">{formData.name || user?.name || 'Administrator'}</h2>
            <div className="mt-1.5">{getRoleBadge(user?.role)}</div>

            <p className="text-xs text-neutral-400 mt-2">{user?.email}</p>

            {/* Upload Buttons */}
            <div className="w-full space-y-2 mt-6 pt-6 border-t border-[#2D2622]">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2A2420] hover:bg-[#38302B] text-neutral-200 hover:text-white text-xs font-semibold transition-all border border-[#4A3F38] cursor-pointer disabled:opacity-60"
              >
                <UploadIcon size={16} />
                <span>{formData.profilePicture ? 'Change Picture' : 'Upload Picture'}</span>
              </button>

              {formData.profilePicture && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-neutral-400 hover:text-red-400 text-xs font-medium transition-colors cursor-pointer"
                >
                  <TrashIcon size={14} />
                  <span>Remove Picture</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="md:col-span-2">
          <div className="bg-[#1E1A18] border border-[#3A3530] rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-1">Account Information</h3>
            <p className="text-xs text-neutral-400 mb-6">
              Update your display name and contact phone number.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <UserIcon size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter your full name"
                    className="w-full bg-[#14100E] border border-[#3A3530] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E1017D] transition-colors"
                  />
                </div>
              </div>

              {/* Email (Read-Only) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Email Address
                  </label>
                  <span className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-md font-medium">
                    Verified
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <MailIcon size={16} />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-[#14100E]/50 border border-[#2D2622] rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-500 cursor-not-allowed"
                  />
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Email is linked to your authentication credentials and cannot be changed here.
                </span>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <PhoneIcon size={16} />
                  </div>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="e.g. +1 555 010 0001"
                    className="w-full bg-[#14100E] border border-[#3A3530] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E1017D] transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#3A3530]">
                <button
                  type="button"
                  onClick={() => {
                    if (user) {
                      setFormData({
                        name: user.name || '',
                        phone: user.phone || '',
                        profilePicture: user.profilePicture || '',
                      });
                      setFeedback(null);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending || isUploading}
                  className="px-6 py-2.5 rounded-xl bg-[#E1017D] hover:bg-[#B71778] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:shadow-[#E1017D]/20 cursor-pointer disabled:opacity-60"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
