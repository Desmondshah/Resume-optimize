"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-6 py-2 bg-white text-black border border-black font-medium hover:bg-black hover:text-white transition-all duration-200 uppercase text-xs tracking-wider"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}
