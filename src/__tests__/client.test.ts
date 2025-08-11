import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Web3SDK } from '../client';
import type { SDKConfig } from '../types';

// Mock viem modules
vi.mock('viem', () => ({
  createPublicClient: vi.fn(() => ({
    chain: {
      id: 1,
      name: 'Custom',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://test.com'] } },
    },
    getBalance: vi.fn(() => Promise.resolve(BigInt('1000000000000000000'))), // 1 ETH
  })),
  createWalletClient: vi.fn(() => ({
    sendTransaction: vi.fn(() =>
      Promise.resolve(
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      )
    ),
  })),
  http: vi.fn(),
  parseUnits: vi.fn((value: string, decimals: number) => {
    const numValue = parseFloat(value);
    return BigInt(Math.floor(numValue * 10 ** decimals));
  }),
}));

vi.mock('viem/accounts', () => ({
  privateKeyToAccount: vi.fn(() => ({
    address: '0x742d35Cc6634C0532925a3b8D84c18cE3f8f6FD8',
    type: 'local',
  })),
}));

describe('Web3SDK', () => {
  let sdk: Web3SDK;
  let config: SDKConfig;

  beforeEach(() => {
    config = {
      rpcUrl: 'https://test.com',
      chainId: 1,
    };
    sdk = new Web3SDK(config);
  });

  describe('constructor', () => {
    it('should initialize with correct config', () => {
      expect(sdk).toBeInstanceOf(Web3SDK);
      expect(sdk.client).toBeDefined();
      expect(sdk.walletClient).toBeUndefined();
      expect(sdk.account).toBeUndefined();
    });

    it('should create public client with correct chain config', () => {
      expect(sdk.client.chain.id).toBe(1);
      expect(sdk.client.chain.name).toBe('Custom');
      expect(sdk.client.chain.nativeCurrency.symbol).toBe('ETH');
    });
  });

  describe('connectWithPrivateKey', () => {
    const privateKey =
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as `0x${string}`;

    it('should connect wallet with private key', () => {
      sdk.connectWithPrivateKey(privateKey);

      expect(sdk.account).toBeDefined();
      expect(sdk.walletClient).toBeDefined();
      expect(sdk.account?.address).toBe(
        '0x742d35Cc6634C0532925a3b8D84c18cE3f8f6FD8'
      );
    });

    it('should set wallet client with correct config', () => {
      sdk.connectWithPrivateKey(privateKey);

      expect(sdk.walletClient).toBeDefined();
    });
  });

  describe('getNativeBalance', () => {
    it('should return balance for given address', async () => {
      const address =
        '0x742d35Cc6634C0532925a3b8D84c18cE3f8f6FD8' as `0x${string}`;
      const balance = await sdk.getNativeBalance(address);

      expect(balance).toBe(BigInt('1000000000000000000')); // 1 ETH
      expect(sdk.client.getBalance).toHaveBeenCalledWith({ address });
    });
  });

  describe('sendNativeToken', () => {
    const privateKey =
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as `0x${string}`;
    const to = '0x123456789abcdef123456789abcdef123456789a' as `0x${string}`;

    beforeEach(() => {
      sdk.connectWithPrivateKey(privateKey);
    });

    it('should send native token successfully', async () => {
      const result = await sdk.sendNativeToken(to, '1.0');

      expect(result.hash).toBe(
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      );
      expect(sdk.walletClient?.sendTransaction).toHaveBeenCalledWith({
        account: sdk.account,
        chain: sdk.client.chain,
        to,
        value: BigInt('1000000000000000000'), // 1 ETH in wei
      });
    });

    it('should throw error when wallet not connected', async () => {
      const unconnectedSdk = new Web3SDK(config);

      await expect(unconnectedSdk.sendNativeToken(to, '1.0')).rejects.toThrow(
        'Wallet no conectada'
      );
    });

    it('should handle different amounts correctly', async () => {
      await sdk.sendNativeToken(to, '0.5');

      expect(sdk.walletClient?.sendTransaction).toHaveBeenCalledWith({
        account: sdk.account,
        chain: sdk.client.chain,
        to,
        value: BigInt('500000000000000000'), // 0.5 ETH in wei
      });
    });
  });
});
