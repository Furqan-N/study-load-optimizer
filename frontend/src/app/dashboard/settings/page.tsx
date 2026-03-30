"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type User = {
  id: string;
  email: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get<User>("/auth/me");
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8 p-6 md:p-8">
      <section>
        <h1 className="text-2xl font-semibold text-black">Settings</h1>
        <p className="mt-1 text-sm text-[#6C757D]">Manage your account and preferences.</p>
      </section>

      {loading ? (
        <div className="rounded-xl border border-[#E9ECEF] bg-white p-8 shadow-sm text-sm text-[#6C757D]">
          Loading settings...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-black">Profile Information</h2>
            <div className="mt-5 space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[#6C757D]">
                Email
              </label>
              <input
                id="email"
                type="email"
                readOnly
                value={user?.email ?? ""}
                className="h-10 w-full rounded-xl border border-[#E9ECEF] bg-[#F8F9FA] px-3 text-sm text-[#6C757D] outline-none"
              />
            </div>
          </section>

          <section className="rounded-xl border border-[#E9ECEF] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-black">Account Actions</h2>
            <p className="mt-3 text-sm text-[#6C757D]">
              Sign out of your account on this device. You can sign in again at any time.
            </p>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                <span className="material-symbols-outlined !text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
