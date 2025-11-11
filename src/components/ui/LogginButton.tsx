"use client";

import { useState, useRef, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LoginButtonProps {
  acao?: "login" | "tom";
}

export default function LoginButton({ acao = "login" }: LoginButtonProps) {
  const supabase = createClientComponentClient();

  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const [nome, setNome] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  // Fecha modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
        setPasswordMismatch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("E-mail ou senha incorretos");
      setLoading(false);
      return;
    }

    setShowModal(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setNome("");
    setCelular("");
    setPasswordMismatch(false);
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setErrorMsg("");

    if (!nome || !celular || !email || !password || !confirmPassword) {
      setErrorMsg("Todos os campos são obrigatórios");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      setLoading(false);
      return;
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(
        error.message.includes("already registered")
          ? "Este e-mail já está cadastrado. Tente entrar."
          : "Erro ao criar conta: " + error.message
      );
      setLoading(false);
      return;
    }

    if (authData.user?.id) {
      await supabase
        .from("usuarios")
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            nome,
            celular,
            tema: "claro",
          },
        ]);
    }

    setShowModal(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setNome("");
    setCelular("");
    setPasswordMismatch(false);
    setLoading(false);
  };

  // Botão ou Badge dependendo da ação
  const renderButton = () => {
    if (acao === "tom") {
      return (
        <Badge
          onClick={() => setShowModal(true)}
          className="bg-gray-200 hover:bg-gray-400 text-gray-900 hover:cursor-pointer px-3 py-1 rounded-xl"
        >
          Tom
        </Badge>
      );
    }

    return (
      <Button
        variant="outline"
        onClick={() => setShowModal(true)}
        className="rounded-xl px-4"
      >
        Entrar
      </Button>
    );
  };

  return (
    <>
      {renderButton()}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-80"
          >
            <h2 className="text-lg font-semibold mb-4 text-center">
              {isLogin ? "Login" : "Cadastro"}
            </h2>

            {acao === "tom" && (
              <p className="text-center text-sm text-gray-500 mb-4">
                Você precisa estar logado para salvar e ver o tom dos hinos.
              </p>
            )}

            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full mb-3 p-2 border rounded-lg text-sm dark:bg-gray-800"
                />
                <input
                  type="text"
                  placeholder="Telefone"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  className="w-full mb-3 p-2 border rounded-lg text-sm dark:bg-gray-800"
                />
              </>
            )}

            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 p-2 border rounded-lg text-sm dark:bg-gray-800"
            />

            <hr className="my-2" />

            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (confirmPassword)
                  setPasswordMismatch(e.target.value !== confirmPassword);
              }}
              className="w-full mb-3 p-2 border rounded-lg text-sm dark:bg-gray-800"
            />

            {!isLogin && (
              <>
                <input
                  type="password"
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordMismatch(password !== e.target.value);
                  }}
                  className="w-full mb-3 p-2 border rounded-lg text-sm dark:bg-gray-800"
                />

                {passwordMismatch && (
                  <p className="text-red-500 text-xs text-center mb-2">
                    As senhas não coincidem
                  </p>
                )}
              </>
            )}

            {errorMsg && (
              <p className="text-red-500 text-xs text-center mb-2">
                {errorMsg}
              </p>
            )}

            <Button
              onClick={isLogin ? handleLogin : handleSignUp}
              disabled={loading || passwordMismatch}
              className="hover:cursor-pointer w-full bg-cyan-600 hover:bg-cyan-700 text-white mb-2"
            >
              {loading
                ? "Carregando..."
                : isLogin
                ? "Entrar"
                : "Cadastrar e entrar"}
            </Button>

            <p className="text-center text-sm text-gray-500">
              {isLogin ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg("");
                  setPasswordMismatch(false);
                  setPassword("");
                  setConfirmPassword("");
                  setNome("");
                  setCelular("");
                }}
                className="hover:cursor-pointer text-cyan-600 hover:underline font-medium"
              >
                {isLogin ? "Cadastre-se" : "Entrar"}
              </button>
            </p>

            <button
              onClick={() => {
                setShowModal(false);
                setPasswordMismatch(false);
              }}
              className="hover:cursor-pointer mt-3 text-sm text-gray-500 hover:underline w-full text-center"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
