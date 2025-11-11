"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/ui/Header";
import ToneSelector from "@/components/ui/ToneSelector";
import { useUser } from "@/contexts/UserContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import LoginButton from "@/components/ui/LogginButton";

interface HarpaData {
  [key: string]: {
    hino: string;
  };
}

interface UserTone {
  hino_id: string;
  tom: string;
}

export default function HarpaPage() {
  const { user } = useUser();
  const supabase = createClientComponentClient();

  const [harpa, setHarpa] = useState<HarpaData>({});
  const [pesquisa, setPesquisa] = useState("");
  const [userTones, setUserTones] = useState<Record<string, string>>({});
  // { "1": "C", "2": "G#" ... }

  // Carrega o hinário
  useEffect(() => {
    const carregar = async () => {
      const res = await fetch("/hinario/harpa.json");
      const data = await res.json();
      setHarpa(data);
    };
    carregar();
  }, []);

  // Carrega todos os tons do usuário apenas uma vez
  useEffect(() => {
    if (!user?.id) return;

    const carregarTons = async () => {
      const { data, error } = await supabase
        .from("tons")
        .select("hino_id, tom")
        .eq("usuario_id", user.id);

      if (error) {
        console.error("Erro ao carregar tons:", error);
        return;
      }

      if (data) {
        // Transforma em objeto para acesso rápido por hino_id
        const tonsMap: Record<string, string> = {};
        data.forEach((t: UserTone) => {
          tonsMap[t.hino_id] = t.tom;
        });
        setUserTones(tonsMap);
      }
    };

    carregarTons();
  }, [user?.id, supabase]);

  const listaFiltrada = Object.keys(harpa).filter((num) =>
    harpa[num].hino.toLowerCase().includes(pesquisa.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f8f8f5] dark:bg-gray-950">
      <Header />

      <div className="fixed top-15 w-full bg-[#f8f8f5] dark:bg-gray-950 z-40 border-b">
        <div className="max-w-2xl mx-auto px-6 py-2 mt-1">
          <input
            type="text"
            placeholder="Buscar hino..."
            className="w-full p-1 pl-3 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full max-w-2xl mt-2 px-6 mx-auto pt-[120px]">
        <ul className="space-y-2">
          {listaFiltrada.map((num) => (
            <li
              key={num}
              className="border p-2 rounded-2xl hover:cursor-pointer hover:bg-gray-100 flex justify-between items-center"
            >
              <Link href={`/harpa/${num}`} className="flex-1 ml-1">
                {harpa[num].hino}
              </Link>

              {user ? (
                <ToneSelector
                  hinoId={`${num}`}
                  initialTone={userTones[num] || null}
                  onToneChange={(tone: string) => {
                    setUserTones((prev) => ({ ...prev, [num]: tone }));
                  }}
                />
              ) : (
                <LoginButton acao="tom" />
              )}
            </li>
          ))}
        </ul>

        {listaFiltrada.length === 0 && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            Carregando hinos...
          </p>
        )}
      </div>
    </div>
  );
}
