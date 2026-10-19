-- O arquivo deve começar direto aqui (sem CREATE DATABASE e sem USE)
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
    descricao VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS retiradas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    data_retirada DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY (id_produto) REFERENCES produtos(id)

);
INSERT IGNORE INTO usuarios (nome, email, senha, tipo) 
VALUES ('Administrador', 'admin@tcc.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36YgyFcE7U967LdBfM1zTpi', 'admin');

INSERT IGNORE INTO usuarios (nome, email, senha, tipo) 
VALUES ('vivi', 'vivi@tcc.com', '$2a$12$gbAz753lBjCLNas0yV8xSeHZ8jMcBYm00kTXI3vA3Wa2Q.ZvuoOI6', 'comum');
