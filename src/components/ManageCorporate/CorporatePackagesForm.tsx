import React, { useState, useEffect } from 'react';
import type { CorporatePackageItem } from './types';
import PackageEditModal from './PackageEditModal';
import { EditIcon, TrashIcon } from '@/assets/icons';
import GameplayIcon from '@/assets/corporate/Game-play-40x40px.png';
import CocktailsIcon from '@/assets/corporate/Cocktails_40x40px.png';
import BevvysIcon from '@/assets/corporate/Bevvys_40x40px.png';
import BurgerIcon from '@/assets/corporate/Burger_40x40px.png';
import ShotsIcon from '@/assets/corporate/Shots_40x40px.png';
import MoneyIcon from '@/assets/corporate/Money_40x40px.png';

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
  errorMessage?: string | null;
}

const CorporatePackagesForm: React.FC<CorporatePackagesFormProps> = ({
  initialData,
  onSave,
  isSaving = false,
  errorMessage,
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

        {/* Packages Comparison Matrix / Cards */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Packages Comparison Matrix ({packages.length})</h3>
              <p className="text-xs text-gray-400">
                Manage packages columns and perks rows (Games, Welcome Bevvy, Bevvies, Scran, Something Fun, Price).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="bg-[#E1017D] hover:bg-[#c2016c] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                + Add Package Column
              </button>
            </div>
          </div>

          {packages.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-[#3A3530] rounded-xl bg-[#141414]">
              <p className="text-gray-400 text-sm mb-3">No corporate packages added yet.</p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="bg-[#2A2A2A] hover:bg-[#3A3530] text-white px-4 py-2 rounded-lg text-sm border border-[#3A3530] transition-colors cursor-pointer"
                >
                  Create Package
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Matrix Table View Matching Image */}
              <div className="overflow-x-auto rounded-xl border border-[#3A3530] bg-[#101010] shadow-xl">
                <table className="w-full text-left border-collapse min-w-190">
                  <thead>
                    <tr className="border-b border-[#3A3530] bg-[#181818]">
                      {/* Left Header - Row Label Column */}
                      <th className="w-45 p-4 text-xs font-black uppercase tracking-wider text-gray-400 border-r border-[#3A3530]">
                        Features & Perks
                      </th>
                      {/* Column for each package */}
                      {packages.map((pkg, idx) => (
                        <th
                          key={idx}
                          className="p-4 text-center border-r last:border-r-0 border-[#3A3530] min-w-50"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-extrabold text-sm uppercase text-white tracking-wider">
                              {pkg.title || `Package ${idx + 1}`}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(idx)}
                                className="px-2 py-0.5 text-xs rounded bg-[#2A2A2A] hover:bg-[#3A3530] text-[#E1017D] hover:text-white border border-[#3A3530] transition-colors flex items-center gap-1"
                                title="Edit Package"
                              >
                                <EditIcon size={12} color="currentColor" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePackage(idx)}
                                className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-[#2A2A2A] transition-colors"
                                title="Delete Package"
                              >
                                <TrashIcon size={13} color="currentColor" />
                              </button>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A2A]">
                    {/* Row 1: GAMES */}
                    <tr className="hover:bg-[#161616] transition-colors">
                      <td className="p-3.5 bg-[#E1017D] text-white font-black text-xs uppercase tracking-wider border-r border-[#3A3530]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={GameplayIcon}
                            alt="Games"
                            className="w-6 h-6 object-contain shrink-0"
                          />
                          <span>GAMES</span>
                        </div>
                      </td>
                      {packages.map((pkg, idx) => (
                        <td
                          key={idx}
                          className="p-3.5 text-center text-xs font-bold text-gray-200 uppercase border-r last:border-r-0 border-[#2A2A2A]"
                        >
                          {pkg.games || '—'}
                        </td>
                      ))}
                    </tr>

                    {/* Row 2: WELCOME BEVVY */}
                    <tr className="hover:bg-[#161616] transition-colors">
                      <td className="p-3.5 bg-[#E1017D] text-white font-black text-xs uppercase tracking-wider border-r border-[#3A3530]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={CocktailsIcon}
                            alt="Welcome Bevvy"
                            className="w-6 h-6 object-contain shrink-0"
                          />
                          <span>WELCOME BEVVY</span>
                        </div>
                      </td>
                      {packages.map((pkg, idx) => (
                        <td
                          key={idx}
                          className="p-3.5 text-center text-xs font-bold text-gray-200 uppercase border-r last:border-r-0 border-[#2A2A2A]"
                        >
                          {pkg.welcomeBevvy || '—'}
                        </td>
                      ))}
                    </tr>

                    {/* Row 3: BEVVIES */}
                    <tr className="hover:bg-[#161616] transition-colors">
                      <td className="p-3.5 bg-[#E1017D] text-white font-black text-xs uppercase tracking-wider border-r border-[#3A3530]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={BevvysIcon}
                            alt="Bevvies"
                            className="w-6 h-6 object-contain shrink-0"
                          />
                          <span>BEVVIES</span>
                        </div>
                      </td>
                      {packages.map((pkg, idx) => (
                        <td
                          key={idx}
                          className="p-3.5 text-center text-xs font-bold text-gray-200 uppercase border-r last:border-r-0 border-[#2A2A2A]"
                        >
                          {pkg.bevvies || '—'}
                        </td>
                      ))}
                    </tr>

                    {/* Row 4: SCRAN */}
                    <tr className="hover:bg-[#161616] transition-colors">
                      <td className="p-3.5 bg-[#E1017D] text-white font-black text-xs uppercase tracking-wider border-r border-[#3A3530]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={BurgerIcon}
                            alt="Scran"
                            className="w-6 h-6 object-contain shrink-0"
                          />
                          <span>SCRAN</span>
                        </div>
                      </td>
                      {packages.map((pkg, idx) => (
                        <td
                          key={idx}
                          className="p-3.5 text-center text-xs font-bold text-gray-200 uppercase border-r last:border-r-0 border-[#2A2A2A]"
                        >
                          {pkg.scran || '—'}
                        </td>
                      ))}
                    </tr>

                    {/* Row 5: SOMETHING FUN */}
                    <tr className="hover:bg-[#161616] transition-colors">
                      <td className="p-3.5 bg-[#E1017D] text-white font-black text-xs uppercase tracking-wider border-r border-[#3A3530]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={ShotsIcon}
                            alt="Something Fun"
                            className="w-6 h-6 object-contain shrink-0"
                          />
                          <span>SOMETHING FUN</span>
                        </div>
                      </td>
                      {packages.map((pkg, idx) => (
                        <td
                          key={idx}
                          className="p-3.5 text-center text-xs font-bold text-gray-200 uppercase border-r last:border-r-0 border-[#2A2A2A]"
                        >
                          {pkg.somethingFun || '—'}
                        </td>
                      ))}
                    </tr>

                    {/* Row 6: PRICE £ PP */}
                    <tr className="hover:bg-[#161616] transition-colors">
                      <td className="p-3.5 bg-[#E1017D] text-white font-black text-xs uppercase tracking-wider border-r border-[#3A3530]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={MoneyIcon}
                            alt="Price"
                            className="w-6 h-6 object-contain shrink-0"
                          />
                          <span>PRICE £ PP</span>
                        </div>
                      </td>
                      {packages.map((pkg, idx) => (
                        <td
                          key={idx}
                          className="p-3.5 text-center text-sm font-extrabold text-white uppercase border-r last:border-r-0 border-[#2A2A2A]"
                        >
                          {pkg.price || '—'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
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

      <div className="mt-8 pt-6 border-t border-[#3A3530] flex flex-col sm:flex-row items-end sm:items-center justify-end gap-4">
        {errorMessage && (
          <div className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="bg-[#E1017D] hover:bg-[#c2016c] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {isSaving && (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          )}
          {isSaving ? 'Saving...' : 'Save Corporate Packages'}
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
