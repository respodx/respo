# Contributing to Respo DX

Thank you for your interest in contributing to **Respo DX**. We welcome contributions, bug fixes, and feature proposals.

---

## Development Setup

This project uses a **pnpm + Turborepo** monorepo setup:

```bash
# 1. Fork the repo and clone your fork
git clone https://github.com/<your-username>/respo.git
cd respo

# 2. Install dependencies
pnpm install

# 3. Start local development (runs package build in watch mode)
pnpm dev

# 4. Run tests
pnpm --filter responsive-dx test
```

---

## Testing Guidelines

- Unit tests are located under `packages/core/src/__tests__/`.
- Run `pnpm --filter responsive-dx test` to execute Vitest tests.
- Ensure all tests pass and `pnpm --filter responsive-dx lint` reports 0 errors before opening a pull request.

---

## Pull Request Process

1. Fork the repository and create your feature branch from `main` (e.g. `git checkout -b feat/my-feature` or `git checkout -b fix/issue-description`).
2. Ensure consistent code formatting and clean commit messages.
3. If adding a new feature or fixing a bug, include relevant unit tests.
4. Push to your fork and open a Pull Request against `main` with a clear description of the changes and motivation.
