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
  tokenName?: string;
  tokenSymbol?: string;
  tokenImage?: string;
  riskScore: number;
  auditScore: number;
  riskLevel: RiskLevel;
  contractAge: string;
  isVerified: boolean;
  honeypotStatus: string;
  sourceCodeStatus: string;
  ownerRenouncement: string;
  ownershipControl: string;
  liquidityStatus: string;
  liquidityProvider: string;
  creatorWalletHoldings: string;
  top10HolderPercentage: string;
  holderCount: number;
  totalSupply: string;
  liquidity: string;
  topHolderPercent: string;
  isRenounced: boolean;
  riskFactors: RiskFactor[];
  contractCreator: string;
  creatorWalletContains: string;
  liquidityLockStatus: string;
  transactionFees: string;
  holderAnalysis: {
    totalSupply: string;
    circulatingSupply: string;
    burnedSupply: string;
  };
  bitqueryHolderData?: HolderAnalysis;
  sourceCode?: string;
}

export interface Settings {
  apiKey: string;
  theme: 'light' | 'dark';
}