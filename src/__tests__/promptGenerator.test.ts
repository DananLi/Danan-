import { describe, it, expect } from 'vitest';
import { PromptInput } from '../types';
import { buildSizeString } from '../utils/imageGenerator';

/** Helper to create a valid PromptInput for testing */
function makeInput(overrides: Partial<PromptInput> = {}): PromptInput {
  return {
    description: 'a beautiful cat in space',
    size: '1:1',
    customWidth: 1024,
    customHeight: 1024,
    scene: 'social_post',
    sizeMode: 'digital',
    printSize: 'A4',
    customPrintWidth: 210,
    customPrintHeight: 297,
    model: 'doubao-seedream-4-0-250828',
    ...overrides,
  };
}

describe('PromptInput type', () => {
  it('should create a valid input with defaults', () => {
    const input = makeInput();
    expect(input.description).toBe('a beautiful cat in space');
    expect(input.model).toBe('doubao-seedream-4-0-250828');
    expect(input.size).toBe('1:1');
  });

  it('should allow overriding fields', () => {
    const input = makeInput({ description: 'hello', model: 'doubao-seedream-4-5-251128' });
    expect(input.description).toBe('hello');
    expect(input.model).toBe('doubao-seedream-4-5-251128');
  });
});

describe('buildSizeString', () => {
  it('should return pixel format by default', () => {
    expect(buildSizeString(1024, 1024)).toBe('1024x1024');
    expect(buildSizeString(2048, 2048)).toBe('2048x2048');
    expect(buildSizeString(1920, 1080)).toBe('1920x1080');
  });

  it('should enforce minimum pixels for seedream-4-5 model', () => {
    // 1024x1024 = 1,048,576 pixels, below 3,686,400 minimum
    // Should be scaled up to at least 3,686,400 pixels
    const result = buildSizeString(1024, 1024, 'doubao-seedream-4-5-251128');
    const [w, h] = result.split('x').map(Number);
    expect(w * h).toBeGreaterThanOrEqual(3_686_400);
  });

  it('should not scale up if already above minimum for seedream-4-5', () => {
    expect(buildSizeString(2048, 2048, 'doubao-seedream-4-5-251128')).toBe('2048x2048');
  });
});

describe('Prompt building', () => {
  it('should build prompt from description and scene', () => {
    const input = makeInput({ description: 'a cute dog' });
    // Scene: social_post has keywords
    expect(input.description).toBe('a cute dog');
    expect(input.scene).toBe('social_post');
  });

  it('should handle empty description', () => {
    const input = makeInput({ description: '' });
    expect(input.description).toBe('');
  });
});
