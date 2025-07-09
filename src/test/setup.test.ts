import { describe, it, expect } from 'vitest';

describe('Test setup verification', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have access to global mocks', () => {
    expect(global.mockSupabase).toBeDefined();
  });
});
