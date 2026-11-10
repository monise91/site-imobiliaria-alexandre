import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { imoveis } from "../dados/imoveis";
import { Layout } from "../Layout";
import { Seo } from "../Seo";

const destinos = {
  comprar: { href: "/comprar", frase: "Veja outros imóveis à venda" },
  alugar: { href: "/alugar", frase: "Veja outros imóveis para alugar" },
  permuta: { href: "/permuta", frase: "Veja outros imóveis para permuta" }
};

function Foto({ foto, onClick, className }) {
  return (
    <button type="button" className={className} onClick={onClick}>
      <img src={foto.src} alt={foto.alt} />
      <span className="foto__marca" aria-hidden="true">
        <img src={"assets/marca_d'agua.png"} alt="" />
      </span>
    </button>
  );
}

export function PaginaImovel() {
  const [params] = useSearchParams();
  const id = params.get("id") || "";
  const imovel = imoveis[id];
  const [indice, setIndice] = useState(0);
  const [faixaAberta, setFaixaAberta] = useState(false);

  useEffect(() => {
    setIndice(0);
    setFaixaAberta(false);
  }, [id]);

  if (!imovel) {
    return (
      <Layout classeCorpo="pagina-imovel" zap="Olá, quero falar com o corretor.">
        <Seo
          titulo="Imóvel não encontrado · José Amim Alexandre"
          descricao="Esse anúncio não está na vitrine de José Amim Alexandre, em Conchas."
        />
        <main className="ficha" id="ficha">
          <Link className="voltar" to="/">Voltar à página inicial</Link>
          <h1>Imóvel não encontrado</h1>
          <p className="ficha__texto">Esse anúncio não está na vitrine. Volte e escolha outro card.</p>
          <p className="ficha__outro">Ainda não é o que procurava? <Link to="/comprar">Veja outros imóveis à venda</Link>.</p>
        </main>
      </Layout>
    );
  }

  const bruto = imovel.titulo + " em " + imovel.cidade + ". " + imovel.operacao + ", " + imovel.tipo + ". " + imovel.descricao;
  const resumo = bruto.length > 155 ? bruto.slice(0, 155).replace(/\s+\S*$/, "") + "…" : bruto;
  const destino = destinos[(imovel.operacao || "").toLowerCase()] || destinos.comprar;
  const textoWhats = "Olá, quero saber sobre " + imovel.titulo + " em " + imovel.cidade + ".";
  const textoVisita = "Olá, quero agendar uma visita a " + imovel.titulo + " em " + imovel.cidade + ".";
  const preco = imovel.preco || "Valor sob consulta";
  const textoShare = imovel.titulo + " em " + imovel.cidade + ". " + preco + ". " + location.href;
  const mapa = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(imovel.endereco);
  const unica = imovel.imagens.length < 2;
  const muitas = imovel.imagens.length > 5;
  const foto = imovel.imagens[indice] || imovel.imagens[0];
  const zap = (texto) => "https://wa.me/5514981066430?text=" + encodeURIComponent(texto);

  return (
    <Layout classeCorpo="pagina-imovel" zap="Olá, quero falar com o corretor.">
      <Seo titulo={imovel.titulo + " em " + imovel.cidade + " · José Amim Alexandre"} descricao={resumo} />
      <main className="ficha" id="ficha">
        <Link className="voltar" to="/">Voltar à página inicial</Link>
        <div className="ficha__cabeca">
          <div>
            <h1>{imovel.titulo}</h1>
            <p className="ficha__endereco">
              <a href={mapa} target="_blank" rel="noopener noreferrer">{imovel.endereco}</a>
            </p>
            <p className="ficha__codigo">Cód. {imovel.codigo}</p>
          </div>
          <div className="ficha__valor">
            <span>{imovel.operacao}</span>
            <strong>{preco}</strong>
          </div>
        </div>
        <div className={unica ? "mosaico mosaico--unica" : "mosaico"}>
          <button className="foto mosaico__principal" type="button">
            <img className="galeria__destaque" src={foto.src} alt={foto.alt} />
            <span className="foto__marca" aria-hidden="true">
              <img src={"assets/marca_d'agua.png"} alt="" />
            </span>
          </button>
          <div className="mosaico__lado">
            {imovel.imagens.slice(1, 5).map((item, ordem) => (
              <Foto key={item.src} className="foto" foto={item} onClick={() => setIndice(ordem + 1)} />
            ))}
          </div>
          {muitas && !faixaAberta ? (
            <button
              type="button"
              className="mosaico__ver"
              onClick={() => {
                setFaixaAberta(true);
                requestAnimationFrame(() => {
                  document.getElementById("fotos")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                });
              }}
            >
              Ver fotos
            </button>
          ) : null}
        </div>
        <div className="galeria__miniaturas" id="fotos" hidden={unica || (muitas && !faixaAberta)}>
          {imovel.imagens.map((item, posicao) => (
            <Foto
              key={item.src + posicao}
              foto={item}
              className={posicao === indice ? "foto ativa" : "foto"}
              onClick={() => setIndice(posicao)}
            />
          ))}
        </div>
        <div className="ficha__grade">
          <div>
            <h2>Sobre o imóvel</h2>
            <p className="ficha__texto">{imovel.descricao}</p>
            <h3>Características</h3>
            <ul className="ficha__itens">
              {imovel.caracteristicas.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <h3>Localização</h3>
            <div className="ficha__mapa">
              <iframe
                title={"Mapa de " + imovel.endereco}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={"https://maps.google.com/maps?q=" + encodeURIComponent(imovel.endereco) + "&hl=pt-BR&z=16&output=embed"}
              />
            </div>
            <p className="ficha__outro">Ainda não é o que procurava? <Link to={destino.href}>{destino.frase}</Link>.</p>
          </div>
          <aside className="ficha__painel">
            <p className="ficha__painel-op">{imovel.operacao}</p>
            <p className="ficha__painel-preco">{preco}</p>
            <a className="zap" href={zap(textoWhats)} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
            <a className="ficha__visita" href={zap(textoVisita)} target="_blank" rel="noopener noreferrer">Agende uma visita</a>
            <a className="ficha__ligar" href="tel:+5514981066430">Ligar (14) 98106-6430</a>
            <a className="ficha__share" href={zap(textoShare)} target="_blank" rel="noopener noreferrer">Compartilhar</a>
          </aside>
        </div>
      </main>
    </Layout>
  );
}
