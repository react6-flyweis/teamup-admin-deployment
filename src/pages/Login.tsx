import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthBackground from "@/assets/AuthBackground.jpg";
import { MailIcon, LockIcon, EyeIcon, HideEyeIcon } from "@/assets/icons";
import TeamUpLogo from "@/assets/TeamUp2.png";
import { useLoginMutation, loginSchema } from "@/hooks/useAuth";
import type { LoginSchema } from "@/hooks/useAuth";

const Login: React.FC = () => {
  // const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLoginMutation();

  const onSubmit = async (data: LoginSchema) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const message =
        errorObj.response?.data?.message ||
        "Invalid credentials or server error. Please try again.";
      setError("root", {
        type: "server",
        message,
      });
    }
  };

  // const handleSignUp = () => {
  //   navigate("/auth/register");
  // };

  return (
    <div className="relative w-screen h-screen bg-white overflow-hidden flex">
      {/* Left Side - Sign In Form - 55% width */}
      <div className="w-[55%] h-full bg-white flex flex-col relative">
        {/* Logo Section */}
        <div className="absolute left-8 lg:left-11 top-6 lg:top-10 w-[120px] lg:w-[150px] h-[48px] lg:h-[60.78px]">
          {/* TeamUp Logo - Recreated from Figma */}
          <img src={TeamUpLogo} alt="Team Up" />
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center h-full px-6 lg:px-11">
          {/* Title */}
          <h1 className="font-raleway font-extrabold text-[32px] lg:text-[48px] leading-[40px] lg:leading-[56px] text-center text-[#292524] mb-[20px] lg:mb-[30px]">
            Sign in to Team-Up
          </h1>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-[400px] lg:max-w-[500px]"
          >
            {/* Error Message */}
            {errors.root && (
              <div className="mb-[20px] p-4 bg-red-55 border border-red-200 rounded-[12px] text-red-600 font-raleway font-semibold text-[14px] lg:text-[16px] text-center">
                {errors.root.message}
              </div>
            )}

            {/* Email Input */}
            <div className="relative mb-[20px] lg:mb-[31px]">
              <div className="w-full h-[70px] lg:h-[90px] bg-[#EAEEED] rounded-[16px] lg:rounded-[20px] flex items-center px-4 lg:px-6   focus-within:border-gray-300  focus-within:border">
                <MailIcon
                  size={28}
                  className="text-black opacity-30 mr-3 lg:mr-4 lg:w-9 lg:h-9"
                />
                <input
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                  className="flex-1 bg-transparent font-raleway font-medium text-[20px] lg:text-[26px] leading-[24px] lg:leading-[31px] text-black placeholder-[#a4a4a4] placeholder-opacity-30 outline-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            {errors.email && (
              <span className="text-red-500 text-[14px] font-semibold pl-2 block -mt-3 mb-3">
                {errors.email.message}
              </span>
            )}

            {/* Password Input */}
            <div className="relative mb-[32px] lg:mb-[46px]">
              <div className="w-full h-[70px] lg:h-[90px] bg-[#EAEEED] rounded-[16px] lg:rounded-[20px] flex items-center px-4 lg:px-6 focus-within:border-gray-300  focus-within:border">
                <LockIcon
                  size={26}
                  className="text-black opacity-30 mr-3 lg:mr-4 lg:w-8 lg:h-8"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password")}
                  className="flex-1 bg-transparent font-raleway font-medium text-[20px] lg:text-[26px] leading-[24px] lg:leading-[31px] text-black placeholder-[#a4a4a4] placeholder-opacity-30 outline-none"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="ml-2 focus:outline-none"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <HideEyeIcon size={24} className="text-black " />
                  ) : (
                    <EyeIcon size={24} className="text-black " />
                  )}
                </button>
              </div>
            </div>
            {errors.password && (
              <span className="text-red-500 text-[14px] font-semibold pl-2 block -mt-3 mb-3">
                {errors.password.message}
              </span>
            )}

            {/* Forgot Password */}
            <div className="text-center mb-[28px] lg:mb-[38px]">
              <Link
                to="/auth/forgot-password"
                className="font-raleway font-semibold text-[16px] lg:text-[20px] leading-[24px] lg:leading-[28px] text-black opacity-80 hover:opacity-100 hover:text-[#E1017D] transition-all"
              >
                Forgot your Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-[280px] lg:w-[333px] h-[60px] lg:h-[79px] bg-[#E1017D] rounded-[30px] lg:rounded-[50.5px] flex items-center justify-center hover:bg-[#B71778] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <span className="font-raleway font-semibold text-[20px] lg:text-[30px] leading-[24px] lg:leading-[35px] text-white">
                  {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Background with Sign Up - 45% width */}
      <div className="w-[45%] h-full relative">
        {/* Background Image */}
        <div
          className="w-full h-full bg-cover bg-center relative"
          style={{ backgroundImage: `url(${AuthBackground})` }}
        >
          {/* Decorative Elements */}
          {/* Triangle */}
          <div
            className="absolute w-[120px] lg:w-[120px] h-[120px] lg:h-[120px] right-[0] top-[80%] bg-white opacity-20"
            style={{
              clipPath: "polygon(0% 0%, 0% 100%, 100% 100%)",
              transform: "rotate(45deg)",
            }}
          ></div>

          {/* Ellipse */}
          <div className="absolute w-[45px] lg:w-[67px] h-[45px] lg:h-[67px] left-[15%] top-[70%] bg-white opacity-20 rounded-full"></div>

          {/* Content */}
          {/* <div className="flex flex-col items-center justify-center h-full px-6 lg:px-8">
     
            <h2 className="font-raleway font-bold text-[40px] lg:text-[70px] leading-[48px] lg:leading-[82px] text-white text-center mb-[24px] lg:mb-[38px]">
              Hello, Friends
            </h2>

            <p className="font-raleway font-medium text-[18px] lg:text-[30px] leading-[22px] lg:leading-[35px] text-center text-white mb-[32px] lg:mb-[47px] max-w-[280px] lg:max-w-[374px]">
              Enter your personal details and start journey with us.
            </p>

            <button
              onClick={handleSignUp}
              className="group w-[250px] lg:w-[333px] h-[60px] lg:h-[79px] border-2 border-white rounded-[30px] lg:rounded-[50.5px] flex items-center justify-center hover:bg-white transition-all"
            >
              <span className="font-raleway font-semibold text-[20px] lg:text-[30px] leading-[24px] lg:leading-[35px] text-white group-hover:text-black transition-colors">
                SIGN UP
              </span>
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
