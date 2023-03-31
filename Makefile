SHELL := /bin/bash

.PHONY: install
install:
	@echo "Installing dependencies..."
	@npm install

.PHONY: build
build:
	@echo "Building..."
	@npm run build
