import axios from 'axios';
import { Config } from './config';

export interface TokenHolder {
  address: string;
  balance: string;
  percentage: number;
}

export interface HolderAnalysis {
  totalHolders: number;
  topHolders: TokenHolder[];
  top10Percentage: number;
  creatorHolding: number;
  creatorAddress?: string;
}

export class BitQueryScanner {
  private static readonly BITQUERY_ENDPOINT = 'https://graphql.bitquery.io';

  static async getTokenHolders(contractAddress: string, creatorAddress?: string): Promise<HolderAnalysis> {
    const apiKey = Config.BITQUERY_API;
    
    if (!apiKey || apiKey === 'your_bitquery_api_key_here') {
      console.warn('BitQuery API key not configured, using fallback data');
      return this.getFallbackHolderData();
    }

    try {
      // GraphQL query to get token holders
      const query = `
        query GetTokenHolders($token: String!) {
          ethereum(network: ethereum) {
            address(address: {is: $token}) {
              balances(
                currency: {is: $token}
                limit: 100
                orderBy: {descending: value}
              ) {
                address {
                  address
                }
                value
              }
            }
          }
          
          # Get total supply for percentage calculations
          ethereum(network: ethereum) {
            transfers(
              currency: {is: $token}
              options: {limit: 1}
            ) {
              currency {
                totalSupply
              }
            }
          }
        }
      `;

      const response = await axios.post(
        this.BITQUERY_ENDPOINT,
        {
          query,
          variables: {
            token: contractAddress
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey
          }
        }
      );

      if (response.data?.errors) {
        console.error('BitQuery API errors:', response.data.errors);
        return this.getFallbackHolderData();
      }

      const balances = response.data?.data?.ethereum?.address?.[0]?.balances || [];
      const totalSupply = response.data?.data?.ethereum?.transfers?.[0]?.currency?.totalSupply || '0';
      
      return this.processHolderData(balances, totalSupply, creatorAddress);
    } catch (error) {
      console.error('BitQuery API error:', error);
      return this.getFallbackHolderData();
    }
  }

  private static processHolderData(
    balances: any[], 
    totalSupply: string, 
    creatorAddress?: string
  ): HolderAnalysis {
    const totalSupplyNum = parseFloat(totalSupply) || 1;
    const holders: TokenHolder[] = [];
    let creatorHolding = 0;

    // Process holder data
    for (const balance of balances) {
      const address = balance.address?.address;
      const value = parseFloat(balance.value || '0');
      const percentage = (value / totalSupplyNum) * 100;

      if (address && value > 0) {
        holders.push({
          address,
          balance: value.toString(),
          percentage
        });

        // Check if this is the creator's address
        if (creatorAddress && address.toLowerCase() === creatorAddress.toLowerCase()) {
          creatorHolding = percentage;
        }
      }
    }

    // Calculate top 10 percentage
    const top10Holders = holders.slice(0, 10);
    const top10Percentage = top10Holders.reduce((sum, holder) => sum + holder.percentage, 0);

    return {
      totalHolders: holders.length,
      topHolders: holders.slice(0, 20), // Return top 20 for display
      top10Percentage,
      creatorHolding,
      creatorAddress
    };
  }

  private static getFallbackHolderData(): HolderAnalysis {
    // Return placeholder data when BitQuery is not available
    return {
      totalHolders: 0,
      topHolders: [],
      top10Percentage: 0,
      creatorHolding: 0
    };
  }

  static formatHolderPercentage(percentage: number): string {
    if (percentage < 0.01) return '<0.01%';
    if (percentage < 1) return percentage.toFixed(2) + '%';
    return percentage.toFixed(1) + '%';
  }

  static formatBalance(balance: string, decimals: number = 18): string {
    const balanceNum = parseFloat(balance);
    const adjustedBalance = balanceNum / Math.pow(10, decimals);
    
    if (adjustedBalance >= 1000000) {
      return (adjustedBalance / 1000000).toFixed(2) + 'M';
    } else if (adjustedBalance >= 1000) {
      return (adjustedBalance / 1000).toFixed(1) + 'K';
    } else {
      return adjustedBalance.toFixed(2);
    }
  }
}