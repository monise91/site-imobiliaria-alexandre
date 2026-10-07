(function () {
  var chave = "lgpd-cookies";
  var banner = document.getElementById("cookies");
  if (!banner) return;

  var aceito = false;
  try {
    aceito = localStorage.getItem(chave) === "aceito";
  } catch (erro) {
    aceito = false;
  }

  if (aceito) return;

  banner.hidden = false;

  var botao = banner.querySelector(".cookies__aceitar");
  if (!botao) return;

  botao.addEventListener("click", function () {
    try {
      localStorage.setItem(chave, "aceito");
    } catch (erro) {}
    banner.hidden = true;
  });
})();
