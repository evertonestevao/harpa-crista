"use client";

import { Music } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f5] dark:bg-gray-950 p-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-3xl p-10 text-center max-w-md w-full animate-fadeIn flex flex-col items-center">
        {/* Ícone centralizado */}
        <div className="flex justify-center items-center mb-6">
          <Music className="w-20 h-20 text-cyan-500 animate-bounce" />
        </div>

        <h1 className="text-6xl font-extrabold text-gray-800 dark:text-gray-100 mb-4">
          404
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Ops! A página que você procura não foi encontrada.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-cyan-500 text-white font-semibold rounded-full shadow-md hover:bg-cyan-600 transition"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
