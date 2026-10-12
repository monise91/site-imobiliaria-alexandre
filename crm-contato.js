(function () {
  var destino = "crm/salvar.php";

  function assuntoDoLink(href) {
    try {
      var url = new URL(href, location.href);
      return url.searchParams.get("text") || "Contato pelo WhatsApp";
    } catch (erro) {
      return "Contato pelo WhatsApp";
    }
  }

  window.crmSalvar = function (dados) {
    return fetch(destino, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    }).then(function (resposta) {
      return resposta.json();
    }).then(function (corpo) {
      return !!(corpo && corpo.ok);
    }).catch(function () {
      return false;
    });
  };

  var caixa = document.createElement("div");
  caixa.className = "crm-mini";
  caixa.hidden = true;
  caixa.innerHTML = ''
    + '<div class="crm-mini__fundo" data-fechar="1"></div>'
    + '<form class="crm-mini__folha">'
    + '<h2>Seu contato</h2>'
    + '<p>Informe nome e telefone.</p>'
    + '<label>Seu nome<input name="nome" type="text" autocomplete="name" required></label>'
    + '<label>Telefone<input name="telefone" type="tel" autocomplete="tel" inputmode="tel" placeholder="(14) 90000-0000" required></label>'
    + '<label class="crm-mini__isca" aria-hidden="true">Empresa<input name="empresa" type="text" tabindex="-1" autocomplete="off"></label>'
    + '<p class="crm-mini__erro" hidden>Informe nome e telefone.</p>'
    + '<p class="crm-mini__nota">Ao enviar, você concorda com a <a href="politica-de-privacidade.html">Política de privacidade</a>.</p>'
    + '<div class="crm-mini__acoes">'
    + '<button type="button" class="crm-mini__cancelar" data-fechar="1">Fechar</button>'
    + '<button type="submit" class="crm-mini__enviar">Enviar e abrir WhatsApp</button>'
    + '</div>'
    + '<p class="crm-mini__falha" hidden>Não foi possível guardar agora. <button type="button" class="crm-mini__seguir">Abrir o WhatsApp mesmo assim</button></p>'
    + '</form>';
  document.body.appendChild(caixa);

  var formulario = caixa.querySelector("form");
  var erro = caixa.querySelector(".crm-mini__erro");
  var falha = caixa.querySelector(".crm-mini__falha");
  var linkAberto = "";

  function fechar() {
    caixa.hidden = true;
    document.body.classList.remove("crm-mini-aberto");
    linkAberto = "";
    formulario.reset();
    erro.hidden = true;
    falha.hidden = true;
  }

  function abrir(href) {
    linkAberto = href;
    erro.hidden = true;
    falha.hidden = true;
    caixa.hidden = false;
    document.body.classList.add("crm-mini-aberto");
    var campo = formulario.querySelector("[name=nome]");
    if (campo) campo.focus();
  }

  function abrirWhatsApp(href) {
    window.open(href, "_blank", "noopener");
    fechar();
  }

  caixa.addEventListener("click", function (evento) {
    if (evento.target.closest("[data-fechar]")) fechar();
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && !caixa.hidden) fechar();
  });

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    var nome = formulario.nome.value.trim();
    var telefone = formulario.telefone.value.trim();
    var digitos = telefone.replace(/\D/g, "");
    if (!nome || digitos.length < 10) {
      erro.hidden = false;
      return;
    }
    erro.hidden = true;
    falha.hidden = true;
    var href = linkAberto;
    var botao = formulario.querySelector(".crm-mini__enviar");
    botao.disabled = true;
    window.crmSalvar({
      nome: nome,
      telefone: telefone,
      origem: "WhatsApp",
      assunto: assuntoDoLink(href),
      pagina: location.href,
      detalhes: "",
      empresa: formulario.empresa.value
    }).then(function (salvou) {
      botao.disabled = false;
      if (salvou) abrirWhatsApp(href);
      else falha.hidden = false;
    });
  });

  caixa.querySelector(".crm-mini__seguir").addEventListener("click", function () {
    if (linkAberto) abrirWhatsApp(linkAberto);
  });

  document.addEventListener("click", function (evento) {
    var link = evento.target.closest("a[href*='wa.me']");
    if (!link || caixa.contains(link)) return;
    evento.preventDefault();
    evento.stopPropagation();
    abrir(link.href);
  }, true);

  var anuncio = document.querySelector("#anuncio-imovel");
  if (anuncio) {
    anuncio.addEventListener("submit", function (evento) {
      evento.preventDefault();
      evento.stopImmediatePropagation();
      var finalidade = document.querySelector("#anuncio-finalidade");
      var desejo = finalidade.options[finalidade.selectedIndex].text;
      var linhas = [desejo === "Avaliação"
        ? "Olá, quero avaliar meu imóvel."
        : "Olá, quero anunciar meu imóvel."];
      linhas.push("Quero: " + desejo);
      anuncio.querySelectorAll(".anuncio__campos label").forEach(function (rotulo) {
        var campo = rotulo.querySelector("select, input, textarea");
        if (!campo || campo.type === "checkbox" || !String(campo.value).trim()) return;
        var nomeCampo = rotulo.childNodes[0].textContent.trim();
        var texto = campo.tagName === "SELECT" ? campo.options[campo.selectedIndex].text : campo.value.trim();
        linhas.push(nomeCampo + ": " + texto);
      });
      var aviso = document.querySelector("#anuncie-aviso");
      var nome = (document.querySelector("#anuncio-nome") || {}).value || "";
      var telefone = (document.querySelector("#anuncio-telefone") || {}).value || "";
      window.crmSalvar({
        nome: nome.trim(),
        telefone: telefone.trim(),
        origem: "Formulário",
        assunto: desejo,
        pagina: location.href,
        detalhes: linhas.join("\n")
      }).then(function () {
        if (aviso) aviso.hidden = false;
        window.open("https://wa.me/5514981066430?text=" + encodeURIComponent(linhas.join("\n")), "_blank", "noopener");
      });
    }, true);
  }
})();
