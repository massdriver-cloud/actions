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
		echo "Error: VERSION is required. Usage: make release VERSION=v5.3.4"; \
		exit 1; \
	fi
	@echo "Tagging release $(VERSION)..."
	@git tag $(VERSION)
	@git push origin $(VERSION)
	@MAJOR=$$(echo $(VERSION) | grep -oE '^v[0-9]+'); \
	echo "Updating major version tag $$MAJOR..."; \
	git tag -d $$MAJOR 2>/dev/null || true; \
	git tag $$MAJOR; \
	git push origin $$MAJOR --force
	@echo "✓ Released $(VERSION) and updated major version tag"
