import React, { useState } from 'react';
import { AlertTriangle, Shield, AlertCircle, Bot } from 'lucide-react';
import { ContractAnalysis } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { OpenAIService } from '../utils/openai';

interface AnalysisResultsProps {
  analysis: ContractAnalysis;
  apiKey: string;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis, apiKey }) => {
  if (!analysis || !analysis.riskLevel) {
    return null; // or return a loading state
  }
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAIResponse, setShowAIResponse] = useState(false);
  const [aiError, setAiError] = useState<string>('');

  const getRiskIcon = () => {
    const color = analysis?.riskLevel?.color;
    switch (color) {
      case 'red':
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
      case 'yellow':
        return <AlertCircle className="w-8 h-8 text-yellow-500" />;
      case 'green':
        return <Shield className="w-8 h-8 text-green-500" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-gray-500" />;
    }
  };

  const getRiskColor = (color: string) => {
    switch (color) {
      case 'red':
        return 'text-red-500';
      case 'yellow':
        return 'text-yellow-500';
      case 'green':
        return 'text-green-500';
      default:
        return 'text-red-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400';
    }
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

  return (
    <div className="space-y-6">
      {/* Token Info */}
      {(analysis.tokenName || analysis.tokenSymbol) && (
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-4 mb-2">
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
              {analysis.tokenName && (
                <h2 className="text-2xl font-bold text-white mb-1">
                  {analysis.tokenName}
                </h2>
              )}
              {analysis.tokenSymbol && (
                <p className="text-lg text-white/80 font-medium">
                  ${analysis.tokenSymbol}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Risk Score */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          {getRiskIcon()}
        </div>
        <div className="text-6xl font-bold mb-2 text-gray-800 dark:text-white">
          {analysis.riskScore}
        </div>
        <div className={`text-2xl font-semibold ${getRiskColor(analysis.riskLevel.color)}`}>
          {analysis.riskLevel.label}
        </div>
        <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-4 max-w-md mx-auto overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${
              analysis.riskLevel.color === 'red' ? 'bg-red-500' :
              analysis.riskLevel.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${analysis.riskScore}%` }}
          />
        </div>
      </div>

      {/* Contract Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/10 dark:bg-black/20 rounded-lg p-6 border border-white/20">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Contract Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-white/60">Network:</span>
              <span className="font-medium text-gray-800 dark:text-white">{analysis.network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-white/60">Contract Age:</span>
              <span className="font-medium text-gray-800 dark:text-white">{analysis.contractAge}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-white/60">Verified:</span>
              <span className={`font-medium ${analysis.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                {analysis.isVerified ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-white/60">Holders:</span>
              <span className="font-medium text-gray-800 dark:text-white">{analysis.holderCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 dark:bg-black/20 rounded-lg p-6 border border-white/20">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Token Metrics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-white/60">Total Supply:</span>
              <span className="font-medium text-gray-800 dark:text-white">{analysis.totalSupply}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-white/60">Liquidity:</span>
              <span className="font-medium text-gray-800 dark:text-white">{analysis.liquidity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-white/60">Top Holder %:</span>
              <span className="font-medium text-red-600">{analysis.topHolderPercent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-white/60">Renounced:</span>
              <span className={`font-medium ${analysis.isRenounced ? 'text-green-600' : 'text-red-600'}`}>
                {analysis.isRenounced ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
        <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Risk Factors Detected
        </h3>
        <div className="space-y-3">
          {analysis.riskFactors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border-l-4 border-red-400">
              <span className="text-gray-800 dark:text-white">{factor.text}</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(factor.severity)}`}>
                {factor.severity.toUpperCase()}
              </span>
            </div>
          ))}
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
            <div className="bg-white/10 dark:bg-black/20 border border-white/20 rounded-lg p-6">
              <h3 className="font-semibold text-neon-cyan mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Analysis
              </h3>
              <div className="text-gray-700 dark:text-white/80 leading-relaxed whitespace-pre-wrap">
                {aiExplanation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};