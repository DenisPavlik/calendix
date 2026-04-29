"use client";

import axios from "axios";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const FORMAT_RE = /^[a-z0-9-]{3,30}$/;

export default function ProfileForm({ un }: { un?: string | null }) {
  const [username, setUsername] = useState(un || "");
  const [checking, setChecking] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!username) { setValid(null); return; }
    if (username === un) { setValid(true); return; }
    setValid(null);
    setChecking(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setChecking(false);
      setValid(FORMAT_RE.test(username));
    }, 450);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [username, un]);

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    try {
      const response = await axios.put("/api/profile", { username });
      if (response.status === 200) {
        toast.success("Profile saved!");
        router.refresh();
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data || "Bad request.";
        toast.error(typeof msg === "string" ? msg : "Bad request.");
      } else {
        toast.error("An unknown error occurred.");
      }
    }
  }

  const initials = (username || un || "?")[0].toUpperCase();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>

      <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-2xl border border-gray-100">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl flex-shrink-0 select-none">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{username || "No username set"}</p>
          <p className="text-xs text-gray-400 mt-0.5">Avatar upload — coming soon</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <label className="block">
          <span>Username</span>
          <div className="relative">
            <input
              type="text"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="your-username"
              className="pr-32"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {checking && <Loader2 size={15} className="animate-spin text-gray-400" />}
              {!checking && valid === true && <Check size={15} className="text-emerald-500" />}
              {!checking && valid === false && username.length > 0 && (
                <span className="text-xs text-red-400">a–z, 0–9, hyphens only</span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Min 3 chars, lowercase letters, numbers and hyphens.</p>
        </label>

        <button
          type="submit"
          disabled={valid === false}
          className="btn btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save profile
        </button>
      </form>
    </div>
  );
}
