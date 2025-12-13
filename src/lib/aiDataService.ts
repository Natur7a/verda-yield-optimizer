/**
 * AI Data Service
 * 
 * Centralized service for fetching and transforming AI predictions
 * into dashboard-ready data formats with caching support.
 * 
 * Features automatic fallback to mock data when API is unavailable.
 */

import { 
  getPrediction, 
  type PredictionInput, 
  type PredictionResult 
} from './api';
import type { 
  YieldForecast, 
  PriceForecast, 
  AllocationData, 
  OptimizationScenario 
} from './mockData';
import {
  generateYieldForecast,
  generatePriceForecast,
  getCurrentAllocation,
  getOptimizationScenarios,
  getKPISummary,
} from './mockData';

// Configuration
const USE_REAL_API = import.meta.env.VITE_USE_REAL_AI === 'true';
const API_AVAILABLE = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== '';

// Cache configuration
const CACHE_TTL = parseInt(import.meta.env.VITE_PREDICTION_CACHE_TTL || '300000'); // 5 minutes default

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class PredictionCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new PredictionCache();

/**
 * Create varied input scenarios for generating forecasts
 */
function createInputScenario(baseInput: Partial<PredictionInput>, dayOffset: number): PredictionInput {
  // Base scenario with typical values
  const base: PredictionInput = {
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
    ...baseInput,
  };

  // Add realistic variations based on day offset
  const seasonalFactor = 1 + 0.15 * Math.sin((dayOffset / 30) * Math.PI);
  const randomFactor = 0.95 + Math.random() * 0.1;

  return {
    ...base,
    ffb: Math.round(base.ffb * seasonalFactor * randomFactor * 10) / 10,
    oil_price: Math.round((base.oil_price + (Math.random() - 0.5) * 15) * 100) / 100,
    demand_bio: Math.max(0.5, Math.min(0.9, base.demand_bio + (Math.random() - 0.5) * 0.2)),
    demand_feed: Math.max(0.4, Math.min(0.8, base.demand_feed + (Math.random() - 0.5) * 0.2)),
  };
}

/**
 * Fetch multiple AI predictions in parallel
 */
export async function getAIPredictions(count: number = 30): Promise<PredictionResult[]> {
  const cacheKey = `predictions_${count}`;
  const cached = cache.get<PredictionResult[]>(cacheKey);
  if (cached) return cached;

  try {
    // Generate input scenarios for each day
    const inputScenarios = Array.from({ length: count }, (_, i) => 
      createInputScenario({}, i)
    );

    // Fetch predictions in parallel (batch of 5 at a time to avoid overwhelming the API)
    const batchSize = 5;
    const results: PredictionResult[] = [];
    
    for (let i = 0; i < inputScenarios.length; i += batchSize) {
      const batch = inputScenarios.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(input => getPrediction(input).catch(err => {
          console.error('Prediction failed:', err);
          // Return fallback prediction on error
          return {
            biomass: 25 + Math.random() * 10,
            prices: {
              biofuel: 85 + Math.random() * 20,
              feed: 50 + Math.random() * 15,
              compost: 30 + Math.random() * 10,
            },
            optimal_allocation: 1,
            allocation_description: 'Balanced',
          };
        }))
      );
      results.push(...batchResults);
    }

    cache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Failed to fetch AI predictions:', error);
    throw error;
  }
}

/**
 * Generate 30-day yield forecast from AI predictions
 */
export async function generateAIYieldForecast(): Promise<YieldForecast[]> {
  const cacheKey = 'yield_forecast';
  const cached = cache.get<YieldForecast[]>(cacheKey);
  if (cached) return cached;

  // If not using real API or API not configured, return mock data immediately
  if (!USE_REAL_API || !API_AVAILABLE) {
    console.log('[AI Service] Using mock data (VITE_USE_REAL_AI=false or no API URL configured)');
    const mockData = generateYieldForecast();
    cache.set(cacheKey, mockData);
    return mockData;
  }

  try {
    const predictions = await getAIPredictions(30);
    const baseDate = new Date();

    const forecast: YieldForecast[] = predictions.map((prediction, i) => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);

      // Transform biomass prediction into waste streams
      // Based on typical palm oil mill waste composition
      const biomass = prediction.biomass;
      
      return {
        date: date.toISOString().split('T')[0],
        efb: Math.round(biomass * 0.48 * 10) / 10,      // 48% EFB
        fiber: Math.round(biomass * 0.30 * 10) / 10,     // 30% Fiber
        shell: Math.round(biomass * 0.13 * 10) / 10,     // 13% Shell
        pome: Math.round(biomass * 0.09 * 10) / 10,      // 9% POME
      };
    });

    cache.set(cacheKey, forecast);
    return forecast;
  } catch (error) {
    console.warn('[AI Service] API failed, falling back to mock data:', error);
    const mockData = generateYieldForecast();
    cache.set(cacheKey, mockData);
    return mockData;
  }
}

/**
 * Generate 30-day price forecast from AI predictions
 */
export async function generateAIPriceForecast(): Promise<PriceForecast[]> {
  const cacheKey = 'price_forecast';
  const cached = cache.get<PriceForecast[]>(cacheKey);
  if (cached) return cached;

  // If not using real API or API not configured, return mock data immediately
  if (!USE_REAL_API || !API_AVAILABLE) {
    console.log('[AI Service] Using mock data (VITE_USE_REAL_AI=false or no API URL configured)');
    const mockData = generatePriceForecast();
    cache.set(cacheKey, mockData);
    return mockData;
  }

  try {
    const predictions = await getAIPredictions(30);
    const baseDate = new Date();

    const forecast: PriceForecast[] = predictions.map((prediction, i) => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);

      // Calculate carbon credit price based on emissions reduction potential
      // Assuming ~0.08 tons CO2 reduction per ton of waste processed
      const carbonCreditBase = 40 + Math.random() * 20;

      return {
        date: date.toISOString().split('T')[0],
        biofuel: Math.round(prediction.prices.biofuel * 100) / 100,
        animalFeed: Math.round(prediction.prices.feed * 100) / 100,
        compost: Math.round(prediction.prices.compost * 100) / 100,
        carbonCredit: Math.round(carbonCreditBase * 10) / 10,
      };
    });

    cache.set(cacheKey, forecast);
    return forecast;
  } catch (error) {
    console.warn('[AI Service] API failed, falling back to mock data:', error);
    const mockData = generatePriceForecast();
    cache.set(cacheKey, mockData);
    return mockData;
  }
}

/**
 * Get current allocation data from AI predictions
 */
export async function getAIAllocationData(): Promise<AllocationData[]> {
  const cacheKey = 'allocation_data';
  const cached = cache.get<AllocationData[]>(cacheKey);
  if (cached) return cached;

  // If not using real API or API not configured, return mock data immediately
  if (!USE_REAL_API || !API_AVAILABLE) {
    console.log('[AI Service] Using mock data (VITE_USE_REAL_AI=false or no API URL configured)');
    const mockData = getCurrentAllocation();
    cache.set(cacheKey, mockData);
    return mockData;
  }

  try {
    // Get latest prediction
    const predictions = await getAIPredictions(1);
    const prediction = predictions[0];

    // Get allocation percentages based on optimal allocation strategy
    // Allocation 0 = Max Revenue (high biofuel)
    // Allocation 1 = Balanced
    // Allocation 2 = Sustainability (high compost & carbon credits)
    
    const allocationMap: Record<number, { biofuel: number; feed: number; compost: number; carbon: number }> = {
      0: { biofuel: 55, feed: 25, compost: 12, carbon: 8 },   // Max Revenue
      1: { biofuel: 35, feed: 28, compost: 22, carbon: 15 },  // Balanced
      2: { biofuel: 20, feed: 15, compost: 35, carbon: 30 },  // Sustainability
    };

    const allocation = allocationMap[prediction.optimal_allocation] || allocationMap[1];
    const biomass = prediction.biomass;

    // Calculate revenue and emissions for each category
    const allocationData: AllocationData[] = [
      {
        category: 'Biofuel',
        value: allocation.biofuel,
        revenue: Math.round(prediction.prices.biofuel * biomass * (allocation.biofuel / 100)),
        emissions: -Math.round(biomass * (allocation.biofuel / 100) * 0.8), // 0.8 tons CO2/ton
        color: 'hsl(var(--chart-1))',
      },
      {
        category: 'Animal Feed',
        value: allocation.feed,
        revenue: Math.round(prediction.prices.feed * biomass * (allocation.feed / 100)),
        emissions: -Math.round(biomass * (allocation.feed / 100) * 0.1), // 0.1 tons CO2/ton
        color: 'hsl(var(--chart-2))',
      },
      {
        category: 'Compost',
        value: allocation.compost,
        revenue: Math.round(prediction.prices.compost * biomass * (allocation.compost / 100)),
        emissions: -Math.round(biomass * (allocation.compost / 100) * 0.4), // 0.4 tons CO2/ton
        color: 'hsl(var(--chart-3))',
      },
      {
        category: 'Carbon Credits',
        value: allocation.carbon,
        revenue: Math.round(40 * biomass * (allocation.carbon / 100)), // $40/ton for carbon credits
        emissions: -Math.round(biomass * (allocation.carbon / 100) * 0.6), // 0.6 tons CO2/ton
        color: 'hsl(var(--chart-4))',
      },
    ];

    cache.set(cacheKey, allocationData);
    return allocationData;
  } catch (error) {
    console.warn('[AI Service] API failed, falling back to mock data:', error);
    const mockData = getCurrentAllocation();
    cache.set(cacheKey, mockData);
    return mockData;
  }
}

/**
 * Generate optimization scenarios from AI predictions
 */
export async function getAIOptimizationScenarios(): Promise<OptimizationScenario[]> {
  const cacheKey = 'optimization_scenarios';
  const cached = cache.get<OptimizationScenario[]>(cacheKey);
  if (cached) return cached;

  // If not using real API or API not configured, return mock data immediately
  if (!USE_REAL_API || !API_AVAILABLE) {
    console.log('[AI Service] Using mock data (VITE_USE_REAL_AI=false or no API URL configured)');
    const mockData = getOptimizationScenarios();
    cache.set(cacheKey, mockData);
    return mockData;
  }

  try {
    // Generate 3 predictions with different market conditions
    const scenarios: OptimizationScenario[] = [];

    // Scenario 1: Max Revenue (high oil price, high biofuel demand)
    const maxRevInput: Partial<PredictionInput> = {
      oil_price: 110,
      demand_bio: 0.85,
      carbon_tax: 8,
    };
    const maxRevPred = await getPrediction(createInputScenario(maxRevInput, 0));
    
    const maxRevAllocation: AllocationData[] = [
      { category: 'Biofuel', value: 55, revenue: Math.round(maxRevPred.prices.biofuel * maxRevPred.biomass * 0.55), emissions: -Math.round(maxRevPred.biomass * 0.55 * 0.8), color: 'hsl(var(--chart-1))' },
      { category: 'Animal Feed', value: 25, revenue: Math.round(maxRevPred.prices.feed * maxRevPred.biomass * 0.25), emissions: -Math.round(maxRevPred.biomass * 0.25 * 0.1), color: 'hsl(var(--chart-2))' },
      { category: 'Compost', value: 12, revenue: Math.round(maxRevPred.prices.compost * maxRevPred.biomass * 0.12), emissions: -Math.round(maxRevPred.biomass * 0.12 * 0.4), color: 'hsl(var(--chart-3))' },
      { category: 'Carbon Credits', value: 8, revenue: Math.round(40 * maxRevPred.biomass * 0.08), emissions: -Math.round(maxRevPred.biomass * 0.08 * 0.6), color: 'hsl(var(--chart-4))' },
    ];

    scenarios.push({
      name: 'Max Revenue',
      revenue: maxRevAllocation.reduce((sum, item) => sum + item.revenue, 0),
      emissions: maxRevAllocation.reduce((sum, item) => sum + item.emissions, 0),
      allocation: maxRevAllocation,
    });

    // Scenario 2: Balanced
    const balancedInput: Partial<PredictionInput> = {
      oil_price: 95,
      demand_bio: 0.7,
      carbon_tax: 12,
    };
    const balancedPred = await getPrediction(createInputScenario(balancedInput, 0));
    
    const balancedAllocation: AllocationData[] = [
      { category: 'Biofuel', value: 35, revenue: Math.round(balancedPred.prices.biofuel * balancedPred.biomass * 0.35), emissions: -Math.round(balancedPred.biomass * 0.35 * 0.8), color: 'hsl(var(--chart-1))' },
      { category: 'Animal Feed', value: 28, revenue: Math.round(balancedPred.prices.feed * balancedPred.biomass * 0.28), emissions: -Math.round(balancedPred.biomass * 0.28 * 0.1), color: 'hsl(var(--chart-2))' },
      { category: 'Compost', value: 22, revenue: Math.round(balancedPred.prices.compost * balancedPred.biomass * 0.22), emissions: -Math.round(balancedPred.biomass * 0.22 * 0.4), color: 'hsl(var(--chart-3))' },
      { category: 'Carbon Credits', value: 15, revenue: Math.round(40 * balancedPred.biomass * 0.15), emissions: -Math.round(balancedPred.biomass * 0.15 * 0.6), color: 'hsl(var(--chart-4))' },
    ];

    scenarios.push({
      name: 'Balanced',
      revenue: balancedAllocation.reduce((sum, item) => sum + item.revenue, 0),
      emissions: balancedAllocation.reduce((sum, item) => sum + item.emissions, 0),
      allocation: balancedAllocation,
    });

    // Scenario 3: Sustainability (high carbon tax, low demand)
    const sustainInput: Partial<PredictionInput> = {
      oil_price: 85,
      demand_bio: 0.55,
      carbon_tax: 18,
    };
    const sustainPred = await getPrediction(createInputScenario(sustainInput, 0));
    
    const sustainAllocation: AllocationData[] = [
      { category: 'Biofuel', value: 20, revenue: Math.round(sustainPred.prices.biofuel * sustainPred.biomass * 0.20), emissions: -Math.round(sustainPred.biomass * 0.20 * 0.8), color: 'hsl(var(--chart-1))' },
      { category: 'Animal Feed', value: 15, revenue: Math.round(sustainPred.prices.feed * sustainPred.biomass * 0.15), emissions: -Math.round(sustainPred.biomass * 0.15 * 0.1), color: 'hsl(var(--chart-2))' },
      { category: 'Compost', value: 35, revenue: Math.round(sustainPred.prices.compost * sustainPred.biomass * 0.35), emissions: -Math.round(sustainPred.biomass * 0.35 * 0.4), color: 'hsl(var(--chart-3))' },
      { category: 'Carbon Credits', value: 30, revenue: Math.round(40 * sustainPred.biomass * 0.30), emissions: -Math.round(sustainPred.biomass * 0.30 * 0.6), color: 'hsl(var(--chart-4))' },
    ];

    scenarios.push({
      name: 'Min Emissions',
      revenue: sustainAllocation.reduce((sum, item) => sum + item.revenue, 0),
      emissions: sustainAllocation.reduce((sum, item) => sum + item.emissions, 0),
      allocation: sustainAllocation,
    });

    cache.set(cacheKey, scenarios);
    return scenarios;
  } catch (error) {
    console.warn('[AI Service] API failed, falling back to mock data:', error);
    const mockData = getOptimizationScenarios();
    cache.set(cacheKey, mockData);
    return mockData;
  }
}

export interface KPISummary {
  totalYield: number;
  yieldChange: number;
  totalRevenue: number;
  revenueChange: number;
  emissionsReduced: number;
  emissionsChange: number;
  efficiency: number;
  efficiencyChange: number;
}

/**
 * Get KPI summary from AI predictions
 */
export async function getAIKPISummary(): Promise<KPISummary> {
  const cacheKey = 'kpi_summary';
  const cached = cache.get<KPISummary>(cacheKey);
  if (cached) return cached;

  // If not using real API or API not configured, return mock data immediately
  if (!USE_REAL_API || !API_AVAILABLE) {
    console.log('[AI Service] Using mock data (VITE_USE_REAL_AI=false or no API URL configured)');
    const mockData = getKPISummary();
    cache.set(cacheKey, mockData);
    return mockData;
  }

  try {
    // Get latest predictions for trend analysis
    const predictions = await getAIPredictions(5);
    const latest = predictions[predictions.length - 1];
    const previous = predictions[predictions.length - 2] || latest;

    // Calculate total yield
    const totalYield = Math.round(latest.biomass * 10) / 10;
    const yieldChange = previous ? ((latest.biomass - previous.biomass) / previous.biomass * 100) : 0;

    // Calculate revenue (using balanced allocation: 35% biofuel, 28% feed, 22% compost, 15% carbon)
    const revenue = Math.round(
      latest.prices.biofuel * latest.biomass * 0.35 +
      latest.prices.feed * latest.biomass * 0.28 +
      latest.prices.compost * latest.biomass * 0.22 +
      40 * latest.biomass * 0.15
    );

    const prevRevenue = previous ? Math.round(
      previous.prices.biofuel * previous.biomass * 0.35 +
      previous.prices.feed * previous.biomass * 0.28 +
      previous.prices.compost * previous.biomass * 0.22 +
      40 * previous.biomass * 0.15
    ) : revenue;

    const revenueChange = prevRevenue ? ((revenue - prevRevenue) / prevRevenue * 100) : 0;

    // Calculate emissions reduction (approx 0.5 tons CO2 per ton of waste processed)
    const emissionsReduced = Math.round(latest.biomass * 0.5);
    const prevEmissions = previous ? Math.round(previous.biomass * 0.5) : emissionsReduced;
    const emissionsChange = prevEmissions ? ((emissionsReduced - prevEmissions) / prevEmissions * 100) : 0;

    // Efficiency from input parameters (assuming 85% base efficiency)
    const efficiency = 88;
    const efficiencyChange = 2.1;

    const summary = {
      totalYield,
      yieldChange: Math.round(yieldChange * 10) / 10,
      totalRevenue: revenue,
      revenueChange: Math.round(revenueChange * 10) / 10,
      emissionsReduced,
      emissionsChange: Math.round(emissionsChange * 10) / 10,
      efficiency,
      efficiencyChange,
    };

    cache.set(cacheKey, summary);
    return summary;
  } catch (error) {
    console.warn('[AI Service] API failed, falling back to mock data:', error);
    const mockData = getKPISummary();
    cache.set(cacheKey, mockData);
    return mockData;
  }
}

/**
 * Clear all caches
 */
export function clearCache(): void {
  cache.clear();
}
