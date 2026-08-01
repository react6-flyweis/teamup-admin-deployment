import React, { useState, useEffect, useRef } from 'react';
import type { HeaderSubItem, OtherGameCard, ChecklistItem, ChooseGameCard } from '@/components/ManageHeader/types';
import { CloseIcon, UploadIcon, TrashIcon } from '@/assets/icons';
import { useGamesQuery } from '@/hooks/useGames';
import apiClient from '@/utils/apiClient';

interface GameFormProps {
  onClose: () => void;
  onSave: (subItem: Partial<HeaderSubItem>) => void;
  initialData: HeaderSubItem | null;
}

const GameForm: React.FC<GameFormProps> = ({ onClose, onSave, initialData }) => {
  const { data: gamesData, isLoading: isGamesLoading } = useGamesQuery();
  const availableGames = gamesData?.games || [];

  // ─── Link Mode (Pre-existing vs Add New) ────────────────────
  const [linkMode, setLinkMode] = useState<'existing' | 'new'>('new');
  const [selectedGameId, setSelectedGameId] = useState<string>('');

  // ─── Navigation fields ─────────────────────────────────────
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [icon, setIcon] = useState('');
  const [pageType, setPageType] = useState<'game' | 'group-activity'>('game');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Shared hero fields ────────────────────────────────────
  const [pageHeadline, setPageHeadline] = useState('');
  const [pageTagline, setPageTagline] = useState('');
  const [cardDescription, setCardDescription] = useState('');
  const [pageHeroImage, setPageHeroImage] = useState('');
  const heroImageRef = useRef<HTMLInputElement>(null);
  const [heroBookNowLink, setHeroBookNowLink] = useState('');

  // ─── Choose Game fields ────────────────────────────────────
  const [peoplePerMachine, setPeoplePerMachine] = useState('');
  const [timeMin, setTimeMin] = useState('');
  const [lanes, setLanes] = useState('');
  const [price, setPrice] = useState('');
  const [minAge, setMinAge] = useState('');
  const [wheelchairAccess, setWheelchairAccess] = useState(false);
  const [otherGames, setOtherGames] = useState<OtherGameCard[]>([]);

  // ─── Group Activity fields ─────────────────────────────────
  const [sectionHeadline, setSectionHeadline] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [howToBookHeadline, setHowToBookHeadline] = useState('');
  const [howToBookBody, setHowToBookBody] = useState('');
  const [howToBookLink, setHowToBookLink] = useState('');
  const [howToBookEmail, setHowToBookEmail] = useState('');
  const [howToBookPhone, setHowToBookPhone] = useState('');
  const [chooseGamesHeading, setChooseGamesHeading] = useState('');
  const [chooseGameCards, setChooseGameCards] = useState<ChooseGameCard[]>([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPath(initialData.path || initialData.slug || '');
      setIcon(initialData.icon || '');
      setPageType(initialData.pageType === 'group-activity' ? 'group-activity' : 'game');
      setPageHeadline(initialData.pageHeadline || '');
      setPageTagline(initialData.pageTagline || '');
      setCardDescription(initialData.cardDescription || '');
      setPageHeroImage(initialData.pageHeroImage || '');
      setHeroBookNowLink(initialData.heroBookNowLink || '');
      // Game details
      setPeoplePerMachine(initialData.pageDetails?.peoplePerMachine || '');
      setTimeMin(initialData.pageDetails?.timeMin || '');
      setLanes(initialData.pageDetails?.lanes || '');
      setPrice(initialData.pageDetails?.price ? String(initialData.pageDetails.price) : '');
      setMinAge(initialData.pageDetails?.minAge || '');
      setWheelchairAccess(initialData.pageDetails?.wheelchairAccess || false);
      setOtherGames(initialData.otherGames || []);
      // Group Activity
      setSectionHeadline(initialData.sectionHeadline || '');
      setSectionDescription(initialData.sectionDescription || '');
      setChecklistItems(initialData.checklistItems || []);
      setHowToBookHeadline(initialData.howToBookHeadline || '');
      setHowToBookBody(initialData.howToBookBody || '');
      setHowToBookLink(initialData.howToBookLink || '');
      setHowToBookEmail(initialData.howToBookEmail || '');
      setHowToBookPhone(initialData.howToBookPhone || '');
      setChooseGamesHeading(initialData.chooseGamesHeading || '');
      setChooseGameCards(initialData.chooseGameCards || []);

      if (initialData.linkedItemId) {
        setLinkMode('existing');
        setSelectedGameId(initialData.linkedItemId);
      }
    }
  }, [initialData]);

  // Handle selecting an existing game from dropdown
  const handleSelectGame = (gameId: string) => {
    setSelectedGameId(gameId);
    const foundGame = availableGames.find(g => g._id === gameId);
    if (foundGame) {
      setName(foundGame.name);
      setPath(`/games/${foundGame.slug}`);
      setPageHeadline(foundGame.name.toUpperCase());
      setCardDescription(foundGame.description);
      if (foundGame.imageUrl) {
        setPageHeroImage(foundGame.imageUrl);
      }
      setPrice(foundGame.priceFrom ? String(foundGame.priceFrom) : '');
      if (foundGame.duration) {
        setTimeMin(foundGame.duration);
      }
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !path.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const targetGameId = linkMode === 'existing' ? selectedGameId : (initialData?.linkedItemId || selectedGameId);

      // If gameId is present and price/tags/isActive are provided, sync with PATCH /api/games/:gameId
      if (targetGameId) {
        try {
          const numPrice = parseFloat(price);
          await apiClient.patch(`/games/${targetGameId}`, {
            ...(isNaN(numPrice) ? {} : { priceFrom: numPrice }),
            isActive: true,
          });
        } catch (err) {
          console.error('Failed to sync game updates via PATCH /api/games/:id', err);
        }
      }

      onSave({
        name: name.trim(),
        path: path.trim(),
        slug: path.trim().replace(/^\//, ''),
        type: 'game',
        linkedItemId: targetGameId || undefined,
        icon,
        pageType,
        pageHeadline,
        pageTagline,
        cardDescription,
        pageHeroImage,
        heroBookNowLink,
        // Game
        pageDetails: { peoplePerMachine, timeMin, lanes, price, minAge, wheelchairAccess },
        otherGames,
        // Group Activity
        sectionHeadline,
        sectionDescription,
        checklistItems,
        howToBookHeadline,
        howToBookBody,
        howToBookLink,
        howToBookEmail,
        howToBookPhone,
        chooseGamesHeading,
        chooseGameCards,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ─── Other Games helpers ───────────────────────────────────
  const handleOtherGameImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const next = [...otherGames];
        next[index].image = reader.result as string;
        setOtherGames(next);
      };
      reader.readAsDataURL(file);
    }
  };
  const addOtherGame = () => setOtherGames([...otherGames, { id: Date.now().toString(), title: '', image: '', bookNowLink: '', learnMoreLink: '' }]);
  const removeOtherGame = (id: string) => setOtherGames(otherGames.filter(g => g.id !== id));
  const updateOtherGame = (index: number, field: keyof OtherGameCard, value: string) => {
    const next = [...otherGames]; next[index] = { ...next[index], [field]: value }; setOtherGames(next);
  };

  // ─── Checklist helpers ─────────────────────────────────────
  const addChecklist = () => setChecklistItems([...checklistItems, { id: Date.now().toString(), title: '', subtext: '' }]);
  const removeChecklist = (id: string) => setChecklistItems(checklistItems.filter(c => c.id !== id));
  const updateChecklist = (index: number, field: keyof ChecklistItem, value: string) => {
    const next = [...checklistItems]; next[index] = { ...next[index], [field]: value }; setChecklistItems(next);
  };

  // ─── Choose Game Cards helpers ─────────────────────────────
  const handleChooseGameImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const next = [...chooseGameCards];
        next[index].image = reader.result as string;
        setChooseGameCards(next);
      };
      reader.readAsDataURL(file);
    }
  };
  const addChooseGameCard = () => setChooseGameCards([...chooseGameCards, { id: Date.now().toString(), title: '', image: '', link: '' }]);
  const removeChooseGameCard = (id: string) => setChooseGameCards(chooseGameCards.filter(c => c.id !== id));
  const updateChooseGameCard = (index: number, field: keyof ChooseGameCard, value: string) => {
    const next = [...chooseGameCards]; next[index] = { ...next[index], [field]: value }; setChooseGameCards(next);
  };

  const inputCls = 'w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB3748] transition-colors';
  const inputSmCls = 'w-full bg-[#1C1C1C] border border-[#3A3530] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#FB3748] text-sm transition-colors';
  const labelCls = 'block text-sm font-medium text-gray-300 mb-2';
  const labelSmCls = 'block text-xs font-medium text-gray-400 mb-1';
  const sectionTitleCls = 'text-md font-medium text-white border-b border-[#3A3530] pb-2 mb-4';

  return (
    <div>
      <div className="bg-[#1C1C1C] rounded-xl border border-[#3A3530] w-full max-w-4xl overflow-hidden flex flex-col mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3A3530] flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">
            {initialData ? 'Edit Sub-item / Game' : 'Add Sub-item / Game'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-8">

          {/* ── Link Mode Selection ── */}
          <div className="p-4 bg-[#252525] border border-[#3A3530] rounded-lg space-y-3">
            <label className={labelCls}>Game Source</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setLinkMode('existing')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${linkMode === 'existing' ? 'bg-[#FB3748] text-white' : 'bg-[#1C1C1C] text-gray-300 hover:bg-[#3A3530]'}`}
              >
                🔗 Select Pre-existing Game
              </button>
              <button
                type="button"
                onClick={() => setLinkMode('new')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${linkMode === 'new' ? 'bg-[#FB3748] text-white' : 'bg-[#1C1C1C] text-gray-300 hover:bg-[#3A3530]'}`}
              >
                ✨ Add New Game Details
              </button>
            </div>

            {linkMode === 'existing' && (
              <div className="mt-3">
                <label className={labelSmCls}>Choose Pre-existing Game</label>
                {isGamesLoading ? (
                  <p className="text-xs text-gray-400">Loading games...</p>
                ) : (
                  <select
                    value={selectedGameId}
                    onChange={e => handleSelectGame(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">-- Select a Game --</option>
                    {availableGames.map(game => (
                      <option key={game._id} value={game._id}>
                        {game.name} ({game.slug})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* ── Navigation Setup ── */}
          <div>
            <h3 className={sectionTitleCls}>Navigation Setup</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Indoor Mini Golf" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>URL Path / Slug</label>
                <input type="text" value={path} onChange={e => setPath(e.target.value)} placeholder="e.g. /games/mini-golf" className={inputCls} />
              </div>
            </div>

            {/* Page Type */}
            <div className="mb-4">
              <label className={labelCls}>Page Type</label>
              <div className="flex gap-3">
                {(['game', 'group-activity'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPageType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pageType === type ? 'bg-[#FB3748] text-white' : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3530]'}`}
                  >
                    {type === 'game' ? '🎮 Choose Game' : '🎉 Group Activity'}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className={labelCls}>Navigation Icon</label>
              <div className="flex items-center gap-4">
                {icon ? (
                  <div className="relative group w-16 h-16 rounded-lg bg-[#2A2A2A] border border-[#3A3530] overflow-hidden flex items-center justify-center">
                    <img src={icon} alt="Icon" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
                    <button type="button" onClick={() => setIcon('')} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><CloseIcon /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-lg bg-[#2A2A2A] border border-dashed border-[#3A3530] hover:border-[#FB3748] hover:text-[#FB3748] flex flex-col items-center justify-center text-gray-500 transition-colors">
                    <UploadIcon /><span className="text-[10px] mt-1">Upload</span>
                  </button>
                )}
                <div className="flex-1">
                  <input type="text" value={icon} onChange={e => setIcon(e.target.value)} placeholder="Or paste image URL" className={`${inputCls} text-sm`} />
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, setIcon)} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Shared Hero ── */}
          <div>
            <h3 className={sectionTitleCls}>Hero Section</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Hero Headline</label>
                  <input type="text" value={pageHeadline} onChange={e => setPageHeadline(e.target.value)} placeholder="e.g. BOOM BIRTHDAYS" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Page Tagline</label>
                  <input type="text" value={pageTagline} onChange={e => setPageTagline(e.target.value)} placeholder="e.g. Rack 'em up!" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Card Description (Used in Group Activities lists)</label>
                <textarea value={cardDescription} onChange={e => setCardDescription(e.target.value)} placeholder="e.g. Lorem Ipsum is simply dummy text..." rows={2} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Book Now Link</label>
                <input type="text" value={heroBookNowLink} onChange={e => setHeroBookNowLink(e.target.value)} placeholder="e.g. /book/birthday" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Hero Image</label>
                <div className="flex items-center gap-4">
                  {pageHeroImage ? (
                    <div className="relative group w-32 h-16 rounded-lg bg-[#2A2A2A] border border-[#3A3530] overflow-hidden flex items-center justify-center">
                      <img src={pageHeroImage} alt="Hero" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setPageHeroImage('')} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><CloseIcon /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => heroImageRef.current?.click()} className="w-32 h-16 rounded-lg bg-[#2A2A2A] border border-dashed border-[#3A3530] hover:border-[#FB3748] hover:text-[#FB3748] flex flex-col items-center justify-center text-gray-500 transition-colors">
                      <UploadIcon /><span className="text-[10px] mt-1">Upload</span>
                    </button>
                  )}
                  <div className="flex-1">
                    <input type="text" value={pageHeroImage} onChange={e => setPageHeroImage(e.target.value)} placeholder="Or paste image URL" className={`${inputCls} text-sm`} />
                    <input type="file" ref={heroImageRef} className="hidden" accept="image/*" onChange={e => handleFileChange(e, setPageHeroImage)} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CHOOSE GAME specific fields ── */}
          {pageType === 'game' && (
            <>
              <div>
                <h3 className={sectionTitleCls}>Game Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelSmCls}>People Per Machine</label><input type="text" value={peoplePerMachine} onChange={e => setPeoplePerMachine(e.target.value)} placeholder="e.g. 1-4 PERSON" className={inputSmCls} /></div>
                    <div><label className={labelSmCls}>Time (Minutes)</label><input type="text" value={timeMin} onChange={e => setTimeMin(e.target.value)} placeholder="e.g. 30 OR 60" className={inputSmCls} /></div>
                    <div><label className={labelSmCls}>Lanes</label><input type="text" value={lanes} onChange={e => setLanes(e.target.value)} placeholder="e.g. 8 LANES" className={inputSmCls} /></div>
                    <div><label className={labelSmCls}>Price</label><input type="text" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 9 TO 17" className={inputSmCls} /></div>
                    <div><label className={labelSmCls}>Minimum Age</label><input type="text" value={minAge} onChange={e => setMinAge(e.target.value)} placeholder="e.g. ALL ALLOWED" className={inputSmCls} /></div>
                    <div className="flex items-center mt-5">
                      <label className="flex items-center cursor-pointer gap-3">
                        <div className="relative">
                          <input type="checkbox" className="sr-only" checked={wheelchairAccess} onChange={e => setWheelchairAccess(e.target.checked)} />
                          <div className={`block w-10 h-6 rounded-full transition-colors ${wheelchairAccess ? 'bg-[#FB3748]' : 'bg-[#3A3530]'}`}></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${wheelchairAccess ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <span className="text-sm text-gray-300">Wheelchair Access</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Games Cards */}
              <div>
                <div className="flex items-center justify-between border-b border-[#3A3530] pb-2 mb-4">
                  <h3 className="text-md font-medium text-white">Other Games Cards</h3>
                  <button type="button" onClick={addOtherGame} className="text-xs bg-[#2A2A2A] hover:bg-[#3A3530] text-white px-3 py-1.5 rounded transition-colors">+ Add Card</button>
                </div>
                {otherGames.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No cards added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {otherGames.map((game, index) => (
                      <div key={game.id} className="p-4 bg-[#252525] rounded-lg border border-[#3A3530] relative">
                        <button type="button" onClick={() => removeOtherGame(game.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-300"><TrashIcon size={16} color="currentColor" /></button>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={labelSmCls}>Title</label><input type="text" value={game.title} onChange={e => updateOtherGame(index, 'title', e.target.value)} placeholder="e.g. DUCKPIN BOWLING" className={inputSmCls} /></div>
                          <div>
                            <label className={labelSmCls}>Image</label>
                            <div className="flex items-center gap-2">
                              {game.image && <img src={game.image} alt="" className="w-10 h-10 object-cover rounded border border-[#3A3530]" />}
                              <div className="flex-1 relative">
                                <input type="file" accept="image/*" onChange={e => handleOtherGameImageUpload(index, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="w-full bg-[#1C1C1C] border border-dashed border-[#3A3530] rounded-lg px-3 py-2 text-white text-sm text-center hover:border-[#FB3748] transition-colors">{game.image ? 'Change' : 'Upload'}</div>
                              </div>
                            </div>
                          </div>
                          <div><label className={labelSmCls}>Book Now Link</label><input type="text" value={game.bookNowLink || ''} onChange={e => updateOtherGame(index, 'bookNowLink', e.target.value)} placeholder="/book/..." className={inputSmCls} /></div>
                          <div><label className={labelSmCls}>Learn More Link</label><input type="text" value={game.learnMoreLink || ''} onChange={e => updateOtherGame(index, 'learnMoreLink', e.target.value)} placeholder="/games/..." className={inputSmCls} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── GROUP ACTIVITY specific fields ── */}
          {pageType === 'group-activity' && (
            <>
              {/* What's Included */}
              <div>
                <h3 className={sectionTitleCls}>What's Included Section</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Section Headline</label>
                    <input type="text" value={sectionHeadline} onChange={e => setSectionHeadline(e.target.value)} placeholder="e.g. BATTLE IT OUT FOR A BIRTHDAY YOU WON'T FORGET" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Section Description</label>
                    <textarea value={sectionDescription} onChange={e => setSectionDescription(e.target.value)} placeholder="e.g. Chat to our expert party planners today to plan the ultimate birthday get together..." rows={3} className={inputCls} />
                  </div>

                  {/* Checklist Items */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-300">✅ Checklist Items</label>
                      <button type="button" onClick={addChecklist} className="text-xs bg-[#2A2A2A] hover:bg-[#3A3530] text-white px-3 py-1.5 rounded transition-colors">+ Add Item</button>
                    </div>
                    {checklistItems.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No checklist items yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {checklistItems.map((item, index) => (
                          <div key={item.id} className="p-3 bg-[#252525] rounded-lg border border-[#3A3530] relative">
                            <button type="button" onClick={() => removeChecklist(item.id)} className="absolute top-2 right-2 text-red-400 hover:text-red-300"><TrashIcon size={14} color="currentColor" /></button>
                            <div className="grid grid-cols-2 gap-3">
                              <div><label className={labelSmCls}>Title (Bold)</label><input type="text" value={item.title} onChange={e => updateChecklist(index, 'title', e.target.value)} placeholder="e.g. 2 X GAMES" className={inputSmCls} /></div>
                              <div><label className={labelSmCls}>Subtext (optional)</label><input type="text" value={item.subtext || ''} onChange={e => updateChecklist(index, 'subtext', e.target.value)} placeholder="e.g. Choose from our epic selection..." className={inputSmCls} /></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* How to Book */}
              <div>
                <h3 className={sectionTitleCls}>How to Book Section</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Section Headline</label>
                    <input type="text" value={howToBookHeadline} onChange={e => setHowToBookHeadline(e.target.value)} placeholder="e.g. HERE'S HOW TO BOOK" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Body Text</label>
                    <textarea value={howToBookBody} onChange={e => setHowToBookBody(e.target.value)} placeholder="e.g. To book this package, either click here, email us on... or give us a call on..." rows={3} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className={labelSmCls}>Book Link</label><input type="text" value={howToBookLink} onChange={e => setHowToBookLink(e.target.value)} placeholder="/book/..." className={inputSmCls} /></div>
                    <div><label className={labelSmCls}>Email</label><input type="text" value={howToBookEmail} onChange={e => setHowToBookEmail(e.target.value)} placeholder="e.g. sales@boom.com" className={inputSmCls} /></div>
                    <div><label className={labelSmCls}>Phone</label><input type="text" value={howToBookPhone} onChange={e => setHowToBookPhone(e.target.value)} placeholder="e.g. 0207 286 0404" className={inputSmCls} /></div>
                  </div>
                </div>
              </div>

              {/* Choose Your Games Cards */}
              <div>
                <div className="flex items-center justify-between border-b border-[#3A3530] pb-2 mb-4">
                  <h3 className="text-md font-medium text-white">Choose Your Games Cards</h3>
                  <button type="button" onClick={addChooseGameCard} className="text-xs bg-[#2A2A2A] hover:bg-[#3A3530] text-white px-3 py-1.5 rounded transition-colors">+ Add Card</button>
                </div>
                <div className="mb-3">
                  <label className={labelSmCls}>Section Heading</label>
                  <input type="text" value={chooseGamesHeading} onChange={e => setChooseGamesHeading(e.target.value)} placeholder="e.g. CHOOSE YOUR GAMES" className={inputSmCls} />
                </div>
                {chooseGameCards.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No game cards added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {chooseGameCards.map((card, index) => (
                      <div key={card.id} className="p-4 bg-[#252525] rounded-lg border border-[#3A3530] relative">
                        <button type="button" onClick={() => removeChooseGameCard(card.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-300"><TrashIcon size={16} color="currentColor" /></button>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={labelSmCls}>Card Title</label><input type="text" value={card.title} onChange={e => updateChooseGameCard(index, 'title', e.target.value)} placeholder="e.g. AXE THROW" className={inputSmCls} /></div>
                          <div>
                            <label className={labelSmCls}>Card Image</label>
                            <div className="flex items-center gap-2">
                              {card.image && <img src={card.image} alt="" className="w-10 h-10 object-cover rounded border border-[#3A3530]" />}
                              <div className="flex-1 relative">
                                <input type="file" accept="image/*" onChange={e => handleChooseGameImageUpload(index, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="w-full bg-[#1C1C1C] border border-dashed border-[#3A3530] rounded-lg px-3 py-2 text-white text-sm text-center hover:border-[#FB3748] transition-colors">{card.image ? 'Change' : 'Upload'}</div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2"><label className={labelSmCls}>Card Link</label><input type="text" value={card.link || ''} onChange={e => updateChooseGameCard(index, 'link', e.target.value)} placeholder="e.g. /games/axe-throw" className={inputSmCls} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#3A3530]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-[#2A2A2A] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !path.trim() || isSubmitting}
              className="bg-[#FB3748] text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameForm;
