import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import anunciarHtml from "../conteudo/anunciar.html?raw";
import { htmlParaReact } from "../html";
import { Layout } from "../Layout";
import { Seo } from "../Seo";

export function PaginaAnunciar() {
  const ref = useRef(null);
  const location = useLocation();
  const conteudo = useMemo(() => htmlParaReact(anunciarHtml), []);

  useEffect(() => {
    const anuncio = ref.current?.querySelector("#anuncio-imovel");
    if (!anuncio) return;
    const finalidade = anuncio.querySelector("#anuncio-finalidade");
    if (location.hash === "#avaliacao" && finalidade) finalidade.value = "avaliacao";

    function enviar(evento) {
      evento.preventDefault();
      evento.stopPropagation();
      const desejo = finalidade.options[finalidade.selectedIndex].text;
      const linhas = [desejo === "Avaliação" ? "Olá, quero avaliar meu imóvel." : "Olá, quero anunciar meu imóvel."];
      linhas.push("Quero: " + desejo);
      anuncio.querySelectorAll(".anuncio__campos label").forEach((rotulo) => {
        const campo = rotulo.querySelector("select, input, textarea");
        if (!campo || campo.type === "checkbox" || !String(campo.value).trim()) return;
        const nomeCampo = rotulo.childNodes[0].textContent.trim();
        const texto = campo.tagName === "SELECT" ? campo.options[campo.selectedIndex].text : campo.value.trim();
        linhas.push(nomeCampo + ": " + texto);
      });
      const aviso = anuncio.querySelector("#anuncie-aviso") || document.querySelector("#anuncie-aviso");
      const nome = anuncio.querySelector("#anuncio-nome")?.value || "";
      const telefone = anuncio.querySelector("#anuncio-telefone")?.value || "";
      fetch("crm/salvar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefone.trim(),
          origem: "Formulário",
          assunto: desejo,
          pagina: location.href,
          detalhes: linhas.join("\n")
        })
      }).finally(() => {
        if (aviso) aviso.hidden = false;
        window.open("https://wa.me/5514981066430?text=" + encodeURIComponent(linhas.join("\n")), "_blank", "noopener");
      });
    }

    anuncio.addEventListener("submit", enviar, true);
    return () => anuncio.removeEventListener("submit", enviar, true);
  }, [conteudo, location.hash, location.href]);

  return (
    <Layout classeCorpo="pagina-anunciar" zap="Olá, quero anunciar um imóvel.">
      <Seo
        titulo="Anuncie seu imóvel · José Amim Alexandre"
        descricao="Anuncie seu imóvel com José Amim Alexandre, corretor de imóveis. Venda, aluguel, permuta e avaliação. CRECI 31.552-F."
      />
      <div ref={ref}>{conteudo}</div>
    </Layout>
  );
}
