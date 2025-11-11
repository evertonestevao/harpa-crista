"use client";

import { useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";

export default function LogoutMenu() {
  const supabase = createClientComponentClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    location.reload(); // atualiza a página depois de sair
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Menu className="w-6 h-6 text-black dark:text-white" />
      </Button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border rounded-lg shadow-md z-50">
          <button
            onClick={handleLogout}
            className="flex hover:cursor-pointer items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
