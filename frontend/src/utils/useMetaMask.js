import { useState } from 'react';

export const useMetaMask = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);

  const connect = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        return true;
      } else {
        setError('No accounts found');
        return false;
      }
    } catch (err) {
      const errorMessage = err.code === 4001 
        ? 'Connection rejected by user' 
        : 'Failed to connect wallet';
      setError(errorMessage);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setError(null);
  };

  const checkConnection = async () => {
    if (!window.ethereum) {
      return false;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error checking connection:', err);
      return false;
    }
  };

  return {
    isConnected,
    isConnecting,
    address,
    error,
    connect,
    disconnect,
    checkConnection,
  };
};