import { describe, it, expect } from 'vitest';

describe('Index exports', () => {
  it('should export Web3SDK from client', async () => {
    const { Web3SDK } = await import('../index');
    expect(Web3SDK).toBeDefined();
    expect(typeof Web3SDK).toBe('function');
  });

  it('should export ERC20 from erc20', async () => {
    const { ERC20 } = await import('../index');
    expect(ERC20).toBeDefined();
    expect(typeof ERC20).toBe('function');
  });

  it('should export types', async () => {
    const exports = await import('../index');

    // Check that we can create objects with the exported types
    // This is indirect testing since TypeScript types don't exist at runtime
    expect(exports).toBeDefined();
  });

  it('should have all expected exports', async () => {
    const exports = await import('../index');
    const exportNames = Object.keys(exports);

    expect(exportNames).toContain('Web3SDK');
    expect(exportNames).toContain('ERC20');
    expect(exportNames.length).toBeGreaterThanOrEqual(2);
  });

  it('should allow creating SDK instance from index export', async () => {
    const { Web3SDK } = await import('../index');

    const sdk = new Web3SDK({
      rpcUrl: 'https://test.com',
      chainId: 1,
    });

    expect(sdk).toBeInstanceOf(Web3SDK);
    expect(sdk.client).toBeDefined();
  });

  it('should allow creating ERC20 instance from index export', async () => {
    const { Web3SDK, ERC20 } = await import('../index');

    const sdk = new Web3SDK({
      rpcUrl: 'https://test.com',
      chainId: 1,
    });

    const erc20 = new ERC20(sdk);
    expect(erc20).toBeInstanceOf(ERC20);
  });
});
