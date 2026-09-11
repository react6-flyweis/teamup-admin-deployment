import React, { useState, useEffect } from "react";
import {
  useNewsletterSignupStatusQuery,
  useToggleNewsletterSignupMutation,
} from "@/hooks/useNewsletter";
import { useLocationStore } from "@/store/locationStore";
import Toggle from "@/components/common/Toggle";
import MailIcon from "@/assets/icons/MailIcon";

interface NewsletterSignupBannerProps {
  className?: string;
}

export const NewsletterSignupBanner: React.FC<NewsletterSignupBannerProps> = ({
  className = "",
}) => {
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Selected location from store
  const { selectedLocation } = useLocationStore();
  const locationSlug = selectedLocation?.slug;

  // Query and Mutation for newsletter-signup site-content toggle
  const { data: signupStatusData, isLoading: isStatusLoading } =
    useNewsletterSignupStatusQuery(locationSlug);

  const toggleSignupMutation = useToggleNewsletterSignupMutation(locationSlug);

  const isNewsletterActive = signupStatusData?.isActive ?? true;

  // Auto-clear feedback after 5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleToggle = async (checked: boolean) => {
    try {
      await toggleSignupMutation.mutateAsync({
        isActive: checked,
        locationSlug,
      });
      setFeedback({
        message: `Newsletter signup section is now ${checked ? "active" : "disabled"} on the website.`,
        type: "success",
      });
    } catch (err: unknown) {
      const errorMsg =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as Error)?.message ||
        "Failed to update status";
      setFeedback({
        message: `Error updating status: ${errorMsg}`,
        type: "error",
      });
    }
  };

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* Newsletter Signup Visibility Card */}
      <div className="bg-[#1C1819] border border-[#3A3530] rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3 rounded-xl bg-[#2E1F27] border border-[#52253E] text-[#E1017D] shrink-0">
            <MailIcon size={24} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-base font-bold font-poppins text-white">
                Newsletter Signup Section
              </h2>
              {isStatusLoading ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-700/50 text-gray-300 animate-pulse font-montserrat">
                  Checking status...
                </span>
              ) : isNewsletterActive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-montserrat">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active on Website
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 font-montserrat">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  Disabled / Hidden
                </span>
              )}
            </div>
            <p className="text-xs font-montserrat text-gray-400 mt-1">
              Enable or disable the newsletter signup popup / form on the live
              website
              {selectedLocation?.name ? (
                <span className="text-gray-300 font-medium">
                  {" "}
                  for{" "}
                  <span className="text-[#E1017D]">
                    {selectedLocation.name}
                  </span>
                </span>
              ) : (
                " across all locations"
              )}
              .
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-montserrat uppercase tracking-wider text-gray-400">
              Signup Form
            </span>
            <span className="text-xs font-poppins font-medium text-gray-200">
              {toggleSignupMutation.isPending
                ? "Updating..."
                : isNewsletterActive
                  ? "Enabled"
                  : "Disabled"}
            </span>
          </div>
          <div
            className={
              toggleSignupMutation.isPending || isStatusLoading
                ? "opacity-60 pointer-events-none"
                : ""
            }
          >
            <Toggle
              checked={isNewsletterActive}
              onChange={handleToggle}
              activeColor="#10A200"
              inactiveColor="#EC221F"
              activeText="ON"
              inactiveText="OFF"
            />
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-emerald-400 shrink-0"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-red-400 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-white font-bold text-xs p-1 ml-3 cursor-pointer"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsletterSignupBanner;
