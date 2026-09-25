import GameListingManagement from "@/components/Games/GameListManagement";
import GameAttributeIconsManagement from "@/components/Games/GameAttributeIconsManagement";
// import AssignManageGameZone from "@/components/Games/AssignManageGameZone";
// import GameEquipmentStatus from "@/components/Games/GameEquipmentStatus";
// import PeakNonPeakPricing from "@/components/Games/PeakNonPeakPricing";

const Games = () => {
  return (
    <div className="space-y-6">
      <GameListingManagement />
      <GameAttributeIconsManagement />
      {/* <GameEquipmentStatus />
      <PeakNonPeakPricing />
      <AssignManageGameZone /> */}
    </div>
  );
};

export default Games;
