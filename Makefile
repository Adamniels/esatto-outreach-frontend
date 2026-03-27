.PHONY: install dev build preview

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

# Placeholder for when you add frontend tests (like Vitest)
test:
	@echo "No tests configured yet. Install Vitest -> npm i -D vitest"
