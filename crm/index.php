<?php
session_name("crmimob");
session_start();

require __DIR__ . "/conexao.php";
$config = is_file(__DIR__ . "/config.php") ? require __DIR__ . "/config.php" : null;
$senhaPainel = is_array($config) ? (string) ($config["painel_senha"] ?? "") : "";
$origensManuais = ["Telefone", "Balcão", "Portal", "Indicação", "Outro"];
$erro = "";

function crm_volta($ancora = "")
{
    header("Location: index.php" . ($ancora !== "" ? "#" . $ancora : ""));
    exit;
}

function crm_tabela_anotacoes($pdo)
{
    try {
        $pdo->exec(
            "CREATE TABLE IF NOT EXISTS anotacoes (
              id INT UNSIGNED NOT NULL AUTO_INCREMENT,
              contato_id INT UNSIGNED NOT NULL,
              criado_em DATETIME NOT NULL,
              texto TEXT NOT NULL,
              PRIMARY KEY (id),
              KEY idx_anotacoes_contato (contato_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
        );
    } catch (Exception $falha) {
    }
}

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["senha"])) {
    $digitada = (string) $_POST["senha"];
    if ($senhaPainel !== "" && hash_equals($senhaPainel, $digitada)) {
        session_regenerate_id(true);
        $_SESSION["crm"] = true;
        crm_volta();
    }
    $erro = "Senha incorreta.";
}

$entrou = !empty($_SESSION["crm"]);
if ($entrou && empty($_SESSION["crm_token"])) {
    $_SESSION["crm_token"] = bin2hex(random_bytes(16));
}
$token = $entrou ? $_SESSION["crm_token"] : "";
$aviso = (string) ($_SESSION["crm_aviso"] ?? "");
unset($_SESSION["crm_aviso"]);

$novo = ["nome" => "", "telefone" => "", "origem" => "Telefone", "assunto" => "", "detalhes" => ""];
$erroNovo = "";

if ($entrou && $_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["acao"])) {
    if (!hash_equals($token, (string) ($_POST["token"] ?? ""))) {
        $_SESSION["crm_aviso"] = "A página ficou aberta muito tempo. Tente de novo.";
        crm_volta();
    }
    try {
        $pdo = crm_pdo();
    } catch (Exception $falha) {
        $pdo = null;
    }
    if (!$pdo) {
        $_SESSION["crm_aviso"] = "O banco ainda não está configurado, então nada foi salvo.";
        crm_volta();
    }

    if ($_POST["acao"] === "novo") {
        foreach ($novo as $campo => $padrao) {
            $novo[$campo] = trim((string) ($_POST[$campo] ?? $padrao));
        }
        if (!in_array($novo["origem"], $origensManuais, true)) {
            $novo["origem"] = "Outro";
        }
        $digitos = preg_replace("/\D+/", "", $novo["telefone"]);
        if ($novo["nome"] === "" || strlen($novo["nome"]) > 120 || strlen($digitos) < 10 || strlen($digitos) > 13) {
            $erroNovo = "Informe o nome e o telefone com DDD.";
        } else {
            $inserir = $pdo->prepare(
                "INSERT INTO contatos (criado_em, nome, telefone, origem, assunto, pagina, detalhes)
                 VALUES (:criado_em, :nome, :telefone, :origem, :assunto, :pagina, :detalhes)"
            );
            $inserir->execute([
                ":criado_em" => crm_agora(),
                ":nome" => $novo["nome"],
                ":telefone" => $novo["telefone"],
                ":origem" => $novo["origem"],
                ":assunto" => crm_corta($novo["assunto"], 800),
                ":pagina" => "",
                ":detalhes" => crm_corta($novo["detalhes"], 8000)
            ]);
            $_SESSION["crm_aviso"] = "Contato de " . $novo["nome"] . " salvo.";
            crm_volta("contato-" . $pdo->lastInsertId());
        }
    }

    if ($_POST["acao"] === "anotar") {
        $contatoId = (int) ($_POST["contato"] ?? 0);
        $texto = trim((string) ($_POST["texto"] ?? ""));
        if ($contatoId > 0 && $texto !== "") {
            crm_tabela_anotacoes($pdo);
            $inserir = $pdo->prepare("INSERT INTO anotacoes (contato_id, criado_em, texto) VALUES (:contato, :criado_em, :texto)");
            $inserir->execute([
                ":contato" => $contatoId,
                ":criado_em" => crm_agora(),
                ":texto" => crm_corta($texto, 4000)
            ]);
        }
        crm_volta("contato-" . $contatoId);
    }
}

$contatos = [];
$anotacoes = [];
$avisoBanco = "";
$avisoAnotacoes = "";

if ($entrou) {
    try {
        $pdo = crm_pdo();
        if (!$pdo) {
            $avisoBanco = "O banco ainda não está configurado. Crie um banco novo na Hostinger, importe crm/banco.sql e preencha crm/config.php.";
        } else {
            $consulta = $pdo->query("SELECT id, criado_em, nome, telefone, origem, assunto, pagina, detalhes FROM contatos ORDER BY criado_em DESC, id DESC LIMIT 300");
            $contatos = $consulta->fetchAll();
        }
    } catch (Exception $falha) {
        $avisoBanco = "Não foi possível ler a lista. Confira o nome, o usuário e a senha do banco em crm/config.php.";
    }

    if ($contatos) {
        try {
            crm_tabela_anotacoes($pdo);
            $ids = array_map("intval", array_column($contatos, "id"));
            $marcas = implode(",", array_fill(0, count($ids), "?"));
            $consulta = $pdo->prepare("SELECT contato_id, criado_em, texto FROM anotacoes WHERE contato_id IN ($marcas) ORDER BY criado_em ASC, id ASC");
            $consulta->execute($ids);
            foreach ($consulta->fetchAll() as $nota) {
                $anotacoes[(int) $nota["contato_id"]][] = $nota;
            }
        } catch (Exception $falha) {
            $avisoAnotacoes = "As anotações não puderam ser lidas. Importe de novo o arquivo crm/banco.sql no banco.";
        }
    }
}

function crm_h($texto)
{
    return htmlspecialchars((string) $texto, ENT_QUOTES, "UTF-8");
}

function crm_quando($data)
{
    $momento = DateTime::createFromFormat("Y-m-d H:i:s", (string) $data);
    if (!$momento) {
        return (string) $data;
    }
    return $momento->format("d/m/Y H:i");
}

function crm_whats($telefone)
{
    $digitos = preg_replace("/\D+/", "", (string) $telefone);
    if (strlen($digitos) >= 10 && strlen($digitos) <= 11) {
        $digitos = "55" . $digitos;
    }
    return "https://wa.me/" . $digitos;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Contatos · José Amim Alexandre</title>
  <link rel="stylesheet" href="crm.css">
</head>
<body class="crm-pagina">
  <main class="crm-caixa">
    <?php if (!$entrou): ?>
      <h1>Contatos</h1>
      <p>Lista de quem enviou nome e telefone no site.</p>
      <?php if ($erro !== ""): ?><p class="crm-erro"><?= crm_h($erro) ?></p><?php endif; ?>
      <form method="post" class="crm-login">
        <label>Senha
          <input type="password" name="senha" autocomplete="current-password" required>
        </label>
        <button type="submit">Entrar</button>
      </form>
    <?php else: ?>
      <div class="crm-topo">
        <h1>Contatos</h1>
        <a href="sair.php">Sair</a>
      </div>
      <p>Cada linha é uma pessoa, da mais recente para a mais antiga. Quem digitou no site e não clicou em enviar não aparece. A lista não mostra se a mensagem saiu no WhatsApp.</p>
      <?php if ($aviso !== ""): ?><p class="crm-ok"><?= crm_h($aviso) ?></p><?php endif; ?>
      <?php if ($avisoBanco !== ""): ?><p class="crm-erro"><?= crm_h($avisoBanco) ?></p><?php endif; ?>
      <?php if ($avisoAnotacoes !== ""): ?><p class="crm-erro"><?= crm_h($avisoAnotacoes) ?></p><?php endif; ?>

      <details class="crm-novo"<?= $erroNovo !== "" ? " open" : "" ?>>
        <summary>+ Novo contato</summary>
        <p>Para quem chegou por telefone, no balcão, por portal ou por indicação.</p>
        <?php if ($erroNovo !== ""): ?><p class="crm-erro"><?= crm_h($erroNovo) ?></p><?php endif; ?>
        <form method="post" class="crm-form">
          <input type="hidden" name="acao" value="novo">
          <input type="hidden" name="token" value="<?= crm_h($token) ?>">
          <label>Nome
            <input type="text" name="nome" value="<?= crm_h($novo["nome"]) ?>" maxlength="120" required>
          </label>
          <label>Telefone com DDD
            <input type="tel" name="telefone" value="<?= crm_h($novo["telefone"]) ?>" inputmode="tel" placeholder="(14) 90000-0000" required>
          </label>
          <label>Chegou por
            <select name="origem">
              <?php foreach ($origensManuais as $opcao): ?>
                <option value="<?= crm_h($opcao) ?>"<?= $novo["origem"] === $opcao ? " selected" : "" ?>><?= crm_h($opcao) ?></option>
              <?php endforeach; ?>
            </select>
          </label>
          <label>Assunto ou o que procura
            <input type="text" name="assunto" value="<?= crm_h($novo["assunto"]) ?>" maxlength="800" placeholder="Ex.: quer alugar casa no Centro">
          </label>
          <label class="crm-largo">Observação
            <textarea name="detalhes" rows="3"><?= crm_h($novo["detalhes"]) ?></textarea>
          </label>
          <button type="submit">Salvar contato</button>
        </form>
      </details>

      <?php if (!$contatos && $avisoBanco === ""): ?><p>Nenhum contato ainda.</p><?php endif; ?>
      <?php foreach ($contatos as $contato): ?>
        <?php $id = (int) $contato["id"]; $notas = $anotacoes[$id] ?? []; ?>
        <article class="crm-item" id="contato-<?= $id ?>">
          <p class="crm-quando"><?= crm_h(crm_quando($contato["criado_em"])) ?></p>
          <h2><?= crm_h($contato["nome"]) ?></h2>
          <p><a href="tel:+<?= crm_h(preg_replace("/\D+/", "", $contato["telefone"])) ?>"><?= crm_h($contato["telefone"]) ?></a>
            · <a href="<?= crm_h(crm_whats($contato["telefone"])) ?>" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a></p>
          <p><?= crm_h($contato["origem"]) ?></p>
          <?php if ((string) $contato["assunto"] !== ""): ?><p><?= nl2br(crm_h($contato["assunto"])) ?></p><?php endif; ?>
          <?php if ((string) $contato["detalhes"] !== "" && $contato["detalhes"] !== $contato["assunto"]): ?>
            <pre><?= crm_h($contato["detalhes"]) ?></pre>
          <?php endif; ?>

          <div class="crm-notas">
            <?php if ($notas): ?>
              <h3>Anotações</h3>
              <ul>
                <?php foreach ($notas as $nota): ?>
                  <li><span class="crm-quando"><?= crm_h(crm_quando($nota["criado_em"])) ?></span><?= nl2br(crm_h($nota["texto"])) ?></li>
                <?php endforeach; ?>
              </ul>
            <?php endif; ?>
            <details class="crm-anotar">
              <summary>Escrever anotação</summary>
              <form method="post">
                <input type="hidden" name="acao" value="anotar">
                <input type="hidden" name="token" value="<?= crm_h($token) ?>">
                <input type="hidden" name="contato" value="<?= $id ?>">
                <label>Anotação
                  <textarea name="texto" rows="3" maxlength="4000" required placeholder="Ex.: visitou a casa da Turmalina, achou o preço alto"></textarea>
                </label>
                <button type="submit">Salvar anotação</button>
              </form>
            </details>
          </div>
        </article>
      <?php endforeach; ?>
    <?php endif; ?>
  </main>
</body>
</html>
