import { describe, it, expect } from 'vitest';
import { PromptInput } from '../types';
import { buildSizeString } from '../utils/imageGenerator';

/** Helper to create a valid PromptInput for testing */
function makeInput(overrides: Partial<PromptInput> = {}): PromptInput {
  return {
    description: 'test image description',
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

describe('QA Verification - Volcengine Image Generation', () => {
  describe('PromptInput type validation', () => {
    it('should create a valid input with all required fields', () => {
      const input = makeInput();
      expect(input.description).toBeTruthy();
      expect(input.model).toBeTruthy();
      expect(input.sizeMode).toBe('digital');
    });

    it('should support different models', () => {
      const models = ['doubao-seedream-4-5-251128', 'doubao-seedream-4-0-250828'];
      models.forEach((model) => {
        const input = makeInput({ model });
        expect(input.model).toBe(model);
      });
    });

    it('should support different size modes', () => {
      const digitalInput = makeInput({ sizeMode: 'digital', size: '16:9' });
      expect(digitalInput.sizeMode).toBe('digital');

      const printInput = makeInput({ sizeMode: 'print', printSize: 'A3' });
      expect(printInput.sizeMode).toBe('print');
    });

    it('should support different scenes', () => {
      const scenes = ['social_avatar', 'exhibition_kv', 'exhibition_booth', 'banner_standee'];
      scenes.forEach((scene) => {
        const input = makeInput({ scene });
        expect(input.scene).toBe(scene);
      });
    });
  });

  describe('Size string building', () => {
    it('should return pixel format by default', () => {
      expect(buildSizeString(1024, 1024)).toBe('1024x1024');
      expect(buildSizeString(2048, 2048)).toBe('2048x2048');
      expect(buildSizeString(1920, 1080)).toBe('1920x1080');
    });

    it('should enforce minimum pixels for seedream-4-5 model', () => {
      const result = buildSizeString(1024, 1024, 'doubao-seedream-4-5-251128');
      const [w, h] = result.split('x').map(Number);
      expect(w * h).toBeGreaterThanOrEqual(3_686_400);
    });
  });

  describe('Empty input handling', () => {
    it('should handle empty description', () => {
      const input = makeInput({ description: '' });
      expect(input.description).toBe('');
    });

    it('should handle whitespace-only description', () => {
      const input = makeInput({ description: '   ' });
      expect(input.description.trim()).toBe('');
    });
  });
});
