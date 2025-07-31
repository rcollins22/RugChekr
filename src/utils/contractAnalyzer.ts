import { RiskFactor, RiskLevel, ContractAnalysis } from '../types';

export class ContractAnalyzer {
  static isValidAddress(address: string): boolean {
    // Ethereum address validation (starts with 0x)
    const ethPattern = /^0x[a-fA-F0-9]{40}$/;
    
    // Solana address validation (32-44 characters, base58)
    const solPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    
    return ethPattern.test(address) || solPattern.test(address);
  }

  static analyzeContract(address: string): ContractAnalysis {
    const isEthereum = address.startsWith('0x');
    const riskFactors = this.generateRiskFactors();
    const riskScore = this.calculateRiskScore(riskFactors);
    
    return {
      address,
      network: isEthereum ? 'Ethereum' : 'Solana',
      riskScore,
      riskLevel: this.getRiskLevel(riskScore),
      contractAge: this.randomChoice(['2 hours', '1 day', '3 days', '1 week', '2 weeks', '1 month']),
      isVerified: Math.random() > 0.7,
      holderCount: this.randomNumber(50, 10000),
      totalSupply: this.formatNumber(this.randomNumber(1000000, 1000000000000)),
      liquidity: '$' + this.formatNumber(this.randomNumber(1000, 500000)),
      topHolderPercent: this.randomNumber(15, 80) + '%',
      isRenounced: Math.random() > 0.6,
      riskFactors
    };
  }

  private static generateRiskFactors(): RiskFactor[] {
    const allFactors: RiskFactor[] = [
      { text: 'Contract not verified on block explorer', severity: 'high', points: 25 },
      { text: 'Very new contract (less than 24 hours old)', severity: 'high', points: 20 },
      { text: 'High concentration of tokens in top wallets', severity: 'high', points: 20 },
      { text: 'Low liquidity pool', severity: 'medium', points: 15 },
      { text: 'Ownership not renounced', severity: 'medium', points: 15 },
      { text: 'No social media presence found', severity: 'medium', points: 10 },
      { text: 'Unusual trading patterns detected', severity: 'medium', points: 10 },
      { text: 'Limited transaction history', severity: 'low', points: 8 },
      { text: 'No whitepaper or documentation', severity: 'low', points: 5 },
      { text: 'Suspicious token name or symbol', severity: 'low', points: 5 }
    ];

    // Randomly select 3-6 risk factors
    const numFactors = this.randomNumber(3, 6);
    const shuffled = [...allFactors].sort(() => 0.5 - Math.random());
    
    return shuffled.slice(0, numFactors);
  }

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