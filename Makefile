SHELL := /bin/bash

.PHONY: setup
setup:
	@echo "Setting up..."
	@npm install
	@npx jest --clearCache

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

.PHONY: test-bundle-publish
test-bundle-publish:
	@echo "Running bundle_publish tests..."
	@npx jest __tests__/bundle_publish.test.ts --no-coverage
