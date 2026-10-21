import { BrowserRouter, Route, Routes } from "react-router-dom";
import alugarHtml from "./conteudo/alugar.html?raw";
import comprarHtml from "./conteudo/comprar.html?raw";
import permutaHtml from "./conteudo/permuta.html?raw";
import politicaHtml from "./conteudo/politica-de-privacidade.html?raw";
import { PaginaAnunciar } from "./paginas/PaginaAnunciar";
import { PaginaEstatica } from "./paginas/PaginaEstatica";
import { PaginaImovel } from "./paginas/PaginaImovel";
import { PaginaInicial } from "./paginas/PaginaInicial";

function Comprar() {
  return (
    <PaginaEstatica
      html={comprarHtml}
      classeCorpo="pagina-lista"
      zap="Olá, quero saber sobre imóveis à venda em Conchas."
      titulo="Comprar imóvel · Imobiliária José Amim Alexandre"
      descricao="Imóveis à venda em Conchas com a Imobiliária José Amim Alexandre. CRECI 31.552-F."
    />
  );
}

function Alugar() {
  return (
    <PaginaEstatica
      html={alugarHtml}
      classeCorpo="pagina-lista"
      zap="Olá, quero saber sobre imóveis para alugar em Conchas."
      titulo="Alugar imóvel · Imobiliária José Amim Alexandre"
      descricao="Imóveis para alugar em Conchas com a Imobiliária José Amim Alexandre. CRECI 31.552-F."
    />
  );
}

function Permuta() {
  return (
    <PaginaEstatica
      html={permutaHtml}
      classeCorpo="pagina-lista"
      zap="Olá, quero falar sobre permuta de um imóvel em Conchas."
      titulo="Permuta de imóvel · Imobiliária José Amim Alexandre"
      descricao="Permuta de imóveis em Conchas com a Imobiliária José Amim Alexandre. CRECI 31.552-F."
    />
  );
}

function Politica() {
  return (
    <PaginaEstatica
      html={politicaHtml}
      classeCorpo="pagina-imovel"
      zap="Olá, quero falar com a imobiliária."
      titulo="Política de privacidade · Imobiliária José Amim Alexandre"
      descricao="Como a Imobiliária José Amim Alexandre, em Conchas, trata os dados de quem visita o site ou chama no WhatsApp e no telefone."
    />
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaginaInicial />} />
        <Route path="/index.html" element={<PaginaInicial />} />
        <Route path="/comprar" element={<Comprar />} />
        <Route path="/comprar.html" element={<Comprar />} />
        <Route path="/alugar" element={<Alugar />} />
        <Route path="/alugar.html" element={<Alugar />} />
        <Route path="/anunciar" element={<PaginaAnunciar />} />
        <Route path="/anunciar.html" element={<PaginaAnunciar />} />
        <Route path="/permuta" element={<Permuta />} />
        <Route path="/permuta.html" element={<Permuta />} />
        <Route path="/imovel" element={<PaginaImovel />} />
        <Route path="/imovel.html" element={<PaginaImovel />} />
        <Route path="/politica-de-privacidade" element={<Politica />} />
        <Route path="/politica-de-privacidade.html" element={<Politica />} />
      </Routes>
    </BrowserRouter>
  );
}
