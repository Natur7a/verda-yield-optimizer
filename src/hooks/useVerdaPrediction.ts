/**
 * useVerdaPrediction Hook
 * 
 * React hook for managing VERDA AI predictions with state management
 * and toast notifications.
 */

import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  getPrediction,
  type PredictionInput,
  type PredictionResult,
  APIError,
} from '@/lib/api';

export function useVerdaPrediction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const predict = async (input: PredictionInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Show loading toast
      toast({
        title: 'Running AI Prediction',
        description: 'Analyzing mill data and market conditions...',
      });

      // Call API
      const prediction = await getPrediction(input);

      // Update state with result
      setResult(prediction);

      // Show success toast
      toast({
        title: 'Prediction Complete',
        description: `Optimal strategy: ${prediction.allocation_description}`,
      });

      return prediction;
    } catch (err) {
      let errorMessage = 'Failed to get prediction';

      if (err instanceof APIError) {
        errorMessage = err.message;
        
        // Special handling for specific error cases
        if (err.statusCode === 503) {
          errorMessage = 'AI models are not loaded. Please ensure the backend is running with trained models.';
        } else if (err.statusCode === 0) {
          errorMessage = 'Cannot connect to API server. Please ensure it is running on port 8000.';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      // Show error toast
      toast({
        title: 'Prediction Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return {
    predict,
    reset,
    isLoading,
    error,
    result,
  };
}
