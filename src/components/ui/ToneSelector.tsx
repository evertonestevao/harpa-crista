"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ToneSelectorProps {
  hinoId: string; // ID do hino que está sendo selecionado
  initialTone?: string | null; // tom inicial vindo da página principal
  onToneChange?: (tone: string) => void; // callback para atualizar estado no pai
}

export default function ToneSelector({
  hinoId,
  initialTone = null,
  onToneChange,
}: ToneSelectorProps) {
  const { user } = useUser();
  const supabase = createClientComponentClient();

  const [open, setOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string | null>(initialTone);
  const tones = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const ref = useRef<HTMLDivElement>(null);

  // Sincroniza o estado local se o initialTone mudar
  useEffect(() => {
    setSelectedTone(initialTone);
  }, [initialTone]);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveTone = async (tone: string) => {
    if (!user?.id) {
      console.error("Usuário não logado");
      return;
    }

    // Verifica se já existe
    const { data: existing, error: selectError } = await supabase
      .from("tons")
      .select("id")
      .eq("usuario_id", user.id)
      .eq("hino_id", hinoId)
      .maybeSingle();

    if (selectError) {
      console.error("Erro ao verificar tom existente:", selectError);
      return;
    }

    if (existing) {
      // Atualiza
      const { error } = await supabase
        .from("tons")
        .update({ tom: tone })
        .eq("id", existing.id);

      if (error) {
        console.error("Erro ao atualizar tom:", error);
        return;
      }
    } else {
      // Insere novo
      const { error } = await supabase
        .from("tons")
        .insert({ usuario_id: user.id, hino_id: hinoId, tom: tone });

      if (error) {
        console.error("Erro ao salvar tom:", error);
        return;
      }
    }

    setSelectedTone(tone);
    // Atualiza no estado do pai
    onToneChange?.(tone);
  };

  return (
    <div ref={ref} className="relative inline-block text-left">
      <Badge
        onClick={() => setOpen((prev) => !prev)}
        className={`${
          selectedTone
            ? "bg-cyan-500 hover:bg-cyan-600 text-white"
            : "bg-gray-200 hover:bg-gray-400 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
        } hover:cursor-pointer flex items-center gap-1 select-none `}
      >
        {selectedTone ? (
          <span>{selectedTone}</span>
        ) : (
          <>Tom {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</>
        )}
      </Badge>

      {open && (
        <div
          className="absolute right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg z-50 p-2 grid grid-cols-4 gap-2 w-[180px] max-w-[90vw] origin-top-right"
          style={{ transformOrigin: "top right" }}
        >
          {tones.map((tone) => (
            <button
              key={tone}
              onClick={() => {
                saveTone(tone);
                setOpen(false);
              }}
              className={`px-2 py-1 text-sm rounded-lg transition hover:cursor-pointer ${
                selectedTone === tone
                  ? "bg-cyan-600 text-white"
                  : "hover:bg-cyan-500 hover:text-white"
              }`}
              style={{
                fontSize: "16px",
                touchAction: "manipulation",
              }}
            >
              {tone}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
