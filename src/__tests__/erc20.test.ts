import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ERC20 } from '../erc20';
import { Web3SDK } from '../client';
import type { SDKConfig } from '../types';

// Mock viem
vi.mock('viem', () => ({
  erc20Abi: [
    {
      type: 'function',
      name: 'balanceOf',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
    },
    {
      type: 'function',
      name: 'transfer',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      outputs: [{ name: '', type: 'bool' }],
    },
  ],
  createPublicClient: vi.fn(() => ({
    chain: {
      id: 1,
      name: 'Custom',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://test.com'] } },
    },
    readContract: vi.fn(() => Promise.resolve(BigInt('1000000000000000000'))), // 1 token
  })),
  createWalletClient: vi.fn(() => ({
    writeContract: vi.fn(() =>
      Promise.resolve(
        '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      )
    ),
  })),
  http: vi.fn(),
  parseUnits: vi.fn(),
}));

vi.mock('viem/accounts', () => ({
  privateKeyToAccount: vi.fn(() => ({
    address: '0x742d35Cc6634C0532925a3b8D84c18cE3f8f6FD8',
    type: 'local',
  })),
}));

describe('ERC20', () => {
  let erc20: ERC20;
  let sdk: Web3SDK;
  const config: SDKConfig = {
    rpcUrl: 'https://test.com',
    chainId: 1,
  };

  const tokenAddress =
    '0xA0b86a33E6441d0bd3e34a8AD9C6b2Ec6A43b1d2' as `0x${string}`;
  const userAddress =
    '0x742d35Cc6634C0532925a3b8D84c18cE3f8f6FD8' as `0x${string}`;

  beforeEach(() => {
    sdk = new Web3SDK(config);
    erc20 = new ERC20(sdk);
  });

  describe('constructor', () => {
    it('should initialize with SDK instance', () => {
      expect(erc20).toBeInstanceOf(ERC20);
    });
  });

  describe('getBalance', () => {
    it('should return token balance for given address', async () => {
      const balance = await erc20.getBalance(tokenAddress, userAddress);

      expect(balance).toBe(BigInt('1000000000000000000')); // 1 token
      expect(sdk.client.readContract).toHaveBeenCalledWith({
        address: tokenAddress,
        abi: expect.any(Array),
        functionName: 'balanceOf',
        args: [userAddress],
      });
    });

    it('should handle zero balance', async () => {
      vi.mocked(sdk.client.readContract).mockResolvedValueOnce(BigInt(0));

      const balance = await erc20.getBalance(tokenAddress, userAddress);
      expect(balance).toBe(BigInt(0));
    });

    it('should handle large balances', async () => {
      const largeBalance = BigInt('1000000000000000000000'); // 1000 tokens
      vi.mocked(sdk.client.readContract).mockResolvedValueOnce(largeBalance);

      const balance = await erc20.getBalance(tokenAddress, userAddress);
      expect(balance).toBe(largeBalance);
    });
  });

  describe('transfer', () => {
    const privateKey =
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as `0x${string}`;
    const toAddress =
      '0x123456789abcdef123456789abcdef123456789a' as `0x${string}`;
    const amount = BigInt('500000000000000000'); // 0.5 tokens

    beforeEach(() => {
      sdk.connectWithPrivateKey(privateKey);
    });

    it('should transfer tokens successfully', async () => {
      const txHash = await erc20.transfer(tokenAddress, toAddress, amount);

      expect(txHash).toBe(
        '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      );
      expect(sdk.walletClient?.writeContract).toHaveBeenCalledWith({
        account: sdk.account,
        chain: sdk.client.chain,
        address: tokenAddress,
        abi: expect.any(Array),
        functionName: 'transfer',
        args: [toAddress, amount],
      });
    });

    it('should throw error when wallet not connected', async () => {
      const unconnectedErc20 = new ERC20(new Web3SDK(config));

      await expect(
        unconnectedErc20.transfer(tokenAddress, toAddress, amount)
      ).rejects.toThrow('Wallet no conectada');
    });

    it('should handle different token amounts', async () => {
      const smallAmount = BigInt(1);
      await erc20.transfer(tokenAddress, toAddress, smallAmount);

      expect(sdk.walletClient?.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [toAddress, smallAmount],
        })
      );
    });

    it('should handle different token addresses', async () => {
      const differentToken =
        '0xB0b86a33E6441d0bd3e34a8AD9C6b2Ec6A43b1d3' as `0x${string}`;
      await erc20.transfer(differentToken, toAddress, amount);

      expect(sdk.walletClient?.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          address: differentToken,
        })
      );
    });

    it('should handle different recipient addresses', async () => {
      const differentRecipient =
        '0xC0b86a33E6441d0bd3e34a8AD9C6b2Ec6A43b1d4' as `0x${string}`;
      await erc20.transfer(tokenAddress, differentRecipient, amount);

      expect(sdk.walletClient?.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({
          args: [differentRecipient, amount],
        })
      );
    });
  });
});
