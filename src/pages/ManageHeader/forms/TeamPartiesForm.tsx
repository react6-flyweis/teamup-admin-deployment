import React, { useState, useEffect, useRef } from 'react';
import { uploadFile } from '@/utils/fileUpload';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';
import type { HeaderSubItem, FeaturedEventCard, ChecklistItem } from './types';
import { CloseIcon, UploadIcon, TrashIcon } from '@/assets/icons';

interface TeamPartiesFormProps {
    onClose: () => void;
  onSave: (subItem: Partial<HeaderSubItem>) => void;
  initialData: HeaderSubItem | null;
  availableGames: HeaderSubItem[];
}

const TeamPartiesForm: React.FC<TeamPartiesFormProps> = ({
  onClose, onSave, initialData, availableGames
}) => {
  // Navigation
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [icon, setIcon] = useState('');
  const iconFileRef = useRef<HTMLInputElement>(null);

  // Hero
  const [pageHeadline, setPageHeadline] = useState('');
  const [pageHeroImage, setPageHeroImage] = useState('');
  const [heroBookNowLink, setHeroBookNowLink] = useState('');
  const heroImageRef = useRef<HTMLInputElement>(null);

  // What's Included (Checklist)
  const [sectionHeadline, setSectionHeadline] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  // Events & Activities (Featured)
  const [eventsDateHeading, setEventsDateHeading] = useState('');
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEventCard[]>([]);

  // Choose Your Games (ID references)
  const [chooseGamesHeading, setChooseGamesHeading] = useState('');
  const [chooseGameIds, setChooseGameIds] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPath(initialData.path || '');
      setIcon(initialData.icon || '');
      setPageHeadline(initialData.pageHeadline || '');
      setPageHeroImage(initialData.pageHeroImage || '');
      setHeroBookNowLink(initialData.heroBookNowLink || '');
      
      setSectionHeadline(initialData.sectionHeadline || '');
      setSectionDescription(initialData.sectionDescription || '');
      setChecklistItems(initialData.checklistItems || []);
      
      setEventsDateHeading(initialData.eventsDateHeading || '');
      setFeaturedEvents(initialData.featuredEvents || []);
      
      setChooseGamesHeading(initialData.chooseGamesHeading || '');
      setChooseGameIds(initialData.chooseGameIds || []);
    } else if (!initialData) {
      setName(''); setPath(''); setIcon(''); setPageHeadline(''); setPageHeroImage('');
      setHeroBookNowLink('');
      setSectionHeadline(''); setSectionDescription(''); setChecklistItems([]);
      setEventsDateHeading(''); setFeaturedEvents([]);
      setChooseGamesHeading(''); setChooseGameIds([]);
    }
  }, [initialData]);

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !path.trim()) return;
    onSave({
      name: name.trim(), path: path.trim(), icon,
      pageType: 'team-parties',
      pageHeadline, pageHeroImage, heroBookNowLink,
      sectionHeadline, sectionDescription, checklistItems,
      eventsDateHeading, featuredEvents,
      chooseGamesHeading, chooseGameIds,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setter(url);
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }
  };

  const toggleGameId = (id: string) => {
    setChooseGameIds(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, { id: Date.now().toString(), title: '', description: '', subheading: '', buttonText: '', buttonLink: '', image: '' }]);
  };

  const updateChecklistItem = (id: string, field: keyof ChecklistItem, value: string) => {
    setChecklistItems(checklistItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
  };

  const addFeaturedEvent = () => {
    setFeaturedEvents([...featuredEvents, { id: Date.now().toString(), title: '', subtitle: '', description: '', button1Text: '', button1Link: '', button2Text: '', button2Link: '', image: '' }]);
  };

  const updateFeaturedEvent = (id: string, field: keyof FeaturedEventCard, value: string) => {
    setFeaturedEvents(featuredEvents.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeFeaturedEvent = (id: string) => {
    setFeaturedEvents(featuredEvents.filter(e => e.id !== id));
  };

  const inputCls = 'w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors';
  const inputSmCls = 'w-full bg-[#1C1C1C] border border-[#3A3530] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] text-sm transition-colors';
  const labelCls = 'block text-sm font-medium text-gray-300 mb-2';
  const labelSmCls = 'block text-xs font-medium text-gray-400 mb-1';
  const sectionHead = 'text-sm font-semibold text-white uppercase tracking-wider border-b border-[#3A3530] pb-2 mb-4 flex items-center gap-2';

  return (
    <div>
      <div className="bg-[#1C1C1C] rounded-xl border border-[#3A3530] w-full max-w-4xl overflow-hidden flex flex-col mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A3530] flex-shrink-0 bg-[#1C1C1C]">
          <div>
            <h2 className="text-lg font-bold text-white">
              {initialData ? `Edit: ${initialData.name}` : 'Add Team Parties Sub-item'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Custom UI layout for Team Up Parties</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">

            {/* ── 1. Navigation Setup ── */}
            <section>
              <h3 className={sectionHead}>
                <span className="text-[#E1017D]">01</span> Navigation Setup
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelCls}>Display Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Team Up Parties" className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>URL Path</label>
                  <input type="text" value={path} onChange={e => setPath(e.target.value)} placeholder="e.g. /groups/team-up" className={inputCls} required />
                </div>
              </div>
              {/* Icon upload */}
              <div>
                <label className={labelCls}>
                  Nav Icon (shown in header bar) <span className="text-xs text-gray-400 font-normal ml-1.5">(1:1 Square • Rec: 160×160 px • SVG/PNG)</span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {icon ? (
                      <div className="w-16 h-16 rounded-xl bg-[#2A2A2A] border border-[#3A3530] overflow-hidden flex items-center justify-center group relative">
                        <img src={icon} alt="icon" className="w-full h-full object-contain p-1" onError={e => { e.currentTarget.style.display='none'; }} />
                        <button type="button" onClick={() => setIcon('')} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><CloseIcon /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => iconFileRef.current?.click()} className="w-16 h-16 rounded-xl bg-[#2A2A2A] border border-dashed border-[#3A3530] hover:border-[#E1017D] flex flex-col items-center justify-center text-gray-500 hover:text-[#E1017D] transition-colors">
                        <UploadIcon /><span className="text-[10px] mt-1">Icon</span>
                      </button>
                    )}
                    <input type="file" ref={iconFileRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, setIcon)} />
                  </div>
                  <input type="text" value={icon} onChange={e => setIcon(e.target.value)} placeholder="Or paste icon URL" className={`${inputCls} flex-1`} />
                </div>
              </div>
            </section>

            {/* ── 2. Hero Section ── */}
            <section>
              <h3 className={sectionHead}>
                <span className="text-[#E1017D]">02</span> Hero Section
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Hero Headline</label>
                    <input type="text" value={pageHeadline} onChange={e => setPageHeadline(e.target.value)} placeholder="e.g. TEAM UP PARTIES" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Book Now Link</label>
                    <input type="text" value={heroBookNowLink} onChange={e => setHeroBookNowLink(e.target.value)} placeholder="e.g. /book/team-up" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>
                    Hero Background Image <span className="text-xs text-gray-400 font-normal ml-1.5">(16:9 to 21:9 • Rec: 1905×805 or 1920×1080 px)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    {pageHeroImage ? (
                      <div className="relative group w-44 aspect-video rounded-lg overflow-hidden border border-[#3A3530]">
                        <img src={pageHeroImage} alt="hero" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPageHeroImage('')} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><CloseIcon /></button>
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[10px] text-gray-300 font-mono pointer-events-none">16:9</span>
                      </div>
                    ) : (
                      <button type="button" onClick={() => heroImageRef.current?.click()} className="w-44 aspect-video rounded-lg bg-[#2A2A2A] border border-dashed border-[#3A3530] hover:border-[#E1017D] flex flex-col items-center justify-center text-gray-500 hover:text-[#E1017D] transition-colors">
                        <UploadIcon /><span className="text-xs mt-1">Upload Hero</span>
                      </button>
                    )}
                    <div className="flex-1">
                      <input type="text" value={pageHeroImage} onChange={e => setPageHeroImage(e.target.value)} placeholder="Or paste image URL" className={`${inputCls} text-sm`} />
                      <input type="file" ref={heroImageRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, setPageHeroImage)} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 3. What's Included (Checklist) ── */}
            <section>
              <h3 className={sectionHead}>
                <span className="text-[#E1017D]">03</span> What's Included (Checklist)
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Section Headline</label>
                    <input type="text" value={sectionHeadline} onChange={e => setSectionHeadline(e.target.value)} placeholder="e.g. WHAT'S INCLUDED" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Section Description</label>
                    <input type="text" value={sectionDescription} onChange={e => setSectionDescription(e.target.value)} placeholder="e.g. Bring your team together..." className={inputCls} />
                  </div>
                </div>
                
                <div className="bg-[#252525] p-4 rounded-lg border border-[#3A3530]">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <span className="text-[#E1017D]">✅</span> Checklist Items
                    </label>
                    <button type="button" onClick={addChecklistItem} className="text-xs bg-[#E1017D]/20 text-[#E1017D] px-3 py-1 rounded-md hover:bg-[#E1017D] hover:text-white transition-colors">
                      + Add Item
                    </button>
                  </div>
                  <div className="space-y-4">
                    {checklistItems.map((item, index) => (
                      <div key={item.id} className="bg-[#1C1C1C] p-4 rounded-lg border border-[#3A3530] space-y-3 relative">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-300">Item {index + 1}</h4>
                          <button type="button" onClick={() => removeChecklistItem(item.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                            <TrashIcon />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelSmCls}>Title</label>
                            <input type="text" value={item.title} onChange={e => updateChecklistItem(item.id, 'title', e.target.value)} placeholder="e.g. DEDICATED EVENT HOST" className={inputSmCls} />
                          </div>
                          <div>
                            <label className={labelSmCls}>Subheading</label>
                            <input type="text" value={item.subheading || ''} onChange={e => updateChecklistItem(item.id, 'subheading', e.target.value)} placeholder="e.g. ALL DAY EVERYDAY" className={inputSmCls} />
                          </div>
                        </div>
                        <div>
                          <label className={labelSmCls}>Description</label>
                          <textarea value={item.description || item.subtext || ''} onChange={e => updateChecklistItem(item.id, 'description', e.target.value)} placeholder="Enter description..." rows={2} className={inputSmCls} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelSmCls}>Button Text</label>
                            <input type="text" value={item.buttonText || ''} onChange={e => updateChecklistItem(item.id, 'buttonText', e.target.value)} placeholder="e.g. BOOK NOW" className={inputSmCls} />
                          </div>
                          <div>
                            <label className={labelSmCls}>Button Link</label>
                            <input type="text" value={item.buttonLink || ''} onChange={e => updateChecklistItem(item.id, 'buttonLink', e.target.value)} placeholder="e.g. /book" className={inputSmCls} />
                          </div>
                        </div>
                        <ImageInputWithUpload
                          label="Package Badge / Image URL"
                          hint="1:1 or 4:3 • Rec: 300×300 px • SVG/PNG"
                          value={item.image || ''}
                          onChange={(url) => updateChecklistItem(item.id, 'image', url)}
                          placeholder="Paste image URL here"
                          inputClassName={inputSmCls}
                          labelClassName={labelSmCls}
                          previewWidth="w-20"
                          previewHeight="h-14"
                        />
                      </div>
                    ))}
                    {checklistItems.length === 0 && (
                      <div className="text-center py-4 text-sm text-gray-500">No checklist items added.</div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ── 4. Featured Event Section ── */}
            <section>
              <div className="flex items-center justify-between border-b border-[#3A3530] pb-2 mb-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-[#E1017D]">04</span> Events & Activities (Featured Cards)
                </h3>
                <button type="button" onClick={addFeaturedEvent} className="text-xs bg-[#E1017D]/20 text-[#E1017D] px-3 py-1 rounded-md hover:bg-[#E1017D] hover:text-white transition-colors">
                  + Add Card
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className={labelCls}>Events Date Heading</label>
                  <input type="text" value={eventsDateHeading} onChange={e => setEventsDateHeading(e.target.value)} placeholder="e.g. EVENTS & ACTIVITIES MAY 24-26TH" className={inputCls} />
                </div>
                
                {featuredEvents.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-[#3A3530] rounded-lg text-gray-500 text-sm">
                    No featured cards added yet. Click "+ Add Card" to add one.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {featuredEvents.map((event, index) => (
                      <div key={event.id} className="bg-[#252525] p-4 rounded-lg border border-[#3A3530] space-y-4 relative">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-300">Card {index + 1}</h4>
                          <button type="button" onClick={() => removeFeaturedEvent(event.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                            <TrashIcon />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelSmCls}>Title</label>
                            <input type="text" value={event.title} onChange={e => updateFeaturedEvent(event.id, 'title', e.target.value)} placeholder="e.g. YOU GOT GAME? PROVE IT." className={inputSmCls} />
                          </div>
                          <div>
                            <label className={labelSmCls}>Subtitle (Pink)</label>
                            <input type="text" value={event.subtitle} onChange={e => updateFeaturedEvent(event.id, 'subtitle', e.target.value)} placeholder="e.g. ALL DAY, EVERYDAY." className={inputSmCls} />
                          </div>
                        </div>
                        <div>
                          <label className={labelSmCls}>Description</label>
                          <textarea value={event.description} onChange={e => updateFeaturedEvent(event.id, 'description', e.target.value)} placeholder="From Axe Throwing to Shuffleboard..." rows={3} className={inputSmCls} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelSmCls}>Button 1 Text (Pink)</label>
                            <input type="text" value={event.button1Text} onChange={e => updateFeaturedEvent(event.id, 'button1Text', e.target.value)} placeholder="e.g. BOOK NOW" className={inputSmCls} />
                          </div>
                          <div>
                            <label className={labelSmCls}>Button 1 Link</label>
                            <input type="text" value={event.button1Link} onChange={e => updateFeaturedEvent(event.id, 'button1Link', e.target.value)} placeholder="e.g. /book-bh" className={inputSmCls} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelSmCls}>Button 2 Text (Blue - Optional)</label>
                            <input type="text" value={event.button2Text || ''} onChange={e => updateFeaturedEvent(event.id, 'button2Text', e.target.value)} placeholder="e.g. LEARN MORE" className={inputSmCls} />
                          </div>
                          <div>
                            <label className={labelSmCls}>Button 2 Link (Optional)</label>
                            <input type="text" value={event.button2Link || ''} onChange={e => updateFeaturedEvent(event.id, 'button2Link', e.target.value)} placeholder="e.g. /games/snooker" className={inputSmCls} />
                          </div>
                        </div>
                        <ImageInputWithUpload
                          label="Featured Image URL"
                          hint="1:1 Square • Rec: 1000×1000 px"
                          value={event.image}
                          onChange={(url) => updateFeaturedEvent(event.id, 'image', url)}
                          placeholder="Paste image URL here"
                          inputClassName={inputSmCls}
                          labelClassName={labelSmCls}
                          previewWidth="w-32"
                          previewHeight="h-20"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ── 5. Choose Your Games (ID-based selector) ── */}
            <section>
              <h3 className={`${sectionHead} border-b border-[#3A3530] pb-2 mb-4`}>
                <span className="text-[#E1017D]">05</span> Games Included
              </h3>
              <div className="mb-4">
                <label className={labelSmCls}>Section Heading</label>
                <input type="text" value={chooseGamesHeading} onChange={e => setChooseGamesHeading(e.target.value)} placeholder="e.g. OUR GAMES" className={inputSmCls} />
              </div>
              {availableGames.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-[#3A3530] rounded-lg text-gray-500 text-sm">
                  <p>No games found in "Choose Game" category.</p>
                  <p className="text-xs mt-1">Add games to the "Choose Game" category first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {availableGames.map((game) => {
                    const isSelected = chooseGameIds.includes(game.id);
                    return (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => toggleGameId(game.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                          isSelected
                            ? 'bg-[#E1017D]/10 border-[#E1017D] text-white'
                            : 'bg-[#252525] border-[#3A3530] text-gray-400 hover:border-gray-400'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#E1017D] border-[#E1017D]' : 'border-[#3A3530]'
                        }`}>
                          {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-[#1C1C1C] rounded flex items-center justify-center flex-shrink-0">
                            {game.icon && (game.icon.startsWith('http') || game.icon.startsWith('/') || game.icon.startsWith('data:')) ? (
                              <img src={game.icon} alt={game.name} className="w-6 h-6 object-contain" />
                            ) : (
                              <span className="text-xs text-gray-400">{game.name.substring(0, 2)}</span>
                            )}
                          </div>
                          <span className="text-sm font-medium truncate">{game.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {chooseGameIds.length > 0 && (
                <p className="text-xs text-[#E1017D] mt-3">{chooseGameIds.length} game(s) selected</p>
              )}
            </section>

          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#3A3530] bg-[#1C1C1C] flex-shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-[#2A2A2A] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || !path.trim()} className="bg-[#E1017D] text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Save Sub-item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamPartiesForm;
