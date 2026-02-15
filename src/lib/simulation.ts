import { InventoryParams, SimulationResult, FinancialImpact, SKUData, RiskAnalysis, WhatIfScenario, DashboardMetrics } from '../types/inventory';
import { calculateFinancialImpact } from './riskCalculator';

export function runEnhancedMonteCarlo(params: InventoryParams): SimulationResult {
  const NUM_DAYS = 365; // Extended to 1 year for better visibility
  const NUM_SIMS = 100;

  let totalStockouts = 0;
  let totalOverstocks = 0;
  const trajectories: number[][] = [];

  for (let s = 0; s < NUM_SIMS; s++) {
    let currentInv = params.currentStock;
    const trajectory: number[] = [];
    const pendingOrders: { arrivalDay: number; quantity: number }[] = [];

    for (let d = 0; d < NUM_DAYS; d++) {
      // 1. Stochastic Sales (Dynamic Volatility)
      const stdDev = params.avgDailySales * params.volatility;
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const randomDemand = params.avgDailySales + (z * stdDev);

      const dailySales = Math.max(0, randomDemand);

      currentInv -= dailySales;

      // 2. Check for Deliveries
      // Check indices in reverse order to safely splice
      for (let i = pendingOrders.length - 1; i >= 0; i--) {
        if (pendingOrders[i].arrivalDay === d) {
          currentInv += pendingOrders[i].quantity;
          pendingOrders.splice(i, 1);
        }
      }

      // 3. Reorder Logic with Stochastic Lead Time
      const reorderPoint = params.avgDailySales * params.leadTime;
      // Simple policy: reorder if below point and no pending orders (simplified for demo)
      // A more complex policy might consider current stock + pending orders
      if (currentInv <= reorderPoint && pendingOrders.length === 0) {
        // Random variance: leadTime +/- 2 days (but no less than 1 day total)
        const variance = Math.floor(Math.random() * 5) - 2;
        const actualLeadTime = Math.max(1, params.leadTime + variance);

        pendingOrders.push({
          arrivalDay: d + actualLeadTime,
          quantity: params.reorderQuantity
        });
      }

      const endOfDayStock = Math.max(0, currentInv);
      trajectory.push(endOfDayStock);

      // Simple count for probabilities (per day occurrence)
      if (endOfDayStock <= 0) totalStockouts++;
      if (endOfDayStock > params.reorderQuantity * 2) totalOverstocks++;
    }
    trajectories.push(trajectory);
  }

  // Calculate Aggregates
  const medianTrajectory = calculateMedian(trajectories);
  const financialImpact = calculateFinancialImpact({
    trajectories,
    stockoutCount: totalStockouts,
    overstockCount: totalOverstocks,
    medianTrajectory,
    percentile25: calculatePercentile(trajectories, 25),
    percentile75: calculatePercentile(trajectories, 75),
    stockoutProbability: (totalStockouts / (NUM_SIMS * NUM_DAYS)) * 100,
    overstockProbability: (totalOverstocks / (NUM_SIMS * NUM_DAYS)) * 100,
    financialImpact: { totalOverstockCost: 0, totalStockoutLoss: 0, netRiskValue: 0 } // Placeholder for type safety in call
  } as SimulationResult, params);

  return {
    trajectories,
    stockoutCount: totalStockouts, // Total days of stockout across all sims
    overstockCount: totalOverstocks, // Total days of overstock across all sims
    medianTrajectory,
    percentile25: calculatePercentile(trajectories, 25),
    percentile75: calculatePercentile(trajectories, 75),
    stockoutProbability: (totalStockouts / (NUM_SIMS * NUM_DAYS)) * 100,
    overstockProbability: (totalOverstocks / (NUM_SIMS * NUM_DAYS)) * 100,
    financialImpact
  };
}

function calculateMedian(data: number[][]): number[] {
  const length = data[0].length;
  const medianLine: number[] = [];
  for (let i = 0; i < length; i++) {
    const valuesAtDay = data.map(traj => traj[i]).sort((a, b) => a - b);
    const mid = Math.floor(valuesAtDay.length / 2);
    medianLine.push(valuesAtDay[mid]);
  }
  return medianLine;
}

function calculatePercentile(data: number[][], p: number): number[] {
  const length = data[0].length;
  const percentileLine: number[] = [];
  const index = Math.floor((p / 100) * data.length);
  for (let i = 0; i < length; i++) {
    const valuesAtDay = data.map(traj => traj[i]).sort((a, b) => a - b);
    percentileLine.push(valuesAtDay[index] || valuesAtDay[valuesAtDay.length - 1]);
  }
  return percentileLine;
}

// Adaptor for existing calls
export function analyzeRisk(sku: SKUData, scenario?: WhatIfScenario): RiskAnalysis {
  // 1. Adapter: SKUData -> InventoryParams
  const inventoryParams: InventoryParams = {
    id: sku.id,
    name: sku.name,
    currentStock: sku.currentInventory * (scenario?.inventoryMultiplier ?? 1),
    avgDailySales: sku.dailySalesRate * (scenario?.demandMultiplier ?? 1),
    leadTime: sku.leadTimeDays * (scenario?.leadTimeMultiplier ?? 1),
    reorderQuantity: sku.reorderQuantity,
    volatility: (sku.salesVariability / 100) * (scenario?.variabilityMultiplier ?? 1),
    unitCost: sku.unitCost,
    sellingPrice: sku.unitCost * 1.5 // Assumption since SKUData lacks selling price
  };

  const simulationResult = runEnhancedMonteCarlo(inventoryParams);

  // Derived metrics for RiskAnalysis
  // Days of supply
  const daysOfSupply = inventoryParams.avgDailySales > 0
    ? Math.round(inventoryParams.currentStock / inventoryParams.avgDailySales)
    : 999;

  // Safety Stock (Standard formula)
  const zScore = 1.65; // 95%
  const demandStdDev = inventoryParams.avgDailySales * inventoryParams.volatility;
  const safetyStock = Math.round(zScore * demandStdDev * Math.sqrt(inventoryParams.leadTime));

  const optimalReorderPoint = Math.round(
    (inventoryParams.avgDailySales * inventoryParams.leadTime) + safetyStock
  );

  return {
    skuId: sku.id,
    overstockRisk: simulationResult.overstockProbability,
    understockRisk: simulationResult.stockoutProbability,
    deadInventoryRisk: daysOfSupply > 120 ? 80 : (daysOfSupply > 60 ? 40 : 10), // Simplified
    daysOfSupply,
    projectedStockout: null, // Hard to define single day in stochastic paths
    safetyStock,
    optimalReorderPoint,
    simulationResult
  };
}

export function calculateDashboardMetrics(skus: SKUData[], analyses: RiskAnalysis[]): DashboardMetrics {
  const totalSKUs = skus.length;
  const atRiskSKUs = analyses.filter(a => a.understockRisk > 20 || a.overstockRisk > 50).length;
  const healthySKUs = totalSKUs - atRiskSKUs;

  const avgOverstock = analyses.reduce((acc, curr) => acc + curr.overstockRisk, 0) / totalSKUs;
  const avgUnderstock = analyses.reduce((acc, curr) => acc + curr.understockRisk, 0) / totalSKUs;

  const totalInventoryValue = skus.reduce((sum, s) => sum + (s.currentInventory * s.unitCost), 0);

  const totalProjectedLosses = analyses.reduce((sum, a) => sum + a.simulationResult.financialImpact.netRiskValue, 0);

  return {
    totalSKUs,
    atRiskSKUs,
    healthySKUs,
    averageOverstockRisk: Math.round(avgOverstock),
    averageUnderstockRisk: Math.round(avgUnderstock),
    averageDeadInventoryRisk: 0, // Simplified
    totalInventoryValue,
    projectedLosses: Math.round(totalProjectedLosses)
  };
}

export function getRiskLevel(riskValue: number): 'low' | 'medium' | 'high' {
  if (riskValue <= 20) return 'low';
  if (riskValue <= 50) return 'medium';
  return 'high';
}

export function getRiskExplanation(analysis: RiskAnalysis, sku: SKUData): string {
  const explanations: string[] = [];

  // High Understock Risk
  if (analysis.understockRisk > 20) {
    explanations.push(
      `High stockout risk! With a daily sales rate of ${sku.dailySalesRate} units and ${sku.leadTimeVariability} days lead time variability, you are vulnerable to shortages. Recommended Action: Increase safety stock to at least ${analysis.safetyStock} units.`
    );
  }

  // High Overstock Risk
  if (analysis.overstockRisk > 50) {
    explanations.push(
      `Excess inventory detected. You currently hold ${analysis.daysOfSupply} days of supply, which ties up capital. Recommended Action: Reduce reorder quantity or delay next order until stock drops near ${analysis.optimalReorderPoint} units.`
    );
  }

  // Dead Stock Warning
  if (analysis.daysOfSupply > 120 && sku.dailySalesRate < 1) {
    explanations.push(
      `Potential dead stock. Sales are extremely low (${sku.dailySalesRate}/day) with over 4 months of supply. Recommended Action: Run a clearance promotion to free up storage space.`
    );
  }

  // Healthy State
  if (explanations.length === 0) {
    explanations.push(
      `Inventory levels are healthy. Current stock of ${sku.currentInventory.toLocaleString()} units is sufficient to cover demand during the ${sku.leadTimeDays}-day lead time. Maintain current reorder parameters.`
    );
  }

  return explanations.join(" ");
}
