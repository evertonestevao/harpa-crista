"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/ui/Header";
import ToneSelector from "@/components/ui/ToneSelector";
import { useUser } from "@/contexts/UserContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import LoginButton from "@/components/ui/LogginButton";
import Footer from "@/components/ui/Footer"; // importe seu footer

interface HarpaItem {
  hino: string;
  coro?: string;
  verses: Record<string, string>;
}

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const num = Number(id);
  const [hino, setHino] = useState<HarpaItem | null>(null);
  const { user } = useUser();
  const supabase = createClientComponentClient();

  const [userTone, setUserTone] = useState<string | null>(null);

  // Carrega hino
  useEffect(() => {
    const carregar = async () => {
      const res = await fetch("/hinario/harpa.json");
      const dados = await res.json();
      setHino(dados[id as string]);
    };
    carregar();
  }, [id]);

  // Carrega tom do usuário
  useEffect(() => {
    if (!user?.id) return;

    const carregarTom = async () => {
      const { data, error } = await supabase
        .from("tons")
        .select("tom")
        .eq("usuario_id", user.id)
        .eq("hino_id", id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao carregar tom:", error);
        return;
      }

      if (data) setUserTone(data.tom);
    };

    carregarTom();
  }, [id, user?.id, supabase]);

  if (!hino) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  const versiculos = Object.entries(hino.verses).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  const primeiro = versiculos[0];
  const restantes = versiculos.slice(1);

  const irAnterior = () => {
    if (num > 1) router.push(`/harpa/${num - 1}`);
  };

  const irProximo = () => {
    router.push(`/harpa/${num + 1}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8f5] dark:bg-gray-950">
      <Header />

      {/* Conteúdo principal que cresce */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-4">
        <div className="sticky top-15 bg-[#f8f8f5] dark:bg-gray-950 border-gray-300 dark:border-gray-800 w-full flex items-center justify-center gap-3 px-6 py-3">
          <h1 className="text-xl font-bold text-center">{hino.hino}</h1>

          {/* Mostra tom ou ToneSelector */}
          {user?.id ? (
            <ToneSelector
              hinoId={String(id)}
              initialTone={userTone}
              onToneChange={(tone) => setUserTone(tone)}
            />
          ) : (
            <LoginButton acao="tom" />
          )}
        </div>

        <div className="max-w-xl mx-auto w-full p-4 space-y-6 mt-14 leading-7 text-center">
          {primeiro && (
            <div
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: primeiro[1] }}
            />
          )}

          {hino.coro && (
            <div className="font-bold italic text-gray-700 dark:text-gray-300">
              <div
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: hino.coro }}
              />
            </div>
          )}

          {restantes.map(([num, texto]) => (
            <div
              key={num}
              className="whitespace-pre-wrap hover:cursor-pointer"
              dangerouslySetInnerHTML={{ __html: texto }}
            />
          ))}

          {/* Botões de navegação */}
          <div className="flex justify-between pt-8">
            <button
              onClick={irAnterior}
              disabled={num <= 1}
              className="px-4 py-2 border rounded disabled:opacity-40 hover:cursor-pointer hover:font-medium"
            >
              ← Anterior
            </button>

            <button
              onClick={irProximo}
              className="px-4 py-2 border rounded hover:cursor-pointer hover:font-medium"
            >
              Próximo →
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
