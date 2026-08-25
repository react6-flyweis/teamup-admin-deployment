import React, { useState } from "react";
import EditIcon from "@/assets/icons/EditIcon";
import TrashIcon from "@/assets/icons/TrashIcon";
import AddVenueModal from "@/components/Venue/AddVenueModal";
import { ConfirmDeleteModal } from "@/components/common/ConfirmDeleteModal";
import { useLocationsQuery, useDeleteLocationMutation, type Location } from "@/hooks/useLocations";

const LocationVenues: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Location | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<Location | null>(null);

  const { data, isLoading, isError, refetch } = useLocationsQuery();
  const deleteMutation = useDeleteLocationMutation();

  const handleAddNew = () => {
    setEditingVenue(null);
    setModalOpen(true);
  };

  const handleEdit = (venue: Location) => {
    setEditingVenue(venue);
    setModalOpen(true);
  };

  const handleDeleteClick = (venue: Location) => {
    setVenueToDelete(venue);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!venueToDelete?._id) return;
    try {
      await deleteMutation.mutateAsync(venueToDelete._id);
      setDeleteModalOpen(false);
      setVenueToDelete(null);
    } catch (error) {
      console.error("Failed to delete location:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#E1017D] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-base font-poppins">Loading locations...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center py-16 gap-4">
        <div className="text-red-400 text-lg font-poppins">Failed to load locations.</div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-[#E1017D] text-white rounded-lg font-poppins font-medium text-sm hover:bg-[#CA0E70] transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const locations = data?.locations || [];

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="text-white font-bold text-2xl font-poppins">
          All Location or Specific Venues
        </h2>
        <button
          className="bg-[#E1017D] hover:bg-[#CA0E70] text-white px-6 py-2.5 rounded-lg font-poppins font-semibold text-[16px] transition cursor-pointer shadow-md shadow-[#E1017D]/20 flex items-center justify-center gap-2"
          onClick={handleAddNew}
        >
          <span>+</span>
          <span>Add New Venue</span>
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="bg-[#1C1C1C] border border-[#3A3530] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#2A2A2A] flex items-center justify-center mb-4 text-[#777]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <h3 className="text-white font-poppins font-semibold text-lg mb-2">No Venues Found</h3>
          <p className="text-[#888] font-poppins text-sm mb-6 max-w-sm">
            Get started by adding your first venue location.
          </p>
          <button
            onClick={handleAddNew}
            className="bg-[#E1017D] hover:bg-[#CA0E70] text-white px-5 py-2 rounded-lg font-poppins font-medium text-sm transition"
          >
            Add New Venue
          </button>
        </div>
      ) : (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {locations.map((venue) => (
              <div
                key={venue._id}
                className="bg-[#F9D2EA] rounded-[16px] flex flex-col justify-between px-5 py-5 w-full min-h-[250px] relative border border-white/60 shadow-md hover:shadow-lg transition-shadow"
              >
                <div>
                  <div className="flex flex-row items-start justify-between mb-3">
                    <div>
                      <div className="mb-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-poppins font-semibold tracking-wide ${
                            venue.isActive !== false
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {venue.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="font-poppins font-bold text-[18px] text-black leading-tight">
                        {venue.name}
                      </div>
                    </div>
                    <div className="flex flex-row gap-2">
                      <button
                        onClick={() => handleEdit(venue)}
                        title="Edit Venue"
                        className="w-[37px] h-[37px] bg-white border border-[#CED4DA] hover:border-[#E1017D] hover:text-[#E1017D] rounded-md flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <EditIcon size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(venue)}
                        title="Delete Venue"
                        className="w-[37px] h-[37px] bg-white border border-[#CED4DA] hover:border-red-500 hover:text-red-500 rounded-md flex items-center justify-center transition-colors cursor-pointer text-gray-700"
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mt-2">
                    <div className="flex flex-row justify-between items-start text-sm">
                      <span className="font-poppins text-[#555]">City:</span>
                      <span className="font-poppins font-medium text-black text-right">
                        {venue.city || "-"}
                      </span>
                    </div>
                    <div className="flex flex-row justify-between items-start text-sm">
                      <span className="font-poppins text-[#555]">Zip Code:</span>
                      <span className="font-poppins font-medium text-black text-right">
                        {venue.zipCode || "-"}
                      </span>
                    </div>
                    <div className="flex flex-row justify-between items-start text-sm">
                      <span className="font-poppins text-[#555]">State:</span>
                      <span className="font-poppins font-medium text-black text-right">
                        {venue.state || "-"}
                      </span>
                    </div>
                    <div className="flex flex-row justify-between items-start text-sm">
                      <span className="font-poppins text-[#555]">Country:</span>
                      <span className="font-poppins font-medium text-black text-right">
                        {venue.country || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {venue.address && (
                  <div className="pt-2 mt-2 border-t border-[#ebafcf] flex items-start justify-between text-xs">
                    <span className="font-poppins text-[#666] shrink-0 mr-2">Address:</span>
                    <span
                      className="font-poppins font-medium text-black text-right line-clamp-2"
                      title={venue.address}
                    >
                      {venue.address}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Venue Modal */}
      <AddVenueModal
        open={modalOpen}
        venue={editingVenue}
        onClose={() => {
          setModalOpen(false);
          setEditingVenue(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Delete Venue"
        message="Are you sure you want to delete this venue? This action cannot be undone."
        itemName={venueToDelete?.name}
        isDeleting={deleteMutation.isPending}
        onCancel={() => {
          setDeleteModalOpen(false);
          setVenueToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default LocationVenues;
