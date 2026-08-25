import { useState, useMemo } from "react";
import HorizontalDotsIcon from "@/assets/icons/HorizontalDotsIcon";
import ActionModal from "./modals/ActionModal";
import GameModal from "./modals/GameModal";
import { useGamesQuery, useDeleteGameMutation } from "@/hooks/useGames";

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
  const deleteGameMutation = useDeleteGameMutation();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const games: Game[] = useMemo(() => {
    if (!gamesData?.games) return [];
    return gamesData.games.map((g) => {
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
  }, [gamesData]);

  const handleAddGame = () => {
    setSelectedGameId(null);
    setModalMode("add");
    setShowModal(true);
  };

  const handleEditGame = (gameId: string) => {
    setSelectedGameId(gameId);
    setModalMode("edit");
    setShowModal(true);
    setShowActionModal(null);
  };

  const handleDeleteGame = (gameId: string) => {
    deleteGameMutation.mutate(gameId);
    setShowActionModal(null);
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
          key={selectedGameId || "new-game"}
          mode={modalMode}
          gameIdOrSlug={selectedGameId || undefined}
          onClose={() => {
            setShowModal(false);
            setSelectedGameId(null);
          }}
        />
      )}
    </section>
  );
}
