import { Link } from "react-router-dom";
import parse, { domToReact } from "html-react-parser";

export function paraRota(href) {
  if (!href || /^(https?:|tel:|mailto:)/i.test(href) || href.startsWith("#")) return null;
  const url = new URL(href, "http://site.local");
  const arquivo = url.pathname.split("/").filter(Boolean).pop() || "";
  let caminho = "/";
  if (arquivo && arquivo !== "index.html") {
    caminho = "/" + (arquivo.endsWith(".html") ? arquivo.slice(0, -5) : arquivo);
  }
  return caminho + url.search + url.hash;
}

function substituir(node) {
  if (node.type !== "tag" || node.name !== "a") return undefined;
  const rota = paraRota(node.attribs?.href);
  if (!rota) return undefined;
  const atrib = { ...node.attribs };
  delete atrib.href;
  if (atrib.class) {
    atrib.className = atrib.class;
    delete atrib.class;
  }
  return (
    <Link to={rota} {...atrib}>
      {domToReact(node.children || [], { replace: substituir })}
    </Link>
  );
}

export function htmlParaReact(html) {
  return parse(html, { replace: substituir });
}
