"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../utils/useAuth";

export default function SignUp() {
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
      setTimeout(checkMetaMask, 1000);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ethereum#initialized', checkMetaMask);
      }
    };
  }, [isAuthenticated, router]);

  const handleMetaMaskSignUp = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await signIn();
      router.push("/");
    } catch (err) {
      console.error('Sign-up error:', err);
      setError(err.message);
      
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-user-plus text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h1>
          <p className="text-gray-600">Create your account to start predicting crypto prices</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <i className="fas fa-exclamation-circle text-red-400 mr-3 mt-0.5"></i>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleMetaMaskSignUp}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Connecting...
            </div>
          ) : (
            <div className="flex items-center">
              <img src="/metamask-icon.svg" alt="MetaMask" className="w-5 h-5 mr-2" />
              Sign up with MetaMask
            </div>
          )}
        </button>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/account/signin"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}