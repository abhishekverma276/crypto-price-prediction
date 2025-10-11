import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      signIn: async () => {
        // Prevent multiple concurrent sign-in attempts
        if (get().isLoading) {
          throw new Error('Sign-in already in progress. Please wait.');
        }

        if (!window.ethereum) {
          throw new Error('Please install MetaMask to continue');
        }

        set({ isLoading: true, error: null });

        try {
          // First check if already connected
          const existingAccounts = await window.ethereum.request({
            method: 'eth_accounts',
          });

          let accounts;
          if (existingAccounts.length === 0) {
            // Request account access only if not already connected
            accounts = await window.ethereum.request({
              method: 'eth_requestAccounts',
            });
          } else {
            accounts = existingAccounts;
          }

          if (accounts.length === 0) {
            throw new Error('No accounts found');
          }

          const address = accounts[0];

          // Create a simple message to sign for authentication
          const message = `Welcome to Crypto Prediction App!\n\nPlease sign to authenticate your wallet.\n\nWallet: ${address.slice(0, 6)}...${address.slice(-4)}\nTime: ${new Date().toLocaleString()}`;
          
          // Request signature with proper encoding
          const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, address],
          });

          const user = {
            address,
            signature,
            message,
            signedAt: Date.now(),
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return user;
        } catch (error) {
          let errorMessage;
          
          if (error.code === 4001) {
            errorMessage = 'Connection rejected by user';
          } else if (error.code === -32002) {
            errorMessage = 'MetaMask is already processing a request. Please check MetaMask and try again.';
          } else if (error.message.includes('already processing')) {
            errorMessage = 'MetaMask is busy. Please wait a moment and try again.';
          } else {
            errorMessage = error.message || 'Failed to connect wallet';
          }
          
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          throw new Error(errorMessage);
        }
      },

      signOut: async () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      // Check if user is still connected to MetaMask
      checkConnection: async () => {
        if (!window.ethereum || !get().isAuthenticated) {
          return false;
        }

        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts.length === 0 || accounts[0] !== get().user?.address) {
            set({
              user: null,
              isAuthenticated: false,
            });
            return false;
          }

          return true;
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
          });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    ...store,
    // Add a manual connection check method
    refreshConnection: async () => {
      if (typeof window !== 'undefined' && store.isAuthenticated) {
        return await store.checkConnection();
      }
      return false;
    }
  };
};