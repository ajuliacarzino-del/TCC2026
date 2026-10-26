FROM python:3.11-slim

WORKDIR /app

# 1. Instala o GCC e cabeçalhos do Python (obrigatório para compilar o bcrypt)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. Instala todas as dependências direto pelo pip 
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir flask mysql-connector-python flask-bcrypt

# 3. Copia o código do projeto
COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
