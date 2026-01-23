PROJECT_NAME = ticket

DC = docker compose

.PHONY: up down build restart logs ps clean

.PHONY: build-prod

## Build images
build:
	$(DC) build

## Start containers (dev mode)
up:
	$(DC) up

## Start in background
up-d:
	$(DC) up -d

## Stop containers
down:
	# Stop containers and remove volumes (cleans the DB data volume)
	$(DC) down -v --remove-orphans

## Restart everything
restart:
	$(DC) down
	$(DC) up --build

## Show logs
logs:
	$(DC) logs -f

## Show running containers
ps:
	$(DC) ps

## Rebuild everything from scratch
clean:
	$(DC) down -v

## Build production-ready assets and images
build-prod:
	# Build frontend production assets locally
	cd ticket-frontend && npm ci --silent && npm run build

	# Build Docker images with production build args
	APP_ENV=production APP_DEBUG=false $(DC) build --no-cache --pull --build-arg APP_ENV=production backend frontend

## Create or update an admin user inside the backend container
# Usage: make create-admin EMAIL=admin@example.com USERNAME=admin PASSWORD=secret DEPARTMENT=IT
.PHONY: create-admin
create-admin:
	$(DC) run --rm backend php /var/www/scripts/create_admin.php $(EMAIL) $(USERNAME) $(PASSWORD) $(DEPARTMENT)

re :
	$(MAKE) down
	$(MAKE) build
	$(MAKE) up
