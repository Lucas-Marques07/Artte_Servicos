// pages/_app.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import "@/styles/theme.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // ⛔ Ignora se estiver na tela de login
    if (router.pathname === "/") return;

    let timeout;

    const logoutPorInatividade = () => {
      alert("Você foi desconectado por inatividade.");
      localStorage.removeItem("usuarioLogado");
      router.push("/");
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(logoutPorInatividade, 59 * 60 * 1000); // 10 minutos
    };

    const eventos = ["mousemove", "keydown", "scroll", "click", "touchstart"];

    eventos.forEach((evento) => window.addEventListener(evento, resetTimer));
    resetTimer();

    return () => {
      eventos.forEach((evento) => window.removeEventListener(evento, resetTimer));
      clearTimeout(timeout);
    };
  }, [router]);

  return <Component {...pageProps} />;
}
