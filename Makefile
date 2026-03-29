.PHONY: install dev build preview test lint typecheck

# Frontend Makefile

install:
	@echo "Installing NPM packages..."
	npm install

dev:
	@echo "Starting Vite Dev Server..."
	npm run dev

build:
	@echo "Building Frontend for Production..."
	npm run build

preview:
	@echo "Previewing Production Build..."
	npm run preview

test:
	@echo "Running frontend tests..."
	npm run test

lint:
	@echo "Linting frontend..."
	npm run lint

typecheck:
	@echo "Typechecking frontend..."
	npm run typecheck
