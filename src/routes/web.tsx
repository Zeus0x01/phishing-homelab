import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LAB_BANNER } from "@/data/campaign";
import { useLab } from "@/lib/store";

export const Route = createFileRoute("/web")({ component: WebLure });

function WebLure() {
  const mark = useLab((s) => s.markLure);
  const lureTried = useLab((s) => s.lureTried);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <main className="min-h-dvh bg-[#f3f3f3] text-[#1b1b1b]">
      <p className="bg-[#7a1f1f] px-3 py-2 text-center text-xs text-white">{LAB_BANNER}</p>
      <div className="mx-auto mt-10 w-full max-w-md rounded-sm bg-white p-8 shadow-sm">
        <p className="text-xl font-semibold">Sign in</p>
        <p className="mt-1 text-sm text-[#5e5e5e]">Training clone of a Microsoft-style portal</p>
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            mark();
          }}
        >
          <label className="block text-sm">
            Email
            <input
              className="mt-1 min-h-11 w-full border border-[#8a8886] px-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
          </label>
          <label className="block text-sm">
            Password
            <input
              type="password"
              className="mt-1 min-h-11 w-full border border-[#8a8886] px-3"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="off"
            />
          </label>
          <label className="block text-sm">
            Security code
            <input
              className="mt-1 min-h-11 w-full border border-[#8a8886] px-3"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              autoComplete="off"
            />
          </label>
          <button type="submit" className="min-h-11 w-full bg-[#0067b8] text-sm font-medium text-white">
            Next
          </button>
        </form>
        {lureTried && (
          <div className="mt-4 space-y-2 border border-[#d83b01] bg-[#fff4ce] p-3 text-sm">
            <p className="font-medium">Lab intercept</p>
            <p>
              In a real attack this form would relay credentials and the MFA code to an
              adversary-in-the-middle kit, then send you to the genuine site. Here nothing is
              stored or transmitted.
            </p>
            <p className="font-mono text-xs break-all">Host: secure-verify.live/login.php</p>
          </div>
        )}
        <Link to="/lab" className="mt-6 inline-block text-sm text-[#0067b8] underline">
          Return to lab
        </Link>
      </div>
    </main>
  );
}
