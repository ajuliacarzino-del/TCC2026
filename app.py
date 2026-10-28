from flask import Flask, render_template, request, jsonify
from flask_bcrypt import Bcrypt
import mysql.connector

app = Flask(__name__)
bcrypt = Bcrypt(app)


def conectar_bd():
    return mysql.connector.connect(
        host="db",
        user="root",
        password="root123",
        database="almoxarifado"
    )


# =====================================================
#  ROTAS HTML (páginas)
# =====================================================

@app.route("/")
def login():
    return render_template("login.html")

@app.route("/logout")
def logout():
    return render_template("login.html")

@app.route("/adm")
def adm():
    return render_template("adm.html")

@app.route("/almoxarifado")
def almoxarifado():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM produtos")
    produtos = cursor.fetchall()
    conn.close()
    return render_template("almoxarifado.html", produtos=produtos)

@app.route("/add")
def add():
    return render_template("add.html")

@app.route("/retirada")
def retirada():
    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM produtos WHERE quantidade > 0")
    produtos = cursor.fetchall()
    conn.close()
    return render_template("retirada.html", produtos=produtos)

@app.route("/adicio")
def adicio():
    return render_template("adicio.html")


# =====================================================
# =====================================================
#  API - GET (consultas)
# =====================================================

@app.route("/api/produtos", methods=["GET"])
def api_listar_produtos():
    try:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM produtos")
        produtos = cursor.fetchall()
        conn.close()
        return jsonify(produtos)
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500


@app.route("/api/produtos/disponiveis", methods=["GET"])
def api_produtos_disponiveis():
    try:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM produtos WHERE quantidade > 0")
        produtos = cursor.fetchall()
        conn.close()
        return jsonify(produtos)
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500


@app.route("/api/produtos/<int:produto_id>", methods=["GET"])
def api_buscar_produto(produto_id):
    try:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM produtos WHERE id = %s", (produto_id,))
        produto = cursor.fetchone()
        conn.close()

        if not produto:
            return jsonify({"status": "erro", "mensagem": "Produto não encontrado!"}), 404
        return jsonify(produto)
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500


@app.route("/api/usuarios", methods=["GET"])
def api_listar_usuarios():
    try:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)
        # a senha (hash) não é enviada de propósito
        cursor.execute("SELECT id, nome, email, tipo FROM usuarios")
        usuarios = cursor.fetchall()
        conn.close()
        return jsonify(usuarios)
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500


@app.route("/api/movimentacoes", methods=["GET"])
def api_listar_movimentacoes():
    try:
        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM movimentacoes ORDER BY data_hora DESC")
        movimentacoes = cursor.fetchall()
        conn.close()
        return jsonify(movimentacoes)
    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)}), 500


# =====================================================
# # API - POST (gravações) 
# =====================================================

@app.route("/api/fazer_login", methods=["POST"])
def api_fazer_login():
    try:
        dados_json = request.get_json(silent=True)
        
        if dados_json:
            usuario = dados_json.get("usuario") or dados_json.get("email")
            senha = dados_json.get("senha")
        else:
            usuario = request.form.get("usuario") or request.form.get("email")
            senha = request.form.get("senha")

        if usuario: usuario = str(usuario).strip()
        if senha: senha = str(senha).strip()

        print("--- TENTATIVA DE LOGIN ---", flush=True)
        print(f"Usuário recebido: {usuario}", flush=True)

        if not usuario or not senha:
            return jsonify({"status": "erro", "mensagem": "Usuário e senha são obrigatórios!"}), 400

        conn = conectar_bd()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (usuario,))
        user_bd = cursor.fetchone()
        conn.close()

        if user_bd and bcrypt.check_password_hash(user_bd["senha"], senha):
            proxima_pagina = "/adm" if user_bd["tipo"] == "admin" else "/almoxarifado"
            print(f"Login bem-sucedido para: {usuario}", flush=True)
            return jsonify({"status": "sucesso", "redirect": proxima_pagina})
        else:
            print(f"Falha de login para: {usuario} (401)", flush=True)
            return jsonify({"status": "erro", "mensagem": "Usuário ou senha incorretos!"}), 401

    except Exception as e:
        print(f"ERRO NO LOGIN: {str(e)}", flush=True)
        return jsonify({"status": "erro", "mensagem": str(e)}), 500


@app.route("/api/cadastrar_usuario", methods=["POST"])
def api_cadastrar_usuario():
    try:
        dados_json = request.get_json(silent=True)
        
        if dados_json:
            email = dados_json.get("email") or dados_json.get("usuario")
            senha = dados_json.get("senha")
            tipo = dados_json.get("tipo") or dados_json.get("permissao", "comum")
            nome = dados_json.get("nome", email)
        else:
            email = request.form.get("usuario") or request.form.get("email")
            senha = request.form.get("senha")
            tipo = request.form.get("permissao") or request.form.get("tipo", "comum")
            nome = request.form.get("nome", email)

        if email: email = str(email).strip()
        if senha: senha = str(senha).strip()

        if not email or not senha:
            return jsonify({"status": "erro", "mensagem": "E-mail e senha são obrigatórios!"}), 400

        senha_hash = bcrypt.generate_password_hash(senha).decode("utf-8")

        conn = conectar_bd()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (%s, %s, %s, %s)",
            (nome, email, senha_hash, tipo)
        )
        conn.commit()
        conn.close() 
        
        print(f"Usuário cadastrado com sucesso: {email}", flush=True)
        return jsonify({"status": "sucesso", "mensagem": "Usuário cadastrado com sucesso!"})
    except Exception as e:
        print(f"ERRO NO CADASTRO DE USUÁRIO: {e}", flush=True)
        return jsonify({"status": "erro", "mensagem": str(e)}), 400


@app.route("/api/adicionar_item", methods=["POST"])
def api_adicionar_item():
    try:
        dados_json = request.get_json(silent=True)
        
        if dados_json:
            nome = dados_json.get("nome") or dados_json.get("produto_nome")
            quantidade = dados_json.get("quantidade")
            imagem_url = dados_json.get("imagem_url")
            categoria = dados_json.get("categoria")  # Captura a categoria do JSON
        else:
            nome = request.form.get("nome") or request.form.get("produto_nome")
            quantidade = request.form.get("quantidade")
            imagem_url = request.form.get("imagem_url")
            categoria = request.form.get("categoria")  # Captura a categoria do Form

        if not nome or not quantidade:
            return jsonify({"status": "erro", "mensagem": "Nome do produto e quantidade são obrigatórios!"}), 400

        quantidade = int(quantidade)
        if quantidade <= 0:
            return jsonify({"status": "erro", "mensagem": "A quantidade deve ser maior que zero!"}), 400

        # Tratamento de Strings e Valores Nulos
        imagem_url = str(imagem_url).strip() if imagem_url else None
        categoria = str(categoria).strip() if categoria else "Geral"  # Define "Geral" se vier vazio

        conn = conectar_bd()
        cursor = conn.cursor()
        
        # 1) Insere ou Atualiza o estoque do produto (incluindo imagem_url e categoria)
        # VALUES(coluna) garante que o MySQL use o dado novo enviado no parâmetro caso o item já exista
        cursor.execute(
            "INSERT INTO produtos (nome, quantidade, imagem_url, categoria) VALUES (%s, %s, %s, %s) "
            "ON DUPLICATE KEY UPDATE "
            "quantidade = quantidade + VALUES(quantidade), "
            "imagem_url = VALUES(imagem_url), "
            "categoria = VALUES(categoria)",
            (nome, quantidade, imagem_url, categoria)
        )
        
        # 2) Registra a movimentação de entrada
        cursor.execute(
            "INSERT INTO movimentacoes (produto_nome, tipo, quantidade) VALUES (%s, 'Entrada', %s)",
            (nome, quantidade)
        )

        conn.commit()
        conn.close()

        print(f"Estoque atualizado: {nome} (+{quantidade})", flush=True)
        return jsonify({"status": "sucesso", "mensagem": "Item adicionado ao estoque!"})
    except Exception as e:
        print(f"ERRO AO ADICIONAR ITEM: {str(e)}", flush=True)
        return jsonify({"status": "erro", "mensagem": str(e)}), 400

        
        # 2) Registra a movimentação de entrada
        cursor.execute(
            "INSERT INTO movimentacoes (produto_nome, tipo, quantidade) VALUES (%s, 'Entrada', %s)",
            (nome, quantidade)
        )

        conn.commit()
        conn.close()

        print(f"Estoque atualizado: {nome} (+{quantidade})", flush=True)
        return jsonify({"status": "sucesso", "mensagem": "Item adicionado ao estoque!"})
    except Exception as e:
        print(f"ERRO AO ADICIONAR ITEM: {str(e)}", flush=True)
        return jsonify({"status": "erro", "mensagem": str(e)}), 400



import json  # Certifique-se de ter essa importação no topo do arquivo

@app.route("/api/retirar_item", methods=["POST"])
def api_retirar_item():
    dados = request.get_json(silent=True)
    
    # Correção: Se chegar como string pura, converte em dicionário do Python
    if isinstance(dados, str):
        try:
            dados = json.loads(dados)
        except Exception:
            dados = None
            
    # Se não veio JSON válido, tenta ler os dados do formulário tradicional
    if not dados:
        dados = request.form

    # 1) Validação da entrada
    try:
        produto_id = int(dados.get("produto_id"))
        quantidade = int(dados.get("quantidade"))
    except (TypeError, ValueError):
        return jsonify({
            "status": "erro",
            "mensagem": "ID do produto e quantidade devem ser números válidos!"
        }), 400

    if quantidade <= 0:
        return jsonify({
            "status": "erro",
            "mensagem": "A quantidade deve ser maior que zero!"
        }), 400

    conn = None
    cursor = None
    try:
        conn = conectar_bd()

        if conn.in_transaction:
            conn.rollback()
        conn.start_transaction()

        cursor = conn.cursor(dictionary=True)

      
        cursor.execute(
            "SELECT id, nome, quantidade FROM produtos WHERE id = %s FOR UPDATE",
            (produto_id,)
        )
        produto = cursor.fetchone()

        if not produto:
            conn.rollback()
            return jsonify({"status": "erro", "mensagem": "Produto não encontrado!"}), 404

        if produto["quantidade"] < quantidade:
            conn.rollback()
            return jsonify({
                "status": "erro",
                "mensagem": f"Estoque insuficiente! Disponível: {produto['quantidade']}"
            }), 400

        cursor.execute(
            "UPDATE produtos SET quantidade = quantidade - %s WHERE id = %s",
            (quantidade, produto_id)
        )

        cursor.execute(
            "INSERT INTO movimentacoes (produto_nome, tipo, quantidade) VALUES (%s, %s, %s)",
            (produto["nome"], "Saída", quantidade)
        )

        conn.commit()

        print(f"Retirada realizada: {produto['nome']} (-{quantidade})", flush=True)
        return jsonify({
            "status": "sucesso",
            "mensagem": "Retirada realizada com sucesso!",
            "estoque_atual": produto["quantidade"] - quantidade
        })

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"ERRO AO RETIRAR ITEM: {e}", flush=True)
        return jsonify({
            "status": "erro",
            "mensagem": "Erro interno ao realizar a retirada."
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)