export function filtrarLista(raiz, params) {
  if (!raiz) return;
  const estado = {
    tipo: params.get("tipo") || "",
    bairro: params.get("bairro") || "",
    cidade: params.get("cidade") || "",
    rua: params.get("rua") || "",
    codigo: params.get("codigo") || "",
    quartos: params.get("quartos") || "",
    banheiros: params.get("banheiros") || "",
    garagem: params.get("garagem") || "",
    cozinha: params.get("cozinha") || "",
    copa: params.get("copa") || "",
    quintal: params.get("quintal") || "",
    minPreco: Number((params.get("valor-min") || "").replace(/\D/g, "")) || 0,
    maxPreco: Number((params.get("valor-max") || "").replace(/\D/g, "")) || 0
  };

  const normalizar = (texto) => (texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  function codigoCombina(card, busca) {
    if (!busca) return true;
    const consulta = normalizar(busca).replace(/\bcod\.?\b/g, "").trim();
    if (!consulta) return true;
    if (card.dataset.codigo === consulta) return true;
    const digitos = consulta.replace(/\D/g, "");
    if (!digitos) return false;
    return card.dataset.codigo === String(Number(digitos)).padStart(2, "0");
  }

  function peloMenos(card, chave, pedido) {
    if (!pedido) return true;
    const valor = card.dataset[chave];
    if (!valor) return false;
    return Number(valor) >= Number(pedido);
  }

  function possui(card, chave, pedido) {
    if (pedido !== "1") return true;
    return card.dataset[chave] === "1";
  }

  function combina(card) {
    if (estado.tipo && card.dataset.tipo !== estado.tipo) return false;
    if (estado.bairro && normalizar(card.dataset.bairro) !== normalizar(estado.bairro)) return false;
    if (estado.cidade && normalizar(card.dataset.cidade) !== normalizar(estado.cidade)) return false;
    if (estado.rua && !normalizar(card.dataset.rua).includes(normalizar(estado.rua))) return false;
    if (!codigoCombina(card, estado.codigo)) return false;
    if (!peloMenos(card, "quartos", estado.quartos)) return false;
    if (!peloMenos(card, "banheiros", estado.banheiros)) return false;
    if (!possui(card, "garagem", estado.garagem)) return false;
    if (!possui(card, "cozinha", estado.cozinha)) return false;
    if (!possui(card, "copa", estado.copa)) return false;
    if (!possui(card, "quintal", estado.quintal)) return false;
    const preco = Number(card.dataset.preco);
    if (estado.minPreco && preco < estado.minPreco) return false;
    if (estado.maxPreco && preco > estado.maxPreco) return false;
    return true;
  }

  const tipos = { casa: "Casa", comercial: "Comercial", terreno: "Terreno", chacara: "Chácara", apartamento: "Apartamento" };
  const bairros = { centro: "Centro", "joanin parise": "Joanin Parise" };
  const rotulos = [];
  if (estado.tipo) rotulos.push(tipos[estado.tipo] || estado.tipo);
  if (estado.cidade) rotulos.push("Conchas");
  if (estado.bairro) rotulos.push(bairros[normalizar(estado.bairro)] || estado.bairro);
  if (estado.rua) rotulos.push("Rua " + estado.rua);
  if (estado.codigo) rotulos.push("Cód. " + estado.codigo);
  if (estado.quartos) rotulos.push(estado.quartos + "+ quartos");
  if (estado.banheiros) rotulos.push(estado.banheiros + "+ banheiros");
  if (estado.garagem === "1") rotulos.push("Com garagem");
  if (estado.cozinha === "1") rotulos.push("Cozinha");
  if (estado.copa === "1") rotulos.push("Copa");
  if (estado.quintal === "1") rotulos.push("Quintal");
  if (estado.minPreco) rotulos.push("A partir de R$ " + estado.minPreco.toLocaleString("pt-BR"));
  if (estado.maxPreco) rotulos.push("Até R$ " + estado.maxPreco.toLocaleString("pt-BR"));
  const resumo = raiz.querySelector("#resumo");
  if (resumo) resumo.textContent = rotulos.join(" · ");

  const cards = raiz.querySelectorAll(".card");
  if (!cards.length) return;
  let visiveis = 0;
  cards.forEach((card) => {
    const mostra = combina(card);
    card.hidden = !mostra;
    if (mostra) visiveis += 1;
  });
  const vazio = raiz.querySelector("#vazio");
  if (vazio) vazio.hidden = visiveis > 0;
}
