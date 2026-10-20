CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'comum') DEFAULT 'comum'
);

CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    quantidade INT NOT NULL DEFAULT 0,
    categoria VARCHAR(50),
    imagem_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS movimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_nome VARCHAR(100),
    tipo VARCHAR(20),
    quantidade INT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO usuarios (nome, email, senha, tipo)
VALUES ('Administrador', 'admin@tcc.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36YgyFcE7U967LdBfM1zTpi', 'admin');

INSERT IGNORE INTO usuarios (nome, email, senha, tipo)
VALUES ('vivi', 'vivi@tcc.com', '$2a$12$gbAz753lBjCLNas0yV8xSeHZ8jMcBYm00kTXI3vA3Wa2Q.ZvuoOI6', 'comum');

INSERT IGNORE INTO usuarios (nome, email, senha, tipo)
VALUES ('Admin Teste', 'admin@teste.com', '$2b$12$t/YseWDQ.TTnq4Sv2oNt8eTRvkUuWAAJJuMGVKPNov91g8m7QN6R2', 'admin');