import React, { useState, useEffect } from 'react';
import type { BitesAndDrinks, NightsOut } from './types';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';

interface BitesAndEventsFormProps {
  initialBites: BitesAndDrinks;
  initialNightsOut: NightsOut;
  onSave?: (bites: BitesAndDrinks, nightsOut: NightsOut) => void;
  isSaving?: boolean;
}

const BitesAndEventsForm: React.FC<BitesAndEventsFormProps> = ({ initialBites, initialNightsOut, onSave, isSaving }) => {
  const [bites, setBites] = useState<BitesAndDrinks>(initialBites);
  const [nightsOut, setNightsOut] = useState<NightsOut>(initialNightsOut);

  useEffect(() => {
    setBites(initialBites);
  }, [initialBites]);

  useEffect(() => {
    setNightsOut(initialNightsOut);
  }, [initialNightsOut]);

  return (
    <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
      
      {/* Bites & Drinks */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-6">Bites & Drinks</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bites */}
          <div className="p-4 border border-[#3A3530] rounded-lg bg-[#222222]">
            <h3 className="font-medium text-white mb-4">Bites Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input type="text" value={bites.bitesTitle} onChange={e => setBites({...bites, bitesTitle: e.target.value})} className="w-full h-10 px-3 rounded bg-[#1A1A1A] border border-[#3A3530] text-white" />
              </div>
              <ImageInputWithUpload
                label="Bites Image"
                value={bites.bitesImageUrl}
                onChange={(url) => setBites({ ...bites, bitesImageUrl: url })}
                placeholder="Paste image URL or upload"
                inputClassName="w-full h-10 px-3 rounded bg-[#1A1A1A] border border-[#3A3530] text-white text-sm"
              />
              <div>
                <label className="block text-sm text-gray-400 mb-1">Menu Link</label>
                <input type="text" value={bites.bitesMenuLink} onChange={e => setBites({...bites, bitesMenuLink: e.target.value})} className="w-full h-10 px-3 rounded bg-[#1A1A1A] border border-[#3A3530] text-white" />
              </div>
            </div>
          </div>

          {/* Drinks */}
          <div className="p-4 border border-[#3A3530] rounded-lg bg-[#222222]">
            <h3 className="font-medium text-white mb-4">Drinks Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input type="text" value={bites.drinksTitle} onChange={e => setBites({...bites, drinksTitle: e.target.value})} className="w-full h-10 px-3 rounded bg-[#1A1A1A] border border-[#3A3530] text-white" />
              </div>
              <ImageInputWithUpload
                label="Drinks Image"
                value={bites.drinksImageUrl}
                onChange={(url) => setBites({ ...bites, drinksImageUrl: url })}
                placeholder="Paste image URL or upload"
                inputClassName="w-full h-10 px-3 rounded bg-[#1A1A1A] border border-[#3A3530] text-white text-sm"
              />
              <div>
                <label className="block text-sm text-gray-400 mb-1">Menu Link</label>
                <input type="text" value={bites.drinksMenuLink} onChange={e => setBites({...bites, drinksMenuLink: e.target.value})} className="w-full h-10 px-3 rounded bg-[#1A1A1A] border border-[#3A3530] text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nights Out */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Nights Out Section</h2>
        <div className="space-y-4 max-w-2xl">
          <ImageInputWithUpload
            label="Background Media (Image or Video)"
            value={nightsOut.backgroundMediaUrl}
            onChange={(url) => setNightsOut({ ...nightsOut, backgroundMediaUrl: url })}
            placeholder="Paste media URL or upload"
            accept="image/*,video/*"
            inputClassName="w-full h-10 px-3 rounded bg-[#1A1A1A] border border-[#3A3530] text-white text-sm"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input type="text" value={nightsOut.title} onChange={e => setNightsOut({...nightsOut, title: e.target.value})} className="w-full h-10 px-3 rounded bg-[#1A1A1A] border border-[#3A3530] text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Subtitle</label>
              <input type="text" value={nightsOut.subtitle} onChange={e => setNightsOut({...nightsOut, subtitle: e.target.value})} className="w-full h-10 px-3 rounded bg-[#1A1A1A] border border-[#3A3530] text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea value={nightsOut.description} onChange={e => setNightsOut({...nightsOut, description: e.target.value})} className="w-full h-24 p-3 rounded bg-[#1A1A1A] border border-[#3A3530] text-white resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Button Text</label>
              <input type="text" value={nightsOut.buttonText} onChange={e => setNightsOut({...nightsOut, buttonText: e.target.value})} className="w-full h-10 px-3 rounded bg-[#1A1A1A] border border-[#3A3530] text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Button Link</label>
              <input type="text" value={nightsOut.buttonLink} onChange={e => setNightsOut({...nightsOut, buttonLink: e.target.value})} className="w-full h-10 px-3 rounded bg-[#1A1A1A] border border-[#3A3530] text-white" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button 
          onClick={() => onSave && onSave(bites, nightsOut)}
          disabled={isSaving}
          className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default BitesAndEventsForm;
