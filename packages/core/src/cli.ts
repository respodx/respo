import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export type PackageManager = 'pnpm' | 'yarn' | 'bun' | 'npm';

export type FrameworkType =
  | 'next-app'
  | 'next-pages'
  | 'vite-react'
  | 'remix'
  | 'astro'
  | 'react-generic';

export interface DetectionResult {
  framework: FrameworkType;
  frameworkName: string;
  targetFile: string | null;
  packageManager: PackageManager;
  isInstalled: boolean;
}

export function detectPackageManager(cwd: string): PackageManager {
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(cwd, 'bun.lockb')) || fs.existsSync(path.join(cwd, 'bun.lock'))) return 'bun';
  return 'npm';
}

export function detectFrameworkAndLayout(cwd: string): DetectionResult {
  const pkgPath = path.join(cwd, 'package.json');
  let dependencies: Record<string, string> = {};
  let devDependencies: Record<string, string> = {};

  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      dependencies = pkg.dependencies || {};
      devDependencies = pkg.devDependencies || {};
    } catch {
      // Ignore parse error
    }
  }

  const allDeps = { ...dependencies, ...devDependencies };
  const isInstalled = Boolean(allDeps['responsive-dx']);
  const packageManager = detectPackageManager(cwd);

  const fileExists = (relPath: string) => fs.existsSync(path.join(cwd, relPath));

  // 1. Next.js App Router
  const nextAppCandidates = [
    'app/layout.tsx',
    'app/layout.jsx',
    'app/layout.js',
    'src/app/layout.tsx',
    'src/app/layout.jsx',
    'src/app/layout.js',
  ];
  for (const candidate of nextAppCandidates) {
    if (fileExists(candidate)) {
      return {
        framework: 'next-app',
        frameworkName: 'Next.js (App Router)',
        targetFile: candidate,
        packageManager,
        isInstalled,
      };
    }
  }

  // 2. Next.js Pages Router
  const nextPagesCandidates = [
    'pages/_app.tsx',
    'pages/_app.jsx',
    'pages/_app.js',
    'src/pages/_app.tsx',
    'src/pages/_app.jsx',
    'src/pages/_app.js',
  ];
  for (const candidate of nextPagesCandidates) {
    if (fileExists(candidate)) {
      return {
        framework: 'next-pages',
        frameworkName: 'Next.js (Pages Router)',
        targetFile: candidate,
        packageManager,
        isInstalled,
      };
    }
  }

  // 3. Remix / React Router v7
  const remixCandidates = ['app/root.tsx', 'app/root.jsx', 'app/root.js'];
  for (const candidate of remixCandidates) {
    if (fileExists(candidate) && (allDeps['@remix-run/react'] || allDeps['@react-router/react'])) {
      return {
        framework: 'remix',
        frameworkName: 'Remix / React Router',
        targetFile: candidate,
        packageManager,
        isInstalled,
      };
    }
  }

  // 4. Astro
  const astroCandidates = ['src/layouts/Layout.astro', 'src/layouts/BaseLayout.astro'];
  for (const candidate of astroCandidates) {
    if (fileExists(candidate)) {
      return {
        framework: 'astro',
        frameworkName: 'Astro',
        targetFile: candidate,
        packageManager,
        isInstalled,
      };
    }
  }

  // 5. Vite / React
  const viteCandidates = [
    'src/main.tsx',
    'src/main.jsx',
    'src/App.tsx',
    'src/App.jsx',
    'src/index.tsx',
    'src/index.jsx',
  ];
  for (const candidate of viteCandidates) {
    if (fileExists(candidate)) {
      return {
        framework: 'vite-react',
        frameworkName: allDeps['vite'] ? 'Vite + React' : 'React (SPA)',
        targetFile: candidate,
        packageManager,
        isInstalled,
      };
    }
  }

  return {
    framework: 'react-generic',
    frameworkName: 'Generic React',
    targetFile: null,
    packageManager,
    isInstalled,
  };
}

export function injectCode(content: string, framework: FrameworkType): { updatedContent: string; injected: boolean; message: string } {
  if (content.includes('ResponsiveDX') && (content.includes('<ResponsiveDX') || content.includes('<ResponsiveDX/>'))) {
    return {
      updatedContent: content,
      injected: false,
      message: 'ResponsiveDX is already present in this file.',
    };
  }

  let updatedContent = content;
  const importStatement = "import { ResponsiveDX } from 'responsive-dx';\n";

  // Check and add import
  if (!updatedContent.includes("from 'responsive-dx'") && !updatedContent.includes('from "responsive-dx"')) {
    if (framework === 'astro') {
      if (updatedContent.startsWith('---')) {
        const secondDashes = updatedContent.indexOf('---', 3);
        if (secondDashes !== -1) {
          updatedContent = updatedContent.slice(0, secondDashes) + `import { ResponsiveDX } from 'responsive-dx';\n` + updatedContent.slice(secondDashes);
        } else {
          updatedContent = `---\nimport { ResponsiveDX } from 'responsive-dx';\n---\n` + updatedContent;
        }
      } else {
        updatedContent = `---\nimport { ResponsiveDX } from 'responsive-dx';\n---\n` + updatedContent;
      }
    } else {
      // Regular JS/TS file: add after last import or at top
      const importMatches = Array.from(updatedContent.matchAll(/^import\s.+?;?$/gm));
      if (importMatches.length > 0) {
        const lastMatch = importMatches[importMatches.length - 1];
        if (lastMatch && lastMatch.index !== undefined) {
          const insertPos = lastMatch.index + lastMatch[0].length;
          updatedContent = updatedContent.slice(0, insertPos) + '\n' + importStatement + updatedContent.slice(insertPos);
        } else {
          updatedContent = importStatement + updatedContent;
        }
      } else {
        // If file starts with 'use client', put import after directive
        if (updatedContent.startsWith("'use client'") || updatedContent.startsWith('"use client"')) {
          const firstLineEnd = updatedContent.indexOf('\n');
          if (firstLineEnd !== -1) {
            updatedContent = updatedContent.slice(0, firstLineEnd + 1) + '\n' + importStatement + updatedContent.slice(firstLineEnd + 1);
          } else {
            updatedContent = updatedContent + '\n' + importStatement;
          }
        } else {
          updatedContent = importStatement + updatedContent;
        }
      }
    }
  }

  // Inject component tag
  if (framework === 'astro') {
    if (updatedContent.includes('</body>')) {
      updatedContent = updatedContent.replace('</body>', '  <ResponsiveDX client:only="react" />\n  </body>');
    } else {
      updatedContent += '\n<ResponsiveDX client:only="react" />\n';
    }
    return { updatedContent, injected: true, message: 'Injected <ResponsiveDX client:only="react" />' };
  }

  if (framework === 'next-app' || updatedContent.includes('</body>')) {
    if (updatedContent.includes('</body>')) {
      updatedContent = updatedContent.replace('</body>', '        <ResponsiveDX />\n      </body>');
      return { updatedContent, injected: true, message: 'Injected <ResponsiveDX /> before </body>' };
    }
  }

  if (framework === 'next-pages') {
    // Look for <Component {...pageProps} />
    if (updatedContent.includes('<Component {...pageProps} />') || updatedContent.includes('<Component {...pageProps}/>')) {
      const match = updatedContent.match(/<Component\s+\{\.\.\.pageProps\}\s*\/>/);
      if (match && match.index !== undefined) {
        // Check if wrapped in fragment or element
        const before = updatedContent.slice(0, match.index);
        const after = updatedContent.slice(match.index + match[0].length);
        if (before.trim().endsWith('(') || before.trim().endsWith('return')) {
          updatedContent = before + '<>\n      ' + match[0] + '\n      <ResponsiveDX />\n    </>' + after;
        } else {
          updatedContent = before + match[0] + '\n      <ResponsiveDX />' + after;
        }
        return { updatedContent, injected: true, message: 'Injected <ResponsiveDX /> next to Component' };
      }
    }
  }

  if (framework === 'vite-react') {
    // If it is main.tsx / index.tsx with <App /> inside render
    if (updatedContent.includes('<App />') || updatedContent.includes('<App/>')) {
      const target = updatedContent.includes('<App />') ? '<App />' : '<App/>';
      updatedContent = updatedContent.replace(target, `${target}\n    <ResponsiveDX />`);
      return { updatedContent, injected: true, message: 'Injected <ResponsiveDX /> next to <App />' };
    }
  }

  if (framework === 'remix') {
    if (updatedContent.includes('</Document>')) {
      updatedContent = updatedContent.replace('</Document>', '  <ResponsiveDX />\n    </Document>');
      return { updatedContent, injected: true, message: 'Injected <ResponsiveDX /> before </Document>' };
    }
    if (updatedContent.includes('</body>')) {
      updatedContent = updatedContent.replace('</body>', '  <ResponsiveDX />\n      </body>');
      return { updatedContent, injected: true, message: 'Injected <ResponsiveDX /> before </body>' };
    }
  }

  // Fallback: search for last JSX closing element or end of return
  if (updatedContent.includes('</html>')) {
    updatedContent = updatedContent.replace('</html>', '  <ResponsiveDX />\n</html>');
    return { updatedContent, injected: true, message: 'Injected <ResponsiveDX /> before </html>' };
  }

  if (updatedContent.includes('</main>')) {
    updatedContent = updatedContent.replace('</main>', '  <ResponsiveDX />\n</main>');
    return { updatedContent, injected: true, message: 'Injected <ResponsiveDX /> before </main>' };
  }

  return {
    updatedContent,
    injected: false,
    message: 'Could not find automatic insertion point. Please add <ResponsiveDX /> manually.',
  };
}

export function runInit(options: { cwd?: string; dryRun?: boolean; yes?: boolean } = {}) {
  const cwd = options.cwd || process.cwd();
  const dryRun = options.dryRun || false;

  console.log('\n\x1b[1m\x1b[36m┌──────────────────────────────────────────────────────────┐\x1b[0m');
  console.log('\x1b[1m\x1b[36m│                       RESPO . DX                         │\x1b[0m');
  console.log('\x1b[1m\x1b[36m│       Zero-config responsive testing suite for localhost  │\x1b[0m');
  console.log('\x1b[1m\x1b[36m└──────────────────────────────────────────────────────────┘\x1b[0m\n');

  console.log('\x1b[34m⚡ Detecting project environment...\x1b[0m');
  const detection = detectFrameworkAndLayout(cwd);

  console.log(`  • \x1b[1mFramework:\x1b[0m       ${detection.frameworkName}`);
  console.log(`  • \x1b[1mPackage Manager:\x1b[0m ${detection.packageManager}`);
  console.log(`  • \x1b[1mTarget File:\x1b[0m     ${detection.targetFile || 'Manual setup required'}`);
  console.log();

  // 1. Install dependency if needed
  let installSuccess = detection.isInstalled;

  if (!detection.isInstalled) {
    const installCommands: Record<PackageManager, string> = {
      pnpm: 'pnpm add -D responsive-dx',
      yarn: 'yarn add -D responsive-dx',
      bun: 'bun add -d responsive-dx',
      npm: 'npm install -D responsive-dx',
    };
    const installCmd = installCommands[detection.packageManager];
    console.log(`\x1b[33m📦 Installing responsive-dx (${installCmd})...\x1b[0m`);

    if (!dryRun) {
      try {
        execSync(installCmd, { cwd, stdio: 'inherit' });
        console.log('\x1b[32m✓ Package installed successfully.\x1b[0m\n');
        installSuccess = true;
      } catch (err) {
        // Retry with --ignore-scripts if npm/pnpm fails on script policies
        try {
          const fallbackCmd = `${installCmd} --ignore-scripts`;
          console.log(`\x1b[33m🔄 Retrying install with --ignore-scripts...\x1b[0m`);
          execSync(fallbackCmd, { cwd, stdio: 'inherit' });
          console.log('\x1b[32m✓ Package installed successfully with --ignore-scripts.\x1b[0m\n');
          installSuccess = true;
        } catch {
          console.error('\x1b[31m✖ Failed to run package installation command automatically.\x1b[0m');
          console.log(`  Please install manually: ${installCmd}\n`);
          installSuccess = false;
        }
      }
    } else {
      console.log(`  [dry-run] Would execute: ${installCmd}\n`);
      installSuccess = true;
    }
  } else {
    console.log('\x1b[32m✓ responsive-dx is already installed.\x1b[0m\n');
  }

  // 2. Inject code into target layout file (only if installed or user is in dry-run)
  if (installSuccess && detection.targetFile) {
    const fullTarget = path.join(cwd, detection.targetFile);
    if (fs.existsSync(fullTarget)) {
      console.log(`\x1b[34m🛠️  Configuring ${detection.targetFile}...\x1b[0m`);
      const originalCode = fs.readFileSync(fullTarget, 'utf8');
      const { updatedContent, injected, message } = injectCode(originalCode, detection.framework);

      if (injected) {
        if (!dryRun) {
          fs.writeFileSync(fullTarget, updatedContent, 'utf8');
          console.log(`\x1b[32m✓ ${message} in ${detection.targetFile}\x1b[0m\n`);
        } else {
          console.log(`  [dry-run] Would update ${detection.targetFile}:\n`);
          console.log(updatedContent);
        }
      } else {
        console.log(`\x1b[33mℹ ${message}\x1b[0m\n`);
      }
    }
  } else if (!installSuccess) {
    console.log('\x1b[33m⚠ Skipped modifying layout files because package installation failed.\x1b[0m');
    console.log('  Once you install `responsive-dx`, re-run `npx responsive-dx init` to complete setup.\n');
    return;
  } else {
    console.log('\x1b[33m⚠ Could not automatically locate a root layout file.\x1b[0m');
    console.log('  Please add <ResponsiveDX /> to your root React layout manually:\n');
    console.log("  import { ResponsiveDX } from 'responsive-dx';");
    console.log('  <ResponsiveDX />\n');
  }

  console.log('\x1b[1m\x1b[32m🎉 Setup complete!\x1b[0m');
  console.log('Run your development server and open localhost to see the responsive toolbar in action!\n');
}

export function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === '--help' || command === '-h' || command === 'help') {
    console.log(`
Usage: npx responsive-dx [command] [options]

Commands:
  init          Automatically install & configure responsive-dx in your project (default)

Options:
  -h, --help    Show this help message
  -v, --version Show version
  -y, --yes     Automatic yes to prompts
  --dry-run     Simulate actions without modifying files
    `);
    process.exit(0);
  }

  if (command === '--version' || command === '-v' || command === 'version') {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
      console.log(`responsive-dx v${pkg.version}`);
    } catch {
      console.log('responsive-dx');
    }
    process.exit(0);
  }

  const dryRun = args.includes('--dry-run');
  const yes = args.includes('--yes') || args.includes('-y');

  runInit({ dryRun, yes });
}

// Auto-run if executed directly as a script
if (typeof process !== 'undefined' && process.argv && process.argv[1]) {
  const scriptPath = process.argv[1].replace(/\\/g, '/');
  if (scriptPath.endsWith('/cli.js') || scriptPath.endsWith('/cli.mjs') || scriptPath.endsWith('/cli.ts')) {
    main();
  }
}
