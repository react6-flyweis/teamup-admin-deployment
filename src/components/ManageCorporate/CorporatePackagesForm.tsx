import React, { useState, useEffect } from 'react';
import type { CorporatePackageItem } from './types';
import PackageEditModal from './PackageEditModal';
import { EditIcon, TrashIcon } from '@/assets/icons';

interface CorporatePackagesFormProps {
  initialData: {
    packagesTitle: string;
    packagesDescription: string;
    packages: CorporatePackageItem[];
    budgetText: string;
  };
  onSave: (data: {
    packagesTitle: string;
    packagesDescription: string;
    packages: CorporatePackageItem[];
    budgetText: string;
  }) => void;
  isSaving?: boolean;
}

const CorporatePackagesForm: React.FC<CorporatePackagesFormProps> = ({
  initialData,
  onSave,
  isSaving = false,
}) => {
  const [packagesTitle, setPackagesTitle] = useState(initialData.packagesTitle);
  const [packagesDescription, setPackagesDescription] = useState(initialData.packagesDescription);
  const [packages, setPackages] = useState<CorporatePackageItem[]>(initialData.packages || []);
  const [budgetText, setBudgetText] = useState(initialData.budgetText);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const initialPackagesStr = JSON.stringify(initialData.packages);

  useEffect(() => {
    setPackagesTitle(initialData.packagesTitle || '');
    setPackagesDescription(initialData.packagesDescription || '');
    setPackages(initialData.packages || []);
    setBudgetText(initialData.budgetText || '');
  }, [
    initialData.packagesTitle,
    initialData.packagesDescription,
    initialData.budgetText,
    initialPackagesStr,
    initialData.packages,
  ]);

  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (index: number) => {
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleDeletePackage = (index: number) => {
    if (window.confirm(`Delete package "${packages[index].title || 'Untitled'}"?`)) {
      setPackages(packages.filter((_, i) => i !== index));
    }
  };

  const handleSaveModal = (pkg: CorporatePackageItem) => {
    if (editingIndex !== null) {
      const updated = [...packages];
      updated[editingIndex] = pkg;
      setPackages(updated);
    } else {
      setPackages([...packages, pkg]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave({
      packagesTitle,
      packagesDescription,
      packages,
      budgetText,
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Corporate Party Packages</h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage packages, pricing, beverage & food perks, and bespoke party disclaimer.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section Title & Description */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Section Heading <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={packagesTitle}
              onChange={(e) => setPackagesTitle(e.target.value)}
              placeholder="e.g. CORPORATE PARTY PACKAGES"
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Section Introduction / Description
            </label>
            <textarea
              rows={3}
              value={packagesDescription}
              onChange={(e) => setPackagesDescription(e.target.value)}
              placeholder="Explain party options, bespoke planning, and group size accommodations..."
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
            />
          </div>
        </div>

        {/* Packages Cards List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Packages ({packages.length})</h3>
              <p className="text-xs text-gray-400">Available corporate booking tiers</p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="bg-[#E1017D] hover:bg-[#c2016c] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              + Add Package
            </button>
          </div>

          {packages.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-[#3A3530] rounded-xl bg-[#141414]">
              <p className="text-gray-400 text-sm mb-3">No corporate packages added yet.</p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="bg-[#2A2A2A] hover:bg-[#3A3530] text-white px-4 py-2 rounded-lg text-sm border border-[#3A3530] transition-colors"
              >
                Create Your First Package
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg, idx) => (
                <div
                  key={idx}
                  className="bg-[#141414] border border-[#3A3530] hover:border-[#4A4540] rounded-xl p-5 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        {pkg.iconUrl ? (
                          <img
                            src={pkg.iconUrl}
                            alt=""
                            className="w-10 h-10 object-contain rounded-lg bg-[#222] p-1 border border-[#3A3530]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#222] border border-[#3A3530] flex items-center justify-center text-xs font-bold text-[#E1017D]">
                            #{idx + 1}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-white text-base leading-tight">
                            {pkg.title || 'Untitled'}
                          </h4>
                          <span className="text-[#E1017D] font-extrabold text-sm">
                            {pkg.price || 'Contact for price'}
                          </span>
                        </div>
                      </div>

                      {/* Card Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(idx)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#2A2A2A] hover:bg-[#3A3530] text-[#E1017D] hover:text-white border border-[#3A3530] transition-colors"
                        title="Edit package"
                      >
                        <EditIcon size={14} color="currentColor" />
                        <span>Edit</span>
                      </button>
                    </div>

                    {/* Features list */}
                    {pkg.details && pkg.details.length > 0 && (
                      <div className="mt-3 space-y-1.5 border-t border-[#2A2A2A] pt-3">
                        {pkg.details.map((detail, dIdx) => (
                          <div key={dIdx} className="flex items-start gap-2 text-xs text-gray-300">
                            <span className="text-[#E1017D] font-bold">•</span>
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2A2A2A] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(idx)}
                      className="flex-1 py-2 px-3 bg-[#E1017D]/10 hover:bg-[#E1017D] text-[#E1017D] hover:text-white border border-[#E1017D]/30 hover:border-[#E1017D] rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                    >
                      <EditIcon size={14} color="currentColor" />
                      <span>Edit Package</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePackage(idx)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#2A2A2A] rounded-lg transition-colors border border-transparent hover:border-[#3A3530]"
                      title="Delete package"
                    >
                      <TrashIcon size={16} color="currentColor" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budget Disclaimer / Scalable options text */}
        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Budget Notice / Scalable Options Banner
          </label>
          <textarea
            rows={2}
            value={budgetText}
            onChange={(e) => setBudgetText(e.target.value)}
            placeholder="e.g. Budget a bit tight? Still get in touch, we have got flexible, scalable options available..."
            className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-[#3A3530] flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-[#E1017D] hover:bg-[#c2016c] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving && (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          )}
          Save Corporate Packages
        </button>
      </div>

      </form>

      <PackageEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingIndex !== null ? packages[editingIndex] : null}
      />
    </>
  );
};

export default CorporatePackagesForm;
