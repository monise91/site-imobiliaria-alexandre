<?php
session_name("crmimob");
session_start();

require __DIR__ . "/conexao.php";
$config = is_file(__DIR__ . "/config.php") ? require __DIR__ . "/config.php" : null;
$senhaPainel = is_array($config) ? (string) ($config["painel_senha"] ?? "") : "";
$erro = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $digitada = (string) ($_POST["senha"] ?? "");
    if ($senhaPainel !== "" && hash_equals($senhaPainel, $digitada)) {
        session_regenerate_id(true);
        $_SESSION["crm"] = true;
        header("Location: index.php");
        exit;
    }
    $erro = "Senha incorreta.";
}

$entrou = !empty($_SESSION["crm"]);
$contatos = [];
$avisoBanco = "";

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
  <title>Contatos · Imobiliária José Amim Alexandre</title>
  <link rel="stylesheet" href="../styles.css">
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
      <p>Cada linha é uma pessoa, da mais recente para a mais antiga. Quem digitou e não clicou em enviar não aparece. A lista não mostra se a mensagem saiu no WhatsApp.</p>
      <?php if ($avisoBanco !== ""): ?><p class="crm-erro"><?= crm_h($avisoBanco) ?></p><?php endif; ?>
      <?php if (!$contatos && $avisoBanco === ""): ?><p>Nenhum contato ainda.</p><?php endif; ?>
      <?php foreach ($contatos as $contato): ?>
        <article class="crm-item">
          <p class="crm-quando"><?= crm_h(crm_quando($contato["criado_em"])) ?></p>
          <h2><?= crm_h($contato["nome"]) ?></h2>
          <p><a href="tel:+<?= crm_h(preg_replace("/\D+/", "", $contato["telefone"])) ?>"><?= crm_h($contato["telefone"]) ?></a>
            · <a href="<?= crm_h(crm_whats($contato["telefone"])) ?>" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a></p>
          <p><?= crm_h($contato["origem"]) ?></p>
          <?php if ($contato["assunto"] !== ""): ?><p><?= nl2br(crm_h($contato["assunto"])) ?></p><?php endif; ?>
          <?php if ($contato["detalhes"] !== "" && $contato["detalhes"] !== $contato["assunto"]): ?>
            <pre><?= crm_h($contato["detalhes"]) ?></pre>
          <?php endif; ?>
        </article>
      <?php endforeach; ?>
    <?php endif; ?>
  </main>
</body>
</html>
