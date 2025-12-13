/**
 * AI Prediction Context
 * 
 * Global state management for AI predictions and derived data.
 * Provides auto-refresh, manual refresh, caching, and error handling.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { PredictionResult } from '@/lib/api';
import type { YieldForecast, PriceForecast, OptimizationScenario, AllocationData } from '@/lib/mockData';
import {
  generateAIYieldForecast,
  generateAIPriceForecast,
  getAIAllocationData,
  getAIOptimizationScenarios,
  getAIKPISummary,
  clearCache,
  type KPISummary,
} from '@/lib/aiDataService';

interface AIPredictionContextType {
  yieldForecast: YieldForecast[];
  priceForecast: PriceForecast[];
  allocationData: AllocationData[];
  kpiSummary: KPISummary | null;
  scenarios: OptimizationScenario[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  lastUpdated: Date | null;
}

const AIPredictionContext = createContext<AIPredictionContextType | undefined>(undefined);

interface AIPredictionProviderProps {
  children: ReactNode;
}

const AUTO_REFRESH_ENABLED = import.meta.env.VITE_AUTO_REFRESH_ENABLED !== 'false';
const AUTO_REFRESH_INTERVAL = parseInt(import.meta.env.VITE_AUTO_REFRESH_INTERVAL || '300000'); // 5 minutes

export function AIPredictionProvider({ children }: AIPredictionProviderProps) {
  const [yieldForecast, setYieldForecast] = useState<YieldForecast[]>([]);
  const [priceForecast, setPriceForecast] = useState<PriceForecast[]>([]);
  const [allocationData, setAllocationData] = useState<AllocationData[]>([]);
  const [kpiSummary, setKpiSummary] = useState<KPISummary | null>(null);
  const [scenarios, setScenarios] = useState<OptimizationScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load all data in parallel for better performance
      const [
        yieldData,
        priceData,
        allocationResult,
        kpiData,
        scenariosData,
      ] = await Promise.all([
        generateAIYieldForecast(),
        generateAIPriceForecast(),
        getAIAllocationData(),
        getAIKPISummary(),
        getAIOptimizationScenarios(),
      ]);

      setYieldForecast(yieldData);
      setPriceForecast(priceData);
      setAllocationData(allocationResult);
      setKpiSummary(kpiData);
      setScenarios(scenariosData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'string' 
          ? err 
          : 'Failed to load AI predictions. Please try again.';
      setError(errorMessage);
      console.error('AI Prediction Error:', err);
      
      // Keep existing data on error (graceful degradation)
      // Only set error state without clearing existing data
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    clearCache();
    await loadData();
  }, [loadData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh
  useEffect(() => {
    if (!AUTO_REFRESH_ENABLED) return;

    const interval = setInterval(() => {
      refreshData();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [refreshData]);

  const value: AIPredictionContextType = {
    yieldForecast,
    priceForecast,
    allocationData,
    kpiSummary,
    scenarios,
    isLoading,
    error,
    refreshData,
    lastUpdated,
  };

  return (
    <AIPredictionContext.Provider value={value}>
      {children}
    </AIPredictionContext.Provider>
  );
}

export function useAIPredictionData(): AIPredictionContextType {
  const context = useContext(AIPredictionContext);
  if (context === undefined) {
    throw new Error('useAIPredictionData must be used within AIPredictionProvider');
  }
  return context;
}
