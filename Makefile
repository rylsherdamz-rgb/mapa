.PHONY: all build build-wasm clean test deploy

CONTRACTS = mapa_game mapa_location_vault

all: build-wasm

build:
	@for c in $(CONTRACTS); do \
		echo "Building $$c..."; \
		cd contracts/$$c && cargo build --release 2>&1 | tail -1; \
	done

build-wasm:
	@for c in $(CONTRACTS); do \
		echo "Building $$c WASM..."; \
		cargo build --release --target wasm32v1-none --manifest-path contracts/$$c/Cargo.toml 2>&1 | tail -1; \
	done

test:
	@for c in $(CONTRACTS); do \
		echo "Testing $$c..."; \
		cargo test --manifest-path contracts/$$c/Cargo.toml 2>&1 | tail -5; \
	done

clean:
	@for c in $(CONTRACTS); do \
		cd contracts/$$c && cargo clean 2>/dev/null; \
	done
	cd tests && rm -rf node_modules

deploy:
	./scripts/deploy.sh

deploy-mainnet:
	./scripts/deploy-mainnet.sh

verify:
	./scripts/verify.sh

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

frontend-lint:
	cd frontend && npm run lint

test-integration:
	cd tests && npm test
