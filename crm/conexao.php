<?php
function crm_config()
{
    $arquivo = __DIR__ . "/config.php";
    if (!is_file($arquivo)) {
        return null;
    }
    $config = require $arquivo;
    if (!is_array($config) || $config["db_nome"] === "" || $config["db_usuario"] === "") {
        return null;
    }
    return $config;
}

function crm_corta($texto, $limite)
{
    if (function_exists("mb_substr")) {
        return mb_substr($texto, 0, $limite);
    }
    return substr($texto, 0, $limite);
}

function crm_pdo()
{
    $config = crm_config();
    if (!$config) {
        return null;
    }
    $dsn = "mysql:host=" . $config["db_host"] . ";dbname=" . $config["db_nome"] . ";charset=utf8mb4";
    return new PDO($dsn, $config["db_usuario"], $config["db_senha"], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
}
