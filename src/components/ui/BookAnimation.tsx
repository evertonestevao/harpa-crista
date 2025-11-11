"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export default function BookLoader() {
  const [animationData, setAnimationData] = useState<Record<
    string,
    unknown
  > | null>(null);

  useEffect(() => {
    fetch("/animations/som.json")
      .then((res) => res.json())
      .then(setAnimationData)
      .catch((err) => console.error("Erro ao carregar animação:", err));
  }, []);

  if (!animationData) return null;

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ width: "200px", height: "200px" }}
      />
    </div>
  );
}
