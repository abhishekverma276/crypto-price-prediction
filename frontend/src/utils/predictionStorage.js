// Prediction storage utility for user-specific predictions
export class PredictionStorage {
  constructor() {
    this.storageKey = 'crypto_predictions';
  }

  // Get storage key for a specific user address
  getUserStorageKey(address) {
    if (!address) throw new Error('Address is required');
    return `${this.storageKey}_${address.toLowerCase()}`;
  }

  // Save a new prediction for a user
  savePrediction(userAddress, prediction) {
    try {
      const storageKey = this.getUserStorageKey(userAddress);
      const existingPredictions = this.getUserPredictions(userAddress);
      
      // Check for recent duplicates (within last 5 minutes with same price and crypto type)
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const isDuplicate = existingPredictions.some(existing => {
        const existingDate = new Date(existing.created_at);
        return existing.crypto_type === prediction.crypto_type &&
               Math.abs(existing.prediction - prediction.prediction) < 0.01 && // Same price (within 1 cent)
               existingDate > fiveMinutesAgo && // Within last 5 minutes
               existing.tx_hash === prediction.tx_hash; // Same transaction hash
      });
      
      if (isDuplicate) {
        console.log('Duplicate prediction detected, skipping save');
        return null;
      }
      
      const newPrediction = {
        id: Date.now() + Math.random(), // Simple ID generation
        crypto_type: prediction.crypto_type,
        prediction: prediction.prediction,
        actual_price: null, // Will be updated later
        created_at: new Date().toISOString(),
        tx_hash: prediction.tx_hash || null,
        accuracy: null,
        user_address: userAddress.toLowerCase(),
        input_method: prediction.input_method || 'unknown', // manual, csv, api
        input_data: prediction.input_data || null // Store the input sequence for reference
      };

      const updatedPredictions = [newPrediction, ...existingPredictions];
      
      // Keep only the last 100 predictions to avoid storage bloat
      if (updatedPredictions.length > 100) {
        updatedPredictions.splice(100);
      }

      localStorage.setItem(storageKey, JSON.stringify(updatedPredictions));
      
      // Dispatch event to notify components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('predictionSaved', { 
          detail: { prediction: newPrediction, userAddress } 
        }));
      }
      
      console.log('Prediction saved:', newPrediction);
      return newPrediction;
    } catch (error) {
      console.error('Failed to save prediction:', error);
      return null;
    }
  }

  // Get all predictions for a specific user
  getUserPredictions(userAddress) {
    try {
      if (!userAddress) return [];
      
      const storageKey = this.getUserStorageKey(userAddress);
      const stored = localStorage.getItem(storageKey);
      
      if (!stored) return [];
      
      const predictions = JSON.parse(stored);
      
      // Validate and clean data
      return predictions.filter(p => 
        p && 
        p.crypto_type && 
        p.prediction && 
        p.created_at &&
        p.user_address === userAddress.toLowerCase()
      );
    } catch (error) {
      console.error('Failed to get user predictions:', error);
      return [];
    }
  }

  // Update a prediction with actual price and accuracy
  updatePredictionAccuracy(userAddress, predictionId, actualPrice) {
    try {
      const predictions = this.getUserPredictions(userAddress);
      const predictionIndex = predictions.findIndex(p => p.id === predictionId);
      
      if (predictionIndex === -1) {
        console.warn('Prediction not found for update:', predictionId);
        return false;
      }

      const prediction = predictions[predictionIndex];
      prediction.actual_price = actualPrice;
      
      // Calculate accuracy (as percentage of how close the prediction was)
      const difference = Math.abs(prediction.prediction - actualPrice);
      const accuracy = Math.max(0, 100 - (difference / actualPrice * 100));
      prediction.accuracy = accuracy;

      const storageKey = this.getUserStorageKey(userAddress);
      localStorage.setItem(storageKey, JSON.stringify(predictions));
      
      console.log('Prediction accuracy updated:', prediction);
      return true;
    } catch (error) {
      console.error('Failed to update prediction accuracy:', error);
      return false;
    }
  }

  // Clear all predictions for a user (useful for testing)
  clearUserPredictions(userAddress) {
    try {
      const storageKey = this.getUserStorageKey(userAddress);
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('Failed to clear predictions:', error);
      return false;
    }
  }

  // Get prediction statistics for a user
  getUserStats(userAddress) {
    try {
      const predictions = this.getUserPredictions(userAddress);
      
      const stats = {
        total: predictions.length,
        // For AI predictions, if we have a prediction value, it's considered "completed"
        // Only consider truly pending if prediction itself is missing or invalid
        pending: predictions.filter(p => !p.prediction || p.prediction <= 0).length,
        completed: predictions.filter(p => p.prediction && p.prediction > 0).length,
        avgAccuracy: null,
        byType: {}
      };

      // Calculate average accuracy for completed predictions
      const completedPredictions = predictions.filter(p => p.accuracy !== null);
      if (completedPredictions.length > 0) {
        const totalAccuracy = completedPredictions.reduce((sum, p) => sum + p.accuracy, 0);
        stats.avgAccuracy = totalAccuracy / completedPredictions.length;
      }

      // Group by crypto type
      predictions.forEach(p => {
        if (!stats.byType[p.crypto_type]) {
          stats.byType[p.crypto_type] = { count: 0, avgAccuracy: null };
        }
        stats.byType[p.crypto_type].count++;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return { total: 0, pending: 0, completed: 0, avgAccuracy: null, byType: {} };
    }
  }
}

// Create and export a singleton instance
export const predictionStorage = new PredictionStorage();