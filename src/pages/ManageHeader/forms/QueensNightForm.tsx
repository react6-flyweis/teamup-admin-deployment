import React, { useState, useEffect, useRef } from 'react';
import { uploadFile } from '@/utils/fileUpload';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';
import type { HeaderSubItem, FeaturedEventCard, ChecklistItem, StatBlock } from './types';
import { CloseIcon, UploadIcon, TrashIcon } from '@/assets/icons';

interface QueensNightFormProps {
    onClose: () => void;
  initialData?: HeaderSubItem | null;
  onSave: (data: HeaderSubItem) => void;
}

const QueensNightForm: React.FC<QueensNightFormProps> = ({ onClose, initialData, onSave }) => {
  // Navigation & Identifiers
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [icon, setIcon] = useState('');

  // Hero Fields
  const [pageHeadline, setPageHeadline] = useState('');
  const [pageHeroImage, setPageHeroImage] = useState('');
  const [heroBookNowLink, setHeroBookNowLink] = useState('');
  const heroImageRef = useRef<HTMLInputElement>(null);

  // What's Included (Checklist)
  const [sectionHeadline, setSectionHeadline] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

  // How To Book (Stats)
  const [howToBookHeadline, setHowToBookHeadline] = useState('');
  const [howToBookBody, setHowToBookBody] = useState('');
  const [statsBlocks, setStatsBlocks] = useState<StatBlock[]>([]);

  // Other Games Cards
  const [otherGamesHeading, setOtherGamesHeading] = useState('');
  const [otherGamesCards, setOtherGamesCards] = useState<FeaturedEventCard[]>([]);

  const iconFileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
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
      setStatsBlocks(initialData.statsBlocks || []);
      
      setOtherGamesHeading(initialData.otherGamesHeading || '');
      setOtherGamesCards(initialData.otherGamesCards || []);
    } else if (!initialData) {
      setName(''); setPath(''); setIcon('');
      setPageHeadline(''); setPageHeroImage(''); setHeroBookNowLink('');
      setSectionHeadline(''); setSectionDescription(''); setChecklistItems([]);
      setHowToBookHeadline(''); setHowToBookBody(''); setStatsBlocks([]);
      setOtherGamesHeading(''); setOtherGamesCards([]);
    }
  }, [initialData]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(initialData || { id: Date.now().toString(), isHidden: false }),
      name: name.trim(), path: path.trim(), icon,
      pageType: 'queens-night',
      pageHeadline, pageHeroImage, heroBookNowLink,
      sectionHeadline, sectionDescription, checklistItems,
      howToBookHeadline, howToBookBody, statsBlocks,
      otherGamesHeading, otherGamesCards
    });
  };

  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, { id: Date.now().toString(), title: '', subtext: '' }]);
  };

  const updateChecklistItem = (id: string, field: 'title' | 'subtext', value: string) => {
    setChecklistItems(checklistItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
  };

  const addStatBlock = () => {
    setStatsBlocks([...statsBlocks, { id: Date.now().toString(), iconType: 'age', topText: '', mainText: '', subText: '' }]);
  };

  const updateStatBlock = (id: string, field: keyof StatBlock, value: string) => {
    setStatsBlocks(statsBlocks.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeStatBlock = (id: string) => {
    setStatsBlocks(statsBlocks.filter(s => s.id !== id));
  };

  const addOtherGameCard = () => {
    setOtherGamesCards([...otherGamesCards, { id: Date.now().toString(), title: '', description: '', button1Text: '', button1Link: '', button2Text: '', button2Link: '', image: '' }]);
  };

  const updateOtherGameCard = (id: string, field: keyof FeaturedEventCard, value: string) => {
    setOtherGamesCards(otherGamesCards.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeOtherGameCard = (id: string) => {
    setOtherGamesCards(otherGamesCards.filter(c => c.id !== id));
  };

  const inputCls = 'w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors';
  const inputSmCls = 'w-full bg-[#1C1C1C] border border-[#3A3530] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] text-sm transition-colors';
  const labelCls = 'block text-sm font-medium text-gray-300 mb-2';
  const labelSmCls = 'block text-xs font-medium text-gray-400 mb-1';
  const sectionHead = 'text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2';

  

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1C1C1C] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-[#3A3530] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A3530] bg-[#252525] rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Queens Night Configuration</h2>
            <p className="text-sm text-gray-400 mt-1">Configure Queens Night UI fields</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-[#3A3530] rounded-lg transition-all">
            <CloseIcon size={24} color="currentColor" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#3A3530] scrollbar-track-transparent">
          <form id="queens-night-form" onSubmit={handleSave} className="space-y-10">
            
            {/* ── 1. Navigation Setup ── */}
            <section>
              <h3 className={sectionHead}>
                <span className="text-[#E1017D]">01</span> Navigation Setup
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelCls}>Item Name (in menu)</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Queens Night" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Page URL Path</label>
                  <input type="text" value={path} onChange={e => setPath(e.target.value)} placeholder="e.g. /groups/queens-night" required className={inputCls} />
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
              <div className="space-y-4 bg-[#252525] p-4 rounded-lg border border-[#3A3530]">
                <div>
                  <label className={labelCls}>Main Headline</label>
                  <input type="text" value={pageHeadline} onChange={e => setPageHeadline(e.target.value)} placeholder="e.g. QUEENS NIGHT" required className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>
                      Hero Image URL <span className="text-xs text-gray-400 font-normal ml-1.5">(16:9 to 21:9 • Rec: 1905×805 or 1920×1080 px)</span>
                    </label>
                    <div className="flex gap-2">
                      <input type="text" value={pageHeroImage} onChange={e => setPageHeroImage(e.target.value)} placeholder="Paste image URL here" className={inputCls} />
                      <button type="button" onClick={() => heroImageRef.current?.click()} className="px-4 bg-[#3A3530] text-white rounded-lg hover:bg-[#4A4540] transition-colors">
                        <UploadIcon />
                      </button>
                      <input type="file" ref={heroImageRef} className="hidden" accept="image/*" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setPageHeroImage(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Hero 'Book Now' Link</label>
                    <input type="text" value={heroBookNowLink} onChange={e => setHeroBookNowLink(e.target.value)} placeholder="e.g. /book/queens-night" className={inputCls} />
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
                    <input type="text" value={sectionHeadline} onChange={e => setSectionHeadline(e.target.value)} placeholder="e.g. CELEBRATE HER LAST FLING..." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Section Description</label>
                    <input type="text" value={sectionDescription} onChange={e => setSectionDescription(e.target.value)} placeholder="e.g. Chat to our expert party planners..." className={inputCls} />
                  </div>
                </div>
                
                <div className="bg-[#252525] p-4 rounded-lg border border-[#3A3530]">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <span className="text-[#00B4D8]">✓</span> Checklist Items (e.g. 2 X GAMES)
                    </label>
                    <button type="button" onClick={addChecklistItem} className="text-xs bg-[#E1017D]/20 text-[#E1017D] px-3 py-1 rounded-md hover:bg-[#E1017D] hover:text-white transition-colors">
                      + Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {checklistItems.map((item) => (
                      <div key={item.id} className="flex gap-3 items-start bg-[#1C1C1C] p-3 rounded-lg border border-[#3A3530]">
                        <div className="flex-1 space-y-2">
                          <input type="text" value={item.title} onChange={e => updateChecklistItem(item.id, 'title', e.target.value)} placeholder={`Title (e.g. 2 X GAMES)`} className={inputSmCls} />
                          <input type="text" value={item.subtext || ''} onChange={e => updateChecklistItem(item.id, 'subtext', e.target.value)} placeholder="Subtext (e.g. Choose from our epic selection...)" className={inputSmCls} />
                        </div>
                        <button type="button" onClick={() => removeChecklistItem(item.id)} className="text-gray-500 hover:text-red-500 p-2 transition-colors">
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                    {checklistItems.length === 0 && (
                      <div className="text-center py-4 text-sm text-gray-500">No checklist items added.</div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ── 4. How To Book & Stats Block ── */}
            <section>
              <h3 className={sectionHead}>
                <span className="text-[#E1017D]">04</span> How To Book & Stats
              </h3>
              <div className="space-y-4 bg-[#252525] p-4 rounded-lg border border-[#3A3530]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Heading</label>
                    <input type="text" value={howToBookHeadline} onChange={e => setHowToBookHeadline(e.target.value)} placeholder="e.g. HERE'S HOW TO BOOK" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Description text</label>
                    <textarea value={howToBookBody} onChange={e => setHowToBookBody(e.target.value)} placeholder="e.g. To book this package, either click here..." rows={2} className={inputCls} />
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#3A3530]">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-300">Stats Blocks (Age, Price, Time)</label>
                    <button type="button" onClick={addStatBlock} className="text-xs bg-[#E1017D]/20 text-[#E1017D] px-3 py-1 rounded-md hover:bg-[#E1017D] hover:text-white transition-colors">
                      + Add Stat Block
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {statsBlocks.map((stat, index) => (
                      <div key={stat.id} className="bg-[#1C1C1C] p-3 rounded-lg border border-[#3A3530] space-y-2 relative">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">Block {index + 1}</span>
                          <button type="button" onClick={() => removeStatBlock(stat.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                            <TrashIcon />
                          </button>
                        </div>
                        <select value={stat.iconType} onChange={e => updateStatBlock(stat.id, 'iconType', e.target.value)} className={inputSmCls}>
                          <option value="age">Icon: Family (Age)</option>
                          <option value="price">Icon: Dollar (Price)</option>
                          <option value="time">Icon: Clock (Time)</option>
                        </select>
                        <input type="text" value={stat.topText} onChange={e => updateStatBlock(stat.id, 'topText', e.target.value)} placeholder="Top (e.g. AGE, FROM)" className={inputSmCls} />
                        <input type="text" value={stat.mainText} onChange={e => updateStatBlock(stat.id, 'mainText', e.target.value)} placeholder="Main (e.g. 18+, $27.50)" className={inputSmCls} />
                        <textarea value={stat.subText || ''} onChange={e => updateStatBlock(stat.id, 'subText', e.target.value)} placeholder="Subtext (e.g. PER PERSON...)" rows={2} className={inputSmCls} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── 5. Other Games Cards ── */}
            <section>
              <div className="flex items-center justify-between border-b border-[#3A3530] pb-2 mb-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-[#E1017D]">05</span> Other Games Cards
                </h3>
                <button type="button" onClick={addOtherGameCard} className="text-xs bg-[#E1017D]/20 text-[#E1017D] px-3 py-1 rounded-md hover:bg-[#E1017D] hover:text-white transition-colors">
                  + Add Game Card
                </button>
              </div>
              
              <div className="mb-4">
                <label className={labelSmCls}>Section Heading</label>
                <input type="text" value={otherGamesHeading} onChange={e => setOtherGamesHeading(e.target.value)} placeholder="e.g. OTHER GAMES" className={inputCls} />
              </div>

              <div className="space-y-4">
                {otherGamesCards.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-[#3A3530] rounded-lg text-gray-500 text-sm">
                    No game cards added yet. Click "+ Add Game Card" to add one.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {otherGamesCards.map((card, index) => (
                      <div key={card.id} className="bg-[#252525] p-4 rounded-lg border border-[#3A3530] space-y-4 relative">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-300">Game Card {index + 1}</h4>
                          <button type="button" onClick={() => removeOtherGameCard(card.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                            <TrashIcon />
                          </button>
                        </div>
                        
                        <div>
                          <label className={labelSmCls}>Title</label>
                          <input type="text" value={card.title} onChange={e => updateOtherGameCard(card.id, 'title', e.target.value)} placeholder="e.g. INDOOR MINI GOLF" className={inputSmCls} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelSmCls}>Button 1 Text (Blue)</label>
                            <input type="text" value={card.button1Text} onChange={e => updateOtherGameCard(card.id, 'button1Text', e.target.value)} placeholder="e.g. BOOK NOW" className={inputSmCls} />
                          </div>
                          <div>
                            <label className={labelSmCls}>Button 1 Link</label>
                            <input type="text" value={card.button1Link} onChange={e => updateOtherGameCard(card.id, 'button1Link', e.target.value)} placeholder="e.g. /book/golf" className={inputSmCls} />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelSmCls}>Button 2 Text (Gray)</label>
                            <input type="text" value={card.button2Text || ''} onChange={e => updateOtherGameCard(card.id, 'button2Text', e.target.value)} placeholder="e.g. LEARN MORE" className={inputSmCls} />
                          </div>
                          <div>
                            <label className={labelSmCls}>Button 2 Link</label>
                            <input type="text" value={card.button2Link || ''} onChange={e => updateOtherGameCard(card.id, 'button2Link', e.target.value)} placeholder="e.g. /games/golf" className={inputSmCls} />
                          </div>
                        </div>

                        <ImageInputWithUpload
                          label="Featured Event Image"
                          hint="16:9 to 3:1 • Rec: 800×450 px"
                          value={card.image}
                          onChange={(url) => updateOtherGameCard(card.id, 'image', url)}
                          placeholder="Paste image URL here"
                          inputClassName={inputSmCls}
                          labelClassName={labelSmCls}
                          previewWidth="w-full"
                          previewHeight="h-32"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#3A3530] bg-[#252525] rounded-b-2xl flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Cancel
          </button>
          <button type="submit" form="queens-night-form" className="px-6 py-2.5 bg-[#E1017D] text-white text-sm font-medium rounded-lg hover:bg-[#C0006A] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#E1017D]/20">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueensNightForm;
