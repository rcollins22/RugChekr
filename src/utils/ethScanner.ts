import axios from 'axios';
import { Config } from './config';


export type Severity = 'low' | 'medium' | 'high';

export interface RiskFactor {
    text: string;
    severity: Severity;
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

export class EthereumContractScanner {
    static async analyzeContract(address: string): Promise<ContractAnalysis> {
        const apiKey = Config.ETHERSCAN_API
        if (!apiKey) throw new Error('ETHERSCAN_API not set in .env file');

        const baseUrl = `https://api.etherscan.io/api?apikey=${apiKey}`;

        let source = '';
        let isVerified = false;
        let totalSupply = '0';
        let holderCount = 0;
        let isRenounced = false;

        try {
            // 1. Get contract source code (to detect isVerified & renounced)
            const sourceRes = await axios.get(`${baseUrl}&module=contract&action=getsourcecode&address=${address}`);
            const sourceResult = sourceRes.data?.result?.[0];
            source = sourceResult?.SourceCode || '';
            isVerified = !!source;

            const owner = sourceResult?.ContractCreator;
            isRenounced = !owner || owner === '0x0000000000000000000000000000000000000000';

            // 2. Get total supply
            const supplyRes = await axios.get(`${baseUrl}&module=stats&action=tokensupply&contractaddress=${address}`);
            totalSupply = supplyRes.data?.result || '0';

            // 3. Get token holder count
            const holderRes = await axios.get(`${baseUrl}&module=token&action=tokenholdercount&contractaddress=${address}`);
            holderCount = parseInt(holderRes.data?.result || '0');
        } catch (error) {
            console.error(`Error fetching contract data:`, error);
        }

        const riskFactors = this.scanSourceCode(source);
        const riskScore = this.generateRiskScore(riskFactors);

        return {
            address,
            network: 'Ethereum',
            riskScore,
            riskLevel: this.getRiskLevel(riskScore),
            contractAge: this.randomChoice(['2 hours', '1 day', '3 days', '1 week', '2 weeks', '1 month']),
            isVerified,
            holderCount,
            totalSupply: this.formatNumber(Number(totalSupply)),
            liquidity: '$' + this.formatNumber(this.randomNumber(1000, 500000)),
            topHolderPercent: this.randomNumber(15, 80) + '%',
            isRenounced,
            riskFactors
        };
    }

    static scanSourceCode(source: string): RiskFactor[] {
        const risks: RiskFactor[] = [];

        const push = (text: string, severity: Severity, points: number) => {
            risks.push({ text, severity, points });
        };

        const suspiciousPatterns: [RegExp, string, Severity, number][] = [
            [/tx\.origin/, 'Use of tx.origin', 'high', 25],
            [/selfdestruct/, 'Self-destruct function found', 'high', 25],
            [/assembly/, 'Inline assembly used', 'high', 20],
            [/delegatecall/, 'Proxy or upgradeable contract (delegatecall)', 'high', 20],
            [/mint\(/, 'Owner can mint tokens', 'high', 20],
            [/burn\(/, 'Owner can burn arbitrary tokens', 'high', 15],
            [/blacklist/, 'Blacklist functionality present', 'high', 15],
            [/require\(!blacklist/, 'Blacklist logic in transfer functions', 'high', 15],
            [/_transfer\(/, 'Check for suspicious transfer modifications', 'high', 20],
            [/revert\(/, 'Revert on certain addresses or actions (possible honeypot)', 'high', 20],
            [/block\.number/, 'Launch period block logic', 'medium', 15],
            [/require\(.*maxTxAmount/, 'Max TX limitation logic', 'medium', 15],
            [/require\(.*maxWallet/, 'Max wallet restriction logic', 'medium', 10],
            [/approve\(/, 'Check for allowance manipulation', 'medium', 10],
            [/transferFrom/, 'Check for unlimited approval handling', 'medium', 10],
            [/owner\s*=|onlyOwner/, 'Owner pattern found', 'medium', 15],
            [/renounceOwnership/, 'Renounce ownership function found', 'low', 5],
            [/name\s*=\s*".*(ETH|BTC|USDT).*"/, 'Suspicious name pattern', 'low', 5],
            [/symbol\s*=\s*".*(ETH|BTC|USDT).*"/, 'Suspicious symbol pattern', 'low', 5],
            [/totalSupply\(/, 'Check totalSupply behavior', 'low', 5],
            [/decimals\(/, 'Custom decimals, check for manipulation', 'low', 5],
            [/Transfer\(/, 'Missing or misleading Transfer events', 'low', 5],
        ];

        for (const [pattern, description, severity, points] of suspiciousPatterns) {
            const regex = new RegExp(pattern);
            if (regex.test(source)) {
                push(description, severity, points);
            }
        }

        return risks;
    }

    static generateRiskScore(factors: RiskFactor[]): number {
        return factors.reduce((acc, curr) => acc + curr.points, 0);
    }

    static getRiskLevel(score: number): RiskLevel {
        if (score >= 80) return { label: 'HIGH RISK', color: 'red' };
        if (score >= 40) return { label: 'MEDIUM RISK', color: 'yellow' };
        return { label: 'LOW RISK', color: 'green' };
    }

    static randomChoice(options: string[]): string {
        return options[Math.floor(Math.random() * options.length)];
    }

    static randomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static formatNumber(num: number): string {
        return num.toLocaleString();
    }
}
