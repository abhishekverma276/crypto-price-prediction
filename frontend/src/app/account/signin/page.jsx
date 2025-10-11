"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../utils/useAuth";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMetaMaskReady, setIsMetaMaskReady] = useState(false);
  const router = useRouter();
  const { signIn, isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push("/");
      return;
    }

    // Check MetaMask availability
    const checkMetaMask = () => {
      if (typeof window !== 'undefined') {
        setIsMetaMaskReady(!!window.ethereum);
      }
    };

    checkMetaMask();
    
    // Listen for MetaMask installation
    if (typeof window !== 'undefined') {
      window.addEventListener('ethereum#initialized', checkMetaMask);
      
      // Fallback for slower loading
      setTimeout(checkMetaMask, 1000);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ethereum#initialized', checkMetaMask);
      }
    };
  }, [isAuthenticated, router]);

  const handleMetaMaskSignIn = async () => {
    // Prevent multiple simultaneous requests
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await signIn();
      router.push("/");
    } catch (err) {
      console.error('Sign-in error:', err);
      setError(err.message);
      
      // If MetaMask is busy, suggest retry after delay
      if (err.message.includes('already processing') || err.message.includes('busy')) {
        setTimeout(() => {
          setError(err.message + ' You can try again now.');
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-chart-line text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your crypto predictions</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <i className="fas fa-exclamation-circle text-red-400 mr-3 mt-0.5"></i>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!isMetaMaskReady ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <i className="fas fa-exclamation-triangle text-yellow-400 mr-3 mt-0.5"></i>
                <div>
                  <p className="text-sm font-medium text-yellow-800">MetaMask Not Detected</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please install MetaMask to continue
                  </p>
                </div>
              </div>
            </div>
            <a
              href="https://metamask.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center"
            >
              <i className="fas fa-download mr-2"></i>
              Install MetaMask
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleMetaMaskSignIn}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center">
                  <i className="fab fa-ethereum mr-2"></i>
                  Sign in with MetaMask
                </div>
              )}
            </button>

            {error && error.includes('try again now') && (
              <button
                onClick={() => {
                  setError(null);
                  handleMetaMaskSignIn();
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center"
              >
                <i className="fas fa-redo mr-2"></i>
                Retry Connection
              </button>
            )}
          </div>
        )}

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <a
              href="https://metamask.zendesk.com/hc/en-us"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              MetaMask Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}