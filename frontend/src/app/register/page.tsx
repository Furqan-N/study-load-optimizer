"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import api from "@/lib/api";

type RegisterFormData = {
  email: string;
  full_name: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    full_name: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/register", formData);
      router.push("/login");
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      if (detail === "Email already registered") {
        setError(
          "An account with this email already exists. Please log in instead."
        );
      } else {
        setError("Registration failed. Please check your details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#E9ECEF] px-3 py-2 text-black outline-none focus:border-[#2B5EA7] focus:ring-2 focus:ring-[#2B5EA7]/20 transition-colors";

  return (
    <main className="min-h-screen bg-[#F8F9FA] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-xl border border-[#E9ECEF] bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-[#2B5EA7] flex items-center justify-center">
              <span className="material-symbols-outlined text-white !text-[16px]">query_stats</span>
            </div>
            <span className="text-lg font-semibold">StudyLoad</span>
          </div>
          <h1 className="text-2xl font-semibold text-black">Create account</h1>
          <p className="mt-1 text-sm text-[#6C757D]">
            Register to start planning your study load.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#6C757D]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-[#6C757D]">
                Full Name
              </label>
              <input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                }
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#6C757D]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6C757D] hover:text-black transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined !text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-[#6C757D]">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6C757D] hover:text-black transition-colors"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined !text-[18px]">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {error ? (
              <p className="text-sm text-red-600">
                {error}
                {error.includes("already exists") && (
                  <>
                    {" "}
                    <Link href="/login" className="font-medium underline">
                      Log in here
                    </Link>
                  </>
                )}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6C757D]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-black underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
