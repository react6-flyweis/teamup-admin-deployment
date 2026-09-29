import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthBackground from "@/assets/AuthBackground.jpg";
import { LockIcon, EyeIcon, HideEyeIcon } from "@/assets/icons";
import TeamUpLogo from "@/assets/TeamUp2.png";
import {
  useConfirmPasswordResetMutation,
  confirmPasswordResetSchema,
} from "@/hooks/useAuth";
import type { ConfirmPasswordResetSchema } from "@/hooks/useAuth";
import { toast, getApiErrorMessage } from "@/utils/toast";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmPasswordResetSchema>({
    resolver: zodResolver(confirmPasswordResetSchema),
    defaultValues: {
      token: tokenFromUrl,
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (tokenFromUrl) {
      setValue("token", tokenFromUrl);
    }
  }, [tokenFromUrl, setValue]);

  const confirmResetMutation = useConfirmPasswordResetMutation();

  const onSubmit = async (data: ConfirmPasswordResetSchema) => {
    try {
      await confirmResetMutation.mutateAsync({
        token: data.token,
        newPassword: data.newPassword,
      });
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: unknown) {
      const message = getApiErrorMessage(
        err,
        "Failed to reset password. The link or token may be invalid or expired."
      );
      setError("root", {
        type: "server",
        message,
      });
      toast.error(message);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-white overflow-hidden flex">
      {/* Left Side - Form Area - 55% width */}
      <div className="w-[55%] h-full bg-white flex flex-col relative overflow-y-auto">
        {/* Logo Section */}
        <div className="absolute left-8 lg:left-11 top-6 lg:top-10 w-[120px] lg:w-[150px] h-[48px] lg:h-[60.78px]">
          <Link to="/auth/login">
            <img src={TeamUpLogo} alt="Team Up" className="cursor-pointer" />
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-full px-6 lg:px-11 py-12">
          {!isSuccess ? (
            <>
              {/* Title & Subtitle */}
              <h1 className="font-raleway font-extrabold text-[30px] lg:text-[44px] leading-[38px] lg:leading-[52px] text-center text-[#292524] mb-[12px] lg:mb-[16px]">
                Reset Password
              </h1>
              <p className="font-raleway font-medium text-[15px] lg:text-[18px] text-gray-500 text-center max-w-[420px] mb-[28px] lg:mb-[36px]">
                Enter your new password below to regain access to your account.
              </p>

              {/* Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-[400px] lg:max-w-[500px]"
              >
                {/* Server Error Message */}
                {errors.root && (
                  <div className="mb-[20px] p-4 bg-red-50 border border-red-200 rounded-[12px] text-red-600 font-raleway font-semibold text-[14px] lg:text-[16px] text-center">
                    {errors.root.message}
                  </div>
                )}

                {/* Token Input - Shown only if not in URL query */}
                {!tokenFromUrl ? (
                  <div className="relative mb-[20px] lg:mb-[28px]">
                    <div className="w-full h-[65px] lg:h-[80px] bg-[#EAEEED] rounded-[16px] lg:rounded-[20px] flex items-center px-4 lg:px-6 focus-within:border-gray-300 focus-within:border transition-all">
                      <input
                        type="text"
                        placeholder="Reset Token (from email)"
                        {...register("token")}
                        className="flex-1 bg-transparent font-raleway font-medium text-[16px] lg:text-[20px] leading-[22px] lg:leading-[26px] text-black placeholder-[#a4a4a4] placeholder-opacity-40 outline-none"
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.token && (
                      <span className="text-red-500 text-[14px] font-semibold pl-2 block mt-1.5">
                        {errors.token.message}
                      </span>
                    )}
                  </div>
                ) : (
                  <input type="hidden" {...register("token")} />
                )}

                {/* New Password Input */}
                <div className="relative mb-[20px] lg:mb-[28px]">
                  <div className="w-full h-[70px] lg:h-[90px] bg-[#EAEEED] rounded-[16px] lg:rounded-[20px] flex items-center px-4 lg:px-6 focus-within:border-gray-300 focus-within:border transition-all">
                    <LockIcon
                      size={26}
                      className="text-black opacity-30 mr-3 lg:mr-4 lg:w-8 lg:h-8 shrink-0"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password"
                      {...register("newPassword")}
                      className="flex-1 bg-transparent font-raleway font-medium text-[18px] lg:text-[24px] leading-[24px] lg:leading-[31px] text-black placeholder-[#a4a4a4] placeholder-opacity-40 outline-none"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="ml-2 focus:outline-none cursor-pointer"
                      disabled={isSubmitting}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <HideEyeIcon size={24} className="text-black opacity-60" />
                      ) : (
                        <EyeIcon size={24} className="text-black opacity-60" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <span className="text-red-500 text-[14px] font-semibold pl-2 block mt-1.5">
                      {errors.newPassword.message}
                    </span>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="relative mb-[28px] lg:mb-[36px]">
                  <div className="w-full h-[70px] lg:h-[90px] bg-[#EAEEED] rounded-[16px] lg:rounded-[20px] flex items-center px-4 lg:px-6 focus-within:border-gray-300 focus-within:border transition-all">
                    <LockIcon
                      size={26}
                      className="text-black opacity-30 mr-3 lg:mr-4 lg:w-8 lg:h-8 shrink-0"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm New Password"
                      {...register("confirmPassword")}
                      className="flex-1 bg-transparent font-raleway font-medium text-[18px] lg:text-[24px] leading-[24px] lg:leading-[31px] text-black placeholder-[#a4a4a4] placeholder-opacity-40 outline-none"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="ml-2 focus:outline-none cursor-pointer"
                      disabled={isSubmitting}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <HideEyeIcon size={24} className="text-black opacity-60" />
                      ) : (
                        <EyeIcon size={24} className="text-black opacity-60" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-red-500 text-[14px] font-semibold pl-2 block mt-1.5">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mb-[24px] lg:mb-[32px]">
                  <button
                    type="submit"
                    disabled={isSubmitting || confirmResetMutation.isPending}
                    className="w-[280px] lg:w-[333px] h-[60px] lg:h-[79px] bg-[#E1017D] rounded-[30px] lg:rounded-[50.5px] flex items-center justify-center hover:bg-[#B71778] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    <span className="font-raleway font-semibold text-[18px] lg:text-[26px] leading-[24px] lg:leading-[35px] text-white">
                      {isSubmitting || confirmResetMutation.isPending
                        ? "RESETTING..."
                        : "UPDATE PASSWORD"}
                    </span>
                  </button>
                </div>

                {/* Back to Sign In Link */}
                <div className="text-center">
                  <Link
                    to="/auth/login"
                    className="font-raleway font-semibold text-[16px] lg:text-[18px] text-gray-600 hover:text-[#E1017D] transition-colors inline-flex items-center gap-2"
                  >
                    <span>←</span> Back to Sign In
                  </Link>
                </div>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="w-full max-w-[420px] lg:max-w-[480px] text-center flex flex-col items-center">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-emerald-50 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mb-6 text-emerald-600 shadow-sm">
                <svg
                  className="w-10 h-10 lg:w-12 lg:h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="font-raleway font-bold text-[28px] lg:text-[38px] leading-[36px] lg:leading-[46px] text-[#292524] mb-3">
                Password Reset Successfully!
              </h2>

              <p className="font-raleway font-medium text-[15px] lg:text-[18px] text-gray-600 mb-8 leading-relaxed">
                Your password has been securely updated. You can now use your new password to sign in.
              </p>

              <button
                type="button"
                onClick={() => navigate("/auth/login")}
                className="w-[280px] lg:w-[333px] h-[60px] lg:h-[70px] bg-[#E1017D] text-white rounded-[30px] lg:rounded-[35px] font-raleway font-semibold text-[18px] lg:text-[22px] flex items-center justify-center hover:bg-[#B71778] transition-colors shadow-md hover:shadow-lg"
              >
                SIGN IN NOW
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Background Graphic - 45% width */}
      <div className="w-[45%] h-full relative">
        <div
          className="w-full h-full bg-cover bg-center relative"
          style={{ backgroundImage: `url(${AuthBackground})` }}
        >
          {/* Decorative Elements */}
          <div
            className="absolute w-[120px] lg:w-[120px] h-[120px] lg:h-[120px] right-[0] top-[80%] bg-white opacity-20"
            style={{
              clipPath: "polygon(0% 0%, 0% 100%, 100% 100%)",
              transform: "rotate(45deg)",
            }}
          />
          <div className="absolute w-[45px] lg:w-[67px] h-[45px] lg:h-[67px] left-[15%] top-[70%] bg-white opacity-20 rounded-full" />

          {/* Friendly Overlay Content */}
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <h2 className="font-raleway font-bold text-[36px] lg:text-[56px] leading-[44px] lg:leading-[68px] text-white mb-4">
              Almost Done!
            </h2>
            <p className="font-raleway font-medium text-[16px] lg:text-[22px] leading-[24px] lg:leading-[32px] text-white/90 max-w-[360px]">
              Set a strong password to ensure your account remains safe and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
