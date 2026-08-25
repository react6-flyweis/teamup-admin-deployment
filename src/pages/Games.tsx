import AssignManageGameZone from "@/components/Games/AssignManageGameZone";
// import GameEquipmentStatus from "@/components/Games/GameEquipmentStatus";
import GameListingManagement from "@/components/Games/GameListManagement";
import PeakNonPeakPricing from "@/components/Games/PeakNonPeakPricing";

const Games = () => {
  return (
    <div>
      <GameListingManagement />
      {/* <GameEquipmentStatus/> */}
      <PeakNonPeakPricing />
      <AssignManageGameZone />
    </div>
  );
};

export default Games;
