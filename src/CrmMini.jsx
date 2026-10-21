import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function assuntoDoLink(href) {
  try {
    return new URL(href, location.href).searchParams.get("text") || "Contato pelo WhatsApp";
  } catch {
    return "Contato pelo WhatsApp";
  }
}

function salvar(dados) {
  return fetch("crm/salvar.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  })
    .then((resposta) => resposta.json())
    .then((corpo) => !!(corpo && corpo.ok))
    .catch(() => false);
}

export function CrmMini() {
  const [aberto, setAberto] = useState(false);
  const [href, setHref] = useState("");
  const [erro, setErro] = useState(false);
  const [falha, setFalha] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function fechar() {
    setAberto(false);
    setHref("");
    setErro(false);
    setFalha(false);
    setEnviando(false);
  }

  function abrirWhatsApp(destino) {
    window.open(destino, "_blank", "noopener");
    fechar();
  }

  useEffect(() => {
    function noClique(evento) {
      const link = evento.target.closest("a[href*='wa.me']");
      if (!link || link.closest(".crm-mini")) return;
      evento.preventDefault();
      evento.stopPropagation();
      setHref(link.href);
      setErro(false);
      setFalha(false);
      setAberto(true);
    }
    function noTeclado(evento) {
      if (evento.key === "Escape") fechar();
    }
    document.addEventListener("click", noClique, true);
    document.addEventListener("keydown", noTeclado);
    return () => {
      document.removeEventListener("click", noClique, true);
      document.removeEventListener("keydown", noTeclado);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("crm-mini-aberto", aberto);
  }, [aberto]);

  if (!aberto) return null;

  function enviar(evento) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const nome = String(dados.get("nome") || "").trim();
    const telefone = String(dados.get("telefone") || "").trim();
    if (!nome || telefone.replace(/\D/g, "").length < 10) {
      setErro(true);
      return;
    }
    setErro(false);
    setFalha(false);
    setEnviando(true);
    salvar({
      nome,
      telefone,
      origem: "WhatsApp",
      assunto: assuntoDoLink(href),
      pagina: location.href,
      detalhes: "",
      empresa: String(dados.get("empresa") || "")
    }).then((salvou) => {
      setEnviando(false);
      if (salvou) abrirWhatsApp(href);
      else setFalha(true);
    });
  }

  return (
    <div className="crm-mini">
      <div className="crm-mini__fundo" onClick={fechar} />
      <form className="crm-mini__folha" onSubmit={enviar}>
        <h2>Seu contato</h2>
        <p>Informe nome e telefone.</p>
        <label>
          Seu nome
          <input name="nome" type="text" autoComplete="name" required autoFocus />
        </label>
        <label>
          Telefone
          <input name="telefone" type="tel" autoComplete="tel" inputMode="tel" placeholder="(14) 90000-0000" required />
        </label>
        <label className="crm-mini__isca" aria-hidden="true">
          Empresa
          <input name="empresa" type="text" tabIndex={-1} autoComplete="off" />
        </label>
        <p className="crm-mini__erro" hidden={!erro}>Informe nome e telefone.</p>
        <p className="crm-mini__nota">
          Ao enviar, você concorda com a <Link to="/politica-de-privacidade">Política de privacidade</Link>.
        </p>
        <div className="crm-mini__acoes">
          <button type="button" className="crm-mini__cancelar" onClick={fechar}>Fechar</button>
          <button type="submit" className="crm-mini__enviar" disabled={enviando}>Enviar e abrir WhatsApp</button>
        </div>
        <p className="crm-mini__falha" hidden={!falha}>
          Não foi possível guardar agora.{" "}
          <button type="button" className="crm-mini__seguir" onClick={() => href && abrirWhatsApp(href)}>
            Abrir o WhatsApp mesmo assim
          </button>
        </p>
      </form>
    </div>
  );
}
