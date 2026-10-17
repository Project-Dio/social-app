import { useState } from "react";
import { User, KeyRound, AtSign, Users, CalendarDays } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../schemas/registerSchema";
import { signup, signin } from "../services/authService";
import { saveAuth } from "../utils/tokenStorage";
import { loginSchema } from "../schemas/loginSchema";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Auth() {
  const [activeForm, setActiveForm] = useState("login");

  const cardsData = [
    { main: "2012", sub: "Founded" },
    { main: "40K+", sub: "Graduates" },
    { main: "50+", sub: "Partner Companies" },
    { main: "5", sub: "Branches" },
    { main: "20", sub: "Diplomas Available" },
  ];
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      gender: "",
      dateOfBirth: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onRegisterSubmit = async (data) => {
    setServerError("");

    try {
      const response = await signup(data);

      const token = response.data.token;
      const user = response.data.user;

      if (token) {
        saveAuth(token, user);
      }

      toast.success("Account created successfully! 🎉");

      setActiveForm("login");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Something went wrong, please try again";

      setServerError(message);
      toast.error(message);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const inputBase =
    "w-full rounded-xl border bg-[#f8fafc] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:bg-white";
  const inputClass = (error) =>
    `${inputBase} ${
      error
        ? "border-red-500 focus:border-red-500"
        : "border-[#d9e2ef] focus:border-[#06349b]"
    }`;

  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();
  // login
  const [loginError, setLoginError] = useState("");

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoggingIn },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { login: "", password: "" },
  });

  const onLoginSubmit = async (data) => {
    setLoginError("");

    try {
      const response = await signin(data);

      const token = response.data.data.token;
      const user = response.data.data.user;

      saveAuth(token, user);

      toast.success("Signed in successfully! 👋");

      navigate("/", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Something went wrong, please try again";

      setLoginError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] px-6 py-10">
      <div className="mx-auto grid max-w-[1170px] grid-cols-1 items-center gap-10 lg:grid-cols-[1.35fr_0.9fr]">
        {/* ================= LEFT SIDE ================= */}
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-[#06349b]">
            Route Posts
          </h1>

          <p className="mt-4 max-w-[600px] text-[23px] leading-8 text-[#071a36]">
            Connect with friends and the world around you on Route Posts.
          </p>

          {/* About Route Academy */}
          <div className="mt-7 rounded-2xl border border-[#b9cfff] bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#06349b]">
              About Route Academy
            </h3>

            <h4 className="mt-2 text-lg font-bold text-[#101b2e]">
              Egypt's Leading IT Training Center Since 2012
            </h4>

            <p className="mt-3 text-sm leading-6 text-[#40516b]">
              Route Academy is the premier IT training center in Egypt,
              established in 2012. We specialize in delivering high-quality
              training courses in programming, web development, and application
              development. We've identified the unique challenges people may
              face when learning new technology and made efforts to provide
              strategies to overcome them.
            </p>

            {/* ================= CARDS ================= */}
            <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-3">
              {cardsData.map((card, idx) => {
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#b9cfff] bg-[#f4f7ff] px-3 py-3"
                  >
                    <h5 className="text-lg font-bold text-[#06349b]">
                      {card.main}
                    </h5>

                    <p className="mt-0.5 text-[10px] font-bold uppercase text-[#50617b]">
                      {card.sub}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {/* Login / Register buttons */}
          <div className="flex rounded-xl bg-[#eef2f7] p-1">
            <button
              type="button"
              onClick={() => setActiveForm("login")}
              className={`w-1/2 rounded-lg py-2.5 text-sm font-bold transition-all duration-200 ${
                activeForm === "login"
                  ? "bg-white text-[#06349b] shadow-sm"
                  : "text-[#243654]"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setActiveForm("register")}
              className={`w-1/2 rounded-lg py-2.5 text-sm font-bold transition-all duration-200 ${
                activeForm === "register"
                  ? "bg-white text-[#06349b] shadow-sm"
                  : "text-[#243654]"
              }`}
            >
              Register
            </button>
          </div>

          {/* ================= LOGIN ================= */}
          {activeForm === "login" && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-[#101b2e]">
                Log in to Route Posts
              </h2>

              <p className="mt-1 text-sm text-[#6c7b91]">
                Log in and continue your social journey.
              </p>

              <form
                className="mt-5"
                onSubmit={handleLoginSubmit(onLoginSubmit)}
                noValidate
              >
                {/* Email or username */}
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-[1.1rem] text-[#8da2c1]"
                  />
                  <input
                    type="text"
                    placeholder="Email or username"
                    className={inputClass(loginErrors.login)}
                    {...registerLogin("login")}
                  />
                  {loginErrors.login && (
                    <p className="mt-1 text-xs text-red-500">
                      {loginErrors.login.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="relative mt-3">
                  <KeyRound
                    size={18}
                    className="absolute left-3 top-[1.1rem] text-[#8da2c1]"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className={inputClass(loginErrors.password)}
                    {...registerLogin("password")}
                  />
                  {loginErrors.password && (
                    <p className="mt-1 text-xs text-red-500">
                      {loginErrors.password.message}
                    </p>
                  )}
                </div>

                {/* Server error */}
                {loginError && (
                  <p className="mt-3 text-center text-sm text-red-500">
                    {loginError}
                  </p>
                )}

                {/* Login button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="mt-4 w-full rounded-xl bg-[#06349b] py-3.5 font-bold text-white transition hover:bg-[#052d85] disabled:opacity-60"
                >
                  {isLoggingIn ? "Logging in..." : "Log In"}
                </button>

                <button
                  type="button"
                  className="mt-4 block w-full text-center text-sm font-medium text-[#06349b] hover:underline"
                >
                  Forgot password?
                </button>
              </form>
            </div>
          )}

          {activeForm === "register" && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-[#101b2e]">
                Create a new account
              </h2>
              <p className="mt-1 text-sm text-[#6c7b91]">
                It is quick and easy.
              </p>

              <form
                className="mt-5"
                onSubmit={handleSubmit(onRegisterSubmit)}
                noValidate
              >
                {/* Full name */}
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-[1.1rem] text-[#8da2c1]"
                  />
                  <input
                    type="text"
                    placeholder="Full name"
                    className={inputClass(errors.fullName)}
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div className="relative mt-3">
                  <AtSign
                    size={18}
                    className="absolute left-3 top-[1.1rem] text-[#8da2c1]"
                  />
                  <input
                    type="text"
                    placeholder="Username (optional)"
                    className={inputClass(errors.username)}
                    {...register("username")}
                  />
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="relative mt-3">
                  <AtSign
                    size={18}
                    className="absolute left-3 top-[1.1rem] text-[#8da2c1]"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    className={inputClass(errors.email)}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="relative mt-3">
                  <Users
                    size={18}
                    className="absolute left-3 top-[1.1rem] text-[#8da2c1]"
                  />
                  <select
                    className={`${inputClass(errors.gender)} appearance-none text-[#243654]`}
                    {...register("gender")}
                  >
                    <option value="" disabled>
                      Select gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                {/* Date of birth */}
                <div className="relative mt-3">
                  <CalendarDays
                    size={18}
                    className="absolute left-3 top-[1.1rem] text-[#8da2c1]"
                  />
                  <input
                    type="date"
                    max={today}
                    className={`${inputClass(errors.dateOfBirth)} text-[#243654]`}
                    {...register("dateOfBirth")}
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="relative mt-3">
                  <KeyRound
                    size={18}
                    className="absolute left-3 top-[1.1rem] text-[#8da2c1]"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className={inputClass(errors.password)}
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="relative mt-3">
                  <KeyRound
                    size={18}
                    className="absolute left-3 top-[1.1rem] text-[#8da2c1]"
                  />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    className={inputClass(errors.confirmPassword)}
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Register button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 w-full rounded-xl bg-[#06349b] py-3.5 font-bold text-white transition hover:bg-[#052d85] disabled:opacity-60"
                >
                  Create New Account
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
