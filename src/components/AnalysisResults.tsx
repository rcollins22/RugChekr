import React, { useState } from 'react';
import { CheckCircle, XCircle, Bot, ExternalLink } from 'lucide-react';
import { ContractAnalysis } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { OpenAIService } from '../utils/openai';

interface AnalysisResultsProps {
  analysis: ContractAnalysis;
  apiKey: string;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis, apiKey }) => {
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAIResponse, setShowAIResponse] = useState(false);
  const [aiError, setAiError] = useState<string>('');

  if (!analysis || !analysis.riskLevel) {
    return null;
  }

  const getStatusIcon = (isPositive: boolean) => {
    return isPositive ? (
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
    );
  };

  const handleAIExplanation = async () => {
    if (!apiKey) {
      setAiError('Please add your OpenAI API key in settings first');
      return;
    }

    setIsLoadingAI(true);
    setAiError('');
    setShowAIResponse(true);

    try {
      const explanation = await OpenAIService.explainContract(analysis, apiKey);
      setAiExplanation(explanation);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Failed to get AI explanation');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const etherscanUrl = `https://etherscan.io/address/${analysis.address}`;
  const dexScreenerUrl = `https://dexscreener.com/ethereum/${analysis.address}`;

  return (
    <div className="space-y-6">
      {/* Token Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          {analysis.tokenImage && (
            <img 
              src={analysis.tokenImage} 
              alt={analysis.tokenName || analysis.tokenSymbol} 
              className="w-12 h-12 rounded-full border-2 border-white/20"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">
              {analysis.tokenName} ({analysis.tokenSymbol})
            </h1>
            <p className="text-gray-400 text-sm font-mono">
              {analysis.network}: {analysis.address}
            </p>
          </div>
        </div>

        {/* Links and Deployment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-white font-medium mb-2">Links</h3>
            <div className="flex flex-wrap gap-2">
              <a 
                href={etherscanUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline text-sm flex items-center gap-1"
              >
                Etherscan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h3 className="text-white font-medium mb-2 mt-4">Chart</h3>
            <div className="flex flex-wrap gap-2">
              <a 
                href={dexScreenerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline text-sm flex items-center gap-1"
              >
                DEX Screener <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-white font-medium mb-2">Deployed</h3>
            <p className="text-gray-300 text-sm">{analysis.contractAge}</p>
            {analysis.contractCreator && (
              <>
                <div className="flex gap-2 mt-2">
                  <a 
                    href={`https://etherscan.io/tx/${analysis.contractCreator}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline text-sm"
                  >
                    Transaction
                  </a>
                  <a 
                    href={`https://etherscan.io/address/${analysis.contractCreator}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline text-sm"
                  >
                    Creator
                  </a>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded border border-yellow-500 transition-colors">
            CONTRACT
          </button>
          <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded border border-yellow-500 transition-colors">
            BUBBLE MAP
          </button>
        </div>
      </div>

      {/* Score Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-white text-xl font-bold mb-2">
          Score: <span className="text-red-500">{analysis.auditScore}/100</span>
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          The audit score is a measure of how well the token meets the criteria for safety. Automated scanners like this one are not always completely accurate. A token with a high score may still have hidden malicious code. The score is not advice and should be considered along with other factors. Always do your own research and consult multiple sources of information. Results are regenerated every 15 minutes.
        </p>
      </div>

      {/* Swap Analysis */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-white text-xl font-bold mb-4">
          Swap Analysis <span className="text-gray-400 text-sm font-normal">(courtesy of honeypot.is)</span>
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            {getStatusIcon(analysis.honeypotStatus === 'Sellable')}
            <div>
              <p className="text-white font-medium">
                Token is {analysis.honeypotStatus.toLowerCase()} {analysis.honeypotStatus === 'Sellable' ? '(not a honeypot)' : ''} at this time
              </p>
              {analysis.honeypotStatus !== 'Sellable' && (
                <p className="text-gray-400 text-sm mt-1">This token appears to be unsellable.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contract Analysis */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-white text-xl font-bold mb-4">Contract Analysis</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            {getStatusIcon(analysis.isVerified)}
            <div>
              <p className="text-white font-medium">Verified contract source</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {getStatusIcon(analysis.sourceCodeStatus === 'Standard ERC-20 implementation')}
            <div>
              <p className="text-white font-medium">
                {analysis.sourceCodeStatus === 'Standard ERC-20 implementation' 
                  ? 'Standard ERC-20 implementation' 
                  : 'Source contains a non-standard identifier'}
              </p>
              {analysis.sourceCodeStatus !== 'Standard ERC-20 implementation' && (
                <p className="text-gray-400 text-sm mt-1">
                  The source code contains a non-standard ERC-20 identifier which may indicate the presence of malicious code.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            {getStatusIcon(analysis.isRenounced)}
            <div>
              <p className="text-white font-medium">
                {analysis.isRenounced 
                  ? 'Ownership renounced or source does not contain an owner contract'
                  : 'Ownership not renounced'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {getStatusIcon(analysis.creatorWalletHoldings.includes('less than 5%'))}
            <div>
              <p className="text-white font-medium">
                {analysis.creatorWalletHoldings.includes('less than 5%')
                  ? 'Creator not authorized for special permission'
                  : 'Creator has special permissions'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Holder Analysis */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-white text-xl font-bold mb-2">
          Holder Analysis
        </h2>
        <div className="flex gap-4 mb-4 text-sm">
          <button className="text-blue-400 hover:text-blue-300 underline">View Holders</button>
          <span className="text-gray-400">|</span>
          <button className="text-blue-400 hover:text-blue-300 underline">View Bubble Map</button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            {getStatusIcon(false)}
            <div>
              <p className="text-white font-medium">
                Creator wallet contains more than 5% of circulating token supply ({analysis.creatorWalletHoldings})
              </p>
              <p className="text-gray-400 text-sm mt-1">
                The creator wallet contains a substantial amount of tokens (circulating supply is total supply minus burned amount) which could have a large impact on the token price if sold.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {getStatusIcon(false)}
            <div>
              <p className="text-white font-medium">All other holders possess less than 5% of circulating token supply</p>
              <p className="text-gray-400 text-sm mt-1">
                A wallet contains a substantial amount of tokens (circulating supply is total supply minus burned amount) which could have a large impact on the token price if sold.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {getStatusIcon(false)}
            <div>
              <p className="text-white font-medium">
                Top 10 token holders possess more than 70% of circulating token supply ({analysis.top10HolderPercentage})
              </p>
              <p className="text-gray-400 text-sm mt-1">
                The top 10 holders possess a substantial amount of tokens (circulating supply is total supply minus burned amount) which could have a large impact on the token price if sold.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liquidity Analysis */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-white text-xl font-bold mb-4">Liquidity Analysis</h2>
        
        <p className="text-gray-400 text-sm mb-4">
          Please see the list of <button className="text-blue-400 hover:text-blue-300 underline">supported DEXes and lockers</button>.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            {getStatusIcon(false)}
            <div>
              <p className="text-white font-medium">Inadequate current liquidity</p>
              <p className="text-gray-400 text-sm mt-1">
                {analysis.liquidity} in Uniswap v2 
                <button className="text-blue-400 hover:text-blue-300 underline ml-2">View LP</button>
                <span className="mx-2">|</span>
                <button className="text-blue-400 hover:text-blue-300 underline">View Holders</button>
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Not enough liquidity is present which could potentially cause high slippage and other problems when swapping.
              </p>
              <p className="text-white font-medium mt-2">Initial liquidity</p>
              <p className="text-gray-400 text-sm">1 ETH in Uniswap v2</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {getStatusIcon(analysis.liquidityLockStatus.includes('Locked') || analysis.liquidityLockStatus.includes('Burned'))}
            <div>
              <p className="text-white font-medium">
                At least 95% of largest pool's liquidity {analysis.liquidityLockStatus.toLowerCase()} for 15 days or longer (0%)
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Not enough liquidity is secured for the minimum duration which could allow for significant amounts to be removed (rug pull).
              </p>
              <p className="text-gray-400 text-sm mt-1">
                NOTE: this test only checks well-known lockers and will not accurately represent locked liquidity from some locking/vesting contracts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {getStatusIcon(true)}
            <div>
              <p className="text-white font-medium">Creator wallet contains less than 5% of liquidity (0%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Explanation Button */}
      <div className="text-center">
        <button 
          onClick={handleAIExplanation}
          disabled={isLoadingAI}
          className="px-8 py-3 bg-gradient-to-r from-neon-blue to-neon-cyan text-white font-semibold rounded-lg hover:from-neon-purple hover:to-neon-blue transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-neon-cyan/25 flex items-center gap-2 mx-auto"
        >
          <Bot className="w-5 h-5" />
          {isLoadingAI ? 'Analyzing...' : 'Explain with AI'}
        </button>
      </div>

      {/* AI Explanation Section */}
      {showAIResponse && (
        <div className="mt-6">
          {isLoadingAI && (
            <div className="text-center py-8">
              <LoadingSpinner size="md" color="border-neon-cyan" />
              <p className="text-gray-600 dark:text-white/80 mt-4">AI is analyzing the contract...</p>
            </div>
          )}

          {aiError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
              <h3 className="font-semibold text-red-600 mb-2">Error</h3>
              <p className="text-red-600">{aiError}</p>
            </div>
          )}

          {aiExplanation && !isLoadingAI && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-neon-cyan mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Analysis
              </h3>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {aiExplanation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};