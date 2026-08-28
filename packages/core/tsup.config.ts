import { defineConfig } from 'tsup';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
    treeshake: true,
    minify: false,
    splitting: false,
    loader: {
      '.css': 'text',
    },
    onSuccess: async () => {
      const distFiles = ['dist/index.mjs', 'dist/index.js'];
      for (const file of distFiles) {
        const filePath = path.resolve(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (!content.startsWith("'use client';") && !content.startsWith('"use client";')) {
            fs.writeFileSync(filePath, `'use client';\n${content}`, 'utf8');
          }
        }
      }
    },
  },
  {
    entry: ['src/cli.ts'],
    format: ['cjs'],
    outDir: 'bin',
    banner: {
      js: '#!/usr/bin/env node',
    },
    dts: false,
    sourcemap: false,
    clean: false,
    minify: false,
    treeshake: true,
  },
]);
