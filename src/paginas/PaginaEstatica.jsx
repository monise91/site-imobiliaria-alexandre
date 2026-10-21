import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { filtrarLista } from "../filtrar";
import { htmlParaReact } from "../html";
import { Layout } from "../Layout";
import { Seo } from "../Seo";

export function PaginaEstatica({ html, titulo, descricao, classeCorpo, zap }) {
  const ref = useRef(null);
  const [params] = useSearchParams();
  const conteudo = useMemo(() => htmlParaReact(html), [html]);

  useEffect(() => {
    filtrarLista(ref.current, params);
  }, [params, conteudo]);

  return (
    <Layout classeCorpo={classeCorpo} zap={zap}>
      <Seo titulo={titulo} descricao={descricao} />
      <div ref={ref}>{conteudo}</div>
    </Layout>
  );
}
