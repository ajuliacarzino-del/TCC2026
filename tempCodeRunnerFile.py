from flask import Flask, render_template, jsonify, request, redirect
import mysql.connector
 
app = Flask(__name__)
 
def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="almoxarifado"
    )
 
@app.route("/")
def login():
    return render_template("login.html")

@app.route("/paginadois")
def paginadois():
    return render_template("paginadois.html")

@app.route("/adm")
def adm():
    return render_template("adm.html")

@app.route("/add")
def add():
    return render_template("add.html")

@app.route("/adicio")
def adicio():
    return render_template("adicio.html")

@app.route("/almoxarifado")
def almoxarifado():
    return render_template("almoxarifado.html")

@app.route("/retirada")
def retirada():
    return render_template("retirada.html")

@app.route("/api/produtos")
def get_produtos():
    db = conectar()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM produtos")
    produtos = cursor.fetchall()
    db.close()
    return jsonify(produtos)

@app.route("/adicionar", methods=["POST"])
def adicionar():
    nome      = request.form["nome"]
    categoria = request.form["categoria"]
    quantidade = request.form["quantidade"]

    db = conectar()
    cursor = db.cursor()

    cursor.execute(
        "INSERT INTO produtos (Nome, Categoria, Quantidade) VALUES (%s, %s, %s)",
        (nome, categoria, quantidade)
    )
    db.commit()
    db.close()
    return redirect("/almoxarifado")
 
if __name__ == "__main__":
  app.run(host='0.0.0.0', port=5000, debug=True)

