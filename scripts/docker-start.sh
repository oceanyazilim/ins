#!/bin/sh
# Konteyner açılışı: şemayı günceller, başlangıç verisini (yalnızca eksikse) yükler, siteyi derler ve başlatır.
set -e

# --- Ortam denetimi: değerler yazdırılmaz, yalnızca tanımlı olup olmadıkları ---
if [ -z "$DATABASE_URL" ]; then
  echo "HATA: DATABASE_URL bu konteynerde tanımlı değil."
  echo "Tanımlı ortam değişkeni adları:"
  env | cut -d= -f1 | sort | tr '\n' ' '
  echo ""
  echo "Dokploy > uygulama > Environment sekmesine DATABASE_URL=... satırını ekleyip kaydedin ve yeniden deploy edin."
  sleep 60
  exit 1
fi

# Parola gösterilmeden yalnızca hedef sunucu yazdırılır
node -e '
try {
  const u = new URL(process.env.DATABASE_URL);
  console.log("DATABASE_URL hedefi: " + u.protocol + "//" + u.hostname + ":" + (u.port || 5432) + u.pathname);
} catch {
  console.log("HATA: DATABASE_URL geçerli bir adres biçiminde değil (başında/sonunda boşluk, tırnak ya da < > olmamalı).");
  process.exit(1);
}' || { sleep 60; exit 1; }

echo "[1/4] Veritabanı migration"
# Veritabanı servisi henüz açılıyor olabilir; birkaç kez denenir.
n=0
until npx tsx scripts/migrate.ts; do
  n=$((n + 1))
  if [ "$n" -ge 10 ]; then
    echo "HATA: veritabanına 10 denemede bağlanılamadı. Yukarıdaki hata nedenine bakın."
    sleep 60
    exit 1
  fi
  echo "Veritabanına bağlanılamadı, 5 sn sonra yeniden denenecek ($n/10)"
  sleep 5
done

echo "[2/4] Başlangıç verisi (var olan kayıtların üzerine yazmaz)"
npx tsx scripts/seed.ts

echo "[3/4] Üretim derlemesi"
npx next build

echo "[4/4] Sunucu başlatılıyor (port ${PORT:-3000})"
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
