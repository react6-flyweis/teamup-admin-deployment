import React, { useState, useEffect, useMemo } from "react";
import Toggle from "@/components/common/Toggle";
import Pagination from "@/utils/Pagination";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import { useGameEquipmentQuery, type GameEquipmentLane } from "@/hooks/useGameEquipment";

const PAGE_SIZE = 8;

const columns = [
  { key: "gameName", label: "Game Name", className: "w-[22%]" },
  { key: "status", label: "Status", className: "w-[13%]" },
  { key: "lastMaintenance", label: "Last Maintenance", className: "w-[17%]" },
  {
    key: "nextInspectionDue",
    label: "Next Inspection Due",
    className: "w-[18%]",
  },
  { key: "issue", label: "Issue", className: "w-[19%]" },
  { key: "action", label: "Action", className: "w-[11%] text-center" },
];

const SUB_ROW_HEIGHT = 48;

export default function GameEquipmentStatus() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useGameEquipmentQuery();
  const equipmentList = useMemo(() => data?.equipment || [], [data?.equipment]);

  const [lanesState, setLanesState] = useState<Record<string, GameEquipmentLane[]>>({});

  useEffect(() => {
    if (equipmentList.length > 0) {
      setLanesState(
        Object.fromEntries(
          equipmentList.map((g, index) => [
            g.gameId || g.gameObjectId || String(index),
            (g.lanes || []).map((lane) => ({ ...lane })),
          ])
        )
      );
    }
  }, [equipmentList]);

  const totalPages = Math.max(1, Math.ceil(equipmentList.length / PAGE_SIZE));
  const paginatedGames = equipmentList.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  function handleToggle(gameKey: string, laneIdx: number) {
    setLanesState((prev) => {
      const currentLanes = prev[gameKey] ? [...prev[gameKey]] : [];
      if (!currentLanes[laneIdx]) return prev;
      currentLanes[laneIdx] = {
        ...currentLanes[laneIdx],
        isIssueActive: !currentLanes[laneIdx].isIssueActive,
      };
      return { ...prev, [gameKey]: currentLanes };
    });
  }

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-white mb-5">
        Game Equipment Status
      </h2>
      <div className="rounded-xl overflow-hidden bg-transparent shadow-lg">
        {isLoading ? (
          <div className="p-8 text-center text-white/80 bg-[#1e1e2e]/50 rounded-xl">
            Loading equipment status...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-400 bg-[#1e1e2e]/50 rounded-xl">
            Failed to load game equipment status: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        ) : (
          <table
            className="w-full text-center border-separate"
            style={{ borderSpacing: 0 }}
          >
            <thead>
              <tr className="bg-[#FFD0F8]">
                {columns.map((col, i) => (
                  <th
                    key={col.key}
                    className={`py-4 px-2 font-bold text-[15px] text-black ${
                      col.className || ""
                    }`}
                    style={{
                      borderTopLeftRadius: i === 0 ? 12 : 0,
                      borderTopRightRadius: i === columns.length - 1 ? 12 : 0,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedGames.length === 0 ? (
                <tr className="bg-[#FFF0F8]">
                  <td colSpan={6} className="py-6 text-center text-gray-500 font-medium">
                    No equipment data found.
                  </td>
                </tr>
              ) : (
                paginatedGames.map((game, idx) => {
                  const gameKey = game.gameId || game.gameObjectId || String(idx);
                  const globalIdx = (page - 1) * PAGE_SIZE + idx;
                  const isOpen = expandedIdx === globalIdx;
                  const lanes = lanesState[gameKey] || game.lanes || [];
                  const isOdd = idx % 2 === 0;

                  return (
                    <React.Fragment key={gameKey}>
                      {/* Main game row */}
                      <tr
                        className={`
                          ${isOdd ? "bg-[#FFF0F8]" : "bg-[#FFFBFD]"}
                          hover:bg-[#f3e2f6] hover:shadow-sm transition-all duration-200 ease-in-out cursor-pointer
                        `}
                      >
                        <td className="py-4 px-2 font-bold">
                          {game.gameName || "N/A"}
                        </td>
                        <td className="py-4 px-2">{game.status || "N/A"}</td>
                        <td className="py-4 px-2">{game.lastMaintenance || "N/A"}</td>
                        <td className="py-4 px-2">{game.nextInspectionDue || game.nextInspection || "N/A"}</td>
                        <td className="py-4 px-2">{game.issue || "N/A"}</td>
                        <td className="py-2 px-2 text-center">
                          {lanes.length > 0 ? (
                            <button
                              onClick={() =>
                                setExpandedIdx(isOpen ? null : globalIdx)
                              }
                              className="transition-transform duration-200 inline-flex items-center"
                              aria-label={
                                isOpen ? "Collapse details" : "Expand details"
                              }
                            >
                              <span
                                className={
                                  isOpen ? "rotate-180 transition-transform" : ""
                                }
                              >
                                <ChevronDownIcon className="inline-block text-lg cursor-pointer" color="#000" />
                              </span>
                            </button>
                          ) : (
                            <ChevronDownIcon className="inline-block opacity-30 text-lg cursor-auto" color="#6b6a6a" />
                          )}
                        </td>
                      </tr>

                      {/* Expandable subtable */}
                      <tr style={{ background: "#FFD0F8" }}>
                        <td
                          colSpan={6}
                          style={{
                            padding: 0,
                            border: 0,
                            transition: "all 0.4s cubic-bezier(.68,-0.55,.27,1.55)",
                            height:
                              isOpen && lanes.length
                                ? lanes.length * SUB_ROW_HEIGHT
                                : 0,
                            borderBottomLeftRadius: !isOpen
                              ? idx === paginatedGames.length - 1
                                ? 12
                                : 0
                              : 0,
                            borderBottomRightRadius: !isOpen
                              ? idx === paginatedGames.length - 1
                                ? 12
                                : 0
                              : 0,
                          }}
                        >
                          <div
                            style={{
                              overflow: "hidden",
                              maxHeight:
                                isOpen && lanes.length
                                  ? lanes.length * SUB_ROW_HEIGHT
                                  : 0,
                              transition:
                                "max-height 0.5s cubic-bezier(.68,-0.55,.27,1.55)",
                              background: "#FFD0F8",
                            }}
                            className="w-full"
                          >
                            {isOpen && lanes.length > 0 && (
                              <table className="w-full">
                                <tbody>
                                  {lanes.map((lane, laneIdx) => (
                                    <tr
                                      className="text-sm"
                                      key={lane.id || lane.name || laneIdx}
                                      style={{ height: SUB_ROW_HEIGHT }}
                                    >
                                      <td className="pl-12 py-2 font-medium w-[22%]">
                                        {lane.name}
                                      </td>
                                      <td className="w-[13%]">{lane.status || "N/A"}</td>
                                      <td className="w-[17%]">
                                        {lane.lastMaintenance || "N/A"}
                                      </td>
                                      <td className="w-[18%]">
                                        {lane.nextInspectionDue || lane.nextInspection || "N/A"}
                                      </td>
                                      <td className="w-[19%]">
                                        <div className="text-center">
                                          {lane.issue || "N/A"}
                                        </div>
                                      </td>
                                      <td className="w-[11%]">
                                        {lane.issue !== "N/A" &&
                                          lane.issue !== "" && (
                                            <Toggle
                                              checked={!!lane.isIssueActive}
                                              onChange={() =>
                                                handleToggle(gameKey, laneIdx)
                                              }
                                              activeText=""
                                              inactiveText=""
                                            />
                                          )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        )}
        {!isLoading && !isError && equipmentList.length > 0 && (
          <div className="pt-3 flex justify-end items-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </section>
  );
}

