import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { ContractAnalyzer } from './utils/contractAnalyzer';
import { ContractAnalysis } from './types';
import { useSettings } from './hooks/useSettings';
import { SettingsPanel } from './components/SettingsPanel';
import { AnalysisResults } from './components/AnalysisResults';
import { LoadingSpinner } from './components/LoadingSpinner';

function App() {
  const [contractAddress, setContractAddress] = useState('');
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  const { settings, updateSettings } = useSettings();

  const handleScan = async () => {
    const address = contractAddress.trim();
    
    if (!address) {
      setError('Please enter a contract address');
      return;
    }

    if (!ContractAnalyzer.isValidAddress(address)) {
      setError('Invalid contract address format');
      return;
    }

    setError('');
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = ContractAnalyzer.analyzeContract(address);
    setAnalysis(result);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 transition-all duration-300">
      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <button 
            onClick={() => setShowSettings(true)}
            className="absolute top-0 right-0 p-2 text-white hover:text-neon-purple transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink bg-clip-text text-transparent">
            🔍 Contract Scanner
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            AI-Powered analysis for Solana and Ethereum contracts
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-4xl mx-auto bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
          {/* Input Section */}
          <div className="p-8 border-b border-white/10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Contract Address
                </label>
                <input 
                  type="text" 
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Solana or Ethereum contract address..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-neon-purple focus:border-transparent transition-all duration-200"
                />
                {error && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleScan}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-neon-purple to-neon-pink text-white font-semibold rounded-lg hover:from-neon-blue hover:to-neon-purple transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-neon-purple/25"
                >
                  {isLoading ? 'Scanning...' : 'Scan Contract'}
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {(isLoading || analysis) && (
            <div className="p-8">
              {isLoading && (
                <div className="text-center py-12">
                  <LoadingSpinner size="lg" />
                  <p className="text-white/80 text-lg mt-4">Analyzing contract...</p>
                  <div className="mt-4 bg-white/10 rounded-full h-2 max-w-md mx-auto overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-neon-purple to-neon-pink animate-scan"></div>
                  </div>
                </div>
              )}

              {analysis && !isLoading && (
                <AnalysisResults analysis={analysis} apiKey={settings.apiKey} />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-white/60">
          <p>⚠️ This tool is for educational purposes only. Always do your own research before investing.</p>
        </div>
      </div>
    </div>
  );
}

export default App;