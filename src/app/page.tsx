"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Filter } from "lucide-react";
import Header from "@/components/ui/Header";
import ToneSelector from "@/components/ui/ToneSelector";
import { useUser } from "@/contexts/UserContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import LoginButton from "@/components/ui/LogginButton";
import Footer from "@/components/ui/Footer";

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
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [filtro, setFiltro] = useState<"todos" | "comTons" | "semTons">(
    "todos"
  );

  // Carrega o hinário
  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      try {
        const res = await fetch("/hinario/harpa.json");
        const data = await res.json();
        setHarpa(data);
      } catch (error) {
        console.error("Erro ao carregar o hinário:", error);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  // Carrega tons do usuário
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
        const tonsMap: Record<string, string> = {};
        data.forEach((t: UserTone) => {
          tonsMap[t.hino_id] = t.tom;
        });
        setUserTones(tonsMap);
      }
    };

    carregarTons();
  }, [user?.id, supabase]);

  // Aplica o filtro de pesquisa e tons
  const listaFiltrada = Object.keys(harpa).filter((num) => {
    const nomeHino = harpa[num].hino.toLowerCase();
    const correspondePesquisa = nomeHino.includes(pesquisa.toLowerCase());

    if (filtro === "comTons") return correspondePesquisa && !!userTones[num];
    if (filtro === "semTons") return correspondePesquisa && !userTones[num];
    return correspondePesquisa;
  });

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f8f8f5] dark:bg-gray-950">
      <Header />

      {/* Barra de pesquisa e filtro */}
      <div className="fixed top-15 w-full bg-[#f8f8f5] dark:bg-gray-950 z-40 border-b">
        <div className="max-w-2xl mx-auto flex items-center gap-2 px-6 py-2 mt-1 relative">
          <input
            type="text"
            placeholder="Buscar hino..."
            className="flex-1 p-1 pl-3 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />

          {user && (
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex hover:cursor-pointer items-center justify-center px-3 py-2 border rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-800 transition"
              >
                <Filter className="w-4 h-4" />
              </button>

              {showFilter && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border rounded-2xl shadow-md z-50">
                  <button
                    onClick={() => {
                      setFiltro("todos");
                      setShowFilter(false);
                    }}
                    className={`w-full hover:cursor-pointer text-left px-4 py-2 text-sm rounded-t-2xl hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      filtro === "todos" ? "font-semibold text-cyan-600" : ""
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => {
                      setFiltro("comTons");
                      setShowFilter(false);
                    }}
                    className={`w-full hover:cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      filtro === "comTons" ? "font-semibold text-cyan-600" : ""
                    }`}
                  >
                    Com tons
                  </button>
                  <button
                    onClick={() => {
                      setFiltro("semTons");
                      setShowFilter(false);
                    }}
                    className={`w-full hover:cursor-pointer text-left px-4 py-2 text-sm rounded-b-2xl hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      filtro === "semTons" ? "font-semibold text-cyan-600" : ""
                    }`}
                  >
                    Sem tons
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="w-full max-w-2xl mt-2 px-6 mx-auto pt-[120px] mb-4">
        <ul className="space-y-2">
          {listaFiltrada.map((num) => (
            <li
              key={num}
              className="border p-2 rounded-2xl hover:cursor-pointer hover:bg-gray-200 hover:dark:bg-gray-900 flex justify-between items-center"
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

        {loading && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            Carregando hinos...
          </p>
        )}

        {!loading && listaFiltrada.length === 0 && (
          <div className="text-center mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-lg mb-2">
              😔 Nenhum hino encontrado
            </p>
            <p className="text-gray-400 text-sm">
              Tente outro termo de busca ou altere o filtro.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
