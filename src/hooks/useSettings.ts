import { useState, useEffect } from 'react';
import { Settings } from '../types';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    apiKey: '',
    theme: 'dark'
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedApiKey = localStorage.getItem('openai_api_key') || '';
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    
    setSettings({
      apiKey: savedApiKey,
      theme: savedTheme
    });

    // Apply theme
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // Save to localStorage
    if (newSettings.apiKey !== undefined) {
      localStorage.setItem('openai_api_key', newSettings.apiKey);
    }
    
    if (newSettings.theme !== undefined) {
      localStorage.setItem('theme', newSettings.theme);
      
      // Apply theme
      if (newSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return { settings, updateSettings };
};