import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Chevron } from '@/assets/icons';
import GameForm from './forms/GameForm';
import { useHeaderCategoriesQuery, useMenuItemQuery } from '@/hooks/useHeaderCategories';
import { fetchGame, useGamesQuery } from '@/hooks/useGames';

const GameFormPage: React.FC = () => {
  const { categoryId, subItemId, gameId } = useParams<{
    categoryId?: string;
    subItemId?: string;
    gameId?: string;
  }>();
  const navigate = useNavigate();

  const { data: categoriesData } = useHeaderCategoriesQuery();
  const { data: menuItemResponse, isLoading: isMenuItemLoading } = useMenuItemQuery(subItemId);
  const { data: gamesData, isLoading: isGamesLoading } = useGamesQuery();

  const [resolvedGameId, setResolvedGameId] = useState<string | undefined>(gameId);
  const [resolvedMenuItemId, setResolvedMenuItemId] = useState<string | undefined>(subItemId);
  const [resolvedCategoryId, setResolvedCategoryId] = useState<string | undefined>(categoryId);
  const [loading, setLoading] = useState(true);

  // Broken link modal state
  const [showBrokenChainModal, setShowBrokenChainModal] = useState(false);
  const [brokenChainDetails, setBrokenChainDetails] = useState<{ title: string; message: string } | null>(null);

  const isEditMode = Boolean((subItemId && subItemId !== 'new') || (gameId && gameId !== 'new'));

  useEffect(() => {
    let isMounted = true;

    const checkChainAndResolve = async () => {
      // 1. New game creation
      if (gameId === 'new' || subItemId === 'new') {
        if (isMounted) {
          setResolvedGameId(undefined);
          setResolvedMenuItemId(undefined);
          setLoading(false);
        }
        return;
      }

      // 2. Navigated from Game Management (/game-venue/game/:gameId)
      if (gameId && gameId !== 'new') {
        try {
          const res = await fetchGame(gameId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const game = (res as any)?.game || (res as any)?.data || res;

          if (!game) {
            if (isMounted) {
              setBrokenChainDetails({
                title: 'Game Not Found',
                message: 'Could not load data for this game ID. It may have been deleted or the link is invalid.',
              });
              setShowBrokenChainModal(true);
              setLoading(false);
            }
            return;
          }

          // Match menu item from categoriesData
          let foundMenuId: string | undefined = undefined;
          let foundCatId = categoryId;
          if (categoriesData?.categories) {
            for (const cat of categoriesData.categories) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const matched = (cat.subItems || []).find((s: any) =>
                String(s.linkedItemId) === String(game._id || gameId) ||
                (game.slug && s.slug === game.slug) ||
                (game.slug && s.path === `/games/${game.slug}`) ||
                (game.name && s.name?.toLowerCase() === game.name.toLowerCase())
              );
              if (matched) {
                foundMenuId = matched.id;
                if (!foundCatId) foundCatId = cat.id;
                break;
              }
            }
          }

          if (isMounted) {
            setResolvedGameId(String(game._id || gameId));
            setResolvedMenuItemId(foundMenuId);
            if (foundCatId) setResolvedCategoryId(foundCatId);
            setLoading(false);
          }
          return;
        } catch (err) {
          console.warn('Error fetching game:', err);
          if (isMounted) {
            setBrokenChainDetails({
              title: 'Game Not Found',
              message: 'Failed to retrieve this game from the server.',
            });
            setShowBrokenChainModal(true);
            setLoading(false);
          }
          return;
        }
      }

      if (isMenuItemLoading || isGamesLoading) return;

      // 3. Navigated from Header Menu (/manage-header/:categoryId/game/:subItemId)
      if (subItemId && subItemId !== 'new') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawMenu = menuItemResponse as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiItem: any = rawMenu?.menuItem || rawMenu?.data?.menuItem || rawMenu?.data || (rawMenu && (rawMenu._id || rawMenu.title) ? rawMenu : null);

        // Also find category subItem in categoriesData
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let catSubItem: any = null;
        let foundCatId = categoryId;
        if (categoriesData?.categories) {
          for (const cat of categoriesData.categories) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const found = (cat.subItems || []).find((s: any) => String(s.id || s._id) === String(subItemId));
            if (found) {
              catSubItem = found;
              if (!foundCatId) foundCatId = cat.id;
              break;
            }
          }
        }

        const item = apiItem && (apiItem._id || apiItem.title || apiItem.linkUrl)
          ? { ...catSubItem, ...apiItem }
          : catSubItem;

        if (!item) {
          if (isMounted) {
            setBrokenChainDetails({
              title: 'Menu Item Not Found',
              message: 'This navigation item could not be found in the menu.',
            });
            setShowBrokenChainModal(true);
            setLoading(false);
          }
          return;
        }

        const rawPath = item.linkUrl || item.path || '';
        const extractedSlug = (item.slug || rawPath.replace(/^\/?(games\/)?/, '')).replace(/^\//, '').trim();
        const itemTitle = item.title || item.name || '';
        const linkedId = item.linkedItemId != null ? String(item.linkedItemId) : undefined;

        let matchedGameId: string | undefined = undefined;

        // Try 1: check linkedId
        if (linkedId) {
          try {
            const res = await fetchGame(linkedId);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const g = (res as any)?.game || (res as any)?.data || res;
            if (g?._id) matchedGameId = String(g._id);
          } catch {
            // ignore
          }
        }

        // Try 2: check slug
        if (!matchedGameId && extractedSlug) {
          try {
            const res = await fetchGame(extractedSlug);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const g = (res as any)?.game || (res as any)?.data || res;
            if (g?._id) matchedGameId = String(g._id);
          } catch {
            // ignore
          }
        }

        // Try 3: match from gamesData list
        if (!matchedGameId && gamesData?.games) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const found = gamesData.games.find((g: any) => {
            const gSlug = (g.slug || '').toLowerCase().trim();
            const gName = (g.name || g.gameName || '').toLowerCase().trim();
            return (
              (linkedId && String(g._id) === linkedId) ||
              (gSlug && extractedSlug && gSlug === extractedSlug.toLowerCase()) ||
              (gName && itemTitle && gName === itemTitle.toLowerCase().trim())
            );
          });
          if (found?._id) matchedGameId = String(found._id);
        }

        // If after all attempts no game was found: BROKEN LINK!
        if (!matchedGameId && isMounted) {
          setBrokenChainDetails({
            title: 'Game Link Broken',
            message: `This navigation item ("${itemTitle || 'Game'}") is not linked to any game document in the database, and no matching game could be found. You can fill out the form to create and link this game now.`,
          });
          setShowBrokenChainModal(true);
        }

        if (isMounted) {
          setResolvedGameId(matchedGameId);
          setResolvedMenuItemId(subItemId);
          if (foundCatId) setResolvedCategoryId(foundCatId);
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    checkChainAndResolve();

    return () => {
      isMounted = false;
    };
  }, [categoryId, subItemId, gameId, menuItemResponse, categoriesData, gamesData, isMenuItemLoading, isGamesLoading]);

  const handleClose = () => {
    if (resolvedCategoryId || categoryId) {
      navigate(`/manage-header?tab=${resolvedCategoryId || categoryId}`);
    } else {
      navigate('/game-venue');
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-white min-h-screen flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FB3748] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 text-sm animate-pulse">Checking game & menu details...</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <div className="rotate-90">
            <Chevron size={24} color="currentColor" />
          </div>
        </button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Game' : 'Add Game'}
        </h1>
      </div>

      <div className="bg-[#1C1C1C] rounded-xl border border-[#3A3530] w-full max-w-4xl overflow-hidden mx-auto">
        <GameForm
          gameId={resolvedGameId}
          menuItemId={resolvedMenuItemId}
          categoryIdFromUrl={resolvedCategoryId || categoryId}
          onClose={handleClose}
          onSave={handleClose}
        />
      </div>

      {/* Page-level Broken Link / Chain Warning Popup */}
      {showBrokenChainModal && brokenChainDetails && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-[3px] flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBrokenChainModal(false);
          }}
        >
          <div className="bg-[#1A1A1A] border border-amber-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
            {/* Warning Icon Circle */}
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{brokenChainDetails.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">{brokenChainDetails.message}</p>

            <button
              type="button"
              onClick={() => setShowBrokenChainModal(false)}
              className="w-full py-2.5 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-lg shadow-lg shadow-amber-900/30 transition-all duration-150 cursor-pointer"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameFormPage;
