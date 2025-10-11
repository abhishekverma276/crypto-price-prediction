"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../utils/useAuth";
import { useBackendHealth } from "../utils/usePrediction";

export default function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { data: isBackendOnline, isLoading: isCheckingHealth } = useBackendHealth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const getBackendStatus = () => {
    if (isCheckingHealth) return { color: 'bg-yellow-500', text: 'Checking...' };
    if (isBackendOnline) return { color: 'bg-green-500', text: 'Server Online' };
    return { color: 'bg-red-500', text: 'Server Offline' };
  };

  const status = getBackendStatus();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center">
              <i className="fas fa-chart-line text-blue-500 text-2xl mr-3"></i>
              <h1 className="font-inter text-2xl font-bold text-gray-900 dark:text-white">
                Crypto Price Predictor
              </h1>
            </div>
            
            {/* Backend Status Indicator */}
            <div className="ml-6 flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${status.color}`}></div>
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {status.text}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <i className="fas fa-sun text-yellow-500 text-lg"></i>
              ) : (
                <i className="fas fa-moon text-gray-600 text-lg"></i>
              )}
            </button>

            {/* User Section */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Connected
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-wallet text-white text-sm"></i>
                </div>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <a
                  href="/account/signin"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Sign In
                </a>
                <a
                  href="/account/signup"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}