"use client";

import Link from "next/link";
import { Music } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import LoginButton from "./LogginButton";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { user, loading } = useUser();

  return (
    <header className="fixed top-0 left-0 w-full border-b border-border bg-background text-foreground shadow-md z-50 transition-colors duration-300">
      <div className="w-full max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo / Título */}
        <Link href="/" className="flex items-center gap-2">
          <Music className="w-6 h-6" />
          <span className="text-lg font-semibold">Harpa Cristã</span>
        </Link>

        <nav className="flex items-center gap-3">
          {!loading && user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{user.nome}</span>
              <ThemeToggle />
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <LoginButton acao="login" />
              <ThemeToggle />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
