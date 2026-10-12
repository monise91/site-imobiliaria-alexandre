<?php
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["ok" => false]);
    exit;
}

$bruto = file_get_contents("php://input");
$dados = json_decode($bruto, true);
if (!is_array($dados)) {
    http_response_code(400);
    echo json_encode(["ok" => false]);
    exit;
}

if (!empty($dados["empresa"])) {
    echo json_encode(["ok" => true]);
    exit;
}

$nome = trim((string) ($dados["nome"] ?? ""));
$telefone = trim((string) ($dados["telefone"] ?? ""));
$origem = trim((string) ($dados["origem"] ?? ""));
$assunto = trim((string) ($dados["assunto"] ?? ""));
$pagina = trim((string) ($dados["pagina"] ?? ""));
$detalhes = trim((string) ($dados["detalhes"] ?? ""));
$digitos = preg_replace("/\D+/", "", $telefone);

if ($nome === "" || strlen($nome) > 120 || strlen($digitos) < 10 || strlen($digitos) > 13) {
    http_response_code(400);
    echo json_encode(["ok" => false, "erro" => "Informe nome e telefone."]);
    exit;
}

if ($origem !== "Formulário" && $origem !== "WhatsApp") {
    $origem = "WhatsApp";
}

require __DIR__ . "/conexao.php";
$pdo = crm_pdo();
if (!$pdo) {
    http_response_code(503);
    echo json_encode(["ok" => false, "erro" => "O cadastro ainda não está ligado."]);
    exit;
}

$fuso = new DateTimeZone("America/Sao_Paulo");
$agora = new DateTime("now", $fuso);

$inserir = $pdo->prepare(
    "INSERT INTO contatos (criado_em, nome, telefone, origem, assunto, pagina, detalhes)
     VALUES (:criado_em, :nome, :telefone, :origem, :assunto, :pagina, :detalhes)"
);
$inserir->execute([
    ":criado_em" => $agora->format("Y-m-d H:i:s"),
    ":nome" => $nome,
    ":telefone" => $telefone,
    ":origem" => $origem,
    ":assunto" => crm_corta($assunto, 800),
    ":pagina" => crm_corta($pagina, 500),
    ":detalhes" => crm_corta($detalhes, 8000)
]);

echo json_encode(["ok" => true]);
