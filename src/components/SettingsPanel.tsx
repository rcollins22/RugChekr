import React, { useState } from 'react';
import { X, Settings as SettingsIcon, Sun, Moon } from 'lucide-react';
import { Settings } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (settings: Partial<Settings>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateSettings({ apiKey });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    onUpdateSettings({ theme });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Settings Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white/10 dark:bg-black/30 backdrop-blur-xl border-l border-white/20 z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Settings
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-600 dark:text-white/80 hover:text-neon-purple transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Theme Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-3">
              Theme
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  settings.theme === 'light'
                    ? 'bg-neon-purple text-white'
                    : 'bg-white/10 text-gray-700 dark:text-white hover:bg-white/20'
                }`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-neon-purple text-white'
                    : 'bg-white/10 text-gray-700 dark:text-white hover:bg-white/20'
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-white/80 mb-2">
              OpenAI API Key
            </label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:ring-2 focus:ring-neon-purple focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-600 dark:text-white/60 mt-1">
              Required for AI contract explanations
            </p>
          </div>

          {/* Save Button */}
          <button 
            onClick={handleSave}
            className={`w-full px-4 py-2 font-semibold rounded-lg transition-all duration-300 ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-neon-purple to-neon-pink text-white hover:from-neon-blue hover:to-neon-purple shadow-lg hover:shadow-neon-purple/25'
            }`}
          >
            {saved ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </>
  );
};