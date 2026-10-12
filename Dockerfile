# Ocean İnşaat — üretim imajı (Dokploy / Docker)
#
# Sayfalar derleme sırasında veritabanından üretildiği için `next build`, imaj oluşturulurken değil
# konteyner açılırken çalışır (o anda veritabanına erişim vardır). Bkz. scripts/docker-start.sh
FROM node:22-bookworm-slim

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Derleme ve migration araçları (tsx, drizzle, typescript) devDependencies içindedir; hepsi kurulur.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production \
    PORT=3000 \
    STORAGE_DIR=/data/storage

# Yüklenen dosyalar için kalıcı birim bu dizine bağlanmalıdır.
VOLUME ["/data/storage"]
EXPOSE 3000

CMD ["sh", "scripts/docker-start.sh"]
