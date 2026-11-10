import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import rodapeHtml from "./conteudo/rodape.html?raw";
import { Cookies } from "./Cookies";
import { CrmMini } from "./CrmMini";
import { htmlParaReact } from "./html";

function linkZap(texto) {
  return "https://wa.me/5514981066430?text=" + encodeURIComponent(texto);
}

function IconeWhats() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

export function Layout({ children, classeCorpo = "", zap, ocultarZapNoHero = false }) {
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const [zapOculto, setZapOculto] = useState(ocultarZapNoHero);
  const rodape = useMemo(() => htmlParaReact(rodapeHtml), []);
  const textoZap = zap || "Olá, quero falar com o corretor.";
  const hrefZap = linkZap(textoZap);

  useEffect(() => {
    document.body.classList.remove("pagina-lista", "pagina-anunciar", "pagina-imovel");
    if (classeCorpo) document.body.classList.add(classeCorpo);
  }, [classeCorpo]);

  useEffect(() => {
    document.body.classList.toggle("menu-aberto", menuAberto);
  }, [menuAberto]);

  useEffect(() => {
    function noTeclado(evento) {
      if (evento.key === "Escape") setMenuAberto(false);
    }
    document.addEventListener("keydown", noTeclado);
    return () => document.removeEventListener("keydown", noTeclado);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const alvo = document.querySelector(location.hash);
      if (alvo) {
        alvo.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash, location.search]);

  useEffect(() => {
    if (!ocultarZapNoHero) {
      setZapOculto(false);
      return;
    }
    const estreito = window.matchMedia("(max-width: 900px)");
    function aplicar() {
      const hero = document.querySelector(".hero");
      const caixa = hero?.getBoundingClientRect();
      const naTela = !!caixa && caixa.bottom > 0 && caixa.top < window.innerHeight;
      setZapOculto(estreito.matches && naTela);
    }
    aplicar();
    window.addEventListener("scroll", aplicar, { passive: true });
    window.addEventListener("resize", aplicar);
    estreito.addEventListener("change", aplicar);
    return () => {
      window.removeEventListener("scroll", aplicar);
      window.removeEventListener("resize", aplicar);
      estreito.removeEventListener("change", aplicar);
    };
  }, [ocultarZapNoHero, location.pathname]);

  function fecharMenu() {
    setMenuAberto(false);
  }

  function paginaAtual(caminho) {
    return location.pathname === caminho || location.pathname === caminho + ".html";
  }

  return (
    <>
      <header className="topo">
        <Link className="marca" to="/">
          <span className="marca__logo">
            <img src="assets/logo-marca.png" alt="José Amim Alexandre, corretor de imóveis" width="131" height="56" />
          </span>
          <span className="marca__creci">CRECI 31.552-F</span>
        </Link>
        <nav className="menu" aria-label="Principal">
          <Link to="/comprar" aria-current={paginaAtual("/comprar") ? "page" : undefined}>Comprar</Link>
          <Link to="/alugar" aria-current={paginaAtual("/alugar") ? "page" : undefined}>Alugar</Link>
          <Link to="/anunciar" aria-current={paginaAtual("/anunciar") ? "page" : undefined}>Anunciar imóvel</Link>
        </nav>
        <div className="topo__acoes">
          <a className="telefone zap" href={hrefZap} target="_blank" rel="noopener noreferrer">(14) 98106-6430</a>
          <button
            className="menu-botao"
            type="button"
            aria-expanded={menuAberto}
            aria-controls="menu-site"
            onClick={() => setMenuAberto((aberto) => !aberto)}
          >
            <span className="sr">Menu</span>
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <nav
        className="gaveta"
        id="menu-site"
        hidden={!menuAberto}
        onClick={(evento) => {
          if (evento.target === evento.currentTarget || evento.target.closest("a") || evento.target.closest(".gaveta__fechar")) {
            fecharMenu();
          }
        }}
      >
        <div className="gaveta__painel">
          <button className="gaveta__fechar" type="button">
            <span className="sr">Fechar menu</span>
          </button>
          <div className="gaveta__grupo">
            <p>Imóveis</p>
            <Link to="/comprar">Imóveis à venda</Link>
            <Link to="/alugar">Imóveis para alugar</Link>
            <Link to="/permuta">Permuta</Link>
            <Link to="/#imoveis">Destaques</Link>
            <Link to="/anunciar">Anunciar seu imóvel</Link>
          </div>
          <div className="gaveta__grupo">
            <p>Serviços</p>
            <Link to="/anunciar#avaliacao">Avaliação</Link>
            <Link to="/#documentacao">Documentação</Link>
            <Link to="/#contratos">Contratos</Link>
          </div>
          <div className="gaveta__grupo">
            <p>O escritório</p>
            <Link to="/#escritorio">Sobre nós</Link>
            <Link to="/#contato">Contato</Link>
            <Link to="/politica-de-privacidade">Política de privacidade</Link>
            <a href="https://www.instagram.com/joseamimalexandre/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.facebook.com/jose.amim.alexandre/?locale=pt_BR" target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
          <div className="gaveta__grupo">
            <p>Contato</p>
            <a href="tel:+5514981066430">(14) 98106-6430</a>
            <a className="zap" href={linkZap("Olá, quero falar com o corretor.")} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href="https://www.google.com/maps/search/?api=1&query=Rua+S%C3%A3o+Paulo%2C+309+-+Centro%2C+Conchas+-+SP" target="_blank" rel="noopener noreferrer">Rua São Paulo, 309 - Centro, Conchas - SP</a>
          </div>
        </div>
      </nav>

      {children}
      {rodape}

      <a className={zapOculto ? "whatsapp whatsapp--oculto" : "whatsapp"} href={hrefZap} target="_blank" rel="noopener noreferrer" aria-label="Abrir 1 mensagem no WhatsApp">
        <IconeWhats />
      </a>
      <Cookies />
      <CrmMini />
    </>
  );
}
