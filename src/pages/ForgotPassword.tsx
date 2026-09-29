import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthBackground from "@/assets/AuthBackground.jpg";
import { MailIcon } from "@/assets/icons";
import TeamUpLogo from "@/assets/TeamUp2.png";
import { useForgotPasswordMutation, forgotPasswordSchema } from "@/hooks/useAuth";
import type { ForgotPasswordSchema } from "@/hooks/useAuth";
import { toast, getApiErrorMessage } from "@/utils/toast";

const ForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useForgotPasswordMutation();

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success("Password reset instructions sent to your email!");
    } catch (err: unknown) {
      const message = getApiErrorMessage(
        err,
        "Failed to send password reset email. Please try again."
      );
      setError("root", {
        type: "server",
        message,
      });
      toast.error(message);
    }
  };

  const handleResend = async () => {
    if (!submittedEmail) return;
    try {
      await forgotPasswordMutation.mutateAsync({ email: submittedEmail });
      toast.success("Password reset email resent successfully!");
    } catch (err: unknown) {
      const message = getApiErrorMessage(
        err,
        "Failed to resend reset email. Please try again."
      );
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
          {!isSubmitted ? (
            <>
              {/* Title & Subtitle */}
              <h1 className="font-raleway font-extrabold text-[30px] lg:text-[44px] leading-[38px] lg:leading-[52px] text-center text-[#292524] mb-[12px] lg:mb-[16px]">
                Forgot Password
              </h1>
              <p className="font-raleway font-medium text-[15px] lg:text-[18px] text-gray-500 text-center max-w-[420px] mb-[28px] lg:mb-[36px]">
                Enter the email associated with your account and we will send you a link to reset your password.
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

                {/* Email Input */}
                <div className="relative mb-[20px] lg:mb-[31px]">
                  <div className="w-full h-[70px] lg:h-[90px] bg-[#EAEEED] rounded-[16px] lg:rounded-[20px] flex items-center px-4 lg:px-6 focus-within:border-gray-300 focus-within:border transition-all">
                    <MailIcon
                      size={28}
                      className="text-black opacity-30 mr-3 lg:mr-4 lg:w-9 lg:h-9 shrink-0"
                    />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      {...register("email")}
                      className="flex-1 bg-transparent font-raleway font-medium text-[18px] lg:text-[24px] leading-[24px] lg:leading-[31px] text-black placeholder-[#a4a4a4] placeholder-opacity-40 outline-none"
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>
                  {errors.email && (
                    <span className="text-red-500 text-[14px] font-semibold pl-2 block mt-2">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mb-[24px] lg:mb-[32px]">
                  <button
                    type="submit"
                    disabled={isSubmitting || forgotPasswordMutation.isPending}
                    className="w-[280px] lg:w-[333px] h-[60px] lg:h-[79px] bg-[#E1017D] rounded-[30px] lg:rounded-[50.5px] flex items-center justify-center hover:bg-[#B71778] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    <span className="font-raleway font-semibold text-[18px] lg:text-[26px] leading-[24px] lg:leading-[35px] text-white">
                      {isSubmitting || forgotPasswordMutation.isPending
                        ? "SENDING..."
                        : "SEND RESET LINK"}
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
            /* Success Confirmation State */
            <div className="w-full max-w-[420px] lg:max-w-[480px] text-center flex flex-col items-center">
              {/* Success Badge */}
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-pink-50 border-2 border-[#E1017D]/30 rounded-full flex items-center justify-center mb-6 text-[#E1017D] shadow-sm">
                <MailIcon size={44} className="text-[#E1017D]" />
              </div>

              <h2 className="font-raleway font-bold text-[28px] lg:text-[38px] leading-[36px] lg:leading-[46px] text-[#292524] mb-3">
                Check Your Email
              </h2>

              <p className="font-raleway font-medium text-[15px] lg:text-[18px] text-gray-600 mb-6 leading-relaxed">
                We have sent password reset instructions to:
                <br />
                <span className="font-bold text-[#292524] text-[16px] lg:text-[19px] break-all">
                  {submittedEmail}
                </span>
              </p>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-[16px] text-gray-500 font-raleway text-[13px] lg:text-[14px] leading-relaxed mb-8 w-full text-left">
                <p className="font-semibold text-gray-700 mb-1">Didn&apos;t get the email?</p>
                <p>
                  Check your spam/junk folder. If you still don&apos;t see it, click below to resend.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={forgotPasswordMutation.isPending}
                  className="px-6 h-[50px] lg:h-[58px] border-2 border-[#E1017D] text-[#E1017D] rounded-[25px] font-raleway font-semibold text-[15px] lg:text-[17px] hover:bg-[#E1017D] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {forgotPasswordMutation.isPending ? "RESENDING..." : "RESEND EMAIL"}
                </button>
                <Link
                  to="/auth/login"
                  className="px-6 h-[50px] lg:h-[58px] bg-[#E1017D] text-white rounded-[25px] font-raleway font-semibold text-[15px] lg:text-[17px] flex items-center justify-center hover:bg-[#B71778] transition-colors"
                >
                  BACK TO SIGN IN
                </Link>
              </div>
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
              Need Help?
            </h2>
            <p className="font-raleway font-medium text-[16px] lg:text-[22px] leading-[24px] lg:leading-[32px] text-white/90 max-w-[360px]">
              Don&apos;t worry, reset your password quickly and securely to get back into your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
