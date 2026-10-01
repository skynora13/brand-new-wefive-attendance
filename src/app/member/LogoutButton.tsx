"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-md hover:bg-red-50 transition-colors text-red-700 hover:text-red-800 font-medium"
    >
      <LogOut size={20} />
      <span>Sign Out</span>
    </button>
  );
}
