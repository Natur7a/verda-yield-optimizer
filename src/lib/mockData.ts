// Mock data for VERDA predictive AI dashboard

export interface YieldForecast {
  date: string;
  efb: number; // Empty Fruit Bunches (tons)
  pome: number; // Palm Oil Mill Effluent (cubic meters)
  fiber: number; // Fiber (tons)
  shell: number; // Shell (tons)
}

export interface PriceForecast {
  date: string;
  biofuel: number;
  animalFeed: number;
  compost: number;
  carbonCredit: number;
}

export interface AllocationData {
  category: string;
  value: number;
  revenue: number;
  emissions: number;
  color: string;
}

export interface OptimizationScenario {
  name: string;
  revenue: number;
  emissions: number;
  allocation: AllocationData[];
}

export interface MillData {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentYield: number;
  efficiency: number;
}

// Generate yield forecast data (next 30 days)
export const generateYieldForecast = (): YieldForecast[] => {
  const data: YieldForecast[] = [];
  const baseDate = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    
    // Add some realistic variance with trends
    const seasonalFactor = 1 + 0.2 * Math.sin((i / 30) * Math.PI);
    const randomFactor = 0.9 + Math.random() * 0.2;
    
    data.push({
      date: date.toISOString().split('T')[0],
      efb: Math.round(180 * seasonalFactor * randomFactor),
      pome: Math.round(450 * seasonalFactor * randomFactor),
      fiber: Math.round(120 * seasonalFactor * randomFactor),
      shell: Math.round(60 * seasonalFactor * randomFactor),
    });
  }
  
  return data;
};

// Generate price forecast data (next 30 days)
export const generatePriceForecast = (): PriceForecast[] => {
  const data: PriceForecast[] = [];
  const baseDate = new Date();
  
  let biofuelPrice = 850;
  let feedPrice = 320;
  let compostPrice = 150;
  let carbonPrice = 45;
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    
    // Random walk with slight upward trend
    biofuelPrice += (Math.random() - 0.48) * 20;
    feedPrice += (Math.random() - 0.48) * 8;
    compostPrice += (Math.random() - 0.48) * 5;
    carbonPrice += (Math.random() - 0.45) * 2;
    
    data.push({
      date: date.toISOString().split('T')[0],
      biofuel: Math.round(Math.max(700, Math.min(1000, biofuelPrice))),
      animalFeed: Math.round(Math.max(250, Math.min(400, feedPrice))),
      compost: Math.round(Math.max(100, Math.min(200, compostPrice))),
      carbonCredit: Math.round(Math.max(30, Math.min(70, carbonPrice)) * 10) / 10,
    });
  }
  
  return data;
};

// Current optimal allocation
export const getCurrentAllocation = (): AllocationData[] => [
  { 
    category: 'Biofuel', 
    value: 35, 
    revenue: 42500, 
    emissions: -850,
    color: 'hsl(var(--chart-1))'
  },
  { 
    category: 'Animal Feed', 
    value: 28, 
    revenue: 18200, 
    emissions: -120,
    color: 'hsl(var(--chart-2))'
  },
  { 
    category: 'Compost', 
    value: 22, 
    revenue: 8800, 
    emissions: -450,
    color: 'hsl(var(--chart-3))'
  },
  { 
    category: 'Carbon Credits', 
    value: 15, 
    revenue: 12750, 
    emissions: -680,
    color: 'hsl(var(--chart-4))'
  },
];

// Optimization scenarios for comparison
export const getOptimizationScenarios = (): OptimizationScenario[] => [
  {
    name: 'Max Revenue',
    revenue: 95000,
    emissions: -1200,
    allocation: [
      { category: 'Biofuel', value: 55, revenue: 55000, emissions: -600, color: 'hsl(var(--chart-1))' },
      { category: 'Animal Feed', value: 25, revenue: 25000, emissions: -150, color: 'hsl(var(--chart-2))' },
      { category: 'Compost', value: 12, revenue: 8000, emissions: -250, color: 'hsl(var(--chart-3))' },
      { category: 'Carbon Credits', value: 8, revenue: 7000, emissions: -200, color: 'hsl(var(--chart-4))' },
    ],
  },
  {
    name: 'Min Emissions',
    revenue: 72000,
    emissions: -2800,
    allocation: [
      { category: 'Biofuel', value: 20, revenue: 20000, emissions: -1200, color: 'hsl(var(--chart-1))' },
      { category: 'Animal Feed', value: 15, revenue: 12000, emissions: -200, color: 'hsl(var(--chart-2))' },
      { category: 'Compost', value: 35, revenue: 15000, emissions: -800, color: 'hsl(var(--chart-3))' },
      { category: 'Carbon Credits', value: 30, revenue: 25000, emissions: -600, color: 'hsl(var(--chart-4))' },
    ],
  },
  {
    name: 'Balanced',
    revenue: 82250,
    emissions: -2100,
    allocation: [
      { category: 'Biofuel', value: 35, revenue: 42500, emissions: -850, color: 'hsl(var(--chart-1))' },
      { category: 'Animal Feed', value: 28, revenue: 18200, emissions: -120, color: 'hsl(var(--chart-2))' },
      { category: 'Compost', value: 22, revenue: 8800, emissions: -450, color: 'hsl(var(--chart-3))' },
      { category: 'Carbon Credits', value: 15, revenue: 12750, emissions: -680, color: 'hsl(var(--chart-4))' },
    ],
  },
];

// Revenue vs Emissions trade-off data
export const getTradeoffData = () => [
  { revenue: 65000, emissions: -3200, label: 'Ultra Green' },
  { revenue: 72000, emissions: -2800, label: 'Min Emissions' },
  { revenue: 78000, emissions: -2400, label: 'Green Focus' },
  { revenue: 82250, emissions: -2100, label: 'Balanced' },
  { revenue: 87000, emissions: -1700, label: 'Revenue Lean' },
  { revenue: 92000, emissions: -1400, label: 'High Revenue' },
  { revenue: 95000, emissions: -1200, label: 'Max Revenue' },
];

// Sample mills data
export const getMills = (): MillData[] => [
  { id: '1', name: 'Mill Alpha', location: 'Sabah', capacity: 60, currentYield: 52, efficiency: 87 },
  { id: '2', name: 'Mill Beta', location: 'Sarawak', capacity: 45, currentYield: 41, efficiency: 91 },
  { id: '3', name: 'Mill Gamma', location: 'Johor', capacity: 80, currentYield: 68, efficiency: 85 },
  { id: '4', name: 'Mill Delta', location: 'Perak', capacity: 55, currentYield: 48, efficiency: 88 },
];

// KPI summary data
export const getKPISummary = () => ({
  totalYield: 820,
  yieldChange: 12.5,
  totalRevenue: 82250,
  revenueChange: 8.3,
  emissionsReduced: 2100,
  emissionsChange: 15.2,
  efficiency: 88,
  efficiencyChange: 2.1,
});

// Confidence intervals for predictions
export const getConfidenceData = () => ({
  yieldConfidence: 92,
  priceConfidence: 78,
  allocationConfidence: 85,
});
