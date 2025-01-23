.PHONY: build rebuild start stop logs ps clean rebuild-api test test-coverage test-watch

# Builds and starts all services
build:
	docker compose build
	docker compose up -d

# Rebuilds and restarts all services
rebuild:
	docker compose down
	docker compose build
	docker compose up -d

# Rebuilds only the API service
rebuild-api:
	docker compose stop api
	docker compose rm -f api
	docker compose build api
	docker compose up -d api

# Starts Docker compose
start:
	docker compose up -d

# Stops Docker compose
stop:
	docker compose down

# Shows container logs
logs:
	docker compose logs -f

# Shows API logs
logs-api:
	docker compose logs -f api

# Lists running containers
ps:
	docker compose ps

# Cleans node modules and docker volumes
clean:
	rm -rf node_modules
	docker compose down -v

# Command to use when setting up the project for the first time
setup:
	npm install
	docker compose up -d

# Test commands

# Runs all tests
test:
	npm test

# Generates test coverage report
test-coverage:
	npm test -- --coverage

# Runs tests in watch mode
test-watch:
	npm test -- --watch

