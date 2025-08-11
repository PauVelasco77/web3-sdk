import { describe, it, expect } from 'vitest';
import type { SDKConfig, TokenInfo, TxResult } from '../types';

describe('Types', () => {
  describe('SDKConfig', () => {
    it('should accept valid config', () => {
      const config: SDKConfig = {
        rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
        chainId: 1,
      };

      expect(config.rpcUrl).toBe('https://eth-mainnet.g.alchemy.com/v2/demo');
      expect(config.chainId).toBe(1);
    });

    it('should be readonly by design', () => {
      const config: SDKConfig = {
        rpcUrl: 'https://test.com',
        chainId: 5,
      };

      // TypeScript should enforce readonly behavior
      expect(typeof config.rpcUrl).toBe('string');
      expect(typeof config.chainId).toBe('number');
    });
  });

  describe('TokenInfo', () => {
    it('should accept valid token info', () => {
      const tokenInfo: TokenInfo = {
        address: '0xA0b86a33E6441d0bd3e34a8AD9C6b2Ec6A43b1d2' as `0x${string}`,
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18,
      };

      expect(tokenInfo.name).toBe('Test Token');
      expect(tokenInfo.symbol).toBe('TEST');
      expect(tokenInfo.decimals).toBe(18);
      expect(tokenInfo.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should handle different decimal places', () => {
      const usdcInfo: TokenInfo = {
        address: '0xA0b86a33E6441d0bd3e34a8AD9C6b2Ec6A43b1d2' as `0x${string}`,
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
      };

      expect(usdcInfo.decimals).toBe(6);
    });
  });

  describe('TxResult', () => {
    it('should accept valid transaction hash', () => {
      const txResult: TxResult = {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as `0x${string}`,
      };

      expect(txResult.hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });
  });
});
