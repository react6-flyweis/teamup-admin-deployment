import React from "react";
import ReviewsTable from "@/components/SocialAndReviews/ReviewsTable";

const SocialReviews: React.FC = () => {
  return (
    <div className="p-6 text-white min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-poppins">Social & Reviews</h1>
          <p className="text-gray-400 text-sm">
            Manage customer reviews, featured spotlights, and visibility.
          </p>
        </div>
      </div>

      {/* Direct Reviews Management (Featured Cards & CRUD Table) */}
      <ReviewsTable />
    </div>
  );
};

export default SocialReviews;
