import { useEffect } from "react";

export function Seo({ titulo, descricao }) {
  useEffect(() => {
    document.title = titulo;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = descricao;
  }, [titulo, descricao]);
  return null;
}
