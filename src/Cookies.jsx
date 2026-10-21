import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CHAVE = "lgpd-cookies";

export function Cookies() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(CHAVE) !== "aceito") setVisivel(true);
    } catch {
      setVisivel(true);
    }
  }, []);

  if (!visivel) return null;

  return (
    <div className="cookies" role="region" aria-label="Aviso de cookies">
      <p>
        Usamos cookies funcionais e de navegação para o site funcionar e lembrar esta escolha.{" "}
        <Link to="/politica-de-privacidade">Política de Privacidade</Link>
      </p>
      <button
        className="cookies__aceitar"
        type="button"
        onClick={() => {
          try {
            localStorage.setItem(CHAVE, "aceito");
          } catch {
            /* o aviso some mesmo se o navegador bloquear o armazenamento */
          }
          setVisivel(false);
        }}
      >
        Aceitar Todos
      </button>
    </div>
  );
}
