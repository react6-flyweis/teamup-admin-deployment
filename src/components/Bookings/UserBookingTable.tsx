import { useState, useMemo } from "react";
import Pagination from "@/utils/Pagination";
import StatusDropdown, { type BookingStatus } from "../common/StatusDropdown";
import { useBookingsQuery } from "@/hooks/useBookings";

interface Booking {
  id: string;
  userName: string;
  bookingDate: string;
  timeSlot: string;
  status: BookingStatus;
  amount: number;
}

const ROWS_PER_PAGE = 10;

const columns = [
  { key: "id", label: "Booking ID" },
  { key: "userName", label: "User Name" },
  { key: "bookingDate", label: "Booking Date" },
  { key: "timeSlot", label: "Time Slot" },
  { key: "status", label: "Status" },
  { key: "amount", label: "Amount Paid" },
];

export default function UserBookingTable() {
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>("All");

  const { data: apiData, isLoading, isError, error } = useBookingsQuery({
    page,
    limit: ROWS_PER_PAGE,
    status: selectedStatus !== "All" ? selectedStatus : undefined,
  });

  const handleStatusChange = (newStatus: BookingStatus) => {
    setSelectedStatus(newStatus);
    setPage(1);
  };

  const bookings: Booking[] = useMemo(() => {
    if (apiData?.bookings && Array.isArray(apiData.bookings)) {
      return apiData.bookings.map((b) => ({
        id: b.id || b._id || "#ID",
        userName: b.userName || b.customer?.name || "Guest",
        bookingDate: b.bookingDate || (b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "-"),
        timeSlot: b.timeSlot || "-",
        status: (b.status === "Confirm" || b.status === "Pending" || b.status === "Cancelled" ? b.status : "Pending") as BookingStatus,
        amount: b.amount || b.totalPrice || 0,
      }));
    }
    return [];
  }, [apiData]);

  const totalPages = apiData?.pagination?.totalPages || Math.max(1, Math.ceil(bookings.length / ROWS_PER_PAGE));

  return (
    <section className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white font-poppins">
          Users Booking & Status
        </h2>
        <StatusDropdown
          currentStatus={selectedStatus}
          onChange={handleStatusChange}
        />
      </div>

      <div className="rounded-[10px] overflow-hidden shadow-lg">
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
                <td colSpan={columns.length} className="py-8 text-center text-gray-500 font-montserrat bg-[#FFFBFD]">
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#E1017D]"></div>
                    Loading bookings...
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-red-500 font-montserrat bg-[#FFFBFD]">
                  Failed to load bookings: {error instanceof Error ? error.message : "Unknown error"}
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-gray-400 font-montserrat bg-[#FFFBFD]">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking, idx) => (
                <tr
                  key={`${booking.id}-${idx}`}
                  className={`${
                    idx % 2 === 0 ? "bg-[#FDECF6]" : "bg-[#FFFBFD]"
                  } hover:bg-[#f3e2f6] transition-all duration-200 ease-in-out cursor-pointer`}
                >
                  <td className="py-4 px-2 font-montserrat font-medium text-[14px]">
                    {booking.id}
                  </td>
                  <td className="py-4 px-2 font-montserrat font-medium text-[14px]">
                    {booking.userName}
                  </td>
                  <td className="py-4 px-2 font-montserrat font-medium text-[14px]">
                    {booking.bookingDate}
                  </td>
                  <td className="py-4 px-2 font-montserrat font-medium text-[14px]">
                    {booking.timeSlot}
                  </td>
                  <td className="py-4 px-2 font-montserrat font-medium text-[14px]">
                    <div
                      className={`inline-block px-3 py-1 rounded-full ${
                        booking.status === "Confirm"
                          ? "bg-[#14AE5C]"
                          : booking.status === "Pending"
                          ? "bg-[#E8B931]"
                          : "bg-[#EC221F]"
                      } text-white`}
                    >
                      {booking.status}
                    </div>
                  </td>
                  <td className="py-4 px-2 font-montserrat font-medium text-[14px]">
                    ${booking.amount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!isLoading && !isError && bookings.length > 0 && (
          <div className="flex items-center justify-end py-4 px-4 bg-transparent">
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
