#!/bin/sh
# Konteyner açılışı: şemayı günceller, başlangıç verisini (yalnızca eksikse) yükler, siteyi derler ve başlatır.
set -e

echo "[1/4] Veritabanı migration"
npx tsx scripts/migrate.ts

echo "[2/4] Başlangıç verisi (var olan kayıtların üzerine yazmaz)"
npx tsx scripts/seed.ts

echo "[3/4] Üretim derlemesi"
npx next build

echo "[4/4] Sunucu başlatılıyor (port ${PORT:-3000})"
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
