FROM python:3.11-slim

# Çalışma dizini
WORKDIR /app

# Backend kodunu kopyala
COPY backend/ /app/backend/

WORKDIR /app/backend

# Bağımlılıkları yükle
RUN pip install --no-cache-dir -r requirements.txt

# Varsayılan port (uvicorn)
ENV PORT=8001

# Uygulamayı başlat
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
