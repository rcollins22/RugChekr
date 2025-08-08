import { RiskFactor, RiskLevel, ContractAnalysis } from '../types';
import { EthereumContractScanner } from './ethScanner'; // adjust path if needed

export class ContractAnalyzer {
  static isValidAddress(address: string): boolean {
    const ethPattern = /^0x[a-fA-F0-9]{40}$/;
    const solPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return ethPattern.test(address) || solPattern.test(address);
  }

  static async analyzeContract(address: string): Promise<ContractAnalysis> {
    const isEthereum = address.startsWith('0x');

    if (isEthereum) {
      const analysis = await EthereumContractScanner.analyzeContract(address);    
      return {
        ...analysis,
        riskLevel: {
          ...analysis.riskLevel,
          color: analysis.riskLevel.color as 'red' | 'yellow' | 'green',
        },
      };
    } else {
      // TODO: Add Solana contract support
      throw new Error('Solana contract scanning not yet supported.');
    }
  }

  // Utility functions still here for future use
  private static calculateRiskScore(riskFactors: RiskFactor[]): number {
    const totalPoints = riskFactors.reduce((sum, factor) => sum + factor.points, 0);
    return Math.min(100, totalPoints);
  }

  private static getRiskLevel(score: number): RiskLevel {
    if (score >= 70) return { label: 'HIGH RISK', color: 'red' };
    if (score >= 40) return { label: 'MEDIUM RISK', color: 'yellow' };
    return { label: 'LOW RISK', color: 'green' };
  }

  private static randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }
}
