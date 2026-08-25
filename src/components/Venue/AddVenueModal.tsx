import React, { useState, useEffect } from "react";
import { useCreateLocationMutation, useUpdateLocationMutation, type Location } from "@/hooks/useLocations";
import axios from "axios";

interface AddVenueModalProps {
  open: boolean;
  onClose: () => void;
  venue?: Location | null;
  onSave?: () => void;
}

const AddVenueModal: React.FC<AddVenueModalProps> = ({
  open,
  onClose,
  venue,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("USA");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createLocation = useCreateLocationMutation();
  const updateLocation = useUpdateLocationMutation();

  const isEditing = Boolean(venue && venue._id);
  const isPending = createLocation.isPending || updateLocation.isPending;

  useEffect(() => {
    if (open) {
      if (venue) {
        setName(venue.name || "");
        setCity(venue.city || "");
        setState(venue.state || "");
        setZipCode(venue.zipCode || "");
        setCountry(venue.country || "USA");
        setAddress(venue.address || "");
        setIsActive(venue.isActive !== undefined ? venue.isActive : true);
      } else {
        setName("");
        setCity("");
        setState("");
        setZipCode("");
        setCountry("USA");
        setAddress("");
        setIsActive(true);
      }
      setError(null);
    }
  }, [open, venue]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Location Name is required.");
      return;
    }
    if (!city.trim()) {
      setError("City is required.");
      return;
    }
    if (!state.trim()) {
      setError("State is required.");
      return;
    }
    if (!address.trim()) {
      setError("Address is required.");
      return;
    }

    try {
      if (isEditing && venue?._id) {
        await updateLocation.mutateAsync({
          locationId: venue._id,
          payload: {
            name: name.trim(),
            city: city.trim(),
            state: state.trim(),
            zipCode: zipCode.trim() || undefined,
            country: country.trim() || undefined,
            address: address.trim(),
            isActive,
          },
        });
      } else {
        await createLocation.mutateAsync({
          name: name.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim() || undefined,
          country: country.trim() || undefined,
          address: address.trim(),
          isActive,
        });
      }

      if (onSave) {
        onSave();
      }
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || "Failed to save venue");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#F9D2EA] rounded-2xl p-6 w-[97vw] max-w-[560px] shadow-2xl border border-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-poppins text-black">
            {isEditing ? "Edit Venue" : "Add New Venue"}
          </h2>
          <button
            type="button"
            className="w-7 h-7 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center border border-gray-300 transition-colors"
            onClick={onClose}
            disabled={isPending}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M13 5L5 13M5 5L13 13" stroke="#000" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <hr className="border-gray-400 mb-4" />

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-poppins">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-black mb-1 font-poppins">
                Venue Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-4 border border-[#AEB4C2] rounded-[8px] bg-white font-open-sans text-sm text-[#333] focus:outline-none focus:border-[#E1017D]"
                placeholder="e.g. Eastvale"
                disabled={isPending}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-black mb-1 font-poppins">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-11 px-4 border border-[#AEB4C2] rounded-[8px] bg-white font-open-sans text-sm text-[#333] focus:outline-none focus:border-[#E1017D]"
                placeholder="e.g. 123 Main Street, Eastvale, CA 91752"
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-black mb-1 font-poppins">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 px-4 border border-[#AEB4C2] rounded-[8px] bg-white font-open-sans text-sm text-[#333] focus:outline-none focus:border-[#E1017D]"
                placeholder="e.g. Eastvale"
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-black mb-1 font-poppins">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full h-11 px-4 border border-[#AEB4C2] rounded-[8px] bg-white font-open-sans text-sm text-[#333] focus:outline-none focus:border-[#E1017D]"
                placeholder="e.g. CA"
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-black mb-1 font-poppins">
                Zip Code
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full h-11 px-4 border border-[#AEB4C2] rounded-[8px] bg-white font-open-sans text-sm text-[#333] focus:outline-none focus:border-[#E1017D]"
                placeholder="e.g. 91752"
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-black mb-1 font-poppins">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-11 px-4 border border-[#AEB4C2] rounded-[8px] bg-white font-open-sans text-sm text-[#333] focus:outline-none focus:border-[#E1017D]"
                placeholder="e.g. USA"
                disabled={isPending}
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <label className="text-[13px] font-medium text-black font-poppins">
                Status:
              </label>
              <div
                className="relative rounded-full bg-white cursor-pointer"
                style={{ width: "46px", height: "24px" }}
                onClick={() => !isPending && setIsActive(!isActive)}
              >
                <div
                  className={`absolute w-5 h-5 rounded-full top-1/2 transform -translate-y-1/2 transition-transform ${
                    isActive ? "bg-[#003240] translate-x-[23px]" : "bg-gray-400 translate-x-[3px]"
                  }`}
                />
              </div>
              <span className="font-poppins text-sm text-black font-medium">
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-6 py-2 border border-[#7E0B0B] rounded-lg text-[#7E0B0B] text-base font-poppins font-semibold bg-white hover:bg-[#ffebf5] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 rounded-lg bg-[#E1017D] hover:bg-[#CA0E70] text-white text-base font-poppins font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isPending ? "Saving..." : isEditing ? "Update Venue" : "Add Venue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVenueModal;
