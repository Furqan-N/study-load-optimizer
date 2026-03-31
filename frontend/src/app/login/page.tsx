"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import api from "@/lib/api";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password
      });

      const token = response.data?.access_token;

      if (!token) {
        throw new Error("Missing access token in login response.");
      }

      localStorage.setItem("token", token);
      router.push("/dashboard");
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      if (detail === "Incorrect email or password") {
        setError("Incorrect email or password. Please try again.");
      } else if (error.code === "ERR_NETWORK" || !error.response) {
        setError("Unable to reach the server. Please check your connection or try again later.");
      } else {
        setError(`Login failed (${error.response?.status ?? "unknown"}). Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-semibold text-black">Welcome back</h1>
          <p className="mt-1 text-sm text-[#6C757D]">
            Log in to continue to your study dashboard.
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
                className="w-full rounded-xl border border-[#E9ECEF] px-3 py-2 text-black outline-none focus:border-[#2B5EA7] focus:ring-2 focus:ring-[#2B5EA7]/20 transition-colors"
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
                  className="w-full rounded-xl border border-[#E9ECEF] px-3 py-2 pr-10 text-black outline-none focus:border-[#2B5EA7] focus:ring-2 focus:ring-[#2B5EA7]/20 transition-colors"
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

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6C757D]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-black underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
