import { createPublicClient, createWalletClient, http, parseUnits } from 'viem';
import type { PrivateKeyAccount } from 'viem/accounts';
import { privateKeyToAccount } from 'viem/accounts';
import { SDKConfig, TxResult } from './types';

export class Web3SDK {
  public client;
  public walletClient?: ReturnType<typeof createWalletClient>;
  public account?: PrivateKeyAccount;

  constructor(private config: SDKConfig) {
    this.client = createPublicClient({
      chain: {
        id: config.chainId,
        name: 'Custom',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: [config.rpcUrl] } },
      },
      transport: http(),
    });
  }

  connectWithPrivateKey(privateKey: `0x${string}`) {
    this.account = privateKeyToAccount(privateKey);
    this.walletClient = createWalletClient({
      account: this.account,
      chain: this.client.chain,
      transport: http(this.config.rpcUrl),
    });
  }

  async getNativeBalance(address: `0x${string}`) {
    return this.client.getBalance({ address });
  }

  async sendNativeToken(
    to: `0x${string}`,
    amountEth: string
  ): Promise<TxResult> {
    if (!this.walletClient || !this.account) {
      throw new Error('Wallet no conectada');
    }
    const txHash = await this.walletClient.sendTransaction({
      account: this.account,
      chain: this.client.chain,
      to,
      value: parseUnits(amountEth, 18),
    });
    return { hash: txHash };
  }
}
