export interface SKUData {
  id: string;
  name: string;
  currentInventory: number;
  dailySalesRate: number;
  salesVariability: number; // Standard deviation as percentage
  leadTimeDays: number;
  leadTimeVariability: number; // Standard deviation in days
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  holdingCostPercent: number;
  compareWith?: string[]; // IDs of other SKUs to compare against
}

export interface Product {
  id: string;
  name: string;
  skus: SKUData[];
}

export interface RiskAnalysis {
  skuId: string;
  overstockRisk: number; // 0-100 probability
  understockRisk: number; // 0-100 probability
  deadInventoryRisk: number; // 0-100 probability
  daysOfSupply: number;
  projectedStockout: number | null; // days until stockout or null if no risk
  safetyStock: number;
  optimalReorderPoint: number;
  simulationResult: SimulationResult;
}

export interface InventoryParams {
  id?: string;               // Unique ID for Multi-SKU support
  name?: string;             // Product name
  currentStock: number;
  avgDailySales: number;
  leadTime: number;
  reorderQuantity: number;
  volatility: number;        // Dynamic Volatility (0.1 to 1.0)
  unitCost: number;          // For Cost-Benefit Analysis
  sellingPrice: number;      // For Cost-Benefit Analysis
}

export interface FinancialImpact {
  totalOverstockCost: number;
  totalStockoutLoss: number;
  netRiskValue: number;
}

export interface SimulationResult {
  trajectories: number[][];
  stockoutCount: number;
  overstockCount: number;
  medianTrajectory: number[];
  percentile25: number[];
  percentile75: number[];
  stockoutProbability: number;
  overstockProbability: number;
  financialImpact: FinancialImpact; // New financial metrics
}

export interface DashboardMetrics {
  totalSKUs: number;
  atRiskSKUs: number;
  healthySKUs: number;
  averageOverstockRisk: number;
  averageUnderstockRisk: number;
  averageDeadInventoryRisk: number;
  totalInventoryValue: number;
  projectedLosses: number;
}

export interface WhatIfScenario {
  inventoryMultiplier: number;
  demandMultiplier: number;
  leadTimeMultiplier: number;
  variabilityMultiplier: number;
}
