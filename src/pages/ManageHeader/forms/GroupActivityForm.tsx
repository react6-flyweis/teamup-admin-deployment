import React, { useState, useEffect, useRef } from 'react';
import { uploadFile } from '@/utils/fileUpload';
import type { HeaderSubItem, ChecklistItem } from './types';
import { CloseIcon, UploadIcon, TrashIcon } from '@/assets/icons';

interface GroupActivityFormProps {
    onClose: () => void;
  onSave: (subItem: Partial<HeaderSubItem>) => void;
  initialData: HeaderSubItem | null;
  availableGames: HeaderSubItem[];
}

const GroupActivityForm: React.FC<GroupActivityFormProps> = ({
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

  // What's Included
  const [sectionHeadline, setSectionHeadline] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  // How to Book
  const [howToBookHeadline, setHowToBookHeadline] = useState('');
  const [howToBookBody, setHowToBookBody] = useState('');
  const [howToBookLink, setHowToBookLink] = useState('');
  const [howToBookEmail, setHowToBookEmail] = useState('');
  const [howToBookPhone, setHowToBookPhone] = useState('');

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
      setHowToBookHeadline(initialData.howToBookHeadline || '');
      setHowToBookBody(initialData.howToBookBody || '');
      setHowToBookLink(initialData.howToBookLink || '');
      setHowToBookEmail(initialData.howToBookEmail || '');
      setHowToBookPhone(initialData.howToBookPhone || '');
      setChooseGamesHeading(initialData.chooseGamesHeading || '');
      setChooseGameIds(initialData.chooseGameIds || []);
    } else if (!initialData) {
      setName(''); setPath(''); setIcon(''); setPageHeadline(''); setPageHeroImage('');
      setHeroBookNowLink(''); setSectionHeadline(''); setSectionDescription('');
      setChecklistItems([]); setHowToBookHeadline(''); setHowToBookBody('');
      setHowToBookLink(''); setHowToBookEmail(''); setHowToBookPhone('');
      setChooseGamesHeading(''); setChooseGameIds([]);
    }
  }, [initialData]);

  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !path.trim()) return;
    onSave({
      name: name.trim(), path: path.trim(), icon,
      pageType: 'group-activity',
      pageHeadline, pageHeroImage, heroBookNowLink,
      sectionHeadline, sectionDescription, checklistItems,
      howToBookHeadline, howToBookBody, howToBookLink, howToBookEmail, howToBookPhone,
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

  // Checklist helpers
  const addChecklist = () => setChecklistItems([...checklistItems, { id: Date.now().toString(), title: '', subtext: '' }]);
  const removeChecklist = (id: string) => setChecklistItems(checklistItems.filter(c => c.id !== id));
  const updateChecklist = (idx: number, field: keyof ChecklistItem, val: string) => {
    const next = [...checklistItems]; next[idx] = { ...next[idx], [field]: val }; setChecklistItems(next);
  };

  const toggleGameId = (id: string) => {
    setChooseGameIds(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
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
              {initialData ? `Edit: ${initialData.name}` : 'Add Group Activity Sub-item'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Group Activity Page Content</p>
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
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Birthday Parties" className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>URL Path</label>
                  <input type="text" value={path} onChange={e => setPath(e.target.value)} placeholder="e.g. /groups/birthday" className={inputCls} required />
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
                    <input type="text" value={pageHeadline} onChange={e => setPageHeadline(e.target.value)} placeholder="e.g. BOOM BIRTHDAYS" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Book Now Link</label>
                    <input type="text" value={heroBookNowLink} onChange={e => setHeroBookNowLink(e.target.value)} placeholder="e.g. /book/birthday" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>
                    Hero Background Image <span className="text-xs text-gray-400 font-normal ml-1.5">(16:9 to 21:9 • Rec: 1905×805 or 1920×1080 px)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    {pageHeroImage ? (
                      <div className="relative group w-40 h-20 rounded-lg overflow-hidden border border-[#3A3530]">
                        <img src={pageHeroImage} alt="hero" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPageHeroImage('')} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><CloseIcon /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => heroImageRef.current?.click()} className="w-40 h-20 rounded-lg bg-[#2A2A2A] border border-dashed border-[#3A3530] hover:border-[#E1017D] flex flex-col items-center justify-center text-gray-500 hover:text-[#E1017D] transition-colors">
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

            {/* ── 3. What's Included ── */}
            <section>
              <h3 className={sectionHead}>
                <span className="text-[#E1017D]">03</span> What's Included Section
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Section Headline</label>
                  <input type="text" value={sectionHeadline} onChange={e => setSectionHeadline(e.target.value)} placeholder="e.g. BATTLE IT OUT FOR A BIRTHDAY YOU WON'T FORGET" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={sectionDescription} onChange={e => setSectionDescription(e.target.value)} placeholder="e.g. Chat to our expert party planners today..." rows={3} className={inputCls} />
                </div>

                {/* Checklist Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">✅ Checklist Items</label>
                    <button type="button" onClick={addChecklist} className="text-xs bg-[#2A2A2A] hover:bg-[#3A3530] text-white border border-[#3A3530] px-3 py-1.5 rounded-lg transition-colors">
                      + Add Item
                    </button>
                  </div>
                  {checklistItems.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-[#3A3530] rounded-lg text-gray-500 text-sm">
                      No checklist items yet. Click "+ Add Item" to add.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {checklistItems.map((item, idx) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 bg-[#252525] rounded-lg border border-[#3A3530]">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelSmCls}>Title (Bold)</label>
                              <input type="text" value={item.title} onChange={e => updateChecklist(idx, 'title', e.target.value)} placeholder="e.g. 2 X GAMES" className={inputSmCls} />
                            </div>
                            <div>
                              <label className={labelSmCls}>Subtext (optional)</label>
                              <input type="text" value={item.subtext || ''} onChange={e => updateChecklist(idx, 'subtext', e.target.value)} placeholder="e.g. Choose from our epic selection..." className={inputSmCls} />
                            </div>
                          </div>
                          <button type="button" onClick={() => removeChecklist(item.id)} className="mt-5 text-red-400 hover:text-red-300 flex-shrink-0">
                            <TrashIcon size={16} color="currentColor" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ── 4. How to Book ── */}
            <section>
              <h3 className={sectionHead}>
                <span className="text-[#E1017D]">04</span> How to Book Section
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Section Headline</label>
                  <input type="text" value={howToBookHeadline} onChange={e => setHowToBookHeadline(e.target.value)} placeholder="e.g. HERE'S HOW TO BOOK" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Body Text</label>
                  <textarea value={howToBookBody} onChange={e => setHowToBookBody(e.target.value)} placeholder="e.g. To book this package, either click here, email us on..." rows={3} className={inputCls} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelSmCls}>Book Link</label>
                    <input type="text" value={howToBookLink} onChange={e => setHowToBookLink(e.target.value)} placeholder="/book/birthday" className={inputSmCls} />
                  </div>
                  <div>
                    <label className={labelSmCls}>Email</label>
                    <input type="text" value={howToBookEmail} onChange={e => setHowToBookEmail(e.target.value)} placeholder="sales@boombattlebar.com" className={inputSmCls} />
                  </div>
                  <div>
                    <label className={labelSmCls}>Phone</label>
                    <input type="text" value={howToBookPhone} onChange={e => setHowToBookPhone(e.target.value)} placeholder="0207 286 0404" className={inputSmCls} />
                  </div>
                </div>
              </div>
            </section>

            {/* ── 5. Choose Your Games (ID-based selector) ── */}
            <section>
              <h3 className={`${sectionHead} border-b border-[#3A3530] pb-2 mb-4`}>
                <span className="text-[#E1017D]">05</span> Choose Your Games
              </h3>
              <div className="mb-4">
                <label className={labelSmCls}>Section Heading</label>
                <input type="text" value={chooseGamesHeading} onChange={e => setChooseGamesHeading(e.target.value)} placeholder="e.g. CHOOSE YOUR GAMES" className={inputSmCls} />
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

export default GroupActivityForm;
