// /components/LogOutButton.tsx

"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export const LogOutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false }); // Prevent redirect to /api/auth/signout
    router.push("/emp/login"); // Redirect to login page after sign out
  };

  return (
    <button onClick={handleLogout}>
      Log Out
    </button>
  );
};
