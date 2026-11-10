CREATE TABLE IF NOT EXISTS contatos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  criado_em DATETIME NOT NULL,
  nome VARCHAR(120) NOT NULL,
  telefone VARCHAR(40) NOT NULL,
  origem VARCHAR(40) NOT NULL,
  assunto VARCHAR(800) NOT NULL,
  pagina VARCHAR(500) NOT NULL,
  detalhes TEXT NULL,
  PRIMARY KEY (id),
  KEY idx_contatos_criado (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS anotacoes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  contato_id INT UNSIGNED NOT NULL,
  criado_em DATETIME NOT NULL,
  texto TEXT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_anotacoes_contato (contato_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
