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
