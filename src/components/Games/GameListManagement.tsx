import { useState, useEffect } from "react";
import HorizontalDotsIcon from "@/assets/icons/HorizontalDotsIcon";
import ActionModal from "./modals/ActionModal";
import GameModal, { type GameData } from "./modals/GameModal";
import { useGamesQuery } from "@/hooks/useGames";

interface Game {
  id: string;
  gameName: string;
  totalPeoplePerLane: string;
  totalLanes: string;
  timeMin: string;
  pricePerPerson: string;
  minAge: string;
  wheelchairAccess: string;
}

const columns = [
  { key: "gameName", label: "Game Name" },
  { key: "totalPeoplePerLane", label: "Total People Per Lane" },
  { key: "totalLanes", label: "Total Lanes" },
  { key: "timeMin", label: "Time (Min)" },
  { key: "pricePerPerson", label: "Price (Per Person)" },
  { key: "minAge", label: "Min. Age (ID Req)" },
  { key: "wheelchairAccess", label: "Wheelchair Access" },
  { key: "action", label: "Action" },
];

export default function GameListingManagement() {
  const [showActionModal, setShowActionModal] = useState<number | null>(null);
  const { data: gamesData, isLoading, error } = useGamesQuery();
  const [games, setGames] = useState<Game[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    if (gamesData?.games) {
      const mappedGames: Game[] = gamesData.games.map((g) => {
        const minAgeStr = g.minimumAgeRequirement
          ? g.idRequired
            ? `${g.minimumAgeRequirement} (ID Req)`
            : g.minimumAgeRequirement
          : "-";

        const price = g.pricePerPerson ?? g.priceFrom;

        return {
          id: g._id,
          gameName: g.name || g.gameName || "-",
          totalPeoplePerLane: g.peopleAllowedPerLane != null ? String(g.peopleAllowedPerLane) : "-",
          totalLanes: g.totalLanes != null ? String(g.totalLanes) : "-",
          timeMin: g.timeOption || g.duration || "-",
          pricePerPerson: typeof price === "number" ? `$${price}` : price ? `$${price}` : "-",
          minAge: minAgeStr,
          wheelchairAccess: g.wheelchairAccessible ? "Yes" : "No",
        };
      });
      setGames(mappedGames);
    }
  }, [gamesData]);

  const handleAddGame = () => {
    setSelectedGame(null);
    setModalMode("add");
    setShowModal(true);
  };

  const handleEditGame = (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    if (game) {
      setSelectedGame(game);
      setModalMode("edit");
      setShowModal(true);
    }
    setShowActionModal(null);
  };

  const handleDeleteGame = (gameId: string) => {
    setGames(games.filter((game) => game.id !== gameId));
    setShowActionModal(null);
  };

  const handleSaveGame = (gameData: GameData) => {
    if (modalMode === "edit" && selectedGame) {
      setGames(
        games.map((game) =>
          game.id === selectedGame.id
            ? {
              ...game,
              gameName: gameData.gameName,
              totalPeoplePerLane: gameData.peopleAllowedPerLane,
              totalLanes: gameData.totalLanes,
              timeMin: gameData.timeOption,
              pricePerPerson: gameData.pricePerPerson,
              minAge: gameData.idRequired
                ? `${gameData.minimumAgeRequirement} (ID Req)`
                : gameData.minimumAgeRequirement,
              wheelchairAccess: gameData.wheelchairAccessible ? "Yes" : "-",
            }
            : game
        )
      );
    }
    setShowModal(false);
    setSelectedGame(null);
  };

  return (
    <section className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white font-poppins">
          Game Listing Management
        </h2>
        <button
          onClick={handleAddGame}
          className="bg-[#E1017D] hover:bg-[#c5016b] text-white px-6 py-2 rounded-lg font-montserrat font-medium text-[14px] transition-colors duration-200"
        >
          Add Game
        </button>
      </div>
      <div className="rounded-[10px] shadow-lg" style={{ overflow: "visible" }}>
        <table
          className="w-full text-center border-separate"
          style={{ borderSpacing: 0 }}
        >
          <thead>
            <tr className="bg-[#F9D2EA]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="py-4 px-2 font-bold text-[14px] text-black font-montserrat"
                  style={{
                    borderTopLeftRadius: col.key === columns[0].key ? 8 : 0,
                    borderTopRightRadius:
                      col.key === columns[columns.length - 1].key ? 8 : 0,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-gray-500 font-montserrat">
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#E1017D]"></div>
                    Loading games...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-red-500 font-montserrat">
                  Failed to load games. Please try again later.
                </td>
              </tr>
            ) : games.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-gray-400 font-montserrat">
                  No games found.
                </td>
              </tr>
            ) : (
              games.map((game, idx) => {
                const isLastRows = idx >= games.length - 3;
                return (
                  <tr
                    key={game.id}
                    className={`
                      ${idx % 2 === 0 ? "bg-[#FDECF6]" : "bg-[#FFFBFD]"}
                      hover:bg-[#f3e2f6] hover:shadow-sm   transition-all duration-200 ease-in-out cursor-pointer
                    `}
                  >
                    <td className="py-4 px-2 font-montserrat font-medium text-[14px] text-center">
                      {game.gameName}
                    </td>
                    <td className="py-4 px-2 font-montserrat font-medium text-[14px]">
                      {game.totalPeoplePerLane}
                    </td>
                    <td className="py-4 px-2 font-montserrat font-medium text-[14px]">
                      {game.totalLanes}
                    </td>
                    <td className="py-4 px-2 font-montserrat font-medium text-[14px]">
                      {game.timeMin}
                    </td>
                    <td className="py-4 px-2 font-montserrat font-medium text-[14px]">
                      {game.pricePerPerson}
                    </td>
                    <td className="py-4 px-2 font-montserrat font-medium text-[14px]">
                      {game.minAge}
                    </td>
                    <td className="py-4 px-2 font-montserrat font-medium text-[14px]">
                      {game.wheelchairAccess}
                    </td>
                    <td className="relative py-4 px-2 pr-6 font-montserrat font-medium text-[14px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionModal(idx);
                        }}
                        className="text-gray-600 hover:text-[#E1017D] transition-colors duration-200"
                      >
                        <HorizontalDotsIcon />
                      </button>
                      {showActionModal === idx && (
                        <ActionModal
                          onClose={() => setShowActionModal(null)}
                          onEdit={() => handleEditGame(game.id)}
                          onDelete={() => handleDeleteGame(game.id)}
                          style={
                            isLastRows
                              ? {
                                bottom: "100%",
                                top: "auto",
                                marginBottom: "8px",
                              }
                              : { top: "100%", bottom: "auto", marginTop: "8px" }
                          }
                          direction={isLastRows ? "up" : "down"}
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <GameModal
          mode={modalMode}
          gameIdOrSlug={selectedGame?.id}
          onClose={() => {
            setShowModal(false);
            setSelectedGame(null);
          }}
          onSave={handleSaveGame}
        />
      )}
    </section>
  );
}
