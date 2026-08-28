import { describe, it, expect, afterEach } from 'vitest';
import { ResponsiveDX, VIEWPORT_PRESETS } from '../index.js';

describe('ResponsiveDX Public API', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('exports preset constants', () => {
    expect(VIEWPORT_PRESETS).toHaveLength(3);
    expect(VIEWPORT_PRESETS.map((p) => p.id)).toEqual([
      'mobile-375',
      'tablet-768',
      'desktop-1440',
    ]);
  });

  it('returns null in production environment (NODE_ENV=production)', () => {
    process.env.NODE_ENV = 'production';
    const result = ResponsiveDX({});
    expect(result).toBeNull();
  });

  it('renders when enabled={true} in production', () => {
    process.env.NODE_ENV = 'production';
    const result = ResponsiveDX({ enabled: true });
    expect(result).not.toBeNull();
  });

  it('returns null in test environment (NODE_ENV=test)', () => {
    process.env.NODE_ENV = 'test';
    const result = ResponsiveDX({});
    expect(result).toBeNull();
  });
});
