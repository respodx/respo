# Contributing to Respo (`responsive-dx`)

Thank you for your interest in contributing to **Respo**! We welcome contributions, bug fixes, and feature proposals.

---

## 🛠️ Development Setup

This project uses a **pnpm + Turborepo** monorepo setup:

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/responsive-dx.git
cd responsive-dx

# 2. Install dependencies
pnpm install

# 3. Start local development (runs package build in watch mode)
pnpm dev

# 4. Run tests
pnpm -F responsive-dx test
```

---

## 🧪 Testing Guidelines

- Unit tests are located under `packages/core/src/__tests__/`.
- Run `pnpm -F responsive-dx test` to execute Vitest tests.
- Ensure all tests pass and `tsc --noEmit` reports 0 errors before opening a pull request.

---

## 📜 Pull Request Process

1. Fork the repo and create your branch from `main`.
2. Ensure consistent code formatting and clean commit messages.
3. If adding a new feature, include relevant unit tests.
4. Open a Pull Request with a clear description of the changes and motivation.
