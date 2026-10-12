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
