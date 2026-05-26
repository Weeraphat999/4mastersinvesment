import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadFromStorage, saveToStorage } from '../storageUtils';

describe('storageUtils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadFromStorage', () => {
    it('returns fallback when key does not exist', () => {
      expect(loadFromStorage('nonexistent', 'default')).toBe('default');
    });

    it('returns parsed value when key exists with valid JSON', () => {
      localStorage.setItem('test_key', JSON.stringify({ a: 1 }));
      expect(loadFromStorage('test_key', {})).toEqual({ a: 1 });
    });

    it('returns fallback when stored value is malformed JSON', () => {
      localStorage.setItem('bad_json', '{not valid json');
      expect(loadFromStorage('bad_json', [])).toEqual([]);
    });

    it('returns fallback when localStorage throws', () => {
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });
      expect(loadFromStorage('key', 'fallback')).toBe('fallback');
      spy.mockRestore();
    });

    it('handles stored null value correctly', () => {
      localStorage.setItem('null_val', 'null');
      expect(loadFromStorage('null_val', 'fallback')).toBeNull();
    });

    it('handles stored array correctly', () => {
      localStorage.setItem('arr', JSON.stringify([1, 2, 3]));
      expect(loadFromStorage('arr', [])).toEqual([1, 2, 3]);
    });
  });

  describe('saveToStorage', () => {
    it('returns true and stores value on success', () => {
      const result = saveToStorage('key', { hello: 'world' });
      expect(result).toBe(true);
      expect(localStorage.getItem('key')).toBe(JSON.stringify({ hello: 'world' }));
    });

    it('returns false when localStorage.setItem throws QuotaExceededError', () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new DOMException('QuotaExceededError', 'QuotaExceededError');
        throw error;
      });
      const result = saveToStorage('key', 'value');
      expect(result).toBe(false);
      spy.mockRestore();
    });

    it('returns false when localStorage is unavailable', () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('SecurityError: access denied');
      });
      const result = saveToStorage('key', 'value');
      expect(result).toBe(false);
      spy.mockRestore();
    });

    it('handles circular reference in value gracefully', () => {
      const obj: Record<string, unknown> = {};
      obj.self = obj;
      const result = saveToStorage('circular', obj);
      expect(result).toBe(false);
    });

    it('stores primitive values correctly', () => {
      expect(saveToStorage('num', 42)).toBe(true);
      expect(localStorage.getItem('num')).toBe('42');

      expect(saveToStorage('str', 'hello')).toBe(true);
      expect(localStorage.getItem('str')).toBe('"hello"');

      expect(saveToStorage('bool', true)).toBe(true);
      expect(localStorage.getItem('bool')).toBe('true');
    });
  });
});
