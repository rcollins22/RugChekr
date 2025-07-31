import { ContractAnalysis } from '../types';

export class OpenAIService {
  static async explainContract(analysis: ContractAnalysis, apiKey: string): Promise<string> {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const prompt = `
You are a blockchain security expert. Analyze this smart contract and provide a detailed explanation in a conversational, easy-to-understand manner.

Contract Details:
- Address: ${analysis.address}
- Network: ${analysis.network}
- Risk Score: ${analysis.riskScore}/100 (${analysis.riskLevel.label})
- Contract Age: ${analysis.contractAge}
- Verified: ${analysis.isVerified ? 'Yes' : 'No'}
- Holders: ${analysis.holderCount}
- Total Supply: ${analysis.totalSupply}
- Liquidity: ${analysis.liquidity}
- Top Holder Percentage: ${analysis.topHolderPercent}
- Ownership Renounced: ${analysis.isRenounced ? 'Yes' : 'No'}

Risk Factors:
${analysis.riskFactors.map(factor => `- ${factor.text} (${factor.severity} risk)`).join('\n')}

Please provide:
1. A summary of what this contract appears to be
2. An explanation of the main risks and concerns
3. Specific recommendations for potential investors
4. What to look out for with similar contracts

Keep the explanation accessible to non-technical users while being thorough about the security implications.
    `;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to get AI explanation');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No explanation available';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }
}