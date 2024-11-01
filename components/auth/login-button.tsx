"use client";

import { useRouter } from "next/navigation";

interface LoginButtonProps {
  children: React.ReactNode;
  mode?: "model" | "redirect";
  asChild?: boolean; // Made optional
}

export const LoginButton = ({ children, mode = "redirect", asChild = false }: LoginButtonProps) => {
  const router = useRouter();

  const onClick: React.MouseEventHandler<HTMLButtonElement | HTMLSpanElement> = (e) => {
    e.preventDefault();
    router.push("/emp/login");
  };

  if (mode === "model") {
    // Placeholder for future model behavior implementation
    return <span>TODO: return model</span>;
  }

  if (asChild) {
    // Render children directly without wrapping it in a button
    return (
      <span onClick={onClick} className="cursor-pointer">
        {children}
      </span>
    );
  }

  return (
    <button onClick={onClick} className="cursor-pointer">
      {children}
    </button>
  );
};
