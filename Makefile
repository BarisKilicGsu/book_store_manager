.PHONY: rebuild start stop logs ps clean rebuild-api test test-coverage test-watch test-file

# Tüm servisleri yeniden build edip başlatır
rebuild:
	docker compose down
	docker compose build
	docker compose up -d

# Sadece API servisini yeniden build eder
rebuild-api:
	docker compose stop api
	docker compose rm -f api
	docker compose build api
	docker compose up -d api

# Docker compose'u başlatır
start:
	docker compose up -d

# Docker compose'u durdurur
stop:
	docker compose down

# Container loglarını gösterir
logs:
	docker compose logs -f

# API loglarını gösterir
logs-api:
	docker compose logs -f api

# Çalışan container'ları listeler
ps:
	docker compose ps

# Node modüllerini ve docker volume'larını temizler
clean:
	rm -rf node_modules
	docker compose down -v

# Projeyi ilk kez kurarken kullanılacak komut
setup:
	npm install
	docker compose up -d

# Test komutları

# Tüm testleri çalıştırır
test:
	npm test

# Test coverage raporu oluşturur
test-coverage:
	npm test -- --coverage

# Testleri watch modunda çalıştırır
test-watch:
	npm test -- --watch

# Belirli bir test dosyasını çalıştırır (TEST_FILE parametresi ile)
test-file:
	npm test -- $(TEST_FILE) 