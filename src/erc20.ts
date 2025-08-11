import { erc20Abi } from 'viem';
import { Web3SDK } from './client';
import type { Address, Hex } from 'viem';

export class ERC20 {
  constructor(private sdk: Web3SDK) {}

  async getBalance(token: Address, address: Address) {
    return this.sdk.client.readContract({
      address: token,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address],
    });
  }

  async transfer(token: Address, to: Address, amount: bigint): Promise<Hex> {
    if (!this.sdk.walletClient || !this.sdk.account) {
      throw new Error('Wallet no conectada');
    }
    return this.sdk.walletClient.writeContract({
      account: this.sdk.account,
      chain: this.sdk.client.chain,
      address: token,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to, amount],
    });
  }
}
