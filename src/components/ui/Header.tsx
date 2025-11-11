"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Music } from "lucide-react";
import { cn } from "@/lib/utils";
// import ThemeToggle from "./ThemeToggle";
// import LoginButton from "./LoginButtonGoogle";
import { useUser } from "@/contexts/UserContext";
import LoginButton from "./LogginButton";
import LogoutButton from "./LogoutButton";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useUser();

  return (
    <header className="fixed top-0 left-0 w-full border-b border-gray-200 shadow-md bg-white z-50">
      <div className="w-full max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo / Título */}
        <Link href="/" className="flex items-center gap-2">
          <Music className="w-6 h-6" />
          <span className="text-lg font-semibold">Harpa Cristã</span>
        </Link>

        <nav className="items-center gap-4">
          {!loading && user ? (
            <div className="flex items-center gap-2 relative">
              <span className="text-sm text-gray-700 font-medium">
                Olá, {user.nome}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <LoginButton acao="login" />
          )}
        </nav>
      </div>
    </header>
  );
}
