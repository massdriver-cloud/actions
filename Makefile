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

.PHONY: release
release:
	@if [ -z "$(VERSION)" ]; then \
		echo "Error: VERSION is required. Usage: make release VERSION=5.3.4"; \
		exit 1; \
	fi
	@TAG=$(VERSION); \
	if [[ ! $$TAG =~ ^v ]]; then \
		TAG="v$$TAG"; \
	fi; \
	echo "Tagging release $$TAG..."; \
	git tag $$TAG; \
	git push origin $$TAG; \
	MAJOR=$$(echo $$TAG | grep -oE '^v[0-9]+'); \
	echo "Updating major version tag $$MAJOR..."; \
	git tag -d $$MAJOR 2>/dev/null || true; \
	git tag $$MAJOR; \
	git push origin $$MAJOR --force; \
	if command -v gh >/dev/null 2>&1; then \
		echo "Creating GitHub release for $$TAG..."; \
		gh release create $$TAG --title "$$TAG" --generate-notes || echo "⚠ Failed to create GitHub release (may already exist)"; \
	else \
		echo "⚠ GitHub CLI (gh) not installed, skipping release creation"; \
	fi; \
	echo "✓ Released $$TAG and updated $$MAJOR"
