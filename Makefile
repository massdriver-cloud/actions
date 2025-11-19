SHELL := /bin/bash

.PHONY: setup
setup: install test build

.PHONY: install
install:
	@echo "Installing dependencies..."
	@npm install

.PHONY: build
build:
	@echo "Building..."
	@npm run build

.PHONY: test
test:
	@echo "Running tests..."
	@npx jest --clearCache
	@npx jest --no-coverage
