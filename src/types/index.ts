export interface RiskFactor {
  text: string;
  severity: 'high' | 'medium' | 'low';
  points: number;
}

export interface RiskLevel {
  label: string;
  color: 'red' | 'yellow' | 'green';
}

export interface ContractAnalysis {
  address: string;
  network: 'Ethereum' | 'Solana';
  riskScore: number;
  riskLevel: RiskLevel;
  contractAge: string;
  isVerified: boolean;
  holderCount: number;
  totalSupply: string;
  liquidity: string;
  topHolderPercent: string;
  isRenounced: boolean;
  riskFactors: RiskFactor[];
}

export interface Settings {
  apiKey: string;
  theme: 'light' | 'dark';
}