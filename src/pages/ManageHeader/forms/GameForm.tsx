/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { HeaderSubItem, OtherGameCard, ChecklistItem, ChooseGameCard } from '@/components/ManageHeader/types';
import { CloseIcon, UploadIcon, TrashIcon } from '@/assets/icons';
import { useGamesQuery } from '@/hooks/useGames';
import apiClient from '@/utils/apiClient';
import { uploadFile } from '@/utils/fileUpload';

interface GameFormProps {
  onClose: () => void;
  onSave: (subItem: Partial<HeaderSubItem>) => void;
  initialData: HeaderSubItem | null;
  subItemId?: string;
}

const GameForm: React.FC<GameFormProps> = ({ onClose, onSave, initialData, subItemId }) => {
  const queryClient = useQueryClient();
  const { data: gamesData, isLoading: isGamesLoading } = useGamesQuery();

  const availableGames = useMemo(() => gamesData?.games || [], [gamesData?.games]);


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
  const [tagsInput, setTagsInput] = useState('family, indoor, featured');
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

      const targetGameId = initialData.linkedItemId ? String(initialData.linkedItemId) : '';
      if (targetGameId) {
        setLinkMode('existing');
        setSelectedGameId(targetGameId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const linkedGame = initialData.linkedGame || availableGames.find(g => String(g._id || (g as any).id) === targetGameId);
        if (linkedGame) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const gAny = linkedGame as any;
          // Navigation Display Name remains from initialData (menu item title)
          setName(initialData.name || linkedGame.name || gAny.gameName || '');
          setPath(initialData.path || (linkedGame.slug ? `/games/${linkedGame.slug}` : ''));
          // Hero Headline / Game Name explicitly comes from linkedGame.name (game API)
          setPageHeadline(linkedGame.name || gAny.gameName || initialData.pageHeadline || '');
          setCardDescription(linkedGame.description || initialData.cardDescription || '');
          setPageHeroImage(linkedGame.imageUrl || gAny.cardImageUrl || gAny.bannerImageUrl || initialData.pageHeroImage || '');
          const pVal = initialData.pageDetails?.price || (linkedGame.priceFrom != null ? String(linkedGame.priceFrom) : (gAny.pricePerPerson != null ? String(gAny.pricePerPerson) : ''));
          setPrice(pVal);
          const tVal = initialData.pageDetails?.timeMin || linkedGame.duration || gAny.timeOption || '';
          setTimeMin(tVal);
          if (linkedGame.tags && linkedGame.tags.length > 0) {
            setTagsInput(linkedGame.tags.join(', '));
          }
        }
      } else if (availableGames.length > 0) {
        // Try matching slug or ID with availableGames to preselect pre-existing game
        const currentSlug = (initialData.slug || initialData.path || '').replace(/^\//, '').toLowerCase();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchedGame = availableGames.find(g => {
          const gAny = g as any;
          return String(g._id || gAny.id) === String(initialData.id) || 
            (g.slug && g.slug.toLowerCase() === currentSlug) ||
            ((g.name || gAny.gameName) && (g.name || gAny.gameName).toLowerCase() === (initialData.name || '').toLowerCase());
        });

        if (matchedGame) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mAny = matchedGame as any;
          const matchedId = String(matchedGame._id || mAny.id);
          setLinkMode('existing');
          setSelectedGameId(matchedId);
          setPageHeadline(matchedGame.name || mAny.gameName || '');
          setCardDescription(matchedGame.description || initialData.cardDescription || '');
          setPageHeroImage(matchedGame.imageUrl || mAny.cardImageUrl || mAny.bannerImageUrl || initialData.pageHeroImage || '');
          const pVal = matchedGame.priceFrom != null ? String(matchedGame.priceFrom) : (mAny.pricePerPerson != null ? String(mAny.pricePerPerson) : '');
          setPrice(pVal);
          const tVal = matchedGame.duration || mAny.timeOption || '';
          setTimeMin(tVal);
          if (matchedGame.tags && matchedGame.tags.length > 0) {
            setTagsInput(matchedGame.tags.join(', '));
          }
        }
      }
    }
  }, [initialData, availableGames]);

  // Handle selecting an existing game from dropdown
  const handleSelectGame = (gameId: string) => {
    setSelectedGameId(gameId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const foundGame = availableGames.find(g => String(g._id || (g as any).id) === String(gameId));
    if (foundGame) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fAny = foundGame as any;
      if (!name) {
        setName(foundGame.name || fAny.gameName || '');
      }
      setPath(foundGame.slug ? `/games/${foundGame.slug}` : '');
      setPageHeadline(foundGame.name || fAny.gameName || '');
      setCardDescription(foundGame.description || '');
      const img = foundGame.imageUrl || fAny.cardImageUrl || fAny.bannerImageUrl;
      if (img) {
        setPageHeroImage(img);
      }
      const priceVal = foundGame.priceFrom ?? fAny.pricePerPerson;
      setPrice(priceVal != null ? String(priceVal) : '');
      const durVal = foundGame.duration || fAny.timeOption;
      if (durVal) {
        setTimeMin(durVal);
      }
      if (foundGame.tags && foundGame.tags.length > 0) {
        setTagsInput(foundGame.tags.join(', '));
      }
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !path.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const targetGameId = linkMode === 'existing' ? selectedGameId : (initialData?.linkedItemId ? String(initialData.linkedItemId) : selectedGameId);

      // 1. Update menu item navigation details via PATCH /api/menu-items/:menuItemId
      // "Navigation Display Name" (`name`) updates `title` on menu-items API.
      const menuItemId = initialData?.id || subItemId;
      if (menuItemId && menuItemId !== 'new') {
        try {
          const detailsArray = [
            { label: 'How Many', value: peoplePerMachine || '1-2 Person', note: 'Per Machine' },
            { label: 'How Many LANES', value: lanes || '8 LANES', note: '' },
            { label: 'Time', value: timeMin || '30 or 60', note: 'Minutes' },
            { label: 'Price', value: price || '9 to 17', note: 'Per Person' },
            { label: 'Minimum Age', value: minAge || 'All Allowed', note: '' },
            { label: 'Wheelchair Access', value: wheelchairAccess ? 'Yes' : 'No', note: 'Call the provider' },
          ];

          await apiClient.patch(`/menu-items/${menuItemId}`, {
            title: name.trim(), // Explicitly Navigation Display Name only
            slug: path.trim().replace(/^\//, ''),
            linkUrl: path.trim(),
            iconUrl: icon,
            heroImageUrl: pageHeroImage,
            imageUrl: pageHeroImage,
            tagline: pageTagline,
            taglineDescription: cardDescription,
            bookingUrl: heroBookNowLink,
            details: detailsArray,
          });
        } catch (err) {
          console.error('Failed to sync navigation setup via PATCH /api/menu-items/:id', err);
        }
      }

      // 2. Update game details via PATCH /api/games/:gameId
      // "Hero Headline / Game Name" (`pageHeadline`) updates `name` on games API.
      if (targetGameId) {
        try {
          const numPrice = parseFloat(price);
          const parsedTags = tagsInput
            .split(',')
            .map(t => t.trim())
            .filter(Boolean);

          await apiClient.patch(`/games/${targetGameId}`, {
            name: pageHeadline.trim(), // Explicitly Hero Headline / Game Name only
            gameName: pageHeadline.trim(),
            slug: path.trim().replace(/^\//, ''),
            description: cardDescription,
            imageUrl: pageHeroImage,
            cardImageUrl: pageHeroImage,
            bannerImageUrl: pageHeroImage,
            duration: timeMin,
            timeOption: timeMin,
            priceFrom: isNaN(numPrice) ? 45 : numPrice,
            pricePerPerson: isNaN(numPrice) ? undefined : numPrice,
            tags: parsedTags.length > 0 ? parsedTags : ['family', 'indoor', 'featured'],
            isActive: true,
          });
        } catch (err) {
          console.error('Failed to sync game updates via PATCH /api/games/:id', err);
        }
      }

      // Invalidate queries so UI immediately reflects updated menu item and game data
      queryClient.invalidateQueries({ queryKey: ['header-categories'] });
      queryClient.invalidateQueries({ queryKey: ['menu-item'] });
      queryClient.invalidateQueries({ queryKey: ['games'] });

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

  // ─── Other Games helpers ───────────────────────────────────
  const handleOtherGameImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        const next = [...otherGames];
        next[index].image = url;
        setOtherGames(next);
      } catch (error) {
        console.error('File upload failed:', error);
      }
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
  const handleChooseGameImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        const next = [...chooseGameCards];
        next[index].image = url;
        setChooseGameCards(next);
      } catch (error) {
        console.error('File upload failed:', error);
      }
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

  const isLinked = Boolean(selectedGameId || initialData?.linkedItemId);

  return (
    <div>
      <div className="bg-[#1C1C1C] rounded-xl border border-[#3A3530] w-full max-w-4xl overflow-hidden flex flex-col mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3A3530] shrink-0">
          <h2 className="text-lg font-semibold text-white">
            {initialData ? 'Edit Sub-item / Game' : 'Add Sub-item / Game'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-8">

          {/* ── Link Mode Selection (Hidden if already linked) ── */}
          {!isLinked && (
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
                      {availableGames.map(game => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const gid = String(game._id || (game as any).id);
                        return (
                          <option key={gid} value={gid}>
                            {game.name || (game as any).gameName} ({game.slug})
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Navigation Setup ── */}
          <div>
            <h3 className={sectionTitleCls}>Navigation Setup</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Navigation Display Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Axe Throwing" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>URL Path / Slug</label>
                <input type="text" value={path} onChange={e => setPath(e.target.value)} placeholder="e.g. /games/axe-throw" className={inputCls} />
              </div>
            </div>



            {/* Icon */}
            <div>
              <label className={labelCls}>
                Navigation Icon <span className="text-xs text-gray-400 font-normal ml-1.5">(1:1 Square • Rec: 160×160 px • SVG/PNG)</span>
              </label>
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
                  <label className={labelCls}>Hero Headline / Game Name</label>
                  <input type="text" value={pageHeadline} onChange={e => setPageHeadline(e.target.value)} placeholder="e.g. Axe Throw" className={inputCls} />
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
                <label className={labelCls}>
                  Hero Image <span className="text-xs text-gray-400 font-normal ml-1.5">(16:9 • Rec: 1920×1080 or 2560×1440 px)</span>
                </label>
                <div className="flex items-center gap-4">
                  {pageHeroImage ? (
                    <div className="relative group w-44 aspect-video rounded-lg bg-[#2A2A2A] border border-[#3A3530] overflow-hidden flex items-center justify-center">
                      <img src={pageHeroImage} alt="Hero" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setPageHeroImage('')} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><CloseIcon /></button>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[10px] text-gray-300 font-mono pointer-events-none">16:9</span>
                    </div>
                  ) : (
                    <button type="button" onClick={() => heroImageRef.current?.click()} className="w-44 aspect-video rounded-lg bg-[#2A2A2A] border border-dashed border-[#3A3530] hover:border-[#FB3748] hover:text-[#FB3748] flex flex-col items-center justify-center text-gray-500 transition-colors">
                      <UploadIcon /><span className="text-[10px] mt-1">Upload Hero</span>
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
                            <label className={labelSmCls}>
                              Image <span className="text-[11px] text-gray-400 font-normal ml-1">(1:1 Square • Rec: 800×800 px)</span>
                            </label>
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
                            <label className={labelSmCls}>
                              Card Image <span className="text-[11px] text-gray-400 font-normal ml-1">(1:1 Square • Rec: 800×800 px)</span>
                            </label>
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
