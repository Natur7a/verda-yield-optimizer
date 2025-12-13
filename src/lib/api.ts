/**
 * VERDA AI API Client
 * 
 * TypeScript client for communicating with the FastAPI backend.
 * Handles all API calls with proper error handling and type safety.
 */

// Type definitions matching backend
export interface PredictionInput {
  ffb: number;
  cpo: number;
  moisture: number;
  cv: number;
  eff: number;
  oil_price: number;
  demand_bio: number;
  carbon_tax: number;
  demand_feed: number;
  protein_score: number;
  supply_factor: number;
  compost_base: number;
  nutrient_score: number;
}

export interface PredictionResult {
  biomass: number;
  prices: {
    biofuel: number;
    feed: number;
    compost: number;
  };
  optimal_allocation: number;
  allocation_description: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
}

export interface ModelInfo {
  model_name: string;
  version: string;
  training_date: string;
  models: {
    [key: string]: string;
  };
  metrics?: Record<string, unknown>;
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Get API URL from environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Make a request to the API with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  // Log in development
  if (import.meta.env.DEV) {
    console.log(`[API] ${options.method || 'GET'} ${url}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.statusText}`;
      let errorDetails;

      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
        errorDetails = errorData;
      } catch {
        // If error response is not JSON, use status text
      }

      throw new APIError(errorMessage, response.status, errorDetails);
    }

    const data = await response.json();
    
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API] Response:`, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network or other errors
    if (error instanceof Error) {
      // Check if it's a network/fetch error
      if (error.message.includes('fetch') || error.name === 'TypeError') {
        throw new APIError(
          'Cannot connect to AI backend. Please ensure the API server is running.',
          0,
          { originalError: error }
        );
      }
      throw new APIError(
        `Network error: ${error.message}`,
        0,
        { originalError: error }
      );
    }

    throw new APIError('An unknown error occurred');
  }
}

/**
 * Get a prediction from the AI model
 */
export async function getPrediction(
  input: PredictionInput
): Promise<PredictionResult> {
  return apiRequest<PredictionResult>('/predict', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/**
 * Check API health status
 */
export async function checkHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/health');
}

/**
 * Check if API is available (with timeout)
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '5000');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get model information and metadata
 */
export async function getModelsInfo(): Promise<ModelInfo> {
  return apiRequest<ModelInfo>('/models/info');
}

/**
 * Create a sample input for testing
 */
export function createSampleInput(): PredictionInput {
  return {
    ffb: 120,
    cpo: 25,
    moisture: 40,
    cv: 17,
    eff: 0.85,
    oil_price: 95,
    demand_bio: 0.7,
    carbon_tax: 12,
    demand_feed: 0.55,
    protein_score: 0.9,
    supply_factor: 1.1,
    compost_base: 30,
    nutrient_score: 1.0,
  };
}
