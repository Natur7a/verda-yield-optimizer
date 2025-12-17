/**
 * Prediction Input Validation Rules and Presets
 * 
 * Defines validation constraints and preset configurations
 * for the AI prediction form.
 */

import { PredictionInput } from './api';

export interface ValidationRule {
  min: number;
  max: number;
  label: string;
  unit?: string;
  tooltip: string;
}

export const validationRules: Record<keyof PredictionInput, ValidationRule> = {
  ffb: {
    min: 80,
    max: 150,
    label: 'FFB (Fresh Fruit Bunches)',
    unit: 'tons/day',
    tooltip: 'Daily processing capacity of fresh fruit bunches. Typical range for medium-sized palm oil mills.',
  },
  cpo: {
    min: 14,
    max: 36,
    label: 'CPO (Crude Palm Oil)',
    unit: '%',
    tooltip: 'Percentage of crude palm oil extracted from fresh fruit bunches. Higher values indicate better extraction efficiency.',
  },
  moisture: {
    min: 35,
    max: 45,
    label: 'Moisture Content',
    unit: '%',
    tooltip: 'Moisture percentage in biomass waste. Affects combustion efficiency and energy generation potential.',
  },
  cv: {
    min: 16,
    max: 19,
    label: 'Calorific Value (CV)',
    unit: 'MJ/kg',
    tooltip: 'Energy content of biomass waste per kilogram. Higher values mean more energy potential for biofuel production.',
  },
  eff: {
    min: 0.75,
    max: 0.95,
    label: 'Mill Efficiency',
    unit: '',
    tooltip: 'Overall operational efficiency of the palm oil mill (0.75 = 75%, 0.95 = 95%). Affects total productivity.',
  },
  oil_price: {
    min: 70,
    max: 130,
    label: 'Oil Price Index',
    unit: '',
    tooltip: 'Market price index for palm oil. Higher values indicate favorable market conditions for oil-based products.',
  },
  demand_bio: {
    min: 0.4,
    max: 1.0,
    label: 'Biofuel Demand',
    unit: '',
    tooltip: 'Market demand factor for biofuel products (0.4 = 40%, 1.0 = 100%). Influences biofuel allocation profitability.',
  },
  carbon_tax: {
    min: 8,
    max: 15,
    label: 'Carbon Tax',
    unit: '$/ton CO₂',
    tooltip: 'Carbon tax rate per ton of CO₂ emissions. Higher taxes incentivize cleaner biomass utilization strategies.',
  },
  demand_feed: {
    min: 0.4,
    max: 1.0,
    label: 'Animal Feed Demand',
    unit: '',
    tooltip: 'Market demand factor for animal feed products (0.4 = 40%, 1.0 = 100%). Affects feed allocation viability.',
  },
  protein_score: {
    min: 0.7,
    max: 1.2,
    label: 'Protein Score',
    unit: '',
    tooltip: 'Quality score for protein content in feed products. Higher scores command premium prices in animal feed markets.',
  },
  supply_factor: {
    min: 0.8,
    max: 1.3,
    label: 'Supply Factor',
    unit: '',
    tooltip: 'Market supply condition factor. Values >1.0 indicate oversupply (lower prices), <1.0 indicate scarcity (higher prices).',
  },
  compost_base: {
    min: 20,
    max: 50,
    label: 'Compost Base Price',
    unit: '$/ton',
    tooltip: 'Base market price per ton of compost product. Reflects the agricultural fertilizer market conditions.',
  },
  nutrient_score: {
    min: 0.7,
    max: 1.3,
    label: 'Nutrient Score',
    unit: '',
    tooltip: 'Quality score for nutrient content in compost. Higher scores indicate more valuable organic fertilizer.',
  },
};

export const defaultValues: PredictionInput = {
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

export interface Preset {
  name: string;
  description: string;
  values: PredictionInput;
}

export const presets: Record<string, Preset> = {
  'high-production': {
    name: 'High Production',
    description: 'Optimized for maximum output and throughput',
    values: {
      ffb: 145,
      cpo: 32,
      moisture: 38,
      cv: 18,
      eff: 0.92,
      oil_price: 100,
      demand_bio: 0.75,
      carbon_tax: 10,
      demand_feed: 0.65,
      protein_score: 1.0,
      supply_factor: 1.0,
      compost_base: 35,
      nutrient_score: 1.1,
    },
  },
  'eco-friendly': {
    name: 'Eco-Friendly',
    description: 'Optimized for sustainability and carbon reduction',
    values: {
      ffb: 110,
      cpo: 24,
      moisture: 40,
      cv: 17.5,
      eff: 0.88,
      oil_price: 90,
      demand_bio: 0.85,
      carbon_tax: 15,
      demand_feed: 0.50,
      protein_score: 0.85,
      supply_factor: 1.05,
      compost_base: 40,
      nutrient_score: 1.2,
    },
  },
  'revenue-max': {
    name: 'Revenue Maximization',
    description: 'Optimized for maximum profit and market conditions',
    values: {
      ffb: 135,
      cpo: 30,
      moisture: 39,
      cv: 18.5,
      eff: 0.90,
      oil_price: 120,
      demand_bio: 0.9,
      carbon_tax: 11,
      demand_feed: 0.70,
      protein_score: 1.15,
      supply_factor: 0.9,
      compost_base: 45,
      nutrient_score: 1.25,
    },
  },
};

/**
 * Validate a single input value against its rules
 */
export function validateField(
  field: keyof PredictionInput,
  value: number
): string | null {
  const rule = validationRules[field];
  if (!rule) return null;

  if (value < rule.min || value > rule.max) {
    return `Must be between ${rule.min} and ${rule.max}${rule.unit ? ' ' + rule.unit : ''}`;
  }

  return null;
}

/**
 * Validate all fields in the form
 */
export function validateForm(
  data: PredictionInput
): Record<string, string> {
  const errors: Record<string, string> = {};

  Object.keys(validationRules).forEach((key) => {
    const field = key as keyof PredictionInput;
    const error = validateField(field, data[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}
