import React, { useState, useEffect } from "react";
import { CustomerQueriesAndFeedback } from "@/components/SocialAndReviews/CustomerQueriesAndFeedback";
import PositiveReviewsTable from "@/components/SocialAndReviews/PositiveReviews";
import ReviewAndRating from "@/components/SocialAndReviews/ReviewAndRatings";
import {
  useSocialReviewsQuery,
  useUpdateSocialReviewsMutation,
  type SocialReviewsData
} from "@/hooks/useSocialReviews";
import { useLocationStore } from "@/store/locationStore";

const SocialReviews: React.FC = () => {
  const { selectedLocation } = useLocationStore();
  const locationSlug = selectedLocation?.slug;

  const { data, isLoading, error } = useSocialReviewsQuery(locationSlug);
  const updateMutation = useUpdateSocialReviewsMutation(locationSlug);

  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);



  const handleUpdateSection = async <K extends keyof SocialReviewsData>(
    sectionKey: K,
    sectionData: SocialReviewsData[K]
  ) => {
    try {
      const currentData = data?.content?.data || {};
      const updatedData: SocialReviewsData = {
        ...currentData,
        [sectionKey]: sectionData
      };

      await updateMutation.mutateAsync({
        data: updatedData,
        isActive: true
      });
      setFeedback({ message: `Successfully updated ${sectionKey}!`, type: "success" });
    } catch (err) {
      console.error("Failed to update section:", err);
      setFeedback({ message: `Failed to update ${sectionKey}.`, type: "error" });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-white min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E1017D]"></div>
      </div>
    );
  }

  // Handle case where content is missing or API returns error / no content
  const hasContent = data && data.content && data.content.data;

  if (error || !hasContent) {
    return (
      <div className="p-6 text-white min-h-screen">
        <div className="mb-6 p-6 bg-[#1A1A1A] border border-[#3A3530] rounded-xl flex flex-col items-center gap-4 text-center">
          <span className="text-xl font-bold font-poppins">Social & Reviews content is not initialized.</span>
          <p className="text-gray-400 max-w-md text-sm">
            No data is currently available. Please check the backend service.
          </p>
        </div>
      </div>
    );
  }

  const reviewsDashboard = data?.content?.data?.reviewsDashboard;
  const positiveReviews = data?.content?.data?.positiveReviews;
  const customerFeedback = data?.content?.data?.customerFeedback;

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-poppins">Social & Reviews</h1>
          <p className="text-gray-400 text-sm">Manage user reviews, ratings, and customer queries.</p>
        </div>
      </div>

      {updateMutation.isPending && (
        <div className="mb-6 p-4 rounded-lg border border-[#3A3530] bg-[#1A1A1A] text-sm flex justify-between items-center text-gray-300">
          <span className="flex items-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E1017D]"></span>
            Saving changes...
          </span>
        </div>
      )}

      {feedback && !updateMutation.isPending && (
        <div
          className={`mb-6 p-4 rounded-lg border text-sm flex justify-between items-center ${feedback.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-white ml-4 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {reviewsDashboard && (
        <ReviewAndRating
          reviewsDashboard={reviewsDashboard}
          onUpdate={(updated) => handleUpdateSection("reviewsDashboard", updated)}
          isUpdating={updateMutation.isPending}
        />
      )}

      {positiveReviews && (
        <PositiveReviewsTable
          positiveReviews={positiveReviews}
          onUpdate={(updated) => handleUpdateSection("positiveReviews", updated)}
          isUpdating={updateMutation.isPending}
        />
      )}

      {customerFeedback && (
        <CustomerQueriesAndFeedback
          customerFeedback={customerFeedback}
          onUpdate={(updated) => handleUpdateSection("customerFeedback", updated)}
          isUpdating={updateMutation.isPending}
        />
      )}
    </div>
  );
};

export default SocialReviews;

