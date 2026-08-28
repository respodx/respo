import { defineConfig } from 'tsup';
import fs from 'fs';
import path from 'path';

export default defineConfig({
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
      const filePath = path.resolve(__dirname, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.startsWith("'use client';") && !content.startsWith('"use client";')) {
          fs.writeFileSync(filePath, `'use client';\n${content}`, 'utf8');
        }
      }
    }
  },
});
