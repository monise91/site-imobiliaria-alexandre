import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import homeHtml from "../conteudo/home.html?raw";
import { htmlParaReact } from "../html";
import { Layout } from "../Layout";
import { Seo } from "../Seo";

export function PaginaInicial() {
  const ref = useRef(null);
  const navigate = useNavigate();
  const conteudo = useMemo(() => htmlParaReact(homeHtml), []);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash === "comprar") navigate("/comprar", { replace: true });
    if (hash === "alugar") navigate("/alugar", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const form = ref.current?.querySelector("#busca-hero");
    if (!form) return;
    const chips = form.querySelectorAll("[data-filtro]");

    function modoBusca(nome) {
      form.dataset.modo = nome;
      form.querySelector("#busca-avancado")?.setAttribute("aria-expanded", String(nome === "avancado"));
    }

    function noChip(evento) {
      const botao = evento.currentTarget;
      const campo = form.querySelector("#" + botao.dataset.filtro);
      if (!campo) return;
      campo.value = campo.value === botao.dataset.valor ? "" : botao.dataset.valor;
      chips.forEach((item) => {
        if (item.dataset.filtro !== botao.dataset.filtro) return;
        const ligado = campo.value === item.dataset.valor;
        item.classList.toggle("ativo", ligado);
        item.setAttribute("aria-pressed", String(ligado));
      });
    }

    function noAvancado() {
      modoBusca(form.dataset.modo === "avancado" ? "simples" : "avancado");
    }

    function noCodigo() {
      const botao = form.querySelector("#busca-codigo");
      const campo = form.querySelector("#campo-codigo");
      const codigo = form.querySelector("#codigo");
      const aberto = botao.getAttribute("aria-pressed") === "true";
      botao.setAttribute("aria-pressed", String(!aberto));
      campo.classList.toggle("ativo", !aberto);
      if (!aberto) codigo.focus();
    }

    function noEnvio(evento) {
      evento.preventDefault();
      const operacao = form.querySelector("#operacao")?.value === "alugar" ? "alugar" : "comprar";
      const params = new URLSearchParams();
      ["tipo", "cidade", "bairro", "rua", "codigo", "quartos", "banheiros", "garagem", "cozinha", "copa", "quintal"].forEach((id) => {
        const campo = form.querySelector("#" + id);
        if (campo && campo.value.trim()) params.set(id, campo.value.trim());
      });
      const minimo = (form.querySelector("#valor-min")?.value || "").replace(/\D/g, "");
      const maximo = (form.querySelector("#valor-max")?.value || "").replace(/\D/g, "");
      if (minimo) params.set("valor-min", minimo);
      if (maximo) params.set("valor-max", maximo);
      const consulta = params.toString();
      navigate("/" + operacao + (consulta ? "?" + consulta : ""));
    }

    chips.forEach((botao) => botao.addEventListener("click", noChip));
    form.querySelector("#busca-avancado")?.addEventListener("click", noAvancado);
    form.querySelector("#busca-codigo")?.addEventListener("click", noCodigo);
    form.addEventListener("submit", noEnvio);
    return () => {
      chips.forEach((botao) => botao.removeEventListener("click", noChip));
      form.querySelector("#busca-avancado")?.removeEventListener("click", noAvancado);
      form.querySelector("#busca-codigo")?.removeEventListener("click", noCodigo);
      form.removeEventListener("submit", noEnvio);
    };
  }, [navigate, conteudo]);

  useEffect(() => {
    const hero = ref.current?.querySelector(".hero");
    const miolo = hero?.querySelector(".hero__conteudo");
    if (!hero || !miolo) return;

    function caber() {
      miolo.style.transform = "";
      if (hero.querySelector('#busca-hero[data-modo="avancado"]')) return;
      const estiloHero = getComputedStyle(hero);
      const estiloMiolo = getComputedStyle(miolo);
      const livre = hero.clientHeight - parseFloat(estiloHero.paddingTop) - parseFloat(estiloHero.paddingBottom) - 4;
      const visiveis = [...miolo.children].filter((filho) => getComputedStyle(filho).display !== "none");
      let altura = (parseFloat(estiloMiolo.rowGap) || 0) * Math.max(visiveis.length - 1, 0);
      visiveis.forEach((filho) => {
        const estilo = getComputedStyle(filho);
        altura += filho.getBoundingClientRect().height + parseFloat(estilo.marginTop) + parseFloat(estilo.marginBottom);
      });
      const escala = Math.min(1, livre / altura, miolo.clientWidth / miolo.scrollWidth);
      if (escala < 0.995) miolo.style.transform = "scale(" + Math.max(escala, 0.5) + ")";
    }

    caber();
    document.fonts?.ready.then(caber);
    const observador = new ResizeObserver(caber);
    observador.observe(hero);
    return () => observador.disconnect();
  }, [conteudo]);

  useEffect(() => {
    const procura = ref.current?.querySelector("#procura-imovel");
    if (!procura) return;
    const finalidade = procura.querySelector("#procura-finalidade");

    function enviar(evento) {
      evento.preventDefault();
      evento.stopPropagation();
      const desejo = finalidade.options[finalidade.selectedIndex].text;
      const linhas = ["Olá, estou procurando um imóvel."];
      procura.querySelectorAll(".anuncio__campos label").forEach((rotulo) => {
        const campo = rotulo.querySelector("select, input, textarea");
        if (!campo || campo.type === "checkbox" || !String(campo.value).trim()) return;
        const nomeCampo = rotulo.childNodes[0].textContent.trim();
        const texto = campo.tagName === "SELECT" ? campo.options[campo.selectedIndex].text : campo.value.trim();
        linhas.push(nomeCampo + ": " + texto);
      });
      const aviso = procura.querySelector("#procura-aviso");
      fetch("crm/salvar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: procura.querySelector("#procura-nome").value.trim(),
          telefone: procura.querySelector("#procura-telefone").value.trim(),
          origem: "Formulário",
          assunto: "Procura imóvel: " + desejo,
          pagina: location.href,
          detalhes: linhas.join("\n")
        })
      }).finally(() => {
        if (aviso) aviso.hidden = false;
        window.open("https://wa.me/5514981066430?text=" + encodeURIComponent(linhas.join("\n")), "_blank", "noopener");
      });
    }

    procura.addEventListener("submit", enviar, true);
    return () => procura.removeEventListener("submit", enviar, true);
  }, [conteudo]);

  useEffect(() => {
    const grupos = [
      document.querySelectorAll(".categorias .categoria"),
      document.querySelectorAll(".marcos li")
    ];
    const estreito = window.matchMedia("(max-width: 900px)");
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lados = [-1, 1, -1];

    function entrar() {
      grupos.forEach((cards) => {
        cards.forEach((card, indice) => {
          if (!estreito.matches || reduzir.matches) {
            card.style.transform = "";
            return;
          }
          const caixa = card.getBoundingClientRect();
          const inicio = window.innerHeight * 0.98;
          const fim = window.innerHeight * 0.58;
          let progresso = (inicio - caixa.top) / (inicio - fim);
          if (progresso < 0) progresso = 0;
          if (progresso > 1) progresso = 1;
          card.style.transform = "translate3d(" + (1 - progresso) * 88 * lados[indice] + "px, 0, 0)";
        });
      });
    }

    entrar();
    window.addEventListener("scroll", entrar, { passive: true });
    window.addEventListener("resize", entrar);
    estreito.addEventListener("change", entrar);
    reduzir.addEventListener("change", entrar);
    return () => {
      window.removeEventListener("scroll", entrar);
      window.removeEventListener("resize", entrar);
      estreito.removeEventListener("change", entrar);
      reduzir.removeEventListener("change", entrar);
    };
  }, [conteudo]);

  return (
    <Layout zap="Olá, quero falar com a imobiliária." ocultarZapNoHero>
      <Seo
        titulo="Imobiliária José Amim Alexandre · Mais de 40 anos no mercado"
        descricao="Imobiliária José Amim Alexandre em Conchas, SP. Mais de 40 anos no mercado. Aluguel, compra, permuta e avaliação. CRECI 31.552-F."
      />
      <div ref={ref}>{conteudo}</div>
    </Layout>
  );
}
